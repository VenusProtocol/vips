import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId } from "src/types";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const { arbitrumone, ethereum, zksyncmainnet, bscmainnet } = NETWORK_ADDRESSES;

export const CORE_COMPTROLLER = bscmainnet.UNITROLLER;
export const TOTAL_XVS = parseUnits("104640", 18);
export const XVS_STORE = "0x1e25CF968f12850003Db17E0Dba32108509C4359";
export const XVS_STORE_AMOUNT = parseUnits("39690", 18);
export const XVS = bscmainnet.XVS;
export const ETHEREUM_VTREASURY = ethereum.VTREASURY;
export const ARBITRUM_ONE_VTREASURY = arbitrumone.VTREASURY;
export const ZKSYNCMAINNET_VTREASURY = zksyncmainnet.VTREASURY;
export const ETHEREUM_XVS = ethereum.XVS;
export const ARBITRUM_ONE_XVS = arbitrumone.XVS;
export const ZKSYNCMAINNET_XVS = zksyncmainnet.XVS;
export const XVS_BRIDGE = "0xf8F46791E3dB29a029Ec6c9d946226f3c613e854";
export const ADAPTER_PARAMS = ethers.utils.solidityPack(["uint16", "uint256"], [1, 300000]);
const BRIDGE_FEES = parseUnits("0.5", 18);

export const ETHEREUM_TARGETS = [
  {
    target: "0x1Db646E1Ab05571AF99e47e8F909801e5C99d37B",
    dstChainId: LzChainId.ethereum,
    amount: parseUnits("15120", 18),
    treasury: ETHEREUM_VTREASURY,
  },
  {
    target: "0x886767B62C7ACD601672607373048FFD96Cf27B2",
    dstChainId: LzChainId.ethereum,
    amount: parseUnits("14526", 18),
    treasury: ETHEREUM_VTREASURY,
  },
  {
    target: "0x1e25CF968f12850003Db17E0Dba32108509C4359",
    dstChainId: LzChainId.ethereum,
    amount: parseUnits("11139", 18),
    treasury: ETHEREUM_VTREASURY,
  },
];

export const ARBITRUM_ONE_TARGETS = [
  {
    target: "0x507D9923c954AAD8eC530ed8Dedb75bFc893Ec5e",
    dstChainId: LzChainId.arbitrumone,
    amount: parseUnits("3150", 18),
    treasury: ARBITRUM_ONE_VTREASURY,
  },
  {
    target: "0x53b488baA4052094495b6De9E5505FE1Ee3EAc7a",
    dstChainId: LzChainId.arbitrumone,
    amount: parseUnits("5265", 18),
    treasury: ARBITRUM_ONE_VTREASURY,
  },
  {
    target: "0x6204Bae72dE568384Ca4dA91735dc343a0C7bD6D",
    dstChainId: LzChainId.arbitrumone,
    amount: parseUnits("3060", 18),
    treasury: ARBITRUM_ONE_VTREASURY,
  },
];

export const ZKSYNCMAINNET_TARGETS = [
  {
    target: "0x84266F552756cBed893b1FFA85248cD99501e3ce",
    dstChainId: LzChainId.zksyncmainnet,
    amount: parseUnits("3150", 18),
    treasury: ZKSYNCMAINNET_VTREASURY,
  },
  {
    target: "0x7C7846A74AB38A8d554Bc5f7652eCf8Efb58c894",
    dstChainId: LzChainId.zksyncmainnet,
    amount: parseUnits("9540", 18),
    treasury: ZKSYNCMAINNET_VTREASURY,
  },
];

export const ETHEREUM_TOTAL_AMOUNT = parseUnits("40785", 18);
export const ARBITRUM_ONE_TOTAL_AMOUNT = parseUnits("11475", 18);
export const ZKSYNCMAINNET_TOTAL_AMOUNT = parseUnits("12690", 18);

export const vip419 = () => {
  const meta = {
    version: "v2",
    title: "VIP-419 XVS Emissions Funding Proposal",
    description: `#### Summary

If passed, this VIP will perform the following actions:

- Bridge 40,785 XVS from the [Core pool Comptroller](https://bscscan.com/address/0xfD36E2c2a6789Db23113685031d7F16329158384) to the [XVS Store](https://etherscan.io/address/0x1Db646E1Ab05571AF99e47e8F909801e5C99d37B) and some RewardsDistributor contracts on Ethereum
- Bridge 11,475 XVS from the [Core pool Comptroller](https://bscscan.com/address/0xfD36E2c2a6789Db23113685031d7F16329158384) to the [XVS Store](https://arbiscan.io/address/0x507D9923c954AAD8eC530ed8Dedb75bFc893Ec5e) and some RewardsDistributor contracts on Arbitrum one
- Bridge 12,690 XVS from the [Core pool Comptroller](https://bscscan.com/address/0xfD36E2c2a6789Db23113685031d7F16329158384) to the [XVS Store](https://explorer.zksync.io/address/0x84266F552756cBed893b1FFA85248cD99501e3ce) and some RewardsDistributor contracts on ZKsync Era
- Transfer 39,690 XVS from the [Core pool Comptroller](https://bscscan.com/address/0xfD36E2c2a6789Db23113685031d7F16329158384) to the [XVS Store](https://bscscan.com/address/0x1e25CF968f12850003Db17E0Dba32108509C4359) contract on BNB Chain
- Transfer Venus Treasury contracts on Arbitrum one and ZKsync Era to Omnichain Governance

#### Details

Building on the approved [Emissions Adjustments Across All Chains](https://snapshot.box/#/s:venus-xvs.eth/proposal/0x8033a801d152e88511475c117e114a3a2e4037d5a7252a2bea40e78a36b72d51), this proposal seeks to fund the reward distributors for an additional three months to maintain XVS emissions and continue monitoring market performance. The required amounts for each chain and location are as follows:

- Ethereum Mainnet: 40,785 XVS
    - [XVS Store](https://etherscan.io/address/0x1Db646E1Ab05571AF99e47e8F909801e5C99d37B): 15,120 XVS
    - [RewardsDistributor_Core_2](https://etherscan.io/address/0x886767B62C7ACD601672607373048FFD96Cf27B2): 14,526 XVS
    - [RewardsDistributor_Liquid Staked ETH_3](https://etherscan.io/address/0x1e25CF968f12850003Db17E0Dba32108509C4359): 11,139 XVS
- Arbitrum one: 11,475 XVS
    - [XVS Store](https://arbiscan.io/address/0x507D9923c954AAD8eC530ed8Dedb75bFc893Ec5e): 3,150 XVS
    - [RewardsDistributor_Core_0](https://arbiscan.io/address/0x53b488baA4052094495b6De9E5505FE1Ee3EAc7a): 5,265 XVS
    - [RewardsDistributor_Liquid Staked ETH_0](https://arbiscan.io/address/0x6204Bae72dE568384Ca4dA91735dc343a0C7bD6D): 3,060 XVS
- ZKsync Era: 12,690 XVS
    - [XVS Store](https://explorer.zksync.io/address/0x84266F552756cBed893b1FFA85248cD99501e3ce): 3,150 XVS
    - [RewardsDistributor_Core_0](https://explorer.zksync.io/address/0x7C7846A74AB38A8d554Bc5f7652eCf8Efb58c894): 9,540 XVS
- BNB Chain: 39,690 XVS
    - [XVS Store](https://bscscan.com/address/0x1e25CF968f12850003Db17E0Dba32108509C4359): 39,690 XVS

Source of funds: [Comptroller contract on BNB Chain](https://bscscan.com/address/0xfD36E2c2a6789Db23113685031d7F16329158384)

Complete analysis and details of these recommendations are available in the community post “[XVS Emissions Funding Proposal](https://community.venus.io/t/xvs-emissions-funding-proposal/4809)” ([snapshot](https://snapshot.box/#/s:venus-xvs.eth/proposal/0xf11cb1798e2fa6382f4b9ea7469685eb547abeb4899e70f36ab165ff5b69ec8e)).

To transfer the Venus Treasury on [Arbitrum one](https://arbiscan.io/address/0x8a662ceac418daef956bc0e6b2dd417c80cda631) and [ZKsync Era](https://explorer.zksync.io/address/0xB2e9174e23382f7744CebF7e0Be54cA001D95599) to the Normal Timelock contracts on those networks, [this](https://app.safe.global/transactions/tx?safe=arb1:0x14e0E151b33f9802b3e75b621c1457afc44DcAA0&id=multisig_0x14e0E151b33f9802b3e75b621c1457afc44DcAA0_0x9cc276513e198544b736419e11902ca2f6463dc2b2251915bedc43e83503cdff) and [this](https://app.safe.global/transactions/tx?safe=zksync:0x751Aa759cfBB6CE71A43b48e40e1cCcFC66Ba4aa&id=multisig_0x751Aa759cfBB6CE71A43b48e40e1cCcFC66Ba4aa_0x239b2b57cf205df7c3e410982c5dabe26cf7a7ec4f5d10f07d8d0c9cc6a5ceed) transactions are required, where the two steps transfer is initiated by the Guardian wallets. If this VIP passes, those transactions will be executed. Otherwise, they will be rejected.

#### References

- [Venus Treasury on Arbitrum one](https://arbiscan.io/address/0x8a662ceac418daef956bc0e6b2dd417c80cda631)
- [Venus Treasury on ZKsync Era](https://explorer.zksync.io/address/0xB2e9174e23382f7744CebF7e0Be54cA001D95599)
- [Normal Timelock on Arbitrum one](https://arbiscan.io/address/0x4b94589Cc23F618687790036726f744D602c4017)
- [Normal Timelock on ZKsync Era](https://explorer.zksync.io/address/0x093565Bc20AA326F4209eBaF3a26089272627613)
- [Guardian on Arbitrum one](https://arbiscan.io/address/0x14e0e151b33f9802b3e75b621c1457afc44dcaa0)
- [Guardian on ZKsync Era](https://explorer.zksync.io/address/0x751Aa759cfBB6CE71A43b48e40e1cCcFC66Ba4aa)
- [VIP simulation](https://github.com/VenusProtocol/vips/pull/452)`,
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
      ...ETHEREUM_TARGETS.map(({ target, dstChainId, amount, treasury }) => ({
        target: treasury,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [ETHEREUM_XVS, amount, target],
        dstChainId,
      })),
      ...ARBITRUM_ONE_TARGETS.map(({ target, dstChainId, amount, treasury }) => ({
        target: treasury,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [ARBITRUM_ONE_XVS, amount, target],
        dstChainId,
      })),
      ...ZKSYNCMAINNET_TARGETS.map(({ target, dstChainId, amount, treasury }) => ({
        target: treasury,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [ZKSYNCMAINNET_XVS, amount, target],
        dstChainId,
      })),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip419;
