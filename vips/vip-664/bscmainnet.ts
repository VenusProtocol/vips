import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

// Core Pool market and its underlying
export const vDAI = "0x334b3eCB4DCa3593BCCC3c7EBD1A1C1d1780FBF1";
export const DAI = "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3";

// DeviationSentinel proxy (deployed in VIP-590, EBrake-integrated impl since VIP-610)
export const DEVIATION_SENTINEL = "0x6599C15cc8407046CD91E5c0F8B7f765fF914870";
// Emergency Brake (EBrakeV2) — holds the pre-incident CF/cap snapshots (VIP-610)
export const EBRAKE = "0x35eBaBB99c7Fb7ba0C90bCc26e5d55Cdf89C23Ec";

// Comptroller Action enum: BORROW
export const BORROW = 2;

export const vip664 = () => {
  const meta = {
    version: "v2",
    title: "VIP-664 [BNB Chain] Disable DeviationSentinel for DAI and resume borrowing",
    description: `#### Summary

DAI has thin, volatile DEX liquidity on BNB Chain. Because the DEX price of DAI is chronically noisy relative to the ResilientOracle price, the DeviationSentinel has repeatedly tripped false positives on the DAI market — most recently over the weekend, pausing borrowing on the vDAI market. As reliably configuring a deviation threshold for such a shallow pool is not practical, the risk team has decided to stop monitoring DAI with the DeviationSentinel.

If passed, this VIP will:

1. **Disable DeviationSentinel monitoring for DAI**, so the sentinel can no longer auto-pause the vDAI market. The deviation threshold configuration is preserved, only monitoring is switched off.
2. **Resume borrowing on the vDAI market** by unpausing the BORROW action on the Core Pool Comptroller.
3. **Reset the DAI snapshots on the Emergency Brake (EBrake)** — the collateral-factor, borrow-cap and supply-cap snapshots — returning the market to a clean, pre-incident slate.

#### Description

**1. Disable DeviationSentinel monitoring for DAI**

- **Contract**: DeviationSentinel (${DEVIATION_SENTINEL})
- **Function**: setTokenMonitoringEnabled(address,bool)
- **Parameters**: token = DAI (${DAI}), enabled = false
- **Effect**: handleDeviation can no longer act on the vDAI market (it reverts TokenMonitoringDisabled). The stored deviation threshold for DAI is left unchanged. This is ordered first so the market cannot be re-tripped around execution.

**2. Resume borrowing on vDAI**

- **Contract**: Core Pool Comptroller (${bscmainnet.UNITROLLER})
- **Function**: setActionsPaused(address[],uint8[],bool)
- **Parameters**: markets = [vDAI], actions = [BORROW (2)], paused = false
- **Effect**: Users can borrow DAI again. The collateral factor of vDAI is **not** changed by this VIP: its pre-incident collateral factor was already 0 (which is why the EBrake collateral-factor snapshot for vDAI is empty — the sentinel only paused borrowing, it never lowered a non-zero collateral factor), so there is no collateral factor to restore.

**3. Reset the DAI snapshots on EBrake**

- **Contract**: EBrake (${EBRAKE})
- **Functions**: resetCFSnapshot(address), resetBorrowCapSnapshot(address), resetSupplyCapSnapshot(address)
- **Parameters**: market = vDAI
- **Effect**: Clears any stored collateral-factor / borrow-cap / supply-cap snapshot for the vDAI market so EBrake tracks no residual state for DAI after monitoring is disabled.

No new AccessControlManager permissions are required — the Normal Timelock already holds all of the roles used by this proposal.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // ────────────────────────────────────────────────────────────────────────
      // 1. Disable DeviationSentinel monitoring for DAI (ordered first so the
      //    vDAI market cannot be re-tripped around execution).
      // ────────────────────────────────────────────────────────────────────────
      {
        target: DEVIATION_SENTINEL,
        signature: "setTokenMonitoringEnabled(address,bool)",
        params: [DAI, false],
      },

      // ────────────────────────────────────────────────────────────────────────
      // 2. Resume borrowing on the vDAI market. No collateral-factor command: the
      //    pre-incident collateral factor was already 0 (empty EBrake snapshot).
      // ────────────────────────────────────────────────────────────────────────
      {
        target: bscmainnet.UNITROLLER,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [[vDAI], [BORROW], false],
      },

      // ────────────────────────────────────────────────────────────────────────
      // 3. Reset the EBrake snapshots for vDAI (clean, pre-incident slate).
      // ────────────────────────────────────────────────────────────────────────
      {
        target: EBRAKE,
        signature: "resetCFSnapshot(address)",
        params: [vDAI],
      },
      {
        target: EBRAKE,
        signature: "resetBorrowCapSnapshot(address)",
        params: [vDAI],
      },
      {
        target: EBRAKE,
        signature: "resetSupplyCapSnapshot(address)",
        params: [vDAI],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip664;
