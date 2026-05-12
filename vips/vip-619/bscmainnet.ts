import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";

import { LzChainId, ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const XVS_BRIDGE_ADMIN = "0x70d644877b7b73800E9073BCFCE981eAaB6Dbc21";
export const XVS_PROXY_OFT_SRC = "0xf8F46791E3dB29a029Ec6c9d946226f3c613e854";

export type NewBridgeLimits = {
  dstLzChainId: LzChainId;
  oldMaxDailyLimit: BigNumber;
  oldMaxSingleTransactionLimit: BigNumber;
  oldMaxDailyReceiveLimit: BigNumber;
  oldMaxSingleReceiveTransactionLimit: BigNumber;
  newMaxDailyLimit: BigNumber;
  newMaxSingleTransactionLimit: BigNumber;
  newMaxDailyReceiveLimit: BigNumber;
  newMaxSingleReceiveTransactionLimit: BigNumber;
};

export const remoteBridgeEntries: NewBridgeLimits[] = [
  {
    dstLzChainId: LzChainId.ethereum,
    oldMaxDailyLimit: parseUnits("1000000", 18),
    oldMaxSingleTransactionLimit: parseUnits("100000", 18),
    oldMaxDailyReceiveLimit: parseUnits("1020000", 18),
    oldMaxSingleReceiveTransactionLimit: parseUnits("102000", 18),
    newMaxDailyLimit: parseUnits("150000", 18),
    newMaxSingleTransactionLimit: parseUnits("30000", 18),
    newMaxDailyReceiveLimit: parseUnits("50000", 18),
    newMaxSingleReceiveTransactionLimit: parseUnits("20000", 18),
  },
  {
    dstLzChainId: LzChainId.opbnbmainnet,
    oldMaxDailyLimit: parseUnits("50000", 18),
    oldMaxSingleTransactionLimit: parseUnits("10000", 18),
    oldMaxDailyReceiveLimit: parseUnits("51000", 18),
    oldMaxSingleReceiveTransactionLimit: parseUnits("10200", 18),
    newMaxDailyLimit: parseUnits("0", 18),
    newMaxSingleTransactionLimit: parseUnits("0", 18),
    newMaxDailyReceiveLimit: parseUnits("1000", 18),
    newMaxSingleReceiveTransactionLimit: parseUnits("1000", 18),
  },
  {
    dstLzChainId: LzChainId.arbitrumone,
    oldMaxDailyLimit: parseUnits("100000", 18),
    oldMaxSingleTransactionLimit: parseUnits("20000", 18),
    oldMaxDailyReceiveLimit: parseUnits("102000", 18),
    oldMaxSingleReceiveTransactionLimit: parseUnits("20400", 18),
    newMaxDailyLimit: parseUnits("100000", 18),
    newMaxSingleTransactionLimit: parseUnits("20000", 18),
    newMaxDailyReceiveLimit: parseUnits("102000", 18),
    newMaxSingleReceiveTransactionLimit: parseUnits("20400", 18),
  },
  {
    dstLzChainId: LzChainId.zksyncmainnet,
    oldMaxDailyLimit: parseUnits("100000", 18),
    oldMaxSingleTransactionLimit: parseUnits("20000", 18),
    oldMaxDailyReceiveLimit: parseUnits("102000", 18),
    oldMaxSingleReceiveTransactionLimit: parseUnits("20400", 18),
    newMaxDailyLimit: parseUnits("0", 18),
    newMaxSingleTransactionLimit: parseUnits("0", 18),
    newMaxDailyReceiveLimit: parseUnits("10000", 18),
    newMaxSingleReceiveTransactionLimit: parseUnits("10000", 18),
  },
  {
    dstLzChainId: LzChainId.opmainnet,
    oldMaxDailyLimit: parseUnits("100000", 18),
    oldMaxSingleTransactionLimit: parseUnits("20000", 18),
    oldMaxDailyReceiveLimit: parseUnits("102000", 18),
    oldMaxSingleReceiveTransactionLimit: parseUnits("20400", 18),
    newMaxDailyLimit: parseUnits("0", 18),
    newMaxSingleTransactionLimit: parseUnits("0", 18),
    newMaxDailyReceiveLimit: parseUnits("2000", 18),
    newMaxSingleReceiveTransactionLimit: parseUnits("2000", 18),
  },
  {
    dstLzChainId: LzChainId.basemainnet,
    oldMaxDailyLimit: parseUnits("100000", 18),
    oldMaxSingleTransactionLimit: parseUnits("20000", 18),
    oldMaxDailyReceiveLimit: parseUnits("102000", 18),
    oldMaxSingleReceiveTransactionLimit: parseUnits("20400", 18),
    newMaxDailyLimit: parseUnits("100000", 18),
    newMaxSingleTransactionLimit: parseUnits("20000", 18),
    newMaxDailyReceiveLimit: parseUnits("102000", 18),
    newMaxSingleReceiveTransactionLimit: parseUnits("20400", 18),
  },
  {
    dstLzChainId: LzChainId.unichainmainnet,
    oldMaxDailyLimit: parseUnits("100000", 18),
    oldMaxSingleTransactionLimit: parseUnits("20000", 18),
    oldMaxDailyReceiveLimit: parseUnits("102000", 18),
    oldMaxSingleReceiveTransactionLimit: parseUnits("20400", 18),
    newMaxDailyLimit: parseUnits("0", 18),
    newMaxSingleTransactionLimit: parseUnits("0", 18),
    newMaxDailyReceiveLimit: parseUnits("10000", 18),
    newMaxSingleReceiveTransactionLimit: parseUnits("10000", 18),
  },
];

// Arbitrum and Base limits are unchanged in this VIP — skip them so no no-op setters are emitted.
const newBridgeLimits = remoteBridgeEntries.filter(
  e => e.dstLzChainId !== LzChainId.arbitrumone && e.dstLzChainId !== LzChainId.basemainnet,
);

export const vip619 = () => {
  const meta = {
    version: "v2",
    title: "VIP-619 [BNB Chain] XVS Bridge: Close opBNB / Optimism / Unichain / zkSync, Tighten Ethereum",
    description: `#### Summary

This proposal adjusts the per-destination XVS bridge limits stored on the BSC XVSProxyOFTSrc. Outbound caps to opBNB, Optimism, Unichain, and zkSync are reduced to zero; Ethereum is tightened in both directions; Arbitrum and Base are unchanged.

#### Description

All caps live on XVSProxyOFTSrc (${XVS_PROXY_OFT_SRC}) and are denominated in USD with 18 decimals. Outbound (BSC → destination) caps on opBNB, Optimism, Unichain, and zkSync are set to zero, disabling new sends to those chains; inbound (destination → BSC) caps on the same four chains are reduced to small non-zero values so existing holders can return XVS to BSC. The outbound closure on zkSync is driven by the absence of an XVS price oracle on that chain rather than by a Core Pool sunset. Ethereum is tightened in both directions while remaining operational. Arbitrum and Base are unchanged. No remote-chain bridge admins are touched.

New per-destination limits:

- **Ethereum (101)**
  - Daily Send: $1,000,000 → $150,000
  - Single Send: $100,000 → $30,000
  - Daily Receive: $1,020,000 → $50,000
  - Single Receive: $102,000 → $20,000
- **opBNB (202)**
  - Daily Send: $50,000 → $0
  - Single Send: $10,000 → $0
  - Daily Receive: $51,000 → $1,000
  - Single Receive: $10,200 → $1,000
- **Arbitrum (110)** — unchanged
- **zkSync (165)**
  - Daily Send: $100,000 → $0
  - Single Send: $20,000 → $0
  - Daily Receive: $102,000 → $10,000
  - Single Receive: $20,400 → $10,000
- **Optimism (111)**
  - Daily Send: $100,000 → $0
  - Single Send: $20,000 → $0
  - Daily Receive: $102,000 → $2,000
  - Single Receive: $20,400 → $2,000
- **Base (184)** — unchanged
- **Unichain (320)**
  - Daily Send: $100,000 → $0
  - Single Send: $20,000 → $0
  - Daily Receive: $102,000 → $10,000
  - Single Receive: $20,400 → $10,000

#### Actions

For each of Ethereum (101), opBNB (202), zkSync (165), Optimism (111), Unichain (320), this proposal calls the following four setters on XVSBridgeAdmin (${XVS_BRIDGE_ADMIN}) with the destination LzChainId and the new USD18 cap:

- setMaxSingleTransactionLimit(uint16,uint256)
- setMaxDailyLimit(uint16,uint256)
- setMaxSingleReceiveTransactionLimit(uint16,uint256)
- setMaxDailyReceiveLimit(uint16,uint256)

Total: 5 destinations × 4 setters = **20 calls**. Arbitrum (110) and Base (184) are unchanged and emit no calls.

#### References

- [GitHub PR #704](https://github.com/VenusProtocol/vips/pull/704)
- [BSC XVSProxyOFTSrc on BscScan](https://bscscan.com/address/${XVS_PROXY_OFT_SRC})
- [BSC XVSBridgeAdmin on BscScan](https://bscscan.com/address/${XVS_BRIDGE_ADMIN})
- [XVS omnichain deployed contracts](https://docs-v4.venus.io/deployed-contracts/xvs-omnichain)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      ...newBridgeLimits.map(({ dstLzChainId, newMaxSingleTransactionLimit }) => ({
        target: XVS_BRIDGE_ADMIN,
        signature: "setMaxSingleTransactionLimit(uint16,uint256)",
        params: [dstLzChainId, newMaxSingleTransactionLimit],
      })),
      ...newBridgeLimits.map(({ dstLzChainId, newMaxDailyLimit }) => ({
        target: XVS_BRIDGE_ADMIN,
        signature: "setMaxDailyLimit(uint16,uint256)",
        params: [dstLzChainId, newMaxDailyLimit],
      })),
      ...newBridgeLimits.map(({ dstLzChainId, newMaxSingleReceiveTransactionLimit }) => ({
        target: XVS_BRIDGE_ADMIN,
        signature: "setMaxSingleReceiveTransactionLimit(uint16,uint256)",
        params: [dstLzChainId, newMaxSingleReceiveTransactionLimit],
      })),
      ...newBridgeLimits.map(({ dstLzChainId, newMaxDailyReceiveLimit }) => ({
        target: XVS_BRIDGE_ADMIN,
        signature: "setMaxDailyReceiveLimit(uint16,uint256)",
        params: [dstLzChainId, newMaxDailyReceiveLimit],
      })),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip619;
