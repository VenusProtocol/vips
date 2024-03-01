import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const VBNB_ADMIN = "0x9A7890534d9d91d473F28cB97962d176e2B65f1d";
const NEW_IR = "0xF558Be24F2CACb65a4BB41A155631C83B15388F1";

export const vip264 = () => {
  const meta = {
    version: "v2",
    title: "VIP-264 Core Pool BNB IR Curve Update ",
    description: `#### Summary

      #### Details

      VIP simulation:
    `,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with this proposal",
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
