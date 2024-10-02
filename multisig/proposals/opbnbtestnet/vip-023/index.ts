import { makeProposal } from "../../../../src/utils";

export const VTOKEN_BEACON = "0xcc633492097078Ae590C0d11924e82A23f3Ab3E2";
export const NEW_VTOKEN_IMPLEMENTATION = "0xbd3AAd064295dcA0f45fab4C6A5adFb0D23a19D2";

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
