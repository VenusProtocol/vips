import { parseUnits } from "ethers/lib/utils";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { makeProposal } from "../../../../src/utils";

const { sepolia } = NETWORK_ADDRESSES;
const LIQUID_STAKED_COMPTROLLER = "0xd79CeB8EF8188E44b7Eb899094e8A3A4d7A1e236";
const VWSTETH = "0x0a95088403229331FeF1EB26a11F9d6C8E73f23D";
const VWETH = "0x9f6213dFa9069a5426Fe8fAE73857712E1259Ed4";
const WSTETH = "0x9b87ea90fdb55e1a0f17fbeddcf7eb0ac4d50493";
const WETH = "0x700868CAbb60e90d77B6588ce072d9859ec8E281";

// IL configuration
const vip010 = () => {
  return makeProposal([
    { target: LIQUID_STAKED_COMPTROLLER, signature: "acceptOwnership()", params: [] },
    {
      target: LIQUID_STAKED_COMPTROLLER,
      signature: "setPriceOracle(address)",
      params: [sepolia.RESILIENT_ORACLE],
    },
    {
      target: sepolia.POOL_REGISTRY,
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
      target: sepolia.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [WSTETH, parseUnits("5", 18), sepolia.NORMAL_TIMELOCK],
    },
    {
      target: WSTETH,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, 0],
    },
    {
      target: WSTETH,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, parseUnits("5", 18)],
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
      target: sepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VWSTETH,
          "900000000000000000",
          "930000000000000000",
          "5000000000000000000",
          sepolia.VTREASURY,
          "20000000000000000000000",
          "2000000000000000000000",
        ],
      ],
    },
    // WETH Configuration
    {
      target: sepolia.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [WETH, parseUnits("4.333157504239697044", 18), sepolia.NORMAL_TIMELOCK],
    },
    {
      target: WETH,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, 0],
    },
    {
      target: WETH,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, parseUnits("4.333157504239697044", 18)],
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
      target: sepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VWETH,
          "900000000000000000",
          "930000000000000000",
          "4333157504239697044",
          sepolia.VTREASURY,
          "20000000000000000000000",
          "18000000000000000000000",
        ],
      ],
    },
  ]);
};

export default vip010
