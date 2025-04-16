import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const SolvBTC_REDSTONE_FEED = "0xa51738d1937FFc553d5070f43300B385AA2D9F55";
export const SolvBTC_CHAINLINK_FEED = "0x264990fbd0A4796A3E3d8E37C4d5F87a3aCa5Ebf";
export const SolvBTC = "0x4aae823a6a0b376De6A78e74eCC5b079d38cBCf7";
export const BOUND_VALIDATOR = "0x6E332fF0bB52475304494E4AE5063c1051c7d735";
export const NEW_SPPLY_CAP = parseUnits("14500000", 18);
export const NEW_BORROW_CAP = parseUnits("8000000", 18);
export const vTHE = "0x86e06EAfa6A1eA631Eab51DE500E3D474933739f";

const UPPER_BOUND_RATIO = parseUnits("1.01", 18);
const LOWER_BOUND_RATIO = parseUnits("0.99", 18);
const MAX_STALE_PERIOD = 100;

const { RESILIENT_ORACLE, UNITROLLER, REDSTONE_ORACLE, CHAINLINK_ORACLE } = NETWORK_ADDRESSES.bscmainnet;

const vip479 = (maxStalePeriod?: number) => {
  const meta = {
    version: "v2",
    title: "VIP-482 Risk Parameters Adjustments (SolvBTC, THE)",
    description: `#### Summary

This VIP will perform the following Risk Parameter actions as per Chaos Labs recommendations:

- [Chaos Labs - Risk Parameter Updates - 04/15/25](https://community.venus.io/t/chaos-labs-risk-parameter-updates-04-15-25/5045):
    - [THE (Core pool) / BNB Chain](https://app.venus.io/#/core-pool/market/0x86e06EAfa6A1eA631Eab51DE500E3D474933739f?chainId=56): increase supply cap from 12M to 14.5M, and borrow cap from 6M to 8M
- [Configure BTC/USD Feed as Oracle Source for SolvBTC in the Venus Core Pool](https://community.venus.io/t/configure-btc-usd-feed-as-oracle-source-for-solvbtc-in-the-venus-core-pool/5038/3)
    - Configuring the BTC/USD feeds as the price oracles for [SolvBTC in the Venus Core Pool](https://app.venus.io/#/core-pool/market/0xf841cb62c19fCd4fF5CD0AaB5939f3140BaaC3Ea?chainId=56) on BNB Chain

#### Description

The new oracle configuration set for SolvBTC is the same one used for BTCB on BNB Chain:

- Main oracle: [RedStoneOracle](https://bscscan.com/address/0x8455EFA4D7Ff63b8BFD96AdD889483Ea7d39B70a)
    - Feed: 0xa51738d1937FFc553d5070f43300B385AA2D9F55
    - Max staled period: 100 seconds
- Pivot and fallback oracle: [ChainlinkOracle](https://bscscan.com/address/0x1B2103441A0A108daD8848D8F5d790e4D402921F)
    - Feed: 0x264990fbd0A4796A3E3d8E37C4d5F87a3aCa5Ebf
    - Max stale period: 100 seconds
- Bound validator:
    - Upper bound: 1.01
    - Lower bound: 0.99

Complete analysis and details of these recommendations are available in the above publications.

VIP simulation: [https://github.com/VenusProtocol/vips/pull/539](https://github.com/VenusProtocol/vips/pull/539)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: REDSTONE_ORACLE,
        signature: "setTokenConfig((address,address,uint256))",
        params: [[SolvBTC, SolvBTC_REDSTONE_FEED, maxStalePeriod || MAX_STALE_PERIOD]],
      },
      {
        target: CHAINLINK_ORACLE,
        signature: "setTokenConfig((address,address,uint256))",
        params: [[SolvBTC, SolvBTC_CHAINLINK_FEED, maxStalePeriod || MAX_STALE_PERIOD]],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [[SolvBTC, [REDSTONE_ORACLE, CHAINLINK_ORACLE, CHAINLINK_ORACLE], [true, true, true]]],
      },
      {
        target: BOUND_VALIDATOR,
        signature: "setValidateConfig((address,uint256,uint256))",
        params: [[SolvBTC, UPPER_BOUND_RATIO, LOWER_BOUND_RATIO]],
      },
      {
        target: UNITROLLER,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[vTHE], [NEW_BORROW_CAP]],
      },
      {
        target: UNITROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[vTHE], [NEW_SPPLY_CAP]],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip479;
