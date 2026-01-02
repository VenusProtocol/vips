import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const DEFAULT_PROXY_ADMIN = "0x6beb6D2695B67FEb73ad4f172E8E2975497187e4";
export const RISK_FUND_V2_PROXY = "0xdF31a28D68A2AB381D42b380649Ead7ae2A76E42";
export const RISK_FUND_V2_NEW_IMPLEMENTATION = "0x60e322C3418EcAEA5E6859551c299c968adc9816";

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
