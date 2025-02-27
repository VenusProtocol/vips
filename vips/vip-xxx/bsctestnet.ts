import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const RISK_STEWARD_RECEIVER = "0x31DEb4D1326838522697f7a012992f0824d80f2b";
export const MARKET_CAP_RISK_STEWARD = "0x9b40390771cAeEa69DE55EEd176aeDC72d70cA3E";
export const ACCESS_CONTROL_MANAGER = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";
export const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
export const COMPTROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
export const ANY_TARGET_CONTRACT = "0x0000000000000000000000000000000000000000"; 

const vip457 = () => {
  const meta = {
    version: "v2",
    title: "Configure Risk Steward",
    description: `#### Summary
Configure Risk Steward
`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [RISK_STEWARD_RECEIVER, "setRiskParameterConfig(string,address,uint256)", NORMAL_TIMELOCK],
      },
      {
        target: RISK_STEWARD_RECEIVER,
          signature: "setRiskParameterConfig(string,address,uint256)",
          params: ["supplyCap", MARKET_CAP_RISK_STEWARD, 86401],
      },
      {
        target:  RISK_STEWARD_RECEIVER,
          signature: "setRiskParameterConfig(string,address,uint256)",
          params: ["borrowCap", MARKET_CAP_RISK_STEWARD, 86401],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ANY_TARGET_CONTRACT, "setMarketSupplyCaps(address[],uint256[])", MARKET_CAP_RISK_STEWARD],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ANY_TARGET_CONTRACT, "setMarketBorrowCaps(address[],uint256[])", MARKET_CAP_RISK_STEWARD],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [COMPTROLLER, "_setMarketBorrowCaps(address[],uint256[])", MARKET_CAP_RISK_STEWARD],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [COMPTROLLER, "_setMarketSupplyCaps(address[],uint256[])", MARKET_CAP_RISK_STEWARD],
      },
      
    ],
    meta,
    ProposalType.REGULAR
  );
};

export default vip457;
