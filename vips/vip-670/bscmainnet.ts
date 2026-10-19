import { BigNumber, constants } from "ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { Command, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { giveCallPermission } from "../vip-668/permissions";
import {
  ACM,
  ADAPTER_SPOKE_V1,
  APRO_MAX_STALE_PERIOD,
  APRO_ORACLE,
  ATLAS_MAX_STALE_PERIOD,
  ATLAS_ORACLE,
  BOUND_LOWER_RATIO,
  BOUND_UPPER_RATIO,
  BOUND_VALIDATOR,
  COLLATERAL_GATEWAY,
  COLLATERAL_MARKETS,
  CollateralMarket,
  DEVIATION_BOUNDED_ORACLE,
  LIQUIDITY_IRM,
  LIQUIDITY_MARKETS,
  LiquidityMarket,
  NORMAL_TIMELOCK,
  PENDING,
  POOL_LIQUIDATION_INCENTIVE,
  PROTOCOL_SEIZE_SHARE,
  REDUCE_RESERVES_BLOCK_DELTA,
  RESILIENT_ORACLE,
  SEED_RECEIVER,
  SPOKE_COMPTROLLER,
  SPOKE_POOL_REGISTRY,
  SpokeMarket,
  VTREASURY,
} from "./addresses/bscmainnet";
import { VIP_670_GRANTS } from "./permissions-bscmainnet";

// ===================================================================================================
// VIP-670 [BNB Chain]: Hub-Funded Spoke pool, markets and Liquidity Hub wiring.
//
// Third of three. Needs VIP-668 and VIP-669 executed first.
//
// STATUS: DRAFT. `vip670()` throws while any address or risk value in ./addresses/bscmainnet.ts is still open.
//
// ORACLES: QQQB is priced the way the Core pool prices TSLAB, Atlas as main and APRO as pivot inside a 5% band. APRO
// has no SPYB feed on BNB Chain, so SPYB is priced by Atlas alone, with no APRO config and no band.
//
// GAS, from the simulation (bscmainnet fork at block 128,543,000, VIP-668 and VIP-669 executed on the fork): 52
// commands, propose() about 10.66M (63.5% of the 16,777,216 per-tx cap), queue() 3.01M, execute() 6.47M (38.6%).
//
// ---------------------------------------------------------------------------------------------------
// ORDER that matters:
//  - The four price configs before the DBO, whose `setTokenConfig` reads the live `ResilientOracle` price. The
//    `ResilientOracle` config before the collateral markets' `addMarket`: a CF above 0 needs a nonzero price.
//  - Per market: VTreasury withdrawal and approve before `addMarket`. `addMarket` pulls exactly the seed, so the
//    allowance ends at 0 without a second approve.
//  - `addMarket` before every comptroller setter on that market, which reverts `MarketNotListed` otherwise. The
//    supply allowlist in particular cannot be armed first, and would block the seed mint if it could.
//  - Per Hub: `setAllowedSupplier` before `addResource` (the adapter rejects a source the allowlist does not admit),
//    and `addResource` before both inner queues (`ResourceNotRegistered` otherwise).
//
// AT EXECUTION, or the whole proposal reverts:
//  - The QQQB and SPYB Atlas feeds are fresh (within 3800s), and the QQQB APRO feed is fresh (within 3900s) and
//    within 5% of QQQB's Atlas price.
//  - Atlas authorizes `ATLAS_ORACLE` on both Atlas feeds (`isAuthorizedCaller`). The DBO's price read reverts
//    `OnlyAuthorizedCallerAllowed()` otherwise.
//  - Neither QQQB nor SPYB has a DBO config (`MarketAlreadyInitialized`).
// The VTreasury must also hold every seed. It holds exactly the 10 USDT, USDC and U seeds on 2026-10-19, so nothing
// else may draw on those first. `withdrawTreasuryBEP20` caps at its balance, and `addMarket` takes the rest from the
// Normal Timelock's own balance. That silently covers a short USDT or USDC seed (about 58 of each on 2026-10-16), but
// not U, QQQB or SPYB, so a short seed of those reverts.
// Re-read each Hub's deposit queue and Spoke caps too: the Operator can change both, and step 7 overwrites the queue
// without reverting.
//
// NOT IN THIS PROPOSAL:
//  - `setProtocolSeizeShare`: every market keeps the 5% it is initialized with, the risk sheet's value.
//  - `setReserveFactor`: `028` initializes every market with the risk sheet's 10%.
//  - `setCollateralFactor` after listing: LT 0.85 times the pool-wide 1.1 incentive is below 1, so `addMarket` takes
//    the final values directly.
//  - Oracle changes for USDT, USDC and U: their live `ResilientOracle` configs match the risk sheet, and the sheet
//    gives them no DBO window.
//  - Hub caps on the Spoke sources: VIP-669 registers them with their final values.
//  - `raiseResourceCap` on the Spoke sources: the risk sheet sets none. 0 means no resource cap, and each market's
//    supply cap still bounds the source.
//  - `setLiquidationAllowlistEnabled`: the allowlist is off by default and stays off.
//  - `BStockLiquidator.setPoolRegistry` and `setCoreFlashSource`: `onlyOwner` calls by the Operator after VIP-668.
// ===================================================================================================

/// Placeholder, as in VIP-668 and VIP-669. VIP numbers are assigned by the governor at proposal time.
const VIP_NUMBER = 670;

/// `Action.BORROW` in isolated-pools `ComptrollerInterface.sol`.
const ACTION_BORROW = 2;

/// The markets VIP-670 lists. Mainnet's by default; the simulation passes fork stand-ins for whatever is still pending.
export type Vip670Markets = { liquidity: LiquidityMarket[]; collateral: CollateralMarket[] };
const MAINNET_MARKETS: Vip670Markets = { liquidity: LIQUIDITY_MARKETS, collateral: COLLATERAL_MARKETS };

/// Every address VIP-670 needs that is still `PENDING`, including the VIP-668 and VIP-669 ones its commands target.
/// Exported so the simulation can report what is missing.
export const pendingDeployments = ({ liquidity, collateral }: Vip670Markets = MAINNET_MARKETS): string[] =>
  [
    { name: "SpokePoolRegistry (VIP-668)", address: SPOKE_POOL_REGISTRY },
    { name: "Comptroller_HubSpoke (VIP-668)", address: SPOKE_COMPTROLLER },
    ...liquidity.map(m => ({
      name: `Spoke source for ${m.stack.name} (VIP-669)`,
      address: m.stack.spokeSource,
    })),
    ...[...liquidity, ...collateral].map(m => ({ name: m.symbol, address: m.vToken })),
    // No command targets the rate models, but the simulation checks each market's.
    ...[...liquidity, ...collateral].map(m => ({ name: `${m.symbol} rate model`, address: m.interestRateModel })),
    { name: "AdapterSpokeV1", address: ADAPTER_SPOKE_V1 },
    { name: "CollateralGateway", address: COLLATERAL_GATEWAY },
    ...collateral.flatMap(m => [
      { name: `${m.symbol} Atlas feed`, address: m.atlasFeed },
      ...(m.aproFeed === null ? [] : [{ name: `${m.symbol} APRO feed`, address: m.aproFeed }]),
    ]),
  ]
    .filter(({ address }) => address === PENDING)
    .map(({ name }) => name);

/// Every risk value that is still open.
export const pendingRiskValues = ({ collateral }: Vip670Markets = MAINNET_MARKETS): string[] => [
  ...collateral.flatMap(m => [
    ...(m.initialSupply === null ? [`${m.symbol} seed`] : []),
    ...(m.dbo === null ? [`${m.symbol} DBO window`] : []),
  ]),
];

const required = <T>(value: T | null, what: string): T => {
  if (value === null) throw new Error(`VIP-${VIP_NUMBER}: ${what} is not set`);
  return value;
};

const pct = (mantissa: BigNumber, decimals?: number) => {
  const value = Number(formatUnits(mantissa, 16));
  return `${decimals === undefined ? value : value.toFixed(decimals)}%`;
};
const tokens = (amount: BigNumber) => {
  const [whole, fraction] = formatUnits(amount, 18).split(".");
  return `${BigInt(whole).toLocaleString("en-US")}${fraction === "0" ? "" : `.${fraction}`}`;
};

const listMarket = (m: SpokeMarket): Command[] => {
  const seed = required(m.initialSupply, `${m.symbol} seed`);
  return [
    { target: m.vToken, signature: "setReduceReservesBlockDelta(uint256)", params: [REDUCE_RESERVES_BLOCK_DELTA] },
    {
      target: VTREASURY,
      signature: "withdrawTreasuryBEP20(address,uint256,address)",
      params: [m.underlying, seed, NORMAL_TIMELOCK],
    },
    { target: m.underlying, signature: "approve(address,uint256)", params: [SPOKE_POOL_REGISTRY, seed] },
    {
      target: SPOKE_POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [[m.vToken, m.collateralFactor, m.liquidationThreshold, seed, SEED_RECEIVER, m.supplyCap, m.borrowCap]],
    },
  ];
};

const wireHub = (m: LiquidityMarket): Command[] => {
  const { hub, spokeSource, depositQueue } = m.stack;
  return [
    {
      target: SPOKE_COMPTROLLER,
      signature: "setAllowedSupplier(address,address,bool)",
      params: [m.vToken, spokeSource, true],
    },
    { target: spokeSource, signature: "addResource(address,address)", params: [m.vToken, ADAPTER_SPOKE_V1] },
    { target: spokeSource, signature: "setInnerDepositQueue(address[])", params: [[m.vToken]] },
    { target: spokeSource, signature: "setInnerWithdrawQueue(address[])", params: [[m.vToken]] },
    // Spoke first: Core's cap on each Hub (2B) is far above the Hub's TVL, so behind Core it would receive nothing
    // while Core's market has room.
    { target: hub, signature: "setOuterDepositQueue(address[])", params: [[spokeSource, ...depositQueue]] },
  ];
};

export const vip670 = (markets: Vip670Markets = MAINNET_MARKETS) => {
  const { liquidity: LIQUIDITY_MARKETS, collateral: COLLATERAL_MARKETS } = markets;
  const MARKETS: SpokeMarket[] = [...LIQUIDITY_MARKETS, ...COLLATERAL_MARKETS];
  const missing = [...pendingDeployments(markets), ...pendingRiskValues(markets)];
  if (missing.length > 0) {
    throw new Error(
      `VIP-${VIP_NUMBER} [bscmainnet] is still a draft: ${missing.length} value(s) pending in ` +
        `vips/vip-670/addresses/bscmainnet.ts.\n  - ${missing.join("\n  - ")}\n` +
        `Deploy or decide them and fill them in first. Nothing here has a safe default.`,
    );
  }

  const incentive = (m: SpokeMarket) => {
    const own = COLLATERAL_MARKETS.find(c => c.symbol === m.symbol)?.liquidationIncentive;
    return own
      ? pct(own.sub(parseUnits("1", 18)))
      : `${pct(POOL_LIQUIDATION_INCENTIVE.sub(parseUnits("1", 18)))} (pool-wide)`;
  };
  const marketLines = MARKETS.map(
    m =>
      `- **${m.symbol}**: collateral factor ${pct(m.collateralFactor)}, liquidation threshold ${pct(
        m.liquidationThreshold,
      )}, liquidation incentive ${incentive(m)}, supply cap ${tokens(m.supplyCap)}, borrow cap ${tokens(
        m.borrowCap,
      )}, reserve factor ${pct(m.reserveFactor)}, seed ${tokens(required(m.initialSupply, `${m.symbol} seed`))}`,
  );
  const capLines = LIQUIDITY_MARKETS.map(
    ({ stack }) =>
      `- ${stack.name}: ${tokens(stack.spokeAbsoluteCap)} absolute, ${
        stack.spokePercentageCapBps / 100
      }% of the Hub's assets`,
  );
  const contractLines = [
    ...MARKETS.map(m => [m.symbol, m.vToken]),
    ["JumpRateModelV2 of USDT, USDC and U", LIQUIDITY_MARKETS[0].interestRateModel],
    ["WhitePaperInterestRateModel of QQQB and SPYB", COLLATERAL_MARKETS[0].interestRateModel],
    ["AdapterSpokeV1", ADAPTER_SPOKE_V1],
    ["CollateralGateway", COLLATERAL_GATEWAY],
  ].map(([name, address]) => `- ${name}: ${address}`);

  const meta = {
    version: "v2",
    title: `VIP-${VIP_NUMBER} [BNB Chain] Hub-Funded Spoke pool: markets and Liquidity Hub wiring`,
    description: `#### Summary

If passed, this VIP will list the markets of the **bStock index** Hub-Funded Spoke pool on BNB Chain and connect its liquidity side to the **Liquidity Hub**:

- **Liquidity side**: USDT, USDC and U. Only the Liquidity Hub of the same token may supply each market, through its Spoke yield group. They are borrowable and give no borrow power.
- **Collateral side**: QQQB and SPYB. Anyone may supply them and use them as collateral. They are not borrowable.

#### Proposed changes

1. Price QQQB and SPYB with Atlas as the main oracle (${ATLAS_MAX_STALE_PERIOD}s max stale period) and a DeviationBoundedOracle window. QQQB also gets APRO as the pivot (${APRO_MAX_STALE_PERIOD}s) inside a ±5% band, the way the Core pool prices TSLAB. APRO has no SPYB feed, so SPYB has no pivot.
2. List the five markets, each seeded from the Venus Treasury with the seed vTokens sent to ${SEED_RECEIVER}.
3. Give QQQB and SPYB a liquidation incentive of their own, and pause borrowing on both.
4. Restrict supply on the USDT, USDC and U markets to each Hub's Spoke yield group.
5. Point every market's shortfall handler at the Normal Timelock, so governance, not a Shortfall auction, handles any bad debt.
6. Allow the CollateralGateway (${COLLATERAL_GATEWAY}) to enter a user into a market, so supplying and enabling collateral take one transaction.
7. Register each liquidity market in its Spoke yield group, and put the group first in its Hub's deposit queue.

#### Market parameters

${marketLines.join("\n")}

- Interest rate model of USDT, USDC and U: JumpRateModelV2 with a ${pct(
      LIQUIDITY_IRM.baseRatePerYear,
      2,
    )} base rate, a ${pct(LIQUIDITY_IRM.multiplierPerYear, 2)} multiplier and a ${pct(
      LIQUIDITY_IRM.jumpMultiplierPerYear,
      2,
    )} jump multiplier per year, and a ${pct(LIQUIDITY_IRM.kink)} kink. QQQB and SPYB charge no interest.
- Every market: ${pct(
      PROTOCOL_SEIZE_SHARE,
    )} protocol seize share, and reserves sent to the ProtocolShareReserve every ${REDUCE_RESERVES_BLOCK_DELTA.toLocaleString(
      "en-US",
    )} blocks.

#### Spoke yield group caps

Set when each Spoke yield group was registered on its Hub. The lower of the two applies.

${capLines.join("\n")}

#### Notes

- Liquidations are permissionless. The pool's liquidation allowlist stays off.
- Each Hub deposits into its Spoke market first and withdraws from it last, up to the lowest of the market's supply cap and the two yield group caps above.

#### Deployed contracts

${contractLines.join("\n")}

#### References

- [Spoke pool contracts](https://github.com/VenusProtocol/isolated-pools/pull/559)
- [Spoke yield family](https://github.com/VenusProtocol/venus-liquidity-hub/pull/22)
- [CollateralGateway](https://github.com/VenusProtocol/venus-periphery/pull/74)
- [VIP simulation](https://github.com/VenusProtocol/vips/pull/782)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  const dbo = (m: CollateralMarket) => required(m.dbo, `${m.symbol} DBO window`);

  /// The collateral markets with an APRO pivot. The others are priced by Atlas alone.
  const PIVOTED = COLLATERAL_MARKETS.filter(m => m.aproFeed !== null);

  const commands: Command[] = [
    // 1. QQQB and SPYB pricing. The DBO call is last: it reads the live price, so the feeds have to be fresh, and
    //    QQQB's two within the band, at execution.
    {
      target: ATLAS_ORACLE,
      signature: "setTokenConfigs((address,address,uint256)[])",
      params: [COLLATERAL_MARKETS.map(m => [m.underlying, m.atlasFeed, ATLAS_MAX_STALE_PERIOD])],
    },
    // Both batch setters revert on an empty array, so neither is sent without a pivoted market.
    ...(PIVOTED.length === 0
      ? []
      : [
          {
            target: APRO_ORACLE,
            signature: "setTokenConfigs((address,address,uint256)[])",
            params: [PIVOTED.map(m => [m.underlying, m.aproFeed, APRO_MAX_STALE_PERIOD])],
          },
          {
            target: BOUND_VALIDATOR,
            signature: "setValidateConfigs((address,uint256,uint256)[])",
            params: [PIVOTED.map(m => [m.underlying, BOUND_UPPER_RATIO, BOUND_LOWER_RATIO])],
          },
        ]),
    {
      target: RESILIENT_ORACLE,
      signature: "setTokenConfigs((address,address[3],bool[3],bool)[])",
      params: [
        COLLATERAL_MARKETS.map(m => [
          m.underlying,
          [ATLAS_ORACLE, m.aproFeed === null ? constants.AddressZero : APRO_ORACLE, constants.AddressZero],
          [true, m.aproFeed !== null, false],
          false,
        ]),
      ],
    },
    {
      target: DEVIATION_BOUNDED_ORACLE,
      signature: "setTokenConfigs((address,uint64,uint256,uint256,bool,bool)[])",
      params: [
        COLLATERAL_MARKETS.map(m => [
          m.underlying,
          dbo(m).cooldownPeriod,
          dbo(m).triggerThreshold,
          dbo(m).resetThreshold,
          dbo(m).enableBoundedPricing,
          dbo(m).enableCaching,
        ]),
      ],
    },

    // 2. List the five markets. The registry calls the comptroller under VIP-668's registry grants.
    ...MARKETS.flatMap(listMarket),

    // 3. Collateral markets: an incentive of their own, and BORROW paused behind the 0 borrow cap.
    ...COLLATERAL_MARKETS.map(m => ({
      target: SPOKE_COMPTROLLER,
      signature: "setMarketLiquidationIncentive(address,uint256)",
      params: [m.vToken, m.liquidationIncentive],
    })),
    {
      target: SPOKE_COMPTROLLER,
      signature: "setActionsPaused(address[],uint8[],bool)",
      params: [COLLATERAL_MARKETS.map(m => m.vToken), [ACTION_BORROW], true],
    },

    // 4. Liquidity markets: supply allowlist on. Its only member is added with the Hub wiring below.
    ...LIQUIDITY_MARKETS.map(m => ({
      target: SPOKE_COMPTROLLER,
      signature: "setSupplyAllowlistEnabled(address,bool)",
      params: [m.vToken, true],
    })),

    // 5. The deployed `shortfall` is the isolated-pools `Shortfall`, which cannot auction this pool's bad debt.
    ...MARKETS.map(m => ({
      target: m.vToken,
      signature: "setShortfallContract(address)",
      params: [NORMAL_TIMELOCK],
    })),

    // 6. `CollateralGateway` as the only holder of `enterMarketForAccount`, against this comptroller only.
    ...VIP_670_GRANTS.map(({ role, account }) => giveCallPermission(ACM, SPOKE_COMPTROLLER, role, account)),

    // 7. Connect each liquidity market to its Hub. VIP-669 already set each Spoke source's caps on its Hub.
    ...LIQUIDITY_MARKETS.flatMap(wireHub),
  ];

  return makeProposal(commands, meta, ProposalType.REGULAR);
};

export default vip670;
