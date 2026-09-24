import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const bscmainnet = NETWORK_ADDRESSES.bscmainnet;

export const vU = "0x3d5E269787d562b74aCC55F18Bd26C5D09Fa245E";

export const vip581GuardianAddendum = () => {
  const meta = {
    version: "v2",
    title: "VIP-581 [BNB Chain] New U markets in the Core pool",
    description: `This proposal enables borrowing on the vU market in the Core pool, as per VIP-581.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // borrow allowed
      {
        target: bscmainnet.UNITROLLER,
        signature: "setIsBorrowAllowed(uint96,address,bool)",
        params: [0, vU, true],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip581GuardianAddendum;
