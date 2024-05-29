import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const vWBNB_IR = "0xdE41feaB3B17C05Ba596b11E2C8d9f3514B71d22";
export const vWBNB = "0xe10E80B7FD3a29fE46E16C30CC8F4dd938B742e2";

const vip315 = () => {
  const meta = {
    version: "v2",
    title: "VIP-315 Chaos Labs Recommendation",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: vWBNB,
        signature: "setInterestRateModel(address)",
        params: [vWBNB_IR],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip315;
