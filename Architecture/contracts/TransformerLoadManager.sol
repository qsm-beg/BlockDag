// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title TransformerLoadManager
 * @dev Core contract for managing transformer load predictions and alerts
 * MVP Version - Bare minimum functionality for demo
 */
contract TransformerLoadManager {
    // State variables
    uint256 public currentLoad; // Percentage (0-100)
    uint256 public predictedLoad; // AI model prediction for next hour
    uint256 public criticalThreshold = 70; // When incentives trigger
    uint256 public lastUpdated;
    
    // Oracle address (for receiving real transformer data)
    address public oracle;
    address public owner;
    
    // Simple prediction storage
    struct PredictionData {
        uint256 timestamp;
        uint256 currentLoad;
        uint256 prediction;
        uint256 confidence;
    }
    
    mapping(uint256 => PredictionData) public predictions;
    uint256 public predictionCount;
    
    // Events for frontend
    event LoadUpdated(uint256 load, uint256 timestamp);
    event PredictionMade(uint256 predicted, uint256 confidence);
    event CriticalLoadWarning(uint256 load, uint256 incentiveRate);
    
    modifier onlyOracle() {
        require(msg.sender == oracle || msg.sender == owner, "Only oracle can update");
        _;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        oracle = msg.sender; // For MVP, owner is also oracle
        currentLoad = 45; // Starting load
        lastUpdated = block.timestamp;
    }
    
    /**
     * @dev Update current transformer load (called by oracle/mock data)
     */
    function updateCurrentLoad(uint256 _load) external onlyOracle {
        require(_load <= 100, "Load cannot exceed 100%");
        
        currentLoad = _load;
        lastUpdated = block.timestamp;
        
        emit LoadUpdated(_load, block.timestamp);
        
        // Trigger critical warning if needed
        if (_load >= criticalThreshold) {
            uint256 incentiveRate = calculateIncentiveRate(_load);
            emit CriticalLoadWarning(_load, incentiveRate);
        }
    }
    
    /**
     * @dev Submit AI prediction (mock implementation for MVP)
     */
    function submitPrediction(
        uint256 _prediction, 
        uint256 _confidence
    ) external onlyOracle {
        require(_prediction <= 100, "Prediction cannot exceed 100%");
        require(_confidence <= 100, "Confidence cannot exceed 100%");
        
        predictedLoad = _prediction;
        
        predictions[predictionCount] = PredictionData({
            timestamp: block.timestamp,
            currentLoad: currentLoad,
            prediction: _prediction,
            confidence: _confidence
        });
        
        predictionCount++;
        
        emit PredictionMade(_prediction, _confidence);
    }
    
    /**
     * @dev Calculate dynamic incentive rate based on load
     */
    function calculateIncentiveRate(uint256 load) public pure returns (uint256) {
        if (load >= 85) return 300; // 3x multiplier for critical
        if (load >= 70) return 200; // 2x multiplier for high
        return 100; // Base rate
    }
    
    /**
     * @dev Get current risk level
     */
    function getRiskLevel() external view returns (string memory) {
        if (currentLoad >= 85) return "CRITICAL";
        if (currentLoad >= 70) return "HIGH";
        if (currentLoad >= 50) return "MEDIUM";
        return "LOW";
    }
    
    /**
     * @dev Check if load is critical
     */
    function isCriticalLoad() external view returns (bool) {
        return currentLoad >= criticalThreshold;
    }
    
    /**
     * @dev Get latest prediction data
     */
    function getLatestPrediction() external view returns (
        uint256 timestamp,
        uint256 prediction,
        uint256 confidence
    ) {
        if (predictionCount == 0) {
            return (0, 0, 0);
        }
        
        PredictionData memory latest = predictions[predictionCount - 1];
        return (latest.timestamp, latest.prediction, latest.confidence);
    }
    
    /**
     * @dev Admin function to set oracle
     */
    function setOracle(address _oracle) external onlyOwner {
        oracle = _oracle;
    }
    
    /**
     * @dev Admin function to set critical threshold
     */
    function setCriticalThreshold(uint256 _threshold) external onlyOwner {
        require(_threshold > 0 && _threshold <= 100, "Invalid threshold");
        criticalThreshold = _threshold;
    }
}