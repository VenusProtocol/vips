import Safe, { ContractNetworksConfig, EthersAdapter } from "@safe-global/protocol-kit";
import { ethers, network } from "hardhat";

import { createGnosisTx, getContractNetworks, getSafeAddress } from "../src/multisig/utils";

const executeMultiSigTx = async (multisigVipPath: string) => {
  const safeOwner = ethers.provider.getSigner(0);

  const ethAdapter = new EthersAdapter({
    ethers,
    signerOrProvider: safeOwner,
  });
  const safeAddress = getSafeAddress(network.name);
  const chainId = await ethAdapter.getChainId();
  const contractNetworks: ContractNetworksConfig = getContractNetworks(chainId);

  const safeSdk = await Safe.create({ ethAdapter, safeAddress, contractNetworks });

  const safeTransaction = await createGnosisTx(ethAdapter, safeSdk, multisigVipPath);

  const safeTxHash = await safeSdk.getTransactionHash(safeTransaction);

  safeTransaction.addSignature(await safeSdk.signTransactionHash(safeTxHash));
  console.log("Multisig tx has been signed and submitted for execution....");
  const executeTxResponse = await safeSdk.executeTransaction(safeTransaction);
  const receipt = executeTxResponse.transactionResponse && (await executeTxResponse.transactionResponse.wait());

  console.log(`Multisig transaction (txId: ${receipt?.transactionHash}) has been successfully submitted.`);
};

export default executeMultiSigTx;
