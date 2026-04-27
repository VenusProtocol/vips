import { ZERO_ADDRESS } from "src/networkAddresses";
import { Command, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { ARBITRUMONE_CONFIG } from "./addresses/arbitrumone";
import { BASEMAINNET_CONFIG } from "./addresses/basemainnet";
import { ETHEREUM_CONFIG } from "./addresses/ethereum";
import { ZKSYNCMAINNET_CONFIG } from "./addresses/zksyncmainnet";

// Per-chain configuration shape. Each chain bundles its ACM, governance accounts,
// IL Comptroller, and the EBrake/DeviationSentinel stack addresses (placeholders
// until contracts are deployed on the remote chain).
export interface ChainConfig {
  name: string;
  dstChainId: number;
  acm: string;
  guardian: string;
  normalTimelock: string;
  fastTrackTimelock: string;
  criticalTimelock: string;
  comptroller: string;
  deviationSentinel: string;
  eBrake: string;
  sentinelOracle: string;
  uniswapOracle: string;
  multisigPauser: string;
  keeper: string;
  monitoredToken: string;
  monitoredPool: string;
  deviationPercent: number;
}

const NETWORKS: ChainConfig[] = [ETHEREUM_CONFIG, ARBITRUMONE_CONFIG, ZKSYNCMAINNET_CONFIG, BASEMAINNET_CONFIG];

// DeviationSentinel access-controlled functions (3 total — setTokenConfig uses
// the struct-tuple form (uint8,bool) verbatim, matching DeviationSentinel.sol).
export const SENTINEL_ADMIN_PERMS = [
  "setTrustedKeeper(address,bool)",
  "setTokenConfig(address,(uint8,bool))",
  "setTokenMonitoringEnabled(address,bool)",
];

// SentinelOracle access-controlled functions
export const SENTINEL_ORACLE_ADMIN_PERMS = ["setTokenOracleConfig(address,address)", "setDirectPrice(address,uint256)"];

// UniswapOracle access-controlled functions
export const UNISWAP_ORACLE_ADMIN_PERMS = ["setPoolConfig(address,address)"];

// IL Comptroller permissions for EBrake.
// setActionsPaused uses uint256[] (not uint8[]) in the IL Comptroller.
export const EBRAKE_COMPTROLLER_PERMS_IL = [
  "setActionsPaused(address[],uint256[],bool)",
  "setCollateralFactor(address,uint256,uint256)",
  "setMarketBorrowCaps(address[],uint256[])",
  "setMarketSupplyCaps(address[],uint256[])",
];

// Granular snapshot-reset functions governance Timelocks and Guardian can call on EBrake.
export const RESET_PERMS = [
  "resetCFSnapshot(address)",
  "resetBorrowCapSnapshot(address)",
  "resetSupplyCapSnapshot(address)",
];

// EBrake functions DeviationSentinel.handleDeviation invokes (single-arg decreaseCF
// is the IL-supported form).
export const SENTINEL_EBRAKE_PERMS = ["pauseBorrow(address)", "pauseSupply(address)", "decreaseCF(address,uint256)"];

// IL-supported subset of EBrake action functions granted to governance + multisig.
// Excludes: pauseFlashLoan(), disablePoolBorrow(uint96,address),
// revokeFlashLoanAccess(address), decreaseCF(address,uint96,uint256) — all revert
// on isIsolatedPool=true (they target Diamond-only Comptroller methods).
export const GOVERNANCE_EBRAKE_PERMS_IL = [
  "pauseSupply(address)",
  "pauseRedeem(address)",
  "pauseBorrow(address)",
  "pauseTransfer(address)",
  "pauseActions(address[],uint8[])",
  "setMarketBorrowCaps(address[],uint256[])",
  "setMarketSupplyCaps(address[],uint256[])",
  "decreaseCF(address,uint256)",
];

// Diamond-only EBrake fns deliberately NOT granted on IL chains (would revert).
export const DIAMOND_ONLY_EBRAKE_PERMS = [
  "pauseFlashLoan()",
  "disablePoolBorrow(uint96,address)",
  "revokeFlashLoanAccess(address)",
  "decreaseCF(address,uint96,uint256)",
];

const grant = (acm: string, contract: string, sig: string, account: string, dstChainId: number) => ({
  target: acm,
  signature: "giveCallPermission(address,string,address)",
  params: [contract, sig, account],
  dstChainId,
});

const buildChainCommands = (cfg: ChainConfig) => {
  const { acm, dstChainId } = cfg;
  const governanceAccounts = [cfg.guardian, cfg.normalTimelock, cfg.fastTrackTimelock, cfg.criticalTimelock];
  const trustedKeeperAccounts = [cfg.keeper, ...governanceAccounts];

  const commands: Command[] = [
    // 1. Accept ownership of the four newly deployed contracts. The deployer
    //    transfers ownership to the local Normal Timelock prior to this VIP.
    ...[cfg.deviationSentinel, cfg.sentinelOracle, cfg.uniswapOracle, cfg.eBrake].map(target => ({
      target,
      signature: "acceptOwnership()",
      params: [],
      dstChainId,
    })),

    // 2. Grant Guardian + governance Timelocks admin permissions on DeviationSentinel
    ...governanceAccounts.flatMap(account =>
      SENTINEL_ADMIN_PERMS.map(sig => grant(acm, cfg.deviationSentinel, sig, account, dstChainId)),
    ),

    // 3. Grant Guardian + governance Timelocks admin permissions on SentinelOracle
    ...governanceAccounts.flatMap(account =>
      SENTINEL_ORACLE_ADMIN_PERMS.map(sig => grant(acm, cfg.sentinelOracle, sig, account, dstChainId)),
    ),

    // 4. Grant Guardian + governance Timelocks admin permission on UniswapOracle
    ...governanceAccounts.flatMap(account =>
      UNISWAP_ORACLE_ADMIN_PERMS.map(sig => grant(acm, cfg.uniswapOracle, sig, account, dstChainId)),
    ),

    // 5. Grant EBrake the IL-Comptroller-supported emergency-action permissions
    ...EBRAKE_COMPTROLLER_PERMS_IL.map(sig => grant(acm, cfg.comptroller, sig, cfg.eBrake, dstChainId)),

    // 6. Grant Guardian + governance Timelocks granular snapshot-reset perms on EBrake
    ...governanceAccounts.flatMap(account => RESET_PERMS.map(sig => grant(acm, cfg.eBrake, sig, account, dstChainId))),

    // 7. Grant DeviationSentinel the three EBrake actions handleDeviation invokes
    ...SENTINEL_EBRAKE_PERMS.map(sig => grant(acm, cfg.eBrake, sig, cfg.deviationSentinel, dstChainId)),

    // 8. Grant Guardian + governance Timelocks the IL-supported EBrake action functions
    ...governanceAccounts.flatMap(account =>
      GOVERNANCE_EBRAKE_PERMS_IL.map(sig => grant(acm, cfg.eBrake, sig, account, dstChainId)),
    ),

    // 9. Whitelist Keeper + Guardian + governance Timelocks as trusted keepers on
    //    DeviationSentinel so VIPs (and the off-chain keeper) can invoke handleDeviation.
    ...trustedKeeperAccounts.map(account => ({
      target: cfg.deviationSentinel,
      signature: "setTrustedKeeper(address,bool)",
      params: [account, true],
      dstChainId,
    })),

    // 10. Grant the per-chain 1-of-1 Multisig Pauser the same IL-supported EBrake
    //     action functions, so the Venus team can manually trigger emergency
    //     actions during the early operational phase (mirror of VIP-610 step 7).
    ...GOVERNANCE_EBRAKE_PERMS_IL.map(sig => grant(acm, cfg.eBrake, sig, cfg.multisigPauser, dstChainId)),
  ];

  // 11. Token-specific wiring. Skipped when no token is yet chosen for the chain
  //     (monitoredToken == ZERO_ADDRESS) so the proposal stays executable
  //     even with placeholder addresses.
  if (cfg.monitoredToken !== ZERO_ADDRESS) {
    commands.push(
      {
        target: cfg.uniswapOracle,
        signature: "setPoolConfig(address,address)",
        params: [cfg.monitoredToken, cfg.monitoredPool],
        dstChainId,
      },
      {
        target: cfg.sentinelOracle,
        signature: "setTokenOracleConfig(address,address)",
        params: [cfg.monitoredToken, cfg.uniswapOracle],
        dstChainId,
      },
      {
        target: cfg.deviationSentinel,
        signature: "setTokenConfig(address,(uint8,bool))",
        params: [cfg.monitoredToken, [cfg.deviationPercent, true]],
        dstChainId,
      },
    );
  }

  return commands;
};

export const vip666 = () => {
  const meta = {
    version: "v2",
    title: "VIP-666 [Ethereum, Arbitrum One, zkSync Era, Base] Configure DeviationSentinel + EBrakeV2",
    description: `#### Description

This VIP configures the **DeviationSentinel** + **EBrakeV2** Emergency Brake stack on **Ethereum**, **Arbitrum One**, **zkSync Era**, and **Base**, mirroring the BSC setup from VIP-590 + VIP-610. Each chain's DeviationSentinel routes automated oracle-deviation enforcement through a local EBrakeV2, which applies per-action, per-market restrictions (pause borrow/supply, zero collateral factor) without manual intervention.

Because EBrake on these chains uses \`isIsolatedPool=true\` (single-pool IL Comptroller, not the BSC Diamond), only the IL-supported subset of EBrake action functions is granted. Diamond-only functions (\`pauseFlashLoan\`, \`disablePoolBorrow\`, \`revokeFlashLoanAccess\`, \`decreaseCF(address,uint96,uint256)\`) are omitted as they revert on IL comptrollers.

#### Summary

If approved, this VIP will, for each of Ethereum, Arbitrum One, zkSync Era, and Base:

- Accept governance ownership of the **DeviationSentinel**, **SentinelOracle**, **UniswapOracle**, and **EBrakeV2** contracts
- Grant admin permissions on DeviationSentinel, SentinelOracle, and UniswapOracle to Guardian + 3 Timelocks
- Grant **EBrakeV2** the 4 IL-supported Comptroller permissions it needs to execute emergency actions
- Authorize **DeviationSentinel** to call \`pauseBorrow\`, \`pauseSupply\`, and \`decreaseCF\` on EBrake
- Grant **Guardian** and governance **Timelocks** the 8 IL-supported EBrake action functions and granular snapshot-reset permissions
- Grant the **per-chain 1-of-1 Multisig Pauser** the 8 IL-supported EBrake action functions for manual emergency pausing (Phase 0)
- Whitelist Keeper + Guardian + 3 Timelocks as trusted keepers on DeviationSentinel

**Permission event summary**: 332 PermissionGranted (83 per chain × 4 chains), 0 PermissionRevoked

#### References

- [VIP-590 (BSC)](https://app.venus.io/governance/proposal/590)
- [VIP-610 (BSC)](https://app.venus.io/governance/proposal/610)
- [Original Proposal: Emergency Brake — Price Deviation Safeguard Mechanism](https://community.venus.io/t/proposal-emergency-brake-price-deviation-safeguard-mechanism/5668)
- [GitHub PR](https://github.com/VenusProtocol/vips/pull/TODO)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(NETWORKS.flatMap(buildChainCommands), meta, ProposalType.REGULAR);
};

export default vip666;
