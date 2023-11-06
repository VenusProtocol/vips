import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";
import commands192 from "../vip-192/commands";
import commands193 from "../vip-194/commands";
import staked from "../vip-192/staked-users";

const PRIME_LIQUIDITY_PROVIDER = "0x23c4F844ffDdC6161174eB32c770D4D8C07833F2";
const PRIME = "0xBbCD063efE506c3D42a0Fa2dB5C08430288C71FC";

export const vip195 = () => {
  const meta = {
    version: "v2",
    title: "Prime Program Setup",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with setting the prime program",
    againstDescription: "I do not think that Venus Protocol should proceed with setting the prime program",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with setting the prime program",
  };

  return makeProposal(
    [
      ...commands192,
      staked,
      ...commands193,
      {
        target: PRIME_LIQUIDITY_PROVIDER,
        signature: "resumeFundsTransfer()",
        params: [],
      },
      {
        target: PRIME,
        signature: "togglePause()",
        params: [],
      }
    ],
    meta,
    ProposalType.REGULAR,
  );
};
