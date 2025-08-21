import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalMeta, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet, ethereum, arbitrumone, zksyncmainnet, unichainmainnet } = NETWORK_ADDRESSES;

export const ADAPTER_PARAMS = ethers.utils.solidityPack(["uint16", "uint256"], [1, 300000]);

export const BRIDGE_FEES_BSC = parseUnits("0.5", 18);
export const RELEASE_AMOUNT_BSC = parseUnits("1343.3735", 18);
export const XVS_BRIDGE_BSC = "0xf8F46791E3dB29a029Ec6c9d946226f3c613e854";

export const BRIDGE_FEES_ETH = parseUnits("0.001", 18);
export const XVS_BRIDGE_ETH = "0x888E317606b4c590BBAD88653863e8B345702633";
export const REWARD_DISTRIBUTORS_ETH = [
  {
    address: "0x7a91bed36d96e4e644d3a181c287e0fcf9e9cc98",
    excess: parseUnits("12861.1488", 18),
  },
  {
    address: "0x1e25cf968f12850003db17e0dba32108509c4359",
    excess: parseUnits("8032.6739", 18),
  },
  {
    address: "0x8473b767f68250f5309bae939337136a899e43f9",
    excess: parseUnits("1603.5498", 18),
  },
  {
    address: "0x886767b62c7acd601672607373048ffd96cf27b2",
    excess: parseUnits("9641.8138", 18),
  },
  {
    address: "0x134bfdea7e68733921bc6a87159fb0d68abc6cf8",
    excess: parseUnits("9894.8738", 18),
  },
  {
    address: "0x461de281c453f447200d67c9dd31b3046c8f49f8",
    excess: parseUnits("437.8750", 18),
  },
];
export const EXCESS_XVS_ETH = REWARD_DISTRIBUTORS_ETH.reduce(
  (acc, distributor) => acc.add(distributor.excess),
  ethers.BigNumber.from(0),
);

export const BRIDGE_FEES_ARB = parseUnits("0.001", 18);
export const XVS_BRIDGE_ARB = "0x20cEa49B5F7a6DBD78cAE772CA5973eF360AA1e6";
export const REWARD_DISTRIBUTORS_ARB = [
  {
    address: "0x53b488baa4052094495b6de9e5505fe1ee3eac7a",
    excess: parseUnits("333.6100", 18),
  },
  {
    address: "0x6204bae72de568384ca4da91735dc343a0c7bd6d",
    excess: parseUnits("1117.2790", 18),
  },
];
export const EXCESS_XVS_ARB = REWARD_DISTRIBUTORS_ARB.reduce(
  (acc, distributor) => acc.add(distributor.excess),
  ethers.BigNumber.from(0),
);

export const BRIDGE_FEES_ZKSYNC = parseUnits("0.001", 18);
export const XVS_BRIDGE_ZKSYNC = "0x16a62B534e09A7534CD5847CFE5Bf6a4b0c1B116";
export const REWARD_DISTRIBUTORS_ZKSYNC = [
  {
    address: "0x7c7846a74ab38a8d554bc5f7652ecf8efb58c894",
    excess: parseUnits("2904.6815", 18),
  },
];
export const EXCESS_XVS_ZKSYNC = REWARD_DISTRIBUTORS_ZKSYNC.reduce(
  (acc, distributor) => acc.add(distributor.excess),
  ethers.BigNumber.from(0),
);

export const XVS_BRIDGE_UNICHAIN = "0x9c95f8aa28fFEB7ECdC0c407B9F632419c5daAF8";
export const REWARD_DISTRIBUTOR_UNICHAIN = "0x4630b71c1bd27c99dd86abb2a18c50c3f75c88fb";
export const XVS_SHORTAGE_UNICHAIN = parseUnits("1343.3735", 18);

export const vip537 = async () => {
  const meta: ProposalMeta = {
    version: "v2",
    title: "VIP-537",
    description: `### Summary

Following [VIP-533: XVS Emissions Strategy Update](https://app.venus.io/#/governance/proposal/533?chainId=56), which paused XVS emissions across all chains, this VIP proposes to recover excess XVS tokens held in Rewards Distributors on multiple chains and bridge them back to the [Venus Treasury on BNB Chain](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9).

Additionally, this VIP proposes to cover the shortage of XVS in the underfunded Unichain Rewards Distributor by bridging XVS from the [Core Pool Comptroller](https://bscscan.com/address/0xfD36E2c2a6789Db23113685031d7F16329158384#asset-multichain).

If passed, 46,827.5056 XVS will be returned to the Treasury.

---

### Actions

If approved, this VIP will execute the following actions:

**Arbitrum**

- Bridge **333.6100 excess XVS** from [Arbitrum Reward Distributor 0x53b488baa4052094495b6de9e5505fe1ee3eac7a](https://arbiscan.io/address/0x53b488baa4052094495b6de9e5505fe1ee3eac7a) back to [BNB Treasury](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9).
- Bridge **1,117.2790 excess XVS** from [Arbitrum Reward Distributor 0x6204bae72de568384ca4da91735dc343a0c7bd6d](https://arbiscan.io/address/0x6204bae72de568384ca4da91735dc343a0c7bd6d) back to [BNB Treasury](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9).

**Ethereum**

- Bridge **12,861.1488 excess XVS** from [Ethereum Reward Distributor 0x7a91bed36d96e4e644d3a181c287e0fcf9e9cc98](https://etherscan.io/address/0x7a91bed36d96e4e644d3a181c287e0fcf9e9cc98) back to [BNB Treasury](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9).
- Bridge **8,032.6739 excess XVS** from [Ethereum Reward Distributor 0x1e25cf968f12850003db17e0dba32108509c4359](https://etherscan.io/address/0x1e25cf968f12850003db17e0dba32108509c4359) back to [BNB Treasury](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9).
- Bridge **1,603.5498 excess XVS** from [Ethereum Reward Distributor 0x8473b767f68250f5309bae939337136a899e43f9](https://etherscan.io/address/0x8473b767f68250f5309bae939337136a899e43f9) back to [BNB Treasury](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9).
- Bridge **9,641.8138 excess XVS** from [Ethereum Reward Distributor 0x886767b62c7acd601672607373048ffd96cf27b2](https://etherscan.io/address/0x886767b62c7acd601672607373048ffd96cf27b2) back to [BNB Treasury](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9).
- Bridge **9,894.8738 excess XVS** from [Ethereum Reward Distributor 0x134bfdea7e68733921bc6a87159fb0d68abc6cf8](https://etherscan.io/address/0x134bfdea7e68733921bc6a87159fb0d68abc6cf8) back to [BNB Treasury](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9).
- Bridge **437.8750 excess XVS** from [Ethereum Reward Distributor 0x461de281c453f447200d67c9dd31b3046c8f49f8](https://etherscan.io/address/0x461de281c453f447200d67c9dd31b3046c8f49f8) back to [BNB Treasury](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9).

**zkSync**

- Bridge **2,904.6815 excess XVS** from [zkSync Reward Distributor](https://explorer.zksync.io/address/0x7c7846a74ab38a8d554bc5f7652ecf8efb58c894) back to [BNB Treasury](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9).

**Unichain**

- Bridge **1,343.3735 XVS** from the [Core Pool Comptroller](https://bscscan.com/address/0xfD36E2c2a6789Db23113685031d7F16329158384#asset-multichain) to the underfunded [Unichain Rewards Distributor](https://unichain.blockscout.com/address/0x4630b71c1bd27c99dd86abb2a18c50c3f75c88fb).

---

### References

- [VIP-533: XVS Emissions Strategy Update](https://app.venus.io/#/governance/proposal/533?chainId=56)
- [Venus Treasury on BNB Chain](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9)
- [Core Pool Comptroller (BNB)](https://bscscan.com/address/0xfD36E2c2a6789Db23113685031d7F16329158384#asset-multichain)

- [VIP-533 XVS Emissions Strategy Update](https://app.venus.io/#/governance/proposal/533?chainId=56)
- Community proposal [XVS Emissions Strategy Update](https://community.venus.io/t/xvs-emissions-strategy-update/5224), and the [associated snapshot](https://snapshot.box/#/s:venus-xvs.eth/proposal/0x8dfb4ec02f6980535acf8235422ad1cefcc385eecab44f610882689a745aa26f)

---

[VIP simulation](https://github.com/VenusProtocol/vips/pull/599)
    `,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // Bridge XVS to Unichain
      {
        target: bscmainnet.UNITROLLER,
        signature: "_grantXVS(address,uint256)",
        params: [bscmainnet.NORMAL_TIMELOCK, XVS_SHORTAGE_UNICHAIN],
      },
      {
        target: bscmainnet.XVS,
        signature: "approve(address,uint256)",
        params: [XVS_BRIDGE_BSC, XVS_SHORTAGE_UNICHAIN],
      },
      {
        target: XVS_BRIDGE_BSC,
        signature: "sendFrom(address,uint16,bytes32,uint256,(address,address,bytes))",
        params: [
          bscmainnet.NORMAL_TIMELOCK,
          LzChainId.unichainmainnet,
          ethers.utils.defaultAbiCoder.encode(["address"], [unichainmainnet.VTREASURY]),
          XVS_SHORTAGE_UNICHAIN,
          [bscmainnet.NORMAL_TIMELOCK, ethers.constants.AddressZero, ADAPTER_PARAMS],
        ],
        value: BRIDGE_FEES_BSC.toString(),
      },
      {
        target: unichainmainnet.VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [unichainmainnet.XVS, XVS_SHORTAGE_UNICHAIN, REWARD_DISTRIBUTOR_UNICHAIN],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: bscmainnet.XVS,
        signature: "approve(address,uint256)",
        params: [XVS_BRIDGE_BSC, 0],
      },

      // Send XVS from ETH to BSC Treasury
      ...REWARD_DISTRIBUTORS_ETH.map(distributor => ({
        target: distributor.address,
        signature: "grantRewardToken(address,uint256)",
        params: [ethereum.NORMAL_TIMELOCK, distributor.excess],
        dstChainId: LzChainId.ethereum,
      })),
      {
        target: ethereum.XVS,
        signature: "approve(address,uint256)",
        params: [XVS_BRIDGE_ETH, EXCESS_XVS_ETH],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: XVS_BRIDGE_ETH,
        signature: "sendFrom(address,uint16,bytes32,uint256,(address,address,bytes))",
        params: [
          ethereum.NORMAL_TIMELOCK,
          LzChainId.bscmainnet,
          ethers.utils.defaultAbiCoder.encode(["address"], [bscmainnet.VTREASURY]),
          EXCESS_XVS_ETH,
          [ethereum.NORMAL_TIMELOCK, ethers.constants.AddressZero, ADAPTER_PARAMS],
        ],
        value: BRIDGE_FEES_ETH.toString(),
        dstChainId: LzChainId.ethereum,
      },

      // Send XVS from ARB to BSC Treasury
      ...REWARD_DISTRIBUTORS_ARB.map(distributor => ({
        target: distributor.address,
        signature: "grantRewardToken(address,uint256)",
        params: [arbitrumone.NORMAL_TIMELOCK, distributor.excess],
        dstChainId: LzChainId.arbitrumone,
      })),
      {
        target: arbitrumone.XVS,
        signature: "approve(address,uint256)",
        params: [XVS_BRIDGE_ARB, EXCESS_XVS_ARB],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: XVS_BRIDGE_ARB,
        signature: "sendFrom(address,uint16,bytes32,uint256,(address,address,bytes))",
        params: [
          arbitrumone.NORMAL_TIMELOCK,
          LzChainId.bscmainnet,
          ethers.utils.defaultAbiCoder.encode(["address"], [bscmainnet.VTREASURY]),
          EXCESS_XVS_ARB,
          [arbitrumone.NORMAL_TIMELOCK, ethers.constants.AddressZero, ADAPTER_PARAMS],
        ],
        dstChainId: LzChainId.arbitrumone,
        value: BRIDGE_FEES_ARB.toString(),
      },

      // Send XVS from ZKSync to BSC Treasury
      ...REWARD_DISTRIBUTORS_ZKSYNC.map(distributor => ({
        target: distributor.address,
        signature: "grantRewardToken(address,uint256)",
        params: [zksyncmainnet.NORMAL_TIMELOCK, distributor.excess],
        dstChainId: LzChainId.zksyncmainnet,
      })),
      {
        target: zksyncmainnet.XVS,
        signature: "approve(address,uint256)",
        params: [XVS_BRIDGE_ZKSYNC, EXCESS_XVS_ZKSYNC],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: XVS_BRIDGE_ZKSYNC,
        signature: "sendFrom(address,uint16,bytes32,uint256,(address,address,bytes))",
        params: [
          zksyncmainnet.NORMAL_TIMELOCK,
          LzChainId.bscmainnet,
          ethers.utils.defaultAbiCoder.encode(["address"], [bscmainnet.VTREASURY]),
          EXCESS_XVS_ZKSYNC,
          [zksyncmainnet.NORMAL_TIMELOCK, ethers.constants.AddressZero, ADAPTER_PARAMS],
        ],
        dstChainId: LzChainId.zksyncmainnet,
        value: BRIDGE_FEES_ZKSYNC.toString(),
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip537;
