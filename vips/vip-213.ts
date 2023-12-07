import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const COMPTROLLER_CORE = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const COMPTROLLER_DEFI = "0x3344417c9360b963ca93A4e8305361AEde340Ab9";
const VMATIC = "0x5c9476FcD6a4F9a3654139721c949c2233bBbBc8";
const VPLANET = "0xFf1112ba7f88a53D4D23ED4e14A117A2aE17C6be";

export const vip213 = () => {
  const meta = {
    version: "v2",
    title: "VIP-213 Risk Parameters Adjustments (MATIC and PLANET)",
    description: `This VIP will perform the following Risk Parameter actions as per Chaos Labs’ latest recommendations in this Venus community forum publication: [Risk Parameter Updates 12/06/2023](https://community.venus.io/t/chaos-labs-risk-parameter-updates-12-06-23/3958).

- [MATIC (Core pool)](https://bscscan.com/address/0x5c9476FcD6a4F9a3654139721c949c2233bBbBc8)
    - Increase supply cap to 16,000,000 MATIC (from 8,000,000 MATIC)
- [PLANET (DeFi pool)](https://bscscan.com/address/0xFf1112ba7f88a53D4D23ED4e14A117A2aE17C6be)
    - Increase supply cap to 4,000,000,000 PLANET (from 2,000,000,000 PLANET)
    - Increase borrow cap to 1,500,000,000 PLANET (from 1,000,000,000 PLANET)

Complete analysis and details of these recommendations are available in the above publication.

VIP simulation: [https://github.com/VenusProtocol/vips/pull/122](https://github.com/VenusProtocol/vips/pull/122)`,

    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER_CORE,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[VMATIC], [parseUnits("16000000", 18)]],
      },

      {
        target: COMPTROLLER_DEFI,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [[VPLANET], [parseUnits("4000000000", 18)]],
      },

      {
        target: COMPTROLLER_DEFI,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [[VPLANET], [parseUnits("1500000000", 18)]],
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};
