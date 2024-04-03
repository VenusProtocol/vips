import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const XVS_VAULT_TREASURY = "0x269ff7818DB317f60E386D2be0B259e1a324a40a";
export const VTREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
export const XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";
export const XVS_VAULT = "0x051100480289e704d20e9DB4804837068f3f9204";
export const XVS_VAULT_TREASURY_NEW_IMPLEMENTATION = "0x3AD53bDAD07302259B72C34b111C37a0486f68C2";

export const XVS_FOR_XVS_STORE = parseUnits("72905.06", 18);
export const XVS_FOR_V_TREASURY = parseUnits("21789.17", 18);
export const XVS_DISTRIBUTION_SPEED = "62500000000000000";

export const vip279 = () => {
  const meta = {
    version: "v2",
    title: "VIP-279",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: XVS_VAULT_TREASURY,
        signature: "fundXVSVault(uint256)",
        params: [XVS_FOR_XVS_STORE],
      },
      {
        target: XVS_VAULT,
        signature: "setRewardAmountPerBlock(address,uint256)",
        params: [XVS, XVS_DISTRIBUTION_SPEED],
      },
      {
        target: XVS_VAULT_TREASURY,
        signature: "upgradeTo(address)",
        params: [XVS_VAULT_TREASURY_NEW_IMPLEMENTATION],
      },
      // {
      //   target: XVS_VAULT_TREASURY,
      //   signature: "sweepToken(address,address,uint256)",
      //   params: [XVS, VTREASURY, XVS_FOR_V_TREASURY],
      // }
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip279;