import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const RESILIENT_ORACLE = "0x6592b5DE802159F3E74B2486b091D11a8256ab8A";
export const CHAINLINK_ORACLE = "0x1B2103441A0A108daD8848D8F5d790e4D402921F";
export const REDSTONE_ORACLE = "0x8455EFA4D7Ff63b8BFD96AdD889483Ea7d39B70a";
export const BOUND_VALIDATOR = "0x6E332fF0bB52475304494E4AE5063c1051c7d735";

export const UPPER_BOUND_RATIO = parseUnits("1.01", 18);
export const LOWER_BOUND_RATIO = parseUnits("0.99", 18);

export const BTC = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c";
export const BNB = "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB";

export const MAX_STALE_PERIOD = 100;

export const BNB_FEED_REDSTONE = "0x8dd2D85C7c28F43F965AE4d9545189C7D022ED0e";
export const BTC_FEED_REDSTONE = "0xa51738d1937FFc553d5070f43300B385AA2D9F55";

export const BNB_FEED_CHAINLINK = "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE";
export const BTC_FEED_CHAINLINK = "0x264990fbd0A4796A3E3d8E37C4d5F87a3aCa5Ebf";

const vip306 = (maxStalePeriod: number) => {
  const meta = {
    version: "v2",
    title: "VIP-306 Set RedStone as the Main Oracle for BTC and BNB",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with this proposal",
  };

  return makeProposal(
    [
      {
        target: REDSTONE_ORACLE,
        signature: "setTokenConfig((address,address,uint256))",
        params: [[BTC, BTC_FEED_REDSTONE, maxStalePeriod || MAX_STALE_PERIOD]],
      },
      {
        target: REDSTONE_ORACLE,
        signature: "setTokenConfig((address,address,uint256))",
        params: [[BNB, BNB_FEED_REDSTONE, maxStalePeriod || MAX_STALE_PERIOD]],
      },
      {
        target: CHAINLINK_ORACLE,
        signature: "setTokenConfig((address,address,uint256))",
        params: [[BTC, BTC_FEED_CHAINLINK, maxStalePeriod || MAX_STALE_PERIOD]],
      },
      {
        target: CHAINLINK_ORACLE,
        signature: "setTokenConfig((address,address,uint256))",
        params: [[BNB, BNB_FEED_CHAINLINK, maxStalePeriod || MAX_STALE_PERIOD]],
      },
      {
        target: BOUND_VALIDATOR,
        signature: "setValidateConfig((address,uint256,uint256))",
        params: [[BTC, UPPER_BOUND_RATIO, LOWER_BOUND_RATIO]],
      },
      {
        target: BOUND_VALIDATOR,
        signature: "setValidateConfig((address,uint256,uint256))",
        params: [[BNB, UPPER_BOUND_RATIO, LOWER_BOUND_RATIO]],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [[BTC, [REDSTONE_ORACLE, CHAINLINK_ORACLE, CHAINLINK_ORACLE], [true, true, true]]],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [[BNB, [REDSTONE_ORACLE, CHAINLINK_ORACLE, CHAINLINK_ORACLE], [true, true, true]]],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip306;
