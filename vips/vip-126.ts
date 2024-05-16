import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const CHAINLINK_ORACLE = "0x1B2103441A0A108daD8848D8F5d790e4D402921F";
const RESILIENT_ORACLE = "0x6592b5DE802159F3E74B2486b091D11a8256ab8A";
const BINANCE_ORACLE = "0x594810b741d136f1960141C0d8Fb4a91bE78A820";

interface ChainlinkAssetConfig {
  name: string;
  address: string;
  feed: string;
  stalePeriod: number;
}

interface BinanceAssetConfig {
  name: string;
  address: string;
  stalePeriod: number;
}

const CHAINLINK_ASSETS: ChainlinkAssetConfig[] = [
  {
    name: "ALPACA",
    address: "0x8f0528ce5ef7b51152a59745befdd91d97091d2f",
    feed: "0xe0073b60833249ffd1bb2af809112c2fbf221DF6",
    stalePeriod: 60 * 60 * 24.5,
  },
  {
    name: "BIFI",
    address: "0xCa3F508B8e4Dd382eE878A314789373D80A5190A",
    feed: "0xaB827b69daCd586A37E80A7d552a4395d576e645",
    stalePeriod: 60 * 60 * 24.5,
  },
  {
    name: "BNBx",
    address: "0x1bdd3cf7f79cfb8edbb955f20ad99211551ba275",
    feed: "0xc4429B539397a3166eF3ef132c29e34715a3ABb4",
    stalePeriod: 60 * 25,
  },
  {
    name: "BSW",
    address: "0x965f527d9159dce6288a2219db51fc6eef120dd1",
    feed: "0x08e70777b982a58d23d05e3d7714f44837c06a21",
    stalePeriod: 60 * 25,
  },
  {
    name: "WBNB",
    address: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
    feed: "0x0567f2323251f0aab15c8dfb1967e4e8a7d42aee",
    stalePeriod: 60 * 5,
  },
  {
    name: "WIN",
    address: "0xaeF0d72a118ce24feE3cD1d43d383897D05B4e99",
    feed: "0x9e7377e194e41d63795907c92c3eb351a2eb0233",
    stalePeriod: 60 * 25,
  },
  {
    name: "WOO",
    address: "0x4691937a7508860f876c9c0a2a617e7d9e945d4b",
    feed: "0x02bfe714e78e2ad1bb1c2bee93ec8dc5423b66d4",
    stalePeriod: 60 * 60 * 24.5,
  },
];

const BINANCE_ASSETS: BinanceAssetConfig[] = [
  {
    name: "ANKR",
    address: "0xf307910A4c7bbc79691fD374889b36d8531B08e3",
    stalePeriod: 60 * 25,
  },
  {
    name: "ankrBNB",
    address: "0x52F24a5e03aee338Da5fd9Df68D2b6FAe1178827",
    stalePeriod: 60 * 25,
  },
  {
    name: "BTT",
    address: "0x352Cb5E19b12FC216548a2677bD0fce83BaE434B",
    stalePeriod: 60 * 25,
  },
  {
    name: "FLOKI",
    address: "0xfb5B838b6cfEEdC2873aB27866079AC55363D37E",
    stalePeriod: 60 * 25,
  },
  {
    name: "HAY",
    address: "0x0782b6d8c4551B9760e74c0545a9bCD90bdc41E5",
    stalePeriod: 60 * 25,
  },
  {
    name: "NFT",
    address: "0x20eE7B720f4E4c4FFcB00C4065cdae55271aECCa",
    stalePeriod: 60 * 25,
  },
  {
    name: "RACA",
    address: "0x12BB890508c125661E03b09EC06E404bc9289040",
    stalePeriod: 60 * 25,
  },
  {
    name: "stkBNB",
    address: "0xc2E9d07F66A89c44062459A47a0D2Dc038E4fb16",
    stalePeriod: 60 * 25,
  },
  {
    name: "USDD",
    address: "0xd17479997F34dd9156Deef8F95A52D81D265be9c",
    stalePeriod: 60 * 25,
  },
];

export const vip126 = (maxStalePeriod?: number) => {
  const meta = {
    version: "v2",
    title: "VIP-126 Resilient Oracle",
    description: `
    Configure Price Feeds for Isolated Pools Markets
    `,
    forDescription: "I agree that Venus Protocol should proceed with this recommendation",
    againstDescription: "I do not think that Venus Protocol should proceed with this recommendation",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with this recommendation or not",
  };

  return makeProposal(
    [
      ...CHAINLINK_ASSETS.map(asset => {
        return {
          target: CHAINLINK_ORACLE,
          signature: "setTokenConfig((address,address,uint256))",
          params: [[asset.address, asset.feed, maxStalePeriod || asset.stalePeriod]],
        };
      }),
      ...CHAINLINK_ASSETS.map(asset => {
        return {
          target: RESILIENT_ORACLE,
          signature: "setTokenConfig((address,address[3],bool[3]))",
          params: [
            [
              asset.address,
              [
                CHAINLINK_ORACLE,
                "0x0000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000",
              ],
              [true, false, false],
            ],
          ],
        };
      }),
      ...BINANCE_ASSETS.map(asset => {
        return {
          target: BINANCE_ORACLE,
          signature: "setMaxStalePeriod(string,uint256)",
          params: [asset.name, maxStalePeriod || asset.stalePeriod],
        };
      }),
      ...BINANCE_ASSETS.map(asset => {
        return {
          target: RESILIENT_ORACLE,
          signature: "setTokenConfig((address,address[3],bool[3]))",
          params: [
            [
              asset.address,
              [
                BINANCE_ORACLE,
                "0x0000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000",
              ],
              [true, false, false],
            ],
          ],
        };
      }),
    ],
    meta,
    ProposalType.REGULAR,
  );
};
