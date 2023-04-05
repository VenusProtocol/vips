import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const ACM = "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555";
const LIQUIDATOR = "0x0870793286aada55d39ce7f82fb2766e8004cf43";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";

export const vipLiquidator = () => {
  const meta = {
    version: "v2",
    title: "VIP-Liquidator Upgrades",
    description: `
    Update the implementation of liquidator to use ACM instead of onlyOwner
    `,
    forDescription: "I agree that Venus Protocol should proceed with the Vault Upgrades",
    againstDescription: "I do not think that Venus Protocol should proceed with the Vault Upgrades",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with the Vault Upgrades or not",
  };

  return makeProposal(
    [
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [LIQUIDATOR, "restrictLiquidation(address)", NORMAL_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [LIQUIDATOR, "unrestrictLiquidation(address)", NORMAL_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [LIQUIDATOR, "addToAllowlist(address,address)", NORMAL_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [LIQUIDATOR, "removeFromAllowlist(address,address)", NORMAL_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [LIQUIDATOR, "setTreasuryPercent(uint256)", NORMAL_TIMELOCK],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
