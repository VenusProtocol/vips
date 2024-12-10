import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const IRM = "0x4E026f23f65EA7ad206886F91f74B79adBA2bc62";
export const VBNB_ADMIN = "0x9A7890534d9d91d473F28cB97962d176e2B65f1d";
export const RF = parseUnits("0.30", 18);
export const GAMEFI_COMPTROLLER = "0x1b43ea8622e76627B81665B1eCeBB4867566B963";
export const vFLOKI = "0xc353B7a1E13dDba393B5E120D4169Da7185aA2cb";
export const BORROW_CAP = parseUnits("8000000000", 9);

const vip403 = () => {
  const meta = {
    version: "v2",
    title: "VIP-403",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: VBNB_ADMIN,
        signature: "setInterestRateModel(address)",
        params: [IRM],
      },
      {
        target: VBNB_ADMIN,
        signature: "_setReserveFactor(uint256)",
        params: [RF],
      },
      {
        target: GAMEFI_COMPTROLLER,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [[vFLOKI], [BORROW_CAP]],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip403;
