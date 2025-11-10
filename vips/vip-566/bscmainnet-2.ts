import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { CORE_MARKETS } from "./bscmainnet";

export const vip566Mainnet2 = () => {
  const meta = {
    version: "v2",
    title: "VIP-566: Enable flash loan feature for all markets on BSC Mainnet",
    description: "Upgrade contracts and enable flash loans on BSC Mainnet.",
    forDescription: "Execute",
    againstDescription: "Do not execute",
    abstainDescription: "Abstain",
  };
  return makeProposal(
    [
      // Enable flash loans for all core markets
      ...CORE_MARKETS.map(vToken => ({
        target: vToken.address,
        signature: "setFlashLoanEnabled(bool)",
        params: [true],
      })),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip566Mainnet2;
