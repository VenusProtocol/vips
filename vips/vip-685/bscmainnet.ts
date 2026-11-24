import { constants } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { Command, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { pct, tokens } from "../vip-675/commands";
import { BSTOCK_PAUSE_SENTINEL } from "../vip-680/bscmainnet";
import {
  ANTB_MARKET,
  ATLAS_MAX_STALE_PERIOD,
  ATLAS_ORACLE,
  DEVIATION_BOUNDED_ORACLE,
  MAINSTREAM_POOL_NAME,
  NORMAL_TIMELOCK,
  POOL,
  REDUCE_RESERVES_BLOCK_DELTA,
  RESILIENT_ORACLE,
  SEED_RECEIVER,
  SPOKE_POOL_REGISTRY,
  VTREASURY,
  Vip685Market,
} from "./addresses/bscmainnet";

// ===================================================================================================
// VIP-685 [BNB Chain]: list ANTB as collateral in the bStock mainstream Spoke pool.
//
// The same steps as VIP-677 and VIP-678, which added collateral markets to the pool VIP-675 created, for one market:
//  1. Price ANTB: Atlas, the ResilientOracle, then the DBO, whose `setTokenConfigs` reads the live price. Before the
//     listing, because `addMarket` sets a collateral factor above 0, which needs a nonzero price.
//  2. List it: VTreasury withdrawal, approve and `addMarket`, which pulls the seed from the Normal Timelock. Then have
//     the BStockPauseSentinel monitor it, as VIP-680 did for the pool's other bStocks.
//  3. Its reserve delta, its own liquidation incentive, its protocol seize share (after the incentive, which bounds it)
//     and BORROW paused.
//
// Step 3 runs inline, not through the AuxiliaryCommandsAggregator as in VIP-675: the Normal Timelock holds each of
// those roles as an address(0) wildcard, which VIP-675 granted for every Spoke pool. It holds the sentinel's
// `setMarketMonitored` as a grant from VIP-680.
//
// AT EXECUTION, or the whole proposal reverts:
//  - The Atlas feed is fresh (3800s), and still authorizes ATLAS_ORACLE.
//  - ANTB has no DBO config (`MarketAlreadyInitialized`).
//  - The VTreasury holds the 0.12 ANTB seed. `withdrawTreasuryBEP20` caps at its balance and `addMarket` takes the
//    rest from the Normal Timelock, which holds no ANTB.
// ===================================================================================================

/// The governor assigns the real number at proposal time.
const VIP_NUMBER = 685;

/// `Action.BORROW` in isolated-pools `ComptrollerInterface.sol`.
const ACTION_BORROW = 2;

const priceCommands = (m: Vip685Market): Command[] => [
  {
    target: ATLAS_ORACLE,
    signature: "setTokenConfigs((address,address,uint256)[])",
    params: [[[m.underlying, m.atlasFeed, ATLAS_MAX_STALE_PERIOD]]],
  },
  {
    target: RESILIENT_ORACLE,
    signature: "setTokenConfigs((address,address[3],bool[3],bool)[])",
    // Atlas as main, no pivot, no fallback, no caching.
    params: [
      [[m.underlying, [ATLAS_ORACLE, constants.AddressZero, constants.AddressZero], [true, false, false], false]],
    ],
  },
  {
    target: DEVIATION_BOUNDED_ORACLE,
    signature: "setTokenConfigs((address,uint64,uint256,uint256,bool,bool)[])",
    params: [
      [
        [
          m.underlying,
          m.dbo.cooldownPeriod,
          m.dbo.triggerThreshold,
          m.dbo.resetThreshold,
          m.dbo.enableBoundedPricing,
          m.dbo.enableCaching,
        ],
      ],
    ],
  },
];

const listCommands = (m: Vip685Market): Command[] => [
  {
    target: VTREASURY,
    signature: "withdrawTreasuryBEP20(address,uint256,address)",
    params: [m.underlying, m.initialSupply, NORMAL_TIMELOCK],
  },
  { target: m.underlying, signature: "approve(address,uint256)", params: [SPOKE_POOL_REGISTRY, m.initialSupply] },
  {
    target: SPOKE_POOL_REGISTRY,
    signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
    params: [
      [m.vToken, m.collateralFactor, m.liquidationThreshold, m.initialSupply, SEED_RECEIVER, m.supplyCap, m.borrowCap],
    ],
  },
  { target: BSTOCK_PAUSE_SENTINEL, signature: "setMarketMonitored(address,bool)", params: [m.vToken, true] },
];

const setupCommands = (m: Vip685Market): Command[] => [
  { target: m.vToken, signature: "setReduceReservesBlockDelta(uint256)", params: [REDUCE_RESERVES_BLOCK_DELTA] },
  {
    target: POOL,
    signature: "setMarketLiquidationIncentive(address,uint256)",
    params: [m.vToken, m.liquidationIncentive],
  },
  { target: m.vToken, signature: "setProtocolSeizeShare(uint256)", params: [m.protocolSeizeShare] },
  {
    target: POOL,
    signature: "setActionsPaused(address[],uint8[],bool)",
    params: [[m.vToken], [ACTION_BORROW], true],
  },
];

export const commands = (m: Vip685Market): Command[] => [...priceCommands(m), ...listCommands(m), ...setupCommands(m)];

export const vip685 = () => {
  const m = ANTB_MARKET;

  const meta = {
    version: "v2",
    title: `VIP-${VIP_NUMBER} [BNB Chain] List ANTB as collateral in the bStock mainstream Spoke pool`,
    description: `#### Summary

If passed, this VIP will list ANTB (Anthropic bStock) as collateral in the **${MAINSTREAM_POOL_NAME}** Hub-Funded Spoke pool on BNB Chain, which VIP-675 created. Anyone may supply it and use it as collateral. It is not borrowable.

#### Proposed changes

1. Price ANTB with Atlas as the main oracle and a DeviationBoundedOracle window. APRO has no ANTB feed on BNB Chain, so there is no pivot.
2. List the market, seeded from the Venus Treasury with the seed vTokens sent to ${SEED_RECEIVER}, and add it to the markets the BStockPauseSentinel (${BSTOCK_PAUSE_SENTINEL}) monitors.
3. Give the market a liquidation incentive of its own, set its protocol seize share, and pause borrowing on it.

#### Market parameters

- **${m.symbol}**: collateral factor ${pct(m.collateralFactor)}, liquidation threshold ${pct(
      m.liquidationThreshold,
    )}, liquidation incentive ${pct(m.liquidationIncentive.sub(parseUnits("1", 18)))}, protocol seize share ${pct(
      m.protocolSeizeShare,
    )}, supply cap ${tokens(m.supplyCap)} ANTB, borrow cap 0, reserve factor ${pct(m.reserveFactor)}, seed ${tokens(
      m.initialSupply,
    )} ANTB
- ANTB charges no interest.
- The market sends its reserves to the ProtocolShareReserve every ${REDUCE_RESERVES_BLOCK_DELTA.toLocaleString(
      "en-US",
    )} blocks, as the pool's other markets do.

#### Pricing

- Atlas ${m.atlasFeed} (${ATLAS_MAX_STALE_PERIOD}s max stale period), no pivot.
- DeviationBoundedOracle window: a 1 hour cooldown, a 12.5% trigger and a 5% reset, as on the pool's other new assets.

#### Notes

- Liquidations are permissionless. The pool's liquidation allowlist stays off.
- If ANTB's issuer pauses the token, or its compliance module blocks the market, a keeper can have the BStockPauseSentinel set the market's collateral factor to 0 through EBrake. The liquidation threshold stays, so no position becomes liquidatable.

#### Deployed contracts

- ${m.symbol}: ${m.vToken}
- ANTB: ${m.underlying}

#### References

- [VIP-675: the bStock mainstream Spoke pool](https://app.venus.io/#/governance/proposal/675?chainId=56)
- [vANTB_bStockMainstream deployment](https://github.com/VenusProtocol/isolated-pools/pull/590)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(commands(m), meta, ProposalType.REGULAR);
};

export default vip685;
