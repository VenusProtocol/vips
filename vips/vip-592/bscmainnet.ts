import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalMeta, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;
export const CORE_COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const RISK_ORACLE = "0x0E3E51958b0Daa8C57c949675975CBEDd7b5a1a1";
export const RISK_STEWARD_RECEIVER = "0x47856bFa74B71d24a5545c7506862B8FddE52baB";
export const MARKETCAP_STEWARD = "0x816FfD00A274EDE0091421F77817ca260Db3a3E3";
export const COLLATERALFACTORS_STEWARD = "0x1414ADf007E324ec1D0A77b9F1A8759Ad33d2879";
export const IRM_STEWARD = "0x8acaBc42Bb98E2e2b091902a7E23f60CcB730aaa";

export const WHITELISTED_EXECUTORS = ["0x83f426233B358A36953F6951161E76FB7c866a7A"];
export const RISK_PARAMETER_SENDER = ["0x83f426233B358A36953F6951161E76FB7c866a7A"];
export const UPDATE_TYPES = ["supplyCap", "borrowCap", "collateralFactors", "interestRateModel"];
export const DEBOUNCE = 259200; // THREE_DAYS
export const TIMELOCK = 21600; // SIX_HOURS
export const MC_STEWARD_SAFE_DELTA = 5000; // 50%
export const CF_STEWARD_SAFE_DELTA = 1000; // 10%

export const vip592 = async () => {
  const meta: ProposalMeta = {
    version: "v2",
    title: "VIP-592 [BNB Chain] Risk Stewards Framework Implementation",
    description: `**Description :**

This proposal introduces a **Risk Stewards framework** for Venus Protocol across all supported chains to improve the efficiency and responsiveness of risk parameter management.
Community Post:  [**Proposed Risk Stewards Framework for More Efficient Risk Management**](https://community.venus.io/t/proposed-risk-stewards-framework-for-more-efficient-risk-management/5606)

Currently, most risk parameter updates follow the same governance process regardless of scope or urgency. The proposed framework categorises parameters by impact level and allows approved Risk Stewards to propose bounded adjustments under differentiated review paths, while maintaining governance oversight for higher-impact changes.

The framework aims to enable more proactive risk management, reduce operational overhead for routine updates, and improve adaptability to market conditions.

- The newly onboarded risk manager, **Allez Labs,** will be added as a Risk Steward under the defined permissions of this framework
- From a user perspective, the system operates in the background, with parameter updates communicated transparently when executed.

**Action :**

- Establish the **Risk Stewards framework** across Venus markets on all supported chains
- Authorise approved Risk Stewards to propose risk parameter adjustments within predefined bounds
- Enforce safeguards including adjustment limits and frequency controls

If approved, this VIP authorises the implementation of the Risk Stewards framework and the onboarding of Allez Labs in the future to enhance Venus’ risk management processes while preserving governance oversight for material changes.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // ACM
      // RISK ORACLE
      ...[bscmainnet.NORMAL_TIMELOCK].map(timelock => {
        return {
          target: bscmainnet.ACCESS_CONTROL_MANAGER,
          signature: "giveCallPermission(address,string,address)",
          params: [RISK_ORACLE, "addAuthorizedSender(address)", timelock],
        };
      }),
      ...[
        bscmainnet.NORMAL_TIMELOCK,
        bscmainnet.FAST_TRACK_TIMELOCK,
        bscmainnet.CRITICAL_TIMELOCK,
        bscmainnet.GUARDIAN,
      ].map(timelock => {
        return {
          target: bscmainnet.ACCESS_CONTROL_MANAGER,
          signature: "giveCallPermission(address,string,address)",
          params: [RISK_ORACLE, "removeAuthorizedSender(address)", timelock],
        };
      }),
      ...[bscmainnet.NORMAL_TIMELOCK, bscmainnet.FAST_TRACK_TIMELOCK].map(timelock => {
        return {
          target: bscmainnet.ACCESS_CONTROL_MANAGER,
          signature: "giveCallPermission(address,string,address)",
          params: [RISK_ORACLE, "addUpdateType(string)", timelock],
        };
      }),
      ...[
        bscmainnet.NORMAL_TIMELOCK,
        bscmainnet.FAST_TRACK_TIMELOCK,
        bscmainnet.CRITICAL_TIMELOCK,
        bscmainnet.GUARDIAN,
      ].map(timelock => {
        return {
          target: bscmainnet.ACCESS_CONTROL_MANAGER,
          signature: "giveCallPermission(address,string,address)",
          params: [RISK_ORACLE, "setUpdateTypeActive(string,bool)", timelock],
        };
      }),

      // RSR
      ...[bscmainnet.NORMAL_TIMELOCK, bscmainnet.FAST_TRACK_TIMELOCK].map(timelock => {
        return {
          target: bscmainnet.ACCESS_CONTROL_MANAGER,
          signature: "giveCallPermission(address,string,address)",
          params: [RISK_STEWARD_RECEIVER, "setRiskParameterConfig(string,address,uint256,uint256)", timelock],
        };
      }),
      ...[
        bscmainnet.NORMAL_TIMELOCK,
        bscmainnet.FAST_TRACK_TIMELOCK,
        bscmainnet.CRITICAL_TIMELOCK,
        bscmainnet.GUARDIAN,
      ].map(timelock => {
        return {
          target: bscmainnet.ACCESS_CONTROL_MANAGER,
          signature: "giveCallPermission(address,string,address)",
          params: [RISK_STEWARD_RECEIVER, "setConfigActive(string,bool)", timelock],
        };
      }),
      ...[
        bscmainnet.NORMAL_TIMELOCK,
        bscmainnet.FAST_TRACK_TIMELOCK,
        bscmainnet.CRITICAL_TIMELOCK,
        bscmainnet.GUARDIAN,
      ].map(timelock => {
        return {
          target: bscmainnet.ACCESS_CONTROL_MANAGER,
          signature: "giveCallPermission(address,string,address)",
          params: [RISK_STEWARD_RECEIVER, "setWhitelistedExecutor(address,bool)", timelock],
        };
      }),
      ...[
        bscmainnet.NORMAL_TIMELOCK,
        bscmainnet.FAST_TRACK_TIMELOCK,
        bscmainnet.CRITICAL_TIMELOCK,
        bscmainnet.GUARDIAN,
      ].map(timelock => {
        return {
          target: bscmainnet.ACCESS_CONTROL_MANAGER,
          signature: "giveCallPermission(address,string,address)",
          params: [RISK_STEWARD_RECEIVER, "setPaused(bool)", timelock],
        };
      }),

      // RS
      ...[bscmainnet.NORMAL_TIMELOCK, bscmainnet.FAST_TRACK_TIMELOCK].map(timelock => {
        return {
          target: bscmainnet.ACCESS_CONTROL_MANAGER,
          signature: "giveCallPermission(address,string,address)",
          params: [MARKETCAP_STEWARD, "setSafeDeltaBps(uint256)", timelock],
        };
      }),
      ...[bscmainnet.NORMAL_TIMELOCK, bscmainnet.FAST_TRACK_TIMELOCK].map(timelock => {
        return {
          target: bscmainnet.ACCESS_CONTROL_MANAGER,
          signature: "giveCallPermission(address,string,address)",
          params: [COLLATERALFACTORS_STEWARD, "setSafeDeltaBps(uint256)", timelock],
        };
      }),

      // MARKETCAP_STEWARD
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [CORE_COMPTROLLER, "_setMarketBorrowCaps(address[],uint256[])", MARKETCAP_STEWARD],
      },
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [CORE_COMPTROLLER, "_setMarketSupplyCaps(address[],uint256[])", MARKETCAP_STEWARD],
      },

      // CF_STEWARD
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [CORE_COMPTROLLER, "setCollateralFactor(uint96,address,uint256,uint256)", COLLATERALFACTORS_STEWARD],
      },

      // IRM_STEWARD
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "_setInterestRateModel(address)", IRM_STEWARD],
      },

      ...[RISK_ORACLE, RISK_STEWARD_RECEIVER, MARKETCAP_STEWARD, COLLATERALFACTORS_STEWARD, IRM_STEWARD].map(target => {
        return {
          target,
          signature: "acceptOwnership()",
          params: [],
        };
      }),

      // Configuration
      // Risk Oracle
      ...RISK_PARAMETER_SENDER.map(senders => {
        return {
          target: RISK_ORACLE,
          signature: "addAuthorizedSender(address)",
          params: [senders],
        };
      }),

      ...UPDATE_TYPES.map(updateType => {
        return {
          target: RISK_ORACLE,
          signature: "addUpdateType(string)",
          params: [updateType],
        };
      }),

      // RSR
      {
        target: RISK_STEWARD_RECEIVER,
        signature: "setRiskParameterConfig(string,address,uint256,uint256)",
        params: [UPDATE_TYPES[0], MARKETCAP_STEWARD, DEBOUNCE, TIMELOCK],
      },
      {
        target: RISK_STEWARD_RECEIVER,
        signature: "setRiskParameterConfig(string,address,uint256,uint256)",
        params: [UPDATE_TYPES[1], MARKETCAP_STEWARD, DEBOUNCE, TIMELOCK],
      },
      {
        target: RISK_STEWARD_RECEIVER,
        signature: "setRiskParameterConfig(string,address,uint256,uint256)",
        params: [UPDATE_TYPES[2], COLLATERALFACTORS_STEWARD, DEBOUNCE, TIMELOCK],
      },
      {
        target: RISK_STEWARD_RECEIVER,
        signature: "setRiskParameterConfig(string,address,uint256,uint256)",
        params: [UPDATE_TYPES[3], IRM_STEWARD, DEBOUNCE, TIMELOCK],
      },

      ...WHITELISTED_EXECUTORS.map(executor => {
        return {
          target: RISK_STEWARD_RECEIVER,
          signature: "setWhitelistedExecutor(address,bool)",
          params: [executor, true],
        };
      }),

      {
        target: MARKETCAP_STEWARD,
        signature: "setSafeDeltaBps(uint256)",
        params: [MC_STEWARD_SAFE_DELTA],
      },
      {
        target: COLLATERALFACTORS_STEWARD,
        signature: "setSafeDeltaBps(uint256)",
        params: [CF_STEWARD_SAFE_DELTA],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip592;
