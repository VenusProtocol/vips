import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalMeta, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet, ethereum, arbitrumone, zksyncmainnet, unichainmainnet } = NETWORK_ADDRESSES;

export const ADAPTER_PARAMS = ethers.utils.solidityPack(["uint16", "uint256"], [1, 300000]);
const BRIDGE_FEES = parseUnits("0.5", 18);

export const XVS_VAULT_TREASURY_BSC = "0x269ff7818DB317f60E386D2be0B259e1a324a40a";
export const RELEASE_AMOUNT_BSC = parseUnits("234352", 18);
export const DISTRIBUTION_SPEED_BSC = "25173611111111112"; // 2,900 XVS/day
export const XVS_BRIDGE_BSC = "0xf8F46791E3dB29a029Ec6c9d946226f3c613e854";
export const XVS_STORE_BSC = "0x1e25CF968f12850003Db17E0Dba32108509C4359";

export const XVS_VAULT_TREASURY_ETH = "0xaE39C38AF957338b3cEE2b3E5d825ea88df02EfE";
export const RELEASE_AMOUNT_ETH = parseUnits("1007", 18);
export const DISTRIBUTION_SPEED_ETH = "21527777777777778"; // 155 XVS/day
export const XVS_STORE_ETH = "0x1Db646E1Ab05571AF99e47e8F909801e5C99d37B";

export const XVS_VAULT_TREASURY_ARB = "0xb076D4f15c08D7A7B89466327Ba71bc7e1311b58";
export const RELEASE_AMOUNT_ARB = parseUnits("120", 18);
export const DISTRIBUTION_SPEED_ARB = "305555555555556"; // 26.4 XVS/day
export const XVS_STORE_ARB = "0x507D9923c954AAD8eC530ed8Dedb75bFc893Ec5e";

export const DISTRIBUTION_SPEED_ZKSYNC = "280092592592593"; // 24.2 XVS/day
export const XVS_STORE_ZKSYNC = "0x84266F552756cBed893b1FFA85248cD99501e3ce";

export const DISTRIBUTION_SPEED_UNICHAIN = "77160493827160"; // 6.6 XVS/day

export const XVS_TOTAL_AMOUNT_BSC = parseUnits("56493", 18);
export const XVS_TOTAL_AMOUNT_ETH = parseUnits("10584", 18);
export const XVS_TOTAL_AMOUNT_ARB = parseUnits("2205", 18);
export const XVS_TOTAL_AMOUNT_ZKSYNC = parseUnits("2205", 18);
export const TOTAL_XVS = XVS_TOTAL_AMOUNT_BSC.add(XVS_TOTAL_AMOUNT_ETH)
  .add(XVS_TOTAL_AMOUNT_ARB)
  .add(XVS_TOTAL_AMOUNT_ZKSYNC);
export const TOTAL_XVS_REMOTE = XVS_TOTAL_AMOUNT_ETH.add(XVS_TOTAL_AMOUNT_ARB).add(XVS_TOTAL_AMOUNT_ZKSYNC);

export const vip528 = async () => {
  const meta: ProposalMeta = {
    version: "v2",
    title: "VIP-528",
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
        params: [XVS_BRIDGE_BSC, TOTAL_XVS_REMOTE],
      },
      {
        target: bscmainnet.XVS,
        signature: "transfer(address,uint256)",
        params: [XVS_STORE_BSC, XVS_TOTAL_AMOUNT_BSC],
      },
      {
        target: XVS_BRIDGE_BSC,
        signature: "sendFrom(address,uint16,bytes32,uint256,(address,address,bytes))",
        params: [
          bscmainnet.NORMAL_TIMELOCK,
          LzChainId.ethereum,
          ethers.utils.defaultAbiCoder.encode(["address"], [ethereum.VTREASURY]),
          XVS_TOTAL_AMOUNT_ETH,
          [bscmainnet.NORMAL_TIMELOCK, ethers.constants.AddressZero, ADAPTER_PARAMS],
        ],
        value: BRIDGE_FEES.toString(),
      },
      {
        target: XVS_BRIDGE_BSC,
        signature: "sendFrom(address,uint16,bytes32,uint256,(address,address,bytes))",
        params: [
          bscmainnet.NORMAL_TIMELOCK,
          LzChainId.arbitrumone,
          ethers.utils.defaultAbiCoder.encode(["address"], [arbitrumone.VTREASURY]),
          XVS_TOTAL_AMOUNT_ARB,
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
          XVS_TOTAL_AMOUNT_ZKSYNC,
          [bscmainnet.NORMAL_TIMELOCK, ethers.constants.AddressZero, ADAPTER_PARAMS],
        ],
        value: BRIDGE_FEES.toString(),
      },
      {
        target: ethereum.VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [ethereum.XVS, XVS_TOTAL_AMOUNT_ETH, XVS_STORE_ETH],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: arbitrumone.VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [arbitrumone.XVS, XVS_TOTAL_AMOUNT_ARB, XVS_STORE_ARB],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: zksyncmainnet.VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [zksyncmainnet.XVS, XVS_TOTAL_AMOUNT_ZKSYNC, XVS_STORE_ZKSYNC],
        dstChainId: LzChainId.zksyncmainnet,
      },

      // Set Emissions
      {
        target: XVS_VAULT_TREASURY_BSC,
        signature: "fundXVSVault(uint256)",
        params: [RELEASE_AMOUNT_BSC],
      },
      {
        target: bscmainnet.XVS_VAULT_PROXY,
        signature: "setRewardAmountPerBlockOrSecond(address,uint256)",
        params: [bscmainnet.XVS, DISTRIBUTION_SPEED_BSC],
      },
      {
        target: XVS_VAULT_TREASURY_ETH,
        signature: "fundXVSVault(uint256)",
        params: [RELEASE_AMOUNT_ETH],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ethereum.XVS_VAULT_PROXY,
        signature: "setRewardAmountPerBlockOrSecond(address,uint256)",
        params: [ethereum.XVS, DISTRIBUTION_SPEED_ETH],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: XVS_VAULT_TREASURY_ARB,
        signature: "fundXVSVault(uint256)",
        params: [RELEASE_AMOUNT_ARB],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: arbitrumone.XVS_VAULT_PROXY,
        signature: "setRewardAmountPerBlockOrSecond(address,uint256)",
        params: [arbitrumone.XVS, DISTRIBUTION_SPEED_ARB],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: zksyncmainnet.XVS_VAULT_PROXY,
        signature: "setRewardAmountPerBlockOrSecond(address,uint256)",
        params: [zksyncmainnet.XVS, DISTRIBUTION_SPEED_ZKSYNC],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: unichainmainnet.XVS_VAULT_PROXY,
        signature: "setRewardAmountPerBlockOrSecond(address,uint256)",
        params: [unichainmainnet.XVS, DISTRIBUTION_SPEED_UNICHAIN],
        dstChainId: LzChainId.unichainmainnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip528;
