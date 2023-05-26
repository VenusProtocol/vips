import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const COMPTROLLER = "0xfd36e2c2a6789db23113685031d7f16329158384";
const OLD_VTRX = "0x61eDcFe8Dd6bA3c891CB9bEc2dc7657B3B422E93";
const VSXP = "0x2fF3d0F6990a40261c66E1ff2017aCBc282EB6d0";

export const vip122 = () => {
  const meta = {
    version: "v2",
    title: "VIP-122 Risk Parameters Update",
    description: `
    SXP: Lower borrow cap and supply cap to 0

    TRXOLD: Lower borrow cap and supply cap to 0`,
    forDescription: "I agree that Venus Protocol should proceed with the Risk Parameters Update's",
    againstDescription: "I do not think that Venus Protocol should proceed with the Risk Parameters Update's",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with the Risk Parameters Update's or not",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [
          [OLD_VTRX, VSXP],
          [0, 0],
        ],
      },

      {
        target: COMPTROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [
          [OLD_VTRX, VSXP],
          [0, 0],
        ],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
