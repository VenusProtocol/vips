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
    title: "VIP-482",
    description: ``,
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
