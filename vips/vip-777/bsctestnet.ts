import { ethers } from "hardhat";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const ACM = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";
export const VBNB_ADMIN = "0x04109575c1dbB4ac2e59e60c783800ea10441BBe";
export const IL_RATE_MODEL_SETTER = "0x6F212b6fe4F33b9A3fC7a7eCbAdD3476ea5A1B8B";
export const CORE_POOL_RATE_MODEL_SETTER = "0x69B83Bf4e8501D97217b545ce4151b62a5b550c9";

export const vip777 = () => {
  const meta = {
    version: "v2",
    title: "Set checkpoint rate models for BNB Fermi hardfork block rate upgrade",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
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
        params: [VBNB_ADMIN, "setInterestRateModel(address)", CORE_POOL_RATE_MODEL_SETTER],
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

export default vip777;
