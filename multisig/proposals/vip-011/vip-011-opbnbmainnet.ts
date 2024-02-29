import { makeProposal } from "../../../src/utils";

const VToken_vWBNB_Core = "0x53d11cB8A0e5320Cd7229C3acc80d1A0707F2672";
const VToken_vWBNB_Core_IRM = "0x0b7cdC617bFE8e63D7861AbC1139811b61DbC869";

export const vip011 = () => {
  return makeProposal([
    {
      target: VToken_vWBNB_Core,
      signature: "setInterestRateModel(address)",
      params: [VToken_vWBNB_Core_IRM],
    },
  ]);
};
