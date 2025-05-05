import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const BTCB = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c";
export const BNB = "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB";
const { bscmainnet } = NETWORK_ADDRESSES;

export const vip500 = () => {
  const meta = {
    version: "v2",
    title: "VIP-500",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: bscmainnet.BINANCE_ORACLE,
        signature: "setSymbolOverride(string,string)",
        params: ["BTCB", "BTC"],
      },
      {
        target: bscmainnet.BINANCE_ORACLE,
        signature: "setMaxStalePeriod(string,uint256)",
        params: ["BTC", "100"],
      },
      {
        target: bscmainnet.BINANCE_ORACLE,
        signature: "setMaxStalePeriod(string,uint256)",
        params: ["BNB", "100"],
      },
      {
        target: bscmainnet.RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            BNB,
            [bscmainnet.REDSTONE_ORACLE, bscmainnet.CHAINLINK_ORACLE, bscmainnet.BINANCE_ORACLE],
            [true, true, true],
          ],
        ],
      },
      {
        target: bscmainnet.RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            BTCB,
            [bscmainnet.REDSTONE_ORACLE, bscmainnet.CHAINLINK_ORACLE, bscmainnet.BINANCE_ORACLE],
            [true, true, true],
          ],
        ],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip500;
