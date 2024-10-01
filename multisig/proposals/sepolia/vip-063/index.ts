import { makeProposal } from "../../../../src/utils";

export const VTOKEN_BEACON = "0x0463a7E5221EAE1990cEddB51A5821a68cdA6008";
export const NEW_VTOKEN_IMPLEMENTATION = "0xF360E6470C82EbCa1ECA1de1016A4c18fFE67C48";

export const vip063 = () => {
  return makeProposal([
    {
      target: VTOKEN_BEACON,
      signature: "upgradeTo(address)",
      params: [NEW_VTOKEN_IMPLEMENTATION],
    },
  ]);
};

export default vip063;
