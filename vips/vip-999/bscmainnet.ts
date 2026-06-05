import { ProposalMeta, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import {
  ACCESS_CONTROL_MANAGER,
  FLASHLOAN_FACET_SELECTORS,
  LEVERAGE_PROXY_ADMIN,
  LEVERAGE_STRATEGIES_MANAGER,
  LIQUIDATOR,
  LIQUIDATOR_PROXY_ADMIN,
  MARKET_FACET_SELECTORS,
  NEW_COMPTROLLER_LENS,
  NEW_DIAMOND,
  NEW_FLASHLOAN_FACET,
  NEW_LEVERAGE_IMPL,
  NEW_LIQUIDATOR_IMPL,
  NEW_MARKET_FACET,
  NEW_POLICY_FACET,
  NEW_REWARD_FACET,
  NEW_SETTER_FACET,
  NEW_VTOKEN_DELEGATE,
  POLICY_FACET_SELECTORS,
  REWARD_FACET_EXISTING_SELECTORS,
  REWARD_FACET_NEW_SELECTORS,
  SEIZE_VENUS_FILTERED_SIGNATURE,
  SEIZE_VENUS_PERMISSION_GRANTEES,
  SETTER_FACET_SELECTORS,
  UNITROLLER,
  VTOKENS_TO_UPGRADE,
} from "./utils/data.bscmainnet";

const FacetCutAction = { Add: 0, Replace: 1, Remove: 2 };

const meta: ProposalMeta = {
  version: "v2",
  title: "VIP-999 [BNB Chain] Certik VPD-1241 reaudit: upgrade Core Pool, Liquidator and Leverage Manager",
  description: `#### Summary

If passed, this VIP applies the fixes and recompiled bytecode from the Certik "Venus Labs – Core Feature Reaudit" (VPD-1241):

- **Core Pool Comptroller** — the full diamond is recut: the Diamond implementation and all five facets (Market, Policy, Reward, Setter, FlashLoan) are replaced with the recompiled, audited bytecode, preserving the existing function-to-facet mapping. The RewardFacet additionally gains two market-filtered overloads, claimVenusAsCollateral(address,address[]) and seizeVenus(address[],address,address[]), and enforces vXVS-market entry when claiming as collateral with a shortfall. The new seizeVenus overload is ACM-gated under a new signature, so call permission for seizeVenus(address[],address,address[]) is granted to the Normal, Fast-track and Critical timelocks and the critical guardian (mirroring the existing seizeVenus permission).
- **ComptrollerLens** — solvency hypothetical now skips entered markets with neither supply nor debt.
- **Liquidator** — accrues VAI interest before the force-liquidation gate; honors the per-borrower forced-liquidation flag.
- **VBep20Delegate** — recompiled, audited delegate; every Core Pool market on the standard delegate is repointed (vBNB and bespoke/legacy markets excluded).
- **LeverageStrategiesManager** — dust returned via operation deltas; new owner-only sweepToken(address).

The reaudit's changes to ResilientOracle, OneJumpOracle, SnapshotLens and VenusLens were limited to documentation (NatSpec) and do not affect their compiled bytecode or behavior, so these contracts are intentionally not upgraded by this proposal.`,
  forDescription: "I agree that Venus Protocol should proceed with this proposal",
  againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
  abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
};

export const vip999 = () => {
  return makeProposal(
    [
      // ──────────────────────────────────────────────────────────────────────────
      // 1. Core Pool Comptroller
      // ──────────────────────────────────────────────────────────────────────────

      {
        target: UNITROLLER,
        signature: "diamondCut((address,uint8,bytes4[])[])",
        params: [
          [
            [NEW_MARKET_FACET, FacetCutAction.Replace, MARKET_FACET_SELECTORS],
            [NEW_POLICY_FACET, FacetCutAction.Replace, POLICY_FACET_SELECTORS],
            [NEW_REWARD_FACET, FacetCutAction.Replace, REWARD_FACET_EXISTING_SELECTORS],
            [NEW_SETTER_FACET, FacetCutAction.Replace, SETTER_FACET_SELECTORS],
            [NEW_FLASHLOAN_FACET, FacetCutAction.Replace, FLASHLOAN_FACET_SELECTORS],
            [NEW_REWARD_FACET, FacetCutAction.Add, REWARD_FACET_NEW_SELECTORS],
          ],
        ],
      },
      { target: UNITROLLER, signature: "_setPendingImplementation(address)", params: [NEW_DIAMOND] },
      { target: NEW_DIAMOND, signature: "_become(address)", params: [UNITROLLER] },

      { target: UNITROLLER, signature: "_setComptrollerLens(address)", params: [NEW_COMPTROLLER_LENS] },

      // Register call permission for the new market-filtered seizeVenus overload.
      ...SEIZE_VENUS_PERMISSION_GRANTEES.map(account => ({
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [UNITROLLER, SEIZE_VENUS_FILTERED_SIGNATURE, account],
      })),

      // ──────────────────────────────────────────────────────────────────────────
      // 2. Liquidator
      // ──────────────────────────────────────────────────────────────────────────

      {
        target: LIQUIDATOR_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [LIQUIDATOR, NEW_LIQUIDATOR_IMPL],
      },

      // ──────────────────────────────────────────────────────────────────────────
      // 3. Core Pool markets — VBep20Delegate
      // ──────────────────────────────────────────────────────────────────────────

      ...Object.values(VTOKENS_TO_UPGRADE).map(vToken => ({
        target: vToken,
        signature: "_setImplementation(address,bool,bytes)",
        params: [NEW_VTOKEN_DELEGATE, false, "0x"],
      })),

      // ──────────────────────────────────────────────────────────────────────────
      // 4. LeverageStrategiesManager
      // ──────────────────────────────────────────────────────────────────────────

      {
        target: LEVERAGE_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [LEVERAGE_STRATEGIES_MANAGER, NEW_LEVERAGE_IMPL],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip999;
