import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const COMPTROLLER_BEACON = "0xdddd7725c073105fb2abfcbdec16708fc4c24b74";
const NEW_COMPTROLLER_IMPLEMENTATION = "0x9290A138A6c01Ce086baEE90d373d6f4746C9572";

export const vipComptrollerBeaconUpgrade = () => {
  const meta = {
    version: "v2",
    title: "VIP comptroller beacon upgrade",
    description: `
        Upgardes the implementation of comptroller beacon proxy for isolated pools`,

    forDescription: "I agree that Venus Protocol should proceed with upgrading comptroller beacon",
    againstDescription: "I do not think that Venus Protocol should proceed with upgrading comptroller beacon",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with upgrading comptroller beacon",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER_BEACON,
        signature: "upgradeTo(address)",
        params: [NEW_COMPTROLLER_IMPLEMENTATION],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
