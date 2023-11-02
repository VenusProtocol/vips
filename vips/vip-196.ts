import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const VCAKE = "0x86aC3974e2BD0d60825230fa6F355fF11409df5c";
const VWBETH = "0x6CFdEc747f37DAf3b87a35a1D9c8AD3063A1A8A0";

export const vip196 = () => {
  const meta = {
    version: "v2",
    title: "VIP-197 Risk Parameters Adjustments (CAKE and WBETH)",
    description: `#### Description

This VIP will perform the following Risk Parameters actions as per Chaos Labs latest recommendations in this Venus community forum publication: [Risk Parameter Updates 10/31/2023](https://community.venus.io/t/chaos-labs-risk-parameter-updates-10-31-2023/3874).

- **CAKE** (Core pool)
    - Increase supply cap to 14M (from 7M)
- **WBETH** (Core pool)
    - Increase Collateral Factor to 0.8 (from 0.7)

Complete analysis and details of these recommendations are available in the above publication.

VIP simulation: https://github.com/VenusProtocol/vips/pull/101`,

    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[VCAKE], [parseUnits("14000000", 18)]],
      },

      {
        target: COMPTROLLER,
        signature: "_setCollateralFactor(address,uint256)",
        params: [VWBETH, parseUnits(".80", 18)],
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};
