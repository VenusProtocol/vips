import { constants } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

// ================================================================================
// =====  Newly deployed APRO oracle, for BStocks: APRO added as PIVOT =====
// ================================================================================
export const APRO_ORACLE = "0x04480f1Ba2252CDF89deB022B58d0a03d1B4cF91";
export const APRO_MAX_STALE_PERIOD = 3900;

export const ORACLE_GUARDIAN = "0x3a3284dC0FaFfb0b5F0d074c4C704D14326C98cF";

export const BOUND_VALIDATOR = "0x6E332fF0bB52475304494E4AE5063c1051c7d735";

export const FIVE_PCT_UPPER_BOUND = parseUnits("1.05", 18);
export const FIVE_PCT_LOWER_BOUND = parseUnits("0.95", 18);

export const TWO_PCT_UPPER_BOUND = parseUnits("1.02", 18);
export const TWO_PCT_LOWER_BOUND = parseUnits("0.98", 18);

export interface AproAsset {
  symbol: string;
  asset: string;
  feed: string;
  // The feed's own AccessControlledOffchainAggregator access controller
  accessController: string;
}

export const APRO_ASSETS: AproAsset[] = [
  {
    symbol: "SKHYB",
    asset: "0xCA750eF65f295BBECd685Abf54e82CAf297BDB61",
    feed: "0x2446DCeDd294EDB5d90Ee16Fa32Da56Bc2973ACd",
    accessController: "0x0Ae22Ed18D388BCC5247ED46bDB03010A2A9cb7E",
  },
  {
    symbol: "NVDAB",
    asset: "0x02Fca66C1D1aFB4E2A7884261eB00F63598a7436",
    feed: "0x310EFC9Fefe89B8085F89E91Ac782Bef6416499E",
    accessController: "0x8120CeCd66A758F547675897139a124D00b1cb70",
  },
  {
    symbol: "SPCXB",
    asset: "0xbe9D156892E55e7154BcD3cB0FEA677F9D3103E1",
    feed: "0x44c4173459121690613Bc22C110c4f0624254f3E",
    accessController: "0x7b03c0cf65Fb840cB55131EdDCF43b2a1BB83D5A",
  },
  {
    symbol: "TSLAB",
    asset: "0x5b1910eAaD6450E50f816082Aa078C41F10C292f",
    feed: "0xe1bc21701Bc8FFa39DaecDb8f58263C1d5e1c0bc",
    accessController: "0x5E714018c12304e2c02D028F6DCdfF395221c89D",
  },
];

export const ATLAS_ORACLE = "0x9E6928Ec418948ceb9f1cd9872fD312b13D841D0"; // also the new PIVOT for asBNB and slisBNB below

// ================================================================================
// ===== asBNB: PIVOT switched from Binance to Atlas =====
// ================================================================================
export const AS_BNB = "0x77734e70b6E88b4d82fE632a168EDf6e700912b6";
export const AS_BNB_MAIN_ORACLE = "0x652B90D1d45a7cD5BE82c5Fb61a4A00bA126dde5"; // unchanged MAIN adapter
export const AS_BNB_BINANCE_ORACLE = "0x594810b741d136f1960141C0d8Fb4a91bE78A820"; // demoted PIVOT -> unset
export const AS_BNB_ATLAS_FEED = "0x91c3c652e7f909902259b4eb37393f5887c64b3a";
export const AS_BNB_ATLAS_MAX_STALE_PERIOD = 86700;

// ================================================================================
// ===== slisBNB: new Atlas PIVOT + new ±5% bound =====
// ================================================================================
export const SLIS_BNB = "0xB0b84D294e0C75A6abe60171b70edEb2EFd14A1B";
export const SLIS_BNB_MAIN_ORACLE = "0xDDE6446E66c786afF4cd3D183a908bCDa57DF9c1"; // SlisBNBOracle (Lista StakeManager convertSnBnbToBnb rate x BNB/USD), unchanged
export const SLIS_BNB_ATLAS_FEED = "0x7b9f35937a0047696a51afbc5abefefb5b64b9d2"; // Atlas added as new PIVOT
export const SLIS_BNB_ATLAS_MAX_STALE_PERIOD = 1200;

// ================================================================================
// ===== SolvBTC: MAIN feed swapped to Exchange Rate, dead FALLBACK dropped, bound tightened to ±2% =====
// ================================================================================
export const SOLV_BTC = "0x4aae823a6a0b376De6A78e74eCC5b079d38cBCf7";
export const SOLV_BTC_MAIN_ORACLE = "0x3f4bC081E749032cffF29dcA2E8408Ec375e745A"; // OneJumpOracle, unchanged; INTERMEDIATE_ORACLE = shared ChainlinkOracle
export const SOLV_BTC_PIVOT_ORACLE = "0x1f785B1AFE0808d69d1188db9e47b7B9Dd95ab09"; // unchanged (OneJumpOracle)
export const SOLV_BTC_FALLBACK_ORACLE = "0xA3E6F08e3C1baD83e1971909483F27Cdd19937FC"; // dead RedStone feed, dropped
export const SOLV_BTC_NEW_ER_FEED = "0xC2453C637BbBC53Ca6aBd1F139D1352CCeb55eB1"; // Chainlink SOLVBTC/BTC Exchange Rate
export const SOLV_BTC_ER_MAX_STALE_PERIOD = 86700;

// ================================================================================
// ===== xSolvBTC: new OneJumpOracle promoted to MAIN, old wrapper demoted to PIVOT, new ±2% bound =====
// ================================================================================
export const X_SOLV_BTC = "0x1346b618dC92810EC74163e4c27004c921D446a5";
export const X_SOLV_BTC_ONE_JUMP_ORACLE = "0xDfDbF9DAFbc94Cb1F827d3364637dDBB26823739"; // ChainlinkOracle is the INTERMEDIATE_ORACLE
export const X_SOLV_BTC_OLD_MAIN_ORACLE = "0xf5534f78Df9b610B19A63956d498d00CFaD8B9D3"; // OneJumpOracle, demoted MAIN -> PIVOT; INTERMEDIATE_ORACLE = RedstoneOracle (SolvBTC.BBN_FUNDAMENTAL)
export const X_SOLV_BTC_SVR_FEED = "0x71cdD4BD7C42C752325cC7208deC1b3B418F1706";
export const X_SOLV_BTC_SVR_MAX_STALE_PERIOD = 86700;

export const vip654 = () => {
  const meta = {
    version: "v2",
    title: "VIP-654 [BNB Chain] Oracle updates: APRO PIVOT for BStocks, asBNB/slisBNB/SolvBTC/xSolvBTC",
    description: `#### Summary

Oracle configuration updates across 8 BNB Chain Core Pool markets, per the Venus Oracle Mastersheet:

1. **BStocks (SKHYB, NVDAB, SPCXB, TSLAB)** — add the newly deployed APRO oracle as PIVOT (Atlas stays
   MAIN), with a ±5% BoundValidator band.
2. **asBNB** — switch PIVOT from Binance to Atlas (MAIN unchanged).
3. **slisBNB** — add Atlas as PIVOT (MAIN unchanged) with a new ±5% BoundValidator band.
4. **SolvBTC** — switch the MAIN feed source from a market-price feed to an Exchange Rate feed, drop
   the dead RedStone FALLBACK, tighten the BoundValidator band to ±2%.
5. **xSolvBTC** — promote a new OneJumpOracle (reading a Chainlink SVR exchange-rate feed) to MAIN,
   demote the current RedStone-fundamental wrapper to PIVOT, add a new ±2% BoundValidator band.

Alongside these, the [Oracle Guardian](https://bscscan.com/address/0x3a3284dC0FaFfb0b5F0d074c4C704D14326C98cF)
is granted setDirectPrice(address,uint256) on the new APRO oracle and on the existing
[Atlas oracle](https://bscscan.com/address/0x9E6928Ec418948ceb9f1cd9872fD312b13D841D0) — see
"Oracle Guardian permissions" below.

#### Details — BStocks (BNB Chain)

The four tokenized-stock (BStocks) assets — SK Hynix (SKHYB), NVIDIA (NVDAB), SpaceX (SPCXB) and
Tesla (TSLAB) — currently price from a single source: the Atlas Oracle configured as MAIN with no PIVOT
and no FALLBACK. This VIP adds a second, independent price source — the newly deployed APRO oracle — as
the PIVOT for each of these markets, and configures the BoundValidator anchor band so the MAIN price is
sanity-checked against the PIVOT.

The APRO oracle is a ChainlinkOracle instance reading the APRO price feeds for each asset. Atlas remains
the MAIN source; APRO becomes the loose sanity checker (PIVOT). With a PIVOT enabled and no FALLBACK, the
ResilientOracle requires the MAIN price to fall within the BoundValidator band around the PIVOT price,
otherwise pricing reverts — strengthening the oracle setup for these markets.

1. **Accept ownership of the APRO oracle.** The oracle was deployed with the Normal Timelock as
   pendingOwner; this call completes the two-step transfer so governance owns it.
2. **Grant permissions on the APRO oracle** via the Access Control Manager (per-contract permissions
   for the newly deployed oracle): the Normal Timelock gets setTokenConfig(TokenConfig) and
   setDirectPrice(address,uint256); the [Oracle Guardian](https://bscscan.com/address/0x3a3284dC0FaFfb0b5F0d074c4C704D14326C98cF)
   additionally gets setDirectPrice(address,uint256) so it can also manually pin an emergency price
   without waiting on a timelock delay.
3. **Configure the APRO feeds** on the APRO oracle for the four assets (feed address + a 3900s max stale
   period).
4. **Insert APRO as PIVOT** in the ResilientOracle for the four assets: oracles become
   [Atlas (MAIN), APRO (PIVOT), 0 (no FALLBACK)] with enable flags [true, true, false]. Atlas is
   unchanged as MAIN.
5. **Set the BoundValidator anchor band** for the four assets to ±5% (upper 1.05, lower 0.95). APRO's
   1% deviation threshold and ~1h heartbeat mean two independent feeds can legitimately sit ~2% apart
   from routine vendor lag alone, before adding heartbeat lag across a closed or thin equity session —
   a ±2% bound would pause these markets on ordinary operation rather than on a real oracle failure.

#### Details — asBNB (BNB Chain)

Switch the PIVOT from the Binance-fed adapter to Atlas (ATL:asBNB/USD, ms=86,700s). MAIN and
BoundValidator (±5%) are unchanged.

#### Details — slisBNB (BNB Chain)

Add Atlas as PIVOT (ATL:slisBNB/USD, ms=1,200s); slisBNB currently has no PIVOT/FALLBACK. MAIN is
unchanged. Set a new ±5% BoundValidator band — slisBNB has no anchor config today.

#### Details — SolvBTC (BNB Chain)

Switch the MAIN oracle's underlying feed from the Chainlink solvBTC/BTC market-price feed to the
Chainlink SOLVBTC/BTC Exchange Rate feed (ms=86,700s) — the MAIN OneJumpOracle wrapper address in
the ResilientOracle is unchanged, only the feed it reads (configured on the shared ChainlinkOracle,
keyed by SolvBTC) changes. PIVOT is unchanged. Drop the FALLBACK slot — the RedStone
SolvBTC/BTC market price feed backing it is dead. Tighten the BoundValidator band from ±5% to ±2%.

#### Details — xSolvBTC (BNB Chain)

Promote a new OneJumpOracle to MAIN: it reads a Chainlink SVR xSolvBTC/SolvBTC Exchange Rate feed
(ms=86,700s, configured on the shared ChainlinkOracle keyed by xSolvBTC) and combines it with SolvBTC's
own ResilientOracle price. The current MAIN — a RedStone SolvBTC.BBN_FUNDAMENTAL exchange-rate
wrapper — is demoted to PIVOT, unchanged otherwise. Set a new ±2% BoundValidator band — xSolvBTC has no
anchor config today.

#### Oracle Guardian permissions

The [Oracle Guardian](https://bscscan.com/address/0x3a3284dC0FaFfb0b5F0d074c4C704D14326C98cF) already holds
setDirectPrice(address,uint256) on the [Chainlink](https://bscscan.com/address/0x1B2103441A0A108daD8848D8F5d790e4D402921F)
and [RedStone](https://bscscan.com/address/0x8455EFA4D7Ff63b8BFD96AdD889483Ea7d39B70a) oracles, granted in
VIP-403, so it can pin an emergency price without waiting on a timelock delay. It does not hold that
permission on the Atlas oracle, which since VIP-628 is the MAIN source for six of the eight markets in
this VIP (the four BStocks, asBNB and slisBNB). This proposal grants it on both the new APRO oracle and
Atlas.

This matters for the markets changed here: once a PIVOT is enabled with no FALLBACK, a bad or stale MAIN
price makes ResilientOracle.getPrice revert and the market unpriceable. Holding setDirectPrice on the
PIVOT oracle alone only lets the Guardian move the sanity checker; the lever that corrects a faulty MAIN
is on Atlas. Note this permission extends to every asset priced by Atlas, not only the ones in this VIP.
setTokenConfig is deliberately not granted — feed configuration stays with governance.

#### Voting options

- **For** — Execute this proposal
- **Against** — Do not execute this proposal
- **Abstain** — Indifferent to execution`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // 1. BStocks: accept ownership + ACM permissions for the newly deployed APRO oracle
      { target: APRO_ORACLE, signature: "acceptOwnership()", params: [] },
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [APRO_ORACLE, "setTokenConfig(TokenConfig)", bscmainnet.NORMAL_TIMELOCK],
      },
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [APRO_ORACLE, "setDirectPrice(address,uint256)", bscmainnet.NORMAL_TIMELOCK],
      },
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [APRO_ORACLE, "setDirectPrice(address,uint256)", ORACLE_GUARDIAN],
      },
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ATLAS_ORACLE, "setDirectPrice(address,uint256)", ORACLE_GUARDIAN],
      },

      // 2. BStocks: configure the APRO feeds on the APRO oracle
      {
        target: APRO_ORACLE,
        signature: "setTokenConfigs((address,address,uint256)[])",
        params: [APRO_ASSETS.map(({ asset, feed }) => [asset, feed, APRO_MAX_STALE_PERIOD])],
      },

      // 3. asBNB/slisBNB: configure the new Atlas feeds
      {
        target: ATLAS_ORACLE,
        signature: "setTokenConfigs((address,address,uint256)[])",
        params: [
          [
            [AS_BNB, AS_BNB_ATLAS_FEED, AS_BNB_ATLAS_MAX_STALE_PERIOD],
            [SLIS_BNB, SLIS_BNB_ATLAS_FEED, SLIS_BNB_ATLAS_MAX_STALE_PERIOD],
          ],
        ],
      },

      // 4. SolvBTC/xSolvBTC: configure the feeds on the shared ChainlinkOracle
      {
        target: bscmainnet.CHAINLINK_ORACLE,
        signature: "setTokenConfigs((address,address,uint256)[])",
        params: [
          [
            [SOLV_BTC, SOLV_BTC_NEW_ER_FEED, SOLV_BTC_ER_MAX_STALE_PERIOD],
            [X_SOLV_BTC, X_SOLV_BTC_SVR_FEED, X_SOLV_BTC_SVR_MAX_STALE_PERIOD],
          ],
        ],
      },

      // 5a. BStocks: insert APRO as PIVOT in the ResilientOracle
      {
        target: bscmainnet.RESILIENT_ORACLE,
        signature: "setTokenConfigs((address,address[3],bool[3],bool)[])",
        params: [
          APRO_ASSETS.map(({ asset }) => [
            asset,
            [ATLAS_ORACLE, APRO_ORACLE, constants.AddressZero],
            [true, true, false],
            false,
          ]),
        ],
      },

      // 5b. asBNB/slisBNB: ResilientOracle PIVOT switched to Atlas
      {
        target: bscmainnet.RESILIENT_ORACLE,
        signature: "setTokenConfigs((address,address[3],bool[3],bool)[])",
        params: [
          [
            // asBNB: PIVOT switched from Binance to Atlas
            [AS_BNB, [AS_BNB_MAIN_ORACLE, ATLAS_ORACLE, constants.AddressZero], [true, true, false], false],
            // slisBNB: new Atlas PIVOT + new ±5% bound
            [SLIS_BNB, [SLIS_BNB_MAIN_ORACLE, ATLAS_ORACLE, constants.AddressZero], [true, true, false], false],
          ],
        ],
      },

      // 5c. SolvBTC/xSolvBTC: ResilientOracle MAIN/PIVOT/FALLBACK updates
      {
        target: bscmainnet.RESILIENT_ORACLE,
        signature: "setTokenConfigs((address,address[3],bool[3],bool)[])",
        params: [
          [
            // SolvBTC: MAIN feed swapped to Exchange Rate, dead FALLBACK dropped, bound tightened to ±2%
            [
              SOLV_BTC,
              [SOLV_BTC_MAIN_ORACLE, SOLV_BTC_PIVOT_ORACLE, constants.AddressZero],
              [true, true, false],
              false,
            ],
            // xSolvBTC: new OneJumpOracle promoted to MAIN, old wrapper demoted to PIVOT, new ±2% bound
            [
              X_SOLV_BTC,
              [X_SOLV_BTC_ONE_JUMP_ORACLE, X_SOLV_BTC_OLD_MAIN_ORACLE, constants.AddressZero],
              [true, true, false],
              false,
            ],
          ],
        ],
      },

      // 6a. BStocks: BoundValidator anchor bands at ±5%
      {
        target: BOUND_VALIDATOR,
        signature: "setValidateConfigs((address,uint256,uint256)[])",
        params: [APRO_ASSETS.map(({ asset }) => [asset, FIVE_PCT_UPPER_BOUND, FIVE_PCT_LOWER_BOUND])],
      },

      // 6b. slisBNB/SolvBTC/xSolvBTC: BoundValidator anchor bands
      {
        target: BOUND_VALIDATOR,
        signature: "setValidateConfigs((address,uint256,uint256)[])",
        params: [
          [
            [SLIS_BNB, FIVE_PCT_UPPER_BOUND, FIVE_PCT_LOWER_BOUND],
            [SOLV_BTC, TWO_PCT_UPPER_BOUND, TWO_PCT_LOWER_BOUND],
            [X_SOLV_BTC, TWO_PCT_UPPER_BOUND, TWO_PCT_LOWER_BOUND],
          ],
        ],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip654;
