import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalMeta, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bsctestnet, sepolia } = NETWORK_ADDRESSES;
export const CORE_COMPTROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
export const RISK_ORACLE = "0xaEDeFDE255BBf2D44BC62D8A078719a258C9a19b";
export const RISK_STEWARD_RECEIVER = "0xe9Cb27160Df47433b10f6d877FDb6bb7FB9b6578";
export const MARKETCAP_STEWARD = "0x476B76eC52b055DFbfa26D281b840FC55bEcA4BD";
export const COLLATERALFACTORS_STEWARD = "0x7922872a4d56c8FE76a6F362c6633c2308C5ac44";
export const IRM_STEWARD = "0xBb049f3C14a82393d7645b78884d75a7788a6a70";
export const BSCTESTNET_EID = 40102;

export const DEFI_COMPTROLLER = "0x23a73971A6B9f6580c048B9CB188869B2A2aA2aD";
export const vUSDT_DEFI = "0x80CC30811e362aC9aB857C3d7875CbcCc0b65750";
export const vBTC = "0xb6e9322C49FD75a367Fcb17B0Fcd62C5070EbCBe";

// SEPOLIA
export const DESTINATION_RECEIVER_STEWARD = "0xD66A3a67842ad563892685216a70B659FC8c18d3";
export const SEPOLIA_MC_STEWARD = "0xC10683dcb59A1812cc1D202BA561b23eB9E0599b";
export const SEPOLIA_CF_STEWARD = "0x4Ff531929bDAf4208844dFAbecEDFD28B10611a5";
export const SEPOLIA_IRM_STEWARD = "0xF68F3C38aE73aC35e550644867556DB5cc4a62EC";
export const SEPOLIA_ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";
export const SEPOLIA_COMPTROLLER = "0x7Aa39ab4BcA897F403425C9C6FDbd0f882Be0D70";
export const SEPOLIA_EID = 40161;

export const vip600 = async () => {
  const meta: ProposalMeta = {
    version: "v2",
    title: "VIP-600",
    description: `VIP-600`,
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
          params: [RISK_STEWARD_RECEIVER, "setRiskParameterConfig(string,address,uint256)", timelock],
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
      {
        target: bsctestnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setMarketBorrowCaps(address[],uint256[])", MARKETCAP_STEWARD],
      },
      {
        target: bsctestnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setMarketSupplyCaps(address[],uint256[])", MARKETCAP_STEWARD],
      },
      {
        target: bsctestnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [CORE_COMPTROLLER, "setCollateralFactor(uint96,address,uint256,uint256)", COLLATERALFACTORS_STEWARD],
      },
      {
        target: bsctestnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ethers.constants.AddressZero,
          "setCollateralFactor(address,uint256,uint256)",
          COLLATERALFACTORS_STEWARD,
        ],
      },

      // IRM_STEWARD
      {
        target: bsctestnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "_setInterestRateModel(address)", IRM_STEWARD],
      },
      {
        target: bsctestnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setInterestRateModel(address)", IRM_STEWARD],
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

      // accept ownership
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

      // Wire bridge connection
      {
        target: RISK_STEWARD_RECEIVER,
        signature: "setPeer(uint32,bytes32)",
        params: [SEPOLIA_EID, ethers.utils.hexZeroPad(DESTINATION_RECEIVER_STEWARD, 32)],
      },
      {
        target: DESTINATION_RECEIVER_STEWARD,
        signature: "setPeer(uint32,bytes32)",
        params: [BSCTESTNET_EID, ethers.utils.hexZeroPad(RISK_STEWARD_RECEIVER, 32)],
        dstChainId: LzChainId.sepolia,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip600;
