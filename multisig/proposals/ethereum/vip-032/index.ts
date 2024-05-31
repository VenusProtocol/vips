import { parseUnits } from "ethers/lib/utils";

import { makeProposal } from "../../../../src/utils";

export const LIQUID_STAKED_ETH_COMPTROLLER = "0xF522cd0360EF8c2FF48B648d53EA1717Ec0F3Ac3";
export const vweETH = "0xb4933AF59868986316Ed37fa865C829Eba2df0C7";
export const vweETH_SUPPLY_CAP = parseUnits("50000", 18);
export const vweETH_BORROW_CAP = parseUnits("25000", 18);
export const vwstETH = "0x4a240F0ee138697726C8a3E43eFE6Ac3593432CB";
export const vwstETH_BORROW_CAP = parseUnits("10000", 18);

export const vip032 = () => {
  return makeProposal([
    {
      target: LIQUID_STAKED_ETH_COMPTROLLER,
      signature: "setMarketSupplyCaps(address[],uint256[])",
      params: [[vweETH], [vweETH_SUPPLY_CAP]],
    },
    {
      target: LIQUID_STAKED_ETH_COMPTROLLER,
      signature: "setMarketBorrowCaps(address[],uint256[])",
      params: [
        [vweETH, vwstETH],
        [vweETH_BORROW_CAP, vwstETH_BORROW_CAP],
      ],
    },
  ]);
};

export default vip032;
