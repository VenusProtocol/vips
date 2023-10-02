import Safe, { ContractNetworksConfig, EthersAdapter } from "@safe-global/protocol-kit";
import { ethers, network } from "hardhat";

import {
  buildMultiSigTx,
  createGnosisTx,
  getContractNetworks,
  getSafeAddress,
  loadMultisigTx,
} from "../multisig/helpers/utils";

const readline = require("readline-sync");

let txName: string;

const executeMultiSigTx = async () => {
  const safeOwner = ethers.provider.getSigner(0);

  const ethAdapter = new EthersAdapter({
    ethers,
    signerOrProvider: safeOwner,
  });
  const safeAddress = getSafeAddress(network.name);
  const chainId = await ethAdapter.getChainId();
  const contractNetworks: ContractNetworksConfig = getContractNetworks(chainId);

  const safeSdk = await Safe.create({ ethAdapter, safeAddress, contractNetworks });

  const safeTransaction = await createGnosisTx(ethAdapter, safeSdk);

  const safeTxHash = await safeSdk.getTransactionHash(safeTransaction);

  safeTransaction.addSignature(await safeSdk.signTransactionHash(safeTxHash));
  const executeTxResponse = await safeSdk.executeTransaction(safeTransaction);
  const receipt = executeTxResponse.transactionResponse && (await executeTxResponse.transactionResponse.wait());

  console.log(`Multisig transaction (txId: ${receipt?.transactionHash}) has been successfully submitted.`);
};

executeMultiSigTx();
