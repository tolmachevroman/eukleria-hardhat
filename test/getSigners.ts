import { ethers, network } from 'hardhat';
import { vars } from 'hardhat/config';

export async function getSigners() {
  let owner, otherAccount, otherAccounts;

  if (network.name === 'localhost') {
    [owner, otherAccount, ...otherAccounts] = await ethers.getSigners();
  } else {
    owner = new ethers.Wallet(vars.get('METAMASK_PRIVATE_KEY'), ethers.provider);
    otherAccount = new ethers.Wallet(vars.get('TEST_ACCOUNT_1_PRIVATE_KEY'), ethers.provider);
    otherAccounts = [
      new ethers.Wallet(vars.get('TEST_ACCOUNT_2_PRIVATE_KEY'), ethers.provider),
      new ethers.Wallet(vars.get('TEST_ACCOUNT_3_PRIVATE_KEY'), ethers.provider),
      new ethers.Wallet(vars.get('TEST_ACCOUNT_4_PRIVATE_KEY'), ethers.provider),
      new ethers.Wallet(vars.get('TEST_ACCOUNT_5_PRIVATE_KEY'), ethers.provider),
      new ethers.Wallet(vars.get('TEST_ACCOUNT_6_PRIVATE_KEY'), ethers.provider),
      new ethers.Wallet(vars.get('TEST_ACCOUNT_7_PRIVATE_KEY'), ethers.provider),
      new ethers.Wallet(vars.get('TEST_ACCOUNT_8_PRIVATE_KEY'), ethers.provider),
      new ethers.Wallet(vars.get('TEST_ACCOUNT_9_PRIVATE_KEY'), ethers.provider),
      new ethers.Wallet(vars.get('TEST_ACCOUNT_10_PRIVATE_KEY'), ethers.provider),
    ];
  }

  return { owner, otherAccount, otherAccounts };
}
