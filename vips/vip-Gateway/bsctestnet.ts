import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const COMPTROLLER_BEACON = "0xdddd7725c073105fb2abfcbdec16708fc4c24b74";
export const VTOKEN_BEACON = "0xBF85A90673E61956f8c79b9150BAB7893b791bDd";
export const NEW_COMPTROLLER_IMPLEMENTATION = "0x2Ba2fbFeBaA90eda758bc16f89DB6216387f4488";
export const NEW_VTOKEN_IMPLEMENTATION = "0x344cD779C5aAF3436795B49f7C375E716A20f527";
export const NATIVE_TOKEN_GATEWAY = "0xc2FF955724a4c07DdB13b65f4dA4Ca8B9c49E7c5";

export const vipGateway = () => {
  const meta = {
    version: "v2",
    title: "VIP-Gateway Update VToken and comptroller implementation and introduce NativeTokenGateway contract",
    description: `
    This VIP updates the implementation of VToken and Comptroller
    Also accepts the ownership of the NativeTokenGateway contract`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
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
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vipGateway;
