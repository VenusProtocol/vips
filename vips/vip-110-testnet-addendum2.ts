import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const CHAINLINK_ORACLE = "0xfc4e26B7fD56610E84d33372435F0275A359E8eF";
const RESILIENT_ORACLE = "0xD9D16795A92212662a2D44AAc810eC68fdE61076";

interface AssetConfig {
  name: string;
  address: string;
  price: string;
}

const ASSETS: AssetConfig[] = [
  {
    name: "BIFI",
    address: "0x5B662703775171c4212F2FBAdb7F92e64116c154",
    price: "448048050440000000000"
  },
  {
    name: "BSW",
    address: "0x7FCC76fc1F573d8Eb445c236Cc282246bC562bCE",
    price: "167199100000000000"
  },
  // {
  //   name: "ALPACA",
  //   address: "",
  //   price: "265440570000000000"
  // },
  {
    name: "WOO",
    address: "0x65B849A4Fc306AF413E341D44dF8482F963fBB91",
    price: "292908560000000000"
  },
  {
    name: "FLOKI",
    address: "0xb22cF15FBc089d470f8e532aeAd2baB76bE87c88",
    price: "36570000000000"
  },
  {
    name: "BNBx",
    address: "0x327d6E6FAC0228070884e913263CFF9eFed4a2C8",
    price: "342500052660000000000"
  },
  {
    name: "HAY",
    address: "0xe73774DfCD551BF75650772dC2cC56a2B6323453",
    price: "1000000000000000000"
  },
  {
    name: "BTT",
    address: "0xE98344A7c691B200EF47c9b8829110087D832C64",
    price: "639700000000"
  },
  {
    name: "WIN",
    address: "0x2E6Af3f3F059F43D764060968658c9F3c8f9479D",
    price: "85080000000000"
  },
  // {
  //   name: "USDD",
  //   address: "",
  //   price: "1000000000000000000"
  // },
  {
    name: "stkBNB",
    address: "0x2999C176eBf66ecda3a646E70CeB5FF4d5fCFb8C",
    price: "328360000000000000000"
  },
  {
    name: "RACA",
    address: "0xD60cC803d888A3e743F21D0bdE4bF2cAfdEA1F26",
    price: "190100000000000"
  },
  {
    name: "NFT",
    address: "0xc440e4F21AFc2C3bDBA1Af7D0E338ED35d3e25bA",
    price: "366500000000"
  },
  {
    name: "ankrBNB",
    address: "0x167F1F9EF531b3576201aa3146b13c57dbEda514",
    price: "337950000000000000000"
  },
  {
    name: "ANKR",
    address: "0xe4a90EB942CF2DA7238e8F6cC9EF510c49FC8B4B",
    price: "31120000000000000"
  },
];

export const vip110TestnetAddendum2 = () => {
  const meta = {
    version: "v2",
    title: "VIP-110 IL Markets Price Configuration",
    description: `
    Configure Price Feed for IL Markets
    `,
    forDescription: "I agree that Venus Protocol should proceed with this recommendation",
    againstDescription: "I do not think that Venus Protocol should proceed with this recommendation",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with this recommendation or not",
  };

  return makeProposal(
    [
      ...ASSETS.map(asset => {
        return {
          target: CHAINLINK_ORACLE,
          signature: "setDirectPrice(address,uint256)",
          params: [asset.address, asset.price],
        };
      }),
      ...ASSETS.map(asset => {
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
    ],
    meta,
    ProposalType.REGULAR,
  );
};
