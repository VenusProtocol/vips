import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const BSC_XVS_VAULT_TREASURY = "0x269ff7818DB317f60E386D2be0B259e1a324a40a";
export const ETH_XVS_VAULT_TREASURY = "0xaE39C38AF957338b3cEE2b3E5d825ea88df02EfE";
export const ARB_XVS_VAULT_TREASURY = "0xb076D4f15c08D7A7B89466327Ba71bc7e1311b58";
export const BSC_XVS_STORE = "0x1e25CF968f12850003Db17E0Dba32108509C4359";
export const ARB_XVS_STORE = "0x507D9923c954AAD8eC530ed8Dedb75bFc893Ec5e";
export const XVS_BRIDGE = "0xf8F46791E3dB29a029Ec6c9d946226f3c613e854";

export const BSC_RELEASE_AMOUNT = parseUnits("111845", 18);
export const ETH_RELEASE_AMOUNT = parseUnits("5932", 18);
export const ARB_RELEASE_AMOUNT = parseUnits("470", 18);

export const BSC_XVS_STORE_AMOUNT = parseUnits("27783", 18);
export const ARB_XVS_STORE_AMOUNT = parseUnits("770", 18);

export const BSC_DISTRIBUTION_SPEED = "57256944444444445";
export const ETH_DISTRIBUTION_SPEED = "25208333333333334";
export const ARB_DISTRIBUTION_SPEED = "340277777777778";
export const ZKSYNC_DISTRIBUTION_SPEED = "280092592592593";

export const ADAPTER_PARAMS = ethers.utils.solidityPack(["uint16", "uint256"], [1, 300000]);
const BRIDGE_FEES = parseUnits("0.5", 18);

const { zksyncmainnet, ethereum, arbitrumone, bscmainnet } = NETWORK_ADDRESSES;

export const vip477 = () => {
  const meta = {
    version: "v2",
    title: "VIP-477",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      // transfer funds to the XVS Stores
      {
        target: bscmainnet.UNITROLLER,
        signature: "_grantXVS(address,uint256)",
        params: [BSC_XVS_STORE, BSC_XVS_STORE_AMOUNT],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "_grantXVS(address,uint256)",
        params: [bscmainnet.NORMAL_TIMELOCK, ARB_XVS_STORE_AMOUNT],
      },
      {
        target: bscmainnet.XVS,
        signature: "approve(address,uint256)",
        params: [XVS_BRIDGE, ARB_XVS_STORE_AMOUNT],
      },
      {
        target: XVS_BRIDGE,
        signature: "sendFrom(address,uint16,bytes32,uint256,(address,address,bytes))",
        params: [
          bscmainnet.NORMAL_TIMELOCK,
          LzChainId.arbitrumone,
          ethers.utils.defaultAbiCoder.encode(["address"], [arbitrumone.VTREASURY]),
          ARB_XVS_STORE_AMOUNT,
          [bscmainnet.NORMAL_TIMELOCK, ethers.constants.AddressZero, ADAPTER_PARAMS],
        ],
        value: BRIDGE_FEES.toString(),
      },
      {
        target: arbitrumone.VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [arbitrumone.XVS, ARB_XVS_STORE_AMOUNT, ARB_XVS_STORE],
        dstChainId: LzChainId.arbitrumone,
      },

      // release funds from the XVSVaultTreasury and set reward speeds
      {
        target: BSC_XVS_VAULT_TREASURY,
        signature: "fundXVSVault(uint256)",
        params: [BSC_RELEASE_AMOUNT],
      },
      {
        target: bscmainnet.XVS_VAULT_PROXY,
        signature: "setRewardAmountPerBlockOrSecond(address,uint256)",
        params: [bscmainnet.XVS, BSC_DISTRIBUTION_SPEED],
      },
      {
        target: ETH_XVS_VAULT_TREASURY,
        signature: "fundXVSVault(uint256)",
        params: [ETH_RELEASE_AMOUNT],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ethereum.XVS_VAULT_PROXY,
        signature: "setRewardAmountPerBlockOrSecond(address,uint256)",
        params: [ethereum.XVS, ETH_DISTRIBUTION_SPEED],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ARB_XVS_VAULT_TREASURY,
        signature: "fundXVSVault(uint256)",
        params: [ARB_RELEASE_AMOUNT],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: arbitrumone.XVS_VAULT_PROXY,
        signature: "setRewardAmountPerBlockOrSecond(address,uint256)",
        params: [arbitrumone.XVS, ARB_DISTRIBUTION_SPEED],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: zksyncmainnet.XVS_VAULT_PROXY,
        signature: "setRewardAmountPerBlockOrSecond(address,uint256)",
        params: [zksyncmainnet.XVS, ZKSYNC_DISTRIBUTION_SPEED],
        dstChainId: LzChainId.zksyncmainnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip477;
