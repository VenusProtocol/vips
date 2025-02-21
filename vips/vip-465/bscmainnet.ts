import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const VANGUARD_TREASURY = "0xf645a387180F5F74b968305dF81d54EB328d21ca";
export const USDT = "0x55d398326f99059fF775485246999027B3197955";

const vip465 = () => {
  const meta = {
    version: "v2",
    title: "",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: NETWORK_ADDRESSES.bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, parseUnits("5000", 18), VANGUARD_TREASURY],
      },
    ],

    meta,
    ProposalType.REGULAR,
  );
};

export default vip465;
