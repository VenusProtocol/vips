import { parseUnits } from "ethers/lib/utils";

import { makeProposal } from "../../../../src/utils";

export const CORE_COMPTROLLER_ADDRESS = "0x687a01ecF6d3907658f7A7c714749fAC32336D1B";
export const CRV_COMPTROLLER_ADDRESS = "0x67aA3eCc5831a65A5Ba7be76BED3B5dc7DB60796";
export const ETH_COMPTROLLER_ADDRESS = "0xF522cd0360EF8c2FF48B648d53EA1717Ec0F3Ac3";
export const DAI_ADDRESS = "0xd8AdD9B41D4E1cd64Edad8722AB0bA8D35536657";
export const DAI_SUPPLY_CAP = parseUnits("5000000", 18);
export const DAI_BORROW_CAP = parseUnits("4500000", 18);
export const FRAX_ADDRESS = "0x4fAfbDc4F2a9876Bd1764827b26fb8dc4FD1dB95";
export const FRAX_SUPPLY_CAP = parseUnits("2000000", 18);
export const FRAX_BORROW_CAP = parseUnits("1600000", 18);
export const crvUSD_ADDRESS = "0x672208C10aaAA2F9A6719F449C4C8227bc0BC202";
export const crvUSD_SUPPLY_CAP = parseUnits("10000000", 18);
export const crvUSD_BORROW_CAP = parseUnits("9000000", 18);
export const CRV_ADDRESS = "0x30aD10Bd5Be62CAb37863C2BfcC6E8fb4fD85BDa";
export const CRV_SUPPLY_CAP = parseUnits("3000000", 18);
export const CRV_BORROW_CAP = parseUnits("1500000", 18);
export const ETH_weETH_ADDRESS = "0xb4933AF59868986316Ed37fa865C829Eba2df0C7";
export const ETH_weETH_SUPPLY_CAP = parseUnits("15000", 18);
export const ETH_weETH_BORROW_CAP = parseUnits("7500", 18);
export const ETH_wstETH_ADDRESS = "0x4a240F0ee138697726C8a3E43eFE6Ac3593432CB";
export const ETH_wstETH_BORROW_CAP = parseUnits("4000", 18);

export const vip028 = () => {
  return makeProposal([
    {
      target: CORE_COMPTROLLER_ADDRESS,
      signature: "setMarketSupplyCaps(address[],uint256[])",
      params: [
        [DAI_ADDRESS, FRAX_ADDRESS, crvUSD_ADDRESS],
        [DAI_SUPPLY_CAP, FRAX_SUPPLY_CAP, crvUSD_SUPPLY_CAP],
      ],
    },
    {
      target: CORE_COMPTROLLER_ADDRESS,
      signature: "setMarketBorrowCaps(address[],uint256[])",
      params: [
        [DAI_ADDRESS, FRAX_ADDRESS, crvUSD_ADDRESS],
        [DAI_BORROW_CAP, FRAX_BORROW_CAP, crvUSD_BORROW_CAP],
      ],
    },
    {
      target: CRV_COMPTROLLER_ADDRESS,
      signature: "setMarketSupplyCaps(address[],uint256[])",
      params: [[CRV_ADDRESS], [CRV_SUPPLY_CAP]],
    },
    {
      target: CRV_COMPTROLLER_ADDRESS,
      signature: "setMarketBorrowCaps(address[],uint256[])",
      params: [[CRV_ADDRESS], [CRV_BORROW_CAP]],
    },
    {
      target: ETH_COMPTROLLER_ADDRESS,
      signature: "setMarketSupplyCaps(address[],uint256[])",
      params: [[ETH_weETH_ADDRESS], [ETH_weETH_SUPPLY_CAP]],
    },
    {
      target: ETH_COMPTROLLER_ADDRESS,
      signature: "setMarketBorrowCaps(address[],uint256[])",
      params: [
        [ETH_weETH_ADDRESS, ETH_wstETH_ADDRESS],
        [ETH_weETH_BORROW_CAP, ETH_wstETH_BORROW_CAP],
      ],
    },
  ]);
};

export default vip028;
