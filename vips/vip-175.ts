import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

export const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const VTUSD = "0xBf762cd5991cA1DCdDaC9ae5C638F5B5Dc3Bee6E";

export const vip175 = () => {
  const meta = {
    version: "v2",
    title: "VIP-175 Risk Parameters Adjustments",
    description: `#### Summary

This VIP will perform the following Risk Parameters actions as per Chaos Labs latest recommendations in this Venus community forum publication: [Risk Parameter Updates 09/18/2023](https://community.venus.io/t/chaos-labs-risk-parameter-updates-09-18-2023/3808)

- Increase supply cap of **TUSD** to 5,000,000 TUSD
- Increase borrow cap of **TUSD** to 4,000,000 TUSD

Complete analysis and details of these recommendations are available in the above publication.

VIP simulation: [https://github.com/VenusProtocol/vips/pull/75](https://github.com/VenusProtocol/vips/pull/75)
`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[VTUSD], [parseUnits("5000000", 18)]],
      },

      {
        target: COMPTROLLER,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[VTUSD], [parseUnits("4000000", 18)]],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
