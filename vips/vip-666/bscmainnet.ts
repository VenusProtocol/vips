import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { DEVIATION_SENTINEL, DEVIATION_THRESHOLD, MARKETS, PANCAKESWAP_ORACLE, SENTINEL_ORACLE } from "./config";

export const vip666 = () => {
  const meta = {
    version: "v2",
    title: "VIP-666 [BNB Chain] Expand DeviationSentinel coverage to 29 Core Pool markets",
    description: `## Summary

This VIP expands **DeviationSentinel** oracle-deviation monitoring on BNB Chain mainnet from a single market (CAKE) to **29 Core Pool markets**, applying a unified **10%** deviation threshold and routing every market through the existing **PancakeSwapOracle** configured in [VIP-590](https://app.venus.io/governance/proposal/590) and re-wired through EBrakeV2 in [VIP-610](https://app.venus.io/governance/proposal/610).

## What This VIP Does

For each of the 29 markets the VIP performs three configuration calls:

1. **PancakeSwapOracle.setPoolConfig(token, pool)** — bind the underlying token to its PancakeSwap V3 pool.
2. **SentinelOracle.setTokenOracleConfig(token, PancakeSwapOracle)** — route SentinelOracle price queries for the token to PancakeSwapOracle.
3. **DeviationSentinel.setTokenConfig(token, (10, true))** — set a 10% deviation threshold and enable monitoring.

All three permissions were granted to the Normal Timelock in VIP-590; no additional permission changes are required.

### 29-Market Configuration

| Market  | Pool          | Fee   | Pool Address                                   |
| ------- | ------------- | ----- | ---------------------------------------------- |
| USDC    | USDT / USDC   | 0.01% | \`0x92b7807bf19b7dddf89b706143896d05228f3121\` |
| U       | U / USDT      | 0.01% | \`0xa0909f81785f87f3e79309f0e73a7d82208094e4\` |
| WBNB    | USDT / WBNB   | 0.01% | \`0x172fcd41e0913e95784454622d1c3724f546f849\` |
| USDT    | USDT / WBNB   | 0.01% | \`0x172fcd41e0913e95784454622d1c3724f546f849\` |
| BTCB    | BTCB / WBNB   | 0.05% | \`0x6bbc40579ad1bbd243895ca0acb086bb6300d636\` |
| ETH     | ETH / WBNB    | 0.05% | \`0xd0e226f674bbf064f54ab47f42473ff80db98cba\` |
| CAKE    | CAKE / WBNB   | 0.25% | \`0x133b3d95bad5405d14d53473671200e9342896bf\` |
| solvBTC | solvBTC / BTCB | 0.05% | \`0x12197d7a4fe2d67f9f97ae64d82a44c24b7ad407\` |
| USD1    | USD1 / USDT   | 0.01% | \`0x9c4ee895e4f6ce07ada631c508d1306db7502cce\` |
| slisBNB | slisBNB / WBNB | 0.05% | \`0x9474e972f49605315763c296b122cbb998b615cf\` |
| wBETH   | wBETH / ETH   | 0.05% | \`0x379044e32f5a162233e82de19da852255d0951b8\` |
| XRP     | XRP / USDT    | 0.25% | \`0x71f5a8f7d448e59b1ede00a19fe59e05d125e742\` |
| SOL     | SOL / WBNB    | 0.05% | \`0xbffec96e8f3b5058b1817c14e4380758fada01ef\` |
| TUSD    | TUSD / USDT   | 0.01% | \`0xd881d9d0e0767719701305c614903f555d589586\` |
| LINK    | LINK / WBNB   | 0.25% | \`0x0e1893beeb4d0913d26b9614b18aea29c56d94b9\` |
| DOGE    | DOGE / WBNB   | 0.25% | \`0xce6160bb594fc055c943f59de92cee30b8c6b32c\` |
| TWT     | TWT / WBNB    | 0.25% | \`0x8ccb4544b3030dacf3d4d71c658f04e8688e25b1\` |
| XAUM    | XAUM / USDT   | 0.05% | \`0x497e224d7008fe47349035ddd98bedb773e1f4c5\` |
| ADA     | ADA / USDT    | 0.25% | \`0x29c5ba7dbb67a4af999a28cc380ad234fe7c1b86\` |
| lisUSD  | lisUSD / USDT | 0.05% | \`0x12e79eb21dcc5852f9c6ac1736d977312925da33\` |
| LTC     | LTC / WBNB    | 0.25% | \`0xe3cbe4dd1bd2f7101f17d586f44bab944091d383\` |
| TRX     | TRX / WBNB    | 0.25% | \`0xf683113764e4499c473acd38fc4b37e71554e4ad\` |
| FDUSD   | FDUSD / USDT  | 0.01% | \`0xbf72b6485e4b31601afe7b0a1210be2004d2b1d6\` |
| UNI     | UNI / WBNB    | 0.25% | \`0x647d99772863e09f47435782cbb6c96ec4a75f12\` |
| DAI     | DAI / USDT    | 0.01% | \`0xe043558b77e2b4c262d7d6e579b005ceb7f4591c\` |
| XVS     | XVS / WBNB    | 0.25% | \`0x77d5b2560e4b84b3fc58875cb0133f39560e8ae3\` |
| DOT     | DOT / WBNB    | 0.25% | \`0x62f0546cbcd684f7c394d8549119e072527c41bc\` |
| FIL     | FIL / WBNB    | 0.05% | \`0x16d7c51e9c59be9f18b19b608d53b37fa9890b8a\` |
| BCH     | BCH / WBNB    | 0.25% | \`0x14cfad9a4fcb5fb4f702f5d0e90dcc633e1ded9a\` |

### Notes

- **CAKE re-configuration**: VIP-590 bound CAKE to the CAKE/BUSD pool at a 20% threshold. This VIP repoints CAKE to \`0x133b3d95bad5405d14d53473671200e9342896bf\` (CAKE/WBNB 0.25%) and tightens the threshold to 10%.
- **Shared pool — USDT and WBNB**: both markets bind to the same USDT/WBNB pool \`0x172fcd41e0913e95784454622d1c3724f546f849\`. \`PancakeSwapOracle.tokenPools\` is keyed by the underlying token, so each market gets an independent entry and its own circuit breaker.
- **Pegged-asset matching**: solvBTC/BTCB, wBETH/ETH and slisBNB/WBNB pools are chosen so the DEX quote asset matches the ResilientOracle reference token, isolating the peg ratio from base-asset price noise.

#### References

- [VIP Pull Request](https://github.com/VenusProtocol/vips/pull/698)
- [VIP-590 — Initial DeviationSentinel deployment](https://app.venus.io/governance/proposal/590)
- [VIP-610 — EBrakeV2 wiring](https://app.venus.io/governance/proposal/610)
- [DeviationSentinel](https://bscscan.com/address/${DEVIATION_SENTINEL})
- [SentinelOracle](https://bscscan.com/address/${SENTINEL_ORACLE})
- [PancakeSwapOracle](https://bscscan.com/address/${PANCAKESWAP_ORACLE})`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      // 1. Bind each token to its PancakeSwap V3 pool on PancakeSwapOracle
      ...MARKETS.map(({ token, pool }) => ({
        target: PANCAKESWAP_ORACLE,
        signature: "setPoolConfig(address,address)",
        params: [token, pool],
      })),

      // 2. Route SentinelOracle queries for each token to PancakeSwapOracle
      //    (idempotent for CAKE — already wired in VIP-590)
      ...MARKETS.map(({ token }) => ({
        target: SENTINEL_ORACLE,
        signature: "setTokenOracleConfig(address,address)",
        params: [token, PANCAKESWAP_ORACLE],
      })),

      // 3. Set unified 10% deviation threshold and enable monitoring on DeviationSentinel
      //    (overwrites CAKE's prior 20% configuration from VIP-590)
      ...MARKETS.map(({ token }) => ({
        target: DEVIATION_SENTINEL,
        signature: "setTokenConfig(address,(uint8,bool))",
        params: [token, [DEVIATION_THRESHOLD, true]],
      })),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip666;
