import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalMeta, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { zksyncmainnet } = NETWORK_ADDRESSES;
export const wUSDM = "0xA900cbE7739c96D2B153a273953620A701d5442b";
export const vwUSDM = "0x183dE3C349fCf546aAe925E1c7F364EA6FB4033c";
export const AMOUNT = parseUnits("147630", 18);
export const wUSDMMLiquidator = "0x0192ffefb1dddb9d30afcccb12f60ceaad490807";
export const COMPTROLLER = "0xddE4D098D9995B659724ae6d5E3FB9681Ac941B1";

export const vip519 = () => {
  const meta: ProposalMeta = {
    version: "v2",
    title: "VIP-519",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: zksyncmainnet.VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [wUSDM, AMOUNT, zksyncmainnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: wUSDM,
        signature: "approve(address,uint256)",
        params: [vwUSDM, AMOUNT],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: COMPTROLLER,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [[vwUSDM], [0], false],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: vwUSDM,
        signature: "mintBehalf(address,uint256)",
        params: [wUSDMMLiquidator, AMOUNT],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: wUSDM,
        signature: "approve(address,uint256)",
        params: [vwUSDM, 0],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: COMPTROLLER,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [[vwUSDM], [0], true],
        dstChainId: LzChainId.zksyncmainnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip519;
