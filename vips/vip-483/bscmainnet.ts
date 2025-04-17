import { ethers } from "hardhat";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const BSCMAINNET_ACM = "0x4788629abc6cfca10f9f969efdeaa1cf70c23555";
export const BSCMAINNET_IL_RATE_MODEL_SETTER = "0x0b086B866A5A91D5882ed355a34d268c62f8BE66";

export const vip483 = () => {
  const meta = {
    version: "v2",
    title: "Set checkpoint rate models for BNB block rate upgrade",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: BSCMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setInterestRateModel(address)", BSCMAINNET_IL_RATE_MODEL_SETTER],
      },
      {
        target: BSCMAINNET_IL_RATE_MODEL_SETTER,
        signature: "run()",
        params: [],
      },
      {
        target: BSCMAINNET_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setInterestRateModel(address)", BSCMAINNET_IL_RATE_MODEL_SETTER],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip483;
