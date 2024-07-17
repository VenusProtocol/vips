import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const CRITICAL_TIMELOCK = "0x213c446ec11e45b15a6E29C1C1b402B8897f606d";

const vip338 = () => {
  const meta = {
    version: "v2",
    title: "VIP-338 Whitelist XVS Vault Treasury in Ethereum",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: CRITICAL_TIMELOCK,
        signature: "",
        params: [],
        value: "1",
      },
    ],
    meta,
    ProposalType.CRITICAL,
  );
};

export default vip338;
