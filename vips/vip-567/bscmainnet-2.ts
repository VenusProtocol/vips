import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { CORE_MARKETS } from "./bscmainnet";

export const vip567Mainnet2 = () => {
  const meta = {
    version: "v2",
    title: "VIP-569 [BNB Chain] Enable flash loan feature for all markets on BSC Mainnet",
    description: `If passed, following the community proposal "[Whitelisted Flash Loans](https://community.venus.io/t/whitelisted-flash-loans/5527)", this VIP will perform the following actions:

- Enable flash loans on BSC Mainnet.

**Details**

This VIP is a follow-up to [VIP-567](https://app.venus.io/#/governance/proposal/567?chainId=56), which upgraded the corresponding contracts to support the flash loan feature.

`,
    forDescription: "Execute",
    againstDescription: "Do not execute",
    abstainDescription: "Abstain",
  };
  return makeProposal(
    [
      // Enable flash loans for all core markets
      ...CORE_MARKETS.map(vToken => ({
        target: vToken.address,
        signature: "setFlashLoanEnabled(bool)",
        params: [true],
      })),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip567Mainnet2;
