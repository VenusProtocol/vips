import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const vBNBAdmin_Implementation = "0x90c891bb2b1821ADE159ECa6FbA0418b2bD1b86D";
export const vBNBAdmin = "0x04109575c1dbB4ac2e59e60c783800ea10441BBe";
export const ProxyAdmin = "0x7877ffd62649b6a1557b55d4c20fcbab17344c91";

export const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
export const FAST_TRACK_TIMELOCK = "0x3CFf21b7AF8390fE68799D58727d3b4C25a83cb6";
export const CRITICAL_TIMELOCK = "0x23B893a7C45a5Eb8c8C062b9F32d0D2e43eD286D";
export const ACM = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";

const vip320 = () => {
  const meta = {
    version: "v2",
    title: "VIP-319",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: ProxyAdmin,
        signature: "upgrade(address,address)",
        params: [vBNBAdmin, vBNBAdmin_Implementation],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [vBNBAdmin, "setInterestRateModel(address)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [vBNBAdmin, "setInterestRateModel(address)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [vBNBAdmin, "setInterestRateModel(address)", CRITICAL_TIMELOCK],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip320;
