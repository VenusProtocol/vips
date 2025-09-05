import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalMeta, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

export const CERTIK = "0x799d0Db297Dc1b5D114F3562c1EC30c9F7FDae39";
export const QUANTSTAMP = "0xd88139f832126b465a0d7A76be887912dc367016";
export const PESSIMISTIC = "0x1B3bCe9Bd90cF6598bCc0321cC10b48bfD6Cf12f";

export const USDT_BSC = "0x55d398326f99059fF775485246999027B3197955";
export const USDC_BSC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";

export const CERTIK_USDT_AMOUNT = parseUnits("17500", 18);
export const QUANTSTAMP_USDC_AMOUNT = parseUnits("32500", 18);
export const PESSIMISTIC_USDT_AMOUNT = parseUnits("4375", 18);

export const vip539 = () => {
  const meta: ProposalMeta = {
    version: "v2",
    title: "VIP-539 Payments issuance for audits and other expenses",
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
        params: [USDT_BSC, CERTIK_USDT_AMOUNT, CERTIK],
      },
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDC_BSC, QUANTSTAMP_USDC_AMOUNT, QUANTSTAMP],
      },
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT_BSC, PESSIMISTIC_USDT_AMOUNT, PESSIMISTIC],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip539;
