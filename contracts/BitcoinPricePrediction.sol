// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface AggregatorV3Interface {
    function decimals() external view returns (uint8);
    function description() external view returns (string memory);
    function version() external view returns (uint256);
    function getRoundData(uint80 _roundId) external view returns (
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    );
    function latestRoundData() external view returns (
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    );
}

contract BitcoinPricePrediction is Ownable, ReentrancyGuard {
    struct Bet {
        address user;
        uint256 amount;
        bool isUp;
        uint256 round;
    }

    struct Round {
        uint256 startTime;
        uint256 endTime;
        uint256 startPrice;
        uint256 endPrice;
        bool isUp;
        bool finalized;
    }

    uint256 public constant ROUND_DURATION = 5 minutes;
    uint256 public currentRoundId;
    mapping(uint256 => Round) public rounds;
    mapping(uint256 => Bet[]) public bets;
    mapping(address => uint256) public pendingRewards;
    
    AggregatorV3Interface internal priceFeed;

    event RoundStarted(uint256 roundId, uint256 startTime, uint256 startPrice);
    event RoundFinalized(uint256 roundId, uint256 endTime, uint256 endPrice, bool isUp);
    event BetPlaced(address user, uint256 roundId, uint256 amount, bool isUp);
    event RewardClaimed(address user, uint256 amount);

    constructor() Ownable(msg.sender) {
        // eOracle BTC/USD Price Feed on Plume Testnet
        priceFeed = AggregatorV3Interface(0x1E89dA0C147C317f762A39B12808Db1CE42133E2);
        currentRoundId = 1;
        
        // Initialize first round with current price
        uint256 currentPrice = getLatestPrice();
        rounds[currentRoundId] = Round(
            block.timestamp, 
            block.timestamp + ROUND_DURATION, 
            currentPrice, 
            0, 
            false, 
            false
        );
        emit RoundStarted(currentRoundId, block.timestamp, currentPrice);
    }

    function getLatestPrice() public view returns (uint256) {
        (, int256 price, , uint256 timeStamp, ) = priceFeed.latestRoundData();
        require(timeStamp > 0, "Round not complete");
        require(price > 0, "Invalid price");
        
        // eOracle returns price with 8 decimals, we keep it as is for precision
        return uint256(price);
    }

    function startNewRound() external onlyOwner {
        Round storage currentRound = rounds[currentRoundId];
        require(block.timestamp >= currentRound.endTime, "Current round not finished");
        require(!currentRound.finalized, "Current round already finalized");

        // Finalize current round
        uint256 endPrice = getLatestPrice();
        currentRound.endPrice = endPrice;
        currentRound.isUp = endPrice > currentRound.startPrice;
        currentRound.finalized = true;
        
        _distributeRewards(currentRoundId);
        emit RoundFinalized(currentRoundId, block.timestamp, endPrice, currentRound.isUp);
        
        // Start new round
        currentRoundId++;
        uint256 newStartPrice = getLatestPrice();
        rounds[currentRoundId] = Round(
            block.timestamp,
            block.timestamp + ROUND_DURATION,
            newStartPrice,
            0,
            false,
            false
        );
        emit RoundStarted(currentRoundId, block.timestamp, newStartPrice);
    }

    function placeBet(bool _isUp) external payable nonReentrant {
        require(msg.value > 0, "Bet amount must be greater than 0");
        Round storage currentRound = rounds[currentRoundId];
        require(block.timestamp < currentRound.endTime, "Round already ended");
        require(!currentRound.finalized, "Round already finalized");

        bets[currentRoundId].push(Bet(msg.sender, msg.value, _isUp, currentRoundId));
        emit BetPlaced(msg.sender, currentRoundId, msg.value, _isUp);
    }

    function _distributeRewards(uint256 _roundId) internal {
        Round storage round = rounds[_roundId];
        Bet[] storage roundBets = bets[_roundId];

        uint256 totalCorrectBets = 0;
        uint256 totalWrongBets = 0;

        // Calculate totals
        for (uint256 i = 0; i < roundBets.length; i++) {
            Bet storage bet = roundBets[i];
            if (bet.isUp == round.isUp) {
                totalCorrectBets += bet.amount;
            } else {
                totalWrongBets += bet.amount;
            }
        }

        // Distribute rewards to winners
        if (totalCorrectBets > 0) {
            for (uint256 i = 0; i < roundBets.length; i++) {
                Bet storage bet = roundBets[i];
                if (bet.isUp == round.isUp) {
                    uint256 reward = bet.amount + (bet.amount * totalWrongBets) / totalCorrectBets;
                    pendingRewards[bet.user] += reward;
                }
            }
        }
    }

    function claimRewards() external nonReentrant {
        uint256 reward = pendingRewards[msg.sender];
        require(reward > 0, "No rewards to claim");

        pendingRewards[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: reward}("");
        require(success, "Reward transfer failed");
        emit RewardClaimed(msg.sender, reward);
    }

    function getCurrentRound() external view returns (Round memory) {
        return rounds[currentRoundId];
    }

    function getUserBets(uint256 _roundId, address _user) external view returns (Bet[] memory) {
        Bet[] storage roundBets = bets[_roundId];
        uint256 count = 0;
        for (uint256 i = 0; i < roundBets.length; i++) {
            if (roundBets[i].user == _user) {
                count++;
            }
        }

        Bet[] memory userBets = new Bet[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < roundBets.length; i++) {
            if (roundBets[i].user == _user) {
                userBets[index] = roundBets[i];
                index++;
            }
        }
        return userBets;
    }

    // Emergency withdrawal for contract owner
    function emergencyWithdraw() external onlyOwner {
        (bool success, ) = payable(owner()).call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }

    receive() external payable {}
}
