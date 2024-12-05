import "module-alias/register";

import "@nomicfoundation/hardhat-chai-matchers";
import "@nomiclabs/hardhat-ethers";
import * as dotenv from "dotenv";
import { ethers } from "ethers";
import { HardhatUserConfig, task } from "hardhat/config";
import { ChainId } from "src/chains";

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
  arbitrumsepolia: 32000000,
  arbitrumone: 32000000,
  opsepolia: 60000000,
  opmainnet: 60000000,
  basesepolia: 60000000,
  basemainnet: 60000000,
};

task("propose", "Propose proposal")
  .addPositionalParam("proposalPath", "Proposal path to pass to script")
  .setAction(async function (taskArguments, hre) {
    hre.FORKED_NETWORK = hre.network.name as "bscmainnet";
    const { proposalPath } = taskArguments;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const proposeVip = require("./scripts/proposeVIP").default;
    await proposeVip(proposalPath);
  });

task("proposeOnTestnet", "Propose proposal on testnet")
  .addPositionalParam("proposalPath", "Proposal path to pass to script")
  .setAction(async function (taskArguments, hre) {
    hre.FORKED_NETWORK = hre.network.name as "bsctestnet";
    const { proposalPath } = taskArguments;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const proposeTestnetVIP = require("./scripts/proposeTestnetVIP").default;
    await proposeTestnetVIP(proposalPath, hre.network.name);
  });
task("createProposal", "Create proposal objects for various destinations").setAction(async function (
  taskArguments,
  hre,
) {
  hre.FORKED_NETWORK = (hre.network.name as "bsctestnet") || "bscmainnet";
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const createProposal = require("./scripts/createProposal").default;
  await createProposal();
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

// Pretend that Cancun hardfork was activated at block 0
const assumeCancun = {
  hardforkHistory: {
    cancun: 0,
  },
};

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
      loggingEnabled: false,
      // Forking networks with unknown hardfork activation history causes errors in
      // new versions of Hardhat. Following https://github.com/NomicFoundation/hardhat/pull/5394,
      // we assume Cancun hardfork was active from the beginning for all unknown chains
      chains: {
        [ChainId.bscmainnet]: assumeCancun,
        [ChainId.bsctestnet]: assumeCancun,
        [ChainId.opbnbtestnet]: assumeCancun,
        [ChainId.opbnbmainnet]: assumeCancun,
        [ChainId.arbitrumsepolia]: assumeCancun,
        [ChainId.arbitrumone]: assumeCancun,
        [ChainId.opsepolia]: assumeCancun,
        [ChainId.opmainnet]: assumeCancun,
        [ChainId.basesepolia]: assumeCancun,
        [ChainId.basemainnet]: assumeCancun,
      },
    },
    bsctestnet: {
      url: process.env.ARCHIVE_NODE_bsctestnet || "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: ChainId.bsctestnet,
      accounts: DEPLOYER_PRIVATE_KEY ? [`0x${DEPLOYER_PRIVATE_KEY}`] : [],
      gasPrice: ethers.utils.parseUnits("10", "gwei").toNumber(),
      gasMultiplier: 10,
      timeout: 12000000,
      blockGasLimit: BLOCK_GAS_LIMIT_PER_NETWORK.bsctestnet,
    },
    bscmainnet: {
      url: process.env.ARCHIVE_NODE_bscmainnet || "https://bsc-dataseed.binance.org/",
      chainId: ChainId.bscmainnet,
      accounts: DEPLOYER_PRIVATE_KEY ? [`0x${DEPLOYER_PRIVATE_KEY}`] : [],
      blockGasLimit: BLOCK_GAS_LIMIT_PER_NETWORK.bscmainnet,
    },
    sepolia: {
      url: process.env.ARCHIVE_NODE_sepolia || "https://ethereum-sepolia.blockpi.network/v1/rpc/public",
      chainId: ChainId.sepolia,
      accounts: DEPLOYER_PRIVATE_KEY ? [`0x${DEPLOYER_PRIVATE_KEY}`] : [],
      blockGasLimit: BLOCK_GAS_LIMIT_PER_NETWORK.sepolia,
    },
    ethereum: {
      url: process.env.ARCHIVE_NODE_ethereum || "https://ethereum.blockpi.network/v1/rpc/public",
      chainId: ChainId.ethereum,
      accounts: DEPLOYER_PRIVATE_KEY ? [`0x${DEPLOYER_PRIVATE_KEY}`] : [],
      blockGasLimit: BLOCK_GAS_LIMIT_PER_NETWORK.ethereum,
    },
    opbnbtestnet: {
      url: process.env.ARCHIVE_NODE_opbnbtestnet || "https://opbnb-testnet-rpc.bnbchain.org",
      chainId: ChainId.opbnbtestnet,
      accounts: DEPLOYER_PRIVATE_KEY ? [`0x${DEPLOYER_PRIVATE_KEY}`] : [],
      blockGasLimit: BLOCK_GAS_LIMIT_PER_NETWORK.opbnbtestnet,
    },
    opbnbmainnet: {
      url: process.env.ARCHIVE_NODE_opbnbmainnet || "https://opbnb-mainnet-rpc.bnbchain.org",
      chainId: ChainId.opbnbmainnet,
      accounts: DEPLOYER_PRIVATE_KEY ? [`0x${DEPLOYER_PRIVATE_KEY}`] : [],
      blockGasLimit: BLOCK_GAS_LIMIT_PER_NETWORK.opbnbmainnet,
    },
    arbitrumsepolia: {
      url: process.env.ARCHIVE_NODE_arbitrumsepolia || "https://sepolia-rollup.arbitrum.io/rpc",
      chainId: ChainId.arbitrumsepolia,
      accounts: DEPLOYER_PRIVATE_KEY ? [`0x${DEPLOYER_PRIVATE_KEY}`] : [],
    },
    arbitrumone: {
      url: process.env.ARCHIVE_NODE_arbitrumone || "https://arb1.arbitrum.io/rpc",
      chainId: ChainId.arbitrumone,
      accounts: DEPLOYER_PRIVATE_KEY ? [`0x${DEPLOYER_PRIVATE_KEY}`] : [],
    },
    opsepolia: {
      url: process.env.ARCHIVE_NODE_opsepolia || "https://sepolia.optimism.io",
      chainId: ChainId.opsepolia,
      accounts: DEPLOYER_PRIVATE_KEY ? [`0x${DEPLOYER_PRIVATE_KEY}`] : [],
      blockGasLimit: BLOCK_GAS_LIMIT_PER_NETWORK.opsepolia,
    },
    opmainnet: {
      url: process.env.ARCHIVE_NODE_opmainnet || "https://mainnet.optimism.io",
      chainId: ChainId.opmainnet,
      accounts: DEPLOYER_PRIVATE_KEY ? [`0x${DEPLOYER_PRIVATE_KEY}`] : [],
      blockGasLimit: BLOCK_GAS_LIMIT_PER_NETWORK.opmainnet,
    },
    basesepolia: {
      url: process.env.ARCHIVE_NODE_basesepolia || "https://sepolia.base.org",
      chainId: ChainId.basesepolia,
      accounts: DEPLOYER_PRIVATE_KEY ? [`0x${DEPLOYER_PRIVATE_KEY}`] : [],
      blockGasLimit: BLOCK_GAS_LIMIT_PER_NETWORK.basesepolia,
    },
    basemainnet: {
      url: process.env.ARCHIVE_NODE_basemainnet || "https://mainnet.base.org",
      chainId: 8453,
      accounts: DEPLOYER_PRIVATE_KEY ? [`0x${DEPLOYER_PRIVATE_KEY}`] : [],
      blockGasLimit: BLOCK_GAS_LIMIT_PER_NETWORK.basemainnet,
    },
  },
  paths: {
    tests: "./tests",
  },
  mocha: {
    timeout: 200000000,
    delay: true,
  },
};

export default config;
