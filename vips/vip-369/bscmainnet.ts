import { ethers } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const XVS_BRIDGE_SRC = "0xf8F46791E3dB29a029Ec6c9d946226f3c613e854";
export const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
export const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const ZKSYNCMAINNET_TREASURY = "0xB2e9174e23382f7744CebF7e0Be54cA001D95599";
export const XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";
export const COMMUNITY_WALLET = "0xc444949e0054a23c44fc45789738bdf64aed2391";
export const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
export const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";

export const RECEIVER_ADDRESS = ethers.utils.defaultAbiCoder.encode(["address"], [ZKSYNCMAINNET_TREASURY]);
export const ADAPTER_PARAMS = ethers.utils.solidityPack(["uint16", "uint256"], [1, 300000]);
export const XVS_AMOUNT = parseUnits("37500", 18);
export const DEST_CHAIN_ID = LzChainId.zksyncmainnet;

export const vip369 = () => {
  const meta = {
    version: "v2",
    title: "VIP-369 [zkSync] XVS rewards on zkSync",
    description: `#### Summary

If passed, this VIP will perform these actions following the proposal [[ZKsync] XVS Incentives Model Proposal](https://community.venus.io/t/zksync-xvs-incentives-model-proposal/4580):

- send 36,000 XVS tokens from the [XVS Distributor on BNB chain](https://bscscan.com/address/0xfD36E2c2a6789Db23113685031d7F16329158384) to the [Venus Treasury on zkSync Era](https://explorer.zksync.io/address/0xB2e9174e23382f7744CebF7e0Be54cA001D95599). These funds will be distributed this way:
    - transfer 6,000 XVS from the Venus Treasury on zkSync Era to the [XVSStore](https://explorer.zksync.io/address/0x84266F552756cBed893b1FFA85248cD99501e3ce) contract, used as XVS vault rewards
    - transfer 30,000 XVS from the Venus Treasury on zkSync Era to the XVS [RewardsDistributor](https://explorer.zksync.io/address/0x7C7846A74AB38A8d554Bc5f7652eCf8Efb58c894) of the Core pool, used as market emissions
- transfer of 1,500 XVS from the [XVS Distributor on BNB chain](https://bscscan.com/address/0xfD36E2c2a6789Db23113685031d7F16329158384), and 5 ETH from the [Venus Treasury on BNB](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9), to the [Community Wallet on BNB chain](https://bscscan.com/address/0xc444949e0054A23c44Fc45789738bdF64aed2391). These funds will fund the XVS/ETH pool on Uniswap zkSync Era

#### Description

According to the proposal [[ZKsync] XVS Incentives Model Proposal](https://community.venus.io/t/zksync-xvs-incentives-model-proposal/4580), the following XVS rewards will be enabled on zkSync Era for the first 30 days:

- **Market Emissions:** 12,000 XVS allocated as liquidity incentives, for the following markets in the Core pool on zkSync Era:
    - WETH: 2,400 XVS
    - WBTC: 2,400 XVS
    - USDT: 1,800 XVS
    - USDC.e: 3,600 XVS
    - ZK: 1,800 XVS
    - In every case, 80% of the XVS rewards will be for the suppliers and 20% for the borrowers
- Market emissions could be updated after 30 days in a different VIP, following the incentives model proposal, to distribute the 18,000 XVS also sent to the [RewardsDistributor](https://explorer.zksync.io/address/0x7C7846A74AB38A8d554Bc5f7652eCf8Efb58c894) contract

The **XVS Vault Base Rewards** will be configured in this VIP to distribute 6,000 XVS in 120 days.

Moreover, 1,500 XVS and 5 ETH will be provided to a XVS/ETH pool on Uniswap zkSync Era.

In total, 37,500 XVS will be transferred to zkSync Era to accomplish the requirements for the first 4 months.

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/387)
- Snapshot “[[ZKsync] XVS Incentives Model Proposal](https://snapshot.org/#/venus-xvs.eth/proposal/0x646fa7f813e73b6f330b9dcf0e5e88733e8b35ff59736e6ac3c54dcad6fb03d2)”
- Community proposal “[[ZKsync] XVS Incentives Model Proposal](https://community.venus.io/t/zksync-xvs-incentives-model-proposal/4580)”
- [Documentation](https://docs-v4.venus.io/)

#### Disclaimer for zkSync Era VIPs

Privilege commands on zkSync Era will be executed by the [Guardian wallet](https://explorer.zksync.io/address/0x751Aa759cfBB6CE71A43b48e40e1cCcFC66Ba4aa), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are fully enabled. If this VIP passes, [this](https://app.safe.global/transactions/tx?safe=zksync:0x751Aa759cfBB6CE71A43b48e40e1cCcFC66Ba4aa&id=multisig_0x751Aa759cfBB6CE71A43b48e40e1cCcFC66Ba4aa_0x580e3a096f613b03e88a5ef91f43c0b597c802a031725339a769773c2e14b336) multisig transaction will be executed. Otherwise, it will be rejected.
`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER,
        signature: "_grantXVS(address,uint256)",
        params: [NORMAL_TIMELOCK, XVS_AMOUNT],
      },
      {
        target: XVS,
        signature: "approve(address,uint256)",
        params: [XVS_BRIDGE_SRC, 0],
      },
      {
        target: XVS,
        signature: "approve(address,uint256)",
        params: [XVS_BRIDGE_SRC, XVS_AMOUNT],
      },
      {
        target: XVS_BRIDGE_SRC,
        signature: "sendFrom(address,uint16,bytes32,uint256,(address,address,bytes))",
        params: [
          NORMAL_TIMELOCK,
          DEST_CHAIN_ID,
          RECEIVER_ADDRESS,
          XVS_AMOUNT,
          [NORMAL_TIMELOCK, ethers.constants.AddressZero, ADAPTER_PARAMS],
        ],
        value: "70000000000000000",
      },
      // Transfer 5 ETH to the Community wallet
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [ETH, parseUnits("5", 18), COMMUNITY_WALLET],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip369;
