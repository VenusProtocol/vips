import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { opsepolia } = NETWORK_ADDRESSES;

const CHAINLINK_BTC_FEED = "0x3015aa11f5c2D4Bd0f891E708C8927961b38cE7D";
const CHAINLINK_ETH_FEED = "0x61Ec26aA57019C486B10502285c5A3D4A4750AD7";
const CHAINLINK_USDC_FEED = "0x6e44e50E3cc14DD16e01C590DC1d7020cb36eD4C";
const CHAINLINK_USDT_FEED = "0xF83696ca1b8a266163bE252bE2B94702D4929392";
const CHAINLINK_OP_FEED = "0x8907a105E562C9F3d7F2ed46539Ae36D87a15590";

const WBTC = "0x9f5039a86AF12AB10Ff16659eA0885bb4C04d013";
const WETH = "0x4200000000000000000000000000000000000006";
const USDC = "0x71B49d40B10Aa76cc44954e821eB6eA038Cf196F";
const USDT = "0x9AD0542c71c09B764cf58d38918892F3Ae7ecc63";
const OP = "0xEC5f6eB84677F562FC568B89121C5E5C19639776";

const ACM = "0x1652E12C8ABE2f0D84466F0fc1fA4286491B3BC1";
export const BOUND_VALIDATOR = "0x482469F1DA6Ec736cacF6361Ec41621f811A6800";

const STALE_PERIOD_26H = 60 * 60 * 26; // 26 hours (pricefeeds with heartbeat of 24 hr)
const STALE_PERIOD_30M = 60 * 30; // 30 minutes (pricefeeds with heartbeat of 30 minutes)

const vip001 = () => {
  return makeProposal([
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [opsepolia.RESILIENT_ORACLE, "pause()", opsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [opsepolia.RESILIENT_ORACLE, "unpause()", opsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [opsepolia.RESILIENT_ORACLE, "setOracle(address,address,uint8)", opsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [opsepolia.RESILIENT_ORACLE, "enableOracle(address,uint8,bool)", opsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [opsepolia.RESILIENT_ORACLE, "setTokenConfig(TokenConfig)", opsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [opsepolia.CHAINLINK_ORACLE, "setTokenConfig(TokenConfig)", opsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [opsepolia.CHAINLINK_ORACLE, "setDirectPrice(address,uint256)", opsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [BOUND_VALIDATOR, "setValidateConfig(ValidateConfig)", opsepolia.GUARDIAN],
    },
    {
      target: opsepolia.RESILIENT_ORACLE,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: opsepolia.CHAINLINK_ORACLE,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: BOUND_VALIDATOR,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: opsepolia.CHAINLINK_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[WBTC, CHAINLINK_BTC_FEED, STALE_PERIOD_30M]],
    },
    {
      target: opsepolia.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          WBTC,
          [
            opsepolia.CHAINLINK_ORACLE,
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
          ],
          [true, false, false],
        ],
      ],
    },
    {
      target: opsepolia.CHAINLINK_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[WETH, CHAINLINK_ETH_FEED, STALE_PERIOD_30M]],
    },
    {
      target: opsepolia.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          WETH,
          [
            opsepolia.CHAINLINK_ORACLE,
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
          ],
          [true, false, false],
        ],
      ],
    },
    {
      target: opsepolia.CHAINLINK_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[USDC, CHAINLINK_USDC_FEED, STALE_PERIOD_30M]],
    },
    {
      target: opsepolia.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          USDC,
          [
            opsepolia.CHAINLINK_ORACLE,
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
          ],
          [true, false, false],
        ],
      ],
    },
    {
      target: opsepolia.CHAINLINK_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[USDT, CHAINLINK_USDT_FEED, STALE_PERIOD_30M]],
    },
    {
      target: opsepolia.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          USDT,
          [
            opsepolia.CHAINLINK_ORACLE,
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
          ],
          [true, false, false],
        ],
      ],
    },
    {
      target: opsepolia.CHAINLINK_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[OP, CHAINLINK_OP_FEED, STALE_PERIOD_26H]],
    },
    {
      target: opsepolia.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          OP,
          [
            opsepolia.CHAINLINK_ORACLE,
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
          ],
          [true, false, false],
        ],
      ],
    },
    {
      target: opsepolia.CHAINLINK_ORACLE,
      signature: "setDirectPrice(address,uint256)",
      params: [opsepolia.XVS, "7000000000000000000"], // 7$
    },
    {
      target: opsepolia.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          opsepolia.XVS,
          [
            opsepolia.CHAINLINK_ORACLE,
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
          ],
          [true, false, false],
        ],
      ],
    },
  ]);
};

export default vip001;
