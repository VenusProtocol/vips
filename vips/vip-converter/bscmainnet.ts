import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const XVS_VAULT_CONVERTER = "0xd5b9AE835F4C59272032B3B954417179573331E0";
export const XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";
export const USDT = "0x55d398326f99059fF775485246999027B3197955";

export const vipConverter = () => {
  const meta = {
    version: "v2",
    title: "VIP-Converter open the conversions of XVS/USDT in the XVSVaultConverter to everyone",
    description: ` This vip open the conversions of XVS/USDT in the XVSVaultConverter to everyone`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: XVS_VAULT_CONVERTER,
        signature: "setConversionConfig(address,address,(uint256,uint8))",
        params: [XVS, USDT, [0, 1]],
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};

export default vipConverter;
