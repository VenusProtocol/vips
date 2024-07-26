import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { zksyncsepolia } = NETWORK_ADDRESSES;

const BOUND_VALIDATOR = "0x0A4daBeF41C83Af7e30FfC33feC56ba769f3D24b";
const REDSTONE_ORACLE = "0x3af097f1Dcec172D5ECdD0D1eFA6B118FF15f152";

const CHAINLINK_ETH_FEED = "0xfEefF7c3fB57d18C5C6Cdd71e45D2D0b4F9377bF";
const CHAINLINK_BTC_FEED = "0x95Bc57e794aeb02E4a16eff406147f3ce2531F83";
const CHAINLINK_USDC_FEED = "0x1844478CA634f3a762a2E71E3386837Bd50C947F";
const CHAINLINK_USDT_FEED = "0x07F05C2aFeb54b68Ea425CAbCcbF53E2d5605d76";
// const REDSTONE_XVS_FEED = ""; // TBD
const STALE_PERIOD_26H = 26 * 60 * 60; // 26 hours (pricefeeds with heartbeat of 24 hr)

const ACM = "0xD07f543d47c3a8997D6079958308e981AC14CD01";
const MOCK_USDC = "0x71ff1d2598035C401ED36C97f6cC4DFb05cd9495";
const MOCK_USDT = "0x9Bf62C9C6AaB7AB8e01271f0d7A401306579709B";
const WETH = "0x53F7e72C7ac55b44c7cd73cC13D4EF4b121678e6";
const MOCK_WBTC = "0xeF891B3FA37FfD83Ce8cC7b682E4CADBD8fFc6F0";
const MOCK_ZK = "0x8A2E9048F5d658E88D6eD89DdD1F3B5cA0250B9F";

// VIP: Configures the new oracle with the ACL and configures the initial price feeds on this oracle
const vip001 = () => {
  return makeProposal([
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [zksyncsepolia.RESILIENT_ORACLE, "pause()", zksyncsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [zksyncsepolia.RESILIENT_ORACLE, "unpause()", zksyncsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [zksyncsepolia.RESILIENT_ORACLE, "setOracle(address,address,uint8)", zksyncsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [zksyncsepolia.RESILIENT_ORACLE, "enableOracle(address,uint8,bool)", zksyncsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [zksyncsepolia.RESILIENT_ORACLE, "setTokenConfig(TokenConfig)", zksyncsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [zksyncsepolia.CHAINLINK_ORACLE, "setTokenConfig(TokenConfig)", zksyncsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [REDSTONE_ORACLE, "setTokenConfig(TokenConfig)", zksyncsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [zksyncsepolia.CHAINLINK_ORACLE, "setDirectPrice(address,uint256)", zksyncsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [REDSTONE_ORACLE, "setDirectPrice(address,uint256)", zksyncsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [BOUND_VALIDATOR, "setValidateConfig(ValidateConfig)", zksyncsepolia.NORMAL_TIMELOCK],
    },
    { target: zksyncsepolia.RESILIENT_ORACLE, signature: "acceptOwnership()", params: [] },
    { target: zksyncsepolia.CHAINLINK_ORACLE, signature: "acceptOwnership()", params: [] },
    { target: BOUND_VALIDATOR, signature: "acceptOwnership()", params: [] },
    { target: REDSTONE_ORACLE, signature: "acceptOwnership()", params: [] },
    {
      target: zksyncsepolia.CHAINLINK_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[MOCK_WBTC, CHAINLINK_BTC_FEED, STALE_PERIOD_26H]],
    },
    {
      target: zksyncsepolia.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          MOCK_WBTC,
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
      target: zksyncsepolia.CHAINLINK_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[WETH, CHAINLINK_ETH_FEED, STALE_PERIOD_26H]],
    },
    {
      target: zksyncsepolia.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          WETH,
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
      target: zksyncsepolia.CHAINLINK_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[MOCK_USDT, CHAINLINK_USDT_FEED, STALE_PERIOD_26H]],
    },
    {
      target: zksyncsepolia.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          MOCK_USDT,
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
      target: zksyncsepolia.CHAINLINK_ORACLE,
      signature: "setDirectPrice(address,uint256)",
      params: [MOCK_ZK, "200000000000000000"],
    },
    {
      target: zksyncsepolia.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          MOCK_ZK,
          [
            zksyncsepolia.CHAINLINK_ORACLE,
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
          ],
          [true, false, false],
        ],
      ],
    },
    // {
    //   target: REDSTONE_ORACLE,
    //   signature: "setTokenConfig((address,address,uint256))",
    //   params: [[zksyncsepolia.XVS, REDSTONE_XVS_FEED, STALE_PERIOD_26H]],
    // },

    {
      target: REDSTONE_ORACLE,
      signature: "setDirectPrice(address,uint256)",
      params: [zksyncsepolia.XVS, "7000000000000000000"], // 7$
    },

    {
      target: zksyncsepolia.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          zksyncsepolia.XVS,
          [REDSTONE_ORACLE, "0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000"],
          [true, false, false],
        ],
      ],
    },
  ]);
};

export default vip001;
