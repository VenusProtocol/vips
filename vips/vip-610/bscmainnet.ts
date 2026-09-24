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

export const vip610 = () => {
  const meta = {
    version: "v2",
    title: "VIP-610 [BNB Chain] Configure Emergency Brake (EBrakeV2) with DeviationSentinel",
    description: `#### Description

This VIP configures the Emergency Brake (EBrake) system on BNB Chain mainnet by wiring the **DeviationSentinel** oracle-deviation monitor to the upgraded **EBrakeV2** contract, and granting the Venus team multisig manual Emergency Brake permissions as an operational fallback.

The Emergency Brake system was introduced to protect Venus from oracle\u2013DEX price divergence risks. Rather than applying blanket market pauses, the system uses per-action, per-market controls \u2014 restricting only borrowing or setting Collateral Factors to 0 for affected assets, depending on the direction of the deviation. EBrakeV2 is an upgraded version of the original Emergency Brake contract, featuring improved permission management and more granular access control over which actors can activate or cancel emergency actions.

The DeviationSentinel is the automated enforcement layer: an off-chain monitor that continuously compares Resilient Oracle prices against on-chain DEX prices (e.g. PancakeSwap). When a significant deviation is detected, it invokes emergency actions on EBrakeV2 \u2014 calling pauseBorrow, pauseSupply, or decreaseCF as appropriate \u2014 applying the correct on-chain restriction without manual intervention. The Venus team multisig is additionally granted Emergency Brake permissions to serve as a manual fallback during the early operational phase, consistent with the operational considerations outlined in the original community proposal.

#### Proposed Changes

**1. Upgrade DeviationSentinel proxy to new EBrake-integrated implementation**

- **Contract**: ProxyAdmin (0x6beb6d2695b67feb73ad4f172e8e2975497187e4)
- **Function**: upgrade(address,address)
- **Parameters**:
  - proxy: DeviationSentinel (0x6599C15cc8407046CD91E5c0F8B7f765fF914870)
  - implementation: 0xc86153Ae39fc9B60Ff59E99cA75aAD5Ab9d28a87
- **Effect**: Upgrades the DeviationSentinel so that handleDeviation routes all emergency actions through EBrake instead of calling the Comptroller directly

**2. Grant EBrake permissions on the Core Pool Comptroller** (8 permissions)

- **Contract**: AccessControlManager (0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555)
- **Function**: giveCallPermission(address,string,address) x8
- **Parameters**: contractAddress = Core Pool Comptroller, accountToPermit = EBrake (0x35eBaBB99c7Fb7ba0C90bCc26e5d55Cdf89C23Ec)
- **Function signatures**:
  - _setActionsPaused(address[],uint8[],bool)
  - setCollateralFactor(uint96,address,uint256,uint256)
  - setCollateralFactor(address,uint256,uint256)
  - _setMarketBorrowCaps(address[],uint256[])
  - _setMarketSupplyCaps(address[],uint256[])
  - setFlashLoanPaused(bool)
  - setIsBorrowAllowed(uint96,address,bool) \u2014 disablePoolBorrow
  - setWhiteListFlashLoanAccount(address,bool) \u2014 revokeFlashLoanAccess
- **Effect**: Authorizes EBrake to pause actions, adjust collateral factors, set caps, control flash loans, and disable per-pool borrows on the Core Pool Comptroller

**3. Grant snapshot-reset permissions on EBrake to Guardian + Timelocks** (12 permissions)

- **Contract**: AccessControlManager (0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555)
- **Function**: giveCallPermission(address,string,address) x12
- **Parameters**: contractAddress = EBrake (0x35eBaBB99c7Fb7ba0C90bCc26e5d55Cdf89C23Ec), accountToPermit = Guardian (0x1C2CAc6ec528c20800B2fe734820D87b581eAA6B) + Normal / FastTrack / Critical Timelocks
- **Function signatures** (x4 accounts):
  - resetCFSnapshot(address)
  - resetBorrowCapSnapshot(address)
  - resetSupplyCapSnapshot(address)
- **Effect**: Allows governance and Guardian to clear EBrake's stored snapshots, enabling safe recovery to pre-incident state

**4. Grant DeviationSentinel permissions on EBrake** (3 permissions)

- **Contract**: AccessControlManager (0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555)
- **Function**: giveCallPermission(address,string,address) x3
- **Parameters**: contractAddress = EBrake (0x35eBaBB99c7Fb7ba0C90bCc26e5d55Cdf89C23Ec), accountToPermit = DeviationSentinel (0x6599C15cc8407046CD91E5c0F8B7f765fF914870)
- **Function signatures**:
  - pauseBorrow(address)
  - pauseSupply(address)
  - decreaseCF(address,uint256)
- **Effect**: Authorizes the DeviationSentinel to invoke the three functions handleDeviation calls on EBrake, enabling automated per-action market restrictions in response to oracle-DEX price deviations

**5. Grant governance Timelocks + Guardian all EBrake action functions** (48 permissions)

- **Contract**: AccessControlManager (0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555)
- **Function**: giveCallPermission(address,string,address) x48
- **Parameters**: contractAddress = EBrake (0x35eBaBB99c7Fb7ba0C90bCc26e5d55Cdf89C23Ec), accountToPermit = Guardian + Normal / FastTrack / Critical Timelocks
- **Function signatures** (x4 accounts):
  - pauseBorrow(address), pauseSupply(address), pauseRedeem(address), pauseTransfer(address), pauseFlashLoan(), pauseActions(address[],uint8[]), setMarketBorrowCaps(address[],uint256[]), setMarketSupplyCaps(address[],uint256[]), disablePoolBorrow(uint96,address), revokeFlashLoanAccess(address), decreaseCF(address,uint256), decreaseCF(address,uint96,uint256)
- **Effect**: Lets a Critical VIP (~1 h delay) route emergency actions through EBrake with automatic snapshot coverage, making recovery via resetXxxSnapshot trivial

**6. Revoke DeviationSentinel's old direct Comptroller permissions** (3 revocations)

- **Contract**: AccessControlManager (0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555)
- **Function**: revokeCallPermission(address,string,address) x3
- **Parameters**: contractAddress = Core Pool Comptroller, accountToRevoke = DeviationSentinel (0x6599C15cc8407046CD91E5c0F8B7f765fF914870)
- **Function signatures revoked**:
  - setActionsPaused(address[],uint8[],bool)
  - _setActionsPaused(address[],uint8[],bool)
  - setCollateralFactor(uint96,address,uint256,uint256)
- **Effect**: Removes the sentinel's legacy direct Comptroller permissions (granted in VIP-590), since the sentinel now routes all actions through EBrake

**7. Grant Venus team multisig all EBrake action functions** (12 permissions)

- **Contract**: AccessControlManager (0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555)
- **Function**: giveCallPermission(address,string,address) x12
- **Parameters**: contractAddress = EBrake (0x35eBaBB99c7Fb7ba0C90bCc26e5d55Cdf89C23Ec), accountToPermit = Venus team multisig (0xCCa5a587eBDBe80f23c8610F2e53B03158e62948)
- **Function signatures**: same 12 EBrake action functions as Step 5
- **Effect**: Grants the Venus team multisig the ability to manually trigger any Emergency Brake action on BSC mainnet as a fallback during the early operational phase (Phase 0)

**Permission event summary**: 83 PermissionGranted, 3 PermissionRevoked

#### Summary

If approved, this VIP will:

- Upgrade the **DeviationSentinel** proxy to a new implementation that routes all emergency actions through **EBrakeV2** instead of the Comptroller directly
- Grant **EBrake** 8 permissions on the Core Pool Comptroller (pause, collateral factor, cap, flash loan, pool-borrow controls)
- Grant **Guardian** and all three governance **Timelocks** granular snapshot-reset permissions on EBrake for safe post-incident recovery
- Authorize the **DeviationSentinel** to call pauseBorrow, pauseSupply, and decreaseCF on EBrake, enabling automated oracle-deviation enforcement
- Grant **Guardian** and governance **Timelocks** all 12 EBrake action functions, so Critical VIPs can route through EBrake with snapshot coverage
- Revoke the **DeviationSentinel's** legacy direct Comptroller permissions from VIP-590
- Grant the **Venus team multisig** (0xCCa5a587eBDBe80f23c8610F2e53B03158e62948) all 12 EBrake action functions for manual emergency pausing (Phase 0)

#### References

- [Community Post](https://community.venus.io/t/bnb-chain-configure-emergency-brake-ebrakev2-with-deviationsentinel/5743)
- [Original Proposal: Emergency Brake - Price Deviation Safeguard Mechanism](https://community.venus.io/t/proposal-emergency-brake-price-deviation-safeguard-mechanism/5668)
- [GitHub PR: VenusProtocol/vips#690](https://github.com/VenusProtocol/vips/pull/690)`,
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

export default vip610;
