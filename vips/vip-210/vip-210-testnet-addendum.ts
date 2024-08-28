import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const PRIME = "0xe840F8EC2Dc50E7D22e5e2991975b9F6e34b62Ad";
const DEFAULT_PROXY_ADMIN = "0x7877ffd62649b6a1557b55d4c20fcbab17344c91";
const NEW_PRIME_IMPL = "0x72C9Bc4433C912ecd8184B3F7dda55Ee25761896";

export const vip210TestnetAddendum = () => {
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
