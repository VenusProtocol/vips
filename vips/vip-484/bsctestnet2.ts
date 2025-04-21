import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const VBNB_ADMIN = "0x04109575c1dbB4ac2e59e60c783800ea10441BBe";
export const RF = parseUnits("0.1", 18);

const vip484 = () => {
  const meta = {
    version: "v2",
    title: "VIP-484 Update RF of vBNB",
    description: `VIP-484 Update RF of vBNB`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: VBNB_ADMIN,
        signature: "_setReserveFactor(uint256)",
        params: [RF],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip484;
