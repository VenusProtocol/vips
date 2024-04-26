import { parseUnits } from "ethers/lib/utils";

import { NETWORK_ADDRESSES } from "../../src/networkAddresses";
import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";

export const CERTIK = "0x4cf605b238e9c3c72d0faed64d12426e4a54ee12";
export const QUANTSTAMP = "0xd88139f832126b465a0d7A76be887912dc367016";
export const PESSIMISTIC = "0x1B3bCe9Bd90cF6598bCc0321cC10b48bfD6Cf12f";
export const FAIRYPROOF = "0x060a08fff78aedba4eef712533a324272bf68119";
export const CHAOS_LABS = "0xfb1912af5b9d3fb678f801bf764e98f1c217ef35";
export const COMMUNITY_WALLET = "0xc444949e0054A23c44Fc45789738bdF64aed2391";

export const CERTIK_AMOUNT = parseUnits("19000", 18);
export const QUANTSTAMP_AMOUNT = parseUnits("32500", 18);
export const PESSIMISTIC_AMOUNT = parseUnits("5000", 18);
export const FAIRYPROOF_AMOUNT = parseUnits("2500", 18);
export const CHAOS_LABS_AMOUNT = parseUnits("150000", 18);
export const COMMUNITY_WALLET_AMOUNT = parseUnits("10000", 18);

export const vip296 = () => {
  const meta = {
    version: "v2",
    title: "VIP-296 ",
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
        params: [USDT, CERTIK_AMOUNT, CERTIK],
      },
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDC, QUANTSTAMP_AMOUNT, QUANTSTAMP],
      },
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, PESSIMISTIC_AMOUNT, PESSIMISTIC],
      },
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, FAIRYPROOF_AMOUNT, FAIRYPROOF],
      },
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, CHAOS_LABS_AMOUNT, CHAOS_LABS],
      },
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, COMMUNITY_WALLET_AMOUNT, COMMUNITY_WALLET],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip296;
