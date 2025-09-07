// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

/// @title Eukleria Lottery contract
/// @author Roman Tolmachev
/// @notice Creates and manages a pool of funds, which is then distributed to the participants 
contract Lottery is Ownable {

    /// @dev The default price of a ticket: 5 USD
    uint private constant TICKET_PRICE = 5 * 10 ** 6;

    struct LotteryPool {
        /// @notice Participants of the current pool
        address[] participants;
        /// @notice Winners of the latest pool
        address[] winners;
        /// @notice Flag to check if the draw is in process
        bool isDrawInProcess;
        /// @notice The price of a ticket
        uint ticketPrice;
    }

    mapping(address => LotteryPool) public lotteryPools;

    mapping(address => bool) public supportedTokens;

    /// @dev The number of winners in the pools
    uint8 private winnersCount = 3;

    /// @dev The rate of the owner's commission
    uint8 private ownerRate = 20;

    /// @param erc20TokenAddress The address of the ERC20 token
    event SupportedTokenAdded(address indexed erc20TokenAddress);

    /// @param erc20TokenAddress The address of the ERC20 token
    event SupportedTokenRemoved(address indexed erc20TokenAddress);

    /// @param buyer Address of the buyer
    /// @param _numberOfTickets The number of tickets bought
    event TicketsPurchased(address indexed buyer, uint _numberOfTickets);

    /// @param amountPerWinner  Amount of native coin sent
    /// @param winners Addresses of the winners
    event Payout(uint amountPerWinner, address[] winners);

    constructor(address[] memory _erc20TokenAddresses) Ownable(msg.sender) {
        require(_erc20TokenAddresses.length > 0, "At least one stablecoin address is required");
        for (uint i = 0; i < _erc20TokenAddresses.length; i++) {
            addSupportedToken(_erc20TokenAddresses[i]);
        }
    }

    /// @notice Function to add a new supported with ERC20 token and a lottery pool
    /// @param _erc20TokenAddress The address of the ERC20 token
    function addSupportedToken(address _erc20TokenAddress) public onlyOwner {
        require(!supportedTokens[_erc20TokenAddress], "Token is already supported");
        address[] memory participants = new address[](0);
        address[] memory winners = new address[](0);
        lotteryPools[_erc20TokenAddress] = LotteryPool(participants, winners, false, TICKET_PRICE);

        supportedTokens[_erc20TokenAddress] = true;

        emit SupportedTokenAdded(_erc20TokenAddress);
    }

    function removeSupportedToken(address _erc20TokenAddress) public onlyOwner {
        delete lotteryPools[_erc20TokenAddress];
        delete supportedTokens[_erc20TokenAddress];

        emit SupportedTokenRemoved(_erc20TokenAddress);
    }

    /// @notice Function to buy a ticket with ERC20 token
    /// @param _erc20TokenAddress The address of the ERC20 token
    function buyTicket(address _erc20TokenAddress, uint _amount, uint _numberOfTickets) public isSupportedToken(_erc20TokenAddress) {
        IERC20 erc20Token = IERC20(_erc20TokenAddress);
        LotteryPool storage lotteryPool = lotteryPools[_erc20TokenAddress];

        require(!lotteryPool.isDrawInProcess, "Cannot buy tickets during an ongoing draw");
        require(erc20Token.balanceOf(msg.sender) >= _amount, "Insufficient balance");
        require(erc20Token.allowance(msg.sender, address(this)) >= _amount, "Allowance not set");
        require(_numberOfTickets > 0, "Must buy at least 1 ticket");
        require(_amount / lotteryPool.ticketPrice == _numberOfTickets, "The amount must be a multiple of the ticket price"); 

        // Transfer USD from the participant to the contract
        require(erc20Token.transferFrom(msg.sender, address(this), _amount), "ERC20 token transfer failed");

        // Add participant
        for (uint i = 0; i < _numberOfTickets; i++) {
            lotteryPool.participants.push(msg.sender);
        }

        // Emit event
        emit TicketsPurchased(msg.sender, _numberOfTickets);
    }

    /// @notice Function to get the balance of the contract
    function getTokenBalance(address _erc20TokenAddress) external view returns (uint) {
        IERC20 erc20Token = IERC20(_erc20TokenAddress);
        return erc20Token.balanceOf(address(this));
    }

    /// @notice Function to sort the lottery
    function sort(address _erc20TokenAddress, string memory _randomString) public onlyOwner isSupportedToken(_erc20TokenAddress) {
        IERC20 erc20Token = IERC20(_erc20TokenAddress);
        LotteryPool storage lotteryPool = lotteryPools[_erc20TokenAddress];

        require(!lotteryPool.isDrawInProcess, "Draw is already in process");
        require(lotteryPool.participants.length >= winnersCount, "Not enough participants to sort the lottery");

        lotteryPool.isDrawInProcess = true;

        // Reset the winners array before sorting
        delete lotteryPool.winners;

        uint pool = erc20Token.balanceOf(address(this));
        uint ownerAmount = (pool * ownerRate) / 100;
        require(erc20Token.transfer(owner(), ownerAmount), "USD payout failed");

        uint8 poolRate = 100 - ownerRate;
        uint prizePool = (pool * poolRate) / 100;
        uint amountPerWinner = prizePool / winnersCount;

        for (uint i = 0; i < winnersCount; i++) {
            uint randomIndex = _generateRandomNumber(_erc20TokenAddress, i, _randomString);
            address winner = lotteryPool.participants[randomIndex];

            // Transfer USD to the winner
            require(erc20Token.transfer(winner, amountPerWinner), "USD payout failed");

            lotteryPool.winners.push(winner);

            lotteryPool.participants[randomIndex] = lotteryPool.participants[lotteryPool.participants.length - 1];
            lotteryPool.participants.pop();
        }

        // Reset the participants array after sorting
        delete lotteryPool.participants;

        lotteryPool.isDrawInProcess = false;

        emit Payout(amountPerWinner, lotteryPool.winners);
    }

    /// @notice Function to generate a pseudo random number
    /// @param _seed The seed for the random number generation
    /// @param _randomString The random string for the random number generation
    /// @return The pseudo random number
    function _generateRandomNumber(address _erc20TokenAddress, uint _seed, string memory _randomString) private view returns (uint) {
        LotteryPool storage lotteryPool = lotteryPools[_erc20TokenAddress];
        uint maxRange = lotteryPool.participants.length;
        uint randomNumber;

        do {
            randomNumber = uint(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, _randomString, _seed)));
        } while (randomNumber >= type(uint).max - (type(uint).max % maxRange));

        return randomNumber % maxRange;
    }

    function getOwnerRate() external view onlyOwner returns (uint8) {
        return ownerRate;
    }

    /// @notice Function to set the owner's commission rate
    function setOwnerRate(uint8 _rate) public onlyOwner {
        require(_rate >= 0 && _rate <= 100, "Rate must be between 0 and 100");
        ownerRate = _rate;
    }

    function getTicketPrice(address _erc20TokenAddress) external view isSupportedToken(_erc20TokenAddress) returns (uint) {
        LotteryPool storage lotteryPool = lotteryPools[_erc20TokenAddress];
        return lotteryPool.ticketPrice;
    }

    function setTicketPrice(address _erc20TokenAddress, uint _price) public onlyOwner isSupportedToken(_erc20TokenAddress) {
        require(_price > 0, "Price must be greater than 0");
        LotteryPool storage lotteryPool = lotteryPools[_erc20TokenAddress];
        lotteryPool.ticketPrice = _price;
    }

    function getWinnersCount() external view returns (uint8) {
        return winnersCount;
    }

    function setWinnersCount(uint8 _count) public onlyOwner {
        require(_count > 3, "Winners count must be greater than 3");
        winnersCount = _count;
    }

    function getParticipants(address _erc20TokenAddress) external view isSupportedToken(_erc20TokenAddress) returns (address[] memory) {
        LotteryPool storage lotteryPool = lotteryPools[_erc20TokenAddress];
        return lotteryPool.participants;
    }

    function getWinners(address _erc20TokenAddress) external view isSupportedToken(_erc20TokenAddress) returns (address[] memory)  {
        LotteryPool storage lotteryPool = lotteryPools[_erc20TokenAddress];
        return lotteryPool.winners;
    }

    modifier isSupportedToken(address _erc20TokenAddress) {
        require(supportedTokens[_erc20TokenAddress], "Token is not supported");
        _;
    }
}
