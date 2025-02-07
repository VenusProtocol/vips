import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { basesepolia } = NETWORK_ADDRESSES;

export const TREASURY = "0x07e880DaA6572829cE8ABaaf0f5323A4eFC417A6";
export const ACM = "0x724138223D8F76b519fdE715f60124E7Ce51e051";
export const BOUND_VALIDATOR = "0xC76284488E57554A457A75a8b166fB2ADAB430dB";

const CHAINLINK_BTC_FEED = "0x0FB99723Aee6f420beAD13e6bBB79b7E6F034298";
const CHAINLINK_ETH_FEED = "0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1";
const CHAINLINK_USDC_FEED = "0xd30e2101a97dcbAeBCBC04F14C3f624E67A35165";

const cbBTC = "0x0948001047A07e38F685f9a11ea1ddB16B234af9";
const WETH = "0x4200000000000000000000000000000000000006";
const USDC = "0xFa264c13d657180e65245a9C3ac8d08b9F5Fc54D";
const XVS = "0xE657EDb5579B82135a274E85187927C42E38C021";

const STALE_PERIOD_26H = 60 * 60 * 26; // 26 hours (pricefeeds with heartbeat of 24 hr)
const STALE_PERIOD_30M = 60 * 30; // 30 minutes (pricefeeds with heartbeat of 20 minutes)

const vip000 = () => {
  return makeProposal([
    {
      target: TREASURY,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [basesepolia.RESILIENT_ORACLE, "pause()", basesepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [basesepolia.RESILIENT_ORACLE, "unpause()", basesepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [basesepolia.RESILIENT_ORACLE, "setOracle(address,address,uint8)", basesepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [basesepolia.RESILIENT_ORACLE, "enableOracle(address,uint8,bool)", basesepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [basesepolia.RESILIENT_ORACLE, "setTokenConfig(TokenConfig)", basesepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [basesepolia.CHAINLINK_ORACLE, "setTokenConfig(TokenConfig)", basesepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [basesepolia.CHAINLINK_ORACLE, "setDirectPrice(address,uint256)", basesepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [basesepolia.REDSTONE_ORACLE, "setTokenConfig(TokenConfig)", basesepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [basesepolia.REDSTONE_ORACLE, "setDirectPrice(address,uint256)", basesepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [BOUND_VALIDATOR, "setValidateConfig(ValidateConfig)", basesepolia.GUARDIAN],
    },
    {
      target: basesepolia.RESILIENT_ORACLE,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: basesepolia.CHAINLINK_ORACLE,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: basesepolia.REDSTONE_ORACLE,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: BOUND_VALIDATOR,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: basesepolia.CHAINLINK_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[cbBTC, CHAINLINK_BTC_FEED, STALE_PERIOD_30M]],
    },
    {
      target: basesepolia.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          cbBTC,
          [
            basesepolia.CHAINLINK_ORACLE,
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
          ],
          [true, false, false],
        ],
      ],
    },
    {
      target: basesepolia.CHAINLINK_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[WETH, CHAINLINK_ETH_FEED, STALE_PERIOD_30M]],
    },
    {
      target: basesepolia.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          WETH,
          [
            basesepolia.CHAINLINK_ORACLE,
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
          ],
          [true, false, false],
        ],
      ],
    },
    {
      target: basesepolia.CHAINLINK_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[USDC, CHAINLINK_USDC_FEED, STALE_PERIOD_26H]],
    },
    {
      target: basesepolia.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          USDC,
          [
            basesepolia.CHAINLINK_ORACLE,
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
          ],
          [true, false, false],
        ],
      ],
    },
    {
      target: basesepolia.REDSTONE_ORACLE,
      signature: "setDirectPrice(address,uint256)",
      params: [XVS, "10000000000000000000"],
    },
    {
      target: basesepolia.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          XVS,
          [
            basesepolia.REDSTONE_ORACLE,
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
          ],
          [true, false, false],
        ],
      ],
    },
  ]);
};

export default vip000;
