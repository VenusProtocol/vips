import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const VBNBAdmin = "0x78459C0a0Fe91d382322D09FF4F86A10dbAF78a4";
const vBNB_ADDRESS = "0x2E7222e51c0f6e98610A1543Aa3836E092CDe62c";

export const vip155Testnet = () => {
  const meta = {
    version: "v2",
    title: "Reset vBNB Admin",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with reset of vBNB Admin",
    againstDescription: "I do not think that Venus Protocol should proceed with reset of vBNB Admin",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with reset of vBNB Admin",
  };

  return makeProposal(
    [
      {
        target: VBNBAdmin,
        signature: "_setPendingAdmin(address)",
        params: [NORMAL_TIMELOCK],
      },
      {
        target: vBNB_ADDRESS,
        signature: "_acceptAdmin()",
        params: [],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};