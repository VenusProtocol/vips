import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const XVS_VAULT_PROXY = "0x051100480289e704d20e9DB4804837068f3f9204";
const XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";
const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
const USDT = "0x55d398326f99059ff775485246999027b3197955";
const COMMUNITY_WALLET = "0xc444949e0054A23c44Fc45789738bdF64aed2391";

export const vip144 = () => {
  const meta = {
    version: "v2",
    title: "VIP-144 Set XVS Vault Reward Amount",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with this proposal or not",
  };

  return makeProposal(
    [
      {
        target: XVS_VAULT_PROXY,
        signature: "setRewardAmountPerBlock(address,uint256)",
        params: [XVS, "61805555555555555"],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, parseUnits("9216", 18), COMMUNITY_WALLET],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
