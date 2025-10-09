import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalMeta, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

export const ARB_WITHDRAWN = parseUnits("1450.889", 18);
export const ETH_WITHDRAWN = parseUnits("40736.5574", 18);
export const ZKSYNC_WITHDRAWN = parseUnits("2904.6815", 18);
export const TOTAL_XVS = ARB_WITHDRAWN.add(ETH_WITHDRAWN).add(ZKSYNC_WITHDRAWN);

export const vip554 = async () => {
  const meta: ProposalMeta = {
    version: "v2",
    title: "VIP-554",
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
        params: [bscmainnet.XVS, TOTAL_XVS, bscmainnet.UNITROLLER],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip554;
