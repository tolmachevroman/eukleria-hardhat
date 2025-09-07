# Eukleria Hardhat Lottery

## Overview

Eukleria Hardhat Lottery is a smart contract project for creating and managing lottery pools on Ethereum-compatible blockchains. The system allows users to participate in lotteries using supported ERC20 tokens (such as USDT, USDC, DAI). Each lottery pool is unique for every ERC20 token and blockchain combination.

## Features

- **Multiple Tickets per Wallet:** Users can buy multiple tickets in a single lottery pool.
- **Owner Commission:** When the lottery is sorted, a configurable percentage of the pool is sent to the contract owner, and the rest is split among randomly selected winners.
- **Supported Tokens:** The contract owner can add or remove supported ERC20 tokens, creating or deleting corresponding lottery pools.
- **Configurable Parameters:** Owner can update ticket price, commission rate, and number of winners for each pool.
- **Pseudo-Random Winner Selection:** Winners are chosen pseudo-randomly from all tickets in the pool.
- **Console Tasks:** A set of Hardhat tasks are available for interacting with the contract and pools from the command line.

## Contract Management

- **Add/Remove Supported Tokens:** Owner can add new ERC20 tokens or remove existing ones, managing which tokens are accepted for ticket purchases.
- **Update Pool Settings:** Owner can change ticket price, commission rate, and number of winners for each pool.
- **View Participants & Winners:** Anyone can view the current participants and winners for any pool.

## Hardhat Tasks

The project includes custom Hardhat tasks for common operations:

- **Buy Tickets:** Purchase tickets for a specific pool.
- **Sort Lottery:** Trigger the lottery draw and distribute prizes.
- **Mint Tokens:** Mint mock tokens for testing.
- **Get Balances:** Check balances of tokens and contract pools.
- **Manage Pools:** Add or remove supported tokens, update pool settings.

See the [`tasks/`](tasks/) directory for details and usage examples.

## Scripts

Automation scripts for deployment and testing are located in the [`scripts/`](scripts/) directory.

- **Deployment:** Deploy contracts and set up pools.
- **Testing:** Run automated tests in [`test/`](test/) to verify contract logic.

## Development

- **Smart Contracts:** Located in [`contracts/`](contracts/), including [`Lottery`](contracts/Lottery.sol) and mock ERC20 tokens.
- **TypeChain:** Type-safe contract bindings are generated in [`typechain-types/`](typechain-types/).
- **Coverage:** Test coverage reports are available in [`coverage/`](coverage/).

## Getting Started

1. **Install dependencies:**
   ```sh
   npm install
   ```
2. **Compile contracts:**
   ```sh
   npx hardhat compile
   ```
3. **Run tests:**
   ```sh
   npx hardhat test <network-name> 
   ```
4. **Run tasks:**
   ```sh
   npx hardhat <task-name> --help
   ```

## Tasks Example Usage

- **Get participants per specific token, per specific chain:**
  ```sh
  npx hardhat lottery:get-test-balances --network polygonAmoy --token USDC
  ```
- **Sort lottery per specific token, per specific chain:**
  ```sh
  npx hardhat lottery:sort --network lineaSepolia --token USDC
  ```
- **Mint tokens:**
  ```sh
  npx hardhat lottery:mint --network baseSepolia --token USDC --amount 100
  ```

## License

MIT License. See [LICENSE](LICENSE) for details.

---

For more details, see the contract implementation
