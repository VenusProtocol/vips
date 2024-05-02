import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const vFDUSD = "0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba";
export const vFIL = "0xf91d58b5aE142DAcC749f58A49FCBac340Cb0343";
export const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";

export const vip300 = () => {
  const meta = {
    version: "v2",
    title: "VIP-300 Risk Parameters Adjustments (FDUSD, FIL)",
    description: `This VIP will perform the following Risk Parameter actions as per Chaos Labs’ latest recommendations in this Venus community forum publication: [Chaos Labs - Risk Parameter Updates - 04/30/24](https://community.venus.io/t/chaos-labs-risk-parameter-updates-04-30-24/4306).

- [FDUSD (Core pool)](https://bscscan.com/address/0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba)
    - Increase supply cap, from 30M to 40M FDUSD
    - Increase borrow cap, from 24M to 34M FDUSD
- [FIL (Core pool)](https://bscscan.com/address/0xf91d58b5aE142DAcC749f58A49FCBac340Cb0343)
    - Increase supply cap, from 908,500 to 1.2M FIL

Complete analysis and details of these recommendations are available in the above publication.

VIP simulation: [https://github.com/VenusProtocol/vips/pull/276](https://github.com/VenusProtocol/vips/pull/276)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [
          [vFDUSD, vFIL],
          [parseUnits("40000000", 18), parseUnits("1200000", 18)],
        ],
      },

      {
        target: COMPTROLLER,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[vFDUSD], [parseUnits("34000000", 18)]],
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};

export default vip300;
