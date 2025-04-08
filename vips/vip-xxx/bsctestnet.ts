import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const RISK_STEWARD_RECEIVER_BSC_TESTNET = "0x31DEb4D1326838522697f7a012992f0824d80f2b";
export const MARKET_CAP_RISK_STEWARD_BSC_TESTNET = "0x9b40390771cAeEa69DE55EEd176aeDC72d70cA3E";
export const ACCESS_CONTROL_MANAGER_BSC_TESTNET = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";
export const NORMAL_TIMELOCK_BSC_TESTNET = "0xce10739590001705F7FF231611ba4A48B2820327";
export const BSC_TESTNET_CORE_COMPTROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";

export const RISK_STEWARD_RECEIVER_SEPOLIA = "0xDF1807d323Dd2E2871e8b394c8F7595E097e1C73";
export const MARKET_CAP_RISK_STEWARD_SEPOLIA = "0xEa687c54321Db5b20CA544f38f08E429a4bfCBc8";
export const ACCESS_CONTROL_MANAGER_SEPOLIA = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";
export const NORMAL_TIMELOCK_SEPOLIA = "0xc332F7D8D5eA72cf760ED0E1c0485c8891C6E0cF";

export const RISK_STEWARD_RECEIVER_OPBNBTESTNET = "0x3f0e45aC20048cE0a803c439913a638A8208602e";
export const MARKET_CAP_RISK_STEWARD_OPBNBTESTNET = "0x155F16CB2b5f69F66d4359d81C6cA55E8Be5a253";
export const ACCESS_CONTROL_MANAGER_OPBNBTESTNET = "0x049f77F7046266d27C3bC96376f53C17Ef09c986";
export const NORMAL_TIMELOCK_OPBNBTESTNET = "0x1c4e015Bd435Efcf4f58D82B0d0fBa8fC4F81120";

export const RISK_STEWARD_RECEIVER_ARBITRUMSEPOLIA = "0xE6b7B1846106605fdfaB3a9F407dd64bed6917a6";
export const MARKET_CAP_RISK_STEWARD_ARBITRUMSEPOLIA = "0xe739ff9CFa2CFA24fb7816133e1CBe7046A37Ecc";
export const ACCESS_CONTROL_MANAGER_ARBITRUMSEPOLIA = "0xa36AD96441cB931D8dFEAAaC97D3FaB4B39E590F";
export const NORMAL_TIMELOCK_ARBITRUMSEPOLIA = "0x794BCA78E606f3a462C31e5Aba98653Efc1322F8";

export const RISK_STEWARD_RECEIVER_OPSEPOLIA = "0x4fCbfE445396f31005b3Fd2F6DE2A986d6E2dCB5";
export const MARKET_CAP_RISK_STEWARD_OPSEPOLIA = "0x7831156A181288ce76B5952624Df6C842F4Cc0c1";
export const ACCESS_CONTROL_MANAGER_OPSEPOLIA = "0x1652E12C8ABE2f0D84466F0fc1fA4286491B3BC1";
export const NORMAL_TIMELOCK_OPSEPOLIA = "0xdDe31d7eEEAD7Cf9790F833C4FF4c6e61404402a";

export const RISK_STEWARD_RECEIVER_BASESEPOLIA = "0xf69fd7757c8A59DFA5c35622d9D44B31dB21B0a2";
export const MARKET_CAP_RISK_STEWARD_BASESEPOLIA = "0xE03E243AC1f3239ed6a0793C25E79C951339a915";
export const ACCESS_CONTROL_MANAGER_BASESEPOLIA = "0x724138223D8F76b519fdE715f60124E7Ce51e051";
export const NORMAL_TIMELOCK_BASESEPOLIA = "0xCc84f6122649eDc48f4a426814e6b6C6fF9bBe0a";

export const RISK_STEWARD_RECEIVER_UNICHAINSEPOLIA = "0x4fCbfE445396f31005b3Fd2F6DE2A986d6E2dCB5";
export const MARKET_CAP_RISK_STEWARD_UNICHAINSEPOLIA = "0x6edbFE9a95dB5f0CdDcE446A0Fe75D7832Cf8DDB";
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
      // bsc testnet
      {
        target: ACCESS_CONTROL_MANAGER_BSC_TESTNET,
        signature: "giveCallPermission(address,string,address)",
        params: [
          RISK_STEWARD_RECEIVER_BSC_TESTNET,
          "setRiskParameterConfig(string,address,uint256)",
          NORMAL_TIMELOCK_BSC_TESTNET,
        ],
      },
      {
        target: RISK_STEWARD_RECEIVER_BSC_TESTNET,
        signature: "setRiskParameterConfig(string,address,uint256)",
        params: ["supplyCap", MARKET_CAP_RISK_STEWARD_BSC_TESTNET, 600],
      },
      {
        target: RISK_STEWARD_RECEIVER_BSC_TESTNET,
        signature: "setRiskParameterConfig(string,address,uint256)",
        params: ["borrowCap", MARKET_CAP_RISK_STEWARD_BSC_TESTNET, 600],
      },
      {
        target: ACCESS_CONTROL_MANAGER_BSC_TESTNET,
        signature: "giveCallPermission(address,string,address)",
        params: [ANY_TARGET_CONTRACT, "setMarketSupplyCaps(address[],uint256[])", MARKET_CAP_RISK_STEWARD_BSC_TESTNET],
      },
      {
        target: ACCESS_CONTROL_MANAGER_BSC_TESTNET,
        signature: "giveCallPermission(address,string,address)",
        params: [ANY_TARGET_CONTRACT, "setMarketBorrowCaps(address[],uint256[])", MARKET_CAP_RISK_STEWARD_BSC_TESTNET],
      },
      {
        target: ACCESS_CONTROL_MANAGER_BSC_TESTNET,
        signature: "giveCallPermission(address,string,address)",
        params: [BSC_TESTNET_CORE_COMPTROLLER, "_setMarketSupplyCaps(address[],uint256[])", MARKET_CAP_RISK_STEWARD_BSC_TESTNET],
      },
      {
        target: ACCESS_CONTROL_MANAGER_BSC_TESTNET,
        signature: "giveCallPermission(address,string,address)",
        params: [BSC_TESTNET_CORE_COMPTROLLER, "_setMarketBorrowCaps(address[],uint256[])", MARKET_CAP_RISK_STEWARD_BSC_TESTNET],
      },

      // sepolia
      {
        target: ACCESS_CONTROL_MANAGER_SEPOLIA,
        signature: "giveCallPermission(address,string,address)",
        params: [
          RISK_STEWARD_RECEIVER_SEPOLIA,
          "setRiskParameterConfig(string,address,uint256)",
          NORMAL_TIMELOCK_SEPOLIA,
        ],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: RISK_STEWARD_RECEIVER_SEPOLIA,
        signature: "setRiskParameterConfig(string,address,uint256)",
        params: ["supplyCap", MARKET_CAP_RISK_STEWARD_SEPOLIA, 600],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: RISK_STEWARD_RECEIVER_SEPOLIA,
        signature: "setRiskParameterConfig(string,address,uint256)",
        params: ["borrowCap", MARKET_CAP_RISK_STEWARD_SEPOLIA, 600],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: ACCESS_CONTROL_MANAGER_SEPOLIA,
        signature: "giveCallPermission(address,string,address)",
        params: [ANY_TARGET_CONTRACT, "setMarketSupplyCaps(address[],uint256[])", MARKET_CAP_RISK_STEWARD_SEPOLIA],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: ACCESS_CONTROL_MANAGER_SEPOLIA,
        signature: "giveCallPermission(address,string,address)",
        params: [ANY_TARGET_CONTRACT, "setMarketBorrowCaps(address[],uint256[])", MARKET_CAP_RISK_STEWARD_SEPOLIA],
        dstChainId: LzChainId.sepolia,
      },
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
        params: ["supplyCap", MARKET_CAP_RISK_STEWARD_OPBNBTESTNET, 600],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: RISK_STEWARD_RECEIVER_OPBNBTESTNET,
        signature: "setRiskParameterConfig(string,address,uint256)",
        params: ["borrowCap", MARKET_CAP_RISK_STEWARD_OPBNBTESTNET, 600],
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
        params: ["supplyCap", MARKET_CAP_RISK_STEWARD_ARBITRUMSEPOLIA, 600],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: RISK_STEWARD_RECEIVER_ARBITRUMSEPOLIA,
        signature: "setRiskParameterConfig(string,address,uint256)",
        params: ["borrowCap", MARKET_CAP_RISK_STEWARD_ARBITRUMSEPOLIA, 600],
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
        params: ["supplyCap", MARKET_CAP_RISK_STEWARD_OPSEPOLIA, 600],
        dstChainId: LzChainId.opsepolia,
      },
      {
        target: RISK_STEWARD_RECEIVER_OPSEPOLIA,
        signature: "setRiskParameterConfig(string,address,uint256)",
        params: ["borrowCap", MARKET_CAP_RISK_STEWARD_OPSEPOLIA, 600],
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
        params: ["supplyCap", MARKET_CAP_RISK_STEWARD_BASESEPOLIA, 600],
        dstChainId: LzChainId.basesepolia,
      },
      {
        target: RISK_STEWARD_RECEIVER_BASESEPOLIA,
        signature: "setRiskParameterConfig(string,address,uint256)",
        params: ["borrowCap", MARKET_CAP_RISK_STEWARD_BASESEPOLIA, 600],
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
        params: ["supplyCap", MARKET_CAP_RISK_STEWARD_UNICHAINSEPOLIA, 600],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: RISK_STEWARD_RECEIVER_UNICHAINSEPOLIA,
        signature: "setRiskParameterConfig(string,address,uint256)",
        params: ["borrowCap", MARKET_CAP_RISK_STEWARD_UNICHAINSEPOLIA, 600],
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
        params: ["supplyCap", MARKET_CAP_RISK_STEWARD_ZKSYNCSEPOLIA, 600],
        dstChainId: LzChainId.zksyncsepolia,
      },
      {
        target: RISK_STEWARD_RECEIVER_ZKSYNCSEPOLIA,
        signature: "setRiskParameterConfig(string,address,uint256)",
        params: ["borrowCap", MARKET_CAP_RISK_STEWARD_ZKSYNCSEPOLIA, 600],
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
