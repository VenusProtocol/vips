import { parseUnits } from "ethers/lib/utils";
import { ProposalMeta, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const vlisUSD = "0x689E0daB47Ab16bcae87Ec18491692BF621Dc6Ab";
export const RECEIVER_ADDRESS = "0x85CE862C5BB61938FFcc97DA4A80C8aaE43C6A27";
export const vlisUSD_AMOUNT = parseUnits("999989", 8);

export const vip575 = async () => {
  const meta: ProposalMeta = {
    version: "v2",
    title: "VIP-575 Venus VIP update week 50",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: vlisUSD,
        signature: "transfer(address,uint256)",
        params: [RECEIVER_ADDRESS, vlisUSD_AMOUNT],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip575;
