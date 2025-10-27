import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { cutParams as params } from "../../simulations/vip-557/utils/bsctestnet-addendum-cut-params.json";

export const UNITROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
export const NEW_DIAMOND_IMPLEMENTATION = "0x1774f993861B14B7C3963F3e09f67cfBd2B32198";
export const NEW_COMPTROLLER_LENS = "0x72dCB93F8c3fB00D31076e93b6E87C342A3eCC9c";
export const ACM = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";

export const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
export const FAST_TRACK_TIMELOCK = "0x3CFf21b7AF8390fE68799D58727d3b4C25a83cb6";
export const CRITICAL_TIMELOCK = "0x23B893a7C45a5Eb8c8C062b9F32d0D2e43eD286D";

export const vip557Testnet = () => {
  const meta = {
    version: "v2",
    title: "VIP-557: Flash loan feature for all markets on BSC Testnet",
    description:
      "Upgrade diamond, facets, comptrollerLens and grants permission to the new flash loan system wide pause function on BSC Testnet.",
    forDescription: "Execute",
    againstDescription: "Do not execute",
    abstainDescription: "Abstain",
  };
  return makeProposal(
    [
      {
        target: UNITROLLER,
        signature: "_setPendingImplementation(address)",
        params: [NEW_DIAMOND_IMPLEMENTATION],
      },
      {
        target: NEW_DIAMOND_IMPLEMENTATION,
        signature: "_become(address)",
        params: [UNITROLLER],
      },
      {
        target: UNITROLLER,
        signature: "diamondCut((address,uint8,bytes4[])[])",
        params: [params],
      },
      ...[NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK].map((timelock: string) => ({
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [UNITROLLER, "setFlashLoanPaused(bool)", timelock],
      })),
      {
        target: UNITROLLER,
        signature: "_setComptrollerLens(address)",
        params: [NEW_COMPTROLLER_LENS],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip557Testnet;
