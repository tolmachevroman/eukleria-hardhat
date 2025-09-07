import '@nomicfoundation/hardhat-toolbox';
import { task } from 'hardhat/config';
import { displayParticipants, loadingAnimation } from '../scripts/internal/displayUtils';
import { getContractsAddresses } from './internal/contracts-addresses';

task('lottery:get-participants', "Prints lottery's participants for the given ERC20 token")
  .addParam('token', 'The ERC20 token name')
  .setAction(async (taskArgs, hre) => {
    const { token } = taskArgs;

    const stopLoading = loadingAnimation(`Fetching the ${token} participants`);

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
      const participants = await lottery.connect(owner).getParticipants(erc20TokenAddress);
      stopLoading();

      displayParticipants(hre.network.name, participants);
    } catch (error) {
      stopLoading();

      console.error(error);
    }
  });
