import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { zksyncmainnet } = NETWORK_ADDRESSES;

export const BOUND_VALIDATOR = "0x51519cdCDDD05E2ADCFA108f4a960755D9d6ea8b";
export const REDSTONE_ORACLE = "0xFa1e65e714CDfefDC9729130496AB5b5f3708fdA";

const CHAINLINK_ETH_FEED = "0x6D41d1dc818112880b40e26BD6FD347E41008eDA";
const CHAINLINK_BTC_FEED = "0x4Cba285c15e3B540C474A114a7b135193e4f1EA6";
const CHAINLINK_USDC_E_FEED = "0x1824D297C6d6D311A204495277B63e943C2D376E";
const CHAINLINK_USDT_FEED = "0xB615075979AE1836B476F651f1eB79f0Cd3956a9";
const CHAINLINK_ZK_FEED = "0xD1ce60dc8AE060DDD17cA8716C96f193bC88DD13";
const REDSTONE_ZK_FEED = "0x5efDb74da192584746c96EcCe138681Ec1501218";
const REDSTONE_XVS_FEED = "0xca4793Eeb7a837E30884279b3D557970E444EBDe";
const STALE_PERIOD_26H = 26 * 60 * 60; // 26 hours (pricefeeds with heartbeat of 24 hr)

const ACM = "0x526159A92A82afE5327d37Ef446b68FD9a5cA914";
export const USDC_E = "0x3355df6d4c9c3035724fd0e3914de96a5a83aaf4";
export const USDT = "0x493257fd37edb34451f62edf8d2a0c418852ba4c";
export const WETH = "0x5aea5775959fbc2557cc8789bc1bf90a239d9a91";
export const WBTC = "0xbbeb516fb02a01611cbbe0453fe3c580d7281011";
export const ZK = "0x5a7d6b2f92c77fad6ccabd7ee0624e64907eaf3e";

const UPPER_BOUND_RATIO = parseUnits("1.01", 18);
const LOWER_BOUND_RATIO = parseUnits("0.99", 18);

const vip001 = () => {
  return makeProposal([
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [zksyncmainnet.RESILIENT_ORACLE, "pause()", zksyncmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [zksyncmainnet.RESILIENT_ORACLE, "unpause()", zksyncmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [zksyncmainnet.RESILIENT_ORACLE, "setOracle(address,address,uint8)", zksyncmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [zksyncmainnet.RESILIENT_ORACLE, "enableOracle(address,uint8,bool)", zksyncmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [zksyncmainnet.RESILIENT_ORACLE, "setTokenConfig(TokenConfig)", zksyncmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [zksyncmainnet.CHAINLINK_ORACLE, "setTokenConfig(TokenConfig)", zksyncmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [REDSTONE_ORACLE, "setTokenConfig(TokenConfig)", zksyncmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [zksyncmainnet.CHAINLINK_ORACLE, "setDirectPrice(address,uint256)", zksyncmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [REDSTONE_ORACLE, "setDirectPrice(address,uint256)", zksyncmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [BOUND_VALIDATOR, "setValidateConfig(ValidateConfig)", zksyncmainnet.GUARDIAN],
    },
    { target: zksyncmainnet.RESILIENT_ORACLE, signature: "acceptOwnership()", params: [] },
    { target: zksyncmainnet.CHAINLINK_ORACLE, signature: "acceptOwnership()", params: [] },
    { target: BOUND_VALIDATOR, signature: "acceptOwnership()", params: [] },
    { target: REDSTONE_ORACLE, signature: "acceptOwnership()", params: [] },

    {
      target: zksyncmainnet.CHAINLINK_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[WBTC, CHAINLINK_BTC_FEED, STALE_PERIOD_26H]],
    },
    {
      target: zksyncmainnet.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          WBTC,
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
      target: zksyncmainnet.CHAINLINK_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[WETH, CHAINLINK_ETH_FEED, STALE_PERIOD_26H]],
    },
    {
      target: zksyncmainnet.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          WETH,
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
      target: zksyncmainnet.CHAINLINK_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[USDC_E, CHAINLINK_USDC_E_FEED, STALE_PERIOD_26H]],
    },
    {
      target: zksyncmainnet.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          USDC_E,
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
      target: zksyncmainnet.CHAINLINK_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[USDT, CHAINLINK_USDT_FEED, STALE_PERIOD_26H]],
    },
    {
      target: zksyncmainnet.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          USDT,
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
      target: BOUND_VALIDATOR,
      signature: "setValidateConfig((address,uint256,uint256))",
      params: [[ZK, UPPER_BOUND_RATIO, LOWER_BOUND_RATIO]],
    },
    // ZK
    {
      target: zksyncmainnet.CHAINLINK_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[ZK, CHAINLINK_ZK_FEED, STALE_PERIOD_26H]],
    },
    {
      target: REDSTONE_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[ZK, REDSTONE_ZK_FEED, STALE_PERIOD_26H]],
    },
    {
      target: zksyncmainnet.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [ZK, [REDSTONE_ORACLE, zksyncmainnet.CHAINLINK_ORACLE, zksyncmainnet.CHAINLINK_ORACLE], [true, true, true]],
      ],
    },

    // XVS
    {
      target: REDSTONE_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[zksyncmainnet.XVS, REDSTONE_XVS_FEED, STALE_PERIOD_26H]],
    },

    {
      target: zksyncmainnet.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          zksyncmainnet.XVS,
          [REDSTONE_ORACLE, "0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000"],
          [true, false, false],
        ],
      ],
    },
  ]);
};

export default vip001;
