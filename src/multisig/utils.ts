import Safe, { ContractNetworksConfig, EthersAdapter } from "@safe-global/protocol-kit";
import { MetaTransactionData } from "@safe-global/safe-core-sdk-types";
import { ethers, network } from "hardhat";

import { Proposal } from "../../src/types";
import { NETWORK_ADDRESSES } from "../networkAddresses";

const readline = require("readline-sync");

const DEFAULT_OPERATION = 0; // Call

export const loadMultisigTx = async (txID: string, networkName: string) => {
  const x = await import(`../../multisig/proposals/vip-${txID}/vip-${txID}-${networkName}.ts`);
  return x[`vip${txID}`]();
};

export const getSafeAddress = (networkName: string): string => {
  return NETWORK_ADDRESSES[networkName].GUARDIAN;
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
  const txID = readline.question("Multisig VIP ID to execute => ");

  const proposal = await loadMultisigTx(txID, network.name);

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
    opbnbtestnet: {
      [chainId]: {
        safeMasterCopyAddress: "0xE2CF742b554F466d5E7a37C371FD47C786d2FBc0",
        safeProxyFactoryAddress: "0x9fea7F7C69f14aa1a7d62cC9D468fEB2F9371CB3",
        multiSendAddress: "0xDeB0467cCfAda493902C8D279A2F41f26b813AC9",
        multiSendCallOnlyAddress: "0xC33224E130C702808e12299eCaBC16148a5B3d0B",
        fallbackHandlerAddress: "0x40B30946045a876ffD68CaF008f94eeAAD50F855",
        signMessageLibAddress: "0x6ACe153bF757b4999c7D6f0F3dFb1043dC67d61a",
        createCallAddress: "0x392e2F66c3BBF0046c861e0065fB7C7917b18078",
        simulateTxAccessorAddress: "0xd77D8020bEa6Aad4f5D636b1EB1FB3B9d08bbb7F",
      },
    },
    kavatestnet: {
      [chainId]: {
        safeMasterCopyAddress: "0x3E5c63644E683549055b9Be8653de26E0B4CD36E",
        safeProxyFactoryAddress: "0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2",
        multiSendAddress: "0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761",
        multiSendCallOnlyAddress: "0x40A2aCCbd92BCA938b02010E17A5b8929b49130D",
        fallbackHandlerAddress: "0xf48f2B2d2a534e402487b3ee7C18c33Aec0Fe5e4",
        signMessageLibAddress: "0xA65387F16B013cf2Af4605Ad8aA5ec25a2cbA3a2",
        createCallAddress: "0x7cbB62EaA69F79e6873cD1ecB2392971036cFAa4",
        simulateTxAccessorAddress: "0x59AD6735bCd8152B84860Cb256dD9e96b85F69Da",
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
