import { parseUnits } from "ethers/lib/utils";
import { makeProposal } from "src/utils";

export const CORE_POOL_COMPTROLLER = "0xddE4D098D9995B659724ae6d5E3FB9681Ac941B1";
export const vZK = "0x697a70779C1A03Ba2BD28b7627a902BFf831b616";
export const vWETH = "0x1Fa916C27c7C2c4602124A14C77Dbb40a5FF1BE8";

export const vZK_SUPPLY_CAP = parseUnits("50000000", 18);
export const vWETH_SUPPLY_CAP = parseUnits("6000", 18);

export const vWETH_BORROW_CAP = parseUnits("3400", 18);

export const vip013 = () => {
  return makeProposal([
    {
      target: CORE_POOL_COMPTROLLER,
      signature: "setMarketSupplyCaps(address[],uint256[])",
      params: [
        [vZK, vWETH],
        [vZK_SUPPLY_CAP, vWETH_SUPPLY_CAP],
      ],
    },
    {
      target: CORE_POOL_COMPTROLLER,
      signature: "setMarketBorrowCaps(address[],uint256[])",
      params: [[vWETH], [vWETH_BORROW_CAP]],
    },
  ]);
};

export default vip013;
