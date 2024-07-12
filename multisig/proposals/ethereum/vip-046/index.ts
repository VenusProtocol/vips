import { parseUnits } from "ethers/lib/utils";

import { makeProposal } from "../../../../src/utils";

export const XVS_VAULT_TREASURY = "0xaE39C38AF957338b3cEE2b3E5d825ea88df02EfE";

export const XVS_STORE_TRANSFER_AMOUNT = parseUnits("22500", 18);

export const vip046 = () => {
  return makeProposal([
    {
      target: XVS_VAULT_TREASURY,
      signature: "fundXVSVault(uint256)",
      params: [XVS_STORE_TRANSFER_AMOUNT],
    },
  ]);
};

export default vip046;
