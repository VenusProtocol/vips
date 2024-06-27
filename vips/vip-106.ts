import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const COMPTROLLER = "0xfd36e2c2a6789db23113685031d7f16329158384";
const NEW_VTRX = "0xC5D3466aA484B040eE977073fcF337f2c00071c1";
const OLD_VTRX = "0x61eDcFe8Dd6bA3c891CB9bEc2dc7657B3B422E93";
const VSXP = "0x2fF3d0F6990a40261c66E1ff2017aCBc282EB6d0";
const VXVS = "0x151B1e2635A717bcDc836ECd6FbB62B674FE3E1D";

export const vip106 = () => {
  const meta = {
    version: "v2",
    title: "VIP-106 Risk Parameters Update",
    description: `
    TRX:
        Increase borrow cap to 9m tokens from 8m
        Increase supply cap to 11m tokens from 10m
        Increase CF to 0.475 from 0.45
    TRXOLD:
        Reduce CF to 0.0 from 0.20
    SXP:
        Reduce CF to 0.125 from 0.175
    XVS:
        Decrease supply cap to 1m from 1.3m
        Decrease CF to 0.55 from 0.60
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
        params: [OLD_VTRX, 0],
      },

      {
        target: COMPTROLLER,
        signature: "_setCollateralFactor(address,uint256)",
        params: [NEW_VTRX, parseUnits("0.475", 18)],
      },

      {
        target: COMPTROLLER,
        signature: "_setCollateralFactor(address,uint256)",
        params: [VXVS, parseUnits("0.55", 18)],
      },

      {
        target: COMPTROLLER,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[NEW_VTRX], [parseUnits("9000000", 6)]],
      },

      {
        target: COMPTROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [
          [NEW_VTRX, VXVS],
          [parseUnits("11000000", 6), parseUnits("1000000", 18)],
        ],
      },

      {
        target: COMPTROLLER,
        signature: "_setCollateralFactor(address,uint256)",
        params: [VSXP, parseUnits("0.125", 18)],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
