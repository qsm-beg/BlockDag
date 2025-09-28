// scripts/deploy.js
const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
    console.log("🚀 Deploying GridSmart Energy System to BlockDAG Testnet...");
    
    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
    
    // Check balance
    const balance = await deployer.getBalance();
    console.log("Account balance:", ethers.utils.formatEther(balance), "BDAG");
    
    if (balance.lt(ethers.utils.parseEther("0.1"))) {
        console.log("⚠️  Low balance! Get testnet tokens from: https://awakening.bdagscan.com/faucet");
    }
    
    try {
        // 1. Deploy TransformerLoadManager
        console.log("\n📊 Deploying TransformerLoadManager...");
        const TransformerLoadManager = await ethers.getContractFactory("TransformerLoadManager");
        const loadManager = await TransformerLoadManager.deploy();
        await loadManager.deployed();
        
        console.log("✅ TransformerLoadManager deployed to:", loadManager.address);
        
        // 2. Deploy IncentiveManager
        console.log("\n💰 Deploying IncentiveManager...");
        const IncentiveManager = await ethers.getContractFactory("IncentiveManager");
        const incentiveManager = await IncentiveManager.deploy();
        await incentiveManager.deployed();
        
        console.log("✅ IncentiveManager deployed to:", incentiveManager.address);
        
        // 3. Deploy P2PEnergyTrading
        console.log("\n🔄 Deploying P2PEnergyTrading...");
        const P2PEnergyTrading = await ethers.getContractFactory("P2PEnergyTrading");
        const energyTrading = await P2PEnergyTrading.deploy();
        await energyTrading.deployed();
        
        console.log("✅ P2PEnergyTrading deployed to:", energyTrading.address);
        
        // 4. Set up contract relationships
        console.log("\n🔗 Setting up contract relationships...");
        await incentiveManager.setLoadManager(loadManager.address);
        console.log("✅ IncentiveManager connected to LoadManager");
        
        // 5. Fund the incentive pool with test tokens
        console.log("\n💵 Funding incentive pool...");
        const fundAmount = ethers.utils.parseEther("10"); // 10 BDAG for testing
        await incentiveManager.fundRewardsPool({ value: fundAmount });
        console.log("✅ Funded incentive pool with 10 BDAG");
        
        // 6. Initialize with some demo data
        console.log("\n🎭 Initializing with demo data...");
        
        // Set initial transformer load
        await loadManager.updateCurrentLoad(55); // 55% load
        await loadManager.submitPrediction(72, 85); // Predict 72% load with 85% confidence
        console.log("✅ Initial transformer data set");
        
        // Create a sample energy listing
        await energyTrading.listEnergy(
            5, // 5 kWh
            ethers.utils.parseEther("0.001"), // 0.001 BDAG per kWh
            24, // 24 hours
            "Cape Town, Woodstock"
        );
        console.log("✅ Sample energy listing created");
        
        // 7. Save deployment information
        const deploymentInfo = {
            network: "BlockDAG Testnet",
            chainId: 16118,
            deployedAt: new Date().toISOString(),
            deployer: deployer.address,
            contracts: {
                TransformerLoadManager: {
                    address: loadManager.address,
                    explorer: `https://testnet.bdagscan.com/address/${loadManager.address}`
                },
                IncentiveManager: {
                    address: incentiveManager.address,
                    explorer: `https://testnet.bdagscan.com/address/${incentiveManager.address}`
                },
                P2PEnergyTrading: {
                    address: energyTrading.address,
                    explorer: `https://testnet.bdagscan.com/address/${energyTrading.address}`
                }
            },
            setup: {
                initialLoad: 55,
                predictedLoad: 72,
                incentivePoolFunded: "10 BDAG",
                sampleListingCreated: true
            },
            resources: {
                faucet: "https://awakening.bdagscan.com/faucet",
                explorer: "https://testnet.bdagscan.com",
                docs: "https://docs.blockdagnetwork.io/"
            }
        };
        
        // Save to file
        fs.writeFileSync(
            "./deployment-info.json",
            JSON.stringify(deploymentInfo, null, 2)
        );
        
        console.log("\n🎉 Deployment Complete!");
        console.log("=" * 60);
        console.log("📄 Contract addresses saved to: deployment-info.json");
        console.log("\n🔍 View contracts on BlockDAG Explorer:");
        console.log("TransformerLoadManager:", deploymentInfo.contracts.TransformerLoadManager.explorer);
        console.log("IncentiveManager:", deploymentInfo.contracts.IncentiveManager.explorer);
        console.log("P2PEnergyTrading:", deploymentInfo.contracts.P2PEnergyTrading.explorer);
        
        console.log("\n🛠️ Next Steps:");
        console.log("1. Update frontend with contract addresses from deployment-info.json");
        console.log("2. Copy ABIs from artifacts/contracts/ to frontend");
        console.log("3. Test basic functions:");
        console.log("   - Check transformer load");
        console.log("   - Make a reduction commitment");
        console.log("   - List/buy energy");
        
        console.log("\n🎮 Demo Ready! Your MVP is deployed and functional.");
        
    } catch (error) {
        console.error("❌ Deployment failed:", error);
        
        if (error.code === 'INSUFFICIENT_FUNDS') {
            console.log("\n💡 Solution: Get testnet tokens from https://awakening.bdagscan.com/faucet");
        } else if (error.code === 'NETWORK_ERROR') {
            console.log("\n💡 Solution: Check BlockDAG RPC URL in hardhat.config.js");
        }
        
        process.exit(1);
    }
}

// Run deployment
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });