import Safe, { ContractNetworksConfig, EthersAdapter } from "@safe-global/protocol-kit";
import { MetaTransactionData } from "@safe-global/safe-core-sdk-types";
import { ethers, network } from "hardhat";

import { getSafeAddress, loadMultisigTx } from "../multisig/helpers/utils";
import { Proposal } from "../src/types";

const readline = require("readline-sync");

const DEFAULT_OPERATION = 0; // Call
let txName: string;

const executeMultiSigTx = async () => {
  const safeOwner = ethers.provider.getSigner(0);
  txName = readline.question("Name of tx file (from ./multisig/network(available)/ dir) to execute => ");

  const ethAdapter = new EthersAdapter({
    ethers,
    signerOrProvider: safeOwner,
  });
  const safeAddress = getSafeAddress(network.name);
  const chainId = await ethAdapter.getChainId();
  const contractNetworks: ContractNetworksConfig = getContractNetworks(chainId);

  const safeSdk = await Safe.create({ ethAdapter, safeAddress, contractNetworks });

  const proposal = await loadMultisigTx(txName, network.name);

  const safeTransactionData = await buildMultiSigTx(proposal);

  const safeTransaction = await safeSdk.createTransaction({ safeTransactionData });

  const safeTxHash = await safeSdk.getTransactionHash(safeTransaction);

  safeTransaction.addSignature(await safeSdk.signTransactionHash(safeTxHash));
  const executeTxResponse = await safeSdk.executeTransaction(safeTransaction);
  const receipt = executeTxResponse.transactionResponse && (await executeTxResponse.transactionResponse.wait());

  console.log(`Multisig transaction (txId: ${receipt?.transactionHash}) has been successfully submitted.`);
};

const buildMultiSigTx = async (proposal: Proposal): Promise<MetaTransactionData[]> => {
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

const getContractNetworks = (chainId: number): ContractNetworksConfig => {
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

executeMultiSigTx();
