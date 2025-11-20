import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

export const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
export const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const SolvBTC = "0x4aae823a6a0b376De6A78e74eCC5b079d38cBCf7";

export const ETH_REDSTONE_ORACLE_FEED = "0x9cF19D284862A66378c304ACAcB0E857EBc3F856";
export const USDC_REDSTONE_ORACLE_FEED = "0xeA2511205b959548459A01e358E0A30424dc0B70";
export const USDT_REDSTONE_ORACLE_FEED = "0xf57bA29437C130e155Ca4b65128630777638F05D";
export const SolvBTC_REDSTONE_ORACLE_FEED = "0xF5F641fF3c7E39876A76e77E84041C300DFa4550";

export const BOUND_VALIDATOR = "0x6E332fF0bB52475304494E4AE5063c1051c7d735";

export const HEARTBEAT_100_SECONDS = 100;
export const HEARTBEAT_25_HOURS = 25 * 60 * 60;
export const HEARTBEAT_13_HOURS = 13 * 60 * 60;
export const HEARTBEAT_7_HOURS = 7 * 60 * 60;

export const PRICE_LOWER_BOUND = parseUnits("0.99", 18);
export const PRICE_UPPER_BOUND = parseUnits("1.01", 18);

export const vip569 = () => {
  const meta = {
    version: "v2",
    title: "VIP-569",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: bscmainnet.BINANCE_ORACLE,
        signature: "setMaxStalePeriod(string,uint256)",
        params: ["ETH", HEARTBEAT_100_SECONDS],
      },
      {
        target: bscmainnet.BINANCE_ORACLE,
        signature: "setMaxStalePeriod(string,uint256)",
        params: ["USDC", HEARTBEAT_25_HOURS],
      },
      {
        target: bscmainnet.BINANCE_ORACLE,
        signature: "setMaxStalePeriod(string,uint256)",
        params: ["USDT", HEARTBEAT_25_HOURS],
      },
      {
        target: bscmainnet.BINANCE_ORACLE,
        signature: "setMaxStalePeriod(string,uint256)",
        params: ["SolvBTC", HEARTBEAT_13_HOURS],
      },
      {
        target: bscmainnet.REDSTONE_ORACLE,
        signature: "setTokenConfigs((address,address,uint256)[])",
        params: [[
          [ETH, ETH_REDSTONE_ORACLE_FEED, HEARTBEAT_7_HOURS],
          [USDC, USDC_REDSTONE_ORACLE_FEED, HEARTBEAT_7_HOURS],
          [USDT, USDT_REDSTONE_ORACLE_FEED, HEARTBEAT_7_HOURS],
          [SolvBTC, SolvBTC_REDSTONE_ORACLE_FEED, HEARTBEAT_7_HOURS],
        ]],
      },
      {
        target: bscmainnet.RESILIENT_ORACLE,
        signature: "setTokenConfigs((address,address[3],bool[3],bool)[])",
        params: [
          [
            [
              ETH,
              [bscmainnet.CHAINLINK_ORACLE, bscmainnet.REDSTONE_ORACLE, bscmainnet.BINANCE_ORACLE],
              [true, true, true],
              false,
            ],
            [
              USDC,
              [bscmainnet.CHAINLINK_ORACLE, bscmainnet.REDSTONE_ORACLE, bscmainnet.BINANCE_ORACLE],
              [true, true, true],
              false,
            ],
            [
              USDT,
              [bscmainnet.CHAINLINK_ORACLE, bscmainnet.REDSTONE_ORACLE, bscmainnet.BINANCE_ORACLE],
              [true, true, true],
              false,
            ],
            [
              SolvBTC,
              [bscmainnet.CHAINLINK_ORACLE, bscmainnet.REDSTONE_ORACLE, bscmainnet.BINANCE_ORACLE],
              [true, true, true],
              false,
            ],
          ],
        ],
      },
      {
        target: BOUND_VALIDATOR,
        signature: "setValidateConfigs((address,uint256,uint256)[])",
        params: [
          [
            [ETH, PRICE_UPPER_BOUND, PRICE_LOWER_BOUND],
            [USDC, PRICE_UPPER_BOUND, PRICE_LOWER_BOUND],
            [USDT, PRICE_UPPER_BOUND, PRICE_LOWER_BOUND],
            [SolvBTC, PRICE_UPPER_BOUND, PRICE_LOWER_BOUND]
          ]
        ],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip569;
