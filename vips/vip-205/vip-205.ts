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

export const vip205 = (maxStalePeriod?: number) => {
  const meta = {
    version: "v2",
    title: "ResilientOracle Implementation Upgrade, and configuration for Redstone Oracle as Pivot for TRX and TRX_OLD",
    description:
      "Upgrades the implementation contract for resilient oracle in order to fix a wrong BoundValidator immutable variable. Also this VIP will Setup RedStone as a pivot oracle for TRX and TRX_OLD markets",
    forDescription:
      "I agree that Venus Protocol should proceed with upgrading Resilient Oracle implementation and Redstone oracle configuration for TRX and TRX_OLD",
    againstDescription:
      "I do not think that Venus Protocol should proceed with upgrading Resilient Oracle implementation  and Redstone oracle configuration for TRX and TRX_OLD",
    abstainDescription:
      "I am indifferent to whether Venus Protocol proceeds with upgrading Resilient Oracle implementation  and Redstone oracle configuration for TRX and TRX_OLD",
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
