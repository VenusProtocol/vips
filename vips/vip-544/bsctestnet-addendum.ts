import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { cutParams as params } from "../../simulations/vip-544/utils/cur-params-bsctestnet.json";

export const cutParams = params;

const { bsctestnet } = NETWORK_ADDRESSES;

export const vip544_Addendum = () => {
  const meta = {
    version: "v2",
    title: "Configure Remote Risk Stewards",
    description: `#### Summary
Configure Remote Risk Stewards
`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: bsctestnet.UNITROLLER,
        signature: "diamondCut((address,uint8,bytes4[])[])",
        params: [cutParams],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip544_Addendum;
