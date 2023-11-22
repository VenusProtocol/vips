import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const PRIME = "0xBbCD063efE506c3D42a0Fa2dB5C08430288C71FC";
const DEFAULT_PROXY_ADMIN = "0x6beb6D2695B67FEb73ad4f172E8E2975497187e4";
const NEW_PRIME_IMPL = "0x371c0355CC22Ea13404F2fEAc989435DAD9b9d03";

export const vip297 = () => {
  const meta = {
    version: "v2",
    title: "Upgrade Prime Contract",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with upgrading the prime contract",
    againstDescription: "I do not think that Venus Protocol should proceed with upgrading the prime contract",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with upgrading the prime contract",
  };

  return makeProposal(
    [
      {
        target: DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [PRIME, NEW_PRIME_IMPL],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
