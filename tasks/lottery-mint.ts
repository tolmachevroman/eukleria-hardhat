import '@nomicfoundation/hardhat-toolbox';
import { task } from 'hardhat/config';
import { displayMintedERC20TokensToTestAccounts, loadingAnimation } from '../scripts/internal/displayUtils';
import { getContractsAddresses } from './internal/contracts-addresses';

task('lottery:mint', 'Mints test tokens for the given ERC20 token')
  .addParam('token', 'The ERC20 token name')
  .addParam('amount', 'The amount of tokens to mint')
  .setAction(async (taskArgs, hre) => {
    const { token, amount } = taskArgs;

    const stopLoading = loadingAnimation(`Minting ${amount} ${token} to test accounts`);

    let increasedGasPrice;
    const { gasPrice } = await hre.ethers.provider.getFeeData();

    if (gasPrice != undefined) {
      increasedGasPrice = (gasPrice * BigInt(120)) / BigInt(100); // 120% of current gas price
    }

    const { usdcContractAddress, usdtContractAddress, daiContractAddress } = getContractsAddresses(hre.network.name);

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
      let testAccounts;
      if (hre.network.name === 'localhost') {
        const [otherAccount, ...otherAccounts] = await hre.ethers.getSigners();
        testAccounts = [otherAccount, ...otherAccounts].map((account) => account.address);
      } else {
        testAccounts = [
          '0x2d680e179d6e8d02C7Ee9F736537b0599d326acF',
          '0x6b5eBddE1618e82713eC0AeA353C55BC36c3Fd07',
          '0x27fE08f08D44c91A2cC027C27870FF31d16773dF',
          '0x77b1B91E8513b61B70Def43Ce782fB13E61F228D',
          '0x901440De41E57119d62418821479bAe862d3c28f',
          '0x517dC96E9D4F32C68C440549830BB44b20723412',
          '0x7496Ca4cC2fD73551b2163D4f8a8886F11A7caE6',
          '0xeE168f0fdB7569F819e3004F66a5453B04Fdb63f',
          '0xf5763C3aEAdf65DAd0E9E5dE19a27c65bB75021c',
          '0xc06553D32535fD55a78Ea8BD573174d0A2b95Fdb',
          '0x592356Bc842D70e529665eEc49B37B43f2D0A1FA',
        ];
      }
      for (const account of testAccounts) {
        const address = hre.ethers.getAddress(account);
        const tx = await mockERC20.mint(address, hre.ethers.parseUnits(amount, 6), { gasPrice: increasedGasPrice });
        await tx.wait();
      }
      stopLoading();

      displayMintedERC20TokensToTestAccounts(hre.network.name, token, amount);
    } catch (error) {
      stopLoading();

      console.error(error);
    }
  });
