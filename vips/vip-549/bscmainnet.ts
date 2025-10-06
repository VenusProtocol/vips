import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalMeta, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet, ethereum, unichainmainnet, zksyncmainnet, arbitrumone } = NETWORK_ADDRESSES;

export const ADAPTER_PARAMS = ethers.utils.solidityPack(["uint16", "uint256"], [1, 300000]);
export const BRIDGE_FEES_BSC = parseUnits("0.5", 18);

export const ZKSYNC_XVS_BRIDGE_AMOUNT = parseUnits("126", 18);
export const ZKSYNC_XVS_STORE = "0x84266F552756cBed893b1FFA85248cD99501e3ce";
export const ZKSYNC_SPEED = parseUnits("0.000116", 18); // 10.05 XVS/day

export const UNICHAIN_XVS_BRIDGE_AMOUNT = parseUnits("205", 18);
export const UNICHAIN_XVS_STORE = "0x0ee4b35c2cEAb19856Bf35505F81608d12B2a7Bb";
export const UNICHAIN_SPEED = parseUnits("0.000036", 18); // 3.1 XVS/day

export const BSC_XVS_BRIDGE = "0xf8F46791E3dB29a029Ec6c9d946226f3c613e854";
export const BSC_XVS_VAULT_TREASURY = "0x269ff7818DB317f60E386D2be0B259e1a324a40a";
export const BSC_XVS_STORE = "0x1e25CF968f12850003Db17E0Dba32108509C4359";
export const BSC_XVS_AMOUNT = parseUnits("99174", 18);
export const BSC_SPEED = parseUnits("0.0121", 18); // 1,398 XVS/day

export const ETH_XVS_VAULT_TREASURY = "0xaE39C38AF957338b3cEE2b3E5d825ea88df02EfE";
export const ETH_XVS_STORE = "0x1Db646E1Ab05571AF99e47e8F909801e5C99d37B";
export const ETH_XVS_AMOUNT = parseUnits("2129", 18);
export const ETH_SPEED = parseUnits("0.0227", 18); // 27.28 XVS/day

export const ARB_XVS_VAULT_TREASURY = "0xb076D4f15c08D7A7B89466327Ba71bc7e1311b58";
export const ARB_XVS_STORE = "0x507D9923c954AAD8eC530ed8Dedb75bFc893Ec5e";
export const ARB_XVS_AMOUNT = parseUnits("385", 18);
export const ARB_SPEED = parseUnits("0.000026", 18); // 2.24 XVS/day

export const vip549 = async () => {
  const meta: ProposalMeta = {
    version: "v2",
    title: "VIP-549",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: bscmainnet.UNITROLLER,
        signature: "_grantXVS(address,uint256)",
        params: [bscmainnet.NORMAL_TIMELOCK, ZKSYNC_XVS_BRIDGE_AMOUNT.add(UNICHAIN_XVS_BRIDGE_AMOUNT)],
      },
      {
        target: bscmainnet.XVS,
        signature: "approve(address,uint256)",
        params: [BSC_XVS_BRIDGE, ZKSYNC_XVS_BRIDGE_AMOUNT.add(UNICHAIN_XVS_BRIDGE_AMOUNT)],
      },
      {
        target: BSC_XVS_BRIDGE,
        signature: "sendFrom(address,uint16,bytes32,uint256,(address,address,bytes))",
        params: [
          bscmainnet.NORMAL_TIMELOCK,
          LzChainId.zksyncmainnet,
          ethers.utils.defaultAbiCoder.encode(["address"], [ZKSYNC_XVS_STORE]),
          ZKSYNC_XVS_BRIDGE_AMOUNT,
          [bscmainnet.NORMAL_TIMELOCK, ethers.constants.AddressZero, ADAPTER_PARAMS],
        ],
        value: BRIDGE_FEES_BSC.toString(),
      },
      {
        target: BSC_XVS_BRIDGE,
        signature: "sendFrom(address,uint16,bytes32,uint256,(address,address,bytes))",
        params: [
          bscmainnet.NORMAL_TIMELOCK,
          LzChainId.unichainmainnet,
          ethers.utils.defaultAbiCoder.encode(["address"], [UNICHAIN_XVS_STORE]),
          UNICHAIN_XVS_BRIDGE_AMOUNT,
          [bscmainnet.NORMAL_TIMELOCK, ethers.constants.AddressZero, ADAPTER_PARAMS],
        ],
        value: BRIDGE_FEES_BSC.toString(),
      },
      {
        target: zksyncmainnet.XVS_VAULT_PROXY,
        signature: "setRewardAmountPerBlockOrSecond(address,uint256)",
        params: [zksyncmainnet.XVS, ZKSYNC_SPEED],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: unichainmainnet.XVS_VAULT_PROXY,
        signature: "setRewardAmountPerBlockOrSecond(address,uint256)",
        params: [unichainmainnet.XVS, UNICHAIN_SPEED],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: BSC_XVS_VAULT_TREASURY,
        signature: "fundXVSVault(uint256)",
        params: [BSC_XVS_AMOUNT],
      },
      {
        target: bscmainnet.XVS_VAULT_PROXY,
        signature: "setRewardAmountPerBlockOrSecond(address,uint256)",
        params: [bscmainnet.XVS, BSC_SPEED],
      },
      {
        target: ETH_XVS_VAULT_TREASURY,
        signature: "fundXVSVault(uint256)",
        params: [ETH_XVS_AMOUNT],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ethereum.XVS_VAULT_PROXY,
        signature: "setRewardAmountPerBlockOrSecond(address,uint256)",
        params: [ethereum.XVS, ETH_SPEED],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ARB_XVS_VAULT_TREASURY,
        signature: "fundXVSVault(uint256)",
        params: [ARB_XVS_AMOUNT],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: arbitrumone.XVS_VAULT_PROXY,
        signature: "setRewardAmountPerBlockOrSecond(address,uint256)",
        params: [arbitrumone.XVS, ARB_SPEED],
        dstChainId: LzChainId.arbitrumone,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip549;
