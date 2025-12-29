import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const DEFAULT_PROXY_ADMIN = "0x7877ffd62649b6a1557b55d4c20fcbab17344c91";
export const RISK_FUND_V2_PROXY = "0x487CeF72dacABD7E12e633bb3B63815a386f7012";
export const RISK_FUND_V2_NEW_IMPLEMENTATION = "0x36b236c62AB32430016EC0EaE8e40ebe29d95869";

export const vip780 = () => {
  const meta = {
    version: "v2",
    title: "VIP-780 Upgrade RiskFundV2 Implementation",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [RISK_FUND_V2_PROXY, RISK_FUND_V2_NEW_IMPLEMENTATION],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip780;
