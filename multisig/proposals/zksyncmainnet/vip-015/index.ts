import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { zksyncmainnet } = NETWORK_ADDRESSES;

export const USDC = "0x1d17CBcF0D6D143135aE902365D2E5e2A16538D4";
export const VUSDC_CORE = "0x84064c058F2EFea4AB648bB6Bd7e40f83fFDe39a";
export const INITIAL_SUPPLY = parseUnits("4998.378502", 6);
const CHAINLINK_USDC_FEED = "0x1824D297C6d6D311A204495277B63e943C2D376E";
const STALE_PERIOD_26H = 26 * 60 * 60; // 26 hours (pricefeeds with heartbeat of 24 hr)

const vip015 = () => {
  return makeProposal([
    {
      target: zksyncmainnet.CHAINLINK_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[USDC, CHAINLINK_USDC_FEED, STALE_PERIOD_26H]],
    },
    {
      target: zksyncmainnet.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          USDC,
          [
            zksyncmainnet.CHAINLINK_ORACLE,
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
          ],
          [true, false, false],
        ],
      ],
    },
    {
      target: zksyncmainnet.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [USDC, INITIAL_SUPPLY, zksyncmainnet.GUARDIAN],
    },
    {
      target: USDC,
      signature: "approve(address,uint256)",
      params: [zksyncmainnet.POOL_REGISTRY, 0],
    },
    {
      target: USDC,
      signature: "approve(address,uint256)",
      params: [zksyncmainnet.POOL_REGISTRY, INITIAL_SUPPLY],
    },
    {
      target: VUSDC_CORE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["86400"],
    },
    {
      target: zksyncmainnet.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VUSDC_CORE,
          parseUnits("0.72", 18), // CF
          parseUnits("0.75", 18), // LT
          INITIAL_SUPPLY, // initial supply
          zksyncmainnet.VTREASURY,
          parseUnits("1250000", 6), // supply cap
          parseUnits("1000000", 6), // borrow cap
        ],
      ],
    },
  ]);
};

export default vip015;
