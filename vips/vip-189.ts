import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const ACCESS_CONTROL_MANAGER = "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555";
const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const BUSD_LIQUIDATOR = "0x3f033c0827acb54a791EaaaE90d820f223Acf8e3";
const ZERO_RATE_MODEL = "0x93FBc248e83bc8931141ffC7f457EC882595135A";
const VBUSD = "0x95c78222B3D6e262426483D42CfA53685A67Ab9D";

const ACTION_LIQUIDATE = 5;

export const vip189 = () => {
  const meta = {
    version: "v2",
    title: "VIP-189 BUSD Liquidator",
    description: ``,

    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: BUSD_LIQUIDATOR,
        signature: "acceptOwnership()",
        params: [],
      },

      {
        target: VBUSD,
        signature: "_setInterestRateModel(address)",
        params: [ZERO_RATE_MODEL],
      },

      {
        target: COMPTROLLER,
        signature: "_setForcedLiquidation(address,bool)",
        params: [VBUSD, true],
      },

      {
        target: COMPTROLLER,
        signature: "_setActionsPaused(address[],uint8[],bool)",
        params: [[VBUSD], [ACTION_LIQUIDATE], true],
      },

      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [COMPTROLLER, "_setActionsPaused(address[],uint8[],bool)", BUSD_LIQUIDATOR],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
