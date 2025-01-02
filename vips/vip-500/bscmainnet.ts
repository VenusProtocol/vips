import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const XVSBridgeAdmin_Proxy = "0x70d644877b7b73800E9073BCFCE981eAaB6Dbc21";
export const USER1 = "0xC469eCb73159b88957965758002bBE1807532814";
export const USER2 = "0xB1d4464FDf3a6c6C2d6Ab93cCB40E8ff8D537653";
export const AMOUNT1 = "1050000000000000000000";
export const AMOUNT2 = "55676143000000";

const vip500 = () => {
  const meta = {
    version: "v2",
    title: "VIP-500 Refund lost XVS on base",
    description: `### Description`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposal(
    [
      {
        target: XVSBridgeAdmin_Proxy,
        signature: "fallbackWithdraw(address,uint256)",
        params: [USER1, AMOUNT1],
      },
      {
        target: XVSBridgeAdmin_Proxy,
        signature: "fallbackWithdraw(address,uint256)",
        params: [USER2, AMOUNT2],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip500;
