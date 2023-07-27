import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const VTUSDOLD = "0x08CEB3F4a7ed3500cA0982bcd0FC7816688084c3";
const VTRXOLD = "0x61edcfe8dd6ba3c891cb9bec2dc7657b3b422e93";
const VTRXOLD_RATE_MODEL = "0x8A1638927f4351F4a2fCca1fB30599c0b8Dc28f6";
const VTUSDOLD_RATE_MODEL = "0xf8923c101d39584387FE5adE1f2230687D7D5a22";

export const vip149 = () => {
  const meta = {
    version: "v2",
    title: "VIP-149 Risk Parameters Update",
    description: `

  Changes to do
  Asset    Current_Kink New_Kink
    TUSDOLD  0.8           0.4
    TRXOLD   0.6           0.01`,

    forDescription: "I agree that Venus Protocol should proceed with the Risk Parameters Update's",
    againstDescription: "I do not think that Venus Protocol should proceed with the Risk Parameters Update's",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with the Risk Parameters Update's or not",
  };

  return makeProposal(
    [
      {
        target: VTRXOLD,
        signature: "_setInterestRateModel(address)",
        params: [VTRXOLD_RATE_MODEL],
      },

      {
        target: VTUSDOLD,
        signature: "_setInterestRateModel(address)",
        params: [VTUSDOLD_RATE_MODEL],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
