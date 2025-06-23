
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract BitcoinPricePrediction is Ownable, ReentrancyGuard {
    IERC20 public cBTCToken;

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
    uint256 public poolBalance;

    event RoundStarted(uint256 roundId, uint256 startTime, uint256 startPrice);
    event RoundFinalized(uint256 roundId, uint256 endTime, uint256 endPrice, bool isUp);
    event BetPlaced(address user, uint256 roundId, uint256 amount, bool isUp);
    event RewardClaimed(address user, uint256 amount);
    event PoolUpdated(uint256 newBalance, bool isDeposit);

    constructor(address _cBTCToken) Ownable(msg.sender) {
        cBTCToken = IERC20(_cBTCToken);
        currentRoundId = 1;
        rounds[currentRoundId] = Round(block.timestamp, block.timestamp + ROUND_DURATION, 0, 0, false, false);
    }

    function submitPriceAndStartRound(uint256 _price) external onlyOwner {
        Round storage currentRound = rounds[currentRoundId];
        require(block.timestamp >= currentRound.endTime, "Current round not finished");
        require(!currentRound.finalized, "Current round already finalized");

        if (currentRound.startPrice > 0) {
            currentRound.endPrice = _price;
            currentRound.isUp = _price > currentRound.startPrice;
            currentRound.finalized = true;
            _distributeRewards(currentRoundId);
            emit RoundFinalized(currentRoundId, block.timestamp, _price, currentRound.isUp);
            currentRoundId++;
        }

        rounds[currentRoundId] = Round(
            block.timestamp,
            block.timestamp + ROUND_DURATION,
            _price,
            0,
            false,
            false
        );
        emit RoundStarted(currentRoundId, block.timestamp, _price);
    }

    function placeBet(uint256 _amount, bool _isUp) external nonReentrant {
        require(_amount > 0, "Bet amount must be greater than 0");
        Round storage currentRound = rounds[currentRoundId];
        require(block.timestamp < currentRound.endTime, "Round already ended");
        require(!currentRound.finalized, "Round already finalized");

        require(cBTCToken.transferFrom(msg.sender, address(this), _amount), "cBTC transfer failed");

        bets[currentRoundId].push(Bet(msg.sender, _amount, _isUp, currentRoundId));
        emit BetPlaced(msg.sender, currentRoundId, _amount, _isUp);
    }

    function _distributeRewards(uint256 _roundId) internal {
        Round storage round = rounds[_roundId];
        Bet[] storage roundBets = bets[_roundId];

        for (uint256 i = 0; i < roundBets.length; i++) {
            Bet storage bet = roundBets[i];
            if (bet.isUp == round.isUp) {
                uint256 reward = bet.amount;
                if (poolBalance >= reward) {
                    pendingRewards[bet.user] += reward;
                    poolBalance -= reward;
                }
            }
        }
    }

    function claimRewards() external nonReentrant {
        uint256 reward = pendingRewards[msg.sender];
        require(reward > 0, "No rewards to claim");

        pendingRewards[msg.sender] = 0;
        require(cBTCToken.transfer(msg.sender, reward), "Reward transfer failed");
        emit RewardClaimed(msg.sender, reward);
    }

    function depositToPool(uint256 _amount) external onlyOwner {
        require(_amount > 0, "Amount must be greater than 0");
        require(cBTCToken.transferFrom(msg.sender, address(this), _amount), "cBTC transfer failed");
        poolBalance += _amount;
        emit PoolUpdated(poolBalance, true);
    }

    function withdrawFromPool(uint256 _amount) external onlyOwner {
        require(_amount <= poolBalance, "Insufficient pool balance");
        poolBalance -= _amount;
        require(cBTCToken.transfer(msg.sender, _amount), "cBTC transfer failed");
        emit PoolUpdated(poolBalance, false);
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
}
