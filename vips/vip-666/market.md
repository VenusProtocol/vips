Step 1 expansion to **Ethereum / Arbitrum One / Base / zkSync** Core Pool markets. Chain-specific primary DEX with Curve as secondary source on Ethereum (crvUSD, eBTC). Unified **10%** deviation threshold. Isolated / Curve / LSE / Ethena pools out of scope. Pool data: GeckoTerminal API, 2026-04-27.

---

## Proposed Market List

### Ethereum

**Primary DEX:** `uniswap_v3` (secondary: `curve` for crvUSD / eBTC)

#### Eligible — 12 markets

| **#** | **Token**  | **Pool**    | **Pool Address**                             | **TVL** | **24h Vol** | **Source** | **Threshold** |
| ----- | ---------- | ----------- | -------------------------------------------- | ------- | ----------- | ---------- | ------------- |
| 1     | WETH       | WETH/USDC   | `0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640` | $101.5M | $37.4M      | Uniswap V3 | 10%           |
| 2     | ~~crvUSD~~ | crvUSD/USDC | `0x4dece678ceceb27446b35c672dc7d61f30bad69e` | $84.4M  | $13.4M      | Curve      | 10%           |
| 3     | WBTC       | WBTC/USDC   | `0x99ac8ca7087fa4a2a1fb6357269965a2014abc35` | $30.3M  | $2.4M       | Uniswap V3 | 10%           |
| 4     | USDC       | USDC/USDT   | `0x3416cf6c708da44db2624d63ea0aaef7113527c6` | $19.1M  | $4.6M       | Uniswap V3 | 10%           |
| 5     | USDT       | USDT/USDC   | `0x3416cf6c708da44db2624d63ea0aaef7113527c6` | $19.1M  | $4.6M       | Uniswap V3 | 10%           |
| 6     | LBTC       | LBTC/WBTC   | `0x87428a53e14d24ab19c6ca4939b4df93b8996ca9` | $7.0M   | $48K        | Uniswap V3 | 10%           |
| 7     | USDe       | USDe/USDC   | `0xe6d7ebb9f1a9519dc06d557e03c522d53520e76a` | $2.4M   | $1.6M       | Uniswap V3 | 10%           |
| 8     | eBTC       | eBTC/WBTC   | `0x7704d01908afd31bf647d969c295bb45230cd2d6` | $1.59M  | $108K       | Curve      | 10%           |
| 9     | DAI        | DAI/USDC    | `0x5777d92f208679db4b9778590fa3cab3ac9e2168` | $1.1M   | $3.3M       | Uniswap V3 | 10%           |
| 10    | ~~EIGEN~~  | EIGEN/USDC  | `0xd640333b71b015092d9b3afcff3e427036304370` | $1.1M   | $22K        | Uniswap V3 | 10%           |
| 11    | tBTC       | tBTC/WETH   | `0x97944213d2caeea773da1c9b11b0525f25b749cc` | $263K   | $3K         | Uniswap V3 | 10%           |
| 12    | USDS       | USDS/DAI    | `0xe9f1e2ef814f5686c30ce6fb7103d0f780836c67` | $209K   | $298        | Uniswap V3 | 10%           |

#### Thin Pool — Needs Discussion — 2 markets

| **Token**  | **Best Pool** | **Pool Address**                             | **TVL** | **Source** | **Notes**                   |
| ---------- | ------------- | -------------------------------------------- | ------- | ---------- | --------------------------- |
| ~~TUSD~~   | TUSD/USDC     | `0x39529e96c28807655b5856b3d342c6225111770e` | $518    | Uniswap V3 | Token in run-off            |
| ~~weETHs~~ | weETHs/WETH   | `0x174eff1363c4b446f3425315bd6c12f305823d6a` | $0      | Uniswap V3 | Quote-matched but near-zero |

#### Not Eligible — 3 markets

| **Token** | **Reason**                                                                                                                         |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| ~~BAL~~   | Primary liquidity on **Balancer V2** (BAL/WETH 1% @ $5.9M); UniV3 / Curve pools have no usable depth — would need Balancer adapter |
| sUSDe     | ERC4626 vault — no on-chain pool with quote = USDe                                                                                 |
| sUSDS     | ERC4626 vault — no on-chain pool with quote = USDS                                                                                 |

**Ethereum summary:** 12 eligible / 2 thin / 3 not eligible (17 total)

---

### Arbitrum One

**Primary DEX:** `uniswap_v3_arbitrum` (fallback: `camelot-v3`)

#### Eligible — 5 markets

| **#** | **Token** | **Pool**   | **Pool Address**                             | **TVL** | **24h Vol** | **Source** | **Threshold** |
| ----- | --------- | ---------- | -------------------------------------------- | ------- | ----------- | ---------- | ------------- |
| 1     | WETH      | WETH/USDC  | `0xc6962004f452be9203591991d15f6b388e09e8d0` | $55.3M  | $71.1M      | Uniswap V3 | 10%           |
| 2     | WBTC      | WBTC/USDC  | `0x0e4831319a50228b9e450861297ab92dee15b44f` | $8.2M   | $7.3M       | Uniswap V3 | 10%           |
| 3     | USDC      | USDC/USDT  | `0xbe3ad6a5669dc0b8b12febc03608860c31e2eef6` | $2.6M   | $1.3M       | Uniswap V3 | 10%           |
| 4     | USD₮0     | USD₮0/USDC | `0xbe3ad6a5669dc0b8b12febc03608860c31e2eef6` | $2.6M   | $1.3M       | Uniswap V3 | 10%           |
| 5     | ARB       | ARB/USDC   | `0xaebdca1bc8d89177ebe2308d62af5e74885dccc3` | $675K   | $81K        | Uniswap V3 | 10%           |

#### Not Eligible — 2 markets

| **Token**   | **Reason**                                                  |
| ----------- | ----------------------------------------------------------- |
| gmBTC-USDC  | GMX market token (GM) — synthetic, no DEX V3 pool by design |
| gmWETH-USDC | GMX market token (GM) — synthetic, no DEX V3 pool by design |

**Arbitrum One summary:** 5 eligible / 0 thin / 2 not eligible (7 total)

---

### Base

**Primary DEX:** `aerodrome-slipstream` (fallback: `uniswap-v3-base`)

#### Eligible — 4 markets

| **#** | **Token** | **Pool**    | **Pool Address**                             | **TVL** | **24h Vol** | **Source**           | **Threshold** |
| ----- | --------- | ----------- | -------------------------------------------- | ------- | ----------- | -------------------- | ------------- |
| 1     | WETH      | WETH/USDC   | `0x6c561b446416e1a00e8e93e221854d6ea4171372` | $124.4M | $70.1M      | Uniswap V3 Base      | 10%           |
| 2     | USDC      | USDC/WETH   | `0x6c561b446416e1a00e8e93e221854d6ea4171372` | $124.2M | $70.1M      | Uniswap V3 Base      | 10%           |
| 3     | cbBTC     | cbBTC/USDC  | `0x4e962bb3889bf030368f56810a9c96b83cb3e778` | $12.4M  | $111.9M     | Aerodrome Slipstream | 10%           |
| 4     | wstETH    | wstETH/WETH | `0x861a2922be165a5bd41b1e482b49216b465e1b5f` | $1.5M   | $2.9M       | Aerodrome Slipstream | 10%           |

#### Not Eligible — 1 market

| **Token**       | **Reason**                                                     |
| --------------- | -------------------------------------------------------------- |
| ~~wsuperOETHb~~ | No pool with quote = WETH on Aerodrome Slipstream / UniV3 Base |

**Base summary:** 4 eligible / 0 thin / 1 not eligible (5 total)

---

### zkSync

**Primary DEX:** `syncswap-v3-zksync` (fallback: `pancakeswap-v3-zksync`)

⚠️ zkSync DEX liquidity is materially shallower than BSC. Only WETH/USDC passes the $200K threshold. The remaining markets are listed under Thin Pool for review.

#### Eligible — 1 market

| **#** | **Token** | **Pool**  | **Pool Address**                             | **TVL** | **24h Vol** | **Source**  | **Threshold** |
| ----- | --------- | --------- | -------------------------------------------- | ------- | ----------- | ----------- | ------------- |
| 1     | WETH      | WETH/USDC | `0xe955c98e8411ee4c7332ebe48df7f0ca12711dc2` | $491K   | $2K         | SyncSwap V3 | 10%           |

#### Thin Pool — Needs Discussion — 8 markets

| **Token** | **Best Pool** | **Pool Address**                             | **TVL** | **Source**     | **Notes**                   |
| --------- | ------------- | -------------------------------------------- | ------- | -------------- | --------------------------- |
| USDC.e    | USDC.e/USDC   | `0x3aef05a8e7d7a83f5527eded214e0b24a87d0991` | $35K    | PancakeSwap V3 | Thin                        |
| wstETH    | wstETH/WETH   | `0xb249b76c7bda837b8a507a0e12caeda90d25d32f` | $25K    | SyncSwap V3    | Quote-matched but thin      |
| WBTC      | WBTC/WETH     | `0x9cb8b12cb0223e105155318b72addda15d588fb9` | $12K    | PancakeSwap V3 | Thin                        |
| USDC      | USDC/USDT     | `0xd05eef3792276e92bb051029dadfc2bf81121692` | $9K     | PancakeSwap V3 | Thin                        |
| USDT      | USDT/USDC     | `0xd05eef3792276e92bb051029dadfc2bf81121692` | $9K     | PancakeSwap V3 | Thin                        |
| ZK        | ZK/USDC       | `0xfda764f84168ed39b4f3e1c14a59f21a4660d883` | $3K     | PancakeSwap V3 | Thin                        |
| ~~zkETH~~ | zkETH/WETH    | `0xb2d87ed6814f519521172b04b5e6a4f77c50ded3` | $127    | PancakeSwap V3 | Quote-matched but near-zero |
| ~~wUSDM~~ | wUSDM/USDC    | `0xc9d2f9f56904dd71de34f2d696f5afc508f93ac3` | $103    | SyncSwap V3    | Near-zero                   |

**zkSync summary:** 1 eligible / 8 thin / 0 not eligible (9 total)

---

## Aggregate Summary

| **Chain**    | **Source(s)**                     | **Eligible** | **Thin** | **Not Eligible** | **Total** |
| ------------ | --------------------------------- | ------------ | -------- | ---------------- | --------- |
| Ethereum     | Uniswap V3 + Curve                | 12           | 2        | 3                | 17        |
| Arbitrum One | Uniswap V3 + Camelot V3           | 5            | 0        | 2                | 7         |
| Base         | Aerodrome Slipstream + UniV3 Base | 4            | 0        | 1                | 5         |
| zkSync       | SyncSwap V3 + PancakeSwap V3      | 1            | 8        | 0                | 9         |
| **Total**    | —                                 | **22**       | **10**   | **6**            | **38**    |
