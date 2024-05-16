import { ethers } from "ethers";

import { proposeVIP } from "../src/transactions";

export async function getTransactionData(vip: string, txHash: string, networkId: number) {
  // create an Ethers.js provider based on the network ID
  const provider = ethers.getDefaultProvider(getNetworkName(networkId));
  // get the transaction object using the provider and transaction hash
  const tx = await provider.getTransaction(txHash);
  const buildData = await proposeVIP(vip);
  return buildData.calldata === tx["data"];
}

function getNetworkName(networkId: number) {
  switch (networkId) {
    case 97:
      return process.env.BSC_TESTNET_NODE || "https://data-seed-prebsc-1-s1.binance.org:8545";
    case 56:
      return process.env.BSC_MAINNET_NODE || "https://bsc-dataseed.binance.org/";
    default:
      throw new Error(`Unsupported network ID: ${networkId}`);
  }
}
