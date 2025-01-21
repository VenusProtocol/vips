import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
export const CRITICAL_TIMELOCK = "0x23B893a7C45a5Eb8c8C062b9F32d0D2e43eD286D";
export const FAST_TRACK_TIMELOCK = "0x3CFf21b7AF8390fE68799D58727d3b4C25a83cb6";
export const BNB_CORE_COMPTROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
export const ACM = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";
export const RISK_STEWARD_RECEIVER = "0xec20a50A9c162f64eF8D215eD7f688bf57f8cDB9";
export const MARKET_CAPS_RISK_STEWARD = "0x67dD3aD52f6b575654651B5228de88fEF9462724";
export const WILDCARD_ROLE = "0x0000000000000000000000000000000000000000";

const TEN_MINUTES = 60 * 10;
export const vipXXX = () => {
  const meta = {
    version: "v2",
    title: "VIP-XXX Configure Risk Steward Access Control",
    description: `If passed, this VIP will permission governance to set configurations on the RiskStewardReceiver, the RiskStewardReceiver to forward validated updates the the MarketCapsRiskSteward, and the MarketCapsRiskSteward to update market caps on comptrollers.
This proposal will also set the risk parameter configs for updating the supplyCap and borrowCap configurations on the RiskStewardReceiver.

The following permissions will be granted:
- Governance can call setRiskParameterConfig on the RiskStewardReceiver
- Governance can call toggleConfigActive on the RiskStewardReceiver
- Governance can call pause on the RiskStewardReceiver
- Governance can call unpause on the RiskStewardReceiver
- RiskStewardReceiver can call processUpdate on the MarketCapsRiskSteward
- Governance can call setMaxIncreaseBps on the MarketCapsRiskSteward
- MarketCapsRiskSteward can call _setMarketSupplyCaps on the BNB_CORE_COMPTROLLER
- MarketCapsRiskSteward can call _setMarketBorrowCaps on the BNB_CORE_COMPTROLLER
- MarketCapsRiskSteward can call setMarketSupplyCaps on IL comptrollers
- MarketCapsRiskSteward can call setMarketBorrowCaps on IL comptrollers

Risk Paramater Configs:
- SupplyCap: RiskSteward: ${MARKET_CAPS_RISK_STEWARD}, Debounce: ${TEN_MINUTES}, Active: true
- BorrowCap: RiskSteward: ${MARKET_CAPS_RISK_STEWARD}, Debounce: ${TEN_MINUTES}, Active: true

VIP simulation: [https://github.com/VenusProtocol/vips/pull/459](https://github.com/VenusProtocol/vips/pull/XXX)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [RISK_STEWARD_RECEIVER, "setRiskParameterConfig(string,address,uint256)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [RISK_STEWARD_RECEIVER, "toggleConfigActive(string)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [RISK_STEWARD_RECEIVER, "toggleConfigActive(string)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [RISK_STEWARD_RECEIVER, "toggleConfigActive(string)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [RISK_STEWARD_RECEIVER, "pause()", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [RISK_STEWARD_RECEIVER, "pause()", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [RISK_STEWARD_RECEIVER, "pause()", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [RISK_STEWARD_RECEIVER, "unpause()", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [RISK_STEWARD_RECEIVER, "unpause()", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [RISK_STEWARD_RECEIVER, "unpause()", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [MARKET_CAPS_RISK_STEWARD, "processUpdate(RiskParameterUpdate)", RISK_STEWARD_RECEIVER],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [MARKET_CAPS_RISK_STEWARD, "setMaxIncreaseBps(uint256)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [MARKET_CAPS_RISK_STEWARD, "setMaxIncreaseBps(uint256)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [MARKET_CAPS_RISK_STEWARD, "setMaxIncreaseBps(uint256)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [BNB_CORE_COMPTROLLER, "_setMarketSupplyCaps(address[],uint256[])", MARKET_CAPS_RISK_STEWARD],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [BNB_CORE_COMPTROLLER, "_setMarketBorrowCaps(address[],uint256[])", MARKET_CAPS_RISK_STEWARD],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [WILDCARD_ROLE, "setMarketSupplyCaps(address[],uint256[])", MARKET_CAPS_RISK_STEWARD],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [WILDCARD_ROLE, "setMarketBorrowCaps(address[],uint256[])", MARKET_CAPS_RISK_STEWARD],
      },
      {
        target: RISK_STEWARD_RECEIVER,
        signature: "setRiskParameterConfig(string,address,uint256)",
        params: ["supplyCap", MARKET_CAPS_RISK_STEWARD, TEN_MINUTES],
      },
      {
        target: RISK_STEWARD_RECEIVER,
        signature: "setRiskParameterConfig(string,address,uint256)",
        params: ["borrowCap", MARKET_CAPS_RISK_STEWARD, TEN_MINUTES],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vipXXX;
