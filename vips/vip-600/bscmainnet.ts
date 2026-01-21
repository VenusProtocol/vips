import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const UNITROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const SWAP_ROUTER = "0xde7E4f67Af577F29e5F3B995f9e67FD425F73621";
export const SWAP_HELPER = "0xD79be25aEe798Aa34A9Ba1230003d7499be29A24";

export const vip600 = () => {
  const meta = {
    version: "v2",
    title: "VIP-600 [BNB Chain] Implementation of SwapRouter",
    description: `Implements SwapRouter contract and transfers its ownership to Venus Protocol on BNB Chain.`,
    forDescription: "Execute",
    againstDescription: "Do not execute",
    abstainDescription: "Abstain",
  };

  return makeProposal(
    [
      {
        target: SWAP_ROUTER,
        signature: "acceptOwnership()",
        params: [],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip600;
