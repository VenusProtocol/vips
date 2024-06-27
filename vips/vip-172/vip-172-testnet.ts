import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const UNITROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
const NEW_COMPTROLLER_IMPLEMENTATION = "0xa8A476AD16727CE641f27d7738D2D341Ebad81CC";

const ACM = "0x69a9e5dee4007fb1311c4d086fed4803e09a30b5";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const FAST_TRACK_TIMELOCK = "0x3CFf21b7AF8390fE68799D58727d3b4C25a83cb6";
const CRITICAL_TIMELOCK = "0x23B893a7C45a5Eb8c8C062b9F32d0D2e43eD286D";

export const vip172Testnet = () => {
  const meta = {
    version: "v2",
    title: "VIP-172",
    description: ``,
    forDescription: "Process to upgrade Comptroller to new implementation",
    againstDescription: "Defer upgrade",
    abstainDescription: "No opinion on the matter",
  };

  return makeProposal(
    [
      {
        target: UNITROLLER,
        signature: "_setPendingImplementation(address)",
        params: [NEW_COMPTROLLER_IMPLEMENTATION],
      },
      {
        target: NEW_COMPTROLLER_IMPLEMENTATION,
        signature: "_become(address)",
        params: [UNITROLLER],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [UNITROLLER, "_setForcedLiquidation(address,bool)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [UNITROLLER, "_setForcedLiquidation(address,bool)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [UNITROLLER, "_setForcedLiquidation(address,bool)", CRITICAL_TIMELOCK],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
