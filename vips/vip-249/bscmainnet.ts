import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const vFDUSD = "0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba";

export const FDUSD_SUPPLY = parseUnits("15000000", 18);
export const OLD_FDUSD_SUPPLY = parseUnits("10000000", 18);

export const vip249 = () => {
  const meta = {
    version: "v2",
    title: "VIP-249 Risk Parameters Adjustments (FDUSD)",
    description: `This VIP will perform the following Risk Parameter actions as per Chaos Labs’ latest recommendations in this Venus community forum publication: [Risk Parameter Updates 02/03/2024](https://community.venus.io/t/chaos-labs-risk-parameter-updates-02-03-24/4096).

- [FDUSD (Core pool)](https://bscscan.com/address/0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba)
    - Increase supply cap, from 10M FDUSD to 15M FDUSD

Complete analysis and details of these recommendations are available in the above publication.

VIP simulation: [https://github.com/VenusProtocol/vips/pull/197](https://github.com/VenusProtocol/vips/pull/197)`,
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

export default vip249;
