import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const addressZero = ethers.constants.AddressZero;
const { RESILIENT_ORACLE, CHAINLINK_ORACLE, REDSTONE_ORACLE, BINANCE_ORACLE } = NETWORK_ADDRESSES.bscmainnet;

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
    MAX_STALE_PERIOD: 86400,
  },
  {
    NAME: "ETH",
    ASSET: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
    FEED: "0xe48a5Fd74d4A5524D76960ef3B52204C0e11fCD1",
    MAX_STALE_PERIOD: 86400,
  },
  {
    NAME: "DOGE",
    ASSET: "0xbA2aE424d960c26247Dd6c32edC70B295c744C43",
    FEED: "0xF884002406Ac6Fd93FF5C989506220f781A97eEA",
    MAX_STALE_PERIOD: 86400,
  },
  {
    NAME: "UNI",
    ASSET: "0xBf5140A22578168FD562DCcF235E5D43A02ce9B1",
    FEED: "0x97E87D0c607Ca16E90073D723FEAd83d3882F4b7",
    MAX_STALE_PERIOD: 1500,
  },
  {
    NAME: "XVS",
    ASSET: "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63",
    FEED: "0x04C584Ce3EF042f32818ecFEEDC625A353a0960A",
    MAX_STALE_PERIOD: 86400,
  },
  {
    NAME: "AAVE",
    ASSET: "0xfb6115445Bff7b52FeB98650C87f44907E58f802",
    FEED: "0x1Fa0D75D5b90d230da2A610F2B1B2Eaf9a44Dd5f",
    MAX_STALE_PERIOD: 86400,
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
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip595;
