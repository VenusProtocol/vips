import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const COMPTROLLER = "0xfd36e2c2a6789db23113685031d7f16329158384";
const NEW_VTRX = "0xC5D3466aA484B040eE977073fcF337f2c00071c1";
const OLD_VTRX = "0x61eDcFe8Dd6bA3c891CB9bEc2dc7657B3B422E93";
const VSXP = "0x2fF3d0F6990a40261c66E1ff2017aCBc282EB6d0";
const VUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
const VUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";

export const vip103 = () => {
  const meta = {
    version: "v2",
    title: "VIP-103 Gauntlet Rrecommendations",
    description: `
    TRXOLD. Conservative: Decrease CF to 0.30
    TRX. Aggressive:
    Increase CF to 0.40
    Increase Borrow Cap to 4,000,000
    Increase Supply Cap to 5,000,000
    SXP. Lower SXP’s collateral factor to 0.25
    USDC. Increase borrow cap to 124,700,000
    USDT. Increase borrow cap to 245,500,000

    `,
    forDescription: "I agree that Venus Protocol should proceed with the Gauntlet Rrecommendations",
    againstDescription: "I do not think that Venus Protocol should proceed with the Gauntlet Rrecommendations",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with the Gauntlet Rrecommendations or not",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER,
        signature: "_setCollateralFactor(address,uint256)",
        params: [OLD_VTRX, parseUnits("0.3", 18)],
      },

      {
        target: COMPTROLLER,
        signature: "_setCollateralFactor(address,uint256)",
        params: [NEW_VTRX, parseUnits("0.4", 18)],
      },
      {
        target: COMPTROLLER,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [
          [NEW_VTRX, VUSDC, VUSDT],
          ["4000000000000", "124700000000000000000000000", "245500000000000000000000000"],
        ],
      },
      {
        target: COMPTROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[NEW_VTRX], ["5000000000000"]],
      },
      {
        target: COMPTROLLER,
        signature: "_setCollateralFactor(address,uint256)",
        params: [VSXP, parseUnits("0.25", 18)],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
