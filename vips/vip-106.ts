import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const COMPTROLLER = "0xfd36e2c2a6789db23113685031d7f16329158384";
const ACM = "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555";
const CHAINLINK_ORACLE = "0x672Ba3b2f5d9c36F36309BA913D708C4a5a25eb0";
const RESILIENT_ORACLE = "0xe40C7548bFB764C48f9A037753A9F08c5B3Fde15";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";

const USDC_CHAINLINK_FEED = "0x51597f405303C4377E36123cBc172b13269EA163"
const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d"

const MAX_STALE_PERIOD = 60 * 60; // 1 hour

export const vip106 = () => {
  const meta = {
    version: "v2",
    title: "VIP-106 Resilient Oracle",
    description: `
    Configure Price Feeds for Existing Markets
    Configure Oracle Address in Comptroller
    `,
    forDescription: "I agree that Venus Protocol should proceed with this recommendation",
    againstDescription: "I do not think that Venus Protocol should proceed with this recommendation",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with this recommendation or not",
  };

  return makeProposal(
    [
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [CHAINLINK_ORACLE, "setTokenConfig(TokenConfig)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [RESILIENT_ORACLE, "setTokenConfig(TokenConfig)", NORMAL_TIMELOCK],
      },
      {
        target: CHAINLINK_ORACLE,
        signature: "setTokenConfig((address,address,uint256))",
        params: [[
          USDC, USDC_CHAINLINK_FEED, MAX_STALE_PERIOD
        ]],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            USDC,
            [CHAINLINK_ORACLE, "0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000"],
            [true,false,false]
          ]
        ]
      },
      {
        target: COMPTROLLER,
        signature: "_setPriceOracle(address)",
        params: [RESILIENT_ORACLE],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
