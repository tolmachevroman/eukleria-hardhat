import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import { getContractsAddresses } from '../../tasks/internal/contracts-addresses';
import { network } from 'hardhat';

const LotteryModule = buildModule('LotteryModule', (m) => {
  const { usdcContractAddress } = getContractsAddresses(network.name);

  const erc20TokenAddresses = m.getParameter('_erc20TokenAddresses', [usdcContractAddress]);

  const lottery = m.contract('Lottery', [erc20TokenAddresses]);

  return { lottery };
});

export default LotteryModule;
