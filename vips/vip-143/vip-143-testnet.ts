import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const ankrBNB = "0x167F1F9EF531b3576201aa3146b13c57dbEda514";
const POOL_REGISTRY = "0xC85491616Fa949E048F3aAc39fbf5b0703800667";
const VTOKEN_RECEIVER = "0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706";
const vankrBNB_DeFi = "0x4AA3c85832084764a2B4DE812FA34B309f051610";

export const vip143 = () => {
  const meta = {
    version: "v2",
    title: "Add ankrBNB market to DeFi Pool",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with add market",
    againstDescription: "I do not think that Venus Protocol should proceed with add market",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with add market",
  };

  return makeProposal(
    [
      {
        target: ankrBNB,
        signature: "faucet(uint256)",
        params: [parseUnits("39", 18)],
      },
      {
        target: ankrBNB,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, "0"],
      },
      {
        target: ankrBNB,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, parseUnits("39", 18)],
      },
      {
        target: POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            vankrBNB_DeFi,
            "0",
            "0",
            parseUnits("39", 18),
            VTOKEN_RECEIVER,
            parseUnits("5000", 18),
            parseUnits("4000", 18),
          ],
        ],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
