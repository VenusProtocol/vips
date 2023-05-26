import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const CHAINLINK_ORACLE = "0xfc4e26B7fD56610E84d33372435F0275A359E8eF";
const RESILIENT_ORACLE = "0xD9D16795A92212662a2D44AAc810eC68fdE61076";

interface AssetConfig {
  name: string;
  address: string;
  feed: string;
}

const ASSETS: AssetConfig[] = [
  {
    name: "WBNB",
    address: "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd",
    feed: "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526",
  },
];

const MAX_STALE_PERIOD = 60 * 60 * 24 * 7; // 7 days

export const vip122TestnetAddendum3 = () => {
  const meta = {
    version: "v2",
    title: "VIP-122 WBNB Price Configuration",
    description: `
    Configure Price Feed for WBNB Market
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
          signature: "setTokenConfig((address,address,uint256))",
          params: [[asset.address, asset.feed, MAX_STALE_PERIOD]],
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
