import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { sepolia } = NETWORK_ADDRESSES;

const REDSTONE_XVS_FEED = "0x0d7697a15bce933cE8671Ba3D60ab062dA216C60";
const BOUND_VALIDATOR = "0x60c4Aa92eEb6884a76b309Dd8B3731ad514d6f9B";
const REDSTONE_ORACLE = "0x4e6269Ef406B4CEE6e67BA5B5197c2FfD15099AE";
const CHAINLINK_BTC_FEED = "0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43";
const CHAINLINK_ETH_FEED = "0x694AA1769357215DE4FAC081bf1f309aDC325306";
const CHAINLINK_USDC_FEED = "0xA2F78ab2355fe2f984D808B5CeE7FD0A93D5270E";
const ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";
const MOCK_USDC = "0x772d68929655ce7234C8C94256526ddA66Ef641E";
const MOCK_USDT = "0x8d412FD0bc5d826615065B931171Eed10F5AF266";
const MOCK_WETH = "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9";
const MOCK_WBTC = "0x92A2928f5634BEa89A195e7BeCF0f0FEEDAB885b";
const MOCK_CRV = "0x2c78EF7eab67A6e0C9cAa6f2821929351bdDF3d3";
const MOCK_CRVUSD = "0x36421d873abCa3E2bE6BB3c819C0CF26374F63b6";

// VIP: Configures the new oracle with the ACL and configures the initial price feeds on this oracle
const vip001 = () => {
  return makeProposal([
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.RESILIENT_ORACLE, "pause()", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.RESILIENT_ORACLE, "unpause()", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.RESILIENT_ORACLE, "setOracle(address,address,uint8)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.RESILIENT_ORACLE, "enableOracle(address,uint8,bool)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.RESILIENT_ORACLE, "setTokenConfig(TokenConfig)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.CHAINLINK_ORACLE, "setTokenConfig(TokenConfig)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [REDSTONE_ORACLE, "setTokenConfig(TokenConfig)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.CHAINLINK_ORACLE, "setDirectPrice(address,uint256)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [REDSTONE_ORACLE, "setDirectPrice(address,uint256)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [BOUND_VALIDATOR, "setValidateConfig(ValidateConfig)", sepolia.NORMAL_TIMELOCK],
    },
    { target: sepolia.RESILIENT_ORACLE, signature: "acceptOwnership()", params: [] },
    { target: sepolia.CHAINLINK_ORACLE, signature: "acceptOwnership()", params: [] },
    { target: BOUND_VALIDATOR, signature: "acceptOwnership()", params: [] },
    { target: REDSTONE_ORACLE, signature: "acceptOwnership()", params: [] },
    {
      target: sepolia.CHAINLINK_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[MOCK_WBTC, CHAINLINK_BTC_FEED, 144000]],
    },
    {
      target: sepolia.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          MOCK_WBTC,
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
      params: [[MOCK_WETH, CHAINLINK_ETH_FEED, 144000]],
    },
    {
      target: sepolia.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          MOCK_WETH,
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
      params: [[MOCK_USDC, CHAINLINK_USDC_FEED, 144000]],
    },
    {
      target: sepolia.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          MOCK_USDC,
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
      params: [MOCK_USDT, "1000000000000000000"],
    },
    {
      target: sepolia.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          MOCK_USDT,
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
      target: REDSTONE_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[sepolia.XVS, REDSTONE_XVS_FEED, 144000]],
    },
    {
      target: sepolia.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          sepolia.XVS,
          [REDSTONE_ORACLE, "0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000"],
          [true, false, false],
        ],
      ],
    },
    {
      target: sepolia.CHAINLINK_ORACLE,
      signature: "setDirectPrice(address,uint256)",
      params: [MOCK_CRV, "500000000000000000"],
    },
    {
      target: sepolia.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          MOCK_CRV,
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
      params: [MOCK_CRVUSD, "1000000000000000000"],
    },
    {
      target: sepolia.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          MOCK_CRVUSD,
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
