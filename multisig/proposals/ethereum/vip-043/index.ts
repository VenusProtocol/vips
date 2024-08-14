import { parseUnits } from "ethers/lib/utils";

import { makeProposal } from "../../../../src/utils";

export const COMPTROLLER_BEACON = "0xAE2C3F21896c02510aA187BdA0791cDA77083708";
export const NEW_COMPTROLLER_IMPLEMENTATION = "0x25973b6BF39298D87B5498760a6c24CA06C3B40a";

export const LST_COMPTROLLER = "0xF522cd0360EF8c2FF48B648d53EA1717Ec0F3Ac3";
export const wstETH = "0x4a240F0ee138697726C8a3E43eFE6Ac3593432CB";
export const weETH = "0xb4933AF59868986316Ed37fa865C829Eba2df0C7";
export const COLLATERAL_FACTOR = parseUnits("0.93", 18).toString();
export const LIQUIDATION_THRESHOLD = parseUnits("0.95", 18).toString();

export const vip043 = () => {
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
0;
export default vip043;
