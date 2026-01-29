import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const addressZero = ethers.constants.AddressZero;
const { RESILIENT_ORACLE, CHAINLINK_ORACLE, REDSTONE_ORACLE, BINANCE_ORACLE } = NETWORK_ADDRESSES.bscmainnet;

/* ============ Chainlink Oracle configs ============ */

export const NEW_CHAINLINK_ORACLE_CONFIG = [
  {
    NAME: "BTCB",
    ASSET: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
    FEED: "0x8ECF7dE377F788A813F5215668E282556b35f300",
    MAX_STALE_PERIOD: 100,
  },
  {
    NAME: "USDT",
    ASSET: "0x55d398326f99059fF775485246999027B3197955",
    FEED: "0xb631F3Cb6B3a5EebF72C97e30c377de061C6a87c",
    MAX_STALE_PERIOD: 1800,
  },
  {
    NAME: "ETH",
    ASSET: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
    FEED: "0xe48a5Fd74d4A5524D76960ef3B52204C0e11fCD1",
    MAX_STALE_PERIOD: 100,
  },
  {
    NAME: "DOGE",
    ASSET: "0xbA2aE424d960c26247Dd6c32edC70B295c744C43",
    FEED: "0xF884002406Ac6Fd93FF5C989506220f781A97eEA",
    MAX_STALE_PERIOD: 100,
  },
  {
    NAME: "UNI",
    ASSET: "0xBf5140A22578168FD562DCcF235E5D43A02ce9B1",
    FEED: "0x97E87D0c607Ca16E90073D723FEAd83d3882F4b7",
    MAX_STALE_PERIOD: 1200,
  },
  {
    NAME: "XVS",
    ASSET: "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63",
    FEED: "0x04C584Ce3EF042f32818ecFEEDC625A353a0960A",
    MAX_STALE_PERIOD: 1800,
  },
  {
    NAME: "AAVE",
    ASSET: "0xfb6115445Bff7b52FeB98650C87f44907E58f802",
    FEED: "0x1Fa0D75D5b90d230da2A610F2B1B2Eaf9a44Dd5f",
    MAX_STALE_PERIOD: 1200,
  },
];

export const OLD_ORACLE_CONFIG = [
  {
    NAME: "BTCB",
    ASSET: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
    MAIN: REDSTONE_ORACLE,
    PIVOT: CHAINLINK_ORACLE,
    FALLBACK: CHAINLINK_ORACLE,
    CACHED: false,
  },
  {
    NAME: "USDT",
    ASSET: "0x55d398326f99059fF775485246999027B3197955",
    MAIN: CHAINLINK_ORACLE,
    PIVOT: REDSTONE_ORACLE,
    FALLBACK: BINANCE_ORACLE,
    CACHED: false,
  },
  {
    NAME: "ETH",
    ASSET: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
    MAIN: CHAINLINK_ORACLE,
    PIVOT: REDSTONE_ORACLE,
    FALLBACK: BINANCE_ORACLE,
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
    NAME: "UNI",
    ASSET: "0xBf5140A22578168FD562DCcF235E5D43A02ce9B1",
    MAIN: CHAINLINK_ORACLE,
    PIVOT: BINANCE_ORACLE,
    FALLBACK: addressZero,
    CACHED: false,
  },
  {
    NAME: "XVS",
    ASSET: "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63",
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
];

export const NEW_BTCB_ORACLE_CONFIG = {
  NAME: "BTCB",
  ASSET: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
  MAIN: CHAINLINK_ORACLE,
  PIVOT: REDSTONE_ORACLE,
  FALLBACK: REDSTONE_ORACLE,
  CACHED: false,
};

export const NEW_ORACLE_CONFIG = OLD_ORACLE_CONFIG.filter(oracleData => oracleData.NAME !== "BTCB").concat(
  NEW_BTCB_ORACLE_CONFIG,
);

/* ============ Redstone Oracle configs ============ */

// Already have required feeds
export const OLD_REDSTONE_ORACLE_FEEDS = [
  {
    NAME: "BNB",
    ASSET: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
    FEED: "0x8dd2D85C7c28F43F965AE4d9545189C7D022ED0e",
    MAX_STALE_PERIOD: 100,
  },
  {
    NAME: "USDC",
    ASSET: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    FEED: "0xeA2511205b959548459A01e358E0A30424dc0B70",
    MAX_STALE_PERIOD: 25200,
  },
  {
    NAME: "WBNB",
    ASSET: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    FEED: "0x8dd2D85C7c28F43F965AE4d9545189C7D022ED0e",
    MAX_STALE_PERIOD: 100,
  },
  {
    NAME: "SolvBTC",
    ASSET: "0x4aae823a6a0b376De6A78e74eCC5b079d38cBCf7",
    FEED: "0xa51738d1937FFc553d5070f43300B385AA2D9F55",
    MAX_STALE_PERIOD: 100,
  },
  {
    NAME: "THE",
    ASSET: "0xF4C8E32EaDEC4BFe97E0F595AdD0f4450a863a11",
    FEED: "0xFB1267A29C0aa19daae4a483ea895862A69e4AA5",
    MAX_STALE_PERIOD: 1800,
  },
];

// Add fresh redstone oracle with new feeds
export const NEW_REDSTONE_ORACLE_FEEDS = [
  {
    NAME: "CAKE",
    ASSET: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
    FEED: "0x1102D8C7A6021e45cCddEC4912dc998Bc5ebD8e5",
    MAX_STALE_PERIOD: 25200,
  },
  {
    NAME: "ADA",
    ASSET: "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47",
    FEED: "0xc44be6D00307c3565FDf753e852Fc003036cBc13",
    MAX_STALE_PERIOD: 25200,
  },
  {
    NAME: "XRP",
    ASSET: "0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE",
    FEED: "0xeC7C6AdcC867E1C22713D14797339750E36538E4",
    MAX_STALE_PERIOD: 25200,
  },
];

export const OLD_ORACLE_CONFIG_FOR_RS_CHANGES = [
  {
    NAME: "BNB",
    ASSET: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
    MAIN: REDSTONE_ORACLE,
    PIVOT: CHAINLINK_ORACLE,
    FALLBACK: BINANCE_ORACLE,
    CACHED: false,
  },
  {
    NAME: "USDC",
    ASSET: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    MAIN: CHAINLINK_ORACLE,
    PIVOT: REDSTONE_ORACLE,
    FALLBACK: BINANCE_ORACLE,
    CACHED: false,
  },
  {
    NAME: "WBNB",
    ASSET: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    MAIN: REDSTONE_ORACLE,
    PIVOT: CHAINLINK_ORACLE,
    FALLBACK: BINANCE_ORACLE,
    CACHED: false,
  },
  {
    NAME: "SolvBTC",
    ASSET: "0x1346b618dC92810EC74163e4c27004c921D446a5",
    MAIN: "0xf5534f78Df9b610B19A63956d498d00CFaD8B9D3", // OneJump Oracle xSolvBTC/SolvBTC/USD (intermediate Redstone)
    PIVOT: addressZero,
    FALLBACK: addressZero,
    CACHED: false,
  },
  {
    NAME: "THE",
    ASSET: "0xF4C8E32EaDEC4BFe97E0F595AdD0f4450a863a11",
    MAIN: REDSTONE_ORACLE,
    PIVOT: BINANCE_ORACLE,
    FALLBACK: addressZero,
    CACHED: false,
  },
  {
    NAME: "CAKE",
    ASSET: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
    MAIN: CHAINLINK_ORACLE,
    PIVOT: BINANCE_ORACLE,
    FALLBACK: addressZero,
    CACHED: false,
  },
  {
    NAME: "ADA",
    ASSET: "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47",
    MAIN: CHAINLINK_ORACLE,
    PIVOT: BINANCE_ORACLE,
    FALLBACK: addressZero,
    CACHED: false,
  },
  {
    NAME: "XRP",
    ASSET: "0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE",
    MAIN: CHAINLINK_ORACLE,
    PIVOT: BINANCE_ORACLE,
    FALLBACK: addressZero,
    CACHED: false,
  },
];

export const NEW_ORACLE_CONFIG_FOR_RS_CHANGES = [
  {
    NAME: "USDC",
    ASSET: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    MAIN: REDSTONE_ORACLE,
    PIVOT: CHAINLINK_ORACLE,
    FALLBACK: BINANCE_ORACLE,
    CACHED: false,
  },
  {
    NAME: "XRP",
    ASSET: "0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE",
    MAIN: REDSTONE_ORACLE,
    PIVOT: CHAINLINK_ORACLE,
    FALLBACK: BINANCE_ORACLE,
    CACHED: false,
  },
  {
    NAME: "CAKE",
    ASSET: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
    MAIN: REDSTONE_ORACLE,
    PIVOT: CHAINLINK_ORACLE,
    FALLBACK: BINANCE_ORACLE,
    CACHED: false,
  },
  {
    NAME: "ADA",
    ASSET: "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47",
    MAIN: REDSTONE_ORACLE,
    PIVOT: CHAINLINK_ORACLE,
    FALLBACK: BINANCE_ORACLE,
    CACHED: false,
  },
];

export const vip595 = () => {
  const meta = {
    version: "v2",
    title: "VIP-595",
    description: `VIP-595`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      /* ============ Chainlink Oracle ============ */
      ...NEW_CHAINLINK_ORACLE_CONFIG.map(oracleData => {
        return {
          target: CHAINLINK_ORACLE,
          signature: "setTokenConfig((address,address,uint256))",
          params: [[oracleData.ASSET, oracleData.FEED, oracleData.MAX_STALE_PERIOD]],
        };
      }),

      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [
          [
            NEW_BTCB_ORACLE_CONFIG.ASSET,
            [NEW_BTCB_ORACLE_CONFIG.MAIN, NEW_BTCB_ORACLE_CONFIG.PIVOT, NEW_BTCB_ORACLE_CONFIG.FALLBACK],
            [true, true, true],
            NEW_BTCB_ORACLE_CONFIG.CACHED,
          ],
        ],
      },

      /* ============ Redstone Oracle ============ */

      ...NEW_REDSTONE_ORACLE_FEEDS.map(feedData => {
        return {
          target: REDSTONE_ORACLE,
          signature: "setTokenConfig((address,address,uint256))",
          params: [[feedData.ASSET, feedData.FEED, feedData.MAX_STALE_PERIOD]],
        };
      }),

      ...NEW_ORACLE_CONFIG_FOR_RS_CHANGES.map(oracleData => {
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
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip595;
