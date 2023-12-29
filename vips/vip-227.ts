import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const VUNI = "0x27FF564707786720C71A2e5c1490A63266683612";
const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";

export const vip227 = () => {
  const meta = {
    version: "v2",
    title: "VIP-227 Risk Parameters Adjustments (UNI)",
    description: `This VIP will perform the following Risk Parameter actions as per Chaos Labs’ latest recommendations in this Venus community forum publication: [Risk Parameter Updates 12/27/2023](https://community.venus.io/t/chaos-labs-risk-parameter-updates-12-27-23/4006).

- **[UNI (Core pool)](https://bscscan.com/address/0x27FF564707786720C71A2e5c1490A63266683612)**
    - Increase supply cap from 100,000 UNI to 200,000 UNI
    - Increase borrow cap from 50,000 UNI to 100,000 UNI

Complete analysis and details of these recommendations are available in the above publication.

VIP simulation: [https://github.com/VenusProtocol/vips/pull/149](https://github.com/VenusProtocol/vips/pull/149)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[VUNI], [parseUnits("200000", 18).toString()]],
      },
      {
        target: COMPTROLLER,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[VUNI], [parseUnits("100000", 18).toString()]],
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};
