import { parseUnits } from "ethers/lib/utils";

import { NETWORK_ADDRESSES } from "../../../src/networkAddresses";
import { makeProposal } from "../../../src/utils";

const { ethereum } = NETWORK_ADDRESSES;
const LIQUID_STAKED_COMPTROLLER = "0xF522cd0360EF8c2FF48B648d53EA1717Ec0F3Ac3";
const VWSTETH = "0x4a240F0ee138697726C8a3E43eFE6Ac3593432CB";
const VWETH = "0xc82780Db1257C788F262FBbDA960B3706Dfdcaf2";
const WSTETH = "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0";
const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const POOL_REGISTRY = "0x61CAff113CCaf05FFc6540302c37adcf077C5179";
const RESILIENT_ORACLE = "0xd2ce3fb018805ef92b8C5976cb31F84b4E295F94";

// IL configuration
export const vip010 = () => {
  return makeProposal([
    { target: LIQUID_STAKED_COMPTROLLER, signature: "acceptOwnership()", params: [] },
    {
      target: LIQUID_STAKED_COMPTROLLER,
      signature: "setPriceOracle(address)",
      params: [RESILIENT_ORACLE],
    },
    {
      target: POOL_REGISTRY,
      signature: "addPool(string,address,uint256,uint256,uint256)",
      params: [
        "Liquid Staked ETH",
        LIQUID_STAKED_COMPTROLLER,
        "500000000000000000",
        "1020000000000000000",
        "100000000000000000000",
      ],
    },
    // wstETH Configuration
    {
      target: ethereum.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [WSTETH, parseUnits("5", 18), ethereum.NORMAL_TIMELOCK],
    },
    {
      target: WSTETH,
      signature: "approve(address,uint256)",
      params: [POOL_REGISTRY, 0],
    },
    {
      target: WSTETH,
      signature: "approve(address,uint256)",
      params: [POOL_REGISTRY, parseUnits("5", 18)],
    },
    {
      target: VWSTETH,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["7200"],
    },
    {
      target: VWSTETH,
      signature: "setProtocolSeizeShare(uint256)",
      params: ["10000000000000000"],
    },
    {
      target: POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VWSTETH,
          "900000000000000000",
          "930000000000000000",
          "5000000000000000000",
          ethereum.VTREASURY,
          "20000000000000000000000",
          "2000000000000000000000",
        ],
      ],
    },
    // WETH Configuration
    {
      target: ethereum.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [WETH, parseUnits("4.333157504239697044", 18), ethereum.NORMAL_TIMELOCK],
    },
    {
      target: WETH,
      signature: "approve(address,uint256)",
      params: [POOL_REGISTRY, 0],
    },
    {
      target: WETH,
      signature: "approve(address,uint256)",
      params: [POOL_REGISTRY, parseUnits("4.333157504239697044", 18)],
    },
    {
      target: VWETH,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["7200"],
    },
    {
      target: VWETH,
      signature: "setProtocolSeizeShare(uint256)",
      params: ["10000000000000000"],
    },
    {
      target: POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VWETH,
          "900000000000000000",
          "930000000000000000",
          "4333157504239697044",
          ethereum.VTREASURY,
          "20000000000000000000000",
          "18000000000000000000000",
        ],
      ],
    },
  ]);
};
