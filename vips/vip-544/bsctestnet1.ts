import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const RISK_STEWARD_RECEIVER_BSC_TESTNET = "0x31DEb4D1326838522697f7a012992f0824d80f2b";
export const MARKET_CAP_RISK_STEWARD_BSC_TESTNET = "0x9b40390771cAeEa69DE55EEd176aeDC72d70cA3E";
export const ACCESS_CONTROL_MANAGER_BSC_TESTNET = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";
export const NORMAL_TIMELOCK_BSC_TESTNET = "0xce10739590001705F7FF231611ba4A48B2820327";
export const BSC_TESTNET_CORE_COMPTROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
export const CRITIAL_TIMELOCK_BSC_TESTNET = "0x23B893a7C45a5Eb8c8C062b9F32d0D2e43eD286D";
export const FAST_TRACK_TIMELOCK_BSC_TESTNET = "0x3CFf21b7AF8390fE68799D58727d3b4C25a83cb6";

export const RISK_STEWARD_RECEIVER_SEPOLIA = "0xDF1807d323Dd2E2871e8b394c8F7595E097e1C73";
export const MARKET_CAP_RISK_STEWARD_SEPOLIA = "0xEa687c54321Db5b20CA544f38f08E429a4bfCBc8";
export const ACCESS_CONTROL_MANAGER_SEPOLIA = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";
export const NORMAL_TIMELOCK_SEPOLIA = "0xc332F7D8D5eA72cf760ED0E1c0485c8891C6E0cF";
export const CRITIAL_TIMELOCK_SEPOLIA = "0xA24A7A65b8968a749841988Bd7d05F6a94329fDe";
export const FAST_TRACK_TIMELOCK_SEPOLIA = "0x7F043F43Adb392072a3Ba0cC9c96e894C6f7e182";

export const RISK_STEWARD_RECEIVER_OPBNBTESTNET = "0x3f0e45aC20048cE0a803c439913a638A8208602e";
export const MARKET_CAP_RISK_STEWARD_OPBNBTESTNET = "0x155F16CB2b5f69F66d4359d81C6cA55E8Be5a253";
export const ACCESS_CONTROL_MANAGER_OPBNBTESTNET = "0x049f77F7046266d27C3bC96376f53C17Ef09c986";
export const NORMAL_TIMELOCK_OPBNBTESTNET = "0x1c4e015Bd435Efcf4f58D82B0d0fBa8fC4F81120";
export const CRITIAL_TIMELOCK_OPBNBTESTNET = "0xBd06aCDEF38230F4EdA0c6FD392905Ad463e42E3";
export const FAST_TRACK_TIMELOCK_OPBNBTESTNET = "0xB2E6268085E75817669479b22c73C2AfEaADF7A6";

export const RISK_STEWARD_RECEIVER_ARBITRUMSEPOLIA = "0xE6b7B1846106605fdfaB3a9F407dd64bed6917a6";
export const MARKET_CAP_RISK_STEWARD_ARBITRUMSEPOLIA = "0xe739ff9CFa2CFA24fb7816133e1CBe7046A37Ecc";
export const ACCESS_CONTROL_MANAGER_ARBITRUMSEPOLIA = "0xa36AD96441cB931D8dFEAAaC97D3FaB4B39E590F";
export const NORMAL_TIMELOCK_ARBITRUMSEPOLIA = "0x794BCA78E606f3a462C31e5Aba98653Efc1322F8";
export const CRITIAL_TIMELOCK_ARBITRUMSEPOLIA = "0x0b32Be083f7041608E023007e7802430396a2123";
export const FAST_TRACK_TIMELOCK_ARBITRUMSEPOLIA = "0x14642991184F989F45505585Da52ca6A6a7dD4c8";

export const ANY_TARGET_CONTRACT = "0x0000000000000000000000000000000000000000";

export const permissions = (
  chain: LzChainId | undefined,
  acm: string,
  riskStewardReceiver: string,
  marketCapRiskSteward: string,
  normalTimelock: string,
  fastTrackTimelock: string,
  criticalTimelock: string,
) => {
  return [
    {
      target: acm,
      signature: "giveCallPermission(address,string,address)",
      params: [riskStewardReceiver, "setRiskParameterConfig(string,address,uint256)", normalTimelock],
      dstChainId: chain,
    },
    {
      target: acm,
      signature: "giveCallPermission(address,string,address)",
      params: [ANY_TARGET_CONTRACT, "setMarketSupplyCaps(address[],uint256[])", marketCapRiskSteward],
      dstChainId: chain,
    },
    {
      target: acm,
      signature: "giveCallPermission(address,string,address)",
      params: [ANY_TARGET_CONTRACT, "setMarketBorrowCaps(address[],uint256[])", marketCapRiskSteward],
      dstChainId: chain,
    },
    {
      target: acm,
      signature: "giveCallPermission(address,string,address)",
      params: [riskStewardReceiver, "toggleConfigActive(string)", normalTimelock],
      dstChainId: chain,
    },
    {
      target: acm,
      signature: "giveCallPermission(address,string,address)",
      params: [riskStewardReceiver, "toggleConfigActive(string)", criticalTimelock],
      dstChainId: chain,
    },
    {
      target: acm,
      signature: "giveCallPermission(address,string,address)",
      params: [riskStewardReceiver, "toggleConfigActive(string)", fastTrackTimelock],
      dstChainId: chain,
    },
    {
      target: acm,
      signature: "giveCallPermission(address,string,address)",
      params: [riskStewardReceiver, "pause()", normalTimelock],
      dstChainId: chain,
    },
    {
      target: acm,
      signature: "giveCallPermission(address,string,address)",
      params: [riskStewardReceiver, "pause()", criticalTimelock],
      dstChainId: chain,
    },
    {
      target: acm,
      signature: "giveCallPermission(address,string,address)",
      params: [riskStewardReceiver, "pause()", fastTrackTimelock],
      dstChainId: chain,
    },
    {
      target: acm,
      signature: "giveCallPermission(address,string,address)",
      params: [riskStewardReceiver, "unpause()", normalTimelock],
      dstChainId: chain,
    },
    {
      target: acm,
      signature: "giveCallPermission(address,string,address)",
      params: [riskStewardReceiver, "unpause()", criticalTimelock],
      dstChainId: chain,
    },
    {
      target: acm,
      signature: "giveCallPermission(address,string,address)",
      params: [riskStewardReceiver, "unpause()", fastTrackTimelock],
      dstChainId: chain,
    },
    {
      target: acm,
      signature: "giveCallPermission(address,string,address)",
      params: [marketCapRiskSteward, "processUpdate(RiskParameterUpdate)", riskStewardReceiver],
      dstChainId: chain,
    },
    {
      target: acm,
      signature: "giveCallPermission(address,string,address)",
      params: [marketCapRiskSteward, "setMaxDeltaBps(uint256)", normalTimelock],
      dstChainId: chain,
    },
    {
      target: acm,
      signature: "giveCallPermission(address,string,address)",
      params: [marketCapRiskSteward, "setMaxDeltaBps(uint256)", criticalTimelock],
      dstChainId: chain,
    },
    {
      target: acm,
      signature: "giveCallPermission(address,string,address)",
      params: [marketCapRiskSteward, "setMaxDeltaBps(uint256)", fastTrackTimelock],
      dstChainId: chain,
    },
  ];
};

const vip544 = () => {
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
      ...permissions(
        undefined,
        ACCESS_CONTROL_MANAGER_BSC_TESTNET,
        RISK_STEWARD_RECEIVER_BSC_TESTNET,
        MARKET_CAP_RISK_STEWARD_BSC_TESTNET,
        NORMAL_TIMELOCK_BSC_TESTNET,
        FAST_TRACK_TIMELOCK_BSC_TESTNET,
        CRITIAL_TIMELOCK_BSC_TESTNET,
      ),
      {
        target: RISK_STEWARD_RECEIVER_BSC_TESTNET,
        signature: "setRiskParameterConfig(string,address,uint256)",
        params: ["supplyCap", MARKET_CAP_RISK_STEWARD_BSC_TESTNET, 86401],
      },
      {
        target: RISK_STEWARD_RECEIVER_BSC_TESTNET,
        signature: "setRiskParameterConfig(string,address,uint256)",
        params: ["borrowCap", MARKET_CAP_RISK_STEWARD_BSC_TESTNET, 86401],
      },
      {
        target: ACCESS_CONTROL_MANAGER_BSC_TESTNET,
        signature: "giveCallPermission(address,string,address)",
        params: [
          BSC_TESTNET_CORE_COMPTROLLER,
          "_setMarketSupplyCaps(address[],uint256[])",
          MARKET_CAP_RISK_STEWARD_BSC_TESTNET,
        ],
      },
      {
        target: ACCESS_CONTROL_MANAGER_BSC_TESTNET,
        signature: "giveCallPermission(address,string,address)",
        params: [
          BSC_TESTNET_CORE_COMPTROLLER,
          "_setMarketBorrowCaps(address[],uint256[])",
          MARKET_CAP_RISK_STEWARD_BSC_TESTNET,
        ],
      },

      // sepolia
      ...permissions(
        LzChainId.sepolia,
        ACCESS_CONTROL_MANAGER_SEPOLIA,
        RISK_STEWARD_RECEIVER_SEPOLIA,
        MARKET_CAP_RISK_STEWARD_SEPOLIA,
        NORMAL_TIMELOCK_SEPOLIA,
        FAST_TRACK_TIMELOCK_SEPOLIA,
        CRITIAL_TIMELOCK_SEPOLIA,
      ),
      {
        target: RISK_STEWARD_RECEIVER_SEPOLIA,
        signature: "setRiskParameterConfig(string,address,uint256)",
        params: ["supplyCap", MARKET_CAP_RISK_STEWARD_SEPOLIA, 86401],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: RISK_STEWARD_RECEIVER_SEPOLIA,
        signature: "setRiskParameterConfig(string,address,uint256)",
        params: ["borrowCap", MARKET_CAP_RISK_STEWARD_SEPOLIA, 86401],
        dstChainId: LzChainId.sepolia,
      },

      // opbnbtestnet
      ...permissions(
        LzChainId.opbnbtestnet,
        ACCESS_CONTROL_MANAGER_OPBNBTESTNET,
        RISK_STEWARD_RECEIVER_OPBNBTESTNET,
        MARKET_CAP_RISK_STEWARD_OPBNBTESTNET,
        NORMAL_TIMELOCK_OPBNBTESTNET,
        FAST_TRACK_TIMELOCK_OPBNBTESTNET,
        CRITIAL_TIMELOCK_OPBNBTESTNET,
      ),
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

      // arbitrumsepolia
      ...permissions(
        LzChainId.arbitrumsepolia,
        ACCESS_CONTROL_MANAGER_ARBITRUMSEPOLIA,
        RISK_STEWARD_RECEIVER_ARBITRUMSEPOLIA,
        MARKET_CAP_RISK_STEWARD_ARBITRUMSEPOLIA,
        NORMAL_TIMELOCK_ARBITRUMSEPOLIA,
        FAST_TRACK_TIMELOCK_ARBITRUMSEPOLIA,
        CRITIAL_TIMELOCK_ARBITRUMSEPOLIA,
      ),
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
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip544;
