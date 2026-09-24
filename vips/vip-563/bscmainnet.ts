import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalMeta, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

export const BINANCE = "0x3c274B82b20a84A02d816Fd37EE096f7aC2cD396";
export const USDT_BSC = "0x55d398326f99059fF775485246999027B3197955";
export const BINANCE_AMOUNT = parseUnits("400000", 18);

export const vip563 = () => {
  const meta: ProposalMeta = {
    version: "v2",
    title: "VIP-563 [BNB Chain] Fund transfer for Binance marketing campaign",
    description: `If passed, this VIP will transfer 400,000 USDT from the Venus Treasury on BNB chain to the Binance team for a marketing campaign. The funds will be paid out entirely to users in rewards and incentives over the duration of the campaign.

The campaign will run for a period of 45 days and be part of a broader marketing campaign.`,
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

export default vip563;
