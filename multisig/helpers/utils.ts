import { JsonRpcSigner } from "@ethersproject/providers";
import Safe, { ContractNetworksConfig, EthersAdapter } from "@safe-global/protocol-kit";
import { MetaTransactionData } from "@safe-global/safe-core-sdk-types";
import { ethers, network } from "hardhat";

import { Proposal } from "../../src/types";

const readline = require("readline-sync");

const DEFAULT_OPERATION = 0; // Call

export const loadMultisigTx = async (txName: string, networkName: string) => {
  const x = await import(`../proposals/${networkName}/${txName}.ts`);
  return x[txName]();
};

export const getSafeAddress = (networkName: string): string => {
  // Define Safe addresses for different networks here
  const safeAddresses: Record<string, string> = {
    // Sepolia network
    sepolia: "0x94fa6078b6b8a26f0b6edffbe6501b22a10470fb",
    // Add more networks and their corresponding Safe addresses as needed
  };

  if (networkName in safeAddresses) {
    return safeAddresses[networkName];
  } else {
    throw new Error(`Safe address for network ${networkName} is not defined.`);
  }
};

export const buildMultiSigTx = async (proposal: Proposal): Promise<MetaTransactionData[]> => {
  const { signatures, targets, params, values } = proposal;
  const safeTransactionData: MetaTransactionData[] = [];
  for (let i = 0; i < signatures.length; ++i) {
    const abi = new ethers.utils.Interface([`function ${signatures[i]}`]);
    const safeTxData: MetaTransactionData = {
      to: targets[i],
      data: abi.encodeFunctionData(signatures[i], params[i]),
      value: values[i].toString(),
      operation: DEFAULT_OPERATION,
    };

    safeTransactionData.push(safeTxData);
  }
  return safeTransactionData;
};

export const createGnosisTx = async (ethAdapter: EthersAdapter, safeSdk: Safe): Promise<SafeTransaction> => {
  const txName = readline.question("Name of tx file (from ./multisig/network(available)/ dir) to execute => ");

  const proposal = await loadMultisigTx(txName, network.name);

  const safeTransactionData = await buildMultiSigTx(proposal);

  return await safeSdk.createTransaction({ safeTransactionData });
};

export const getContractNetworks = (chainId: number): ContractNetworksConfig => {
  // Define contract addresses for different networks here
  const networks: Record<string, ContractNetworksConfig> = {
    // Sepolia network
    sepolia: {
      [chainId]: {
        safeMasterCopyAddress: "0x42f9B1A23193465A4049DA3af93f9faBF3054951",
        safeProxyFactoryAddress: "0x4cEeffCE2e51cFaD71bF23C816756b9D789395cC",
        multiSendAddress: "0xE4BDFeD788718f1FA72C249e100B21eAE5a549e4",
        multiSendCallOnlyAddress: "0x028664f9c577698Ae250cAA51ADC22377B03ec4A",
        fallbackHandlerAddress: "0x1259Aa9FaCd0feFB5a91da65682C7EDD51608D4b",
        signMessageLibAddress: "0xaF838B48F16728169E78985Cc8eB1bda25D75B29",
        createCallAddress: "0x6B95D96C78F6433992A5F81aEcF82bAE449016Df",
        simulateTxAccessorAddress: "0x249b0178432e34320D7d30A4A9699cAf23Bcf04c",
      },
    },
    // Add more networks as needed
  };

  if (network.name in networks) {
    return networks[network.name];
  } else {
    throw new Error(`Network ${network.name} is not supported.`);
  }
};
