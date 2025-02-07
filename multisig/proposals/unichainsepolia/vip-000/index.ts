import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { unichainsepolia } = NETWORK_ADDRESSES;

export const TREASURY = "0x0C7CB62F2194cD701bcE8FD8067b43A3Bb76428e";
export const ACM = "0x854C064EA6b503A97980F481FA3B7279012fdeDd";

const REDSTONE_ETH_FEED = "0x4BAD96DD1C7D541270a0C92e1D4e5f12EEEA7a57";
const REDSTONE_USDC_FEED = "0x197225B3B017eb9b72Ac356D6B3c267d0c04c57c";
const REDSTONE_USDT_FEED = "0x3fd49f2146FE0e10c4AE7E3fE04b3d5126385Ac4";
export const cbBTC = "0x2979ef1676bb28192ac304173C717D7322b3b586";
const WETH = "0x4200000000000000000000000000000000000006";
const USDC = "0xf16d4774893eB578130a645d5c69E9c4d183F3A5";
const USDT = "0x7bc1b67fde923fd3667Fde59684c6c354C8EbFdA";

export const BOUND_VALIDATOR = "0x51C9F57Ffc0A4dD6d135aa3b856571F5A4e4C6CB";

const STALE_PERIOD_6H = 60 * 60 * 6; // 6 hours (pricefeeds with heartbeat of 6 hr)

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
      params: [unichainsepolia.RESILIENT_ORACLE, "pause()", unichainsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [unichainsepolia.RESILIENT_ORACLE, "unpause()", unichainsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [unichainsepolia.RESILIENT_ORACLE, "setOracle(address,address,uint8)", unichainsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [unichainsepolia.RESILIENT_ORACLE, "enableOracle(address,uint8,bool)", unichainsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [unichainsepolia.RESILIENT_ORACLE, "setTokenConfig(TokenConfig)", unichainsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [unichainsepolia.REDSTONE_ORACLE, "setTokenConfig(TokenConfig)", unichainsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [unichainsepolia.REDSTONE_ORACLE, "setDirectPrice(address,uint256)", unichainsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [BOUND_VALIDATOR, "setValidateConfig(ValidateConfig)", unichainsepolia.GUARDIAN],
    },
    {
      target: unichainsepolia.RESILIENT_ORACLE,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: unichainsepolia.REDSTONE_ORACLE,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: BOUND_VALIDATOR,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: unichainsepolia.REDSTONE_ORACLE,
      signature: "setDirectPrice(address,uint256)",
      params: [cbBTC, parseUnits("65000", 18)],
    },
    {
      target: unichainsepolia.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          cbBTC,
          [
            unichainsepolia.REDSTONE_ORACLE,
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
          ],
          [true, false, false],
        ],
      ],
    },
    {
      target: unichainsepolia.REDSTONE_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[WETH, REDSTONE_ETH_FEED, STALE_PERIOD_6H]],
    },
    {
      target: unichainsepolia.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          WETH,
          [
            unichainsepolia.REDSTONE_ORACLE,
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
          ],
          [true, false, false],
        ],
      ],
    },
    {
      target: unichainsepolia.REDSTONE_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[USDC, REDSTONE_USDC_FEED, STALE_PERIOD_6H]],
    },
    {
      target: unichainsepolia.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          USDC,
          [
            unichainsepolia.REDSTONE_ORACLE,
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
          ],
          [true, false, false],
        ],
      ],
    },
    {
      target: unichainsepolia.REDSTONE_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[USDT, REDSTONE_USDT_FEED, STALE_PERIOD_6H]],
    },
    {
      target: unichainsepolia.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          USDT,
          [
            unichainsepolia.REDSTONE_ORACLE,
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
          ],
          [true, false, false],
        ],
      ],
    },
    {
      target: unichainsepolia.REDSTONE_ORACLE,
      signature: "setDirectPrice(address,uint256)",
      params: [unichainsepolia.XVS, parseUnits("7", 18)],
    },
    {
      target: unichainsepolia.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          unichainsepolia.XVS,
          [
            unichainsepolia.REDSTONE_ORACLE,
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
