import { parseUnits } from "ethers/lib/utils";

import { makeProposal } from "../../../../src/utils";

export const COMPTROLLER_BEACON = "0x6cE54143a88CC22500D49D744fb6535D66a8294F";
export const NEW_COMPTROLLER_IMPLEMENTATION = "0xea4D6A5b13C3C9b1AeB13c64B84ff1B452804f4A";

export const LST_COMPTROLLER = "0xd79CeB8EF8188E44b7Eb899094e8A3A4d7A1e236";
export const wstETH = "0x0a95088403229331FeF1EB26a11F9d6C8E73f23D";
export const weETH = "0x30c31bA6f4652B548fe7a142A949987c3f3Bf80b";
export const COLLATERAL_FACTOR = parseUnits("0.93", 18).toString();
export const LIQUIDATION_THRESHOLD = parseUnits("0.95", 18).toString();

const vip041 = () => {
  return makeProposal([
    {
      target: COMPTROLLER_BEACON,
      signature: "upgradeTo(address)",
      params: [NEW_COMPTROLLER_IMPLEMENTATION],
    },
    {
      target: LST_COMPTROLLER,
      signature: "setCollateralFactor(address,uint256,uint256)",
      params: [wstETH, COLLATERAL_FACTOR, LIQUIDATION_THRESHOLD],
    },
    {
      target: LST_COMPTROLLER,
      signature: "setCollateralFactor(address,uint256,uint256)",
      params: [weETH, COLLATERAL_FACTOR, LIQUIDATION_THRESHOLD],
    },
  ]);
};

export default vip041;
