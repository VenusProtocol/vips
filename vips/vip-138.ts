import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const COMPTROLLER = "0xfd36e2c2a6789db23113685031d7f16329158384";
const OLD_VTUSD = "0x08CEB3F4a7ed3500cA0982bcd0FC7816688084c3";
const VXVS = "0x151B1e2635A717bcDc836ECd6FbB62B674FE3E1D";
const VBETH = "0x972207A639CC1B374B893cc33Fa251b55CEB7c07";

export const vip138 = () => {
  const meta = {
    version: "v2",
    title: "VIP-138 Risk Parameters Update",
    description: `
    XVS: 
      Increase collateral factor to 0.60 from 0.55
    BETH: 
      Decrease collateral factor to 0.40 from 0.50
    TUSDOLD
      Decrease collateral factor to 0.0 from 0.55
      Decrease borrow and supply cap to 0
      Mint and borrow actions are already paused, so these changes won't have any practical effect, but we'll do it anyway
      `,
    forDescription: "I agree that Venus Protocol should proceed with the Risk Parameters Update's",
    againstDescription: "I do not think that Venus Protocol should proceed with the Risk Parameters Update's",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with the Risk Parameters Update's or not",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER,
        signature: "_setCollateralFactor(address,uint256)",
        params: [OLD_VTUSD, 0],
      },

      {
        target: COMPTROLLER,
        signature: "_setCollateralFactor(address,uint256)",
        params: [VBETH, parseUnits("0.40", 18)],
      },

      {
        target: COMPTROLLER,
        signature: "_setCollateralFactor(address,uint256)",
        params: [VXVS, parseUnits("0.60", 18)],
      },

      {
        target: COMPTROLLER,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[OLD_VTUSD], [1]],
      },

      {
        target: COMPTROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[OLD_VTUSD], [0]],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
