import { NETWORK_ADDRESSES } from "../../src/networkAddresses";
import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

export const PENDLE_PT_VAULT_ADAPTER = "0x60Db419d8ea13C5827072Cf693D13cA1Ec6E0B4a";
export const PENDLE_MARKET_SLISBNB = "0x3C1a3D6B69A866444Fe506F7D38a00a1C2D859C5";
export const vPT_clisBNB_25JUN2026 = "0x6d3BD68E90B42615cb5abF4B8DE92b154ADc435e";

const vip606 = () => {
  const meta = {
    version: "v2",
    title: "VIP-606 [BNB Chain] Pendle Vault Integration",
    description: `This VIP activates the PendlePTVaultAdapter contract on BNB Chain mainnet, integrating Venus Protocol with Pendle Finance's Principal Token (PT) vault infrastructure. Pendle Finance is a yield-trading protocol that allows users to split yield-bearing assets into Principal Tokens (PT) and Yield Tokens (YT), enabling fixed-rate yields and structured exposure to DeFi yield streams. PT tokens represent the principal component of a yield-bearing position and redeem at face value at maturity.

The PendlePTVaultAdapter is a Venus-developed adapter contract that bridges Pendle PT markets with the Venus vault system. This VIP performs three categories of on-chain configuration: transferring ownership of the adapter from its deployment address to the Normal Timelock (consistent with Venus governance standards), granting the Access Control Manager (ACM) permissions required for protocol operations (addMarket, pause, unpause) across all relevant timelocks and the guardian, and registering the first Pendle market — PT-clisBNBx-25JUN2026 — along with its corresponding Venus vToken.

This is the initial activation VIP for the Pendle integration. The feature is currently available for ambassador testing only and is not yet released to the general public. Subsequent VIPs may register additional Pendle markets as the integration matures.

#### Changes

**1. Accept Ownership of PendlePTVaultAdapter**
- Contract: PendlePTVaultAdapter (${PENDLE_PT_VAULT_ADAPTER})
- Function: acceptOwnership()
- Parameters: none
- Effect: Transfers ownership of the PendlePTVaultAdapter contract from its pending owner (the Normal Timelock) to the Normal Timelock, completing the two-step ownership handoff and placing the contract under Venus governance control.

---

**2. Grant ACM Permission — addMarket to Normal Timelock**
- Contract: AccessControlManager (BSC Mainnet ACM)
- Function: giveCallPermission(address contractAddress, string functionSig, address accountToPermit)
- Parameters:
  - contractAddress: PendlePTVaultAdapter (${PENDLE_PT_VAULT_ADAPTER})
  - functionSig: addMarket(address,address)
  - accountToPermit: Normal Timelock
- Effect: Authorizes the Normal Timelock to call addMarket on the adapter, enabling future registration of new Pendle PT markets through governance.

---

**3. Grant ACM Permissions — pause and unpause to All Timelocks and Guardian**
- Contract: AccessControlManager
- Function: giveCallPermission(address, string, address) — called **7 times** (pause + unpause x Normal, Fast Track, Critical Timelocks + Guardian)
- Effect: Authorizes all three timelocks (Normal, Fast Track, Critical) and the Guardian to call pause() and unpause() on the PendlePTVaultAdapter. This ensures circuit-breaker capability at all governance response speeds, from routine (Normal) to emergency (Critical/Guardian).

Total ACM permission grants in this VIP: **9** (addMarket x 1 + pause x 4 + unpause x 4).

**4. Register PT-clisBNBx-25JUN2026 Pendle Market**
- Contract: PendlePTVaultAdapter (${PENDLE_PT_VAULT_ADAPTER})
- Function: addMarket(address pendleMarket, address vToken)
- Parameters:
  - pendleMarket: ${PENDLE_MARKET_SLISBNB} (Pendle PT-clisBNBx-25JUN2026 market)
  - vToken: ${vPT_clisBNB_25JUN2026} (corresponding Venus vToken)
- Effect: Registers the PT-clisBNBx-25JUN2026 Pendle market with its Venus vToken in the adapter, enabling deposit, withdrawal, and redemption-at-maturity functionality for this market through the Venus vault system. The market matures on **25 June 2026**.

#### Summary

If approved, this VIP will:
- Transfer ownership of the PendlePTVaultAdapter contract (${PENDLE_PT_VAULT_ADAPTER}) to Venus's Normal Timelock
- Grant addMarket(address,address) permission on the adapter to the Normal Timelock via the ACM
- Grant pause() and unpause() permissions on the adapter to the Normal Timelock, Fast Track Timelock, Critical Timelock, and Guardian (8 grants)
- Register the PT-clisBNBx-25JUN2026 Pendle market (${PENDLE_MARKET_SLISBNB}) with vToken ${vPT_clisBNB_25JUN2026} in the adapter
- Enable Pendle PT vault deposit, withdrawal, and maturity redemption flows on BSC mainnet (ambassador testing phase)

#### References
- GitHub PR: [https://github.com/VenusProtocol/vips/pull/681](https://github.com/VenusProtocol/vips/pull/681)
- Pendle Finance: [https://app.pendle.finance](https://app.pendle.finance/)
- PT-clisBNBx-25JUN2026 Market on Pendle: [https://app.pendle.finance/trade/markets](https://app.pendle.finance/trade/markets) (search: clisBNBx)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // Accept ownership
      {
        target: PENDLE_PT_VAULT_ADAPTER,
        signature: "acceptOwnership()",
        params: [],
      },
      // Grant permissions on PendlePTVaultAdapter
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [PENDLE_PT_VAULT_ADAPTER, "addMarket(address,address)", bscmainnet.NORMAL_TIMELOCK],
      },
      ...[
        bscmainnet.NORMAL_TIMELOCK,
        bscmainnet.FAST_TRACK_TIMELOCK,
        bscmainnet.CRITICAL_TIMELOCK,
        bscmainnet.GUARDIAN,
      ].flatMap(timelock => [
        {
          target: bscmainnet.ACCESS_CONTROL_MANAGER,
          signature: "giveCallPermission(address,string,address)",
          params: [PENDLE_PT_VAULT_ADAPTER, "pause()", timelock],
        },
        {
          target: bscmainnet.ACCESS_CONTROL_MANAGER,
          signature: "giveCallPermission(address,string,address)",
          params: [PENDLE_PT_VAULT_ADAPTER, "unpause()", timelock],
        },
      ]),
      // Add slisBNB Pendle market
      {
        target: PENDLE_PT_VAULT_ADAPTER,
        signature: "addMarket(address,address)",
        params: [PENDLE_MARKET_SLISBNB, vPT_clisBNB_25JUN2026],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip606;
