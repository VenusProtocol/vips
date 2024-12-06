import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { basemainnet } = NETWORK_ADDRESSES;

export const TREASURY = "0xbefD8d06f403222dd5E8e37D2ba93320A97939D1";
export const ACM = "0x9E6CeEfDC6183e4D0DF8092A9B90cDF659687daB";
export const BOUND_VALIDATOR = "0x66dDE062D3DC1BB5223A0096EbB89395d1f11DB0";

const CHAINLINK_BTC_FEED = "0x07DA0E54543a844a80ABE69c8A12F22B3aA59f9D";
const CHAINLINK_ETH_FEED = "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70";
const CHAINLINK_USDC_FEED = "0x7e860098F58bBFC8648a4311b374B1D669a2bc6B";
const REDSTONE_XVS_FEED = "0x5ED849a45B4608952161f45483F4B95BCEa7f8f0";

const cbBTC = "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf";
const WETH = "0x4200000000000000000000000000000000000006";
const USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const XVS = "0xebB7873213c8d1d9913D8eA39Aa12d74cB107995";

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
      params: [basemainnet.RESILIENT_ORACLE, "pause()", basemainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [basemainnet.RESILIENT_ORACLE, "unpause()", basemainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [basemainnet.RESILIENT_ORACLE, "setOracle(address,address,uint8)", basemainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [basemainnet.RESILIENT_ORACLE, "enableOracle(address,uint8,bool)", basemainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [basemainnet.RESILIENT_ORACLE, "setTokenConfig(TokenConfig)", basemainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [basemainnet.CHAINLINK_ORACLE, "setTokenConfig(TokenConfig)", basemainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [basemainnet.CHAINLINK_ORACLE, "setDirectPrice(address,uint256)", basemainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [basemainnet.REDSTONE_ORACLE, "setTokenConfig(TokenConfig)", basemainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [basemainnet.REDSTONE_ORACLE, "setDirectPrice(address,uint256)", basemainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [BOUND_VALIDATOR, "setValidateConfig(ValidateConfig)", basemainnet.GUARDIAN],
    },
    {
      target: basemainnet.RESILIENT_ORACLE,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: basemainnet.CHAINLINK_ORACLE,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: basemainnet.REDSTONE_ORACLE,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: BOUND_VALIDATOR,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: basemainnet.CHAINLINK_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[cbBTC, CHAINLINK_BTC_FEED, STALE_PERIOD_30M]],
    },
    {
      target: basemainnet.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          cbBTC,
          [
            basemainnet.CHAINLINK_ORACLE,
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
          ],
          [true, false, false],
        ],
      ],
    },
    {
      target: basemainnet.CHAINLINK_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[WETH, CHAINLINK_ETH_FEED, STALE_PERIOD_30M]],
    },
    {
      target: basemainnet.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          WETH,
          [
            basemainnet.CHAINLINK_ORACLE,
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
          ],
          [true, false, false],
        ],
      ],
    },
    {
      target: basemainnet.CHAINLINK_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[USDC, CHAINLINK_USDC_FEED, STALE_PERIOD_26H]],
    },
    {
      target: basemainnet.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          USDC,
          [
            basemainnet.CHAINLINK_ORACLE,
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
          ],
          [true, false, false],
        ],
      ],
    },
    {
      target: basemainnet.REDSTONE_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[XVS, REDSTONE_XVS_FEED, STALE_PERIOD_26H]],
    },
    {
      target: basemainnet.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          XVS,
          [
            basemainnet.REDSTONE_ORACLE,
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
