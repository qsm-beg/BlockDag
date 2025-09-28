import { ethers } from 'ethers';

// BlockDAG Testnet Configuration
const BLOCKDAG_CONFIG = {
  rpcUrl: 'https://rpc-testnet-v2.blockdag.network',
  chainId: 20000,
  explorerUrl: 'https://awakening.bdagscan.com',
  symbol: 'BDAG',
  name: 'BlockDAG Testnet',
};

// Mock addresses for demo
const MOCK_ADDRESSES = {
  gridSmartIncentives: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb8',
  energyTrading: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  treasury: '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199',
};

class BlockDAGService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.account = null;
    this.isConnected = false;
    this.isSimulationMode = true; // Always true due to faucet issues
    this.mockBalance = '1000'; // Mock BDAG balance
    this.pendingTransactions = new Map();
  }

  // Initialize connection to BlockDAG
  async connect() {
    try {
      // Connect to BlockDAG RPC (read-only)
      this.provider = new ethers.providers.JsonRpcProvider(BLOCKDAG_CONFIG.rpcUrl);

      // Verify connection
      const network = await this.provider.getNetwork();
      console.log('Connected to BlockDAG:', network);

      // Generate mock account for demo
      this.account = '0x' + '1234567890abcdef'.repeat(2) + '12345678';
      this.isConnected = true;

      return {
        success: true,
        account: this.account,
        chainId: network.chainId,
        balance: this.mockBalance,
      };
    } catch (error) {
      console.error('BlockDAG connection error:', error);
      // Fallback to fully mock mode
      this.isConnected = false;
      this.account = '0x' + '1234567890abcdef'.repeat(2) + '12345678';

      return {
        success: true,
        account: this.account,
        chainId: BLOCKDAG_CONFIG.chainId,
        balance: this.mockBalance,
        mode: 'simulation',
      };
    }
  }

  // Get current network info
  async getNetworkInfo() {
    try {
      if (this.provider) {
        const blockNumber = await this.provider.getBlockNumber();
        const gasPrice = await this.provider.getGasPrice();

        return {
          blockNumber,
          gasPrice: ethers.utils.formatUnits(gasPrice, 'gwei'),
          chainId: BLOCKDAG_CONFIG.chainId,
          name: BLOCKDAG_CONFIG.name,
          connected: true,
        };
      }
    } catch (error) {
      console.log('Using fallback network info');
    }

    // Fallback mock data
    return {
      blockNumber: 1234567 + Math.floor(Date.now() / 10000),
      gasPrice: '0.1',
      chainId: BLOCKDAG_CONFIG.chainId,
      name: BLOCKDAG_CONFIG.name,
      connected: false,
    };
  }

  // Get transformer load data (mock + chain interaction)
  async getTransformerLoad() {
    const baseLoad = 70 + Math.sin(Date.now() / 10000) * 15;
    const peakMultiplier = this.isPeakHours() ? 1.3 : 1.0;
    const currentLoad = Math.min(95, baseLoad * peakMultiplier);

    // Try to get real block data for authenticity
    let blockNumber = 0;
    try {
      if (this.provider) {
        blockNumber = await this.provider.getBlockNumber();
      }
    } catch (error) {
      blockNumber = 1234567 + Math.floor(Date.now() / 10000);
    }

    return {
      currentLoad: currentLoad.toFixed(1),
      maxCapacity: 100,
      status: currentLoad > 85 ? 'critical' : currentLoad > 70 ? 'warning' : 'normal',
      timestamp: Date.now(),
      blockNumber,
      predictions: {
        next1Hour: Math.min(95, currentLoad + Math.random() * 5).toFixed(1),
        next4Hours: Math.min(95, currentLoad + Math.random() * 10).toFixed(1),
        next8Hours: Math.min(95, currentLoad - Math.random() * 5).toFixed(1),
      },
    };
  }

  // Commit to reduce energy usage (simulated transaction)
  async commitReduction(kwhAmount) {
    const txHash = this.generateMockTxHash();
    const timestamp = Date.now();

    // Create mock transaction object
    const mockTx = {
      hash: txHash,
      from: this.account,
      to: MOCK_ADDRESSES.gridSmartIncentives,
      value: '0',
      data: this.encodeFunctionData('commitReduction', [kwhAmount]),
      nonce: Math.floor(Math.random() * 100),
      gasPrice: ethers.utils.parseUnits('0.1', 'gwei'),
      gasLimit: 100000,
      chainId: BLOCKDAG_CONFIG.chainId,
    };

    // Store pending transaction
    this.pendingTransactions.set(txHash, {
      ...mockTx,
      status: 'pending',
      timestamp,
      type: 'reduction_commitment',
      kwhAmount,
    });

    // Simulate confirmation after 3 seconds
    setTimeout(() => {
      const tx = this.pendingTransactions.get(txHash);
      if (tx) {
        tx.status = 'confirmed';
        tx.blockNumber = 1234567 + Math.floor(Date.now() / 10000);
        tx.blockHash = this.generateMockTxHash();
      }
    }, 3000);

    return {
      hash: txHash,
      explorerUrl: `${BLOCKDAG_CONFIG.explorerUrl}/tx/${txHash}`,
      status: 'pending',
      kwhCommitted: kwhAmount,
      estimatedReward: this.calculateReward(kwhAmount),
    };
  }

  // Create energy trade (simulated transaction)
  async createEnergyTrade(type, amount, pricePerKwh) {
    const txHash = this.generateMockTxHash();
    const timestamp = Date.now();

    const mockTx = {
      hash: txHash,
      from: this.account,
      to: MOCK_ADDRESSES.energyTrading,
      value: type === 'buy' ? ethers.utils.parseEther((amount * pricePerKwh).toString()) : '0',
      data: this.encodeFunctionData('createTrade', [type, amount, pricePerKwh]),
      nonce: Math.floor(Math.random() * 100),
      gasPrice: ethers.utils.parseUnits('0.1', 'gwei'),
      gasLimit: 150000,
      chainId: BLOCKDAG_CONFIG.chainId,
    };

    this.pendingTransactions.set(txHash, {
      ...mockTx,
      status: 'pending',
      timestamp,
      type: 'energy_trade',
      tradeType: type,
      amount,
      pricePerKwh,
    });

    // Simulate confirmation
    setTimeout(() => {
      const tx = this.pendingTransactions.get(txHash);
      if (tx) {
        tx.status = 'confirmed';
        tx.blockNumber = 1234567 + Math.floor(Date.now() / 10000);
        tx.blockHash = this.generateMockTxHash();
      }
    }, 2500);

    return {
      hash: txHash,
      explorerUrl: `${BLOCKDAG_CONFIG.explorerUrl}/tx/${txHash}`,
      status: 'pending',
      type,
      amount,
      pricePerKwh,
      totalValue: amount * pricePerKwh,
    };
  }

  // Get user's incentive stats
  async getUserIncentiveStats() {
    // Simulate fetching from blockchain
    const totalReductions = Math.floor(Math.random() * 50) + 10;
    const totalRewards = (totalReductions * 2.5).toFixed(2);
    const currentCommitments = Math.floor(Math.random() * 3);

    return {
      address: this.account,
      totalReductions: `${totalReductions} kWh`,
      totalRewards: `${totalRewards} BDAG`,
      currentCommitments,
      rewardRate: '2.5 BDAG/kWh',
      nextRewardTime: Date.now() + 3600000, // 1 hour from now
      rank: Math.floor(Math.random() * 100) + 1,
    };
  }

  // Get available energy trades
  async getAvailableTrades() {
    // Generate mock trades
    const trades = [];
    const numTrades = 5 + Math.floor(Math.random() * 5);

    for (let i = 0; i < numTrades; i++) {
      trades.push({
        id: this.generateMockTxHash().substring(0, 10),
        seller: '0x' + Math.random().toString(16).substring(2, 10).padEnd(40, '0'),
        amount: Math.floor(Math.random() * 20) + 5,
        pricePerKwh: (0.5 + Math.random() * 0.3).toFixed(2),
        source: Math.random() > 0.5 ? 'solar' : 'battery',
        available: true,
        expiresIn: Math.floor(Math.random() * 3600) + 600,
      });
    }

    return trades.sort((a, b) => parseFloat(a.pricePerKwh) - parseFloat(b.pricePerKwh));
  }

  // Get transaction status
  async getTransactionStatus(txHash) {
    const tx = this.pendingTransactions.get(txHash);

    if (tx) {
      return {
        hash: txHash,
        status: tx.status,
        blockNumber: tx.blockNumber,
        from: tx.from,
        to: tx.to,
        type: tx.type,
        timestamp: tx.timestamp,
        explorerUrl: `${BLOCKDAG_CONFIG.explorerUrl}/tx/${txHash}`,
      };
    }

    // Return mock confirmed transaction
    return {
      hash: txHash,
      status: 'confirmed',
      blockNumber: 1234567,
      from: this.account,
      to: MOCK_ADDRESSES.gridSmartIncentives,
      explorerUrl: `${BLOCKDAG_CONFIG.explorerUrl}/tx/${txHash}`,
    };
  }

  // Claim rewards (simulated)
  async claimRewards() {
    const rewardAmount = (Math.random() * 10 + 5).toFixed(2);
    const txHash = this.generateMockTxHash();

    this.pendingTransactions.set(txHash, {
      hash: txHash,
      from: MOCK_ADDRESSES.treasury,
      to: this.account,
      value: ethers.utils.parseEther(rewardAmount),
      status: 'pending',
      timestamp: Date.now(),
      type: 'reward_claim',
      rewardAmount,
    });

    setTimeout(() => {
      const tx = this.pendingTransactions.get(txHash);
      if (tx) {
        tx.status = 'confirmed';
        tx.blockNumber = 1234567 + Math.floor(Date.now() / 10000);
      }
    }, 3000);

    return {
      hash: txHash,
      amount: rewardAmount,
      explorerUrl: `${BLOCKDAG_CONFIG.explorerUrl}/tx/${txHash}`,
      status: 'pending',
    };
  }

  // Helper functions
  generateMockTxHash() {
    return '0x' + Array(64).fill(0).map(() =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }

  encodeFunctionData(functionName, params) {
    // Simulate encoded function data
    const funcSig = ethers.utils.id(functionName).substring(0, 10);
    const paramsHex = params.map(p =>
      ethers.utils.hexZeroPad(ethers.utils.hexlify(p), 32).substring(2)
    ).join('');
    return funcSig + paramsHex;
  }

  calculateReward(kwhAmount) {
    const baseRate = 2.5; // BDAG per kWh
    const peakBonus = this.isPeakHours() ? 1.5 : 1.0;
    return (kwhAmount * baseRate * peakBonus).toFixed(2);
  }

  isPeakHours() {
    const hour = new Date().getHours();
    return (hour >= 6 && hour <= 9) || (hour >= 18 && hour <= 21);
  }

  // Disconnect wallet
  disconnect() {
    this.provider = null;
    this.signer = null;
    this.account = null;
    this.isConnected = false;
    this.pendingTransactions.clear();
  }
}

// Export singleton instance
export default new BlockDAGService();