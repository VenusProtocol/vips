import Safe, { ContractNetworksConfig, EthersAdapter } from "@safe-global/protocol-kit";
import { EthAdapter } from "@safe-global/safe-core-sdk-types";
import { ethers, network } from "hardhat";
import { createGnosisTx, getContractNetworks, getSafeAddress } from "src/multisig/utils";
import { SUPPORTED_NETWORKS } from "src/types";

const SAFE_ABI = [
  {
    inputs: [
      { internalType: "address", name: "", type: "address" },
      { internalType: "bytes32", name: "", type: "bytes32" },
    ],
    name: "approvedHashes",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "value", type: "uint256" },
      { internalType: "bytes", name: "data", type: "bytes" },
      { internalType: "uint8", name: "operation", type: "uint8" },
      { internalType: "uint256", name: "safeTxGas", type: "uint256" },
      { internalType: "uint256", name: "baseGas", type: "uint256" },
      { internalType: "uint256", name: "gasPrice", type: "uint256" },
      { internalType: "address", name: "gasToken", type: "address" },
      { internalType: "address", name: "refundReceiver", type: "address" },
      { internalType: "bytes", name: "signatures", type: "bytes" },
    ],
    name: "execTransaction",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "payable",
    type: "function",
  },
];

const buildDummySignature = (owner: string) => {
  // Remove "0x" and pad left to 64 hex digits.
  let r = owner.toLowerCase().replace(/^0x/, "");
  r = r.padStart(64, "0");
  const s = "0".repeat(64); // 32 bytes of zeros
  const v = "01"; // 1 byte for v
  return r + s + v; // Concatenate without 0x prefix
};

const getApprovedOwners = async (safeAddress: string, owners: string[], safeTxHash: string) => {
  const approvedOwners: string[] = [];
  const safeContract = new ethers.Contract(safeAddress, SAFE_ABI, ethers.provider);
  for (const owner of owners) {
    const approved = await safeContract.approvedHashes(owner, safeTxHash);
    const isApproved = approved.gt(0);
    if (isApproved) {
      approvedOwners.push(owner);
    }
  }
  return approvedOwners;
};

const calculateSafeTxData = async (multisigVipPath: string, nonce: number | undefined) => {
  const safeOwner = ethers.provider.getSigner(0);

  const ethAdapter = new EthersAdapter({
    ethers,
    signerOrProvider: safeOwner,
  });
  const safeAddress = getSafeAddress(network.name as SUPPORTED_NETWORKS);
  const chainId = await ethAdapter.getChainId();
  const contractNetworks: ContractNetworksConfig = getContractNetworks(chainId);

  const safeSdk = await Safe.create({ ethAdapter: ethAdapter as unknown as EthAdapter, safeAddress, contractNetworks });

  const safeTransaction = await createGnosisTx(ethAdapter, safeSdk, multisigVipPath, true, { nonce });

  const safeTxHash = await safeSdk.getTransactionHash(safeTransaction);

  console.log({ safeTxHash });

  // Calculate fields for the executeTransaction function

  const threshold = await safeSdk.getThreshold();
  const owners = await safeSdk.getOwners();
  const approvedOwners = (await getApprovedOwners(safeAddress, owners, safeTxHash)).sort();

  console.log("## Status");
  console.log({ threshold, owners, approvedOwners });

  if (approvedOwners.length >= threshold) {
    const signatures = `0x${approvedOwners.map(buildDummySignature).join("")}`;

    const execIface = new ethers.utils.Interface(SAFE_ABI);
    const execTxCalldata = execIface.encodeFunctionData("execTransaction", [
      safeTransaction.data.to,
      safeTransaction.data.value,
      safeTransaction.data.data,
      safeTransaction.data.operation,
      safeTransaction.data.safeTxGas,
      safeTransaction.data.baseGas,
      safeTransaction.data.gasPrice,
      safeTransaction.data.gasToken,
      safeTransaction.data.refundReceiver,
      signatures,
    ]);

    console.log("## executeTransaction submiting the call data");
    console.log({ safeAddress, execTxCalldata });

    console.log("## executeTransaction providing individual fields");
    console.log({
      ...safeTransaction.data,
      signatures,
    });
  }
};

export default calculateSafeTxData;
