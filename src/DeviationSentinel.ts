interface ProposalCommand {
  target: string;
  signature: string;
  params: (string | number | boolean | string[] | number[])[];
}

/**
 * Wraps governance commands for markets monitored by DeviationSentinel with
 * the required safety procedure to avoid state conflicts.
 *
 * When DeviationSentinel detects a price deviation, it stores the original collateral
 * factor (CF) and liquidation threshold (LT), sets CF to 0, and pauses borrow or mint.
 * If governance modifies CF/LT via a VIP while the Sentinel holds stale values, the
 * following failure modes can occur:
 *
 *   - Without resetMarketState: When the deviation resolves, the Sentinel overwrites
 *     the governance-set CF with the old stored value — silently reverting the VIP's
 *     risk parameter change.
 *
 *   - With resetMarketState but incomplete cleanup: The Sentinel's internal state is
 *     cleared so it won't auto-restore or auto-unpause. If governance doesn't manually
 *     unpause supply/borrow, the market remains paused with no automated recovery.
 *
 *   - E-mode changes: Adding/removing pools or markets from e-mode groups while the
 *     Sentinel holds stored CFs can cause mismatched pool ID iterations on restore.
 *
 * This helper generates the correct command sequence to avoid all three failure modes:
 *
 *   1. resetMarketState(market) — clear stored CF/LT and pause flags
 *   2. Unpause borrow and mint in case Sentinel had paused them
 *   3. Execute governance changes (CF updates, pause/unpause, e-mode changes)
 *   4. handleDeviation(market) — re-evaluate deviation with new parameters and apply
 *      correct state (pause/CF changes if deviation still exists, or no-op if resolved)
 *
 * @param deviationSentinel - Address of the DeviationSentinel contract
 * @param marketsToTokens - Array of { market, underlyingToken, comptroller } for each affected market
 * @param commands - The governance commands to execute between reset and handleDeviation
 */
export const wrapWithSentinelGuard = (
  deviationSentinel: string,
  marketsToTokens: { market: string; underlyingToken: string; comptroller: string }[],
  commands: ProposalCommand[],
): ProposalCommand[] => {
  const preCommands: ProposalCommand[] = marketsToTokens.flatMap(({ market, comptroller }) => [
    // Step 1: Reset market state to clear stored CF/LT and pause flags
    {
      target: deviationSentinel,
      signature: "resetMarketState(address)",
      params: [market],
    },
    // Step 2: Unpause borrow and mint in case Sentinel had paused them
    {
      target: comptroller,
      signature: "setActionsPaused(address[],uint8[],bool)",
      params: [[market], [2], false], // Action.BORROW = 2
    },
    {
      target: comptroller,
      signature: "setActionsPaused(address[],uint8[],bool)",
      params: [[market], [0], false], // Action.MINT = 0
    },
  ]);

  // Step 4: Call handleDeviation so the Sentinel re-evaluates and applies correct state
  const postCommands: ProposalCommand[] = marketsToTokens.map(({ market }) => ({
    target: deviationSentinel,
    signature: "handleDeviation(address)",
    params: [market],
  }));

  // Step 3: Governance changes are sandwiched between pre and post commands
  return [...preCommands, ...commands, ...postCommands];
};
