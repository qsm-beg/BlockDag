require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  
  networks: {
    // BlockDAG Testnet configuration
    blockdag_testnet: {
      url: process.env.BLOCKDAG_RPC_URL || "https://rpc-test.blockdagnetwork.io",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 16118, // BlockDAG testnet chain ID (verify from docs)
      gasPrice: 20000000000, // 20 gwei
      gas: 8000000, // Block gas limit
      timeout: 60000 // 60 seconds timeout
    },
    
    // Local development
    hardhat: {
      chainId: 31337,
      accounts: {
        count: 10,
        accountsBalance: "10000000000000000000000" // 10k ETH per account
      }
    },
    
    // For testing without BlockDAG
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337
    }
  },
  
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  
  // Etherscan verification (for BlockDAG explorer if supported)
  etherscan: {
    apiKey: {
      // Add BlockDAG explorer API key if available
      blockdag_testnet: process.env.BLOCKDAG_API_KEY || "dummy"
    },
    customChains: [
      {
        network: "blockdag_testnet",
        chainId: 16118,
        urls: {
          apiURL: "https://api.testnet.bdagscan.com/api",
          browserURL: "https://testnet.bdagscan.com"
        }
      }
    ]
  },
  
  // Gas reporter for optimization
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD"
  },
  
  // Mocha test configuration
  mocha: {
    timeout: 40000
  }
};