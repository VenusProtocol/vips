import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";

const vip285 = () => {
  const meta = {
    version: "v2",
    title: "VIP-285 Approval for Ethereum MultiSig Txn to Set XVS Mint Limit",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: NORMAL_TIMELOCK,
        signature: "",
        params: [],
        value: "0",
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};

export default vip285;
