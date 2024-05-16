import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const PROTOCOL_SHARE_RESERVE = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";
const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
const CHAINLINK_ORACLE = "0x1B2103441A0A108daD8848D8F5d790e4D402921F";

const VBUSD = "0x95c78222B3D6e262426483D42CfA53685A67Ab9D";
const BUSD = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";

const RESERVES_TO_WITHDRAW = parseUnits("2373087.553409498607767042", 18);
const VTOKEN_AMOUNT = parseUnits("7021262.3028218", 8);
const REDEEMER_CONTRACT = "0x29171F17BF7F3691908eD55bAC2014A632B87dD3";
const BNB_CHAIN_RECEIVER = "0x6657911F7411765979Da0794840D671Be55bA273";

export const vip226 = () => {
  const meta = {
    version: "v2",
    title: "VIP-226: Conversion of BUSD to USDT to Mitigate BUSD Depreciation Risks and fix BUSD price to $1",
    description: `#### Summary

If passed, this VIP will perform the following actions:

- Redeem the vBUSD from the community treasury ([7,021,262.3 vBUSD](https://bscscan.com/token/0x95c78222b3d6e262426483d42cfa53685a67ab9d?a=0xf322942f644a996a617bd29c16bd7d231d9f35e9) to 156,571 BUSD, approximately)
- Transfer BUSD reserves ([2,373,087.5 BUSD](https://bscscan.com/address/0x95c78222b3d6e262426483d42cfa53685a67ab9d#readProxyContract#F26)) and redeemed BUSD liquidation revenue (156,571 BUSD, approximately) to [Binance](https://bscscan.com/address/0x6657911F7411765979Da0794840D671Be55bA273), where it will be exchanged for USDT. The converted USDT will then be sent back to the [Community Treasury](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9)
- Set a fixed price of $1 for BUSD, preparing for the deprecation of BUSD price feed on [Chainlink](https://chain.link/), scheduled for January 5th, 2024

#### Description

The Community Treasury holds [7,021,262.3 vBUSD](https://bscscan.com/token/0x95c78222b3d6e262426483d42cfa53685a67ab9d?a=0xf322942f644a996a617bd29c16bd7d231d9f35e9) (redeemable to approximately 156,571 BUSD), and the BUSD reserves are [2,373,087.5 BUSD](https://bscscan.com/address/0x95c78222b3d6e262426483d42cfa53685a67ab9d#readProxyContract#F26) (block 34837453).

This VIP will redeem the vBUSD tokens currently held by the Community Treasury, and transfer the BUSD to Binance for the conversion to USDT. To do that, the VIP will use the [TokenRedeemer](https://bscscan.com/address/0x29171F17BF7F3691908eD55bAC2014A632B87dD3) contract. This VIP also withdraws all available BUSD reserves to Binance for the conversion to USDT. The converted USDT will then be redeposited into our Treasury.

This VIP fixes the BUSD price to $1. The collateral factor of this market was set to zero in the [VIP-223](https://app.venus.io/#/governance/proposal/223), users cannot supply BUSD to the market and they cannot borrow BUSD from the market either. Therefore, setting the price for BUSD to $1 fixed does not have any impact on the protocol, it is only a cosmetic measure aligned with the [Paxos statement](https://paxos.com/2023/02/13/paxos-will-halt-minting-new-busd-tokens/).

VIP simulation: [https://github.com/VenusProtocol/vips/pull/147](https://github.com/VenusProtocol/vips/pull/147)

#### References

- [VIP-215 BUSD debt mitigation](https://app.venus.io/#/governance/proposal/215)
- [VIP-216: Conversion of BUSD to USDT to Mitigate BUSD Depreciation Risks](https://app.venus.io/#/governance/proposal/216)
- [TokenRedeemer contract deployed to mainnet](https://bscscan.com/address/0x29171F17BF7F3691908eD55bAC2014A632B87dD3)
- [Source code of the TokenRedeemer contract](https://github.com/VenusProtocol/venus-protocol/pull/420)
- [Binance will cease support for BUSD products on 2023-12-15](https://www.binance.com/en/support/announcement/notice-regarding-the-removal-of-busd-and-conversion-of-busd-to-fdusd-1c98ce7bb464422dbbaeda7066ae445b)
- [Paxos Will Halt Minting New BUSD Tokens - Press Release February 13, 2023](https://paxos.com/2023/02/13/paxos-will-halt-minting-new-busd-tokens/)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with this proposal",
  };

  return makeProposal(
    [
      {
        target: VBUSD,
        signature: "setProtocolShareReserve(address)",
        params: [NORMAL_TIMELOCK],
      },
      {
        target: VBUSD,
        signature: "_reduceReserves(uint256)",
        params: [RESERVES_TO_WITHDRAW],
      },
      {
        target: VBUSD,
        signature: "setProtocolShareReserve(address)",
        params: [PROTOCOL_SHARE_RESERVE],
      },
      {
        target: BUSD,
        signature: "transfer(address,uint256)",
        params: [BNB_CHAIN_RECEIVER, RESERVES_TO_WITHDRAW],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [VBUSD, VTOKEN_AMOUNT, REDEEMER_CONTRACT],
      },
      {
        target: REDEEMER_CONTRACT,
        signature: "redeemAndTransfer(address,address)",
        params: [VBUSD, BNB_CHAIN_RECEIVER],
      },
      {
        target: CHAINLINK_ORACLE,
        signature: "setDirectPrice(address,uint256)",
        params: [BUSD, parseUnits("1", 18)],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
