import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const BNB_TREASURY = "0x8b293600c50d6fbdc6ed4251cc75ece29880276f";
export const COMMUNITY_WALLET = "0xc444949e0054A23c44Fc45789738bdF64aed2391";

export const BTC = "0xA808e341e8e723DC6BA0Bb5204Bafc2330d7B8e4";
export const ETH = "0x98f7A83361F7Ac8765CcEBAB1425da6b341958a7";
export const USDT = "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c";

export const BTC_AMOUNT = parseUnits("0.3", 18);
export const ETH_AMOUNT = parseUnits("14", 18);
export const USDT_AMOUNT = parseUnits("40000", 6);

export const vip234Testnet = () => {
  const meta = {
    version: "v2",
    title: "VIP to transfer XVS to destination chain",
    description: ``,

    forDescription: "I agree that Venus Protocol should proceed with this transfer for XVS",
    againstDescription: "I do not think that Venus Protocol should proceed with this transfer for XVS",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with this transfer for XVS",
  };

  return makeProposal(
    [
      {
        target: BNB_TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [BTC, BTC_AMOUNT, COMMUNITY_WALLET],
      },
      {
        target: BNB_TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [ETH, ETH_AMOUNT, COMMUNITY_WALLET],
      },
      {
        target: BNB_TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, USDT_AMOUNT, COMMUNITY_WALLET],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
