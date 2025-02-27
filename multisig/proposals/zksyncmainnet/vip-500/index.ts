import { makeProposal } from "src/utils";
import { parseUnits } from "ethers/lib/utils";

export const COMPTROLLER = "0xddE4D098D9995B659724ae6d5E3FB9681Ac941B1";
export const vWUSDM = "0x183dE3C349fCf546aAe925E1c7F364EA6FB4033c";
export const COLLATERAL_FACTOR = parseUnits("0", 18).toString();
export const LIQUIDATION_THRESHOLD = parseUnits("0.78", 18).toString();

const vip500 = () => {
  return makeProposal([
    {
      target: COMPTROLLER,
      signature: "setActionsPaused(address[],uint8[],bool)",
      params: [[vWUSDM], [0, 2, 7], true],
    },
    {
      target: COMPTROLLER,
      signature: "setCollateralFactor(address,uint256,uint256)",
      params: [vWUSDM, COLLATERAL_FACTOR, LIQUIDATION_THRESHOLD],
    },
  ]);
};

export default vip500;