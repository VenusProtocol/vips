import { makeProposal } from "../../../../src/utils";

export const BTCB = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c"
export const REDSTONE_ORACLE = "0x8455EFA4D7Ff63b8BFD96AdD889483Ea7d39B70a";
export const CHAINLINK_ORACLE = "0x1B2103441A0A108daD8848D8F5d790e4D402921F";
const CUSTOM_LIQUIDATOR = "0x1B2103441A0A108daD8848D8F5d790e4D402921F"; // TODO: Update

const vip000 = () => {
  return makeProposal([
    {
      target: REDSTONE_ORACLE,
      signature: "setDirectPrice(address,uint256)",
      params: [BTCB, "10000000000000000000000000000"],
    },
    {
      target: CHAINLINK_ORACLE,
      signature: "setDirectPrice(address,uint256)",
      params: [BTCB, "10000000000000000000000000000"],
    },
    {
      target: CUSTOM_LIQUIDATOR,
      signature: "runLiquidation()",
      params: [],
    },
    {
      target: REDSTONE_ORACLE,
      signature: "setDirectPrice(address,uint256)",
      params: [BTCB, "0"],
    },
    {
      target: CHAINLINK_ORACLE,
      signature: "setDirectPrice(address,uint256)",
      params: [BTCB, "0"],
    },
    {
      target: CUSTOM_LIQUIDATOR,
      signature: "borrowOnBehalfAndRepay()",
      params: [],
    },
  ]);
};

export default vip000;
