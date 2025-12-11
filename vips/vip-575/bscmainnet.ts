import { parseUnits } from "ethers/lib/utils";
import { ProposalMeta, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const vlisUSD = "0x689E0daB47Ab16bcae87Ec18491692BF621Dc6Ab";
export const RECEIVER_ADDRESS = "0x85CE862C5BB61938FFcc97DA4A80C8aaE43C6A27";
export const vlisUSD_AMOUNT = parseUnits("999989.99999999", 8);

export const vip575 = async () => {
  const meta: ProposalMeta = {
    version: "v2",
    title: "VIP-575 Venus VIP update week 50",
    description: `Date: [2025/12/08 - 2025/12/14]

### Sub-VIP #1 **[BNB Chain] Transfer the vlisUSD token back to listaDao**


Previously in  [VIP-473 [BNB Chain] New lisUSD market in the Core pool](https://app.venus.io/#/governance/proposal/473?chainId=56),  [Lista Dao Treasury](https://bscscan.com/address/0x1d60bBBEF79Fb9540D271Dbb01925380323A8f66) provided 1M listUSD as liquidity.  As the market is not ready at that time, Lista Dao [transferred the tokens into Venus Treasury](https://bscscan.com/tx/0xe9763da486d8a2755ffb37c0cc1734d3de1d254662327885a4076e7caaea973b) and now the market is stable, Lista Dao will like to have the liquidity transferred back to their treasury.

**Action :**

- If this VIP passed, Venus treasury will transfer 999989 lisUSD to 0x85CE862C5BB61938FFcc97DA4A80C8aaE43C6A27 (Provided by Lista Dao team)
`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: vlisUSD,
        signature: "transfer(address,uint256)",
        params: [RECEIVER_ADDRESS, vlisUSD_AMOUNT],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip575;
