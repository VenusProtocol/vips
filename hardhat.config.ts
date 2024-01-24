import "@nomicfoundation/hardhat-chai-matchers";
import "@nomiclabs/hardhat-ethers";
import { ethers } from "ethers";
import fs from "fs";
import { HardhatUserConfig, task } from "hardhat/config";

require("dotenv").config();
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task("run-script", "Runs a hardhard script by name")
  .addParam("path", "Path within script/hardhat to script")
  .setAction(async (taskArgs: { path: string }) => {
    let main;
    try {
      main = require(`./script/hardhat/${taskArgs.path}`);
    } catch (error) {
      console.log("Make sure you pass an existing script path. Available scripts:");
      fs.readdirSync("./script/hardhat", { withFileTypes: true }).forEach((file: fs.Dirent) => {
        // Some directories don't contain files that can be run this way
        const excludeDirs = ["simulations", "utils", "vips"];
        if (file.isDirectory() && !excludeDirs.includes(file.name)) {
          console.log(`${file.name}/`);
          fs.readdirSync(`./script/hardhat/${file.name}`).forEach((file: string) => {
            console.log(`  ${file}`);
          });
        }
      });
    }

    if (main) {
      await main()
        .then(() => process.exit(0))
        .catch((error: Error) => {
          console.error(error);
          process.exit(1);
        });
    }
  });

const BLOCK_GAS_LIMIT_PER_NETWORK = {
  bsctestnet: 140000000,
  bscmainnet: 140000000,
  sepolia: 30000000,
  ethereum: 30000000,
  opbnbtestnet: 100000000,
  opbnbmainnet: 100000000,
};

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: isFork(),
    bsctestnet: {
      url: process.env.ARCHIVE_NODE_bsctestnet || "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      accounts: DEPLOYER_PRIVATE_KEY ? [`0x${DEPLOYER_PRIVATE_KEY}`] : [],
      gasPrice: ethers.utils.parseUnits("10", "gwei").toNumber(),
      gasMultiplier: 10,
      timeout: 12000000,
      blockGasLimit: BLOCK_GAS_LIMIT_PER_NETWORK.bsctestnet,
    },
    bscmainnet: {
      url: process.env.ARCHIVE_NODE_bscmainnet || "https://bsc-dataseed.binance.org/",
      accounts: DEPLOYER_PRIVATE_KEY ? [`0x${DEPLOYER_PRIVATE_KEY}`] : [],
      blockGasLimit: BLOCK_GAS_LIMIT_PER_NETWORK.bscmainnet,
    },
    sepolia: {
      url: process.env.ARCHIVE_NODE_sepolia || "https://ethereum-sepolia.blockpi.network/v1/rpc/public",
      chainId: 11155111,
      accounts: DEPLOYER_PRIVATE_KEY ? [`0x${DEPLOYER_PRIVATE_KEY}`] : [],
      blockGasLimit: BLOCK_GAS_LIMIT_PER_NETWORK.sepolia,
    },
    ethereum: {
      url: process.env.ARCHIVE_NODE_ethereum || "https://ethereum.blockpi.network/v1/rpc/public",
      chainId: 1,
      accounts: DEPLOYER_PRIVATE_KEY ? [`0x${DEPLOYER_PRIVATE_KEY}`] : [],
      blockGasLimit: BLOCK_GAS_LIMIT_PER_NETWORK.ethereum,
    },
    opbnbtestnet: {
      url: process.env.ARCHIVE_NODE_opbnbtestnet || "https://opbnb-testnet-rpc.bnbchain.org",
      chainId: 5611,
      accounts: DEPLOYER_PRIVATE_KEY ? [`0x${DEPLOYER_PRIVATE_KEY}`] : [],
      blockGasLimit: BLOCK_GAS_LIMIT_PER_NETWORK.opbnbtestnet,
    },
    opbnbmainnet: {
      url: process.env.ARCHIVE_NODE_opbnbtestnet || "https://opbnb-mainnet-rpc.bnbchain.org",
      chainId: 204,
      accounts: DEPLOYER_PRIVATE_KEY ? [`0x${DEPLOYER_PRIVATE_KEY}`] : [],
      blockGasLimit: BLOCK_GAS_LIMIT_PER_NETWORK.opbnbmainnet,
    },
  },
  paths: {
    tests: "./tests",
  },
  mocha: {
    timeout: 200000000,
  },
};

function isFork() {
  return process.env.FORK === "true"
    ? {
        allowUnlimitedContractSize: false,
        loggingEnabled: false,
        forking: {
          url: process.env[`ARCHIVE_NODE_${process.env.FORKED_NETWORK}`],
        },
        accounts: {
          accountsBalance: "100000000000000000000000",
        },
        live: false,
        gas: "auto",
        blockGasLimit: BLOCK_GAS_LIMIT_PER_NETWORK[[process.env.FORKED_NETWORK]].blockGasLimit,
      }
    : {
        allowUnlimitedContractSize: true,
        loggingEnabled: false,
        live: false,
      };
}

export default config;
