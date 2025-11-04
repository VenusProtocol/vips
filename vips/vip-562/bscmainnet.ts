import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalMeta, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

export const BINANCE = "0x8f0f345c908c176fc829f69858c3ad6fdd3bee9a";
export const USDT_BSC = "0x55d398326f99059fF775485246999027B3197955";
export const BINANCE_AMOUNT = parseUnits("400000", 18);

export const vip562 = () => {
  const meta: ProposalMeta = {
    version: "v2",
    title: "VIP-562",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT_BSC, BINANCE_AMOUNT, BINANCE],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip562;
