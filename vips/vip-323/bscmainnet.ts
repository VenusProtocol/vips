import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";
export const XVS_BRIDGE_SRC = "0xf8F46791E3dB29a029Ec6c9d946226f3c613e854";
export const ARBITRUM_ONE_VTREASURY = "0x8a662ceAC418daeF956Bc0e6B2dd417c80CDA631";

const BSC_TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";

const BRIDGE_FEES = parseUnits("0.05", 18); // value bigger than real estimated fees(0.0005)
export const XVS_AMOUNT = parseUnits("30000", 18);
const RECEIVER_ADDRESS = ethers.utils.defaultAbiCoder.encode(["address"], [ARBITRUM_ONE_VTREASURY]);
const ADAPTER_PARAMS = ethers.utils.solidityPack(["uint16", "uint256"], [1, 300000]);
const DEST_CHAIN_ID = 110;

export const COMMUNITY_WALLET = "0xc444949e0054A23c44Fc45789738bdF64aed2391";
export const ETH_AMOUNT_WALLET = parseUnits("5", 18);
export const XVS_AMOUNT_WALLET = parseUnits("1500", 18);
export const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";

const vip323 = () => {
  const meta = {
    version: "v2",
    title: "VIP-323 [Arbitrum] VIP-323 XVS rewards on Arbitrum one",
    description: `#### Summary

If passed, this VIP will perform these actions following the proposal [Incentive Model Proposal for Arbitrum Deployment](https://community.venus.io/t/incentive-model-proposal-for-arbitrum-deployment/4408):

- send 30,000 XVS tokens from the [XVS Distributor on BNB chain](https://bscscan.com/address/0xfD36E2c2a6789Db23113685031d7F16329158384) to the [Venus Treasury on Arbitrum one](https://arbiscan.io/address/0x8a662ceac418daef956bc0e6b2dd417c80cda631). These funds will be distributed this way:
    - Transfer 4,500 XVS from the Venus Treasury on Arbitrum one to the [XVSStore](https://arbiscan.io/address/0x507D9923c954AAD8eC530ed8Dedb75bFc893Ec5e) contract, used as XVS vault rewards
    - Transfer 10,200 XVS from the Venus Treasury on Arbitrum one to the XVS [RewardsDistributor](https://arbiscan.io/address/0x53b488baA4052094495b6De9E5505FE1Ee3EAc7a) of the Core pool, used as market emissions
    - The rest of the XVS will be used for other market emissions in the future
- transfer of 1,500 XVS from the [XVS Distributor on BNB chain](https://bscscan.com/address/0xfD36E2c2a6789Db23113685031d7F16329158384), and 5 ETH from the [Venus Treasury on BNB](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9), to the [Community Wallet on BNB chain](https://bscscan.com/address/0xc444949e0054A23c44Fc45789738bdF64aed2391). These funds will fund the XVS/ETH pool on Uniswap Arbitrum one.

#### Description

According to the proposal [Incentive Model Proposal for Arbitrum Deployment](https://community.venus.io/t/incentive-model-proposal-for-arbitrum-deployment/4408), the following XVS rewards will be enabled on Arbitrum one for the first 90 days:

- **Market Emissions**: 10,200 XVS allocated as liquidity incentives, for the following markets in the Core pool on Arbitrum one:
    - WETH: 1,275 XVS
    - WBTC: 2,550 XVS
    - USDT: 2,550 XVS
    - USDC: 2,550 XVS
    - ARB: 1,275 XVS
    - In every case, 40% of the XVS rewards will be for the suppliers and 60% for the borrowers
- **XVS Vault Base Rewards**: 4,500 XVS allocated to the XVS vault.

15,300 XVS will stay in the Venus Treasury on Arbitrum one, and they will be used as liquidity incentives in the future markets.

Moreover, 1,500 XVS and 5 ETH will be provided to a XVS/ETH pool on Uniswap Arbitrum one.

In total, 31,500 XVS will be transferred to Arbitrum one to accomplish the requirements for the first 3 months.

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/274)
- Snapshot “[Incentive Model Proposal for Arbitrum Deployment](https://snapshot.org/#/venus-xvs.eth/proposal/0x3afa725eab1907db932650d017eede9eff93f8cc5289ee351e2604b326d1420b)”
- Community proposal “[Incentive Model Proposal for Arbitrum Deployment](https://community.venus.io/t/incentive-model-proposal-for-arbitrum-deployment/4408)”
- [Documentation](https://docs-v4.venus.io/)

#### Disclaimer for Arbitrum one VIPs

Privilege commands on Arbitrum one will be executed by the [](https://etherscan.io/address/0x285960C5B22fD66A736C7136967A3eB15e93CC67)[Guardian wallet](https://arbiscan.io/address/0x14e0E151b33f9802b3e75b621c1457afc44DcAA0), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are deployed. If this VIP passes, [](https://app.safe.global/transactions/tx?safe=eth:0x285960C5B22fD66A736C7136967A3eB15e93CC67&id=multisig_0x285960C5B22fD66A736C7136967A3eB15e93CC67_0x79ca5d7ef82648f5c52054aa996356da270a60e95a959c595ee3c29defc6a4ca)[this](https://app.safe.global/transactions/tx?id=multisig_0x14e0E151b33f9802b3e75b621c1457afc44DcAA0_0x8fad3eb6a581bb261405c65572cf0ba09eb0568a6648ea11df413228a780e298&safe=arb1:0x14e0E151b33f9802b3e75b621c1457afc44DcAA0) multisig transaction will be executed. Otherwise, it will be rejected.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER,
        signature: "_grantXVS(address,uint256)",
        params: [NORMAL_TIMELOCK, XVS_AMOUNT],
      },
      {
        target: COMPTROLLER,
        signature: "_grantXVS(address,uint256)",
        params: [COMMUNITY_WALLET, XVS_AMOUNT_WALLET],
      },
      {
        target: BSC_TREASURY,
        signature: "withdrawTreasuryBNB(uint256,address)",
        params: [BRIDGE_FEES, NORMAL_TIMELOCK],
      },
      {
        target: BSC_TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [ETH, ETH_AMOUNT_WALLET, COMMUNITY_WALLET],
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
          [BSC_TREASURY, ethers.constants.AddressZero, ADAPTER_PARAMS],
        ],
        value: BRIDGE_FEES.toString(),
      },
      {
        target: XVS,
        signature: "approve(address,uint256)",
        params: [XVS_BRIDGE_SRC, 0],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip323;
