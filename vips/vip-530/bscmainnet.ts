import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalMeta, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { zksyncmainnet } = NETWORK_ADDRESSES;
export const USDM = "0x7715c206A14Ac93Cb1A6c0316A6E5f8aD7c9Dc31";
export const PRICE = parseUnits("1", 18);

export const vip530 = async () => {
  const meta: ProposalMeta = {
    version: "v2",
    title: "VIP-530",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: zksyncmainnet.CHAINLINK_ORACLE,
        signature: "setDirectPrice(address,uint256)",
        params: [USDM, PRICE],
        dstChainId: LzChainId.zksyncmainnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip530;
