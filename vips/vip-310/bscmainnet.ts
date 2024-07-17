import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

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

const vip310 = (maxStalePeriod: number) => {
  const meta = {
    version: "v2",
    title: "VIP-310 Set RedStone as the MAIN oracle for BTC and BNB on BNB Chain",
    description: `#### Summary

If passed, this VIP will perform the following actions:

- Configure [RedStone](https://redstone.finance/) as the MAIN oracle of the [BTC](https://app.venus.io/#/core-pool/market/0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B) and [BNB](https://app.venus.io/#/core-pool/market/0xA07c5b74C9B40447a954e1466938b865b6BBea36) tokens on BNB Chain
- Configure [Chainlink](https://chain.link/) as the PIVOT and FALLBACK oracles for BTC and BNB tokenson BNB chain

#### Description

Enabled at [VIP-123](https://app.venus.io/#/governance/proposal/123), Resilient Price Feeds is the logic used by the Venus Protocol to eliminate a single point of failure while fetching asset prices from on-chain sources. Read more about it in the [published documentation](https://docs-v4.venus.io/risk/resilient-price-oracle).

This VIP configures the price feed provided by [RedStone](https://redstone.finance/) as the MAIN oracle of the [BTC](https://app.venus.io/#/core-pool/market/0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B) and [BNB](https://app.venus.io/#/core-pool/market/0xA07c5b74C9B40447a954e1466938b865b6BBea36) tokens on BNB Chain. Chainlink will be configured as the PIVOT and FALLBACK oracles. Therefore, on every transaction, by default the USD price for BTC and BNB provided by RedStone will be used, but if the discrepancy with the prices provided by Chainlink are greater than a configured threshold, then the Chainlink prices will be used.

The difference in the prices will be considered too large if the ratio “pivot_price / main_price” is not between 0.99 and 1.01. These thresholds can be modified in the future via VIP.

Example 1:

- RedStone price for BTC: $71,016
- Chainlink price for BTC: $70,979
- Ratio ($70,979 / $71,016): 0.9994. In [0.99, 1.01]
- So, the RedStone price ($71,016) will be used

Example 2:

- RedStone price for BTC: $71,016
- Chainlink price for BTC: $70,200
- Ratio ($70,200 / $71,016): 0.988. Not in [0.99, 1.01]
- So, the Chainlink price ($70,200) will be used

#### Security and additional considerations

There were not any changes in the deployed codebase. We applied the following security procedures for this upgrade:

- **Prices pre/post upgrade**: in a simulation environment, validating the asset token configurations on the ResilientOracle system is the expected one
- **Fork tests**: specific fork tests simulating different bounds, and verifying the expected behaviour

Price feeds on BNB Chain

- RedStone
    - BNB: [0x8dd2D85C7c28F43F965AE4d9545189C7D022ED0e](https://bscscan.com/address/0x8dd2D85C7c28F43F965AE4d9545189C7D022ED0e)
    - BTC: [0xa51738d1937FFc553d5070f43300B385AA2D9F55](https://bscscan.com/address/0xa51738d1937FFc553d5070f43300B385AA2D9F55)
- Chainlink
    - BNB: [0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE](https://bscscan.com/address/0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE)
    - BTC: [0x264990fbd0A4796A3E3d8E37C4d5F87a3aCa5Ebf](https://bscscan.com/address/0x264990fbd0A4796A3E3d8E37C4d5F87a3aCa5Ebf)

#### References

- [Repository](https://github.com/VenusProtocol/oracle)
- [Simulation pre/post upgrade](https://github.com/VenusProtocol/vips/pull/291)
- [Snapshot with the RedStone proposal](https://snapshot.org/#/venus-xvs.eth/proposal/0x64df1a9299a5a46719f6dfb1670fd01b2926d89a546c6e726cd10d0b59a11bdb)
- [Community post with the RedStone proposal](https://community.venus.io/t/xvs-usd-price-feed-enabling-venus-launch-on-arbiturm-ethereum-xvs-feed-maintenance-and-enhancing-resilientoracle-module/4333)
- [Chainlink oracle on BNB Chain](https://bscscan.com/address/0x1B2103441A0A108daD8848D8F5d790e4D402921F)
- [RedStone oracle on BNB Chain](https://bscscan.com/address/0x8455EFA4D7Ff63b8BFD96AdD889483Ea7d39B70a)
- [Fork tests](https://github.com/VenusProtocol/oracle/pull/194)`,
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

export default vip310;
