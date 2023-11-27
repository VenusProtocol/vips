import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const RESILIENT_ORACLE = "0x6592b5DE802159F3E74B2486b091D11a8256ab8A";
const NEW_RESILIENT_ORACLE_IMPLEMENTATION = "0xB5d7A073d77102ad56B7482b18E7204c1a71C8B9";
const DEFAULT_PROXY_ADMIN = "0x1BB765b741A5f3C2A338369DAb539385534E3343";

const REDSTONE_ORACLE = "0x8455EFA4D7Ff63b8BFD96AdD889483Ea7d39B70a";
const BOUND_VALIDATOR = "0x6E332fF0bB52475304494E4AE5063c1051c7d735";
const ACM = "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555";
const TRX = "0xCE7de646e7208a4Ef112cb6ed5038FA6cC6b12e3";
const TRX_OLD = "0x85EAC5Ac2F758618dFa09bDbe0cf174e7d574D5B";

const REDSTONE_TRX_FEED = "0xa17362dd9ad6d0af646d7c8f8578fddbfc90b916";

const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const FAST_TRACK_TIMELOCK = "0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02";
const CRITICAL_TIMELOCK = "0x213c446ec11e45b15a6E29C1C1b402B8897f606d";

const PRICE_LOWER_BOUND = parseUnits("0.99", 18);
const PRICE_UPPER_BOUND = parseUnits("1.01", 18);
const PIVOT_ORACLE_ROLE = 1;
const MAX_STALE_PERIOD = 60 * 25;

export const vip211 = (maxStalePeriod?: number) => {
  const meta = {
    version: "v2",
    title: "VIP-211 Set RedStone as the PIVOT oracle for TRX and TRX_OLD",
    description: `#### Summary

If passed, this VIP will perform the following actions:

- Configure [RedStone](https://redstone.finance/) as the PIVOT oracle of the [TRX](https://app.venus.io/#/core-pool/market/0xC5D3466aA484B040eE977073fcF337f2c00071c1) and [TRX_OLD](https://app.venus.io/#/core-pool/market/0x61eDcFe8Dd6bA3c891CB9bEc2dc7657B3B422E93) tokens
- Upgrade the address of the BoundValidator contract used by the ResilientOracle contract

#### Description

Enabled at [VIP-123](https://app.venus.io/#/governance/proposal/123), Resilient Price Feeds is the logic used by the Venus Protocol to eliminate a single point of failure while fetching asset prices from on-chain sources. Read more about it in the [published documentation](https://docs-v4.venus.io/risk/resilient-price-oracle).

This VIP configures the price feed provided by [RedStone](https://redstone.finance/) as the PIVOT oracle of [TRX](https://app.venus.io/#/core-pool/market/0xC5D3466aA484B040eE977073fcF337f2c00071c1) and [TRX_OLD](https://app.venus.io/#/core-pool/market/0x61eDcFe8Dd6bA3c891CB9bEc2dc7657B3B422E93) tokens. The price obtained from the MAIN oracle of these tokens (currently Chainlink) will be compared with the PIVOT price, and it will be discarded if the difference is too large.

The difference in the prices will be considered too large if the ratio “pivot_price / main_price” is not between 0.99 and 1.01. These thresholds have been calculated analysing historical data of both (RedStone and Chainlink) price feeds. It can be modified in the future via VIP.

#### Security and additional considerations

There were not any changes in the deployed codebase. We applied the following security procedures for this upgrade:

- **Prices pre/post upgrade**: in a simulation environment, validating the asset prices pre-upgrade are the same as post-upgrade
- **Deployment on testnet**: the same setup has been deployed to testnet, and used in the Venus Protocol testnet deployment

#### Deployed contracts on main net

- [New ResilientOracle implementation](https://bscscan.com/address/0xB5d7A073d77102ad56B7482b18E7204c1a71C8B9)

#### References

- [Repository](https://github.com/VenusProtocol/oracle)
- [Simulation pre/post upgrade](https://github.com/VenusProtocol/vips/pull/93)
- [Deployment on testnet](https://testnet.bscscan.com/tx/0x38481a7f28d9ffb3bde1f32b4d78fd064c0496e8686619ff3d714808bf551486)
- [Snapshot with the RedStone proposal](https://snapshot.org/#/venus-xvs.eth/proposal/0xa9cb9de5934ef245bbbdfde5badfd2f5128879417ffada1278e96231e3f09818)
- [Community post with the RedStone proposal](https://community.venus.io/t/adding-redstone-oracles-to-the-venus-oracle-interface/3620)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [RESILIENT_ORACLE, NEW_RESILIENT_ORACLE_IMPLEMENTATION],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [REDSTONE_ORACLE, "setDirectPrice(address,uint256)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [REDSTONE_ORACLE, "setDirectPrice(address,uint256)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [REDSTONE_ORACLE, "setDirectPrice(address,uint256)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [REDSTONE_ORACLE, "setTokenConfig(TokenConfig)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [REDSTONE_ORACLE, "setTokenConfig(TokenConfig)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [REDSTONE_ORACLE, "setTokenConfig(TokenConfig)", CRITICAL_TIMELOCK],
      },
      {
        target: REDSTONE_ORACLE,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: REDSTONE_ORACLE,
        signature: "setTokenConfig((address,address,uint256))",
        params: [[TRX, REDSTONE_TRX_FEED, maxStalePeriod || MAX_STALE_PERIOD]],
      },
      {
        target: REDSTONE_ORACLE,
        signature: "setTokenConfig((address,address,uint256))",
        params: [[TRX_OLD, REDSTONE_TRX_FEED, maxStalePeriod || MAX_STALE_PERIOD]],
      },
      {
        target: BOUND_VALIDATOR,
        signature: "setValidateConfig((address,uint256,uint256))",
        params: [[TRX, PRICE_UPPER_BOUND, PRICE_LOWER_BOUND]],
      },
      {
        target: BOUND_VALIDATOR,
        signature: "setValidateConfig((address,uint256,uint256))",
        params: [[TRX_OLD, PRICE_UPPER_BOUND, PRICE_LOWER_BOUND]],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setOracle(address,address,uint8)",
        params: [TRX, REDSTONE_ORACLE, PIVOT_ORACLE_ROLE],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "enableOracle(address,uint8,bool)",
        params: [TRX, PIVOT_ORACLE_ROLE, true],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setOracle(address,address,uint8)",
        params: [TRX_OLD, REDSTONE_ORACLE, PIVOT_ORACLE_ROLE],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "enableOracle(address,uint8,bool)",
        params: [TRX_OLD, PIVOT_ORACLE_ROLE, true],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
