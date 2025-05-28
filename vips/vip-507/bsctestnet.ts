import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const vBNB = "0x2E7222e51c0f6e98610A1543Aa3836E092CDe62c";
export const vBNB_ADMIN = "0x04109575c1dbB4ac2e59e60c783800ea10441BBe";
export const newRF = parseUnits("0.3", 18);

export const vip507 = () => {
  const meta = {
    version: "v2",
    title: "VIP-507 Update RF of vBNB",
    description: `VIP-507 Update RF of vBNB`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: vBNB_ADMIN,
        signature: "_setReserveFactor(uint256)",
        params: [newRF],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip507;
