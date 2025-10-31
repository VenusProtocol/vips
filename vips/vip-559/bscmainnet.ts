import { parseUnits } from "ethers/lib/utils";
import { ProposalMeta, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const vBNB_ADMIN = "0x9A7890534d9d91d473F28cB97962d176e2B65f1d";
export const vBNB = "0xA07c5b74C9B40447a954e1466938b865b6BBea36";
export const vWBNB = "0x6bCa74586218dB34cdB402295796b79663d816e9";
export const vBNB_IRM = "0x5dff09a6D241eac6ccc63A7665CaC6eff55b38E7";
export const vWBNB_IRM = "0xb1c97b14dE87928845FCf0016b48B3a61aa3e1AD";
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
        params: [vBNB_IRM],
      },
      {
        target: vWBNB,
        signature: "_setInterestRateModel(address)",
        params: [vWBNB_IRM],
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
