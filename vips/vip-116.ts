import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const COMPTROLLER = "0xfd36e2c2a6789db23113685031d7f16329158384";
const NEW_VTRX = "0xC5D3466aA484B040eE977073fcF337f2c00071c1";
const VSXP = "0x2fF3d0F6990a40261c66E1ff2017aCBc282EB6d0";
const VXVS = "0x151B1e2635A717bcDc836ECd6FbB62B674FE3E1D";

export const vip116 = () => {
  const meta = {
    version: "v2",
    title: "VIP-116 Risk Parameters Update",
    description: `
    TRX:
        Increase CF to 0.525 from 0.50
    SXP:
        Decrease CF to 0.0 from 0.125
    XVS:
        Increase supply cap to 1.5m from 1m
        Increase CF to 0.60 from 0.55
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
        params: [NEW_VTRX, parseUnits("0.525", 18)],
      },

      {
        target: COMPTROLLER,
        signature: "_setCollateralFactor(address,uint256)",
        params: [VXVS, parseUnits("0.60", 18)],
      },

      {
        target: COMPTROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[VXVS], [parseUnits("1500000", 18)]],
      },

      {
        target: COMPTROLLER,
        signature: "_setCollateralFactor(address,uint256)",
        params: [VSXP, 0],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
