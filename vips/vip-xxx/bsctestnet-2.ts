import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const MARKET_CAPS_RISK_STEWARD_IMPLEMENTATION = "0xD5C8Bbe05F198796d78c2845c860fE92F47C926f";
export const MARKET_CAPS_RISK_STEWARD = "0x67dD3aD52f6b575654651B5228de88fEF9462724";
export const ProxyAdmin = "0x7877ffd62649b6a1557b55d4c20fcbab17344c91";


export const vipXXX_2 = () => {
  const meta = {
    version: "v2",
    title: "VIP-XXX Update MarketCapsRiskSteward implementation",
    description: `#### Summary

Update MarketCapsRiskSteward implementation

#### Deployed contracts

- [New MarketCapsRiskSteward implementation on BNB chain](https://bscscan.com/address/${MARKET_CAPS_RISK_STEWARD_IMPLEMENTATION})

#### References

- [Pull request with the changes in the VBNBAdmin contract](https://github.com/VenusProtocol/venus-protocol/pull/)
- [Simulation post upgrade](https://github.com/VenusProtocol/vips/pull/)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: ProxyAdmin,
        signature: "upgrade(address,address)",
        params: [MARKET_CAPS_RISK_STEWARD, MARKET_CAPS_RISK_STEWARD_IMPLEMENTATION],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vipXXX_2;
