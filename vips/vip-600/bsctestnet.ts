import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalMeta, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bsctestnet, sepolia } = NETWORK_ADDRESSES;
export const CORE_COMPTROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
export const RISK_ORACLE = "0x4DEA4D1A9F6101D4adacE89f16064D780D2F241d";
export const RISK_STEWARD_RECEIVER = "0x2F6eb64826f3A067eBFFb5909De7AA4e0Cb31b81";
export const MARKETCAP_STEWARD = "0xecC583037338D1EFE2C15bb2c6ac81E0294375C2";
export const COLLATERALFACTORS_STEWARD = "0xBf821F512EA224201108303cc6dA200391Eb38aC";
export const IRM_STEWARD = "0xE7AcaF3d6CeBA793d94f867FFCE0A1e9a6b3977C";
export const BSCTESTNET_EID = 40102;

// SEPOLIA
export const DESTINATION_RECEIVER_STEWARD = "0x5675112bf79C66d8CEbe48C40f25e9Dd6576c4e6";
export const SEPOLIA_MC_STEWARD = "0xcD598bDcfF0433395918512359745f83F5730C49";
export const SEPOLIA_CF_STEWARD = "0x1d100DAD71E56776bA3BdA3ec36D776BCE512B84";
export const SEPOLIA_IRM_STEWARD = "0x96834aF3d481C3f70dd31a4a3fe7607C2FC6Aa5b";
export const SEPOLIA_ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";
export const SEPOLIA_COMPTROLLER = "0x7Aa39ab4BcA897F403425C9C6FDbd0f882Be0D70";
export const SEPOLIA_EID = 40161;

export const vip600 = async () => {
  const meta: ProposalMeta = {
    version: "v2",
    title: "VIP-600 Risk-Steward Phase-1",
    description: `VIP-600 Risk-Steward Phase-1 Grant ACM Permissions`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // RISK ORACLE
      ...[bsctestnet.NORMAL_TIMELOCK].map(timelock => {
        return {
          target: bsctestnet.ACCESS_CONTROL_MANAGER,
          signature: "giveCallPermission(address,string,address)",
          params: [RISK_ORACLE, "addAuthorizedSender(address)", timelock],
        };
      }),
      ...[
        bsctestnet.NORMAL_TIMELOCK,
        bsctestnet.FAST_TRACK_TIMELOCK,
        bsctestnet.CRITICAL_TIMELOCK,
        bsctestnet.GUARDIAN,
      ].map(timelock => {
        return {
          target: bsctestnet.ACCESS_CONTROL_MANAGER,
          signature: "giveCallPermission(address,string,address)",
          params: [RISK_ORACLE, "removeAuthorizedSender(address)", timelock],
        };
      }),
      ...[bsctestnet.NORMAL_TIMELOCK, bsctestnet.FAST_TRACK_TIMELOCK].map(timelock => {
        return {
          target: bsctestnet.ACCESS_CONTROL_MANAGER,
          signature: "giveCallPermission(address,string,address)",
          params: [RISK_ORACLE, "addUpdateType(string)", timelock],
        };
      }),
      ...[
        bsctestnet.NORMAL_TIMELOCK,
        bsctestnet.FAST_TRACK_TIMELOCK,
        bsctestnet.CRITICAL_TIMELOCK,
        bsctestnet.GUARDIAN,
      ].map(timelock => {
        return {
          target: bsctestnet.ACCESS_CONTROL_MANAGER,
          signature: "giveCallPermission(address,string,address)",
          params: [RISK_ORACLE, "setUpdateTypeActive(string,bool)", timelock],
        };
      }),

      // RSR
      ...[bsctestnet.NORMAL_TIMELOCK, bsctestnet.FAST_TRACK_TIMELOCK].map(timelock => {
        return {
          target: bsctestnet.ACCESS_CONTROL_MANAGER,
          signature: "giveCallPermission(address,string,address)",
          params: [RISK_STEWARD_RECEIVER, "setRiskParameterConfig(string,address,uint256,uint256)", timelock],
        };
      }),
      ...[
        bsctestnet.NORMAL_TIMELOCK,
        bsctestnet.FAST_TRACK_TIMELOCK,
        bsctestnet.CRITICAL_TIMELOCK,
        bsctestnet.GUARDIAN,
      ].map(timelock => {
        return {
          target: bsctestnet.ACCESS_CONTROL_MANAGER,
          signature: "giveCallPermission(address,string,address)",
          params: [RISK_STEWARD_RECEIVER, "setConfigActive(string,bool)", timelock],
        };
      }),
      ...[
        bsctestnet.NORMAL_TIMELOCK,
        bsctestnet.FAST_TRACK_TIMELOCK,
        bsctestnet.CRITICAL_TIMELOCK,
        bsctestnet.GUARDIAN,
      ].map(timelock => {
        return {
          target: bsctestnet.ACCESS_CONTROL_MANAGER,
          signature: "giveCallPermission(address,string,address)",
          params: [RISK_STEWARD_RECEIVER, "setWhitelistedExecutor(address,bool)", timelock],
        };
      }),
      ...[
        bsctestnet.NORMAL_TIMELOCK,
        bsctestnet.FAST_TRACK_TIMELOCK,
        bsctestnet.CRITICAL_TIMELOCK,
        bsctestnet.GUARDIAN,
      ].map(timelock => {
        return {
          target: bsctestnet.ACCESS_CONTROL_MANAGER,
          signature: "giveCallPermission(address,string,address)",
          params: [RISK_STEWARD_RECEIVER, "setPaused(bool)", timelock],
        };
      }),

      // RS
      ...[bsctestnet.NORMAL_TIMELOCK, bsctestnet.FAST_TRACK_TIMELOCK].map(timelock => {
        return {
          target: bsctestnet.ACCESS_CONTROL_MANAGER,
          signature: "giveCallPermission(address,string,address)",
          params: [MARKETCAP_STEWARD, "setSafeDeltaBps(uint256)", timelock],
        };
      }),
      ...[bsctestnet.NORMAL_TIMELOCK, bsctestnet.FAST_TRACK_TIMELOCK].map(timelock => {
        return {
          target: bsctestnet.ACCESS_CONTROL_MANAGER,
          signature: "giveCallPermission(address,string,address)",
          params: [COLLATERALFACTORS_STEWARD, "setSafeDeltaBps(uint256)", timelock],
        };
      }),

      // MARKETCAP_STEWARD
      {
        target: bsctestnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [CORE_COMPTROLLER, "_setMarketBorrowCaps(address[],uint256[])", MARKETCAP_STEWARD],
      },
      {
        target: bsctestnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [CORE_COMPTROLLER, "_setMarketSupplyCaps(address[],uint256[])", MARKETCAP_STEWARD],
      },

      // CF_STEWARD
      {
        target: bsctestnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [CORE_COMPTROLLER, "setCollateralFactor(uint96,address,uint256,uint256)", COLLATERALFACTORS_STEWARD],
      },

      // IRM_STEWARD
      {
        target: bsctestnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "_setInterestRateModel(address)", IRM_STEWARD],
      },

      // DRSR
      ...[sepolia.NORMAL_TIMELOCK, sepolia.FAST_TRACK_TIMELOCK].map(timelock => {
        return {
          target: SEPOLIA_ACM,
          signature: "giveCallPermission(address,string,address)",
          params: [DESTINATION_RECEIVER_STEWARD, "setRiskParameterConfig(string,address,uint256)", timelock],
          dstChainId: LzChainId.sepolia,
        };
      }),
      ...[sepolia.NORMAL_TIMELOCK, sepolia.FAST_TRACK_TIMELOCK, sepolia.CRITICAL_TIMELOCK, sepolia.GUARDIAN].map(
        timelock => {
          return {
            target: SEPOLIA_ACM,
            signature: "giveCallPermission(address,string,address)",
            params: [DESTINATION_RECEIVER_STEWARD, "setConfigActive(string,bool)", timelock],
            dstChainId: LzChainId.sepolia,
          };
        },
      ),
      ...[sepolia.NORMAL_TIMELOCK, sepolia.FAST_TRACK_TIMELOCK].map(timelock => {
        return {
          target: SEPOLIA_ACM,
          signature: "giveCallPermission(address,string,address)",
          params: [DESTINATION_RECEIVER_STEWARD, "setRemoteDelay(uint256)", timelock],
          dstChainId: LzChainId.sepolia,
        };
      }),
      ...[sepolia.NORMAL_TIMELOCK, sepolia.FAST_TRACK_TIMELOCK, sepolia.CRITICAL_TIMELOCK, sepolia.GUARDIAN].map(
        timelock => {
          return {
            target: SEPOLIA_ACM,
            signature: "giveCallPermission(address,string,address)",
            params: [DESTINATION_RECEIVER_STEWARD, "setWhitelistedExecutor(address,bool)", timelock],
            dstChainId: LzChainId.sepolia,
          };
        },
      ),

      // REMOTE RS
      ...[sepolia.NORMAL_TIMELOCK, sepolia.FAST_TRACK_TIMELOCK].map(timelock => {
        return {
          target: SEPOLIA_ACM,
          signature: "giveCallPermission(address,string,address)",
          params: [SEPOLIA_MC_STEWARD, "setSafeDeltaBps(uint256)", timelock],
          dstChainId: LzChainId.sepolia,
        };
      }),
      ...[sepolia.NORMAL_TIMELOCK, sepolia.FAST_TRACK_TIMELOCK].map(timelock => {
        return {
          target: SEPOLIA_ACM,
          signature: "giveCallPermission(address,string,address)",
          params: [SEPOLIA_CF_STEWARD, "setSafeDeltaBps(uint256)", timelock],
          dstChainId: LzChainId.sepolia,
        };
      }),

      // REMOTE MARKETCAP_STEWARD
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_COMPTROLLER, "setMarketBorrowCaps(address[],uint256[])", SEPOLIA_MC_STEWARD],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_COMPTROLLER, "setMarketSupplyCaps(address[],uint256[])", SEPOLIA_MC_STEWARD],
        dstChainId: LzChainId.sepolia,
      },
      // REMOTE CF_STEWARD
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_COMPTROLLER, "setCollateralFactor(address,uint256,uint256)", SEPOLIA_CF_STEWARD],
        dstChainId: LzChainId.sepolia,
      },
      // REMOTE IRM_STEWARD
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setInterestRateModel(address)", SEPOLIA_IRM_STEWARD],
        dstChainId: LzChainId.sepolia,
      },

      // accept ownerships
      ...[DESTINATION_RECEIVER_STEWARD, SEPOLIA_MC_STEWARD, SEPOLIA_CF_STEWARD, SEPOLIA_IRM_STEWARD].map(target => {
        return {
          target,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.sepolia,
        };
      }),

      ...[RISK_ORACLE, RISK_STEWARD_RECEIVER, MARKETCAP_STEWARD, COLLATERALFACTORS_STEWARD, IRM_STEWARD].map(target => {
        return {
          target,
          signature: "acceptOwnership()",
          params: [],
        };
      }),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip600;
