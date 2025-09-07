import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import { ethers } from 'hardhat';

const MockDAIModule = buildModule('MockDAIModule', (m) => {
  const initialSupply = ethers.parseUnits('1000000', 6); // 1M DAI with 6 decimals

  const mockDAI = m.contract('MockDAI', [initialSupply]);

  return { mockDAI };
});

export default MockDAIModule;
