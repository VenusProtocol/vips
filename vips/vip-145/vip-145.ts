import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const ACM = "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555";

const CHAINLINK_ORACLE_IMPL = "0x38120f83734F719dc199109e09A822a80CD26EAd";
const RESILIENT_ORACLE_IMPL = "0x95F9D968867E4fe89A1F768Ce853dB38d70eeC2B";
const BOUND_VALIDATOR_IMPL = "0xCf0612CeafD63709d8f7EfE71EcD0aAbF075f6b1";
const PYTH_ORACLE_IMPL = "0x1b8dE8fe17735B80E30e1bAbcD78A20F573a3e9e";
const TWAP_ORACLE_IMPL = "0x67c549A18AbfAd127b13F8d56738F43A21bB62A7";
const BINANCE_ORACLE_IMPL = "0x8bf46792022126aE7f3ac8F4914Ed66e7DEb7388";

const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";

const CHAINLINK_ORACLE = "0x1B2103441A0A108daD8848D8F5d790e4D402921F";
const RESILIENT_ORACLE = "0x6592b5DE802159F3E74B2486b091D11a8256ab8A";
const BOUND_VALIDATOR = "0x6E332fF0bB52475304494E4AE5063c1051c7d735";
const PYTH_ORACLE = "0xb893E38162f55fb80B18Aa44da76FaDf8E9B2262";
const TWAP_ORACLE = "0xea2f042e1A4f057EF8A5220e57733AD747ea8867";
const BINANCE_ORACLE = "0x594810b741d136f1960141C0d8Fb4a91bE78A820";

const PROXY_ADMIN = "0x1BB765b741A5f3C2A338369DAb539385534E3343";

const SD = "0x3bc5ac0dfdc871b365d159f728dd1b9a0b5481e8";

const MAX_STALE_PERIOD = 60 * 25;

export const vip145 = (maxStalePeriod?: number) => {
  const meta = {
    version: "v2",
    title: "VIP-145 Get price Upgrade",
    description: `
    Upgrade Oracle to Support Get Price Feature
    `,
    forDescription: "I agree that Venus Protocol should proceed with this recommendation",
    againstDescription: "I do not think that Venus Protocol should proceed with this recommendation",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with this recommendation or not",
  };

  return makeProposal(
    [
      {
        target: PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [RESILIENT_ORACLE, RESILIENT_ORACLE_IMPL],
      },
      {
        target: PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [CHAINLINK_ORACLE, CHAINLINK_ORACLE_IMPL],
      },
      {
        target: PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [BOUND_VALIDATOR, BOUND_VALIDATOR_IMPL],
      },
      {
        target: PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [PYTH_ORACLE, PYTH_ORACLE_IMPL],
      },
      {
        target: PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [TWAP_ORACLE, TWAP_ORACLE_IMPL],
      },
      {
        target: PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [BINANCE_ORACLE, BINANCE_ORACLE_IMPL],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [BINANCE_ORACLE, "setSymbolOverride(string,string)", NORMAL_TIMELOCK],
      },
      {
        target: BINANCE_ORACLE,
        signature: "setSymbolOverride(string,string)",
        params: ["WBNB", "BNB"],
      },
      {
        target: BINANCE_ORACLE,
        signature: "setSymbolOverride(string,string)",
        params: ["wBETH", "WBETH"],
      },
      {
        target: BINANCE_ORACLE,
        signature: "setMaxStalePeriod(string,uint256)",
        params: ["SD", maxStalePeriod || MAX_STALE_PERIOD],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            SD,
            [
              BINANCE_ORACLE,
              "0x0000000000000000000000000000000000000000",
              "0x0000000000000000000000000000000000000000",
            ],
            [true, false, false],
          ],
        ],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
