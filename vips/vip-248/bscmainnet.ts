import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const vFDUSD = "0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba";

export const FDUSD_SUPPLY = parseUnits("15000000", 18);
export const OLD_FDUSD_SUPPLY = parseUnits("10000000", 18);

export const vip248 = () => {
  const meta = {
    version: "v2",
    title: "VIP-248 Risk Parameters Adjustments (FDUSD)",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[vFDUSD], [FDUSD_SUPPLY]],
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};

export default vip248;
