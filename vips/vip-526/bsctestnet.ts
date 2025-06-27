import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

// BNB Chain
export const COMPTROLLER_Core = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
export const VToken_vPT_sUSDE_26JUN2025 = "0x90535B06ddB00453a5e5f2bC094d498F1cc86032";

export const Actions = {
  MINT: 0,
  ENTER_MARKET: 7,
};

export const vip526 = () => {
  const meta = {
    version: "v2",
    title: "VIP-526 [BNB Chain] [Ethereum]: VIP to pause PT markets",
    description: `pause actions of PT-sUSDE-JUN2025 on BNB chain for Core-Pool`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      // === BNB Chain ===
      // --- Market: PT_sUSDE_26JUN2025 on Core pool
      {
        target: COMPTROLLER_Core,
        signature: "_setActionsPaused(address[],uint8[],bool)",
        params: [[VToken_vPT_sUSDE_26JUN2025], [Actions.MINT, Actions.ENTER_MARKET], true],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip526;
