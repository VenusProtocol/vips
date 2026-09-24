import { parseUnits } from "ethers/lib/utils";
import { ProposalMeta, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const vBNB_ADMIN = "0x9A7890534d9d91d473F28cB97962d176e2B65f1d";
export const vBNB = "0xA07c5b74C9B40447a954e1466938b865b6BBea36";
export const vWBNB = "0x6bCa74586218dB34cdB402295796b79663d816e9";
export const vBNB_IRM = "0x5dff09a6D241eac6ccc63A7665CaC6eff55b38E7";
export const vWBNB_IRM = "0xb1c97b14dE87928845FCf0016b48B3a61aa3e1AD";
export const RESERVE_FACTOR = parseUnits("0.15", 18);

export const vip562 = async () => {
  const meta: ProposalMeta = {
    version: "v2",
    title: "VIP-562 [BNB Chain] BNB and WBNB market parameters update",
    description: `If passed, this VIP will perform the changes recommended by Chaos Labs in the Venus community forum publication[Proposal: IRM Adjustments for BNB and WBNB Markets on BNB Chain (Core Pool)](https://community.venus.io/t/proposal-irm-adjustments-for-bnb-and-wbnb-markets-on-bnb-chain-core-pool/5503):

- [BNB (Core pool)](https://app.venus.io/#/pool/0xfD36E2c2a6789Db23113685031d7F16329158384/market/0xA07c5b74C9B40447a954e1466938b865b6BBea36?chainId=56&tab=supply):
    - increase Kink 1 to 80% and Kink 2 to 90% utilization
    - set the borrow rate (APR) at Kink 1 to 2.5%
    - set the borrow rate (APR) at Kink 2 to 11%
    - reduce the max borrow rate (APR) at 100% utilization rate, from 77.15% to 45%
- [WBNB (Core pool)](https://app.venus.io/#/pool/0xfD36E2c2a6789Db23113685031d7F16329158384/market/0x6bCa74586218dB34cdB402295796b79663d816e9?chainId=56&tab=supply):
    - increase Kink 1 to 80% and Kink 2 to 90% utilization
    - set the borrow rate (APR) at Kink 1 to 5%
    - set the borrow rate (APR) at Kink 2 to 11%
    - reduce the max borrow rate (APR) at 100% utilization rate, from 77.15% to 45%
    - reduce the reserve factor from 30% to 15%

Complete analysis and details of these recommendations are available in the above publication.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: vBNB_ADMIN,
        signature: "setInterestRateModel(address)",
        params: [vBNB_IRM],
      },
      {
        target: vWBNB,
        signature: "_setInterestRateModel(address)",
        params: [vWBNB_IRM],
      },
      {
        target: vWBNB,
        signature: "_setReserveFactor(uint256)",
        params: [RESERVE_FACTOR],
      },
    ],
    meta,
    ProposalType.CRITICAL,
  );
};

export default vip562;
