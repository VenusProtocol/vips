import { ProposalMeta, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const vUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
export const vUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
export const vUSDT_IRM = "0x1a7c9091973CABc491e361A9eaEFD047b48a3647";
export const vUSDC_IRM = "0xF48508A44da9C7D210a668eCe4d31Bc98702602b";

export const vip549 = async () => {
  const meta: ProposalMeta = {
    version: "v2",
    title: "VIP-549 [BNB Chain] Risk Parameters Adjustments (USDT, USDC)",
    description: `If passed, this VIP will perform the changes recommended by Chaos Labs in the Venus community forum publication [Proposal: IRM Adjustments for USDC and USDT on BNB Chain Core Pool](https://community.venus.io/t/proposal-irm-adjustments-for-usdc-and-usdt-on-bnb-chain-core-pool/5367/7):

- [USDT (Core pool)](https://app.venus.io/#/pool/0xfD36E2c2a6789Db23113685031d7F16329158384/market/0xfD5840Cd36d94D7229439859C0112a4185BC0255?chainId=56&tab=supply):
    - decrease the borrow rate (APR) at Kink 1, from 8% to 7%
    - decrease the borrow rate (APR) at Kink 2, from 15% to 9%
    - decrease the borrow rate (APR) at 100% utilization rate, from 45% to 40%
- [USDC (Core pool)](https://app.venus.io/#/pool/0xfD36E2c2a6789Db23113685031d7F16329158384/market/0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8?chainId=56&tab=supply):
    - decrease the borrow rate (APR) at Kink 1, from 8% to 6.5%
    - decrease the borrow rate (APR) at Kink 2, from 15% to 8.5%
    - decrease the borrow rate (APR) at 100% utilization rate, from 45% to 40%

Complete analysis and details of these recommendations are available in the above publication.

### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/616)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: vUSDT,
        signature: "_setInterestRateModel(address)",
        params: [vUSDT_IRM],
      },
      {
        target: vUSDC,
        signature: "_setInterestRateModel(address)",
        params: [vUSDC_IRM],
      },
    ],
    meta,
    ProposalType.CRITICAL,
  );
};

export default vip549;
