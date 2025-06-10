import { ethers } from "hardhat";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const ACM = "0x4788629abc6cfca10f9f969efdeaa1cf70c23555";
export const VBNB_ADMIN = "0x9A7890534d9d91d473F28cB97962d176e2B65f1d";
export const IL_RATE_MODEL_SETTER = "0xe17aB0c10be44c64d9B41385a2d3C2335f57701B";
export const CORE_POOL_RATE_MODEL_SETTER = "0x8A5d8c7b49Fddd56676A0d887B8B1698850F8382";

export const vip520 = () => {
  const meta = {
    version: "v2",
    title: "VIP-486 [BNB Chain] Block Rate Upgrade (2/2)",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setInterestRateModel(address)", IL_RATE_MODEL_SETTER],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [VBNB_ADMIN, "setInterestRateModel(address)", CORE_POOL_RATE_MODEL_SETTER],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "_setInterestRateModel(address)", CORE_POOL_RATE_MODEL_SETTER],
      },
      {
        target: IL_RATE_MODEL_SETTER,
        signature: "run()",
        params: [],
      },
      {
        target: CORE_POOL_RATE_MODEL_SETTER,
        signature: "run()",
        params: [],
      },
      {
        target: ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setInterestRateModel(address)", IL_RATE_MODEL_SETTER],
      },
      {
        target: ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [VBNB_ADMIN, "_setInterestRateModel(address)", CORE_POOL_RATE_MODEL_SETTER],
      },
      {
        target: ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "_setInterestRateModel(address)", CORE_POOL_RATE_MODEL_SETTER],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip520;
