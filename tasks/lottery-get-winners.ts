import '@nomicfoundation/hardhat-toolbox';
import { task } from 'hardhat/config';
import { displayWinners, loadingAnimation } from '../scripts/internal/displayUtils';
import { getContractsAddresses } from './internal/contracts-addresses';

task('lottery:get-winners', "Prints lottery's participants for the given ERC20 token")
  .addParam('token', 'The ERC20 token name')
  .setAction(async (taskArgs, hre) => {
    const { token } = taskArgs;

    const stopLoading = loadingAnimation(`Fetching the ${token} winners`);

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
      const winners = await lottery.connect(owner).getWinners(erc20TokenAddress);
      stopLoading();

      displayWinners(hre.network.name, winners);
    } catch (error) {
      stopLoading();

      console.error(error);
    }
  });
