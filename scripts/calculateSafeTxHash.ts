import Safe, { ContractNetworksConfig, EthersAdapter } from "@safe-global/protocol-kit";
import { EthAdapter } from "@safe-global/safe-core-sdk-types";
import { ethers, network } from "hardhat";
import { createGnosisTx, getContractNetworks, getSafeAddress } from "src/multisig/utils";
import { SUPPORTED_NETWORKS } from "src/types";

const calculateSafeTxHash = async (multisigVipPath: string, nonce: number | undefined) => {
  const safeOwner = ethers.provider.getSigner(0);

  const ethAdapter = new EthersAdapter({
    ethers,
    signerOrProvider: safeOwner,
  });
  const safeAddress = getSafeAddress(network.name as Exclude<SUPPORTED_NETWORKS, "bsctestnet" | "bscmainnet">);
  const chainId = await ethAdapter.getChainId();
  const contractNetworks: ContractNetworksConfig = getContractNetworks(chainId);

  const safeSdk = await Safe.create({ ethAdapter: ethAdapter as unknown as EthAdapter, safeAddress, contractNetworks });

  const safeTransaction = await createGnosisTx(ethAdapter, safeSdk, multisigVipPath, true, { nonce });

  const safeTxHash = await safeSdk.getTransactionHash(safeTransaction);

  console.log({ safeTxHash });
};

export default calculateSafeTxHash;
