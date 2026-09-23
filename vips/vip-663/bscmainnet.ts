import { ethers } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

// Second PendlePTVaultAdapter proxy, deployed 2026-03-23. Its proxy and its own ProxyAdmin were
// left with the deployer EOA and its implementation was never recorded in a venus-periphery
// deployment artifact. This is the adapter the dApp drove until the frontend was repointed at the
// VIP-606 adapter.
export const PENDLE_PT_VAULT_ADAPTER = "0x179bD219c2a20a49406C9AdA39634eDac1C7F656";
export const PENDLE_PT_VAULT_ADAPTER_PROXY_ADMIN = "0xaE560a5e368Ea72D4090533B245bF163c9Dc6dc2";

// Implementation currently behind the proxy above. Its verified source is identical to the
// implementation below except that _checkAccessAllowed is absent from addMarket(), pause() and
// unpause(), which leaves those three callable by any address.
export const UNGUARDED_IMPLEMENTATION = "0x79276267b23B611ee9Aa8D8D50CB134334e876fA";

// Implementation of the VIP-606 adapter (0x60Db419d8ea13C5827072Cf693D13cA1Ec6E0B4a), recorded in
// venus-periphery deployments/bscmainnet as PendlePTVaultAdapter_Implementation. Same compiler,
// same ABI, same storage layout, with the three access-control checks in place.
export const GUARDED_IMPLEMENTATION = "0x70B093Df30B62105e1aCb91Feeb1E9a916d7d899";

// Original deployer; the ProxyAdmin has already been transferred to the Normal Timelock.
export const DEPLOYER = "0x24c30C9C84b8a3C71A521ad30007ED47372331b3";

// ─── VPD-2089 ─────────────────────────────────────────────────────────────────

export const RESILIENT_ORACLE = bscmainnet.RESILIENT_ORACLE;
export const CHAINLINK_ORACLE = bscmainnet.CHAINLINK_ORACLE;
export const ATLAS_ORACLE = bscmainnet.ATLAS_ORACLE;
export const REDSTONE_ORACLE = bscmainnet.REDSTONE_ORACLE;
export const COMPTROLLER = bscmainnet.UNITROLLER;

// THE is priced [Chainlink, Atlas, RedStone]. RedStone is discontinuing the THE feed behind the
// fallback slot, so the fallback is cleared and main, pivot and the caching flag stay as they are.
export const THE = "0xF4C8E32EaDEC4BFe97E0F595AdD0f4450a863a11";
export const THE_REDSTONE_FEED = "0xFB1267A29C0aa19daae4a483ea895862A69e4AA5";
export const THE_ORACLES = [CHAINLINK_ORACLE, ATLAS_ORACLE, ethers.constants.AddressZero];
export const THE_ENABLE_FLAGS = [true, true, false];

export const vTRX = "0xC5D3466aA484B040eE977073fcF337f2c00071c1";
export const vlisUSD = "0x689E0daB47Ab16bcae87Ec18491692BF621Dc6Ab";

// Legacy JumpRateModel already in service on the deprecated Core markets (VIP-634):
// base 300%, 0% multiplier, 363.64% jump above a 45% kink, so ~500% APR at full utilisation.
export const DEPRECATION_IRM = "0xc255352947ef3594C45b0Fe8bcB690e51C3D744A";
export const RF_FULL = parseUnits("1", 18);

// vlisUSD keeps its liquidation threshold, so existing positions stay liquidatable on the same terms.
export const vlisUSD_LIQUIDATION_THRESHOLD = parseUnits("0.55", 18);

export const Actions = {
  MINT: 0,
  BORROW: 2,
  ENTER_MARKET: 7,
};

export const vip663 = () => {
  const meta = {
    version: "v2",
    title: "VIP-663 [BNB Chain] Pendle PT Adapter Governance Handover, THE Oracle Update and TRX & lisUSD Deprecation",
    description: `This VIP has three parts on BNB Chain:

1. Completes the governance handover of the second PendlePTVaultAdapter proxy (${PENDLE_PT_VAULT_ADAPTER}) and restores the access-control checks on it.
2. Removes the RedStone fallback oracle from THE, whose feed RedStone is discontinuing.
3. Moves the TRX and lisUSD Core Pool markets to the next deprecation stage.

#### Part 1: Pendle PT adapter governance handover

Two PendlePTVaultAdapter proxies exist on BNB Chain mainnet. The first (0x60Db419d8ea13C5827072Cf693D13cA1Ec6E0B4a) was activated by VIP-606, is recorded in the venus-periphery deployment artifacts, and is owned by the Normal Timelock under the shared ProxyAdmin 0x6beb6D2695B67FEb73ad4f172E8E2975497187e4. The second (${PENDLE_PT_VAULT_ADAPTER}) was deployed on 2026-03-23 and never went through the same handover: it and its own ProxyAdmin (${PENDLE_PT_VAULT_ADAPTER_PROXY_ADMIN}) remained owned by the deployer address ${DEPLOYER}, and its implementation ${UNGUARDED_IMPLEMENTATION} was never recorded in a deployment artifact.

The two implementations are byte-identical in source except for three lines: the _checkAccessAllowed call is absent from addMarket(address,address), pause() and unpause() on ${UNGUARDED_IMPLEMENTATION}. As a result those three functions are callable by any address on this proxy today, while the equivalent calls on the VIP-606 adapter revert with the ACM Unauthorized error. Because withdraw and redeemAtMaturity carry the whenNotPaused modifier, any address can suspend this adapter's deposit and exit paths — and any address can lift the pause again, since unpause() is equally open.

Users hold their vTokens directly, but existing delegate approvals remain effective until revoked. This VIP places the legacy adapter under governance and repairs its access checks; it does not revoke those approvals or disable user redemption. Users can also authorize the VIP-606 adapter or redeem directly through the vToken, subject to normal market liquidity, collateral and pause restrictions.

#### Prerequisites

The deployer address ${DEPLOYER} has completed the two prerequisite transactions:

1. PendlePTVaultAdapter(${PENDLE_PT_VAULT_ADAPTER}).transferOwnership(NORMAL_TIMELOCK) — mined at block 123125269. The adapter is Ownable2Step, so this only sets the pending owner and must be completed by the acceptOwnership() command below.
2. ProxyAdmin(${PENDLE_PT_VAULT_ADAPTER_PROXY_ADMIN}).transferOwnership(NORMAL_TIMELOCK) — mined at block 123125372. This ProxyAdmin is single-step Ownable, so ownership transfers immediately and needs no command in this VIP.

Execution requires the Normal Timelock to remain the adapter’s pending owner and the ProxyAdmin’s owner.

#### Changes

**1. Accept ownership of the adapter**
- Contract: PendlePTVaultAdapter (${PENDLE_PT_VAULT_ADAPTER})
- Function: acceptOwnership()
- Effect: Completes the two-step ownership handoff, placing the adapter under Normal Timelock control.

---

**2. Restore the guarded implementation**
- Contract: ProxyAdmin (${PENDLE_PT_VAULT_ADAPTER_PROXY_ADMIN})
- Function: upgrade(address proxy, address implementation)
- Parameters: proxy ${PENDLE_PT_VAULT_ADAPTER}, implementation ${GUARDED_IMPLEMENTATION}
- Effect: Points the proxy at the implementation already in use by the VIP-606 adapter, which restores the _checkAccessAllowed checks on addMarket, pause and unpause. The two implementations share an ABI and storage layout, so no state migration is involved and no initializer is re-run.

---

#### Legacy adapter permissions

No ACM permissions are granted: the production integration uses the VIP-606 adapter, so this legacy adapter does not need ongoing market or pause administration. After the upgrade, addMarket, pause and unpause require ACM authorization, which has not been granted on this adapter to the timelocks or guardians. Ownership alone does not authorize these functions. Governance retains the ability to upgrade the contract or grant permissions later if necessary.

The upgrade preserves the existing pause state. If the legacy adapter is paused before execution, it remains paused and cannot be unpaused without a subsequent permission grant or other governance action. Users can instead authorize and redeem through the VIP-606 adapter; the two adapters have independent pause states.

#### Part 2: THE oracle update

RedStone is discontinuing its THE price feed (${THE_REDSTONE_FEED}). On Venus the feed is read through the RedStoneOracle (${REDSTONE_ORACLE}), which sits in the FALLBACK slot of THE's ResilientOracle configuration. The current configuration is:

- MAIN: ChainlinkOracle (${CHAINLINK_ORACLE})
- PIVOT: AtlasOracle (${ATLAS_ORACLE})
- FALLBACK: RedStoneOracle (${REDSTONE_ORACLE})

**3. Clear THE's fallback oracle**
- Contract: ResilientOracle (${RESILIENT_ORACLE})
- Function: setTokenConfig((address,address[3],bool[3],bool))
- Parameters: asset ${THE}, oracles [ChainlinkOracle, AtlasOracle, zero address], enable flags [true, true, false], caching disabled
- Effect: THE is priced by Chainlink, validated against Atlas. The MAIN and PIVOT oracles and the caching flag are unchanged. The unused THE configuration remains on the RedStoneOracle adapter. With no fallback, THE pricing reverts if Chainlink or Atlas is unavailable or their prices fail validation.

#### Part 3: TRX and lisUSD deprecation

The next deprecation stage for two BNB Chain Core Pool markets, vTRX (${vTRX}) and vlisUSD (${vlisUSD}):

**vTRX**
- Supply cap: 3,000,000 TRX → 0
- Borrow cap: 1,000,000 TRX → 0
- Collateral factor: 0 (unchanged)
- Liquidation threshold: 52.5% (unchanged)
- Reserve factor: 25% → 100%
- Paused actions: MINT (already paused), BORROW and ENTER_MARKET

**vlisUSD**
- Supply cap: 2,100,000 lisUSD → 0
- Borrow cap: 4,000,000 lisUSD → 0
- Collateral factor: 50% → 0
- Liquidation threshold: 55% (unchanged)
- Reserve factor: 10% → 100%
- Paused actions: BORROW (already paused), MINT and ENTER_MARKET

Both markets move to the deprecation interest rate model ${DEPRECATION_IRM}, the one already used by the deprecated Core Pool markets: a 300% base rate, rising to about 500% APR at full utilisation.

**4. Pause actions**
- Contract: Comptroller (${COMPTROLLER})
- Function: _setActionsPaused(address[],uint8[],bool)
- Parameters: vTRX — BORROW, ENTER_MARKET; vlisUSD — MINT, ENTER_MARKET
- Effect: No new supply, borrow or collateral enablement on either market. Redeem, repay, liquidation and exitMarket remain unpaused, subject to the existing market checks.

**5. Set supply and borrow caps to zero**
- Contract: Comptroller (${COMPTROLLER})
- Functions: _setMarketSupplyCaps(address[],uint256[]), _setMarketBorrowCaps(address[],uint256[])

**6. Set the vlisUSD collateral factor to zero**
- Contract: Comptroller (${COMPTROLLER})
- Function: setCollateralFactor(address,uint256,uint256)
- Parameters: vlisUSD, collateral factor 0, liquidation threshold 55% (unchanged)
- Effect: lisUSD no longer adds borrowing power. The liquidation threshold is kept, so this collateral-factor change does not itself change liquidation eligibility. The higher borrow rate still increases debt over time.

**7. Set the reserve factor to 100%** on vTRX and vlisUSD via _setReserveFactor(uint256).

**8. Switch to the deprecation interest rate model** on vTRX and vlisUSD via _setInterestRateModel(address).

#### Summary

If approved, this VIP will:
- Accept ownership of PendlePTVaultAdapter ${PENDLE_PT_VAULT_ADAPTER} into the Normal Timelock
- Upgrade that proxy to the guarded implementation ${GUARDED_IMPLEMENTATION}, closing the permissionless pause(), unpause() and addMarket() entry points
- Remove the RedStone fallback oracle from THE
- Zero the caps of vTRX and vlisUSD, zero the vlisUSD collateral factor, pause new activity on both, and move both to a 100% reserve factor and the deprecation interest rate model

After execution, both Pendle PT adapters on BNB Chain are owned by the Normal Timelock, but this legacy adapter receives no ACM permission grants.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // 1. Complete the two-step ownership handoff started by the deployer.
      {
        target: PENDLE_PT_VAULT_ADAPTER,
        signature: "acceptOwnership()",
        params: [],
      },
      // 2. Restore the implementation that carries the access-control checks.
      {
        target: PENDLE_PT_VAULT_ADAPTER_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [PENDLE_PT_VAULT_ADAPTER, GUARDED_IMPLEMENTATION],
      },

      // 3. THE: drop the RedStone fallback, keep Chainlink main and Atlas pivot.
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [[THE, THE_ORACLES, THE_ENABLE_FLAGS, false]],
      },

      // 4. TRX & lisUSD: pause the actions that are still open.
      {
        target: COMPTROLLER,
        signature: "_setActionsPaused(address[],uint8[],bool)",
        params: [[vTRX], [Actions.BORROW, Actions.ENTER_MARKET], true],
      },
      {
        target: COMPTROLLER,
        signature: "_setActionsPaused(address[],uint8[],bool)",
        params: [[vlisUSD], [Actions.MINT, Actions.ENTER_MARKET], true],
      },

      // 5. Caps to zero.
      {
        target: COMPTROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [
          [vTRX, vlisUSD],
          [0, 0],
        ],
      },
      {
        target: COMPTROLLER,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [
          [vTRX, vlisUSD],
          [0, 0],
        ],
      },

      // 6. vlisUSD CF to zero, liquidation threshold unchanged. vTRX CF is already zero.
      {
        target: COMPTROLLER,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [vlisUSD, 0, vlisUSD_LIQUIDATION_THRESHOLD],
      },

      // 7. Reserve factor to 100%.
      ...[vTRX, vlisUSD].map(vToken => ({
        target: vToken,
        signature: "_setReserveFactor(uint256)",
        params: [RF_FULL],
      })),

      // 8. Deprecation interest rate model.
      ...[vTRX, vlisUSD].map(vToken => ({
        target: vToken,
        signature: "_setInterestRateModel(address)",
        params: [DEPRECATION_IRM],
      })),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip663;
