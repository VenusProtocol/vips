import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const VCAKE = "0x86aC3974e2BD0d60825230fa6F355fF11409df5c";

export const vip218 = () => {
  const meta = {
    version: "v2",
    title: "VIP-218 Risk Parameters Adjustments (CAKE)",
    description: `#### Description

This VIP will perform the following Risk Parameters actions as per Chaos Labs latest recommendations in this Venus community forum publication: [Risk Parameter Updates - 12/13/23](https://community.venus.io/t/chaos-labs-risk-parameter-updates-12-13-23/3969).

- **CAKE** (Core pool)
    - Increase supply cap to 21M (from 14M)

Complete analysis and details of these recommendations are available in the above publication.

VIP simulation: <PR link>`,

    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[VCAKE], [parseUnits("21000000", 18)]],
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};
