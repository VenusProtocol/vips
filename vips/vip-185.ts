import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

export const LIQUID_STAKED_BNB_COMPTROLLER = "0xd933909A4a2b7A4638903028f44D1d38ce27c352";
export const VSNBNB = "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A";
export const SNBNB_NEW_SUPPLY_CAP = parseUnits("3000", 18);
export const SNBNB_NEW_BORROW_CAP = parseUnits("800", 18);

export const STABLECOIN_COMPTROLLER = "0x94c1495cD4c557f1560Cbd68EAB0d197e6291571";
export const VAGEUR = "0x795DE779Be00Ea46eA97a28BDD38d9ED570BCF0F";
export const AGEUR_NEW_SUPPLY_CAP = parseUnits("250000", 18);
export const AGEUR_NEW_BORROW_CAP = parseUnits("200000", 18);

export const vip185 = () => {
  const meta = {
    version: "v2",
    title: "VIP-185 Risk Parameters Adjustments (SnBNB and agEUR)",
    description: `#### Description

This VIP will perform the following Risk Parameters actions as per Chaos Labs latest recommendations in this Venus community forum publication: [Risk Parameter Updates 10/09/2023](https://community.venus.io/t/chaos-labs-risk-parameter-updates-10-09-2023/3837)

- **SnBNB** (Liquid Staked BNB pool)
    - Increase supply cap to 3,000 SnBNB
    - Increase borrow cap to 800 SnBNB
- **agEUR** (Stablecoins pool)
    - Increase supply cap to 250,000 agEUR
    - Increase borrow cap to 200,000 agEUR

Complete analysis and details of these recommendations are available in the above publication.

VIP simulation: https://github.com/VenusProtocol/vips/pull/86`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: LIQUID_STAKED_BNB_COMPTROLLER,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [[VSNBNB], [SNBNB_NEW_SUPPLY_CAP]],
      },

      {
        target: LIQUID_STAKED_BNB_COMPTROLLER,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [[VSNBNB], [SNBNB_NEW_BORROW_CAP]],
      },
      {
        target: STABLECOIN_COMPTROLLER,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [[VAGEUR], [AGEUR_NEW_SUPPLY_CAP]],
      },

      {
        target: STABLECOIN_COMPTROLLER,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [[VAGEUR], [AGEUR_NEW_BORROW_CAP]],
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};
