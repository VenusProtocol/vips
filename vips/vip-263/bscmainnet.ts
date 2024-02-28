import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const CERTIK_RECEIVER = "0x4cf605b238e9c3c72d0faed64d12426e4a54ee12";
export const QUANTSTAMP_RECEIVER = "0xd88139f832126b465a0d7A76be887912dc367016";
export const COMMUNITY_RECEIVER = "0xc444949e0054A23c44Fc45789738bdF64aed2391";
export const XVS_RECEIVER = "0xf31acE72428501B9e8C1AF7b9FB1C6E754d65C33";
export const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
export const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";
export const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
export const XVS_BRIDGE = "0xf8F46791E3dB29a029Ec6c9d946226f3c613e854";
export const ETHEREUM_TREASURY = "0xFD9B071168bC27DBE16406eC3Aba050Ce8Eb22FA";
export const ETHEREUM_XVS_RECEIVER = ethers.utils.defaultAbiCoder.encode(["address"], [ETHEREUM_TREASURY]);

export const CERTIK_USDT_AMOUNT = parseUnits("19000", 18);
export const QUANTSTAMP_USDC_AMOUNT = parseUnits("32500", 18);
export const COMMUNITY_BNB_AMOUNT = parseUnits("1", 18);
export const COMMUNITY_USDT_AMOUNT = parseUnits("44500", 18);
export const XVS_AMOUNT = parseUnits("620", 18);
export const BRIDGE_XVS_AMOUNT = parseUnits("10", 18);
export const DEST_CHAIN_ID = 101;
export const ADAPTER_PARAMS = ethers.utils.solidityPack(["uint16", "uint256"], [1, 300000]);

export const vip263 = () => {
  const meta = {
    version: "v2",
    title: "VIP-263 Payments Issuance for audits, user XVS recovery and refunds to Community Wallet",
    description: `#### Summary

If passed this VIP will perform the following actions:

- Transfer 19,000 USDT to Certik for the retainer program
- Transfer 32,500 USDC to Quantstamp for the retainer program
- Transfer 620 XVS to a user that were wrongfully sent to the Venus Smart contract
- Transfer 1 BNB and 44,500 USDT to the Community Wallet to refund the expenses encountered for the BUSD and BTC Shortfall recoveries (Swap, Flash loans and GAS fees)
- Bridge 10 XVS to the Venus Treasury on Ethereum

#### Details

**Certik - retainer program**

- Auditor: Certik ([https://certik.com](https://certik.com/))
- Concept: Retainer program - monthly payment of March 2024. Scheduled audits by Certik in March: custom oracles for Liquid Staked Tokens and unlist market feature
- Cost: 19,000 USDT, to be sent to the BEP20 address 0x4cf605b238e9c3c72d0faed64d12426e4a54ee12

**Quantstamp - retainer program**

- Provider: Quantstamp ([https://quantstamp.com](https://quantstamp.com/))
- Concept: Retainer program - 2/4 monthly payment. Scheduled audits by Quantstamp in March: Time-based contracts and seize XVS feature
- References:
    - [Proposal in the community forum](https://community.venus.io/t/quantstamp-retainer-proposal-for-ongoing-audits/4083)
    - [Snapshot vote](https://snapshot.org/#/venus-xvs.eth/proposal/0xdc7b9c9893f6766a15cdda3dc4d819e840f59d651aca3c83b0b04d76aaa8b349)
- Cost: 32,500 USDC, to be sent to the BEP20 address: 0xd88139f832126b465a0d7A76be887912dc367016

**Refund of XVS tokens mistakenly sent to the XVS Contract address**

- As per this [Community Blog post](https://community.venus.io/t/recovery-of-xvs-tokens-mistakenly-sent-to-the-xvs-contract-address/4136), the community has agreed to return XVS tokens to a user that were mistakenly sent to the XVS token contract which is not upgradeable.
- 620 XVS will be returned from the XVS Distributor contract address ([0xfD36E2c2a6789Db23113685031d7F16329158384](https://bscscan.com/address/0xfD36E2c2a6789Db23113685031d7F16329158384)) to user’s address ([0xf31acE72428501B9e8C1AF7b9FB1C6E754d65C33](https://bscscan.com/address/0xf31ace72428501b9e8c1af7b9fb1c6e754d65c33)).

**Refund to the Community Wallet**

The [Community Wallet](https://bscscan.com/address/0xc444949e0054A23c44Fc45789738bdF64aed2391) has financed the Gas fees and Flash Loans cost for the recovery of over 4M BUSD Shortfalls and several million dollars of BTC shortfalls over hundreds of manual transactions throughout several weeks in December 2023 and January 2024.

The amounts to be refunded are:

- [1 BNB](https://bscscan.com/tx/0x809b54cbb298801b1cb9b5fabb617ca877166e2f976a0814e088987ec6a18be5)
- [1K USDT](https://bscscan.com/tx/0xbf5d9f81879e5783670075e23f2e7970d25adaccecc3c143945d9aba154e5e90)
- [1K USDT](https://bscscan.com/tx/0x67de18a770f0f42b819439a262d810f8e5d646070611496c1c15b6d476d11593)
- [1K USDT](https://bscscan.com/tx/0x7f5ae3a9d28602bafc1a76b76ed6e9be9a4e7af579d6e7b983db6175ff559b04)
- [2K USDC](https://bscscan.com/tx/0xabf7cc1dba6686c295a408f04572a4d9b651e01331f8be7edc9013f542e74e9e)
- [2K USDT](https://bscscan.com/tx/0x5fca226b1cf598256361dbce34b389e83f870ec7bbb04718df69a86a9e9e72f2)
- [24K USDT](https://bscscan.com/tx/0xfa5e59324c8e21616817b2ec09d6c37aed77c3f16c1868622667c5785733789b)
- [25K USDT](https://bscscan.com/tx/0x4b8e11b6e3fb12b1bfedb247871e9e86dcac6adc115cb3a5ffe14813cd99224f)

Total: 1 BNB + 56K USDT
- Carry-Over/unspent Balance: 11,500 USDT
- Net Refund to Community Wallet: 1 BNB + 44,500 USDT to be transferred to BEP20 Wallet 0xc444949e0054A23c44Fc45789738bdF64aed2391

**Bridge XVS to the Venus Treasury on Ethereum**

The XVS bridge BNB Chain - Ethereum was enabled in the [VIP-232](https://app.venus.io/#/governance/proposal/232), and it has been used by the users without any issues. Bridging from a VIP shouldn’t be different, but it seems safer to perform a couple of tests before bridging the full amount of XVS to be configured as rewards on Ethereum.

In this first test with real XVS we are bridging 10 XVS to the [Venus Treasury on Ethereum](https://etherscan.io/address/0xFD9B071168bC27DBE16406eC3Aba050Ce8Eb22FA)

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/220)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, CERTIK_USDT_AMOUNT, CERTIK_RECEIVER],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDC, QUANTSTAMP_USDC_AMOUNT, QUANTSTAMP_RECEIVER],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBNB(uint256,address)",
        params: [COMMUNITY_BNB_AMOUNT, COMMUNITY_RECEIVER],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, COMMUNITY_USDT_AMOUNT, COMMUNITY_RECEIVER],
      },
      {
        target: COMPTROLLER,
        signature: "_grantXVS(address,uint256)",
        params: [XVS_RECEIVER, XVS_AMOUNT],
      },
      {
        target: COMPTROLLER,
        signature: "_grantXVS(address,uint256)",
        params: [NORMAL_TIMELOCK, BRIDGE_XVS_AMOUNT],
      },
      {
        target: XVS,
        signature: "approve(address,uint256)",
        params: [XVS_BRIDGE, BRIDGE_XVS_AMOUNT],
      },
      {
        target: XVS_BRIDGE,
        signature: "sendFrom(address,uint16,bytes32,uint256,(address,address,bytes))",
        params: [
          NORMAL_TIMELOCK,
          DEST_CHAIN_ID,
          ETHEREUM_XVS_RECEIVER,
          BRIDGE_XVS_AMOUNT,
          [NORMAL_TIMELOCK, ethers.constants.AddressZero, ADAPTER_PARAMS],
        ],
        value: parseUnits("0.5", 18).toString(),
      },
      {
        target: XVS,
        signature: "approve(address,uint256)",
        params: [XVS_BRIDGE, 0],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip263;
