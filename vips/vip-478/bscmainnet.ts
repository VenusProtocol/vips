import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const vFDUSD = "0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba";

export const Actions = {
  MINT: 0,
  BORROW: 2,
  ENTER_MARKET: 7,
};

export const vip478 = () => {
  const meta = {
    version: "v2",
    title: "VIP-478",
    description: `description`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER,
        signature: "_setActionsPaused(address[],uint8[],bool)",
        params: [[vFDUSD], [Actions.MINT, Actions.BORROW, Actions.ENTER_MARKET], false],
      },
    ],
    meta,
    ProposalType.CRITICAL,
  );
};

export default vip478;
