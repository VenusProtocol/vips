import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const ACM = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";

const REDSTONE_ORACLE = "0x0Af51d1504ac5B711A9EAFe2fAC11A51d32029Ad";
const RESILIENT_ORACLE = "0x3cD69251D04A28d887Ac14cbe2E14c52F3D57823";
const BOUND_VALIDATOR = "0x2842140e4Ad3a92e9af30e27e290300dd785076d";

const TRX = "0x7D21841DC10BA1C5797951EFc62fADBBDD06704B";
const TRX_OLD = "0x19E7215abF8B2716EE807c9f4b83Af0e7f92653F";

const REDSTONE_TRX_FEED = "0x50db815d3c4b869f89925690e936ed85b0b76075";

const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const FAST_TRACK_TIMELOCK = "0x3CFf21b7AF8390fE68799D58727d3b4C25a83cb6";
const CRITICAL_TIMELOCK = "0x23B893a7C45a5Eb8c8C062b9F32d0D2e43eD286D";

const PRICE_LOWER_BOUND = parseUnits("0.99", 18);
const PRICE_UPPER_BOUND = parseUnits("1.01", 18);
const PIVOT_ORACLE_ROLE = 1;
const MAX_STALE_PERIOD = 60 * 60 * 24; // 1 day

export const vip190 = () => {
  const meta = {
    version: "v2",
    title: "VIP-190 Setup RedStone oracle",
    description: `
      Setup RedStone as a pivot oracle for TRX and TRX_OLD markets
    `,
    forDescription: "I agree that Venus Protocol should proceed with this recommendation",
    againstDescription: "I do not think that Venus Protocol should proceed with this recommendation",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with this recommendation or not",
  };

  return makeProposal(
    [
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
        params: [[TRX, REDSTONE_TRX_FEED, MAX_STALE_PERIOD]],
      },
      {
        target: REDSTONE_ORACLE,
        signature: "setTokenConfig((address,address,uint256))",
        params: [[TRX_OLD, REDSTONE_TRX_FEED, MAX_STALE_PERIOD]],
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
