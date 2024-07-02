import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const COMPTROLLER_IMPL = "0x2CF0e211c99dFd28892cf80D142aA27a9042Dbf4";
export const COMPTROLLER_TEMP_IMPL = "0x6F16a377323ab1e34a9a7a06a4E68EbcCeB10A72";
export const COMPTROLLER_BEACON = "0xdDDD7725C073105fB2AbfCbdeC16708fC4c24B74";
export const COMPTROLLER_LST = "0x596B11acAACF03217287939f88d63b51d3771704";
export const REWARDS_DISTRIBUTOR_ankrBNB = "0x7df11563c6b6b8027aE619FD9644A647dED5893B";

const vip329 = () => {
  const meta = {
    version: "v2",
    title: "VIP-329",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER_BEACON,
        signature: "upgradeTo(address)",
        params: [COMPTROLLER_TEMP_IMPL],
      },
      {
        target: COMPTROLLER_LST,
        signature: "removeRewardsDistributor(address)",
        params: [REWARDS_DISTRIBUTOR_ankrBNB],
      },
      {
        target: COMPTROLLER_BEACON,
        signature: "upgradeTo(address)",
        params: [COMPTROLLER_IMPL],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip329;
