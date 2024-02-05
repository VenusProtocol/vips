import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const BINANCE_ORACLE = "0x1AD1A94550308f9f85871c8b68ac8442C39EE60b";
export const CRITICAL_TIMELOCK = "0x213c446ec11e45b15a6E29C1C1b402B8897f606d";
export const FAST_TRACK_TIMELOCK = "0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02";
export const ACM = "0x4788629abc6cfca10f9f969efdeaa1cf70c23555";
export const ORACLE_GUARDIAN = "0x3a3284dC0FaFfb0b5F0d074c4C704D14326C98cF";
export const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
export const RESILIENT_ORACLE = "0x6592b5DE802159F3E74B2486b091D11a8256ab8A";
const SnBNB = "0xB0b84D294e0C75A6abe60171b70edEb2EFd14A1B";
const HAY = "0x0782b6d8c4551B9760e74c0545a9bCD90bdc41E5";

export const vip248 = () => {
  const meta = {
    version: "v2",
    title: "VIP-248 Symbol Override and Stale Period Configuration for lisUSD and slisBNB",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: BINANCE_ORACLE,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: BINANCE_ORACLE,
        signature: "setMaxStalePeriod(string,uint256)",
        params: ["lisUSD", 1500],
      },
      {
        target: BINANCE_ORACLE,
        signature: "setMaxStalePeriod(string,uint256)",
        params: ["slisBNB", 1500],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            SnBNB,
            [
              BINANCE_ORACLE,
              "0x0000000000000000000000000000000000000000",
              "0x0000000000000000000000000000000000000000",
            ],
            [true, false, false],
          ],
        ],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            HAY,
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
    ProposalType.CRITICAL,
  );
};

export default vip248;