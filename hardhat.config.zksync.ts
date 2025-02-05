import "module-alias/register";

import "@matterlabs/hardhat-zksync";
import "@matterlabs/hardhat-zksync-node";
import "@matterlabs/hardhat-zksync-solc";
import "@nomicfoundation/hardhat-chai-matchers";
import "@nomiclabs/hardhat-ethers";
import * as dotenv from "dotenv";
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
  zksyncsepolia: 30000000,
  zksyncmainnet: 30000000,
};

task("createProposal", "Create proposal objects for various destinations").setAction(async function (
  taskArguments,
  hre,
) {
  hre.FORKED_NETWORK = (hre.network.name as "zksyncsepolia") || "zksyncmainnet";
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const createProposal = require("./scripts/createProposal").processGnosisTxBuilder;
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

    if (hre.network.name === "zksynctestnode") {
      if (!process.env["ZKSYNC_ERA_LOCAL_TEST_NODE"]) {
        throw new Error("ZKSYNC_ERA_LOCAL_TEST_NODE env variable is not set");
      }

      try {
        const provider = new hre.ethers.providers.JsonRpcProvider(process.env["ZKSYNC_ERA_LOCAL_TEST_NODE"]);
        await provider.send("eth_chainId", []);
        console.log("Local zksync era test node is running");
      } catch (e) {
        throw new Error(
          `Local zksync era test node is not running. Please run it with "yarn run local-test-node:${fork} --fork-block-number \`<fork block number of the vip>\`"`,
        );
      }
    }

    const hardhatConfig = fork
      ? {
          allowUnlimitedContractSize: false,
          loggingEnabled: false,
          forking:
            hre.network.name === "zksynctestnode"
              ? {
                  enabled: false,
                  url: process.env["ZKSYNC_ERA_LOCAL_TEST_NODE"] as string,
                }
              : {
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
      chains: {
        [ChainId.zksyncmainnet]: assumeCancun,
        [ChainId.zksyncsepolia]: assumeCancun,
        [ChainId.zkSyncTestNode]: assumeCancun,
      },
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
    zksynctestnode: {
      url: process.env.ZKSYNC_ERA_LOCAL_TEST_NODE || "http://localhost:8011",
      chainId: 300, // change it to 324 for zksyncmainnet
      accounts: DEPLOYER_PRIVATE_KEY ? [`0x${DEPLOYER_PRIVATE_KEY}`] : [],
      blockGasLimit: BLOCK_GAS_LIMIT_PER_NETWORK.zksyncsepolia,
      timeout: 2000000000,
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
