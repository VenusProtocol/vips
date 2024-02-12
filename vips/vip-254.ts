import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
const WBNB_AMOUNT = parseUnits("45", 18);

export const OPBNB_BRIDGE = "0xF05F0e4362859c3331Cb9395CBC201E3Fa6757Ea";
export const BRIDGE_ASSETS = [
  {
    name: "BTCB",
    localAddress: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
    remoteAddress: "0x7c6b91d9be155a6db01f749217d76ff02a7227f2",
    amount: parseUnits("0.3", 18),
  },

  {
    name: "ETH",
    localAddress: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
    remoteAddress: "0xe7798f023fc62146e8aa1b36da45fb70855a77ea",
    amount: parseUnits("5", 18),
  },

  {
    name: "USDT",
    localAddress: "0x55d398326f99059fF775485246999027B3197955",
    remoteAddress: "0x9e5aac1ba1a2e6aed6b32689dfcf62a509ca96f3",
    amount: parseUnits("10000", 18),
  },

  {
    name: "FDUSD",
    localAddress: "0xc5f0f7b66764F6ec8C8Dff7BA683102295E16409",
    remoteAddress: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
    amount: parseUnits("1000", 18), // TBC
  },
];

export const vip254 = () => {
  const meta = {
    version: "v2",
    title: "VIP-254",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with these proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with these proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with these proposal",
  };

  return makeProposal(
    [
      ...BRIDGE_ASSETS.map(market => {
        return {
          target: TREASURY,
          signature: "withdrawTreasuryBEP20(address,uint256,address)",
          params: [market.localAddress, market.amount, NORMAL_TIMELOCK],
        };
      }),

      ...BRIDGE_ASSETS.map(market => {
        return {
          target: market.localAddress,
          signature: "approve(address,uint256)",
          params: [OPBNB_BRIDGE, market.amount],
        };
      }),

      ...BRIDGE_ASSETS.map(market => {
        return {
          target: OPBNB_BRIDGE,
          signature: "bridgeERC20To(address,address,address,uint256,uint32,bytes)",
          params: [market.localAddress, market.remoteAddress, TREASURY, market.amount, 1, "0x"],
        };
      }),

      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [WBNB, WBNB_AMOUNT, NORMAL_TIMELOCK],
      },

      {
        target: WBNB,
        signature: "withdraw(uint256)",
        params: [WBNB_AMOUNT],
      },
      {
        target: OPBNB_BRIDGE,
        signature: "bridgeETHTo(address,uint32,bytes)",
        params: [TREASURY, 1, "0x"],
        value: WBNB_AMOUNT.toString(),
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
