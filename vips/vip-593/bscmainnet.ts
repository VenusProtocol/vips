import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const UNITROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const SWAP_ROUTER = "0xde7E4f67Af577F29e5F3B995f9e67FD425F73621";
export const SWAP_HELPER = "0xD79be25aEe798Aa34A9Ba1230003d7499be29A24";

export const vip593 = () => {
  const meta = {
    version: "v2",
    title: "VIP-593 [BNB Chain] Swap & Supply and Swap & Repay",
    description: `This proposal is informed by the Venus community forum publication [Swap & Supply and Swap & Repay](https://community.venus.io/t/proposal-swap-supply-and-swap-repay/5681).

It introduces **Swap & Supply** and **Swap & Repay** on BNB Chain, two features designed to simplify user interactions with Venus markets by enabling token swaps and protocol actions within a single transaction.

**Swap & Supply** enables users to supply assets to a market using a different token, with the SwapRouter performing the conversion and supply in a single transaction.

**Swap & Repay** enables users to repay borrowed assets using any token, simplifying debt management and improving responsiveness during risk scenarios.

These features aim to improve capital efficiency, reduce transaction complexity, and enhance usability, while maintaining existing protocol safeguards such as slippage protection and automatic handling of excess tokens.

**Action :**

- Deploy and integrate a **SwapRouter** on BNB Chain to support aggregated token swaps within Venus
- Enable **Swap & Supply**, allowing users to supply assets using any supported token via a single transaction
- Enable **Swap & Repay**, allowing users to repay borrowed assets using any supported token via a single transaction
- Integrate multiple swap aggregators to optimize execution pricing and liquidity sourcing
- Implement safeguards including minimum output checks and automatic return of excess tokens
- Ensure compatibility with existing Venus markets and risk management mechanisms

If approved, this VIP will introduce Swap & Supply and Swap & Repay on BNB Chain to improve user experience, reduce friction, and enhance capital efficiency across Venus markets.`,
    forDescription: "Execute",
    againstDescription: "Do not execute",
    abstainDescription: "Abstain",
  };

  return makeProposal(
    [
      {
        target: SWAP_ROUTER,
        signature: "acceptOwnership()",
        params: [],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip593;
