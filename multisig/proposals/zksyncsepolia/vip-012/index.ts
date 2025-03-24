import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { zksyncsepolia } = NETWORK_ADDRESSES;

export const MOCK_USDC = "0x512F8b4a3c466a30e8c9BAC9c64638dd710968c2";
export const VUSDC_CORE = "0xA266EfCC7D1a8F1AAd093446E3C0115467ea8b9C";
export const INITIAL_SUPPLY = parseUnits("5000", 6);
const CHAINLINK_USDC_FEED = "0x1844478CA634f3a762a2E71E3386837Bd50C947F";
const STALE_PERIOD_26H = 26 * 60 * 60; // 26 hours (pricefeeds with heartbeat of 24 hr)

const vip012 = () => {
  return makeProposal([
    {
      target: zksyncsepolia.CHAINLINK_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[MOCK_USDC, CHAINLINK_USDC_FEED, STALE_PERIOD_26H]],
    },
    {
      target: zksyncsepolia.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          MOCK_USDC,
          [
            zksyncsepolia.CHAINLINK_ORACLE,
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
          ],
          [true, false, false],
        ],
      ],
    },
    {
      target: MOCK_USDC,
      signature: "faucet(uint256)",
      params: [INITIAL_SUPPLY],
    },
    {
      target: MOCK_USDC,
      signature: "approve(address,uint256)",
      params: [zksyncsepolia.POOL_REGISTRY, 0],
    },
    {
      target: MOCK_USDC,
      signature: "approve(address,uint256)",
      params: [zksyncsepolia.POOL_REGISTRY, INITIAL_SUPPLY],
    },
    {
      target: VUSDC_CORE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["86400"],
    },
    {
      target: zksyncsepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VUSDC_CORE,
          parseUnits("0.72", 18), // CF
          parseUnits("0.75", 18), // LT
          INITIAL_SUPPLY, // initial supply
          zksyncsepolia.VTREASURY,
          parseUnits("1250000", 6), // supply cap
          parseUnits("1000000", 6), // borrow cap
        ],
      ],
    },
  ]);
};

export default vip012;
