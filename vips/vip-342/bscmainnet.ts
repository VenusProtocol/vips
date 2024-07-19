import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const VBNB = "0xA07c5b74C9B40447a954e1466938b865b6BBea36";
export const OLD_IR = "0xF558Be24F2CACb65a4BB41A155631C83B15388F1";
export const NEW_IR = "0xe5be8D9f4697dD264e488efD4b29c8CC31616fa5";
export const VBNB_ADMIN = "0x9A7890534d9d91d473F28cB97962d176e2B65f1d";

const vip342 = () => {
  const meta = {
    version: "v2",
    title: "VIP-342",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: VBNB_ADMIN,
        signature: "_setInterestRateModel(address)",
        params: [NEW_IR],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip342;
