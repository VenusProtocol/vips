import { parseUnits } from "ethers/lib/utils";

import { makeProposal } from "../../../../src/utils";

export const LIQUID_STAKED_ETH_COMPTROLLER = "0xF522cd0360EF8c2FF48B648d53EA1717Ec0F3Ac3";
export const vPTweETH26DEC2024LiquidStakedETH = "0x76697f8eaeA4bE01C678376aAb97498Ee8f80D5C";
export const NEW_SUPPLY_CAP = parseUnits("2400", 18);

export const vip049 = () => {
  return makeProposal([
    {
      target: LIQUID_STAKED_ETH_COMPTROLLER,
      signature: "setMarketSupplyCaps(address[],uint256[])",
      params: [[vPTweETH26DEC2024LiquidStakedETH], [NEW_SUPPLY_CAP]],
    },
  ]);
};

export default vip049;
