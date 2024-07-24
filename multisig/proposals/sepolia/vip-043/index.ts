import { parseUnits } from "ethers/lib/utils";

import { makeProposal } from "../../../../src/utils";

export const LIQUID_STAKED_ETH_COMPTROLLER = "0xd79CeB8EF8188E44b7Eb899094e8A3A4d7A1e236";
export const vPTweETH26DEC2024LiquidStakedETH = "0x3AF2bE7AbEF0f840b196D99d79F4B803a5dB14a1";
export const NEW_SUPPLY_CAP = parseUnits("2400", 18);

export const vip043 = () => {
  return makeProposal([
    {
      target: LIQUID_STAKED_ETH_COMPTROLLER,
      signature: "setMarketSupplyCaps(address[],uint256[])",
      params: [[vPTweETH26DEC2024LiquidStakedETH], [NEW_SUPPLY_CAP]],
    },
  ]);
};

export default vip043;
