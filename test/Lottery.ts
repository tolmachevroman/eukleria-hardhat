import { expect } from 'chai';
import { ethers, network } from 'hardhat';
import { getSigners } from './getSigners';
import { getContractsAddresses } from '../tasks/internal/contracts-addresses';

describe('Lottery', function () {
  async function getTestAccountsAndContracts() {
    const { usdcContractAddress, usdtContractAddress, daiContractAddress, lotteryContractAddress } = getContractsAddresses(network.name);

    const mockUSDC = await ethers.getContractAt('MockUSDC', usdcContractAddress);
    const mockUSDT = await ethers.getContractAt('MockUSDT', usdtContractAddress);
    const mockDAI = await ethers.getContractAt('MockDAI', daiContractAddress);
    const lottery = await ethers.getContractAt('Lottery', lotteryContractAddress);

    const ticketPrice = await lottery.getTicketPrice(usdcContractAddress);
    const { owner, otherAccount, otherAccounts } = await getSigners();

    let increasedGasPrice;
    const { gasPrice } = await ethers.provider.getFeeData();

    if (gasPrice != undefined) {
      increasedGasPrice = (gasPrice * BigInt(130)) / BigInt(100); // 130% of current gas price
    }

    const testERC20Token = ethers.getAddress('0x5FbDB2315678afecb367f032d93F642f64180aa3'); // Random address

    const normalizedUsdcContractAddress = ethers.getAddress(usdcContractAddress);
    const normalizedUsdtContractAddress = ethers.getAddress(usdtContractAddress);
    const normalizedDaiContractAddress = ethers.getAddress(daiContractAddress);

    return {
      lottery,
      lotteryContractAddress,
      mockUSDC,
      normalizedUsdcContractAddress,
      mockUSDT,
      normalizedUsdtContractAddress,
      mockDAI,
      normalizedDaiContractAddress,
      ticketPrice,
      owner,
      otherAccount,
      otherAccounts,
      increasedGasPrice,
      testERC20Token,
    };
  }

  describe('Deployment', function () {
    it('Should set the right owner', async function () {
      const { lottery, owner } = await getTestAccountsAndContracts();

      expect(await lottery.owner()).to.equal(await owner.getAddress());
    });
  });

  describe('Lottery', function () {
    describe('Validations', function () {
      it('Should revert if token is not supported', async function () {
        const { lottery, lotteryContractAddress, ticketPrice, mockUSDC, owner, otherAccount, testERC20Token } = await getTestAccountsAndContracts();

        // Make sure it's not supported from the previous state
        try {
          const tx = await lottery.connect(owner).removeSupportedToken(testERC20Token);
          tx.wait();
        } catch (error) {}

        // User must approve the contract to spend USDC
        const approved = await mockUSDC.connect(otherAccount).approve(lotteryContractAddress, ticketPrice);
        await approved.wait();

        const allowance = await mockUSDC.allowance(otherAccount.address, lotteryContractAddress);
        expect(allowance).to.be.equal(ticketPrice);

        await expect(lottery.connect(otherAccount).buyTicket(testERC20Token, ticketPrice, 1)).to.be.revertedWith('Token is not supported');
      });

      it('Should revert if participant sends no USDC', async function () {
        const { lottery, lotteryContractAddress, ticketPrice, mockUSDC, normalizedUsdcContractAddress, otherAccount } =
          await getTestAccountsAndContracts();

        // User must approve the contract to spend USDC
        const approved = await mockUSDC.connect(otherAccount).approve(lotteryContractAddress, ticketPrice);
        await approved.wait();

        const allowance = await mockUSDC.allowance(otherAccount.address, lotteryContractAddress);
        expect(allowance).to.be.equal(ticketPrice);

        await expect(lottery.connect(otherAccount).buyTicket(normalizedUsdcContractAddress, ticketPrice, 0)).to.be.revertedWith(
          'Must buy at least 1 ticket'
        );
      });

      it('Should revert if participant sends less than the ticket price', async function () {
        const { lottery, otherAccount, lotteryContractAddress, mockUSDC, normalizedUsdcContractAddress, ticketPrice } =
          await getTestAccountsAndContracts();

        const insufficientAmount = ticketPrice - BigInt(1);

        // User must approve the contract to spend USDC
        const approved = await mockUSDC.connect(otherAccount).approve(lotteryContractAddress, insufficientAmount);
        await approved.wait();

        const allowance = await mockUSDC.allowance(otherAccount.address, lotteryContractAddress);
        expect(allowance).to.be.equal(insufficientAmount);

        await expect(lottery.connect(otherAccount).buyTicket(normalizedUsdcContractAddress, insufficientAmount, 1)).to.be.revertedWith(
          'The amount must be a multiple of the ticket price'
        );
      });

      it('Should revert if wrong account tries to change the owner rate', async function () {
        const { lottery, otherAccount } = await getTestAccountsAndContracts();

        await expect(lottery.connect(otherAccount).setOwnerRate(5)).to.be.revertedWithCustomError(lottery, 'OwnableUnauthorizedAccount');
      });

      it('Should revert if the owner rate is wrong', async function () {
        const { lottery } = await getTestAccountsAndContracts();

        await expect(lottery.setOwnerRate(120)).to.be.revertedWith('Rate must be between 0 and 100');
      });

      it('Should revert if wrong account tries to change the ticket price', async function () {
        const { lottery, otherAccount, normalizedUsdcContractAddress } = await getTestAccountsAndContracts();

        await expect(lottery.connect(otherAccount).setTicketPrice(normalizedUsdcContractAddress, 5)).to.be.revertedWithCustomError(
          lottery,
          'OwnableUnauthorizedAccount'
        );
      });

      it('Should revert if the ticket price is wrong', async function () {
        const { lottery, normalizedUsdcContractAddress } = await getTestAccountsAndContracts();

        await expect(lottery.setTicketPrice(normalizedUsdcContractAddress, 0)).to.be.revertedWith('Price must be greater than 0');
      });

      it('Should revert if wrong account tries to sort the lottery', async function () {
        const { lottery, normalizedUsdcContractAddress, otherAccount } = await getTestAccountsAndContracts();

        await expect(lottery.connect(otherAccount).sort(normalizedUsdcContractAddress, 'random')).to.be.revertedWithCustomError(
          lottery,
          'OwnableUnauthorizedAccount'
        );
      });

      it('Should revert if less than 3 participants', async function () {
        const { lottery, normalizedUsdcContractAddress } = await getTestAccountsAndContracts();
        const participants = await lottery.getParticipants(normalizedUsdcContractAddress);
        const winnersCount = await lottery.getWinnersCount();

        if (participants.length < winnersCount) {
          await expect(lottery.sort(normalizedUsdcContractAddress, 'random')).to.be.revertedWith('Not enough participants to sort the lottery');
        }
      });

      it('Should revert if wrong account tries to change the winners count', async function () {
        const { lottery, otherAccount } = await getTestAccountsAndContracts();

        await expect(lottery.connect(otherAccount).setWinnersCount(5)).to.be.revertedWithCustomError(lottery, 'OwnableUnauthorizedAccount');
      });

      it('Should revert if winners count is wrong', async function () {
        const { lottery } = await getTestAccountsAndContracts();

        await expect(lottery.setWinnersCount(2)).to.be.revertedWith('Winners count must be greater than 3');
      });
    });

    describe('Adding and removing ERC20 tokens', function () {
      it('Should be able to add and remove a new ERC20 token', async function () {
        const { lottery, testERC20Token, owner } = await getTestAccountsAndContracts();

        const tokenAdded = await lottery.connect(owner).addSupportedToken(testERC20Token);
        expect(tokenAdded).to.emit(lottery, 'SupportedTokenAdded');
        await tokenAdded.wait();

        expect(await lottery.getTicketPrice(testERC20Token)).to.be.equal(BigInt(5_000_000));

        const testTokenRemoved = await lottery.connect(owner).removeSupportedToken(testERC20Token);
        expect(testTokenRemoved).to.emit(lottery, 'SupportedTokenRemoved');
        await testTokenRemoved.wait();

        await expect(lottery.getTicketPrice(testERC20Token)).to.be.revertedWith('Token is not supported');
      });
    });

    describe('Buying tickets and sorting the winners', function () {
      it('Should be able to buy multiple tickets', async function () {
        const { lottery, lotteryContractAddress, mockUSDC, normalizedUsdcContractAddress, ticketPrice, otherAccount } =
          await getTestAccountsAndContracts();

        const amountForThreeTickets = BigInt(3) * ticketPrice;
        const ticketsBefore = await lottery.getParticipants(normalizedUsdcContractAddress);

        // User must approve the contract to spend USDC
        const approved = await mockUSDC.connect(otherAccount).approve(lotteryContractAddress, amountForThreeTickets);
        await approved.wait();

        const allowance = await mockUSDC.allowance(otherAccount.address, lotteryContractAddress);
        expect(allowance).to.be.equal(amountForThreeTickets);

        const balanceBeforeBuying = await mockUSDC.balanceOf(otherAccount.address);

        // We buy 3 tickets
        try {
          const accountBalance = await mockUSDC.balanceOf(otherAccount.address);
          expect(accountBalance).to.be.greaterThan(amountForThreeTickets);

          const tx = await lottery.connect(otherAccount).buyTicket(normalizedUsdcContractAddress, amountForThreeTickets, 3);
          const receipt = await tx.wait();
          console.log(`Bought ticket for account ${otherAccount.address}, tx hash: ${receipt?.hash}`);
        } catch (error) {
          console.log(`Failed to buy ticket for account ${otherAccount.address}`);
          console.log(error);
        }

        const balanceAfterBuying = await mockUSDC.balanceOf(otherAccount.address);

        // We expect the balance to be reduced by the ticket price
        const difference = balanceBeforeBuying - balanceAfterBuying;
        expect(difference).to.be.equal(amountForThreeTickets);

        // We expect to have added 3 tickets
        const ticketsAfter = await lottery.getParticipants(normalizedUsdcContractAddress);
        const ticketsDifference = ticketsAfter.length - ticketsBefore.length;
        expect(ticketsDifference).to.be.equal(3);
      });

      it('Should sort the winners and send the events for USDC', async function () {
        const {
          lottery,
          lotteryContractAddress,
          mockUSDC,
          normalizedUsdcContractAddress,
          owner,
          ticketPrice,
          otherAccount,
          otherAccounts,
          increasedGasPrice,
        } = await getTestAccountsAndContracts();
        const participantsToBalances = new Map<string, bigint>();

        // We buy a ticket for each account
        await Promise.all(
          otherAccounts.map(async (account) => {
            // User must approve the contract to spend USDC
            const approved = await mockUSDC.connect(account).approve(lotteryContractAddress, ticketPrice);
            await approved.wait();

            const allowance = await mockUSDC.allowance(account.address, lotteryContractAddress);
            expect(allowance).to.be.equal(ticketPrice);

            try {
              const tx = await lottery.connect(account).buyTicket(normalizedUsdcContractAddress, ticketPrice, 1, { gasPrice: increasedGasPrice });
              expect(tx).to.emit(lottery, 'TicketPurchased');
              const receipt = await tx.wait();
              console.log(`Bought ticket for account ${account.address}, tx hash: ${receipt?.hash}`);
            } catch (error) {
              console.log(`Failed to buy ticket for account ${account.address}`);
              console.log(error);
            }

            // We expect the participants to contain the account
            let lotteryParticipants = await lottery.getParticipants(normalizedUsdcContractAddress);
            expect(lotteryParticipants).to.contain(account.address);

            const participantBalance = await mockUSDC.balanceOf(account.address);
            participantsToBalances.set(account.address, participantBalance);
          })
        );

        // We expect the owner to get paid
        const beforeOwnerBalance = await mockUSDC.balanceOf(owner.address);
        const ownerRate = await lottery.getOwnerRate();
        const lotteryBalance = await mockUSDC.balanceOf(lottery.getAddress());
        const ownerShare = (lotteryBalance * BigInt(ownerRate)) / BigInt(100);

        // We sort the winners
        // We expect the event to be emitted
        const sortTx = await lottery.sort(normalizedUsdcContractAddress, 'random', { gasPrice: increasedGasPrice });
        const sortReceipt = await sortTx.wait();
        expect(sortReceipt).to.not.be.null;

        // Check that events are present in the receipt
        expect(sortReceipt?.logs).to.not.be.undefined;

        // Filter logs for the 'Payout' event
        const payoutEventLog = sortReceipt?.logs.find((log) => {
          const parsedLog = lottery.interface.parseLog(log);
          return parsedLog?.name === 'Payout'; // Check if it's a Payout event
        });

        // Ensure the Payout event exists
        expect(payoutEventLog).to.not.be.undefined;

        // We expect the owner to get payed
        const afterOwnerBalance = await mockUSDC.balanceOf(owner.address);
        const ownerDifference = afterOwnerBalance - beforeOwnerBalance;
        expect(ownerDifference).to.be.equal(ownerShare);

        // We expect the 3 accounts to be the winners and receive the prize
        const winners = await lottery.getWinners(normalizedUsdcContractAddress);
        const winnersCount = await lottery.getWinnersCount();
        expect(winners).to.have.lengthOf(winnersCount);
        const allTestAccounts = [otherAccount, ...otherAccounts];
        for (const winner of winners) {
          expect(allTestAccounts.map((account) => account.address)).to.contain(winner);

          // We expect the winners to receive the prize
          const afterParticipantBalance = await mockUSDC.balanceOf(winner);
          const participantDifference = afterParticipantBalance - (participantsToBalances.get(winner) || BigInt(0));
          expect(participantDifference).to.be.greaterThan(0);
        }

        // We expect the participants to be empty
        const lotteryParticipants = await lottery.getParticipants(normalizedUsdcContractAddress);
        expect(lotteryParticipants).to.be.empty;
      });

      it('Should sort the winners and send the events for USDT', async function () {
        const {
          lottery,
          lotteryContractAddress,
          mockUSDT,
          normalizedUsdtContractAddress,
          owner,
          ticketPrice,
          otherAccount,
          otherAccounts,
          increasedGasPrice,
        } = await getTestAccountsAndContracts();
        const participantsToBalances = new Map<string, bigint>();

        console.log('Normalized USDT contract address:', normalizedUsdtContractAddress);

        // We buy a ticket for each account
        await Promise.all(
          otherAccounts.map(async (account) => {
            // User must approve the contract to spend USDT
            const approved = await mockUSDT.connect(account).approve(lotteryContractAddress, ticketPrice);
            await approved.wait();

            const allowance = await mockUSDT.allowance(account.address, lotteryContractAddress);
            expect(allowance).to.be.equal(ticketPrice);

            try {
              const tx = await lottery.connect(account).buyTicket(normalizedUsdtContractAddress, ticketPrice, 1, { gasPrice: increasedGasPrice });
              expect(tx).to.emit(lottery, 'TicketPurchased');
              const receipt = await tx.wait();
              console.log(`Bought ticket for account ${account.address}, tx hash: ${receipt?.hash}`);
            } catch (error) {
              console.log(`Failed to buy ticket for account ${account.address}`);
              console.log(error);
            }

            // We expect the participants to contain the account
            let lotteryParticipants = await lottery.getParticipants(normalizedUsdtContractAddress);
            expect(lotteryParticipants).to.contain(account.address);

            const participantBalance = await mockUSDT.balanceOf(account.address);
            participantsToBalances.set(account.address, participantBalance);
          })
        );

        // We expect the owner to get paid
        const beforeOwnerBalance = await mockUSDT.balanceOf(owner.address);
        const ownerRate = await lottery.getOwnerRate();
        const lotteryBalance = await mockUSDT.balanceOf(lottery.getAddress());
        const ownerShare = (lotteryBalance * BigInt(ownerRate)) / BigInt(100);

        // We sort the winners
        // We expect the event to be emitted
        const sortTx = await lottery.sort(normalizedUsdtContractAddress, 'random', { gasPrice: increasedGasPrice });
        const sortReceipt = await sortTx.wait();
        expect(sortReceipt).to.not.be.null;

        // Check that events are present in the receipt
        expect(sortReceipt?.logs).to.not.be.undefined;

        // Filter logs for the 'Payout' event
        const payoutEventLog = sortReceipt?.logs.find((log) => {
          const parsedLog = lottery.interface.parseLog(log);
          return parsedLog?.name === 'Payout'; // Check if it's a Payout event
        });

        // Ensure the Payout event exists
        expect(payoutEventLog).to.not.be.undefined;

        // We expect the owner to get payed
        const afterOwnerBalance = await mockUSDT.balanceOf(owner.address);
        const ownerDifference = afterOwnerBalance - beforeOwnerBalance;
        expect(ownerDifference).to.be.equal(ownerShare);

        // We expect the 3 accounts to be the winners and receive the prize
        const winners = await lottery.getWinners(normalizedUsdtContractAddress);
        const winnersCount = await lottery.getWinnersCount();
        expect(winners).to.have.lengthOf(winnersCount);
        const allTestAccounts = [otherAccount, ...otherAccounts];
        for (const winner of winners) {
          expect(allTestAccounts.map((account) => account.address)).to.contain(winner);

          // We expect the winners to receive the prize
          const afterParticipantBalance = await mockUSDT.balanceOf(winner);
          const participantDifference = afterParticipantBalance - (participantsToBalances.get(winner) || BigInt(0));
          expect(participantDifference).to.be.greaterThan(0);
        }

        // We expect the participants to be empty
        const lotteryParticipants = await lottery.getParticipants(normalizedUsdtContractAddress);
        expect(lotteryParticipants).to.be.empty;
      });

      it('Should sort the winners and send the events for DAI', async function () {
        const {
          lottery,
          lotteryContractAddress,
          mockDAI,
          normalizedDaiContractAddress,
          owner,
          ticketPrice,
          otherAccount,
          otherAccounts,
          increasedGasPrice,
        } = await getTestAccountsAndContracts();
        const participantsToBalances = new Map<string, bigint>();

        // We buy a ticket for each account
        await Promise.all(
          otherAccounts.map(async (account) => {
            // User must approve the contract to spend USDC
            const approved = await mockDAI.connect(account).approve(lotteryContractAddress, ticketPrice);
            await approved.wait();

            const allowance = await mockDAI.allowance(account.address, lotteryContractAddress);
            expect(allowance).to.be.equal(ticketPrice);

            try {
              const tx = await lottery.connect(account).buyTicket(normalizedDaiContractAddress, ticketPrice, 1, { gasPrice: increasedGasPrice });
              expect(tx).to.emit(lottery, 'TicketPurchased');
              const receipt = await tx.wait();
              console.log(`Bought ticket for account ${account.address}, tx hash: ${receipt?.hash}`);
            } catch (error) {
              console.log(`Failed to buy ticket for account ${account.address}`);
              console.log(error);
            }

            // We expect the participants to contain the account
            let lotteryParticipants = await lottery.getParticipants(normalizedDaiContractAddress);
            expect(lotteryParticipants).to.contain(account.address);

            const participantBalance = await mockDAI.balanceOf(account.address);
            participantsToBalances.set(account.address, participantBalance);
          })
        );

        // We expect the owner to get paid
        const beforeOwnerBalance = await mockDAI.balanceOf(owner.address);
        const ownerRate = await lottery.getOwnerRate();
        const lotteryBalance = await mockDAI.balanceOf(lottery.getAddress());
        const ownerShare = (lotteryBalance * BigInt(ownerRate)) / BigInt(100);

        // We sort the winners
        // We expect the event to be emitted
        const sortTx = await lottery.sort(normalizedDaiContractAddress, 'random', { gasPrice: increasedGasPrice });
        const sortReceipt = await sortTx.wait();
        expect(sortReceipt).to.not.be.null;

        // Check that events are present in the receipt
        expect(sortReceipt?.logs).to.not.be.undefined;

        // Filter logs for the 'Payout' event
        const payoutEventLog = sortReceipt?.logs.find((log) => {
          const parsedLog = lottery.interface.parseLog(log);
          return parsedLog?.name === 'Payout'; // Check if it's a Payout event
        });

        // Ensure the Payout event exists
        expect(payoutEventLog).to.not.be.undefined;

        // We expect the owner to get payed
        const afterOwnerBalance = await mockDAI.balanceOf(owner.address);
        const ownerDifference = afterOwnerBalance - beforeOwnerBalance;
        expect(ownerDifference).to.be.equal(ownerShare);

        // We expect the 3 accounts to be the winners and receive the prize
        const winners = await lottery.getWinners(normalizedDaiContractAddress);
        const winnersCount = await lottery.getWinnersCount();
        expect(winners).to.have.lengthOf(winnersCount);
        const allTestAccounts = [otherAccount, ...otherAccounts];
        for (const winner of winners) {
          expect(allTestAccounts.map((account) => account.address)).to.contain(winner);

          // We expect the winners to receive the prize
          const afterParticipantBalance = await mockDAI.balanceOf(winner);
          const participantDifference = afterParticipantBalance - (participantsToBalances.get(winner) || BigInt(0));
          expect(participantDifference).to.be.greaterThan(0);
        }

        // We expect the participants to be empty
        const lotteryParticipants = await lottery.getParticipants(normalizedDaiContractAddress);
        expect(lotteryParticipants).to.be.empty;
      });
    });
  });
});
