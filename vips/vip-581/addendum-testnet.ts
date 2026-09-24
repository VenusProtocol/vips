import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const bsctestnet = NETWORK_ADDRESSES.bsctestnet;

export const vU = "0x93969F17d4c1C7B22000eA26D5C2766E0f616D90";

export const vip581AddendumTestnet = () => {
  const meta = {
    version: "v2",
    title: "VIP-581-addendum Enable borrowing on vU market in the Core pool",
    description: `This proposal enables borrowing on the vU market in the Core pool, as per VIP-581.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // borrow allowed
      {
        target: bsctestnet.UNITROLLER,
        signature: "setIsBorrowAllowed(uint96,address,bool)",
        params: [0, vU, true],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip581AddendumTestnet;
