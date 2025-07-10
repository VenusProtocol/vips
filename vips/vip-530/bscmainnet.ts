import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalMeta, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet, arbitrumone, zksyncmainnet, unichainmainnet } = NETWORK_ADDRESSES;

export const ADAPTER_PARAMS = ethers.utils.solidityPack(["uint16", "uint256"], [1, 300000]);
const BRIDGE_FEES = parseUnits("0.5", 18);

export const XVS_BRIDGE_BSC = "0xf8F46791E3dB29a029Ec6c9d946226f3c613e854";

export const RewardsDistributor_Core_0_ARB = "0x53b488baA4052094495b6De9E5505FE1Ee3EAc7a";
export const RewardsDistributor_Liquid_Staked_ETH_0_ARB = "0x6204Bae72dE568384Ca4dA91735dc343a0C7bD6D";
export const RewardsDistributor_Core_0_Amount_ARB = parseUnits("1560", 18);
export const RewardsDistributor_Liquid_Staked_ETH_0_Amount_ARB = parseUnits("1000", 18);

export const RewardsDistributor_Core_0_ZKSYNC = "0x7C7846A74AB38A8d554Bc5f7652eCf8Efb58c894";
export const RewardsDistributor_Core_0_Amount_ZKSYNC = parseUnits("2000", 18);

export const RewardsDistributor_Core_0_UNICHAIN = "0x4630B71C1BD27c99DD86aBB2A18C50c3F75C88fb";
export const RewardsDistributor_Core_0_Amount_UNICHAIN = parseUnits("12000", 18);

export const TOTAL_XVS = RewardsDistributor_Core_0_Amount_ARB.add(RewardsDistributor_Liquid_Staked_ETH_0_Amount_ARB)
  .add(RewardsDistributor_Core_0_Amount_ZKSYNC)
  .add(RewardsDistributor_Core_0_Amount_UNICHAIN);

export const vip530 = async () => {
  const meta: ProposalMeta = {
    version: "v2",
    title: "VIP-530",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // Bridge XVS
      {
        target: bscmainnet.UNITROLLER,
        signature: "_grantXVS(address,uint256)",
        params: [bscmainnet.NORMAL_TIMELOCK, TOTAL_XVS],
      },
      {
        target: bscmainnet.XVS,
        signature: "approve(address,uint256)",
        params: [XVS_BRIDGE_BSC, TOTAL_XVS],
      },
      {
        target: XVS_BRIDGE_BSC,
        signature: "sendFrom(address,uint16,bytes32,uint256,(address,address,bytes))",
        params: [
          bscmainnet.NORMAL_TIMELOCK,
          LzChainId.arbitrumone,
          ethers.utils.defaultAbiCoder.encode(["address"], [arbitrumone.VTREASURY]),
          RewardsDistributor_Core_0_Amount_ARB.add(RewardsDistributor_Liquid_Staked_ETH_0_Amount_ARB),
          [bscmainnet.NORMAL_TIMELOCK, ethers.constants.AddressZero, ADAPTER_PARAMS],
        ],
        value: BRIDGE_FEES.toString(),
      },
      {
        target: XVS_BRIDGE_BSC,
        signature: "sendFrom(address,uint16,bytes32,uint256,(address,address,bytes))",
        params: [
          bscmainnet.NORMAL_TIMELOCK,
          LzChainId.zksyncmainnet,
          ethers.utils.defaultAbiCoder.encode(["address"], [zksyncmainnet.VTREASURY]),
          RewardsDistributor_Core_0_Amount_ZKSYNC,
          [bscmainnet.NORMAL_TIMELOCK, ethers.constants.AddressZero, ADAPTER_PARAMS],
        ],
        value: BRIDGE_FEES.toString(),
      },
      {
        target: XVS_BRIDGE_BSC,
        signature: "sendFrom(address,uint16,bytes32,uint256,(address,address,bytes))",
        params: [
          bscmainnet.NORMAL_TIMELOCK,
          LzChainId.unichainmainnet,
          ethers.utils.defaultAbiCoder.encode(["address"], [unichainmainnet.VTREASURY]),
          RewardsDistributor_Core_0_Amount_UNICHAIN,
          [bscmainnet.NORMAL_TIMELOCK, ethers.constants.AddressZero, ADAPTER_PARAMS],
        ],
        value: BRIDGE_FEES.toString(),
      },
      {
        target: arbitrumone.VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [arbitrumone.XVS, RewardsDistributor_Core_0_Amount_ARB, RewardsDistributor_Core_0_ARB],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: arbitrumone.VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [
          arbitrumone.XVS,
          RewardsDistributor_Liquid_Staked_ETH_0_Amount_ARB,
          RewardsDistributor_Liquid_Staked_ETH_0_ARB,
        ],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: zksyncmainnet.VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [zksyncmainnet.XVS, RewardsDistributor_Core_0_Amount_ZKSYNC, RewardsDistributor_Core_0_ZKSYNC],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: unichainmainnet.VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [unichainmainnet.XVS, RewardsDistributor_Core_0_Amount_UNICHAIN, RewardsDistributor_Core_0_UNICHAIN],
        dstChainId: LzChainId.unichainmainnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip530;
