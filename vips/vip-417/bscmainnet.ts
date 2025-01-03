import { LzChainId } from "src/types";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

export const CORE_COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const TOTAL_XVS = parseUnits("104640", 18);
export const XVS_STORE = "0x1e25CF968f12850003Db17E0Dba32108509C4359";
export const XVS_STORE_AMOUNT = parseUnits("39690", 18);
export const XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";
export const ETHEREUM_VTREASURY = "0xFD9B071168bC27DBE16406eC3Aba050Ce8Eb22FA";
export const ARBITRUM_ONE_VTREASURY = "0x8a662ceAC418daeF956Bc0e6B2dd417c80CDA631";
export const ZKSYNCMAINNET_VTREASURY = "0xB2e9174e23382f7744CebF7e0Be54cA001D95599";
export const ETHEREUM_XVS = "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A"
export const ARBITRUM_ONE_XVS = "0xc1Eb7689147C81aC840d4FF0D298489fc7986d52"
export const ZKSYNCMAINNET_XVS = "0xD78ABD81a3D57712a3af080dc4185b698Fe9ac5A"
export const XVS_BRIDGE = "0xf8F46791E3dB29a029Ec6c9d946226f3c613e854";
export const ADAPTER_PARAMS = ethers.utils.solidityPack(["uint16", "uint256"], [1, 300000]);
const BRIDGE_FEES = parseUnits("0.05", 18);

export const ETHEREUM_REWARD_DISTRIBUTION_TARGETS = [
  {
    target: "0x1Db646E1Ab05571AF99e47e8F909801e5C99d37B",
    dstChainId: LzChainId.ethereum,
    amount: parseUnits("15120", 18),
    treasury: ETHEREUM_VTREASURY
  },
  {
    target: "0x886767B62C7ACD601672607373048FFD96Cf27B2",
    dstChainId: LzChainId.ethereum,
    amount: parseUnits("14526", 18),
    treasury: ETHEREUM_VTREASURY
  },
  {
    target: "0x5f65A7b60b4F91229B8484F80bc2EEc52758EAf9",
    dstChainId: LzChainId.ethereum,
    amount: parseUnits("0", 18),
    treasury: ETHEREUM_VTREASURY
  },
  {
    target: "0x1e25CF968f12850003Db17E0Dba32108509C4359",
    dstChainId: LzChainId.ethereum,
    amount: parseUnits("11139", 18),
    treasury: ETHEREUM_VTREASURY
  }
]

export const ARBITRUM_ONE_REWARD_DISTRIBUTION_TARGETS = [
  {
    target: "0x84266F552756cBed893b1FFA85248cD99501e3ce",
    dstChainId: LzChainId.arbitrumone,
    amount: parseUnits("3150", 18),
    treasury: ARBITRUM_ONE_VTREASURY
  },
  {
    target: "0x53b488baA4052094495b6De9E5505FE1Ee3EAc7a",
    dstChainId: LzChainId.arbitrumone,
    amount: parseUnits("5265", 18),
    treasury: ARBITRUM_ONE_VTREASURY
  },
  {
    target: "0x6204Bae72dE568384Ca4dA91735dc343a0C7bD6D",
    dstChainId: LzChainId.arbitrumone,
    amount: parseUnits("3060", 18),
    treasury: ARBITRUM_ONE_VTREASURY
  },
]

export const ZKSYNCMAINNET_REWARD_DISTRIBUTION_TARGETS = [
  {
    target: "0x84266F552756cBed893b1FFA85248cD99501e3ce",
    dstChainId: LzChainId.zksyncmainnet,
    amount: parseUnits("3150", 18),
    treasury: ZKSYNCMAINNET_VTREASURY
  },
  {
    target: "0x7C7846A74AB38A8d554Bc5f7652eCf8Efb58c894",
    dstChainId: LzChainId.zksyncmainnet,
    amount: parseUnits("9540", 18),
    treasury: ZKSYNCMAINNET_VTREASURY
  }
]

export const ETHEREUM_TOTAL_AMOUNT = parseUnits("40785", 18);
export const ARBITRUM_ONE_TOTAL_AMOUNT = parseUnits("11475", 18);
export const ZKSYNCMAINNET_TOTAL_AMOUNT = parseUnits("12690", 18);


const {bscmainnet, ethereum} = NETWORK_ADDRESSES;

export const vip417 = () => {
  const meta = {
    version: "v2",
    title: "VIP-417",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: CORE_COMPTROLLER,
        signature: "_grantXVS(address,uint256)",
        params: [bscmainnet.NORMAL_TIMELOCK, TOTAL_XVS],
      },
      {
        target: XVS,
        signature: "transfer(address,uint256)",
        params: [XVS_STORE, XVS_STORE_AMOUNT],
      },
      {
        target: XVS,
        signature: "approve(address,uint256)",
        params: [XVS_BRIDGE, ETHEREUM_TOTAL_AMOUNT.add(ARBITRUM_ONE_TOTAL_AMOUNT).add(ZKSYNCMAINNET_TOTAL_AMOUNT)],
      },
      {
        target: XVS_BRIDGE,
        signature: "sendFrom(address,uint16,bytes32,uint256,(address,address,bytes))",
        params: [
          bscmainnet.NORMAL_TIMELOCK,
          LzChainId.ethereum,
          ethers.utils.defaultAbiCoder.encode(["address"], [ETHEREUM_VTREASURY]),
          ETHEREUM_TOTAL_AMOUNT,
          [bscmainnet.NORMAL_TIMELOCK, ethers.constants.AddressZero, ADAPTER_PARAMS],
        ],
        value: BRIDGE_FEES.toString(),
      },
      {
        target: ETHEREUM_VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [ETHEREUM_XVS, ETHEREUM_TOTAL_AMOUNT, ethereum.NORMAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: XVS_BRIDGE,
        signature: "sendFrom(address,uint16,bytes32,uint256,(address,address,bytes))",
        params: [
          bscmainnet.NORMAL_TIMELOCK,
          LzChainId.arbitrumone,
          ethers.utils.defaultAbiCoder.encode(["address"], [ARBITRUM_ONE_VTREASURY]),
          ARBITRUM_ONE_TOTAL_AMOUNT,
          [bscmainnet.NORMAL_TIMELOCK, ethers.constants.AddressZero, ADAPTER_PARAMS],
        ],
        value: BRIDGE_FEES.toString(),
      },
      {
        target: ARBITRUM_ONE_VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [ARBITRUM_ONE_XVS, ARBITRUM_ONE_TOTAL_AMOUNT, ethereum.NORMAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: XVS_BRIDGE,
        signature: "sendFrom(address,uint16,bytes32,uint256,(address,address,bytes))",
        params: [
          bscmainnet.NORMAL_TIMELOCK,
          LzChainId.zksyncmainnet,
          ethers.utils.defaultAbiCoder.encode(["address"], [ZKSYNCMAINNET_VTREASURY]),
          ZKSYNCMAINNET_TOTAL_AMOUNT,
          [bscmainnet.NORMAL_TIMELOCK, ethers.constants.AddressZero, ADAPTER_PARAMS],
        ],
        value: BRIDGE_FEES.toString(),
      },
      {
        target: ZKSYNCMAINNET_VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [ZKSYNCMAINNET_XVS, ZKSYNCMAINNET_TOTAL_AMOUNT, ethereum.NORMAL_TIMELOCK],
        dstChainId: LzChainId.zksyncmainnet,
      },
      ...ETHEREUM_REWARD_DISTRIBUTION_TARGETS.map(({ target, dstChainId, amount, treasury }) => ({
        target: treasury,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [ETHEREUM_XVS, amount, target],
        dstChainId,
      })),
      ...ARBITRUM_ONE_REWARD_DISTRIBUTION_TARGETS.map(({ target, dstChainId, amount, treasury }) => ({
        target: treasury,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [ARBITRUM_ONE_XVS, amount, target],
        dstChainId,
      })),
      ...ZKSYNCMAINNET_REWARD_DISTRIBUTION_TARGETS.map(({ target, dstChainId, amount, treasury }) => ({
        target: treasury,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [ZKSYNCMAINNET_XVS, amount, target],
        dstChainId,
      })),
      {
        target: ARBITRUM_ONE_VTREASURY,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ZKSYNCMAINNET_VTREASURY,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.zksyncmainnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip417;
