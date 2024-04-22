import { parseUnits } from "ethers/lib/utils";

import { NETWORK_ADDRESSES } from "../../src/networkAddresses";
import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const COMMUNITY_WALLET = "0xc444949e0054A23c44Fc45789738bdF64aed2391";

export const vip292 = () => {
  const meta = {
    version: "v2",
    title: "VIP-292 Transfer 5000 USDT to Community wallet",
    description: `This vip will transfer 5000 USDT to Community wallet to refund the bootstrap liquidity previously provided into the Treasury with DAI
                  [https://github.com/VenusProtocol/vips/blob/b7408ad7cbfae72cfd2b17106822b5c9b72537de/multisig/proposals/ethereum/vip-021/index.ts] in this multisig tx`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, parseUnits("5000", 18), COMMUNITY_WALLET],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
