import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const UNITROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
export const SWAP_ROUTER = "0xd3F226acA3210990DBA3f410b74E36b08F31FCf2";
export const SWAP_HELPER = "0x55Fa097cA59BAc70C1ba488BEb11A5F6bf7019Eb";

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
