import { makeProposal } from "../../../src/utils";

const TREASURY = "0x87123996F4287A10a8627C86E5786E4Cf1962849";

export const vip000 = () => {
  return makeProposal([
    {
      target: TREASURY,
      signature: "acceptOwnership()",
      params: [],
    },
  ]);
};
