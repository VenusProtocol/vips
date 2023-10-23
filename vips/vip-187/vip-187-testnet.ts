import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const RESILIENT_ORACLE_PROXY = "0x3cD69251D04A28d887Ac14cbe2E14c52F3D57823";
const NEW_RESILIENT_ORACLE_IMPLEMENTATION = "0x35cC3b99985F9d970aEcc9BD83d5Ac78a074a896";
const DEFAULT_PROXY_ADMIN = "0xef480a5654b231ff7d80A0681F938f3Db71a6Ca6";

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
