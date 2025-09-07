import '@nomicfoundation/hardhat-toolbox';
import { HardhatUserConfig, task } from 'hardhat/config';
import { vars } from 'hardhat/config';

const INFURA_API_KEY = vars.get('INFURA_API_KEY');
const METAMASK_PRIVATE_KEY = vars.get('METAMASK_PRIVATE_KEY');

require('./tasks/lottery-get-balance');
require('./tasks/lottery-get-contracts');
require('./tasks/lottery-get-owner');
require('./tasks/lottery-get-test-balances');
require('./tasks/lottery-get-participants');
require('./tasks/lottery-get-supported-tokens');
require('./tasks/lottery-get-winners');
require('./tasks/lottery-mint');
require('./tasks/lottery-update-owner-rate');
require('./tasks/lottery-update-ticket-price');
require('./tasks/lottery-add-token');
require('./tasks/lottery-sort');

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.27',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  mocha: {
    timeout: 120_000,
  },
  defaultNetwork: 'localhost',
  networks: {
    localhost: {
      url: 'http://127.0.0.1:8545',
      chainId: 31337,
    },
    // Ethereum
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [METAMASK_PRIVATE_KEY],
      chainId: 11155111,
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [METAMASK_PRIVATE_KEY],
      chainId: 1,
    },
    // Polygon
    polygonAmoy: {
      url: `https://polygon-amoy.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [METAMASK_PRIVATE_KEY],
      chainId: 80002,
      gas: 'auto',
      blockGasLimit: 30_000_000,
    },
    polygon: {
      url: `https://polygon-mainnet.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [METAMASK_PRIVATE_KEY],
      chainId: 137,
    },
    // Linea
    lineaSepolia: {
      url: `https://linea-sepolia.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [METAMASK_PRIVATE_KEY],
      chainId: 59141,
    },
    linea: {
      url: `https://linea-mainnet.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [METAMASK_PRIVATE_KEY],
      chainId: 59144,
    },
    // Base
    baseSepolia: {
      url: `https://base-sepolia.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [METAMASK_PRIVATE_KEY],
      chainId: 84532,
    },
    base: {
      url: `https://base-mainnet.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [METAMASK_PRIVATE_KEY],
      chainId: 8453,
    },
    // Optimism
    optimismSepolia: {
      url: `https://optimism-sepolia.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [METAMASK_PRIVATE_KEY],
      chainId: 11155420,
      gas: 'auto',
      blockGasLimit: 30_000_000,
    },
    optimism: {
      url: `https://optimism-mainnet.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [METAMASK_PRIVATE_KEY],
      chainId: 10,
    },
    // Arbitrum
    arbitrumSepolia: {
      url: `https://arbitrum-sepolia.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [METAMASK_PRIVATE_KEY],
      chainId: 421614,
      gas: 'auto',
      blockGasLimit: 30_000_000,
    },
    arbitrumOne: {
      url: `https://arbitrum-mainnet.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [METAMASK_PRIVATE_KEY],
      chainId: 42161,
    },
    // Avalanche
    avalancheFuji: {
      url: `https://avalanche-fuji.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [METAMASK_PRIVATE_KEY],
      chainId: 43113,
      gas: 'auto',
      blockGasLimit: 30_000_000,
    },
    avalanche: {
      url: `https://avalanche-mainnet.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [METAMASK_PRIVATE_KEY],
      chainId: 43114,
    },
  },
};

export default config;
