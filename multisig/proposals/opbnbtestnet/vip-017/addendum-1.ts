import { makeProposal } from "../../../../src/utils";

export const COMPTROLLER_BEACON = "0x2020BDa1F931E07B14C9d346E2f6D5943b4cd56D";
export const VTOKEN_BEACON = "0xcc633492097078Ae590C0d11924e82A23f3Ab3E2";

export const NEW_COMPTROLLER_IMPLEMENTATION = "0x17f5D66Fd99FF19B862C831137c39c0B5624e23C";
export const NEW_VTOKEN_IMPLEMENTATION = "0xd63c59d954A8888e7631ebc2CCc860FDB8Ae85Ad";
export const NATIVE_TOKEN_GATEWAY = "0x78FB73687209019CC1799B99Af30b6FB0A5b8e14";

const vip017 = () => {
  return makeProposal([
    {
      target: COMPTROLLER_BEACON,
      signature: "upgradeTo(address)",
      params: [NEW_COMPTROLLER_IMPLEMENTATION],
    },
    {
      target: VTOKEN_BEACON,
      signature: "upgradeTo(address)",
      params: [NEW_VTOKEN_IMPLEMENTATION],
    },
    {
      target: NATIVE_TOKEN_GATEWAY,
      signature: "acceptOwnership()",
      params: [],
    },
  ]);
};

export default vip017;
