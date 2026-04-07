import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK, GUARDIAN } = NETWORK_ADDRESSES.bscmainnet;

// ============================================================
// New deployments — TODO: fill in once contracts are deployed
// ============================================================
// EBrake (TransparentUpgradeableProxy) — emergency action router
export const EBRAKE = "0x0000000000000000000000000000000000000000"; // TODO: set after deployment
// New DeviationSentinel implementation that routes through EBrake
export const NEW_DEVIATION_SENTINEL_IMPL = "0x0000000000000000000000000000000000000000"; // TODO: set after deployment

// ============================================================
// Existing BSC Mainnet addresses
// ============================================================
// DeviationSentinel proxy (deployed in VIP-590)
export const DEVIATION_SENTINEL = "0x6599C15cc8407046CD91E5c0F8B7f765fF914870";
// Default Proxy Admin that owns the DeviationSentinel proxy (admin slot read on-chain;
// owner is Normal Timelock 0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396)
export const PROXY_ADMIN = "0x6beb6d2695b67feb73ad4f172e8e2975497187e4";
// Venus Core Pool Comptroller (Diamond proxy)
export const CORE_POOL_COMPTROLLER = NETWORK_ADDRESSES.bscmainnet.UNITROLLER;
// Access Control Manager
export const ACM = NETWORK_ADDRESSES.bscmainnet.ACCESS_CONTROL_MANAGER;

const TIMELOCKS = [NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK];

export const vip661 = () => {
  const meta = {
    version: "v2",
    title: "VIP-661 [BNB Chain] Configure EBrake-integrated DeviationSentinel",
    description: `#### Summary

This VIP wires up the **EBrake** contract on BNB Chain Mainnet and migrates **DeviationSentinel** to route all
emergency actions through it. EBrake is a thin emergency-action router that exposes Comptroller pause /
collateral-factor / cap functions behind ACM permissions, snapshots pre-incident state for safe recovery, and is
called by DeviationSentinel when a price deviation is detected.

If approved, this VIP will:

1. Upgrade the DeviationSentinel proxy to the new implementation that routes actions through EBrake
2. Grant EBrake permissions on the Core Pool Comptroller (so EBrake can pause actions, zero collateral factors,
   decrease borrow/supply caps, and pause flash loans)
3. Grant the Normal, FastTrack and Critical Timelocks (and Guardian) permission to call \`resetMarketState\` on
   EBrake (the only path to clear EBrake's snapshots after a recovery VIP)
4. Grant DeviationSentinel permission to call \`pauseBorrow\`, \`pauseSupply\` and \`setCFZero\` on EBrake (the
   three functions \`handleDeviation\` invokes)
5. Revoke DeviationSentinel's existing direct comptroller permissions (granted in VIP-590), since the sentinel
   now goes through EBrake

#### Description

**EBrake** (\`EmergencyBrake/EBrake.sol\`) is the new emergency action router. It holds no detection logic — it
only exposes Comptroller emergency functions behind ACM checks and snapshots the pre-incident state of every
market it touches (collateral factors per pool, borrow/supply caps) so a recovery VIP can restore exact prior
values. Snapshots are first-write-wins and cleared via \`resetMarketState\`.

**DeviationSentinel** has been refactored so that \`handleDeviation\` calls EBrake (\`pauseBorrow\`,
\`pauseSupply\`, \`setCFZero\`) instead of the comptroller directly. This adds an additional safety layer
(snapshot + idempotency live in EBrake) and standardizes emergency action routing across the protocol.

#### References

- [VIP Pull Request](https://github.com/VenusProtocol/vips/pull/694)
- [DeviationSentinel Proxy](https://bscscan.com/address/${DEVIATION_SENTINEL})
- [New DeviationSentinel Implementation](https://bscscan.com/address/${NEW_DEVIATION_SENTINEL_IMPL})
- [EBrake Contract](https://bscscan.com/address/${EBRAKE})`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      // ========================================
      // 1. Upgrade DeviationSentinel proxy to new (EBrake-integrated) implementation
      // ========================================
      {
        target: PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [DEVIATION_SENTINEL, NEW_DEVIATION_SENTINEL_IMPL],
      },

      // ========================================
      // 2. Grant EBrake permissions on the Core Pool Comptroller
      //    (the functions EBrake invokes when tightening a market)
      // ========================================

      // pauseActions / pauseSupply / pauseRedeem / pauseBorrow / pauseTransfer → comptroller.setActionsPaused
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [CORE_POOL_COMPTROLLER, "_setActionsPaused(address[],uint8[],bool)", EBRAKE],
      },

      // setCFZero(address) / setCFZero(address,uint96) → Diamond comptroller (with poolId)
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [CORE_POOL_COMPTROLLER, "setCollateralFactor(uint96,address,uint256,uint256)", EBRAKE],
      },

      // setMarketBorrowCaps → comptroller.setMarketBorrowCaps
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [CORE_POOL_COMPTROLLER, "_setMarketBorrowCaps(address[],uint256[])", EBRAKE],
      },

      // setMarketSupplyCaps → comptroller.setMarketSupplyCaps
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [CORE_POOL_COMPTROLLER, "_setMarketSupplyCaps(address[],uint256[])", EBRAKE],
      },

      // pauseFlashLoan → comptroller.setFlashLoanPaused
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [CORE_POOL_COMPTROLLER, "setFlashLoanPaused(bool)", EBRAKE],
      },

      // ========================================
      // 3. Grant resetMarketState permission to governance timelocks and Guardian
      //    (the only path to clear EBrake's stored snapshots during recovery)
      // ========================================
      ...[GUARDIAN, ...TIMELOCKS].map((account: string) => ({
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [EBRAKE, "resetMarketState(address)", account],
      })),

      // ========================================
      // 4. Grant DeviationSentinel permissions on EBrake
      //    (the three functions handleDeviation invokes)
      // ========================================
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [EBRAKE, "pauseBorrow(address)", DEVIATION_SENTINEL],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [EBRAKE, "pauseSupply(address)", DEVIATION_SENTINEL],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [EBRAKE, "setCFZero(address)", DEVIATION_SENTINEL],
      },

      // ========================================
      // 5. Revoke DeviationSentinel's old direct comptroller permissions (granted in VIP-590)
      //    Sentinel now routes everything through EBrake.
      // ========================================
      {
        target: ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [CORE_POOL_COMPTROLLER, "setActionsPaused(address[],uint8[],bool)", DEVIATION_SENTINEL],
      },
      {
        target: ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [CORE_POOL_COMPTROLLER, "_setActionsPaused(address[],uint8[],bool)", DEVIATION_SENTINEL],
      },
      {
        target: ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [CORE_POOL_COMPTROLLER, "setCollateralFactor(uint96,address,uint256,uint256)", DEVIATION_SENTINEL],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip661;
