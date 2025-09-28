// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IncentiveManager
 * @dev MVP version - Simple incentive system for load reduction
 * Users commit to reduce consumption and get rewarded
 */
contract IncentiveManager {
    
    // Simple commitment structure for MVP
    struct UserCommitment {
        uint256 kwhToReduce;
        uint256 commitmentTime;
        uint256 incentiveRate; // Rate at commitment time
        bool fulfilled;
        uint256 rewardAmount;
    }
    
    // Basic user stats
    struct UserStats {
        uint256 totalReduced;
        uint256 totalEarned;
        uint256 successfulCommitments;
    }
    
    mapping(address => UserCommitment[]) public userCommitments;
    mapping(address => UserStats) public userStats;
    mapping(address => uint256) public pendingRewards;
    
    uint256 public totalRewardsPool;
    uint256 public baseIncentiveRate = 100 wei; // Base rate per kWh (in wei)
    
    address public owner;
    address public loadManager; // Reference to transformer contract
    
    // Events
    event CommitmentMade(address indexed user, uint256 kwhToReduce, uint256 rate);
    event ReductionVerified(address indexed user, uint256 actualReduction, uint256 reward);
    event RewardsPaid(address indexed user, uint256 amount);
    event PoolFunded(uint256 amount);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Fund the rewards pool (simulating Eskom funding)
     */
    function fundRewardsPool() external payable {
        totalRewardsPool += msg.value;
        emit PoolFunded(msg.value);
    }
    
    /**
     * @dev Users commit to reducing their consumption
     * MVP: Simplified - just records commitment
     */
    function commitToReduction(uint256 _kwhToReduce) external {
        require(_kwhToReduce > 0, "Must commit to some reduction");
        
        // Get current incentive rate (simplified for MVP)
        uint256 currentRate = getCurrentIncentiveRate();
        uint256 potentialReward = _kwhToReduce * currentRate;
        
        // Store commitment
        userCommitments[msg.sender].push(UserCommitment({
            kwhToReduce: _kwhToReduce,
            commitmentTime: block.timestamp,
            incentiveRate: currentRate,
            fulfilled: false,
            rewardAmount: potentialReward
        }));
        
        emit CommitmentMade(msg.sender, _kwhToReduce, currentRate);
    }
    
    /**
     * @dev Verify reduction and pay rewards
     * MVP: Simplified verification - auto-approve for demo
     */
    function verifyAndReward(address _user, uint256 _actualReduction) external onlyOwner {
        require(_actualReduction > 0, "No reduction to verify");
        
        // Find latest unfulfilled commitment
        UserCommitment[] storage commitments = userCommitments[_user];
        require(commitments.length > 0, "No commitments found");
        
        // For MVP, just process the latest commitment
        uint256 lastIndex = commitments.length - 1;
        UserCommitment storage commitment = commitments[lastIndex];
        
        require(!commitment.fulfilled, "Already fulfilled");
        
        // Calculate actual reward based on actual reduction
        uint256 actualReward = _actualReduction * commitment.incentiveRate;
        
        // Cap reward to committed amount
        if (actualReward > commitment.rewardAmount) {
            actualReward = commitment.rewardAmount;
        }
        
        commitment.fulfilled = true;
        commitment.rewardAmount = actualReward;
        
        // Update user stats
        userStats[_user].totalReduced += _actualReduction;
        userStats[_user].totalEarned += actualReward;
        userStats[_user].successfulCommitments++;
        
        // Add to pending rewards
        pendingRewards[_user] += actualReward;
        
        emit ReductionVerified(_user, _actualReduction, actualReward);
    }
    
    /**
     * @dev Users claim their rewards
     */
    function claimRewards() external {
        uint256 amount = pendingRewards[msg.sender];
        require(amount > 0, "No rewards to claim");
        require(totalRewardsPool >= amount, "Insufficient pool balance");
        
        pendingRewards[msg.sender] = 0;
        totalRewardsPool -= amount;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
        
        emit RewardsPaid(msg.sender, amount);
    }
    
    /**
     * @dev Get current incentive rate (simplified for MVP)
     * In production, this would check transformer load
     */
    function getCurrentIncentiveRate() public view returns (uint256) {
        // For MVP, return fixed multiplier
        // In production: would query loadManager contract
        return baseIncentiveRate * 2; // 2x base rate for demo
    }
    
    /**
     * @dev Get user's commitment history
     */
    function getUserCommitments(address _user) external view returns (uint256) {
        return userCommitments[_user].length;
    }
    
    /**
     * @dev Get specific commitment details
     */
    function getCommitmentDetails(address _user, uint256 _index) external view returns (
        uint256 kwhToReduce,
        uint256 commitmentTime,
        uint256 incentiveRate,
        bool fulfilled,
        uint256 rewardAmount
    ) {
        require(_index < userCommitments[_user].length, "Invalid index");
        
        UserCommitment memory commitment = userCommitments[_user][_index];
        return (
            commitment.kwhToReduce,
            commitment.commitmentTime,
            commitment.incentiveRate,
            commitment.fulfilled,
            commitment.rewardAmount
        );
    }
    
    /**
     * @dev Admin functions
     */
    function setLoadManager(address _loadManager) external onlyOwner {
        loadManager = _loadManager;
    }
    
    function setBaseIncentiveRate(uint256 _rate) external onlyOwner {
        baseIncentiveRate = _rate;
    }
    
    /**
     * @dev Emergency withdraw (for testing)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = payable(owner).call{value: balance}("");
        require(success, "Withdraw failed");
    }
    
    /**
     * @dev Get contract stats for dashboard
     */
    function getContractStats() external view returns (
        uint256 poolBalance,
        uint256 baseRate,
        uint256 currentRate
    ) {
        return (
            totalRewardsPool,
            baseIncentiveRate,
            getCurrentIncentiveRate()
        );
    }
}