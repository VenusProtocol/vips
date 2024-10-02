import { makeProposal } from "../../../../src/utils";

export const VTOKEN_BEACON = "0xfeD1d3a13597c5aBc893Af41ED5cb17e64c847c7";
export const NEW_VTOKEN_IMPLEMENTATION = "0x9aBbbc046a5b3d6338cE6fcEf470a0DA35Aa09D3";

export const vip023 = () => {
  return makeProposal([
    {
      target: VTOKEN_BEACON,
      signature: "upgradeTo(address)",
      params: [NEW_VTOKEN_IMPLEMENTATION],
    },
  ]);
};

export default vip023;
