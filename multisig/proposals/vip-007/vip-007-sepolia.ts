import { makeProposal } from "../../../src/utils";

export const XVS_VAULT_PROXY = "0x1129f882eAa912aE6D4f6D445b2E2b1eCbA99fd5";
export const XVS = "0x66ebd019E86e0af5f228a0439EBB33f045CBe63E";
export const POOL_ID = 0;
export const LOCK_PERIOD = 360;

export const vip007 = () => {
  return makeProposal([
    {
      target: XVS_VAULT_PROXY,
      signature: "setWithdrawalLockingPeriod(address,uint256,uint256)",
      params: [XVS, POOL_ID, LOCK_PERIOD],
    },
  ]);
};
