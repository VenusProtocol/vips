import { parseUnits } from "ethers/lib/utils";
import { makeProposal } from "src/utils";

export const CORE_POOL_COMPTROLLER = "0xe22af1e6b78318e1Fe1053Edbd7209b8Fc62c4Fe";
export const vWETH = "0xc219BC179C7cDb37eACB03f993f9fDc2495e3374";

export const vWETH_SUPPLY_CAP = parseUnits("700", 18);

export const vip007 = () => {
  return makeProposal([
    {
      target: CORE_POOL_COMPTROLLER,
      signature: "setMarketSupplyCaps(address[],uint256[])",
      params: [[vWETH], [vWETH_SUPPLY_CAP]],
    },
  ]);
};

export default vip007;
