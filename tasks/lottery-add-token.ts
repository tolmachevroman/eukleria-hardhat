import '@nomicfoundation/hardhat-toolbox';
import { task } from 'hardhat/config';
import { displayERC20TokenAdded, loadingAnimation } from '../scripts/internal/displayUtils';
import { getContractsAddresses } from './internal/contracts-addresses';

task('lottery:add-token', 'Add new supported ERC20 token')
  .addParam('address', 'The token address')
  .setAction(async (taskArgs, hre) => {
    const { address } = taskArgs;

    const stopLoading = loadingAnimation(`Adding new ERC20 token`);

    try {
      const { lotteryContractAddress } = getContractsAddresses(hre.network.name);
      const lottery = await hre.ethers.getContractAt('Lottery', lotteryContractAddress);
      const [owner] = await hre.ethers.getSigners();
      await lottery.connect(owner).addSupportedToken(hre.ethers.getAddress(address));
      stopLoading();

      displayERC20TokenAdded(hre.network.name, address);
    } catch (error) {
      stopLoading();

      console.error(error);
    }
  });
