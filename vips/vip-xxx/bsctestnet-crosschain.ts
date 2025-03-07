import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

// export const RISK_STEWARD_RECEIVER_SEPOLIA = "";
// export const MARKET_CAP_RISK_STEWARD_SEPOLIA = "";
// export const ACCESS_CONTROL_MANAGER_SEPOLIA = "";
// export const NORMAL_TIMELOCK_SEPOLIA = "";

export const RISK_STEWARD_RECEIVER_OPBNBTESTNET = "0x3F2b0d789ceB24A3270C3f4B176825882aE0D041";
export const MARKET_CAP_RISK_STEWARD_OPBNBTESTNET = "0x220646CE7c7136341ED919938e16700a84A5715c";
export const ACCESS_CONTROL_MANAGER_OPBNBTESTNET = "0x049f77F7046266d27C3bC96376f53C17Ef09c986";
export const NORMAL_TIMELOCK_OPBNBTESTNET = "0x1c4e015Bd435Efcf4f58D82B0d0fBa8fC4F81120";

export const RISK_STEWARD_RECEIVER_ARBITRUMSEPOLIA = "0x74E708A7F5486ed73CCCAe54B63e71B1988F1383";
export const MARKET_CAP_RISK_STEWARD_ARBITRUMSEPOLIA = "0xA03205bC635A772E533E7BE36b5701E331a70ea3";
export const ACCESS_CONTROL_MANAGER_ARBITRUMSEPOLIA = "0xa36AD96441cB931D8dFEAAaC97D3FaB4B39E590F";
export const NORMAL_TIMELOCK_ARBITRUMSEPOLIA = "0x794BCA78E606f3a462C31e5Aba98653Efc1322F8";

export const RISK_STEWARD_RECEIVER_OPSEPOLIA = "0xc9a4Cc7f05fa9DF9C331992451dB0209D29fC7cc";
export const MARKET_CAP_RISK_STEWARD_OPSEPOLIA = "0xA0439BFB9C9fe7B8451eE20673b796698ab52e95";
export const ACCESS_CONTROL_MANAGER_OPSEPOLIA = "0x1652E12C8ABE2f0D84466F0fc1fA4286491B3BC1";
export const NORMAL_TIMELOCK_OPSEPOLIA = "0xdDe31d7eEEAD7Cf9790F833C4FF4c6e61404402a";

export const RISK_STEWARD_RECEIVER_BASESEPOLIA = "0x06473fB3f7bF11e2E8EfEcC95aC55ABEFCb2e0A0";
export const MARKET_CAP_RISK_STEWARD_BASESEPOLIA = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";
export const ACCESS_CONTROL_MANAGER_BASESEPOLIA = "0x724138223D8F76b519fdE715f60124E7Ce51e051";
export const NORMAL_TIMELOCK_BASESEPOLIA = "0xCc84f6122649eDc48f4a426814e6b6C6fF9bBe0a";

export const RISK_STEWARD_RECEIVER_UNICHAINSEPOLIA = "0x06473fB3f7bF11e2E8EfEcC95aC55ABEFCb2e0A0";
export const MARKET_CAP_RISK_STEWARD_UNICHAINSEPOLIA = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";
export const ACCESS_CONTROL_MANAGER_UNICHAINSEPOLIA = "0x854C064EA6b503A97980F481FA3B7279012fdeDd";
export const NORMAL_TIMELOCK_UNICHAINSEPOLIA = "0x5e20F5A2e23463D39287185DF84607DF7068F314";

export const RISK_STEWARD_RECEIVER_ZKSYNCSEPOLIA = "0x25483111881c431492D010a9071Ce6C84C3b90A6";
export const MARKET_CAP_RISK_STEWARD_ZKSYNCSEPOLIA = "0xe88C01daAd0b931af68C9fD70bfa9bde8142FF64";
export const ACCESS_CONTROL_MANAGER_ZKSYNCSEPOLIA = "0xD07f543d47c3a8997D6079958308e981AC14CD01";
export const NORMAL_TIMELOCK_ZKSYNCSEPOLIA = "0x1730527a0f0930269313D77A317361b42971a67E";

export const ANY_TARGET_CONTRACT = "0x0000000000000000000000000000000000000000";

const vip457 = () => {
  const meta = {
    version: "v2",
    title: "Configure Remote Risk Stewards",
    description: `#### Summary
Configure Remote Risk Stewards
`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      // opbnbsepolia
      {
        target: ACCESS_CONTROL_MANAGER_OPBNBTESTNET,
        signature: "giveCallPermission(address,string,address)",
        params: [
          RISK_STEWARD_RECEIVER_OPBNBTESTNET,
          "setRiskParameterConfig(string,address,uint256)",
          NORMAL_TIMELOCK_OPBNBTESTNET,
        ],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: RISK_STEWARD_RECEIVER_OPBNBTESTNET,
        signature: "setRiskParameterConfig(string,address,uint256)",
        params: ["supplyCap", MARKET_CAP_RISK_STEWARD_OPBNBTESTNET, 86401],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: RISK_STEWARD_RECEIVER_OPBNBTESTNET,
        signature: "setRiskParameterConfig(string,address,uint256)",
        params: ["borrowCap", MARKET_CAP_RISK_STEWARD_OPBNBTESTNET, 86401],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: ACCESS_CONTROL_MANAGER_OPBNBTESTNET,
        signature: "giveCallPermission(address,string,address)",
        params: [ANY_TARGET_CONTRACT, "setMarketSupplyCaps(address[],uint256[])", MARKET_CAP_RISK_STEWARD_OPBNBTESTNET],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: ACCESS_CONTROL_MANAGER_OPBNBTESTNET,
        signature: "giveCallPermission(address,string,address)",
        params: [ANY_TARGET_CONTRACT, "setMarketBorrowCaps(address[],uint256[])", MARKET_CAP_RISK_STEWARD_OPBNBTESTNET],
        dstChainId: LzChainId.opbnbtestnet,
      },
      // arbitrumsepolia
      {
        target: ACCESS_CONTROL_MANAGER_ARBITRUMSEPOLIA,
        signature: "giveCallPermission(address,string,address)",
        params: [
          RISK_STEWARD_RECEIVER_ARBITRUMSEPOLIA,
          "setRiskParameterConfig(string,address,uint256)",
          NORMAL_TIMELOCK_ARBITRUMSEPOLIA,
        ],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: RISK_STEWARD_RECEIVER_ARBITRUMSEPOLIA,
        signature: "setRiskParameterConfig(string,address,uint256)",
        params: ["supplyCap", MARKET_CAP_RISK_STEWARD_ARBITRUMSEPOLIA, 86401],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: RISK_STEWARD_RECEIVER_ARBITRUMSEPOLIA,
        signature: "setRiskParameterConfig(string,address,uint256)",
        params: ["borrowCap", MARKET_CAP_RISK_STEWARD_ARBITRUMSEPOLIA, 86401],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ACCESS_CONTROL_MANAGER_ARBITRUMSEPOLIA,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ANY_TARGET_CONTRACT,
          "setMarketSupplyCaps(address[],uint256[])",
          MARKET_CAP_RISK_STEWARD_ARBITRUMSEPOLIA,
        ],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ACCESS_CONTROL_MANAGER_ARBITRUMSEPOLIA,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ANY_TARGET_CONTRACT,
          "setMarketBorrowCaps(address[],uint256[])",
          MARKET_CAP_RISK_STEWARD_ARBITRUMSEPOLIA,
        ],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      // opsepolia
      {
        target: ACCESS_CONTROL_MANAGER_OPSEPOLIA,
        signature: "giveCallPermission(address,string,address)",
        params: [
          RISK_STEWARD_RECEIVER_OPSEPOLIA,
          "setRiskParameterConfig(string,address,uint256)",
          NORMAL_TIMELOCK_OPSEPOLIA,
        ],
        dstChainId: LzChainId.opsepolia,
      },
      {
        target: RISK_STEWARD_RECEIVER_OPSEPOLIA,
        signature: "setRiskParameterConfig(string,address,uint256)",
        params: ["supplyCap", MARKET_CAP_RISK_STEWARD_OPSEPOLIA, 86401],
        dstChainId: LzChainId.opsepolia,
      },
      {
        target: RISK_STEWARD_RECEIVER_OPSEPOLIA,
        signature: "setRiskParameterConfig(string,address,uint256)",
        params: ["borrowCap", MARKET_CAP_RISK_STEWARD_OPSEPOLIA, 86401],
        dstChainId: LzChainId.opsepolia,
      },
      {
        target: ACCESS_CONTROL_MANAGER_OPSEPOLIA,
        signature: "giveCallPermission(address,string,address)",
        params: [ANY_TARGET_CONTRACT, "setMarketSupplyCaps(address[],uint256[])", MARKET_CAP_RISK_STEWARD_OPSEPOLIA],
        dstChainId: LzChainId.opsepolia,
      },
      {
        target: ACCESS_CONTROL_MANAGER_OPSEPOLIA,
        signature: "giveCallPermission(address,string,address)",
        params: [ANY_TARGET_CONTRACT, "setMarketBorrowCaps(address[],uint256[])", MARKET_CAP_RISK_STEWARD_OPSEPOLIA],
        dstChainId: LzChainId.opsepolia,
      },
      // basesepolia
      {
        target: ACCESS_CONTROL_MANAGER_BASESEPOLIA,
        signature: "giveCallPermission(address,string,address)",
        params: [
          RISK_STEWARD_RECEIVER_BASESEPOLIA,
          "setRiskParameterConfig(string,address,uint256)",
          NORMAL_TIMELOCK_BASESEPOLIA,
        ],
        dstChainId: LzChainId.basesepolia,
      },
      {
        target: RISK_STEWARD_RECEIVER_BASESEPOLIA,
        signature: "setRiskParameterConfig(string,address,uint256)",
        params: ["supplyCap", MARKET_CAP_RISK_STEWARD_BASESEPOLIA, 86401],
        dstChainId: LzChainId.basesepolia,
      },
      {
        target: RISK_STEWARD_RECEIVER_BASESEPOLIA,
        signature: "setRiskParameterConfig(string,address,uint256)",
        params: ["borrowCap", MARKET_CAP_RISK_STEWARD_BASESEPOLIA, 86401],
        dstChainId: LzChainId.basesepolia,
      },
      {
        target: ACCESS_CONTROL_MANAGER_BASESEPOLIA,
        signature: "giveCallPermission(address,string,address)",
        params: [ANY_TARGET_CONTRACT, "setMarketSupplyCaps(address[],uint256[])", MARKET_CAP_RISK_STEWARD_BASESEPOLIA],
        dstChainId: LzChainId.basesepolia,
      },
      {
        target: ACCESS_CONTROL_MANAGER_BASESEPOLIA,
        signature: "giveCallPermission(address,string,address)",
        params: [ANY_TARGET_CONTRACT, "setMarketBorrowCaps(address[],uint256[])", MARKET_CAP_RISK_STEWARD_BASESEPOLIA],
        dstChainId: LzChainId.basesepolia,
      },
      // unichainsepolia
      {
        target: ACCESS_CONTROL_MANAGER_UNICHAINSEPOLIA,
        signature: "giveCallPermission(address,string,address)",
        params: [
          RISK_STEWARD_RECEIVER_UNICHAINSEPOLIA,
          "setRiskParameterConfig(string,address,uint256)",
          NORMAL_TIMELOCK_UNICHAINSEPOLIA,
        ],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: RISK_STEWARD_RECEIVER_UNICHAINSEPOLIA,
        signature: "setRiskParameterConfig(string,address,uint256)",
        params: ["supplyCap", MARKET_CAP_RISK_STEWARD_UNICHAINSEPOLIA, 86401],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: RISK_STEWARD_RECEIVER_UNICHAINSEPOLIA,
        signature: "setRiskParameterConfig(string,address,uint256)",
        params: ["borrowCap", MARKET_CAP_RISK_STEWARD_UNICHAINSEPOLIA, 86401],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: ACCESS_CONTROL_MANAGER_UNICHAINSEPOLIA,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ANY_TARGET_CONTRACT,
          "setMarketSupplyCaps(address[],uint256[])",
          MARKET_CAP_RISK_STEWARD_UNICHAINSEPOLIA,
        ],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: ACCESS_CONTROL_MANAGER_UNICHAINSEPOLIA,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ANY_TARGET_CONTRACT,
          "setMarketBorrowCaps(address[],uint256[])",
          MARKET_CAP_RISK_STEWARD_UNICHAINSEPOLIA,
        ],
        dstChainId: LzChainId.unichainsepolia,
      },
      // zksyncsepolia
      {
        target: ACCESS_CONTROL_MANAGER_ZKSYNCSEPOLIA,
        signature: "giveCallPermission(address,string,address)",
        params: [
          RISK_STEWARD_RECEIVER_ZKSYNCSEPOLIA,
          "setRiskParameterConfig(string,address,uint256)",
          NORMAL_TIMELOCK_ZKSYNCSEPOLIA,
        ],
        dstChainId: LzChainId.zksyncsepolia,
      },
      {
        target: RISK_STEWARD_RECEIVER_ZKSYNCSEPOLIA,
        signature: "setRiskParameterConfig(string,address,uint256)",
        params: ["supplyCap", MARKET_CAP_RISK_STEWARD_ZKSYNCSEPOLIA, 86401],
        dstChainId: LzChainId.zksyncsepolia,
      },
      {
        target: RISK_STEWARD_RECEIVER_ZKSYNCSEPOLIA,
        signature: "setRiskParameterConfig(string,address,uint256)",
        params: ["borrowCap", MARKET_CAP_RISK_STEWARD_ZKSYNCSEPOLIA, 86401],
        dstChainId: LzChainId.zksyncsepolia,
      },
      {
        target: ACCESS_CONTROL_MANAGER_ZKSYNCSEPOLIA,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ANY_TARGET_CONTRACT,
          "setMarketSupplyCaps(address[],uint256[])",
          MARKET_CAP_RISK_STEWARD_ZKSYNCSEPOLIA,
        ],
        dstChainId: LzChainId.zksyncsepolia,
      },
      {
        target: ACCESS_CONTROL_MANAGER_ZKSYNCSEPOLIA,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ANY_TARGET_CONTRACT,
          "setMarketBorrowCaps(address[],uint256[])",
          MARKET_CAP_RISK_STEWARD_ZKSYNCSEPOLIA,
        ],
        dstChainId: LzChainId.zksyncsepolia,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip457;
