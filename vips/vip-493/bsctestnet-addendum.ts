import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const { UNITROLLER } = NETWORK_ADDRESSES.bsctestnet;

export const VUSD1 = "0x519e61D2CDA04184FB086bbD2322C1bfEa0917Cf";

export const vip493Addendum = () => {
  const meta = {
    version: "v2",
    title: "VIP-493 [BNB Chain] Unpause enter market action for USD1 on Venus Core Pool",
    description: "",
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: UNITROLLER,
        signature: "_setActionsPaused(address[],uint8[],bool)",
        params: [[VUSD1], [7], false],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip493Addendum;
