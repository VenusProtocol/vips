import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";
import commands192 from "../vip-192/commands";
import commands193 from "../vip-194/commands";
import staked from "../vip-192/staked-users";

const PRIME_LIQUIDITY_PROVIDER = "0x103Af40c4C30A564A2158D7Db6c57a0802b9217A";
const PRIME = "0x78d8dD5b0003723826E1FDb2031e9466000469Fe";

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
