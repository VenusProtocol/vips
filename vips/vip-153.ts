import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

// FLOKI
export const GameFi_Comptroller = "0x1b43ea8622e76627B81665B1eCeBB4867566B963";
export const GameFi_VFLOKI = "0xc353B7a1E13dDba393B5E120D4169Da7185aA2cb";

const supplyCapFloki: number = 68_000_000_000;
export const NEW_SUPPLY_CAP_FLOKI = parseUnits(supplyCapFloki.toString(), 9); // scaled

const borrowCapFloki: number = 22_000_000_000;
export const NEW_BORROW_CAP_FLOKI = parseUnits(borrowCapFloki.toString(), 9); // scaled

// STKBNB
export const LiquidStakedBNB_Comptroller = "0xd933909A4a2b7A4638903028f44D1d38ce27c352";
export const LiquidStakedBNB_VstkBNB = "0xcc5D9e502574cda17215E70bC0B4546663785227";
export const NEW_BORROW_CAP_stkBNB = parseUnits("580", 18); // scaled

export const vip153 = () => {
  const meta = {
    version: "v2",
    title: "VIP-153 Risk Parameters Update",
    description: `Chaos labs recommendations for parameter updates
    FLOKI:
      Supply cap: from 44,000,000,000 to 68,000,000,000
      Borrow cap: from 11,000,000,000 to 22,000,000,000
    stkBNB
      Borrow cap: from 290 to 580
  `,
    forDescription: "I agree that Venus Protocol should proceed with the Risk Parameters Update's",
    againstDescription: "I do not think that Venus Protocol should proceed with the Risk Parameters Update's",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with the Risk Parameters Update's or not",
  };

  return makeProposal(
    [
      {
        target: GameFi_Comptroller,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [[GameFi_VFLOKI], [NEW_SUPPLY_CAP_FLOKI]],
      },
      {
        target: GameFi_Comptroller,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [[GameFi_VFLOKI], [NEW_BORROW_CAP_FLOKI]],
      },
      {
        target: LiquidStakedBNB_Comptroller,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [[LiquidStakedBNB_VstkBNB], [NEW_BORROW_CAP_stkBNB]],
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};
