
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IPriceFeed {
    function latestRoundData() external view returns (
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    );
}

contract BitcoinPricePrediction is Ownable, ReentrancyGuard {
    // Struktur untuk menyimpan taruhan pengguna
    struct Bet {
        address user;
        uint256 amount; // Jumlah taruhan dalam native cBTC (wei units)
        bool isUp; // True untuk Up, False untuk Down
        uint256 round; // Ronde taruhan
    }

    // Struktur untuk menyimpan data ronde
    struct Round {
        uint256 startTime; // Waktu mulai ronde (Unix timestamp)
        uint256 endTime; // Waktu akhir ronde (Unix timestamp)
        uint256 startPrice; // Harga BTC/USDT saat ronde dimulai (10^8 units)
        uint256 endPrice; // Harga BTC/USDT saat ronde selesai (10^8 units)
        bool isUp; // True jika harga naik, False jika turun
        bool finalized; // Apakah ronde sudah selesai
    }

    // State variables
    IPriceFeed public immutable priceFeed; // Blocksense price feed contract
    uint256 public constant ROUND_DURATION = 15 minutes; // Durasi setiap ronde (900 seconds)
    uint256 public constant MAX_PRICE_AGE = 30 minutes; // Maksimum usia data harga (1800 seconds)
    uint256 public currentRoundId; // ID ronde saat ini
    mapping(uint256 => Round) public rounds; // Data setiap ronde
    mapping(uint256 => Bet[]) public bets; // Taruhan per ronde
    mapping(address => uint256) public pendingRewards; // Hadiah yang belum diklaim
    uint256 public poolBalance; // Saldo pool hadiah

    // Events
    event RoundStarted(uint256 roundId, uint256 startTime, uint256 startPrice);
    event RoundFinalized(uint256 roundId, uint256 endTime, uint256 endPrice, bool isUp);
    event BetPlaced(address user, uint256 roundId, uint256 amount, bool isUp);
    event RewardClaimed(address user, uint256 amount);
    event PoolUpdated(uint256 newBalance, bool isDeposit);

    constructor(address _priceFeedAddress) Ownable(msg.sender) {
        priceFeed = IPriceFeed(_priceFeedAddress);
        currentRoundId = 1;
        
        // Mulai ronde pertama dengan harga dari Blocksense price feed
        (, int256 price,, uint256 updatedAt,) = priceFeed.latestRoundData();
        require(price > 0, "Invalid price feed");
        require(block.timestamp <= updatedAt + MAX_PRICE_AGE, "Price feed too old");
        
        rounds[currentRoundId] = Round(
            block.timestamp, 
            block.timestamp + ROUND_DURATION, 
            uint256(price), 
            0, 
            false, 
            false
        );
        emit RoundStarted(currentRoundId, block.timestamp, uint256(price));
    }

    // Fungsi untuk memulai ronde baru dan finalisasi ronde sebelumnya
    function startNewRound() external nonReentrant {
        Round storage currentRound = rounds[currentRoundId];
        require(block.timestamp >= currentRound.endTime, "Current round not finished");
        require(!currentRound.finalized, "Current round already finalized");

        // Ambil harga terbaru dari Blocksense price feed untuk finalisasi ronde
        (, int256 endPrice,, uint256 updatedAt,) = priceFeed.latestRoundData();
        require(endPrice > 0, "Invalid price feed");
        require(block.timestamp <= updatedAt + MAX_PRICE_AGE, "Price feed too old");

        // Finalisasi ronde saat ini
        currentRound.endPrice = uint256(endPrice);
        currentRound.isUp = uint256(endPrice) > currentRound.startPrice;
        currentRound.finalized = true;
        _distributeRewards(currentRoundId);
        emit RoundFinalized(currentRoundId, block.timestamp, uint256(endPrice), currentRound.isUp);

        // Mulai ronde baru
        currentRoundId++;
        (, int256 newPrice,, uint256 newUpdatedAt,) = priceFeed.latestRoundData();
        require(newPrice > 0, "Invalid price feed");
        require(block.timestamp <= newUpdatedAt + MAX_PRICE_AGE, "Price feed too old");
        
        rounds[currentRoundId] = Round(
            block.timestamp,
            block.timestamp + ROUND_DURATION,
            uint256(newPrice),
            0,
            false,
            false
        );
        emit RoundStarted(currentRoundId, block.timestamp, uint256(newPrice));
    }

    // Pengguna memasang taruhan
    function placeBet(bool _isUp) external payable nonReentrant {
        require(msg.value > 0, "Bet amount must be greater than 0");
        Round storage currentRound = rounds[currentRoundId];
        require(block.timestamp < currentRound.endTime, "Round already ended");
        require(!currentRound.finalized, "Round already finalized");

        // Tambahkan taruhan ke pool
        poolBalance += msg.value;
        bets[currentRoundId].push(Bet(msg.sender, msg.value, _isUp, currentRoundId));
        emit BetPlaced(msg.sender, currentRoundId, msg.value, _isUp);
        emit PoolUpdated(poolBalance, true);
    }

    // Distribusi hadiah untuk pemenang
    function _distributeRewards(uint256 _roundId) internal {
        Round storage round = rounds[_roundId];
        Bet[] storage roundBets = bets[_roundId];
        uint256 totalWinningBets = 0;
        uint256 totalPool = poolBalance;

        // Hitung total taruhan pemenang
        for (uint256 i = 0; i < roundBets.length; i++) {
            if (roundBets[i].isUp == round.isUp) {
                totalWinningBets += roundBets[i].amount;
            }
        }

        // Distribusikan hadiah secara proporsional
        if (totalWinningBets > 0) {
            for (uint256 i = 0; i < roundBets.length; i++) {
                Bet storage bet = roundBets[i];
                if (bet.isUp == round.isUp) {
                    // Payout proporsional berdasarkan kontribusi taruhan
                    uint256 reward = (bet.amount * totalPool) / totalWinningBets;
                    pendingRewards[bet.user] += reward;
                    poolBalance -= reward;
                }
            }
        }
        // Jika tidak ada pemenang, pool tetap untuk ronde berikutnya
    }

    // Pengguna klaim hadiah
    function claimRewards() external nonReentrant {
        uint256 reward = pendingRewards[msg.sender];
        require(reward > 0, "No rewards to claim");
        require(address(this).balance >= reward, "Insufficient contract balance");

        pendingRewards[msg.sender] = 0;
        payable(msg.sender).transfer(reward);
        emit RewardClaimed(msg.sender, reward);
    }

    // Creator menambah saldo pool
    function depositToPool() external payable onlyOwner {
        require(msg.value > 0, "Amount must be greater than 0");
        poolBalance += msg.value;
        emit PoolUpdated(poolBalance, true);
    }

    // Creator menarik saldo pool
    function withdrawFromPool(uint256 _amount) external onlyOwner nonReentrant {
        require(_amount <= poolBalance, "Insufficient pool balance");
        require(address(this).balance >= _amount, "Insufficient contract balance");
        poolBalance -= _amount;
        payable(msg.sender).transfer(_amount);
        emit PoolUpdated(poolBalance, false);
    }

    // Fungsi untuk cek status ronde saat ini
    function getCurrentRound() external view returns (Round memory) {
        return rounds[currentRoundId];
    }

    // Fungsi untuk cek taruhan pengguna di ronde tertentu
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

    // Fungsi untuk mendapatkan harga BTC/USDT terbaru dari Blocksense
    function getLatestPrice() external view returns (uint256) {
        (, int256 price,, uint256 updatedAt,) = priceFeed.latestRoundData();
        require(price > 0, "Invalid price feed");
        require(block.timestamp <= updatedAt + MAX_PRICE_AGE, "Price feed too old");
        return uint256(price);
    }

    // Fallback function to receive native cBTC
    receive() external payable {}
}
