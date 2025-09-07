import '@nomicfoundation/hardhat-toolbox';
import { task } from 'hardhat/config';
import { displayOwner, loadingAnimation } from '../scripts/internal/displayUtils';
import { getContractsAddresses } from './internal/contracts-addresses';

task('lottery:get-owner', "Prints lottery's owner address and rate").setAction(async (taskArgs, hre) => {
  const stopLoading = loadingAnimation(`Fetching the owner`);

  try {
    const { lotteryContractAddress } = getContractsAddresses(hre.network.name);
    const lottery = await hre.ethers.getContractAt('Lottery', lotteryContractAddress);
    const owner = await lottery.owner();
    const ownerRate = await lottery.getOwnerRate();
    stopLoading();

    displayOwner(hre.network.name, owner, ownerRate.toString());
  } catch (error) {
    stopLoading();

    console.error(error);
  }
});
