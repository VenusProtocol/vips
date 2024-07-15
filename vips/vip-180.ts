import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const LIQUID_STAKED_BNB_COMPTROLLER = "0xd933909A4a2b7A4638903028f44D1d38ce27c352";
export const VSNBNB = "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A";
export const SNBNB_NEW_SUPPLY_CAP = parseUnits("2000", 18);
export const SNBNB_NEW_BORROW_CAP = parseUnits("400", 18);

export const CORE_POOL_COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const VMATIC = "0x5c9476fcd6a4f9a3654139721c949c2233bbbbc8";
export const MATIC_NEW_SUPPLY_CAP = parseUnits("8000000", 18);
export const MATIC_NEW_BORROW_CAP = parseUnits("3000000", 18);

export const vip180 = () => {
  const meta = {
    version: "v2",
    title: "VIP-180 Risk Parameters Adjustments",
    description: `This VIP will perform the following Risk Parameters actions as per Chaos Labs latest recommendations in this Venus community forum publication: [Risk Parameter Updates 10/02/2023](https://community.venus.io/t/chaos-labs-risk-parameter-updates-10-02-2023/3831)

- **SnBNB** (Liquid Staked BNB pool)
    - Increase supply cap to 2,000 SnBNB
    - Increase borrow cap to 400 SnBNB
- **MATIC** (Core pool)
    - Increase supply cap to 8,000,000 MATIC
    - Increase borrow cap to 3,000,000 MATIC

Complete analysis and details of these recommendations are available in the above publication.

VIP simulation: https://github.com/VenusProtocol/vips/pull/84
`,
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
        target: CORE_POOL_COMPTROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[VMATIC], [MATIC_NEW_SUPPLY_CAP]],
      },

      {
        target: CORE_POOL_COMPTROLLER,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[VMATIC], [MATIC_NEW_BORROW_CAP]],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
