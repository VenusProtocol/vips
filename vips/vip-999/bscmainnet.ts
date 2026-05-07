import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";

import { LzChainId, ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const XVS_BRIDGE_ADMIN = "0x70d644877b7b73800E9073BCFCE981eAaB6Dbc21";
export const XVS_PROXY_OFT_SRC = "0xf8F46791E3dB29a029Ec6c9d946226f3c613e854";

export type BridgeLimits = {
  maxDailyLimit: BigNumber;
  maxSingleTransactionLimit: BigNumber;
};

export type RemoteBridgeEntry = {
  dstLzChainId: LzChainId;
  before: BridgeLimits;
  after: BridgeLimits;
};

const usd = (n: string) => parseUnits(n, 18);

export const remoteBridgeEntries: RemoteBridgeEntry[] = [
  {
    dstLzChainId: LzChainId.ethereum,
    before: { maxDailyLimit: usd("1000000"), maxSingleTransactionLimit: usd("100000") },
    after: { maxDailyLimit: usd("150000"), maxSingleTransactionLimit: usd("30000") },
  },
  {
    dstLzChainId: LzChainId.opbnbmainnet,
    before: { maxDailyLimit: usd("50000"), maxSingleTransactionLimit: usd("10000") },
    after: { maxDailyLimit: usd("0"), maxSingleTransactionLimit: usd("0") },
  },
  {
    dstLzChainId: LzChainId.arbitrumone,
    before: {
      maxDailyLimit: usd("100000"),
      maxSingleTransactionLimit: usd("20000"),
    },
    after: {
      maxDailyLimit: usd("100000"),
      maxSingleTransactionLimit: usd("20000"),
    },
  },
  {
    dstLzChainId: LzChainId.zksyncmainnet,
    before: {
      maxDailyLimit: usd("100000"),
      maxSingleTransactionLimit: usd("20000"),
    },
    after: { maxDailyLimit: usd("0"), maxSingleTransactionLimit: usd("0") },
  },
  {
    dstLzChainId: LzChainId.opmainnet,
    before: {
      maxDailyLimit: usd("100000"),
      maxSingleTransactionLimit: usd("20000"),
    },
    after: { maxDailyLimit: usd("0"), maxSingleTransactionLimit: usd("0") },
  },
  {
    dstLzChainId: LzChainId.basemainnet,
    before: {
      maxDailyLimit: usd("100000"),
      maxSingleTransactionLimit: usd("20000"),
    },
    after: {
      maxDailyLimit: usd("100000"),
      maxSingleTransactionLimit: usd("20000"),
    },
  },
  {
    dstLzChainId: LzChainId.unichainmainnet,
    before: {
      maxDailyLimit: usd("100000"),
      maxSingleTransactionLimit: usd("20000"),
    },
    after: { maxDailyLimit: usd("0"), maxSingleTransactionLimit: usd("0") },
  },
];

const SETTERS: { field: keyof BridgeLimits; signature: string }[] = [
  { field: "maxSingleTransactionLimit", signature: "setMaxSingleTransactionLimit(uint16,uint256)" },
  { field: "maxDailyLimit", signature: "setMaxDailyLimit(uint16,uint256)" },
];

export const getBridgeCommands = (entry: RemoteBridgeEntry) =>
  SETTERS.filter(({ field }) => !entry.before[field].eq(entry.after[field])).map(({ field, signature }) => ({
    target: XVS_BRIDGE_ADMIN,
    signature,
    params: [entry.dstLzChainId, entry.after[field]],
  }));

export const vip999 = () => {
  const meta = {
    version: "v2",
    title: "VIP-999 [BNB Chain] Update XVS bridge send limits on BSC `XVSProxyOFTSrc`",
    description: `#### Summary

Following VIP-615 (Core Pool sunset on opBNB, Unichain and Optimism), this VIP tightens the per-destination XVS bridge **send** limits stored on the BSC \`XVSProxyOFTSrc\` (\`${XVS_PROXY_OFT_SRC}\`).

Limits on this contract are **denominated in USD with 18 decimals** — the bridge converts the transferred XVS amount to USD via the \`ResilientOracle\` and compares it against these caps. *Send* = BSC → destination.

Receive caps (destination → BSC) are intentionally left untouched so existing holders on the deprecated chains can still bridge their XVS back to BSC under the current receive limits.

#### Changes (per destination chain)

| Destination | Daily Send | Single Send |
| --- | --- | --- |
| Ethereum (101) | $1,000,000 → $150,000 | $100,000 → $30,000 |
| opBNB (202) | $50,000 → $0 | $10,000 → $0 |
| Arbitrum (110) | unchanged | unchanged |
| zkSync (165) | $100,000 → $0 | $20,000 → $0 |
| Optimism (111) | $100,000 → $0 | $20,000 → $0 |
| Base (184) | unchanged | unchanged |
| Unichain (320) | $100,000 → $0 | $20,000 → $0 |

Outbound bridging from BSC to the chains being wound down (opBNB, zkSync, Optimism, Unichain) is disabled by zeroing both send caps.

#### Actions

For each changed destination, this VIP calls the corresponding setter on the BSC \`XVSBridgeAdmin\` (\`${XVS_BRIDGE_ADMIN}\`):

- \`setMaxDailyLimit(uint16,uint256)\`
- \`setMaxSingleTransactionLimit(uint16,uint256)\`

Five destinations × two setters = **10 commands**. Arbitrum and Base are unchanged and emit zero commands. No remote-chain bridge admins are touched.

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

  return makeProposal(remoteBridgeEntries.flatMap(getBridgeCommands), meta, ProposalType.REGULAR);
};

export default vip999;
