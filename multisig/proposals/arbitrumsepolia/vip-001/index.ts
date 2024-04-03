import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { makeProposal } from "../../../../src/utils";

const { arbitrumsepolia } = NETWORK_ADDRESSES;

const CHAINLINK_BTC_FEED = "0x56a43EB56Da12C0dc1D972ACb089c06a5dEF8e69";
const CHAINLINK_ETH_FEED = "0xd30e2101a97dcbAeBCBC04F14C3f624E67A35165";
const CHAINLINK_USDC_FEED = "0x0153002d20B96532C639313c2d54c3dA09109309";
const CHAINLINK_USDT_FEED = "0x80EDee6f667eCc9f63a0a6f55578F870651f06A4";
const CHAINLINK_ARB_FEED = "0xD1092a65338d049DB68D7Be6bD89d17a0929945e";

const vip001 = () => {
  return makeProposal([
    {
      target: arbitrumsepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [arbitrumsepolia.RESILIENT_ORACLE, "pause()", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: arbitrumsepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [arbitrumsepolia.RESILIENT_ORACLE, "unpause()", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: arbitrumsepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [arbitrumsepolia.RESILIENT_ORACLE, "setOracle(address,address,uint8)", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: arbitrumsepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [arbitrumsepolia.RESILIENT_ORACLE, "enableOracle(address,uint8,bool)", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: arbitrumsepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [arbitrumsepolia.RESILIENT_ORACLE, "setTokenConfig(TokenConfig)", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: arbitrumsepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [arbitrumsepolia.CHAINLINK_ORACLE, "setTokenConfig(TokenConfig)", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: arbitrumsepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [arbitrumsepolia.CHAINLINK_ORACLE, "setDirectPrice(address,uint256)", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: arbitrumsepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [arbitrumsepolia.BOUND_VALIDATOR, "setValidateConfig(ValidateConfig)", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: arbitrumsepolia.RESILIENT_ORACLE,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: arbitrumsepolia.CHAINLINK_ORACLE,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: arbitrumsepolia.BOUND_VALIDATOR,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: arbitrumsepolia.CHAINLINK_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[arbitrumsepolia.MOCK_WBTC, CHAINLINK_BTC_FEED, 144000]],
    },
    {
      target: arbitrumsepolia.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          arbitrumsepolia.MOCK_WBTC,
          [
            arbitrumsepolia.CHAINLINK_ORACLE,
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
          ],
          [true, false, false],
        ],
      ],
    },
    {
      target: arbitrumsepolia.CHAINLINK_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[arbitrumsepolia.MOCK_WETH, CHAINLINK_ETH_FEED, 144000]],
    },
    {
      target: arbitrumsepolia.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          arbitrumsepolia.MOCK_WETH,
          [
            arbitrumsepolia.CHAINLINK_ORACLE,
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
          ],
          [true, false, false],
        ],
      ],
    },
    {
      target: arbitrumsepolia.CHAINLINK_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[arbitrumsepolia.MOCK_USDC, CHAINLINK_USDC_FEED, 144000]],
    },
    {
      target: arbitrumsepolia.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          arbitrumsepolia.MOCK_USDC,
          [
            arbitrumsepolia.CHAINLINK_ORACLE,
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
          ],
          [true, false, false],
        ],
      ],
    },
    {
      target: arbitrumsepolia.CHAINLINK_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[arbitrumsepolia.MOCK_USDT, CHAINLINK_USDT_FEED, 144000]],
    },
    {
      target: arbitrumsepolia.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          arbitrumsepolia.MOCK_USDT,
          [
            arbitrumsepolia.CHAINLINK_ORACLE,
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
          ],
          [true, false, false],
        ],
      ],
    },
    {
      target: arbitrumsepolia.CHAINLINK_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[arbitrumsepolia.MOCK_ARB, CHAINLINK_ARB_FEED, 144000]],
    },
    {
      target: arbitrumsepolia.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          arbitrumsepolia.MOCK_ARB,
          [
            arbitrumsepolia.CHAINLINK_ORACLE,
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
