import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const addressZero = ethers.constants.AddressZero;
const { RESILIENT_ORACLE, CHAINLINK_ORACLE, REDSTONE_ORACLE, BINANCE_ORACLE } = NETWORK_ADDRESSES.bscmainnet;

export const BOUND_VALIDATOR = "0x6E332fF0bB52475304494E4AE5063c1051c7d735";
export const PRICE_LOWER_BOUND = parseUnits("0.95", 18);
export const PRICE_UPPER_BOUND = parseUnits("1.05", 18);

/* ============ New RedStone Oracle Feeds ============ */

export const NEW_REDSTONE_ORACLE_FEEDS = [
  {
    NAME: "XVS",
    ASSET: "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63",
    FEED: "0xED2B1ca5D7E246f615c2291De309643D41FeC97e",
    MAX_STALE_PERIOD: 25200,
  },
  {
    NAME: "LTC",
    ASSET: "0x4338665CBB7B2485A8855A139b75D5e34AB0DB94",
    FEED: "0x7A9b672fc20b5C89D6774514052b3e0899E5E263",
    MAX_STALE_PERIOD: 25200,
  },
  {
    NAME: "BCH",
    ASSET: "0x8fF795a6F4D97E7887C79beA79aba5cc76444aDf",
    FEED: "0x98ECE0D516f891a35278E3186772fb1545b274eB",
    MAX_STALE_PERIOD: 25200,
  },
  {
    NAME: "DOT",
    ASSET: "0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402",
    FEED: "0xa75CC459De167De5BC21ccdecCdB85e86377B00f",
    MAX_STALE_PERIOD: 25200,
  },
  {
    NAME: "LINK",
    ASSET: "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD",
    FEED: "0x1b0FDa12D125B864756Bbf191ad20eaB10915a6F",
    MAX_STALE_PERIOD: 25200,
  },
  {
    NAME: "DAI",
    ASSET: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",
    FEED: "0x0bE6929FD4ad87347e97A525DB6ac8E884FCDCeC",
    MAX_STALE_PERIOD: 25200,
  },
  {
    NAME: "FIL",
    ASSET: "0x0D8Ce2A99Bb6e3B7Db580eD848240e4a0F9aE153",
    FEED: "0xe49df9f60D6B1Dd1D5fdfCAB29216f4a8582dA86",
    MAX_STALE_PERIOD: 25200,
  },
  {
    NAME: "DOGE",
    ASSET: "0xbA2aE424d960c26247Dd6c32edC70B295c744C43",
    FEED: "0x6f57Ff507735BcD3d86af83aF77ABD10395b2904",
    MAX_STALE_PERIOD: 25200,
  },
  {
    NAME: "AAVE",
    ASSET: "0xfb6115445Bff7b52FeB98650C87f44907E58f802",
    FEED: "0xe4630835eA31ABD4247e449A550Fb92c8a5a4E96",
    MAX_STALE_PERIOD: 25200,
  },
  {
    NAME: "UNI",
    ASSET: "0xBf5140A22578168FD562DCcF235E5D43A02ce9B1",
    FEED: "0x22d47686b3AEC9068768f84EFD8Ce2637a347B0A",
    MAX_STALE_PERIOD: 25200,
  },
  {
    NAME: "FDUSD",
    ASSET: "0xc5f0f7b66764F6ec8C8Dff7BA683102295E16409",
    FEED: "0x98DC6E90D4c2f212ed9d124aD2aFBa4833268633",
    MAX_STALE_PERIOD: 25200,
  },
  {
    NAME: "TWT",
    ASSET: "0x4B0F1812e5Df2A09796481Ff14017e6005508003",
    FEED: "0xefe76D1C11F267d8735D240f53317F238D8C77c9",
    MAX_STALE_PERIOD: 25200,
  },
  {
    NAME: "SOL",
    ASSET: "0x570A5D26f7765Ecb712C0924E4De545B89fD43dF",
    FEED: "0x90196F6D52fce394C79D1614265d36D3F0033Ccf",
    MAX_STALE_PERIOD: 25200,
  },
];

/* ============ Old Oracle Configs (pre-VIP) ============ */

export const OLD_ORACLE_CONFIG = [
  {
    NAME: "XVS",
    ASSET: "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63",
    MAIN: CHAINLINK_ORACLE,
    PIVOT: BINANCE_ORACLE,
    FALLBACK: addressZero,
    CACHED: false,
  },
  {
    NAME: "LTC",
    ASSET: "0x4338665CBB7B2485A8855A139b75D5e34AB0DB94",
    MAIN: CHAINLINK_ORACLE,
    PIVOT: BINANCE_ORACLE,
    FALLBACK: addressZero,
    CACHED: false,
  },
  {
    NAME: "BCH",
    ASSET: "0x8fF795a6F4D97E7887C79beA79aba5cc76444aDf",
    MAIN: CHAINLINK_ORACLE,
    PIVOT: BINANCE_ORACLE,
    FALLBACK: addressZero,
    CACHED: false,
  },
  {
    NAME: "DOT",
    ASSET: "0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402",
    MAIN: CHAINLINK_ORACLE,
    PIVOT: BINANCE_ORACLE,
    FALLBACK: addressZero,
    CACHED: false,
  },
  {
    NAME: "LINK",
    ASSET: "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD",
    MAIN: CHAINLINK_ORACLE,
    PIVOT: BINANCE_ORACLE,
    FALLBACK: addressZero,
    CACHED: false,
  },
  {
    NAME: "DAI",
    ASSET: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",
    MAIN: CHAINLINK_ORACLE,
    PIVOT: BINANCE_ORACLE,
    FALLBACK: addressZero,
    CACHED: false,
  },
  {
    NAME: "FIL",
    ASSET: "0x0D8Ce2A99Bb6e3B7Db580eD848240e4a0F9aE153",
    MAIN: CHAINLINK_ORACLE,
    PIVOT: BINANCE_ORACLE,
    FALLBACK: addressZero,
    CACHED: false,
  },
  {
    NAME: "DOGE",
    ASSET: "0xbA2aE424d960c26247Dd6c32edC70B295c744C43",
    MAIN: CHAINLINK_ORACLE,
    PIVOT: BINANCE_ORACLE,
    FALLBACK: addressZero,
    CACHED: false,
  },
  {
    NAME: "AAVE",
    ASSET: "0xfb6115445Bff7b52FeB98650C87f44907E58f802",
    MAIN: CHAINLINK_ORACLE,
    PIVOT: BINANCE_ORACLE,
    FALLBACK: addressZero,
    CACHED: false,
  },
  {
    NAME: "UNI",
    ASSET: "0xBf5140A22578168FD562DCcF235E5D43A02ce9B1",
    MAIN: CHAINLINK_ORACLE,
    PIVOT: BINANCE_ORACLE,
    FALLBACK: addressZero,
    CACHED: false,
  },
  {
    NAME: "FDUSD",
    ASSET: "0xc5f0f7b66764F6ec8C8Dff7BA683102295E16409",
    MAIN: CHAINLINK_ORACLE,
    PIVOT: BINANCE_ORACLE,
    FALLBACK: addressZero,
    CACHED: false,
  },
  {
    NAME: "TWT",
    ASSET: "0x4B0F1812e5Df2A09796481Ff14017e6005508003",
    MAIN: BINANCE_ORACLE,
    PIVOT: addressZero,
    FALLBACK: addressZero,
    CACHED: false,
  },
  {
    NAME: "SOL",
    ASSET: "0x570A5D26f7765Ecb712C0924E4De545B89fD43dF",
    MAIN: CHAINLINK_ORACLE,
    PIVOT: BINANCE_ORACLE,
    FALLBACK: addressZero,
    CACHED: false,
  },
];

/* ============ New Oracle Configs (post-VIP) ============ */
export const NEW_STANDARD_ORACLE_CONFIG = [
  {
    NAME: "XVS",
    ASSET: "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63",
    MAIN: CHAINLINK_ORACLE,
    PIVOT: BINANCE_ORACLE,
    FALLBACK: REDSTONE_ORACLE,
    CACHED: false,
  },
  {
    NAME: "LTC",
    ASSET: "0x4338665CBB7B2485A8855A139b75D5e34AB0DB94",
    MAIN: CHAINLINK_ORACLE,
    PIVOT: BINANCE_ORACLE,
    FALLBACK: REDSTONE_ORACLE,
    CACHED: false,
  },
  {
    NAME: "BCH",
    ASSET: "0x8fF795a6F4D97E7887C79beA79aba5cc76444aDf",
    MAIN: CHAINLINK_ORACLE,
    PIVOT: BINANCE_ORACLE,
    FALLBACK: REDSTONE_ORACLE,
    CACHED: false,
  },
  {
    NAME: "DOT",
    ASSET: "0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402",
    MAIN: CHAINLINK_ORACLE,
    PIVOT: BINANCE_ORACLE,
    FALLBACK: REDSTONE_ORACLE,
    CACHED: false,
  },
  {
    NAME: "LINK",
    ASSET: "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD",
    MAIN: CHAINLINK_ORACLE,
    PIVOT: BINANCE_ORACLE,
    FALLBACK: REDSTONE_ORACLE,
    CACHED: false,
  },
  {
    NAME: "DAI",
    ASSET: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",
    MAIN: CHAINLINK_ORACLE,
    PIVOT: BINANCE_ORACLE,
    FALLBACK: REDSTONE_ORACLE,
    CACHED: false,
  },
  {
    NAME: "FIL",
    ASSET: "0x0D8Ce2A99Bb6e3B7Db580eD848240e4a0F9aE153",
    MAIN: CHAINLINK_ORACLE,
    PIVOT: BINANCE_ORACLE,
    FALLBACK: REDSTONE_ORACLE,
    CACHED: false,
  },
  {
    NAME: "DOGE",
    ASSET: "0xbA2aE424d960c26247Dd6c32edC70B295c744C43",
    MAIN: CHAINLINK_ORACLE,
    PIVOT: BINANCE_ORACLE,
    FALLBACK: REDSTONE_ORACLE,
    CACHED: false,
  },
  {
    NAME: "AAVE",
    ASSET: "0xfb6115445Bff7b52FeB98650C87f44907E58f802",
    MAIN: CHAINLINK_ORACLE,
    PIVOT: BINANCE_ORACLE,
    FALLBACK: REDSTONE_ORACLE,
    CACHED: false,
  },
  {
    NAME: "UNI",
    ASSET: "0xBf5140A22578168FD562DCcF235E5D43A02ce9B1",
    MAIN: CHAINLINK_ORACLE,
    PIVOT: BINANCE_ORACLE,
    FALLBACK: REDSTONE_ORACLE,
    CACHED: false,
  },
  {
    NAME: "FDUSD",
    ASSET: "0xc5f0f7b66764F6ec8C8Dff7BA683102295E16409",
    MAIN: CHAINLINK_ORACLE,
    PIVOT: BINANCE_ORACLE,
    FALLBACK: REDSTONE_ORACLE,
    CACHED: false,
  },
  {
    NAME: "SOL",
    ASSET: "0x570A5D26f7765Ecb712C0924E4De545B89fD43dF",
    MAIN: CHAINLINK_ORACLE,
    PIVOT: BINANCE_ORACLE,
    FALLBACK: REDSTONE_ORACLE,
    CACHED: false,
  },
];

// TWT: no Chainlink available, so Binance as MAIN, RedStone as PIVOT
export const NEW_TWT_ORACLE_CONFIG = {
  NAME: "TWT",
  ASSET: "0x4B0F1812e5Df2A09796481Ff14017e6005508003",
  MAIN: BINANCE_ORACLE,
  PIVOT: REDSTONE_ORACLE,
  FALLBACK: addressZero,
  CACHED: false,
};

export const NEW_ORACLE_CONFIG = [...NEW_STANDARD_ORACLE_CONFIG, NEW_TWT_ORACLE_CONFIG];

export const vip650 = () => {
  const meta = {
    version: "v2",
    title: "VIP-650 [BNB Chain] Two-Vendor OEV Integration - RedStone Oracle Feed Expansion",
    description: `**Description:**

This proposal continues the Two-Vendor OEV Integration Framework adopted in [VIP-586](https://app.venus.io/#/governance/proposal/586) by expanding RedStone oracle coverage across the BSC Core Pool.

It registers new RedStone price feeds for 13 additional assets and updates their resilient oracle configurations to strengthen price reliability through multi-vendor redundancy.

**Actions:**

- **Register new RedStone oracle feeds** for: XVS, LTC, BCH, DOT, LINK, DAI, FIL, DOGE, AAVE, UNI, FDUSD, TWT, SOL
- **Update resilient oracle configurations:**
    - For XVS, LTC, BCH, DOT, LINK, DAI, FIL, DOGE, AAVE, UNI, FDUSD, SOL: Set MAIN=Chainlink, PIVOT=Binance, FALLBACK=RedStone
    - For TWT: Set MAIN=Binance, PIVOT=RedStone
- **Set BoundValidator config** for TWT (required since TWT previously had no PIVOT oracle)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      /* ============ RedStone Oracle: Register new feeds ============ */

      ...NEW_REDSTONE_ORACLE_FEEDS.map(feedData => {
        return {
          target: REDSTONE_ORACLE,
          signature: "setTokenConfig((address,address,uint256))",
          params: [[feedData.ASSET, feedData.FEED, feedData.MAX_STALE_PERIOD]],
        };
      }),

      /* ============ Resilient Oracle: Update token configs ============ */

      ...NEW_ORACLE_CONFIG.map(oracleData => {
        return {
          target: RESILIENT_ORACLE,
          signature: "setTokenConfig((address,address[3],bool[3],bool))",
          params: [
            [
              oracleData.ASSET,
              [oracleData.MAIN, oracleData.PIVOT, oracleData.FALLBACK],
              [oracleData.MAIN != addressZero, oracleData.PIVOT != addressZero, oracleData.FALLBACK != addressZero],
              oracleData.CACHED,
            ],
          ],
        };
      }),

      /* ============ BoundValidator: Set validation config for TWT ============ */

      {
        target: BOUND_VALIDATOR,
        signature: "setValidateConfig((address,uint256,uint256))",
        params: [[NEW_TWT_ORACLE_CONFIG.ASSET, PRICE_UPPER_BOUND, PRICE_LOWER_BOUND]],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip650;
