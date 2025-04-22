import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;
export const vCAKE = "0x86aC3974e2BD0d60825230fa6F355fF11409df5c";
export const BORROW_CAP = parseUnits("19200000", 18);

const vip485 = () => {
  const meta = {
    version: "v2",
    title: "VIP-485",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: bscmainnet.UNITROLLER,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[vCAKE], [BORROW_CAP]],
      },
    ],
    meta,
    ProposalType.CRITICAL,
  );
};

export default vip485;
