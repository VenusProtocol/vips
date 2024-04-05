import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const XVS_VAULT_TREASURY = "0x317c6C4c9AA7F87170754DB08b4804dD689B68bF";
export const VTREASURY = "0x8b293600c50d6fbdc6ed4251cc75ece29880276f";
export const XVS = "0xB9e0E753630434d7863528cc73CB7AC638a7c8ff";

export const XVS_FOR_V_TREASURY = parseUnits("490", 18);

export const vip280 = () => {
  const meta = {
    version: "v2",
    title: "VIP-280",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: XVS_VAULT_TREASURY,
        signature: "sweepToken(address,address,uint256)",
        params: [XVS, VTREASURY, XVS_FOR_V_TREASURY],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip280;
