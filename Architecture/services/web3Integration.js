// services/web3Integration.js
import { ethers } from 'ethers';

/**
 * Web3 Integration Service for GridSmart Energy MVP
 * Handles all blockchain interactions with deployed contracts
 */
class Web3Integration {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.contracts = {};
        this.isConnected = false;
        
        // Contract addresses - UPDATE THESE AFTER DEPLOYMENT
        this.contractAddresses = {
            loadManager: "0x...", // Update with deployed address
            incentiveManager: "0x...", // Update with deployed address
            p2pTrading: "0x..." // Update with deployed address
        };
        
        // BlockDAG Network configuration
        this.networkConfig = {
            chainId: 16118,
            name: "BlockDAG Testnet",
            rpcUrl: "https://rpc-test.blockdagnetwork.io",
            explorer: "https://testnet.bdagscan.com",
            currency: {
                name: "BDAG",
                symbol: "BDAG",
                decimals: 18
            }
        };
    }
    
    /**
     * Connect to wallet using WalletConnect (for mobile)
     */
    async connectWallet() {
        try {
            console.log("🔗 Connecting to wallet...");
            
            // Method 1: MetaMask/Browser Wallet
            if (window.ethereum) {
                await this.connectBrowserWallet();
            } else {
                // Method 2: WalletConnect for mobile
                await this.connectWalletConnect();
            }
            
            await this.initializeContracts();
            this.isConnected = true;
            
            const address = await this.signer.getAddress();
            console.log("✅ Wallet connected:", address);
            
            return {
                success: true,
                address: address,
                network: this.networkConfig.name
            };
            
        } catch (error) {
            console.error("❌ Wallet connection failed:", error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Connect to browser wallet (MetaMask)
     */
    async connectBrowserWallet() {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        this.provider = new ethers.providers.Web3Provider(window.ethereum);
        this.signer = this.provider.getSigner();
        
        // Check if we're on the right network
        const network = await this.provider.getNetwork();
        if (network.chainId !== this.networkConfig.chainId) {
            await this.switchToBlockDAG();
        }
    }
    
    /**
     * Connect using WalletConnect (for mobile)
     */
    async connectWalletConnect() {
        // Note: This requires @walletconnect/web3-provider to be installed
        const WalletConnectProvider = await import("@walletconnect/web3-provider");
        
        const provider = new WalletConnectProvider.default({
            rpc: {
                [this.networkConfig.chainId]: this.networkConfig.rpcUrl
            },
            chainId: this.networkConfig.chainId,
            qrcode: true,
            qrcodeModalOptions: {
                mobileLinks: [
                    "rainbow",
                    "metamask",
                    "argent",
                    "trust",
                    "imtoken",
                    "pillar",
                ]
            }
        });
        
        await provider.enable();
        
        this.provider = new ethers.providers.Web3Provider(provider);
        this.signer = this.provider.getSigner();
    }
    
    /**
     * Switch to BlockDAG network
     */
    async switchToBlockDAG() {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: `0x${this.networkConfig.chainId.toString(16)}` }],
            });
        } catch (switchError) {
            // Network doesn't exist, add it
            if (switchError.code === 4902) {
                await this.addBlockDAGNetwork();
            } else {
                throw switchError;
            }
        }
    }
    
    /**
     * Add BlockDAG network to wallet
     */
    async addBlockDAGNetwork() {
        await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
                chainId: `0x${this.networkConfig.chainId.toString(16)}`,
                chainName: this.networkConfig.name,
                nativeCurrency: this.networkConfig.currency,
                rpcUrls: [this.networkConfig.rpcUrl],
                blockExplorerUrls: [this.networkConfig.explorer]
            }],
        });
    }
    
    /**
     * Initialize contract instances
     */
    async initializeContracts() {
        console.log("📄 Initializing contracts...");
        
        // Load contract ABIs (these would be imported from your compiled contracts)
        const loadManagerABI = await this.loadABI('TransformerLoadManager');
        const incentiveManagerABI = await this.loadABI('IncentiveManager');
        const p2pTradingABI = await this.loadABI('P2PEnergyTrading');
        
        // Create contract instances
        this.contracts.loadManager = new ethers.Contract(
            this.contractAddresses.loadManager,
            loadManagerABI,
            this.provider // Read-only operations
        );
        
        this.contracts.incentiveManager = new ethers.Contract(
            this.contractAddresses.incentiveManager,
            incentiveManagerABI,
            this.signer // Write operations
        );
        
        this.contracts.p2pTrading = new ethers.Contract(
            this.contractAddresses.p2pTrading,
            p2pTradingABI,
            this.signer // Write operations
        );
        
        console.log("✅ Contracts initialized");
    }
    
    /**
     * Load contract ABI (placeholder - implement based on your build process)
     */
    async loadABI(contractName) {
        // In a real app, you'd import these from your compiled artifacts
        // For now, return a minimal ABI structure
        console.log(`Loading ABI for ${contractName}`);
        
        // This is where you'd load the actual ABI from your build artifacts
        // return require(`../artifacts/contracts/${contractName}.sol/${contractName}.json`).abi;
        
        // For MVP, return basic function signatures
        return []; // Replace with actual ABI
    }
    
    // =============================================================================
    // TRANSFORMER LOAD FUNCTIONS
    // =============================================================================
    
    /**
     * Get current transformer load
     */
    async getCurrentLoad() {
        try {
            const load = await this.contracts.loadManager.currentLoad();
            return {
                success: true,
                currentLoad: load.toNumber(),
                timestamp: Date.now()
            };
        } catch (error) {
            console.error("Error getting current load:", error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Get predicted load
     */
    async getPredictedLoad() {
        try {
            const prediction = await this.contracts.loadManager.getLatestPrediction();
            return {
                success: true,
                prediction: prediction.prediction.toNumber(),
                confidence: prediction.confidence.toNumber(),
                timestamp: prediction.timestamp.toNumber()
            };
        } catch (error) {
            console.error("Error getting prediction:", error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Check if load is critical
     */
    async isCriticalLoad() {
        try {
            const isCritical = await this.contracts.loadManager.isCriticalLoad();
            const riskLevel = await this.contracts.loadManager.getRiskLevel();
            
            return {
                success: true,
                isCritical,
                riskLevel
            };
        } catch (error) {
            console.error("Error checking critical load:", error);
            return { success: false, error: error.message };
        }
    }
    
    // =============================================================================
    // INCENTIVE FUNCTIONS
    // =============================================================================
    
    /**
     * Commit to energy reduction
     */
    async commitToReduction(kwhAmount) {
        try {
            console.log(`💡 Committing to reduce ${kwhAmount} kWh...`);
            
            const tx = await this.contracts.incentiveManager.commitToReduction(kwhAmount);
            console.log("Transaction sent:", tx.hash);
            
            const receipt = await tx.wait();
            console.log("✅ Commitment confirmed!");
            
            return {
                success: true,
                txHash: tx.hash,
                blockNumber: receipt.blockNumber
            };
        } catch (error) {
            console.error("Error committing to reduction:", error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Get pending rewards
     */
    async getPendingRewards(address) {
        try {
            const rewards = await this.contracts.incentiveManager.pendingRewards(
                address || await this.signer.getAddress()
            );
            
            return {
                success: true,
                pendingRewards: ethers.utils.formatEther(rewards),
                pendingRewardsWei: rewards.toString()
            };
        } catch (error) {
            console.error("Error getting pending rewards:", error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Claim rewards
     */
    async claimRewards() {
        try {
            console.log("💰 Claiming rewards...");
            
            const tx = await this.contracts.incentiveManager.claimRewards();
            console.log("Transaction sent:", tx.hash);
            
            const receipt = await tx.wait();
            console.log("✅ Rewards claimed!");
            
            return {
                success: true,
                txHash: tx.hash,
                blockNumber: receipt.blockNumber
            };
        } catch (error) {
            console.error("Error claiming rewards:", error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Get user stats
     */
    async getUserStats(address) {
        try {
            const userAddress = address || await this.signer.getAddress();
            const stats = await this.contracts.incentiveManager.userStats(userAddress);
            
            return {
                success: true,
                totalReduced: ethers.utils.formatEther(stats.totalReduced),
                totalEarned: ethers.utils.formatEther(stats.totalEarned),
                successfulCommitments: stats.successfulCommitments.toNumber()
            };
        } catch (error) {
            console.error("Error getting user stats:", error);
            return { success: false, error: error.message };
        }
    }
    
    // =============================================================================
    // P2P TRADING FUNCTIONS
    // =============================================================================
    
    /**
     * List energy for sale
     */
    async listEnergy(amountKwh, pricePerKwh, durationHours, location) {
        try {
            console.log(`🔄 Listing ${amountKwh} kWh for sale...`);
            
            const priceWei = ethers.utils.parseEther(pricePerKwh.toString());
            const tx = await this.contracts.p2pTrading.listEnergy(
                amountKwh,
                priceWei,
                durationHours,
                location
            );
            
            console.log("Transaction sent:", tx.hash);
            const receipt = await tx.wait();
            console.log("✅ Energy listed!");
            
            return {
                success: true,
                txHash: tx.hash,
                blockNumber: receipt.blockNumber
            };
        } catch (error) {
            console.error("Error listing energy:", error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Buy energy from listing
     */
    async buyEnergy(listingId, amountKwh) {
        try {
            console.log(`🛒 Buying ${amountKwh} kWh from listing ${listingId}...`);
            
            // Get listing details to calculate price
            const listing = await this.contracts.p2pTrading.getListingDetails(listingId);
            const totalPrice = listing.pricePerKwh.mul(amountKwh);
            
            const tx = await this.contracts.p2pTrading.buyEnergy(
                listingId,
                amountKwh,
                { value: totalPrice }
            );
            
            console.log("Transaction sent:", tx.hash);
            const receipt = await tx.wait();
            console.log("✅ Energy purchased!");
            
            return {
                success: true,
                txHash: tx.hash,
                blockNumber: receipt.blockNumber,
                totalPaid: ethers.utils.formatEther(totalPrice)
            };
        } catch (error) {
            console.error("Error buying energy:", error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Get active energy listings
     */
    async getActiveListings() {
        try {
            const activeListingIds = await this.contracts.p2pTrading.getActiveListings();
            const listings = [];
            
            for (const id of activeListingIds) {
                const details = await this.contracts.p2pTrading.getListingDetails(id);
                listings.push({
                    id: id.toNumber(),
                    seller: details.seller,
                    amountKwh: details.amountKwh.toNumber(),
                    pricePerKwh: ethers.utils.formatEther(details.pricePerKwh),
                    expiryTime: new Date(details.expiryTime.toNumber() * 1000),
                    location: details.location,
                    active: details.active
                });
            }
            
            return {
                success: true,
                listings
            };
        } catch (error) {
            console.error("Error getting active listings:", error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Get user's trading history
     */
    async getUserTrades(address) {
        try {
            const userAddress = address || await this.signer.getAddress();
            const tradeIds = await this.contracts.p2pTrading.getUserTrades(userAddress);
            const trades = [];
            
            for (const id of tradeIds) {
                const details = await this.contracts.p2pTrading.getTradeDetails(id);
                trades.push({
                    id: id.toNumber(),
                    listingId: details.listingId.toNumber(),
                    buyer: details.buyer,
                    seller: details.seller,
                    amountKwh: details.amountKwh.toNumber(),
                    totalPrice: ethers.utils.formatEther(details.totalPrice),
                    timestamp: new Date(details.timestamp.toNumber() * 1000)
                });
            }
            
            return {
                success: true,
                trades
            };
        } catch (error) {
            console.error("Error getting user trades:", error);
            return { success: false, error: error.message };
        }
    }
    
    // =============================================================================
    // EVENT LISTENERS FOR REAL-TIME UPDATES
    // =============================================================================
    
    /**
     * Subscribe to transformer load updates
     */
    subscribeToLoadUpdates(callback) {
        if (!this.contracts.loadManager) {
            console.error("Contract not initialized");
            return;
        }
        
        console.log("📡 Subscribing to load updates...");
        
        this.contracts.loadManager.on("LoadUpdated", (load, timestamp, event) => {
            const data = {
                load: load.toNumber(),
                timestamp: timestamp.toNumber() * 1000, // Convert to milliseconds
                blockNumber: event.blockNumber,
                txHash: event.transactionHash
            };
            
            console.log("📊 Load update received:", data);
            callback(data);
        });
        
        // Also subscribe to critical warnings
        this.contracts.loadManager.on("CriticalLoadWarning", (load, incentiveRate, event) => {
            const warning = {
                type: "CRITICAL_WARNING",
                load: load.toNumber(),
                incentiveRate: ethers.utils.formatEther(incentiveRate),
                timestamp: Date.now(),
                blockNumber: event.blockNumber
            };
            
            console.log("⚠️ Critical load warning:", warning);
            callback(warning);
        });
    }
    
    /**
     * Subscribe to prediction updates
     */
    subscribeToPredictions(callback) {
        if (!this.contracts.loadManager) {
            console.error("Contract not initialized");
            return;
        }
        
        console.log("🔮 Subscribing to predictions...");
        
        this.contracts.loadManager.on("PredictionMade", (predicted, confidence, event) => {
            const prediction = {
                type: "PREDICTION",
                predictedLoad: predicted.toNumber(),
                confidence: confidence.toNumber(),
                timestamp: Date.now(),
                blockNumber: event.blockNumber
            };
            
            console.log("🔮 New prediction:", prediction);
            callback(prediction);
        });
    }
    
    /**
     * Subscribe to incentive events
     */
    subscribeToIncentiveEvents(callback) {
        if (!this.contracts.incentiveManager) {
            console.error("Contract not initialized");
            return;
        }
        
        console.log("💰 Subscribing to incentive events...");
        
        // Commitment events
        this.contracts.incentiveManager.on("CommitmentMade", (user, kwhToReduce, rate, event) => {
            const commitment = {
                type: "COMMITMENT",
                user,
                kwhToReduce: kwhToReduce.toNumber(),
                rate: rate.toNumber(),
                timestamp: Date.now(),
                blockNumber: event.blockNumber
            };
            
            console.log("💡 New commitment:", commitment);
            callback(commitment);
        });
        
        // Reward events
        this.contracts.incentiveManager.on("RewardsPaid", (user, amount, event) => {
            const reward = {
                type: "REWARD_PAID",
                user,
                amount: ethers.utils.formatEther(amount),
                timestamp: Date.now(),
                blockNumber: event.blockNumber
            };
            
            console.log("💰 Reward paid:", reward);
            callback(reward);
        });
    }
    
    /**
     * Subscribe to trading events
     */
    subscribeToTradingEvents(callback) {
        if (!this.contracts.p2pTrading) {
            console.error("Contract not initialized");
            return;
        }
        
        console.log("🔄 Subscribing to trading events...");
        
        // Energy listed events
        this.contracts.p2pTrading.on("EnergyListed", (listingId, seller, amount, price, event) => {
            const listing = {
                type: "ENERGY_LISTED",
                listingId: listingId.toNumber(),
                seller,
                amount: amount.toNumber(),
                price: ethers.utils.formatEther(price),
                timestamp: Date.now(),
                blockNumber: event.blockNumber
            };
            
            console.log("📋 Energy listed:", listing);
            callback(listing);
        });
        
        // Trade executed events
        this.contracts.p2pTrading.on("TradExecuted", 
            (tradeId, listingId, buyer, seller, event) => {
                const trade = {
                    type: "TRADE_EXECUTED",
                    tradeId: tradeId.toNumber(),
                    listingId: listingId.toNumber(),
                    buyer,
                    seller,
                    timestamp: Date.now(),
                    blockNumber: event.blockNumber
                };
                
                console.log("✅ Trade executed:", trade);
                callback(trade);
            }
        );
    }
    
    // =============================================================================
    // UTILITY FUNCTIONS
    // =============================================================================
    
    /**
     * Get user's wallet balance
     */
    async getBalance(address) {
        try {
            const userAddress = address || await this.signer.getAddress();
            const balance = await this.provider.getBalance(userAddress);
            
            return {
                success: true,
                balance: ethers.utils.formatEther(balance),
                balanceWei: balance.toString()
            };
        } catch (error) {
            console.error("Error getting balance:", error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Get current gas price
     */
    async getGasPrice() {
        try {
            const gasPrice = await this.provider.getGasPrice();
            return {
                success: true,
                gasPrice: ethers.utils.formatUnits(gasPrice, "gwei"),
                gasPriceWei: gasPrice.toString()
            };
        } catch (error) {
            console.error("Error getting gas price:", error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Disconnect wallet
     */
    async disconnect() {
        try {
            // Remove event listeners
            if (this.contracts.loadManager) {
                this.contracts.loadManager.removeAllListeners();
            }
            if (this.contracts.incentiveManager) {
                this.contracts.incentiveManager.removeAllListeners();
            }
            if (this.contracts.p2pTrading) {
                this.contracts.p2pTrading.removeAllListeners();
            }
            
            // Clear instances
            this.provider = null;
            this.signer = null;
            this.contracts = {};
            this.isConnected = false;
            
            console.log("🔌 Wallet disconnected");
            return { success: true };
            
        } catch (error) {
            console.error("Error disconnecting:", error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Check if wallet is connected
     */
    isWalletConnected() {
        return this.isConnected && this.signer !== null;
    }
    
    /**
     * Get current network info
     */
    async getNetworkInfo() {
        if (!this.provider) {
            return { success: false, error: "No provider connected" };
        }
        
        try {
            const network = await this.provider.getNetwork();
            return {
                success: true,
                chainId: network.chainId,
                name: network.name,
                isCorrectNetwork: network.chainId === this.networkConfig.chainId
            };
        } catch (error) {
            console.error("Error getting network info:", error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Update contract addresses (call this after deployment)
     */
    updateContractAddresses(addresses) {
        this.contractAddresses = { ...this.contractAddresses, ...addresses };
        console.log("📄 Contract addresses updated:", this.contractAddresses);
    }
}

// Export singleton instance
const web3Integration = new Web3Integration();
export default web3Integration;

// Also export class for testing
export { Web3Integration };