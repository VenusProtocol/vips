import { ethers } from "hardhat";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const BSCTESTNET_ACM = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";
export const BSCTESTNET_IL_RATE_MODEL_SETTER = "0x5Fe8448dC56Ed15951002BF87a465F874b173402";

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
        target: BSCTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setInterestRateModel(address)", BSCTESTNET_IL_RATE_MODEL_SETTER],
      },
      {
        target: BSCTESTNET_IL_RATE_MODEL_SETTER,
        signature: "run()",
        params: [],
      },
      {
        target: BSCTESTNET_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setInterestRateModel(address)", BSCTESTNET_IL_RATE_MODEL_SETTER],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip483;
