// Contract ABIs for GridSmart Energy
// These match the Solidity contracts we'll create

export const CONTRACT_ABIS = {
  GridSmartIncentives: [
    "function commitReduction(uint256 kwhAmount) external",
    "function claimRewards() external view returns (uint256)",
    "function getUserCommitments(address user) external view returns (uint256[])",
    "function getTransformerLoad() external view returns (uint256)",
    "function updateTransformerLoad(uint256 load) external",
    "event ReductionCommitted(address indexed user, uint256 kwhAmount, uint256 timestamp)",
    "event RewardsClaimed(address indexed user, uint256 amount)",
    "event LoadUpdated(uint256 newLoad, uint256 timestamp)",
  ],

  EnergyTrading: [
    "function createSellOrder(uint256 amount, uint256 pricePerKwh) external",
    "function createBuyOrder(uint256 amount) external payable",
    "function executeTrade(uint256 orderId) external payable",
    "function cancelOrder(uint256 orderId) external",
    "function getActiveOrders() external view returns (tuple(address seller, uint256 amount, uint256 price, bool active)[])",
    "event OrderCreated(uint256 indexed orderId, address indexed creator, uint256 amount, uint256 price)",
    "event TradeExecuted(uint256 indexed orderId, address indexed buyer, address indexed seller, uint256 amount)",
    "event OrderCancelled(uint256 indexed orderId)",
  ]
};

// Contract addresses (mock for demo)
export const CONTRACT_ADDRESSES = {
  GridSmartIncentives: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb8',
  EnergyTrading: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  Treasury: '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199',
};

// Network configuration
export const NETWORK_CONFIG = {
  testnet: {
    chainId: 20000,
    name: 'BlockDAG Testnet',
    rpcUrl: 'https://rpc-testnet-v2.blockdag.network',
    explorerUrl: 'https://awakening.bdagscan.com',
    symbol: 'BDAG',
    decimals: 18,
  },
  mainnet: {
    chainId: 20001, // Placeholder - update when mainnet launches
    name: 'BlockDAG Mainnet',
    rpcUrl: 'https://rpc.blockdag.network',
    explorerUrl: 'https://bdagscan.com',
    symbol: 'BDAG',
    decimals: 18,
  }
};

// Incentive configuration
export const INCENTIVE_CONFIG = {
  baseRewardRate: 2.5, // BDAG per kWh
  peakHourBonus: 1.5, // 50% bonus during peak hours
  minCommitment: 0.5, // Minimum kWh commitment
  maxCommitment: 50, // Maximum kWh commitment per transaction
  rewardInterval: 3600, // 1 hour in seconds
  penaltyRate: 0.1, // 10% penalty for not meeting commitment
};

// Trading configuration
export const TRADING_CONFIG = {
  minTradeAmount: 1, // Minimum 1 kWh
  maxTradeAmount: 100, // Maximum 100 kWh per trade
  minPrice: 0.1, // Minimum price per kWh in BDAG
  maxPrice: 2.0, // Maximum price per kWh in BDAG
  tradingFee: 0.01, // 1% trading fee
  orderExpiry: 86400, // 24 hours in seconds
};

// Peak hours definition
export const PEAK_HOURS = {
  morning: { start: 6, end: 9 },
  evening: { start: 18, end: 21 }
};

// Helper function to check if current time is peak hours
export const isPeakHours = () => {
  const hour = new Date().getHours();
  return (
    (hour >= PEAK_HOURS.morning.start && hour < PEAK_HOURS.morning.end) ||
    (hour >= PEAK_HOURS.evening.start && hour < PEAK_HOURS.evening.end)
  );
};

// Helper function to format BDAG amounts
export const formatBDAG = (amount, decimals = 2) => {
  return parseFloat(amount).toFixed(decimals) + ' BDAG';
};

// Helper function to format kWh amounts
export const formatKWH = (amount, decimals = 1) => {
  return parseFloat(amount).toFixed(decimals) + ' kWh';
};

export default {
  CONTRACT_ABIS,
  CONTRACT_ADDRESSES,
  NETWORK_CONFIG,
  INCENTIVE_CONFIG,
  TRADING_CONFIG,
  PEAK_HOURS,
  isPeakHours,
  formatBDAG,
  formatKWH,
};