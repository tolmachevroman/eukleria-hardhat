import '@nomicfoundation/hardhat-toolbox';
import { task } from 'hardhat/config';
import { displayTicketPriceUpdated, loadingAnimation } from '../scripts/internal/displayUtils';
import { getContractsAddresses } from './internal/contracts-addresses';

task('lottery:update-ticket-price', 'Update the ticket price for the given ERC20 token')
  .addParam('token', 'The ERC20 token name')
  .addParam('price', 'The new ticket price')
  .setAction(async (taskArgs, hre) => {
    const { token, price } = taskArgs;

    const stopLoading = loadingAnimation(`Updating the ticket price`);

    const { usdcContractAddress, usdtContractAddress, daiContractAddress } = getContractsAddresses(hre.network.name);

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
      const { lotteryContractAddress } = getContractsAddresses(hre.network.name);
      const lottery = await hre.ethers.getContractAt('Lottery', lotteryContractAddress);
      const [owner] = await hre.ethers.getSigners();
      await lottery.connect(owner).setTicketPrice(erc20TokenAddress, hre.ethers.parseUnits(price, 6));
      stopLoading();

      displayTicketPriceUpdated(hre.network.name, price);
    } catch (error) {
      stopLoading();

      console.error(error);
    }
  });
