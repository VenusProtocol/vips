import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const VXVS = "0x151b1e2635a717bcdc836ecd6fbb62b674fe3e1d";
const VTRXOLD = "0x61edcfe8dd6ba3c891cb9bec2dc7657b3b422e93";
const VSXP = "0x2ff3d0f6990a40261c66e1ff2017acbc282eb6d0";
const VBETH = "0x972207a639cc1b374b893cc33fa251b55ceb7c07";
const VWBETH = "0x6cfdec747f37daf3b87a35a1d9c8ad3063a1a8a0";

const COMPTROLLER = "0xfd36e2c2a6789db23113685031d7f16329158384";
const VTRXOLD_RATE_MODEL = "0x75947FF33C8a7E154280100f37D82b60518BD74B";
const VSXP_RATE_MODEL = "0xDd0F61dc0eA1Cf49F54A181EE1A4896f46EB1E91";

export const vip130 = () => {
  const meta = {
    version: "v2",
    title: "VIP-130 Risk Parameters Update",
    description: `

  Changes to do
  XVS
    Raise supply cap to 1,500,000 from 1,300,000
  TRXOLD
    Raise base multiplier to 1.0 from .15 (Raise borrow APR to ~100%)
  SXP
    Raise base multiplier to .30 from .15 (Raise borrow APR to ~100%)
  BETH
    Decrease collateral factor to 0.50 from 0.60
    Decrease borrow and supply cap to 0
  WBETH
    Raise borrow cap to 550 from 200
    Raise supply cap to 800 from 300`,

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
          [VBETH, VWBETH],
          [0, parseUnits("550", 18)],
        ],
      },

      {
        target: COMPTROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [
          [VXVS, VBETH, VWBETH],
          [parseUnits("1500000", 18), 0, parseUnits("800", 18)],
        ],
      },

      {
        target: COMPTROLLER,
        signature: "_setCollateralFactor(address,uint256)",
        params: [VBETH, parseUnits("0.5", 18)],
      },

      {
        target: VTRXOLD,
        signature: "_setInterestRateModel(address)",
        params: [VTRXOLD_RATE_MODEL],
      },

      {
        target: VSXP,
        signature: "_setInterestRateModel(address)",
        params: [VSXP_RATE_MODEL],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
