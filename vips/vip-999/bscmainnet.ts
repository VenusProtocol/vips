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

export const vip999 = () => {
  const meta = {
    version: "v2",
    title:
      "VIP-999 [BNB Chain] Sunset Phase 2.1 (opBNB, Optimism, Unichain) and tighten XVS bridge limits on Ethereum and zkSync on BSC `XVSProxyOFTSrc`",
    description: `#### Summary

Following VIP-615 (Core Pool sunset on opBNB, Unichain and Optimism), this VIP tightens the per-destination XVS bridge limits stored on the BSC \`XVSProxyOFTSrc\` (\`${XVS_PROXY_OFT_SRC}\`) in both directions.

Limits on this contract are **denominated in USD with 18 decimals** — the bridge converts the transferred XVS amount to USD via the \`ResilientOracle\` and compares it against these caps. From BSC's perspective: *Send* = BSC → destination, *Receive* = destination → BSC.

Outbound (send) caps to the chains being wound down (opBNB, zkSync, Optimism, Unichain) are zeroed. Inbound (receive) caps for those same chains are reduced to a small non-zero amount so existing holders can still bridge their XVS back to BSC under tighter caps. Ethereum send and receive are both reduced. Arbitrum and Base are untouched in both directions.

#### Changes (per destination chain)

| Destination | Daily Send | Single Send | Daily Receive | Single Receive |
| --- | --- | --- | --- | --- |
| Ethereum (101) | $1,000,000 → $150,000 | $100,000 → $30,000 | $1,020,000 → $50,000 | $102,000 → $20,000 |
| opBNB (202) | $50,000 → $0 | $10,000 → $0 | $51,000 → $1,000 | $10,200 → $1,000 |
| Arbitrum (110) | unchanged | unchanged | unchanged | unchanged |
| zkSync (165) | $100,000 → $0 | $20,000 → $0 | $102,000 → $10,000 | $20,400 → $10,000 |
| Optimism (111) | $100,000 → $0 | $20,000 → $0 | $102,000 → $2,000 | $20,400 → $2,000 |
| Base (184) | unchanged | unchanged | unchanged | unchanged |
| Unichain (320) | $100,000 → $0 | $20,000 → $0 | $102,000 → $10,000 | $20,400 → $10,000 |

#### Actions

For each changed destination, this VIP calls the corresponding setters on the BSC \`XVSBridgeAdmin\` (\`${XVS_BRIDGE_ADMIN}\`):

- \`setMaxDailyLimit(uint16,uint256)\`
- \`setMaxSingleTransactionLimit(uint16,uint256)\`
- \`setMaxDailyReceiveLimit(uint16,uint256)\`
- \`setMaxSingleReceiveTransactionLimit(uint16,uint256)\`

Five destinations × four setters = **20 commands**. Arbitrum and Base are unchanged and emit zero commands. No remote-chain bridge admins are touched.

#### References

- [BSC \`XVSProxyOFTSrc\`](https://bscscan.com/address/${XVS_PROXY_OFT_SRC})
- [BSC \`XVSBridgeAdmin\`](https://bscscan.com/address/${XVS_BRIDGE_ADMIN})
- [XVS omnichain deployed contracts](https://docs-v4.venus.io/deployed-contracts/xvs-omnichain)
- VIP-407 — original bridge limit configuration
- VIP-615 — Core Pool sunset Phase 1 Step 2`,
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

export default vip999;
