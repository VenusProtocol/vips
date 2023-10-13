import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const PROXY_ADMIN = "0x7877fFd62649b6A1557B55D4c20fcBaB17344C91";
const PSR = "0xF1d8bcED87d5e077e662160490797cd2B5494d4A";
const NEW_PSR_IMPL = "0xd3A3941F1d74218f73cAbf7FD513C9aA6F410397";

export const vip153Testnet = () => {
  const meta = {
    version: "v2",
    title: "Upgrade PSR",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with upgraing the PSR",
    againstDescription:
      "I do not think that Venus Protocol should proceed with upgraing the PSR",
    abstainDescription:
      "I am indifferent to whether Venus Protocol proceeds with upgraing the PSR",
  };

  return makeProposal(
    [
      {
        target: PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [PSR, NEW_PSR_IMPL],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
