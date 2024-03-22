import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { makeProposal } from "../../../../src/utils";

const { sepolia } = NETWORK_ADDRESSES;

const REDSTONE_XVS_FEED = "0x0d7697a15bce933cE8671Ba3D60ab062dA216C60";
const CHAINLINK_BTC_FEED = "0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43";
const CHAINLINK_ETH_FEED = "0x694AA1769357215DE4FAC081bf1f309aDC325306";
const CHAINLINK_USDC_FEED = "0xA2F78ab2355fe2f984D808B5CeE7FD0A93D5270E";

// VIP: Configures the new oracle with the ACL and configures the initial price feeds on this oracle
const vip001 = () => {
  return makeProposal([
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.RESILIENT_ORACLE, "pause()", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.RESILIENT_ORACLE, "unpause()", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.RESILIENT_ORACLE, "setOracle(address,address,uint8)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.RESILIENT_ORACLE, "enableOracle(address,uint8,bool)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.RESILIENT_ORACLE, "setTokenConfig(TokenConfig)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.CHAINLINK_ORACLE, "setTokenConfig(TokenConfig)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.REDSTONE_ORACLE, "setTokenConfig(TokenConfig)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.CHAINLINK_ORACLE, "setDirectPrice(address,uint256)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.REDSTONE_ORACLE, "setDirectPrice(address,uint256)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.BOUND_VALIDATOR, "setValidateConfig(ValidateConfig)", sepolia.NORMAL_TIMELOCK],
    },
    { target: sepolia.RESILIENT_ORACLE, signature: "acceptOwnership()", params: [] },
    { target: sepolia.CHAINLINK_ORACLE, signature: "acceptOwnership()", params: [] },
    { target: sepolia.BOUND_VALIDATOR, signature: "acceptOwnership()", params: [] },
    { target: sepolia.REDSTONE_ORACLE, signature: "acceptOwnership()", params: [] },
    {
      target: sepolia.CHAINLINK_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[sepolia.MOCK_WBTC, CHAINLINK_BTC_FEED, 144000]],
    },
    {
      target: sepolia.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          sepolia.MOCK_WBTC,
          [
            sepolia.CHAINLINK_ORACLE,
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
          ],
          [true, false, false],
        ],
      ],
    },
    {
      target: sepolia.CHAINLINK_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[sepolia.MOCK_WETH, CHAINLINK_ETH_FEED, 144000]],
    },
    {
      target: sepolia.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          sepolia.MOCK_WETH,
          [
            sepolia.CHAINLINK_ORACLE,
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
          ],
          [true, false, false],
        ],
      ],
    },
    {
      target: sepolia.CHAINLINK_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[sepolia.MOCK_USDC, CHAINLINK_USDC_FEED, 144000]],
    },
    {
      target: sepolia.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          sepolia.MOCK_USDC,
          [
            sepolia.CHAINLINK_ORACLE,
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
          ],
          [true, false, false],
        ],
      ],
    },
    {
      target: sepolia.CHAINLINK_ORACLE,
      signature: "setDirectPrice(address,uint256)",
      params: [sepolia.MOCK_USDT, "1000000000000000000"],
    },
    {
      target: sepolia.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          sepolia.MOCK_USDT,
          [
            sepolia.CHAINLINK_ORACLE,
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
          ],
          [true, false, false],
        ],
      ],
    },
    {
      target: sepolia.REDSTONE_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[sepolia.XVS, REDSTONE_XVS_FEED, 144000]],
    },
    {
      target: sepolia.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          sepolia.XVS,
          [
            sepolia.REDSTONE_ORACLE,
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
          ],
          [true, false, false],
        ],
      ],
    },
    {
      target: sepolia.CHAINLINK_ORACLE,
      signature: "setDirectPrice(address,uint256)",
      params: [sepolia.MOCK_CRV, "500000000000000000"],
    },
    {
      target: sepolia.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          sepolia.MOCK_CRV,
          [
            sepolia.CHAINLINK_ORACLE,
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
          ],
          [true, false, false],
        ],
      ],
    },
    {
      target: sepolia.CHAINLINK_ORACLE,
      signature: "setDirectPrice(address,uint256)",
      params: [sepolia.MOCK_crvUSD, "1000000000000000000"],
    },
    {
      target: sepolia.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          sepolia.MOCK_crvUSD,
          [
            sepolia.CHAINLINK_ORACLE,
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
