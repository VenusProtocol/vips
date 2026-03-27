import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

// ===== Token addresses =====
export const sUSDe = "0x211Cc4DD073734dA055fbF44a2b4667d5E5fE5d2";
export const slisBNB = "0xB0b84D294e0C75A6abe60171b70edEb2EFd14A1B";

// sUSDe Oracle addresses
export const SUSDE_ONEJUMP_REDSTONE_ORACLE = "0x2B2895104f958E1EC042E6Ba5cbfeCbAD3C5beDb";
export const SUSDE_ONEJUMP_CHAINLINK_ORACLE = "0xA67F01322AF8EBa444D788Ee398775b446de51a0";

// ===== USDT ChainlinkOracle (used by USDe Main) =====
export const USDT_CHAINLINK_ORACLE = "0x22Dc2BAEa32E95AB07C2F5B8F63336CbF61aB6b8";

// ===== CAPO Oracle addresses =====
export const asBNB_ORACLE = "0x652B90D1d45a7cD5BE82c5Fb61a4A00bA126dde5";
export const slisBNB_ORACLE = "0xDDE6446E66c786afF4cd3D183a908bCDa57DF9c1";

// ===== CAPO Growth Rates =====
export const DAYS_30 = 30 * 24 * 60 * 60;
export const asBNB_NEW_GROWTH_RATE = parseUnits("0.05", 18); // 5% per year
export const slisBNB_NEW_GROWTH_RATE = parseUnits("0.05", 18); // 5% per year

// ===== Token Addresses for Oracle Configuration =====
export const TOKENS = {
  FDUSD: "0xc5f0f7b66764F6ec8C8Dff7BA683102295E16409",
  USDC: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
  DAI: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",
  TUSD: "0x40af3827F39D0EAcBF4A168f8D4ee67c121D11c9",
  DOT: "0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402",
  USDT: "0x55d398326f99059fF775485246999027B3197955",
  USD1: "0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d",
  XVS: "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63",
  USDe: "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34",
  XRP: "0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE",
  BCH: "0x8fF795a6F4D97E7887C79beA79aba5cc76444aDf",
  TRX: "0xCE7de646e7208a4Ef112cb6ed5038FA6cC6b12e3",
  BNB: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
  WBNB: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
  FIL: "0x0D8Ce2A99Bb6e3B7Db580eD848240e4a0F9aE153",
  CAKE: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
  ADA: "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47",
  LTC: "0x4338665CBB7B2485A8855A139b75D5e34AB0DB94",
  LINK: "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD",
  AAVE: "0xfb6115445Bff7b52FeB98650C87f44907E58f802",
  DOGE: "0xbA2aE424d960c26247Dd6c32edC70B295c744C43",
  TWT: "0x4B0F1812e5Df2A09796481Ff14017e6005508003",
  UNI: "0xBf5140A22578168FD562DCcF235E5D43A02ce9B1",
  SolvBTC: "0x4aae823a6a0b376De6A78e74eCC5b079d38cBCf7",
  SOL: "0x570A5D26f7765Ecb712C0924E4De545B89fD43dF",
  ETH: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
  THE: "0xF4C8E32EaDEC4BFe97E0F595AdD0f4450a863a11",
  lisUSD: "0x0782b6d8c4551B9760e74c0545a9bCD90bdc41E5",
  XAUm: "0x23AE4fd8E7844cdBc97775496eBd0E8248656028",
  BTCB: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
  asBNB: "0x77734e70b6E88b4d82fE632a168EDf6e700912b6",
  U: "0xcE24439F2D9C6a2289F741120FE202248B666666",
};

export const USDT_CHAINLINK_ORACLE_CONFIG = {
  USDe: {
    asset: TOKENS.USDe,
    feed: "0xB97Ad0E74fa7d920791E90258A6E2085088b4320",
    oldMaxStalePeriod: 86400,
    newMaxStalePeriod: 1200,
  },
};

export const SUSDE_ORACLE_CONFIG = {
  old: {
    oracles: [SUSDE_ONEJUMP_REDSTONE_ORACLE, SUSDE_ONEJUMP_CHAINLINK_ORACLE, SUSDE_ONEJUMP_CHAINLINK_ORACLE],
    enableFlagsForOracles: [true, true, true],
    cachingEnabled: false,
  },
  new: {
    oracles: [SUSDE_ONEJUMP_REDSTONE_ORACLE, SUSDE_ONEJUMP_CHAINLINK_ORACLE, ethers.constants.AddressZero],
    enableFlagsForOracles: [true, true, false],
    cachingEnabled: false,
  },
};

export const CAPO_GROWTH_RATE_CONFIGS = {
  asBNB: {
    growthRatePerYear: {
      old: parseUnits("0.3049", 18),
      new: asBNB_NEW_GROWTH_RATE,
    },
    snapshotInterval: {
      old: DAYS_30,
      new: DAYS_30,
    },
  },
  slisBNB: {
    growthRatePerYear: {
      old: parseUnits("0.0412", 18),
      new: slisBNB_NEW_GROWTH_RATE,
    },
    snapshotInterval: {
      old: DAYS_30,
      new: DAYS_30,
    },
  },
};

// ===== ChainlinkOracle configurations (asset, feed, maxStalePeriod) =====
export const CHAINLINK_ORACLE_CONFIGS = {
  FDUSD: {
    asset: TOKENS.FDUSD,
    feed: "0x390180e80058A8499930F0c13963AD3E0d86Bfc9",
    oldMaxStalePeriod: 88200,
    newMaxStalePeriod: 86700,
  },
  USDC: {
    asset: TOKENS.USDC,
    feed: "0x51597f405303C4377E36123cBc172b13269EA163",
    oldMaxStalePeriod: 86400,
    newMaxStalePeriod: 1200,
  },
  DAI: {
    asset: TOKENS.DAI,
    feed: "0x132d3C0B1D2cEa0BC552588063bdBb210FDeecfA",
    oldMaxStalePeriod: 86400,
    newMaxStalePeriod: 1200,
  },
  TUSD: {
    asset: TOKENS.TUSD,
    feed: "0xa3334A9762090E827413A7495AfeCE76F41dFc06",
    oldMaxStalePeriod: 86400,
    newMaxStalePeriod: 1200,
  },
  DOT: {
    asset: TOKENS.DOT,
    feed: "0xC333eb0086309a16aa7c8308DfD32c8BBA0a2592",
    oldMaxStalePeriod: 86400,
    newMaxStalePeriod: 900,
  },
  USDT: {
    asset: TOKENS.USDT,
    feed: "0xb631F3Cb6B3a5EebF72C97e30c377de061C6a87c",
    oldMaxStalePeriod: 1800,
    newMaxStalePeriod: 1200,
  },
  USD1: {
    asset: TOKENS.USD1,
    feed: "0xaD8b4e59A7f25B68945fAf0f3a3EAF027832FFB0",
    oldMaxStalePeriod: 93600,
    newMaxStalePeriod: 86700,
  },
  XVS: {
    asset: TOKENS.XVS,
    feed: "0x04C584Ce3EF042f32818ecFEEDC625A353a0960A",
    oldMaxStalePeriod: 1800,
    newMaxStalePeriod: 1200,
  },
  USDe: {
    asset: TOKENS.USDe,
    feed: "0x10402B01cD2E6A9ed6DBe683CbC68f78Ff02f8FC",
    oldMaxStalePeriod: 93600,
    newMaxStalePeriod: 86700,
  },
  XRP: {
    asset: TOKENS.XRP,
    feed: "0x93A67D414896A280bF8FFB3b389fE3686E014fda",
    oldMaxStalePeriod: 86400,
    newMaxStalePeriod: 900,
  },
  BCH: {
    asset: TOKENS.BCH,
    feed: "0x43d80f616DAf0b0B42a928EeD32147dC59027D41",
    oldMaxStalePeriod: 86400,
    newMaxStalePeriod: 1200,
  },
  TRX: {
    asset: TOKENS.TRX,
    feed: "0xF4C5e535756D11994fCBB12Ba8adD0192D9b88be",
    oldMaxStalePeriod: 86400,
    newMaxStalePeriod: 900,
  },
  BNB: {
    asset: TOKENS.BNB,
    feed: "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE",
    oldMaxStalePeriod: 100,
    newMaxStalePeriod: 60,
  },
  WBNB: {
    asset: TOKENS.WBNB,
    feed: "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE",
    oldMaxStalePeriod: 300,
    newMaxStalePeriod: 60,
  },
  FIL: {
    asset: TOKENS.FIL,
    feed: "0xE5dbFD9003bFf9dF5feB2f4F445Ca00fb121fb83",
    oldMaxStalePeriod: 86400,
    newMaxStalePeriod: 1200,
  },
  CAKE: {
    asset: TOKENS.CAKE,
    feed: "0xB6064eD41d4f67e353768aA239cA86f4F73665a1",
    oldMaxStalePeriod: 86400,
    newMaxStalePeriod: 120,
  },
  ADA: {
    asset: TOKENS.ADA,
    feed: "0xa767f745331D267c7751297D982b050c93985627",
    oldMaxStalePeriod: 86400,
    newMaxStalePeriod: 900,
  },
  LTC: {
    asset: TOKENS.LTC,
    feed: "0x74E72F37A8c415c8f1a98Ed42E78Ff997435791D",
    oldMaxStalePeriod: 86400,
    newMaxStalePeriod: 1200,
  },
  LINK: {
    asset: TOKENS.LINK,
    feed: "0xca236E327F629f9Fc2c30A4E95775EbF0B89fac8",
    oldMaxStalePeriod: 86400,
    newMaxStalePeriod: 900,
  },
  AAVE: {
    asset: TOKENS.AAVE,
    feed: "0x1Fa0D75D5b90d230da2A610F2B1B2Eaf9a44Dd5f",
    oldMaxStalePeriod: 1200,
    newMaxStalePeriod: 900,
  },
  UNI: {
    asset: TOKENS.UNI,
    feed: "0x97E87D0c607Ca16E90073D723FEAd83d3882F4b7",
    oldMaxStalePeriod: 1200,
    newMaxStalePeriod: 900,
  },
  XAUm: {
    asset: TOKENS.XAUm,
    feed: "0xfa54C1c5F62ea3a5653a0b1b7148E26008eA1501",
    oldMaxStalePeriod: 93600,
    newMaxStalePeriod: 86700,
  },
  U: {
    asset: TOKENS.U,
    feed: "0xaD8b4e59A7f25B68945fAf0f3a3EAF027832FFB0",
    oldMaxStalePeriod: 93600,
    newMaxStalePeriod: 86700,
  },
};

// ===== RedStoneOracle configurations (asset, feed, maxStalePeriod) =====
export const REDSTONE_ORACLE_CONFIGS = {
  FDUSD: {
    asset: TOKENS.FDUSD,
    feed: "0x98DC6E90D4c2f212ed9d124aD2aFBa4833268633",
    oldMaxStalePeriod: 25200,
    newMaxStalePeriod: 21900,
  },
  USDC: {
    asset: TOKENS.USDC,
    feed: "0xeA2511205b959548459A01e358E0A30424dc0B70",
    oldMaxStalePeriod: 25200,
    newMaxStalePeriod: 21900,
  },
  DAI: {
    asset: TOKENS.DAI,
    feed: "0x0bE6929FD4ad87347e97A525DB6ac8E884FCDCeC",
    oldMaxStalePeriod: 25200,
    newMaxStalePeriod: 21900,
  },
  DOT: {
    asset: TOKENS.DOT,
    feed: "0xa75CC459De167De5BC21ccdecCdB85e86377B00f",
    oldMaxStalePeriod: 25200,
    newMaxStalePeriod: 21900,
  },
  USDT: {
    asset: TOKENS.USDT,
    feed: "0xf57bA29437C130e155Ca4b65128630777638F05D",
    oldMaxStalePeriod: 25200,
    newMaxStalePeriod: 21900,
  },
  USD1: {
    asset: TOKENS.USD1,
    feed: "0x6A1c87d11dDe3D1d52c24f8EC59B91019f14170D",
    oldMaxStalePeriod: 25200,
    newMaxStalePeriod: 21900,
  },
  XVS: {
    asset: TOKENS.XVS,
    feed: "0xED2B1ca5D7E246f615c2291De309643D41FeC97e",
    oldMaxStalePeriod: 25200,
    newMaxStalePeriod: 21900,
  },
  USDe: {
    asset: TOKENS.USDe,
    feed: "0x0d9b42a2a73Ec528759701D0B70Ccf974a327EBb",
    oldMaxStalePeriod: 25200,
    newMaxStalePeriod: 21900,
  },
  XRP: {
    asset: TOKENS.XRP,
    feed: "0xeC7C6AdcC867E1C22713D14797339750E36538E4",
    oldMaxStalePeriod: 25200,
    newMaxStalePeriod: 21900,
  },
  BCH: {
    asset: TOKENS.BCH,
    feed: "0x98ECE0D516f891a35278E3186772fb1545b274eB",
    oldMaxStalePeriod: 25200,
    newMaxStalePeriod: 21900,
  },
  SOL: {
    asset: TOKENS.SOL,
    feed: "0x90196F6D52fce394C79D1614265d36D3F0033Ccf",
    oldMaxStalePeriod: 25200,
    newMaxStalePeriod: 21900,
  },
  TRX: {
    asset: TOKENS.TRX,
    feed: "0xa17362dd9AD6d0aF646D7C8f8578fddbfc90B916",
    oldMaxStalePeriod: 1500,
    newMaxStalePeriod: 900,
  },
  ETH: {
    asset: TOKENS.ETH,
    feed: "0x9cF19D284862A66378c304ACAcB0E857EBc3F856",
    oldMaxStalePeriod: 25200,
    newMaxStalePeriod: 21900,
  },
  THE: {
    asset: TOKENS.THE,
    feed: "0xFB1267A29C0aa19daae4a483ea895862A69e4AA5",
    oldMaxStalePeriod: 1800,
    newMaxStalePeriod: 1200,
  },
  FIL: {
    asset: TOKENS.FIL,
    feed: "0xe49df9f60D6B1Dd1D5fdfCAB29216f4a8582dA86",
    oldMaxStalePeriod: 25200,
    newMaxStalePeriod: 21900,
  },
  CAKE: {
    asset: TOKENS.CAKE,
    feed: "0x1102D8C7A6021e45cCddEC4912dc998Bc5ebD8e5",
    oldMaxStalePeriod: 25200,
    newMaxStalePeriod: 21900,
  },
  ADA: {
    asset: TOKENS.ADA,
    feed: "0xc44be6D00307c3565FDf753e852Fc003036cBc13",
    oldMaxStalePeriod: 25200,
    newMaxStalePeriod: 21900,
  },
  LTC: {
    asset: TOKENS.LTC,
    feed: "0x7A9b672fc20b5C89D6774514052b3e0899E5E263",
    oldMaxStalePeriod: 25200,
    newMaxStalePeriod: 21900,
  },
  LINK: {
    asset: TOKENS.LINK,
    feed: "0x1b0FDa12D125B864756Bbf191ad20eaB10915a6F",
    oldMaxStalePeriod: 25200,
    newMaxStalePeriod: 21900,
  },
  AAVE: {
    asset: TOKENS.AAVE,
    feed: "0xe4630835eA31ABD4247e449A550Fb92c8a5a4E96",
    oldMaxStalePeriod: 25200,
    newMaxStalePeriod: 21900,
  },
  DOGE: {
    asset: TOKENS.DOGE,
    feed: "0x6f57Ff507735BcD3d86af83aF77ABD10395b2904",
    oldMaxStalePeriod: 25200,
    newMaxStalePeriod: 21900,
  },
  TWT: {
    asset: TOKENS.TWT,
    feed: "0xefe76D1C11F267d8735D240f53317F238D8C77c9",
    oldMaxStalePeriod: 25200,
    newMaxStalePeriod: 21900,
  },
  UNI: {
    asset: TOKENS.UNI,
    feed: "0x22d47686b3AEC9068768f84EFD8Ce2637a347B0A",
    oldMaxStalePeriod: 25200,
    newMaxStalePeriod: 21900,
  },
  SolvBTC: {
    asset: TOKENS.SolvBTC,
    feed: "0xF5F641fF3c7E39876A76e77E84041C300DFa4550",
    oldMaxStalePeriod: 25200,
    newMaxStalePeriod: 21900,
  },
};

// ===== BinanceOracle configurations (by symbol) =====
export const BINANCE_STALE_PERIODS = {
  USDC: { symbol: "USDC", oldMaxStalePeriod: 90000, newMaxStalePeriod: 86700 },
  DAI: { symbol: "DAI", oldMaxStalePeriod: 90000, newMaxStalePeriod: 86700 },
  TUSD: { symbol: "TUSD", oldMaxStalePeriod: 90000, newMaxStalePeriod: 86700 },
  DOT: { symbol: "DOT", oldMaxStalePeriod: 90000, newMaxStalePeriod: 86700 },
  USDT: { symbol: "USDT", oldMaxStalePeriod: 90000, newMaxStalePeriod: 86700 },
  USD1: { symbol: "USD1", oldMaxStalePeriod: 90000, newMaxStalePeriod: 86700 },
  XVS: { symbol: "XVS", oldMaxStalePeriod: 90000, newMaxStalePeriod: 86700 },
  XRP: { symbol: "XRP", oldMaxStalePeriod: 90000, newMaxStalePeriod: 86700 },
  BCH: { symbol: "BCH", oldMaxStalePeriod: 90000, newMaxStalePeriod: 86700 },
  asBNB: { symbol: "asBNB", oldMaxStalePeriod: 90000, newMaxStalePeriod: 86700 },
  SOL: { symbol: "SOL", oldMaxStalePeriod: 90000, newMaxStalePeriod: 86700 },
  TRX: { symbol: "TRX", oldMaxStalePeriod: 90000, newMaxStalePeriod: 86700 },
  FIL: { symbol: "FIL", oldMaxStalePeriod: 90000, newMaxStalePeriod: 86700 },
  CAKE: { symbol: "CAKE", oldMaxStalePeriod: 90000, newMaxStalePeriod: 86700 },
  ADA: { symbol: "ADA", oldMaxStalePeriod: 90000, newMaxStalePeriod: 86700 },
  LTC: { symbol: "LTC", oldMaxStalePeriod: 90000, newMaxStalePeriod: 86700 },
  LINK: { symbol: "LINK", oldMaxStalePeriod: 90000, newMaxStalePeriod: 86700 },
  AAVE: { symbol: "AAVE", oldMaxStalePeriod: 90000, newMaxStalePeriod: 86700 },
  DOGE: { symbol: "DOGE", oldMaxStalePeriod: 90000, newMaxStalePeriod: 86700 },
  UNI: { symbol: "UNI", oldMaxStalePeriod: 90000, newMaxStalePeriod: 86700 },
  THE: { symbol: "THE", oldMaxStalePeriod: 90000, newMaxStalePeriod: 86700 },
  lisUSD: { symbol: "lisUSD", oldMaxStalePeriod: 1500, newMaxStalePeriod: 1200 },
  TWT: { symbol: "TWT", oldMaxStalePeriod: 1500, newMaxStalePeriod: 1200 },
  BNB: { symbol: "BNB", oldMaxStalePeriod: 100, newMaxStalePeriod: 120 },
  WBNB: { symbol: "WBNB", oldMaxStalePeriod: 0, newMaxStalePeriod: 120 },
  BTCB: { symbol: "BTCB", oldMaxStalePeriod: 0, newMaxStalePeriod: 86700 },
  SolvBTC: { symbol: "SolvBTC", oldMaxStalePeriod: 46800, newMaxStalePeriod: 43500 },
};

export const ORACLE_PRICE_VALIDATION_ASSETS = [...new Set([...Object.values(TOKENS)])];

export const vip605 = () => {
  const chainlinkOracleConfigs = Object.values(CHAINLINK_ORACLE_CONFIGS);
  const redstoneOracleConfigs = Object.values(REDSTONE_ORACLE_CONFIGS);
  const binanceStalePeriods = Object.values(BINANCE_STALE_PERIODS);

  const meta = {
    version: "v2",
    title: "VIP-605 [BNB Chain] Oracle Configuration Improvements and CAPO Rate Recalibration",
    description: `#### Description

This proposal introduces **oracle configuration improvements** and **CAPO rate recalibrations** to enhance pricing reliability, remove redundancy, and better align growth assumptions with real market conditions.

This VIP addresses several inefficiencies in the current oracle and yield configuration:
- Redundant oracle fallback setups that provide no additional safety
- CAPO growth rates that are misaligned with actual on-chain yields
- Inconsistent maxStalePeriod values relative to oracle heartbeat intervals

These changes aim to improve pricing accuracy, standardise oracle behaviour, and ensure safer parameters across the protocol.

#### Proposed Changes

**1. sUSDe Oracle Configuration**

- Disable the **Fallback oracle slot** for **sUSDe**
- Pivot and Fallback currently point to the same contract, making the fallback redundant

**2. CAPO Growth Rate Recalibration**

- **asBNB**: Adjust from **30.49% → ~5%** — aligns with actual staking APY (~1%) while maintaining reasonable headroom
- **slisBNB**: Adjust from **4.12% → ~5%** — provides sufficient buffer above current ~3.5–4% APY to prevent unnecessary liquidations

**3. maxStalePeriod Standardization**

Update maxStalePeriod across oracle feeds using a standardised heartbeat-based formula:
- Existing tighter values are preserved
- Slots currently set to **0** will be assigned appropriate limits

These updates apply across key assets including **USDT, USDC, DAI, FDUSD, TUSD, BNB, BTCB, ETH, XRP, LINK, AAVE, UNI, and others**, ensuring consistent and reliable price validation.

Details:
- ≤ 30s → 60s
- ≤ 60s → 120s
- 60s–200s → heartbeat + 100s
- 200s–250s → heartbeat + 250s
- ≥ 250s → heartbeat + 300s

#### Summary

If approved, this VIP will:
- Remove redundant oracle configuration for **sUSDe**
- Recalibrate CAPO growth rates for **asBNB** and **slisBNB**
- Standardise maxStalePeriod across oracle feeds
- Improve overall oracle reliability and parameter consistency across the protocol`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      // ===== 1. sUSDe — Remove duplicate Fallback slot =====
      // Current: Main=RedStone, Pivot=Chainlink, Fallback=Chainlink (redundant)
      // New: Main=RedStone, Pivot=Chainlink, Fallback=disabled
      {
        target: bscmainnet.RESILIENT_ORACLE,
        signature: "setTokenConfigs((address,address[3],bool[3],bool)[])",
        params: [
          [
            [
              sUSDe,
              SUSDE_ORACLE_CONFIG.new.oracles,
              SUSDE_ORACLE_CONFIG.new.enableFlagsForOracles,
              SUSDE_ORACLE_CONFIG.new.cachingEnabled,
            ],
          ],
        ],
      },

      // ===== 2a. Update asBNB snapshot =====
      {
        target: asBNB_ORACLE,
        signature: "updateSnapshot()",
        params: [],
      },

      // ===== 2b. CAPO Growth Rate Recalibration =====
      {
        target: asBNB_ORACLE,
        signature: "setGrowthRate(uint256,uint256)",
        params: [
          CAPO_GROWTH_RATE_CONFIGS.asBNB.growthRatePerYear.new,
          CAPO_GROWTH_RATE_CONFIGS.asBNB.snapshotInterval.new,
        ],
      },
      {
        target: slisBNB_ORACLE,
        signature: "setGrowthRate(uint256,uint256)",
        params: [
          CAPO_GROWTH_RATE_CONFIGS.slisBNB.growthRatePerYear.new,
          CAPO_GROWTH_RATE_CONFIGS.slisBNB.snapshotInterval.new,
        ],
      },

      // ===== 3a. maxStalePeriod — ChainlinkOracle feeds =====
      {
        target: bscmainnet.CHAINLINK_ORACLE,
        signature: "setTokenConfigs((address,address,uint256)[])",
        params: [chainlinkOracleConfigs.map(({ asset, feed, newMaxStalePeriod }) => [asset, feed, newMaxStalePeriod])],
      },

      // ===== 3b. maxStalePeriod — USDT ChainlinkOracle (USDe Main) =====
      {
        target: USDT_CHAINLINK_ORACLE,
        signature: "setTokenConfigs((address,address,uint256)[])",
        params: [
          Object.values(USDT_CHAINLINK_ORACLE_CONFIG).map(({ asset, feed, newMaxStalePeriod }) => [
            asset,
            feed,
            newMaxStalePeriod,
          ]),
        ],
      },

      // ===== 3c. maxStalePeriod — RedStoneOracle feeds =====
      {
        target: bscmainnet.REDSTONE_ORACLE,
        signature: "setTokenConfigs((address,address,uint256)[])",
        params: [redstoneOracleConfigs.map(({ asset, feed, newMaxStalePeriod }) => [asset, feed, newMaxStalePeriod])],
      },

      // ===== 3d. maxStalePeriod — BinanceOracle (by symbol) =====
      ...binanceStalePeriods.map(({ symbol, newMaxStalePeriod }) => ({
        target: bscmainnet.BINANCE_ORACLE,
        signature: "setMaxStalePeriod(string,uint256)",
        params: [symbol, newMaxStalePeriod],
      })),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip605;
