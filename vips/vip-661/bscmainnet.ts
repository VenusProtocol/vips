import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK, GUARDIAN } = NETWORK_ADDRESSES.bscmainnet;

export const EBRAKE = "0x35eBaBB99c7Fb7ba0C90bCc26e5d55Cdf89C23Ec";
export const NEW_DEVIATION_SENTINEL_IMPL = "0xc86153Ae39fc9B60Ff59E99cA75aAD5Ab9d28a87";

// DeviationSentinel proxy (deployed in VIP-590)
export const DEVIATION_SENTINEL = "0x6599C15cc8407046CD91E5c0F8B7f765fF914870";
// Default Proxy Admin that owns the DeviationSentinel proxy (admin slot read on-chain;
// owner is Normal Timelock 0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396)
export const PROXY_ADMIN = "0x6beb6d2695b67feb73ad4f172e8e2975497187e4";
// Venus Core Pool Comptroller (Diamond proxy)
export const CORE_POOL_COMPTROLLER = NETWORK_ADDRESSES.bscmainnet.UNITROLLER;
// Access Control Manager
export const ACM = NETWORK_ADDRESSES.bscmainnet.ACCESS_CONTROL_MANAGER;
// Venus team multisig — can call EBrake action functions directly for emergency pausing (Phase 0)
export const MULTISIG = "0xCCa5a587eBDBe80f23c8610F2e53B03158e62948";

const TIMELOCKS = [NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK];

// Comptroller functions EBrake is allowed to call
const EBRAKE_COMPTROLLER_PERMS = [
  "_setActionsPaused(address[],uint8[],bool)",
  "setCollateralFactor(uint96,address,uint256,uint256)",
  "setCollateralFactor(address,uint256,uint256)",
  "_setMarketBorrowCaps(address[],uint256[])",
  "_setMarketSupplyCaps(address[],uint256[])",
  "setFlashLoanPaused(bool)",
  "setIsBorrowAllowed(uint96,address,bool)", // disablePoolBorrow
  "setWhiteListFlashLoanAccount(address,bool)", // revokeFlashLoanAccess
];

// Granular snapshot-reset functions governance timelocks and Guardian can call on EBrake
const RESET_PERMS = ["resetCFSnapshot(address)", "resetBorrowCapSnapshot(address)", "resetSupplyCapSnapshot(address)"];

// EBrake functions DeviationSentinel calls via handleDeviation
const SENTINEL_EBRAKE_PERMS = ["pauseBorrow(address)", "pauseSupply(address)", "decreaseCF(address,uint256)"];

// All EBrake action functions governance timelocks and Guardian can call directly.
// Lets a Critical VIP (~1h delay) route through EBrake and get snapshot coverage,
// making recovery via resetXxxSnapshot trivial. Without this, governance would call
// the comptroller directly (no snapshot stored).
const GOVERNANCE_EBRAKE_PERMS = [
  "pauseBorrow(address)",
  "pauseSupply(address)",
  "pauseRedeem(address)",
  "pauseTransfer(address)",
  "pauseFlashLoan()",
  "pauseActions(address[],uint8[])",
  "setMarketBorrowCaps(address[],uint256[])",
  "setMarketSupplyCaps(address[],uint256[])",
  "disablePoolBorrow(uint96,address)",
  "revokeFlashLoanAccess(address)",
  "decreaseCF(address,uint256)",
  "decreaseCF(address,uint96,uint256)",
];

// DeviationSentinel direct comptroller permissions granted in VIP-590 — revoked here
// since the sentinel now routes all emergency actions through EBrake
const SENTINEL_COMPTROLLER_PERMS_TO_REVOKE = [
  "setActionsPaused(address[],uint8[],bool)",
  "_setActionsPaused(address[],uint8[],bool)",
  "setCollateralFactor(uint96,address,uint256,uint256)",
];

const giveCallPermission = (contract: string, sig: string, account: string) => ({
  target: ACM,
  signature: "giveCallPermission(address,string,address)",
  params: [contract, sig, account],
});

const revokeCallPermission = (contract: string, sig: string, account: string) => ({
  target: ACM,
  signature: "revokeCallPermission(address,string,address)",
  params: [contract, sig, account],
});

export const vip661 = () => {
  const meta = {
    version: "v2",
    title: "VIP-661 [BNB Chain] Configure EBrake-integrated DeviationSentinel",
    description: `#### Summary

This VIP wires up the **EBrake** contract on BNB Chain Mainnet and migrates **DeviationSentinel** to route all
emergency actions through it. EBrake is a thin emergency-action router that exposes Comptroller pause /
collateral-factor / cap functions behind ACM permissions, snapshots pre-incident state for safe recovery, and is
called by DeviationSentinel when a price deviation is detected.

This VIP incorporates Phase-0 Hashdit audit fixes (venus-periphery#62): \`setCFZero\` replaced by
\`decreaseCF(address,uint256)\`, \`resetMarketState\` split into three granular snapshot-reset functions, and two
new surgical controls (\`disablePoolBorrow\`, \`revokeFlashLoanAccess\`) added to EBrake.

If approved, this VIP will:

1. Upgrade the DeviationSentinel proxy to the new implementation that routes actions through EBrake
2. Grant EBrake permissions on the Core Pool Comptroller (so EBrake can pause actions, decrease collateral
   factors, decrease borrow/supply caps, pause flash loans, disable per-pool borrows, and revoke flash loan access)
3. Grant the Normal, FastTrack and Critical Timelocks (and Guardian) permission to call the three granular
   snapshot-reset functions on EBrake (\`resetCFSnapshot\`, \`resetBorrowCapSnapshot\`, \`resetSupplyCapSnapshot\`)
4. Grant DeviationSentinel permission to call \`pauseBorrow\`, \`pauseSupply\` and \`decreaseCF\` on EBrake (the
   three functions \`handleDeviation\` invokes)
5. Grant the Normal, FastTrack and Critical Timelocks (and Guardian) permission to call all EBrake action
   functions directly, so a Critical VIP can route through EBrake and benefit from its snapshot mechanism
6. Revoke DeviationSentinel's existing direct comptroller permissions (granted in VIP-590), since the sentinel
   now goes through EBrake
7. Grant the Venus team multisig (\`${MULTISIG}\`) permission to call all EBrake action functions directly,
   enabling the team to pause the protocol in emergency conditions (Phase 0)

#### Description

**EBrake** (\`EmergencyBrake/EBrake.sol\`) is the new emergency action router. It holds no detection logic — it
only exposes Comptroller emergency functions behind ACM checks and snapshots the pre-incident state of every
market it touches (collateral factors per pool, borrow/supply caps) so a recovery VIP can restore exact prior
values. Snapshots are first-write-wins and cleared via the three granular reset functions.

**DeviationSentinel** has been refactored so that \`handleDeviation\` calls EBrake (\`pauseBorrow\`,
\`pauseSupply\`, \`decreaseCF\`) instead of the comptroller directly. This adds an additional safety layer
(snapshot + idempotency live in EBrake) and standardizes emergency action routing across the protocol.

#### References

- [VIP Pull Request](https://github.com/VenusProtocol/vips/pull/694)
- [DeviationSentinel Proxy](https://bscscan.com/address/${DEVIATION_SENTINEL})
- [New DeviationSentinel Implementation](https://bscscan.com/address/${NEW_DEVIATION_SENTINEL_IMPL})
- [EBrake Contract](https://bscscan.com/address/${EBRAKE})
- [Venus Team Multisig](https://bscscan.com/address/${MULTISIG})`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      // 1. Upgrade DeviationSentinel proxy to new (EBrake-integrated) implementation
      {
        target: PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [DEVIATION_SENTINEL, NEW_DEVIATION_SENTINEL_IMPL],
      },

      // 2. Grant EBrake permissions on the Core Pool Comptroller
      ...EBRAKE_COMPTROLLER_PERMS.map(sig => giveCallPermission(CORE_POOL_COMPTROLLER, sig, EBRAKE)),

      // 3. Grant granular snapshot-reset permissions to governance timelocks and Guardian
      ...[GUARDIAN, ...TIMELOCKS].flatMap(account => RESET_PERMS.map(sig => giveCallPermission(EBRAKE, sig, account))),

      // 4. Grant DeviationSentinel permissions on EBrake (the three functions handleDeviation invokes)
      ...SENTINEL_EBRAKE_PERMS.map(sig => giveCallPermission(EBRAKE, sig, DEVIATION_SENTINEL)),

      // 5. Grant governance timelocks and Guardian permissions on all EBrake action functions
      ...[GUARDIAN, ...TIMELOCKS].flatMap(account =>
        GOVERNANCE_EBRAKE_PERMS.map(sig => giveCallPermission(EBRAKE, sig, account)),
      ),

      // 6. Revoke DeviationSentinel's old direct comptroller permissions (granted in VIP-590)
      ...SENTINEL_COMPTROLLER_PERMS_TO_REVOKE.map(sig =>
        revokeCallPermission(CORE_POOL_COMPTROLLER, sig, DEVIATION_SENTINEL),
      ),

      // 7. Grant Venus team multisig permission on all EBrake action functions (emergency pausing, Phase 0)
      ...GOVERNANCE_EBRAKE_PERMS.map(sig => giveCallPermission(EBRAKE, sig, MULTISIG)),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip661;
