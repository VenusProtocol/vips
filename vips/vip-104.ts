import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const COMPTROLLER = "0xfd36e2c2a6789db23113685031d7f16329158384";
const NEW_VTRX = "0xC5D3466aA484B040eE977073fcF337f2c00071c1";
const OLD_VTRX = "0x61eDcFe8Dd6bA3c891CB9bEc2dc7657B3B422E93";
const VDAI = "0x334b3eCB4DCa3593BCCC3c7EBD1A1C1d1780FBF1";
const VSXP = "0x2fF3d0F6990a40261c66E1ff2017aCBc282EB6d0";

export const vip104 = () => {
  const meta = {
    version: "v2",
    title: "VIP-104 Gauntlet Recommendations",
    description: `
      TRXOLD: Decrease CF to 0.20 (conservative)
      SXP: lower collateral factor to 17.5%
      TRX: (aggressive)
      * Increase CF to 0.45
      * Increase Borrow Cap to 8,000,000
      * Increase Supply Cap to 10,000,000
      DAI: Increase borrow cap to 7,500,000 (from 7 millions)
      `,
    forDescription: "I agree that Venus Protocol should proceed with the Gauntlet's Recommendations",
    againstDescription: "I do not think that Venus Protocol should proceed with the Gauntlet's Recommendations",
    abstainDescription:
      "I am indifferent to whether Venus Protocol proceeds with the Gauntlet's Recommendations or not",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER,
        signature: "_setCollateralFactor(address,uint256)",
        params: [OLD_VTRX, parseUnits("0.2", 18)],
      },

      {
        target: COMPTROLLER,
        signature: "_setCollateralFactor(address,uint256)",
        params: [NEW_VTRX, parseUnits("0.45", 18)],
      },

      {
        target: COMPTROLLER,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [
          [NEW_VTRX, VDAI],
          ["8000000000000", parseUnits("7500000", 18)],
        ],
      },
      {
        target: COMPTROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[NEW_VTRX], ["10000000000000"]],
      },

      {
        target: COMPTROLLER,
        signature: "_setCollateralFactor(address,uint256)",
        params: [VSXP, parseUnits("0.175", 18)],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
