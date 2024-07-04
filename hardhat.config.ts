import "@nomicfoundation/hardhat-chai-matchers";
import "@nomiclabs/hardhat-ethers";
import * as dotenv from "dotenv";
import { ethers } from "ethers";
import { HardhatUserConfig, task } from "hardhat/config";

import "./type-extensions";

dotenv.config();
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

const BLOCK_GAS_LIMIT_PER_NETWORK = {
  bsctestnet: 140000000,
  bscmainnet: 140000000,
  sepolia: 30000000,
  ethereum: 30000000,
  opbnbtestnet: 100000000,
  opbnbmainnet: 100000000,
  arbitrumsepolia: 30000000,
  arbitrumone: 30000000,
  xlayertestnet: 30000000,
  opsepolia: 30000000,
  opmainnet: 30000000,
};

task("propose", "Propose proposal")
  .addPositionalParam("proposalPath", "Proposal path to pass to script")
  .setAction(async function (taskArguments) {
    const { proposalPath } = taskArguments;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const proposeVip = require("./scripts/proposeVIP").default;
    await proposeVip(proposalPath);
  });

task("multisig", "Execute multisig vip")
  .addPositionalParam("proposalPath", "Proposal path to pass to script")
  .setAction(async function (taskArguments) {
    const { proposalPath } = taskArguments;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const executeMultiSigTx = require("./scripts/executeMultiSigTx.ts").default;
    await executeMultiSigTx(proposalPath);
  });

task("test", "Update fork config")
  .addOptionalParam("fork", "Network to fork")
  .setAction(async function (taskArguments, hre, runSuper) {
    const { fork } = taskArguments;
    const hardhatConfig = fork
      ? {
          allowUnlimitedContractSize: false,
          loggingEnabled: false,
          forking: {
            enabled: true,
            url: process.env[`ARCHIVE_NODE_${fork}`] as string,
          },
          gas: "auto" as const,
          blockGasLimit: BLOCK_GAS_LIMIT_PER_NETWORK[fork as keyof typeof BLOCK_GAS_LIMIT_PER_NETWORK],
        }
      : {
          allowUnlimitedContractSize: true,
          loggingEnabled: false,
        };
    hre.config.networks.hardhat = { ...hre.config.networks.hardhat, ...hardhatConfig };
    hre.FORKED_NETWORK = fork;

    await runSuper(taskArguments);
  });

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
      loggingEnabled: false,
    },
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
      url: process.env.ARCHIVE_NODE_opbnbmainnet || "https://opbnb-mainnet-rpc.bnbchain.org",
      chainId: 204,
      accounts: DEPLOYER_PRIVATE_KEY ? [`0x${DEPLOYER_PRIVATE_KEY}`] : [],
      blockGasLimit: BLOCK_GAS_LIMIT_PER_NETWORK.opbnbmainnet,
    },
    arbitrumsepolia: {
      url: process.env.ARCHIVE_NODE_arbitrumsepolia || "https://sepolia-rollup.arbitrum.io/rpc",
      chainId: 421614,
      accounts: DEPLOYER_PRIVATE_KEY ? [`0x${DEPLOYER_PRIVATE_KEY}`] : [],
    },
    arbitrumone: {
      url: process.env.ARCHIVE_NODE_arbitrumone || "https://arb1.arbitrum.io/rpc",
      chainId: 42161,
      accounts: DEPLOYER_PRIVATE_KEY ? [`0x${DEPLOYER_PRIVATE_KEY}`] : [],
    },
    xlayertestnet: {
      url: process.env.ARCHIVE_NODE_xlayertestnet || "https://testrpc.xlayer.tech/",
      chainId: 195,
      accounts: DEPLOYER_PRIVATE_KEY ? [`0x${DEPLOYER_PRIVATE_KEY}`] : [],
    },
    xlayermainnet: {
      url: process.env.ARCHIVE_NODE_xlayermainnet || "https://rpc.xlayer.tech/",
      chainId: 196,
      accounts: DEPLOYER_PRIVATE_KEY ? [`0x${DEPLOYER_PRIVATE_KEY}`] : [],
    },
    opsepolia: {
      url: process.env.ARCHIVE_NODE_opsepolia || "https://sepolia.optimism.io",
      chainId: 11155420,
      accounts: DEPLOYER_PRIVATE_KEY ? [`0x${DEPLOYER_PRIVATE_KEY}`] : [],
      blockGasLimit: BLOCK_GAS_LIMIT_PER_NETWORK.opsepolia,
    },
    opmainnet: {
      url: process.env.ARCHIVE_NODE_opmainnet || "https://mainnet.optimism.io",
      chainId: 10,
      accounts: DEPLOYER_PRIVATE_KEY ? [`0x${DEPLOYER_PRIVATE_KEY}`] : [],
      blockGasLimit: BLOCK_GAS_LIMIT_PER_NETWORK.opmainnet,
    },
  },
  paths: {
    tests: "./tests",
  },
  mocha: {
    timeout: 200000000,
  },
};

export default config;
