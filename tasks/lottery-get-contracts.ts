import '@nomicfoundation/hardhat-toolbox';
import { task } from 'hardhat/config';
import { displayERC20TokenAddress, displayLotteryAddress, loadingAnimation } from '../scripts/internal/displayUtils';
import { getContractsAddresses } from './internal/contracts-addresses';

task('lottery:get-contracts', "Prints lottery's contracts addresses").setAction(async (taskArgs, hre) => {
  const stopLoading = loadingAnimation(`Fetching the lottery and ERC20 contracts`);

  const { usdcContractAddress, usdtContractAddress, daiContractAddress, lotteryContractAddress } = getContractsAddresses(hre.network.name);
  stopLoading();

  displayLotteryAddress(hre.network.name, lotteryContractAddress);
  displayERC20TokenAddress(hre.network.name, 'USDC', usdcContractAddress);
  displayERC20TokenAddress(hre.network.name, 'USDT', usdtContractAddress);
  displayERC20TokenAddress(hre.network.name, 'DAI', daiContractAddress);
});
