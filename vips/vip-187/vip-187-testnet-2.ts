import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const XVSBridgeAdmin_Proxy = "0x5D08D49A2e43aC4c72C60754d1550BA12e846d66";

export const MIN_DST_GAS = "300000";
export const DEST_CHAIN_ID = 10161;

export const vip187Testnet2 = () => {
  const meta = {
    version: "v2",
    title: "VIP to update gas parameters in XVS bridge",
    description: ``,

    forDescription: "I agree that Venus Protocol should proceed with this configuration for XVS Bridge",
    againstDescription: "I do not think that Venus Protocol should proceed with this configuration for XVS Bridge",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with this configuration for XVS Bridge",
  };

  return makeProposal(
    [
      {
        target: XVSBridgeAdmin_Proxy,
        signature: "setMinDstGas(uint16,uint16,uint256)",
        params: [DEST_CHAIN_ID, 0, MIN_DST_GAS],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
