import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const ankrBNB = "0x52F24a5e03aee338Da5fd9Df68D2b6FAe1178827";
const ANKR = "0xf307910A4c7bbc79691fD374889b36d8531B08e3";
const POOL_REGISTRY = "0x9F7b01A536aFA00EF10310A162877fd792cD0666";
const VTOKEN_RECEIVER = "0xAE1c38847Fb90A13a2a1D7E5552cCD80c62C6508";
const vankrBNB_DeFi = "0x53728FD51060a85ac41974C6C3Eb1DaE42776723";
const REWARD_DISTRIBUTOR = "0x14d9A428D0f35f81A30ca8D8b2F3974D3CccB98B";
const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const COMPTROLLER_DeFi = "0x3344417c9360b963ca93A4e8305361AEde340Ab9";

export const vip146 = () => {
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
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [ankrBNB, parseUnits("39", 18), NORMAL_TIMELOCK],
      },
      {
        target: ankrBNB,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, 0],
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
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [ANKR, parseUnits("500000", 18), REWARD_DISTRIBUTOR],
      },
      {
        target: COMPTROLLER_DeFi,
        signature: "addRewardsDistributor(address)",
        params: [REWARD_DISTRIBUTOR],
      },
      {
        target: REWARD_DISTRIBUTOR,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: REWARD_DISTRIBUTOR,
        signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
        params: [[vankrBNB_DeFi], ["289351851851851851"], ["289351851851851851"]],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
