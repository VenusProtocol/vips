import { parseUnits } from "ethers/lib/utils";
import { ProposalMeta, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const vBNB_ADMIN = "0x9A7890534d9d91d473F28cB97962d176e2B65f1d";
export const vBNB = "0xA07c5b74C9B40447a954e1466938b865b6BBea36";
export const vWBNB = "0x6bCa74586218dB34cdB402295796b79663d816e9";
export const IRM = "0xBDb25F4D7c11979C98d830c4c2C6e9FbA0c2cBC9";
export const RESERVE_FACTOR = parseUnits("0.15", 18);

export const vip559 = async () => {
  const meta: ProposalMeta = {
    version: "v2",
    title: "VIP-559",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: vBNB_ADMIN,
        signature: "setInterestRateModel(address)",
        params: [IRM],
      },
      {
        target: vWBNB,
        signature: "_setInterestRateModel(address)",
        params: [IRM],
      },
      {
        target: vWBNB,
        signature: "_setReserveFactor(uint256)",
        params: [RESERVE_FACTOR],
      },
    ],
    meta,
    ProposalType.CRITICAL,
  );
};

export default vip559;
