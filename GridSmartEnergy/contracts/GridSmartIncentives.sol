// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract GridSmartIncentives {
    struct Commitment {
        uint256 kwhAmount;
        uint256 timestamp;
        uint256 deadline;
        bool fulfilled;
        bool claimed;
    }

    struct UserStats {
        uint256 totalReductions;
        uint256 totalRewards;
        uint256 activeCommitments;
        uint256 successRate;
    }

    mapping(address => Commitment[]) public userCommitments;
    mapping(address => UserStats) public userStats;
    mapping(address => uint256) public pendingRewards;

    uint256 public transformerLoad;
    uint256 public criticalThreshold = 85;
    uint256 public baseRewardRate = 25; // 2.5 BDAG per kWh (scaled by 10)
    uint256 public peakHourBonus = 15; // 1.5x multiplier (scaled by 10)

    address public admin;
    address public oracleAddress;
    uint256 public totalReductionCommitments;
    uint256 public totalRewardsPaid;

    event ReductionCommitted(
        address indexed user,
        uint256 kwhAmount,
        uint256 timestamp,
        uint256 deadline
    );

    event RewardsClaimed(
        address indexed user,
        uint256 amount,
        uint256 timestamp
    );

    event LoadUpdated(
        uint256 newLoad,
        uint256 timestamp,
        bool isCritical
    );

    event CommitmentFulfilled(
        address indexed user,
        uint256 commitmentId,
        uint256 actualReduction
    );

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    modifier onlyOracle() {
        require(msg.sender == oracleAddress || msg.sender == admin, "Only oracle or admin");
        _;
    }

    constructor() {
        admin = msg.sender;
        oracleAddress = msg.sender; // Initially set to admin
        transformerLoad = 70; // Starting load at 70%
    }

    function commitReduction(uint256 _kwhAmount) external {
        require(_kwhAmount >= 5 * 10**17 && _kwhAmount <= 50 * 10**18, "Invalid commitment amount");
        require(transformerLoad > 70, "Load not high enough for incentives");

        uint256 deadline = block.timestamp + 3600; // 1 hour deadline

        userCommitments[msg.sender].push(Commitment({
            kwhAmount: _kwhAmount,
            timestamp: block.timestamp,
            deadline: deadline,
            fulfilled: false,
            claimed: false
        }));

        userStats[msg.sender].activeCommitments++;
        totalReductionCommitments += _kwhAmount;

        emit ReductionCommitted(msg.sender, _kwhAmount, block.timestamp, deadline);
    }

    function fulfillCommitment(uint256 _commitmentId, uint256 _actualReduction) external {
        require(_commitmentId < userCommitments[msg.sender].length, "Invalid commitment ID");
        Commitment storage commitment = userCommitments[msg.sender][_commitmentId];

        require(!commitment.fulfilled, "Already fulfilled");
        require(block.timestamp <= commitment.deadline, "Commitment expired");

        commitment.fulfilled = true;
        userStats[msg.sender].activeCommitments--;

        if (_actualReduction >= commitment.kwhAmount * 9 / 10) { // 90% threshold
            uint256 reward = calculateReward(commitment.kwhAmount);
            pendingRewards[msg.sender] += reward;
            userStats[msg.sender].totalReductions += _actualReduction;
            userStats[msg.sender].successRate =
                (userStats[msg.sender].successRate * 9 + 100) / 10; // Running average
        } else {
            userStats[msg.sender].successRate =
                (userStats[msg.sender].successRate * 9) / 10; // Decrease success rate
        }

        emit CommitmentFulfilled(msg.sender, _commitmentId, _actualReduction);
    }

    function claimRewards() external {
        uint256 rewards = pendingRewards[msg.sender];
        require(rewards > 0, "No rewards to claim");

        pendingRewards[msg.sender] = 0;
        userStats[msg.sender].totalRewards += rewards;
        totalRewardsPaid += rewards;

        // In production, this would transfer BDAG tokens
        // For demo, we emit an event
        emit RewardsClaimed(msg.sender, rewards, block.timestamp);
    }

    function calculateReward(uint256 _kwhAmount) public view returns (uint256) {
        uint256 reward = (_kwhAmount * baseRewardRate) / 10;

        if (isPeakHours()) {
            reward = (reward * peakHourBonus) / 10;
        }

        if (transformerLoad >= criticalThreshold) {
            reward = (reward * 12) / 10; // 20% critical bonus
        }

        return reward;
    }

    function updateTransformerLoad(uint256 _newLoad) external onlyOracle {
        require(_newLoad <= 100, "Invalid load percentage");

        uint256 oldLoad = transformerLoad;
        transformerLoad = _newLoad;

        bool isCritical = _newLoad >= criticalThreshold;

        emit LoadUpdated(_newLoad, block.timestamp, isCritical);

        // Auto-trigger incentives if load becomes critical
        if (!isCritical && oldLoad < criticalThreshold && _newLoad >= criticalThreshold) {
            // In production, this would trigger notifications
        }
    }

    function isPeakHours() public view returns (bool) {
        uint256 hour = (block.timestamp / 3600) % 24; // Get current hour in UTC
        return (hour >= 6 && hour <= 9) || (hour >= 18 && hour <= 21);
    }

    function getUserCommitments(address _user) external view returns (Commitment[] memory) {
        return userCommitments[_user];
    }

    function getUserStats(address _user) external view returns (UserStats memory) {
        return userStats[_user];
    }

    function getTransformerLoad() external view returns (uint256) {
        return transformerLoad;
    }

    function setOracleAddress(address _oracle) external onlyAdmin {
        oracleAddress = _oracle;
    }

    function setRewardRates(uint256 _baseRate, uint256 _peakBonus) external onlyAdmin {
        baseRewardRate = _baseRate;
        peakHourBonus = _peakBonus;
    }

    function setCriticalThreshold(uint256 _threshold) external onlyAdmin {
        require(_threshold <= 100, "Invalid threshold");
        criticalThreshold = _threshold;
    }
}