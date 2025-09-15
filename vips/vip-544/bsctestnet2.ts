import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { permissions } from "./bsctestnet1";

export const RISK_STEWARD_RECEIVER_OPSEPOLIA = "0x4fCbfE445396f31005b3Fd2F6DE2A986d6E2dCB5";
export const MARKET_CAP_RISK_STEWARD_OPSEPOLIA = "0x7831156A181288ce76B5952624Df6C842F4Cc0c1";
export const ACCESS_CONTROL_MANAGER_OPSEPOLIA = "0x1652E12C8ABE2f0D84466F0fc1fA4286491B3BC1";
export const NORMAL_TIMELOCK_OPSEPOLIA = "0xdDe31d7eEEAD7Cf9790F833C4FF4c6e61404402a";
export const CRITIAL_TIMELOCK_OPSEPOLIA = "0x45d2263c6E0dbF84eBffB1Ee0b80aC740607990B";
export const FAST_TRACK_TIMELOCK_OPSEPOLIA = "0xe0Fa35b6279dd802C382ae54c50C8B16deaC0885";

export const RISK_STEWARD_RECEIVER_BASESEPOLIA = "0xf69fd7757c8A59DFA5c35622d9D44B31dB21B0a2";
export const MARKET_CAP_RISK_STEWARD_BASESEPOLIA = "0xE03E243AC1f3239ed6a0793C25E79C951339a915";
export const ACCESS_CONTROL_MANAGER_BASESEPOLIA = "0x724138223D8F76b519fdE715f60124E7Ce51e051";
export const NORMAL_TIMELOCK_BASESEPOLIA = "0xCc84f6122649eDc48f4a426814e6b6C6fF9bBe0a";
export const CRITIAL_TIMELOCK_BASESEPOLIA = "0xbeDb7F2d0617292364bA4D73cf016c0f6BB5542E";
export const FAST_TRACK_TIMELOCK_BASESEPOLIA = "0x3dFA652D3aaDcb93F9EA7d160d674C441AaA8EE2";

export const RISK_STEWARD_RECEIVER_UNICHAINSEPOLIA = "0x4fCbfE445396f31005b3Fd2F6DE2A986d6E2dCB5";
export const MARKET_CAP_RISK_STEWARD_UNICHAINSEPOLIA = "0x6edbFE9a95dB5f0CdDcE446A0Fe75D7832Cf8DDB";
export const ACCESS_CONTROL_MANAGER_UNICHAINSEPOLIA = "0x854C064EA6b503A97980F481FA3B7279012fdeDd";
export const NORMAL_TIMELOCK_UNICHAINSEPOLIA = "0x5e20F5A2e23463D39287185DF84607DF7068F314";
export const CRITIAL_TIMELOCK_UNICHAINSEPOLIA = "0x86C093266e824FA4345484a7B9109e9567923DA6";
export const FAST_TRACK_TIMELOCK_UNICHAINSEPOLIA = "0x668cDb1A414006D0a26e9e13881D4Cd30B8b2a4A";

export const RISK_STEWARD_RECEIVER_ZKSYNCSEPOLIA = "0x25483111881c431492D010a9071Ce6C84C3b90A6";
export const MARKET_CAP_RISK_STEWARD_ZKSYNCSEPOLIA = "0xe88C01daAd0b931af68C9fD70bfa9bde8142FF64";
export const ACCESS_CONTROL_MANAGER_ZKSYNCSEPOLIA = "0xD07f543d47c3a8997D6079958308e981AC14CD01";
export const NORMAL_TIMELOCK_ZKSYNCSEPOLIA = "0x1730527a0f0930269313D77A317361b42971a67E";
export const CRITIAL_TIMELOCK_ZKSYNCSEPOLIA = "0x0E6138bE0FA1915efC73670a20A10EFd720a6Cc8";
export const FAST_TRACK_TIMELOCK_ZKSYNCSEPOLIA = "0xb055e028b27d53a455a6c040a6952e44E9E615c4";

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
      // opsepolia
      ...permissions(
        LzChainId.opsepolia,
        ACCESS_CONTROL_MANAGER_OPSEPOLIA,
        RISK_STEWARD_RECEIVER_OPSEPOLIA,
        MARKET_CAP_RISK_STEWARD_OPSEPOLIA,
        NORMAL_TIMELOCK_OPSEPOLIA,
        FAST_TRACK_TIMELOCK_OPSEPOLIA,
        CRITIAL_TIMELOCK_OPSEPOLIA,
      ),
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

      // basesepolia
      ...permissions(
        LzChainId.basesepolia,
        ACCESS_CONTROL_MANAGER_BASESEPOLIA,
        RISK_STEWARD_RECEIVER_BASESEPOLIA,
        MARKET_CAP_RISK_STEWARD_BASESEPOLIA,
        NORMAL_TIMELOCK_BASESEPOLIA,
        FAST_TRACK_TIMELOCK_BASESEPOLIA,
        CRITIAL_TIMELOCK_BASESEPOLIA,
      ),
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

      // unichainsepolia
      ...permissions(
        LzChainId.unichainsepolia,
        ACCESS_CONTROL_MANAGER_UNICHAINSEPOLIA,
        RISK_STEWARD_RECEIVER_UNICHAINSEPOLIA,
        MARKET_CAP_RISK_STEWARD_UNICHAINSEPOLIA,
        NORMAL_TIMELOCK_UNICHAINSEPOLIA,
        FAST_TRACK_TIMELOCK_UNICHAINSEPOLIA,
        CRITIAL_TIMELOCK_UNICHAINSEPOLIA,
      ),
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

      // zksyncsepolia
      ...permissions(
        LzChainId.zksyncsepolia,
        ACCESS_CONTROL_MANAGER_ZKSYNCSEPOLIA,
        RISK_STEWARD_RECEIVER_ZKSYNCSEPOLIA,
        MARKET_CAP_RISK_STEWARD_ZKSYNCSEPOLIA,
        NORMAL_TIMELOCK_ZKSYNCSEPOLIA,
        FAST_TRACK_TIMELOCK_ZKSYNCSEPOLIA,
        CRITIAL_TIMELOCK_ZKSYNCSEPOLIA,
      ),
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
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip544;
