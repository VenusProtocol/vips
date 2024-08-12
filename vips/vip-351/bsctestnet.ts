import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { POOL_REGISTRY as ARBITRUMONE_POOL_REGISTRY } from "../../multisig/proposals/arbitrumsepolia/vip-013";
import { POOL_REGISTRY as OPBNBMAINNET_POOL_REGISTRY } from "../../multisig/proposals/opbnbtestnet/vip-019";
import { POOL_REGISTRY as SEPOLIA_POOL_REGISTRY } from "../../multisig/proposals/sepolia/vip-052";

const { arbitrumsepolia, opbnbtestnet, sepolia } = NETWORK_ADDRESSES;

export const ARBITRUM_SEPOLIA_ACM = "0xa36AD96441cB931D8dFEAAaC97D3FaB4B39E590F";
export const SEPOLIA_ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";
export const OPBNBTESTNET_ACM = "0x049f77F7046266d27C3bC96376f53C17Ef09c986";

const vip351 = () => {
  const meta = {
    version: "v2",
    title: "VIP-332 accept ownership & give permissions to Normal Timelock",
    description: `### Description`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposal(
    [
      // Normal Timelock Permissions
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setCollateralFactor(address,uint256,uint256)", sepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setCloseFactor(uint256)", sepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setLiquidationIncentive(uint256)", sepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setMarketBorrowCaps(address[],uint256[])", sepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setMarketSupplyCaps(address[],uint256[])", sepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setActionsPaused(address[],uint256[],bool)", sepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setMinLiquidatableCollateral(uint256)", sepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setForcedLiquidation(address,bool)", sepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_POOL_REGISTRY, "addPool(string,address,uint256,uint256,uint256)", sepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_POOL_REGISTRY, "addMarket(AddMarketInput)", sepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_POOL_REGISTRY, "setPoolName(address,string)", sepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_POOL_REGISTRY, "updatePoolMetadata(address,VenusPoolMetaData)", sepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setProtocolSeizeShare(uint256)", sepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setReserveFactor(uint256)", sepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setInterestRateModel(address)", sepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setReduceReservesBlockDelta(uint256)", sepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },

      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ethers.constants.AddressZero,
          "setCollateralFactor(address,uint256,uint256)",
          arbitrumsepolia.NORMAL_TIMELOCK,
        ],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setCloseFactor(uint256)", arbitrumsepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setLiquidationIncentive(uint256)", arbitrumsepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ethers.constants.AddressZero,
          "setMarketBorrowCaps(address[],uint256[])",
          arbitrumsepolia.NORMAL_TIMELOCK,
        ],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ethers.constants.AddressZero,
          "setMarketSupplyCaps(address[],uint256[])",
          arbitrumsepolia.NORMAL_TIMELOCK,
        ],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ethers.constants.AddressZero,
          "setActionsPaused(address[],uint256[],bool)",
          arbitrumsepolia.NORMAL_TIMELOCK,
        ],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ethers.constants.AddressZero,
          "setMinLiquidatableCollateral(uint256)",
          arbitrumsepolia.NORMAL_TIMELOCK,
        ],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setForcedLiquidation(address,bool)", arbitrumsepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUMONE_POOL_REGISTRY,
          "addPool(string,address,uint256,uint256,uint256)",
          arbitrumsepolia.NORMAL_TIMELOCK,
        ],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUMONE_POOL_REGISTRY, "addMarket(AddMarketInput)", arbitrumsepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUMONE_POOL_REGISTRY, "setPoolName(address,string)", arbitrumsepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUMONE_POOL_REGISTRY,
          "updatePoolMetadata(address,VenusPoolMetaData)",
          arbitrumsepolia.NORMAL_TIMELOCK,
        ],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setProtocolSeizeShare(uint256)", arbitrumsepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setReserveFactor(uint256)", arbitrumsepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setInterestRateModel(address)", arbitrumsepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setReduceReservesBlockDelta(uint256)", arbitrumsepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumsepolia,
      },

      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ethers.constants.AddressZero,
          "setCollateralFactor(address,uint256,uint256)",
          opbnbtestnet.NORMAL_TIMELOCK,
        ],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setCloseFactor(uint256)", opbnbtestnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setLiquidationIncentive(uint256)", opbnbtestnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ethers.constants.AddressZero,
          "setMarketBorrowCaps(address[],uint256[])",
          opbnbtestnet.NORMAL_TIMELOCK,
        ],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ethers.constants.AddressZero,
          "setMarketSupplyCaps(address[],uint256[])",
          opbnbtestnet.NORMAL_TIMELOCK,
        ],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ethers.constants.AddressZero,
          "setActionsPaused(address[],uint256[],bool)",
          opbnbtestnet.NORMAL_TIMELOCK,
        ],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setMinLiquidatableCollateral(uint256)", opbnbtestnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setForcedLiquidation(address,bool)", opbnbtestnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBMAINNET_POOL_REGISTRY,
          "addPool(string,address,uint256,uint256,uint256)",
          opbnbtestnet.NORMAL_TIMELOCK,
        ],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_POOL_REGISTRY, "addMarket(AddMarketInput)", opbnbtestnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_POOL_REGISTRY, "setPoolName(address,string)", opbnbtestnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBMAINNET_POOL_REGISTRY,
          "updatePoolMetadata(address,VenusPoolMetaData)",
          opbnbtestnet.NORMAL_TIMELOCK,
        ],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setProtocolSeizeShare(uint256)", opbnbtestnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setReserveFactor(uint256)", opbnbtestnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setInterestRateModel(address)", opbnbtestnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setReduceReservesBlockDelta(uint256)", opbnbtestnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.opbnbtestnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip351;
