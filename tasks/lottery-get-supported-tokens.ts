import '@nomicfoundation/hardhat-toolbox';
import { task } from 'hardhat/config';
import { displayERC20TokenSupported, loadingAnimation } from '../scripts/internal/displayUtils';
import { getContractsAddresses } from './internal/contracts-addresses';

task('lottery:get-supported-tokens', 'Prints ERC20 tokens supported').setAction(async (taskArgs, hre) => {
  const network = hre.network.name;

  const stopLoading = loadingAnimation(`Fetching the supported tokens for ${network}`);

  const { usdcContractAddress, usdtContractAddress, daiContractAddress, lotteryContractAddress } = getContractsAddresses(hre.network.name);

  try {
    const lottery = await hre.ethers.getContractAt('Lottery', lotteryContractAddress);

    const isUSDCSupported = await lottery.supportedTokens(hre.ethers.getAddress(usdcContractAddress));
    const isUSDTSupported = await lottery.supportedTokens(hre.ethers.getAddress(usdtContractAddress));
    const isDAISupported = await lottery.supportedTokens(hre.ethers.getAddress(daiContractAddress));
    stopLoading();

    displayERC20TokenSupported(network, 'USDC', isUSDCSupported);
    displayERC20TokenSupported(network, 'USDT', isUSDTSupported);
    displayERC20TokenSupported(network, 'DAI', isDAISupported);
  } catch (error) {
    stopLoading();

    console.error(error);
  }
});
