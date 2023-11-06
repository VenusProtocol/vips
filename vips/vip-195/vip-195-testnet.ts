import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";
import commands192 from "../vip-192/commands-testnet";
import commands193 from "../vip-194/commands-testnet";

const PRIME_LIQUIDITY_PROVIDER = "0xAdeddc73eAFCbed174e6C400165b111b0cb80B7E";
const PRIME = "0xe840F8EC2Dc50E7D22e5e2991975b9F6e34b62Ad";

export const vip195Testnet = () => {
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
