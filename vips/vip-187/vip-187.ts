import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const RESILIENT_ORACLE_PROXY = "0x6592b5DE802159F3E74B2486b091D11a8256ab8A";
const NEW_RESILIENT_ORACLE_IMPLEMENTATION = "0xB5d7A073d77102ad56B7482b18E7204c1a71C8B9";
const DEFAULT_PROXY_ADMIN = "0x1BB765b741A5f3C2A338369DAb539385534E3343";

export const vip187 = () => {
  const meta = {
    version: "v2",
    title: "ResilientOracle Implementation Upgrade",
    description:
      "Upgrades the implementation contract for resilient oracle in order to fix a wrong BoundValidator immutable variable",
    forDescription: "I agree that Venus Protocol should proceed with upgrading Resilient Oracle implementation",
    againstDescription:
      "I do not think that Venus Protocol should proceed with upgrading Resilient Oracle implementation",
    abstainDescription:
      "I am indifferent to whether Venus Protocol proceeds with upgrading Resilient Oracle implementation",
  };

  return makeProposal(
    [
      {
        target: DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [RESILIENT_ORACLE_PROXY, NEW_RESILIENT_ORACLE_IMPLEMENTATION],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
