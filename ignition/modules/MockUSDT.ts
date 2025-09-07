import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import { ethers } from 'hardhat';

const MockUSDTModule = buildModule('MockUSDTModule', (m) => {
  const initialSupply = ethers.parseUnits('1000000', 6); // 1M USDT with 6 decimals

  const mockUSDT = m.contract('MockUSDT', [initialSupply]);

  return { mockUSDT };
});

export default MockUSDTModule;
