import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const COMPTROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
const ACM = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";

const CHAINLINK_ORACLE = "0xfc4e26B7fD56610E84d33372435F0275A359E8eF";
const RESILIENT_ORACLE = "0xD9D16795A92212662a2D44AAc810eC68fdE61076";
const BOUND_VALIDATOR = "0x84e96554776607E5Ba78aeC299a81b70D03a53D6";
const PYTH_ORACLE = "0xcBF6db3DC2f3F8e3552b12B564a8Faf74B64DaeA";
const TWAP_ORACLE = "0x49be570231a5b9EfB0359CfC781EfDf5359dcD51";
const BINANCE_ORACLE = "0x4aB96DCDE8c617FBBF95A381fDb21Fb49551ec63";

const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const FAST_TRACK_TIMELOCK = "0x3CFf21b7AF8390fE68799D58727d3b4C25a83cb6";
const CRITICAL_TIMELOCK = "0x23B893a7C45a5Eb8c8C062b9F32d0D2e43eD286D";

interface AssetConfig {
  name: string;
  address: string;
  feed: string;
}

const ASSETS: AssetConfig[] = [
  {
    name: "TUSD",
    address: "0x3a00d9b02781f47d033bad62edc55fbf8d083fb0",
    feed: "0xC6222C9fA907B9Ed797d6feA08139cDABd14bcB9",
  },
];

const MAX_STALE_PERIOD = 60 * 60 * 24; // 24 hours

export const vip111Testnet = () => {
  const meta = {
    version: "v2",
    title: "VIP-111 TUSD Price Configuration",
    description: `
    Configure Price Feed for TUSD
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
