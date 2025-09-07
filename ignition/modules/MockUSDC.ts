import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import { ethers } from 'hardhat';

const MockUSDCModule = buildModule('MockUSDCModule', (m) => {
  const initialSupply = ethers.parseUnits('1000000', 6); // 1M USDC with 6 decimals

  const mockUSDC = m.contract('MockUSDC', [initialSupply]);

  return { mockUSDC };
});

export default MockUSDCModule;
