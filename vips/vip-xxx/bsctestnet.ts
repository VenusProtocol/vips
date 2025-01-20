import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
export const BNB_CORE_COMPTROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
export const LIQUID_STAKING_BNB_COMPTROLLER = "0x596B11acAACF03217287939f88d63b51d3771704";
export const DEFI_COMPTROLLER = "0x23a73971A6B9f6580c048B9CB188869B2A2aA2aD";
export const STABLECOIN_COMPTROLLER = "0x10b57706AD2345e590c2eA4DC02faef0d9f5b08B";
export const GAMEFI_COMPTROLLER = "0x1F4f0989C51f12DAcacD4025018176711f3Bf289";
export const BTC_COMPTROLLER = "0xfE87008bf29DeCACC09a75FaAc2d128367D46e7a";
export const TRON_COMPTROLLER = "0x11537D023f489E4EF0C7157cc729C7B69CbE0c97";
export const LIQUID_STAKING_ETH_COMPTROLLER = "0xC7859B809Ed5A2e98659ab5427D5B69e706aE26b";
export const MEME_COMPTROLLER = "0x92e8E3C202093A495e98C10f9fcaa5Abe288F74A";
export const ACM = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";
export const RISK_STEWARD_RECEIVER = "0x34e4505f92C8499B07eeb7Aa72404A490D152Ab3";
export const MARKET_CAPS_RISK_STEWARD = "0x05968239d978601146D3e50eE1F29e8571249fB0";


export const IL_COMPTROLLERS = [
  LIQUID_STAKING_BNB_COMPTROLLER,
  DEFI_COMPTROLLER,
  STABLECOIN_COMPTROLLER,
  GAMEFI_COMPTROLLER,
  BTC_COMPTROLLER,
  TRON_COMPTROLLER,
  LIQUID_STAKING_ETH_COMPTROLLER,
  MEME_COMPTROLLER
]

export const vipXXX = () => {
  const meta = {
    version: "v2",
    title: "VIP-XXX Configure Risk Steward Access Control",
    description: `If passed, this VIP will permission governance to set configurations on the RiskStewardReceiver, the RiskStewardReceiver to forward validated updates the the MarketCapsRiskSteward, and the MarketCapsRiskSteward to update market caps on comptrollers.

The following actions will be performed:
- Governance can call setRiskParameterConfig on the RiskStewardReceiver
- Governance can call toggleConfigActive on the RiskStewardReceiver
- Governance can call pause on the RiskStewardReceiver
- Governance can call unpause on the RiskStewardReceiver
- RiskStewardReceiver can call processUpdate on the MarketCapsRiskSteward
- Governance can call setMaxIncreaseBps on the MarketCapsRiskSteward
- MarketCapsRiskSteward can call _setMarketSupplyCaps on the BNB_CORE_COMPTROLLER
- MarketCapsRiskSteward can call _setMarketBorrowCaps on the BNB_CORE_COMPTROLLER
- MarketCapsRiskSteward can call setMarketSupplyCaps on IL comptrollers
- MarketCapsRiskSteward can call setMarketBorrowCaps on ILcomptrollers

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
        params: [RISK_STEWARD_RECEIVER, "pause()", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [RISK_STEWARD_RECEIVER, "unpause()", NORMAL_TIMELOCK],
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
        params: [BNB_CORE_COMPTROLLER, "_setMarketSupplyCaps(address[],uint256[])", MARKET_CAPS_RISK_STEWARD],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [BNB_CORE_COMPTROLLER, "_setMarketBorrowCaps(address[],uint256[])", MARKET_CAPS_RISK_STEWARD],
      },
      ...IL_COMPTROLLERS.map((comptroller) => ({
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [comptroller, "setMarketSupplyCaps(address[],uint256[])", MARKET_CAPS_RISK_STEWARD],
      })),
      ...IL_COMPTROLLERS.map((comptroller) => ({
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [comptroller, "setMarketBorrowCaps(address[],uint256[])", MARKET_CAPS_RISK_STEWARD],
      })),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vipXXX;
