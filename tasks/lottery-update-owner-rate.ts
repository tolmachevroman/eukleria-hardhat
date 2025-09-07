import '@nomicfoundation/hardhat-toolbox';
import { task } from 'hardhat/config';
import { displayOwnerRateUpdated, loadingAnimation } from '../scripts/internal/displayUtils';
import { getContractsAddresses } from './internal/contracts-addresses';

task('lottery:update-owner-rate', 'Update the owner rate')
  .addParam('rate', 'The new owner rate')
  .setAction(async (taskArgs, hre) => {
    const { rate } = taskArgs;

    const stopLoading = loadingAnimation(`Updating the owner rate`);

    try {
      const { lotteryContractAddress } = getContractsAddresses(hre.network.name);
      const lottery = await hre.ethers.getContractAt('Lottery', lotteryContractAddress);
      const [owner] = await hre.ethers.getSigners();
      await lottery.connect(owner).setOwnerRate(rate);
      stopLoading();

      displayOwnerRateUpdated(hre.network.name, rate);
    } catch (error) {
      stopLoading();

      console.error(error);
    }
  });
