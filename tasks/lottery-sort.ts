import '@nomicfoundation/hardhat-toolbox';
import { task, vars } from 'hardhat/config';
import { displayLotterySorted, displayWinners, loadingAnimation } from '../scripts/internal/displayUtils';
import { getContractsAddresses } from './internal/contracts-addresses';
import axios from 'axios';

const AUTH_SECRET = vars.get('AUTH_SECRET');

task('lottery:sort', 'Sort the lottery for the given ERC20 token')
  .addParam('token', 'The ERC20 token name')
  .setAction(async (taskArgs, hre) => {
    const { token } = taskArgs;

    const stopLoading = loadingAnimation(`Sorting the lottery`);

    const { usdcContractAddress, usdtContractAddress, daiContractAddress, lotteryContractAddress } = getContractsAddresses(hre.network.name);

    let erc20TokenAddress;
    if (token === 'USDC') {
      erc20TokenAddress = usdcContractAddress;
    } else if (token === 'USDT') {
      erc20TokenAddress = usdtContractAddress;
    } else if (token === 'DAI') {
      erc20TokenAddress = daiContractAddress;
    } else {
      throw new Error('Unknown token');
    }

    try {
      const lottery = await hre.ethers.getContractAt('Lottery', lotteryContractAddress);
      const [owner] = await hre.ethers.getSigners();

      let increasedGasPrice;
      const { gasPrice } = await hre.ethers.provider.getFeeData();

      if (gasPrice != undefined) {
        increasedGasPrice = (gasPrice * BigInt(120)) / BigInt(100); // 120% of current gas price
      }

      const randomString = generateRandomString(60);
      const tx = await lottery.connect(owner).sort(erc20TokenAddress, randomString, { gasPrice: increasedGasPrice });
      const result = await tx.wait();
      stopLoading();

      displayLotterySorted(hre.network.name, result?.gasUsed.toString() || 'unknown');

      const winners = await lottery.getWinners(erc20TokenAddress);
      displayWinners(hre.network.name, winners);

      const networkId = hre.network.config.chainId;

      // Set the winners
      try {
        await axios({
          method: 'put',
          url: `https://www.eukleria.app/api/draws/${networkId}/upcoming`,
          data: {
            erc20Token: token,
            winners: winners.join(','),
          },
          headers: {
            Authorization: `Bearer ${AUTH_SECRET}`,
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.error('Error setting winners:', error);
      }

      // Create new draw!
      try {
        await axios({
          method: 'post',
          url: `https://www.eukleria.app/api/draws/${networkId}`,
          data: {
            erc20Token: token,
          },
          headers: {
            Authorization: `Bearer ${AUTH_SECRET}`,
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.error('Error creating new draw:', error);
      }
    } catch (error) {
      stopLoading();

      console.error(error);
      return;
    }
  });

/**
 * Generates a random string of the given length, using the characters
 * A-Z, a-z, and 0-9.
 * @param length The length of the string to generate.
 * @returns A random string of the given length.
 **/
function generateRandomString(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
