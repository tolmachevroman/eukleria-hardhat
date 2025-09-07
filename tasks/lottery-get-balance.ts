import '@nomicfoundation/hardhat-toolbox';
import { task } from 'hardhat/config';
import { displayLotteryBalance, loadingAnimation } from '../scripts/internal/displayUtils';
import { getContractsAddresses } from './internal/contracts-addresses';

task('lottery:get-balance', "Prints lottery's balance")
  .addParam('token', 'The ERC20 token name')
  .setAction(async (taskArgs, hre) => {
    const { token } = taskArgs;

    const stopLoading = loadingAnimation(`Fetching the lottery ${token} balance`);

    const { usdcContractAddress, usdtContractAddress, daiContractAddress, lotteryContractAddress } = getContractsAddresses(hre.network.name);

    let mockERC20;
    if (token === 'USDC') {
      mockERC20 = await hre.ethers.getContractAt('MockUSDC', usdcContractAddress);
    } else if (token === 'USDT') {
      mockERC20 = await hre.ethers.getContractAt('MockUSDT', usdtContractAddress);
    } else if (token === 'DAI') {
      mockERC20 = await hre.ethers.getContractAt('MockDAI', daiContractAddress);
    } else {
      throw new Error('Unknown token');
    }

    try {
      const lottery = await hre.ethers.getContractAt('Lottery', lotteryContractAddress);
      const lotteryBalance = await mockERC20.balanceOf(await lottery.getAddress());
      const adjustedBalance = lotteryBalance / BigInt(10 ** 6);
      stopLoading();

      displayLotteryBalance(hre.network.name, taskArgs.token, adjustedBalance.toString());
    } catch (error) {
      stopLoading();

      console.error(error);
    }
  });
