import "module-alias/register";

import "@matterlabs/hardhat-zksync";
import "@matterlabs/hardhat-zksync-node";
import "@matterlabs/hardhat-zksync-solc";
import "@nomicfoundation/hardhat-chai-matchers";
import "@nomiclabs/hardhat-ethers";
import * as dotenv from "dotenv";
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
  zksyncsepolia: 30000000,
  zksyncmainnet: 30000000,
};

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
  zksolc: {
    version: "1.5.1",
    compilerSource: "binary",
    settings: {
      metadata: {
        // do not include the metadata hash, since this is machine dependent
        // and we want all generated code to be deterministic
        // https://docs.soliditylang.org/en/v0.7.6/metadata.html
        bytecodeHash: "none",
      },
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.8.25",
        settings: {
          optimizer: {
            enabled: true,
            runs: 10000,
          },
          evmVersion: "paris",
          outputSelection: {
            "*": {
              "*": ["storageLayout"],
            },
          },
        },
      },
    ],
  },
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
      loggingEnabled: false,
      zksync: true,
    },
    zksyncsepolia: {
      url: process.env.ARCHIVE_NODE_zksyncsepolia || "https://sepolia.era.zksync.dev",
      chainId: 300,
      accounts: DEPLOYER_PRIVATE_KEY ? [`0x${DEPLOYER_PRIVATE_KEY}`] : [],
      blockGasLimit: BLOCK_GAS_LIMIT_PER_NETWORK.zksyncsepolia,
      zksync: true,
    },
    zksyncmainnet: {
      url: process.env.ARCHIVE_NODE_zksyncmainnet || "https://mainnet.era.zksync.io",
      chainId: 324,
      accounts: DEPLOYER_PRIVATE_KEY ? [`0x${DEPLOYER_PRIVATE_KEY}`] : [],
      blockGasLimit: BLOCK_GAS_LIMIT_PER_NETWORK.zksyncmainnet,
      zksync: true,
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
