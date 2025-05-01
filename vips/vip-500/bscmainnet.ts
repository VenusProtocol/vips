import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const ZKSYNCMAINNET_COMPTROLLER_BEACON = "0x0221415aF47FD261dD39B72018423dADe5d937c5";
export const ZKSYNC_COMPTROLLER_IMPL = "0xB2B58B15667e39dc09A0e29f1863eee7FD495541";
export const ZKSYNC_TEMP_COMPTROLLER_IMPL = "0x729Fe6E68bE6e272410922A0F2dB1e7980257f80";
export const ZKSYNCMAINNET_ACM = "0x526159A92A82afE5327d37Ef446b68FD9a5cA914";
export const WUSDM_LIQUIDATOR = "0xB983E9A88A14df7B57A3C47c19D69F60250CE40B";
export const WUSDM = "0xA900cbE7739c96D2B153a273953620A701d5442b";
export const WUSDM_AMOUNT = parseUnits("370732.56284", 18);

const { VTREASURY } = NETWORK_ADDRESSES["zksyncmainnet"];

export const vip500 = () => {
  const meta = {
    version: "v2",
    title: "VIP to run the WUSDMLiquidator contract",
    description: `#### Summary`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      { target: WUSDM_LIQUIDATOR, signature: "acceptOwnership()", params: [], dstChainId: LzChainId.zksyncmainnet },
      {
        target: ZKSYNCMAINNET_COMPTROLLER_BEACON,
        signature: "upgradeTo(address)",
        params: [ZKSYNC_TEMP_COMPTROLLER_IMPL],
        dstChainId: LzChainId.zksyncmainnet,
      },

      {
        target: ZKSYNCMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setMinLiquidatableCollateral(uint256)", WUSDM_LIQUIDATOR],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ZKSYNCMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setCloseFactor(uint256)", WUSDM_LIQUIDATOR],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ZKSYNCMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setCollateralFactor(address,uint256,uint256)", WUSDM_LIQUIDATOR],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ZKSYNCMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setActionsPaused(address[],uint256[],bool)", WUSDM_LIQUIDATOR],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ZKSYNCMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setProtocolSeizeShare(uint256)", WUSDM_LIQUIDATOR],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [WUSDM, WUSDM_AMOUNT, WUSDM_LIQUIDATOR],
        dstChainId: LzChainId.zksyncmainnet,
      },

      {
        target: WUSDM_LIQUIDATOR,
        signature: "run()",
        params: [],
        dstChainId: LzChainId.zksyncmainnet,
      },

      {
        target: ZKSYNCMAINNET_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setMinLiquidatableCollateral(uint256)", WUSDM_LIQUIDATOR],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ZKSYNCMAINNET_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setCloseFactor(uint256)", WUSDM_LIQUIDATOR],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ZKSYNCMAINNET_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setCollateralFactor(address,uint256,uint256)", WUSDM_LIQUIDATOR],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ZKSYNCMAINNET_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setActionsPaused(address[],uint256[],bool)", WUSDM_LIQUIDATOR],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ZKSYNCMAINNET_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setProtocolSeizeShare(uint256)", WUSDM_LIQUIDATOR],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ZKSYNCMAINNET_COMPTROLLER_BEACON,
        signature: "upgradeTo(address)",
        params: [ZKSYNC_COMPTROLLER_IMPL],
        dstChainId: LzChainId.zksyncmainnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip500;
