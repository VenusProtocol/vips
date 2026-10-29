import { BigNumber, constants } from "ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { batch } from "src/auxiliaryCommandsAggregator";
import { Batch, Command } from "src/types";

import { PAUSE_ROLE, giveCallPermission } from "../vip-668/permissions";
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
  CLOSE_FACTOR,
  COLLATERAL_GATEWAY,
  DEVIATION_BOUNDED_ORACLE,
  INDEX_POOL_DESCRIPTION,
  LIQUIDITY_IRM,
  MAINSTREAM_POOL_DESCRIPTION,
  MAINSTREAM_POOL_NAME,
  MIN_LIQUIDATABLE_COLLATERAL,
  MainstreamCollateralMarket,
  MainstreamLiquidityMarket,
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
import { OTHER_GRANTS_MAINSTREAM, REGISTRY_GRANTS_MAINSTREAM } from "./permissions-bscmainnet";

// ===================================================================================================
// VIP-675 [BNB Chain]: the commands every part builds from. See ./bscmainnet.ts for the split.
//
// SHAPE of each part, in this order:
//  1. Part 1 only: take the comptroller's ownership, wire both oracles, grant SPOKE_POOL_REGISTRY its six roles and
//     register the empty pool. `addPool` reverts without those grants, so they stay inline. `addPool` sets no
//     metadata, so then set this pool's description, and the bStock index pool's, which VIP-668 left empty.
//  2. Price the part's new assets: Atlas, APRO and the band where APRO has a feed, the ResilientOracle, then the DBO,
//     whose `setTokenConfigs` reads the live price. Inline, because pricing has to come before the listing (`addMarket`
//     sets a collateral factor above 0, which needs a nonzero price) and the one batch run comes after it.
//  3. List the part's markets: VTreasury withdrawal, approve and `addMarket` per market. Inline: the withdrawal is
//     `onlyOwner` and `addMarket` pulls the seed from `msg.sender`, so neither can run as the aggregator.
//  4. The rest, in one run of adjacent aggregator batches: the other 14 comptroller grants (part 1), each market's
//     reserve delta, the collateral markets' incentive, seize share and BORROW pause, and (part 1) each liquidity
//     market's supply allowlist and Hub wiring. Each batch grants the aggregator what it calls and revokes it after, so
//     none of the aggregator's own grants outlives the proposal.
//
// ORDER that matters: `addMarket` before every comptroller setter on that market (`MarketNotListed`), and inside the
// batch run `setAllowedSupplier` before `addResource` (the adapter rejects a source the allowlist does not admit) and
// `addResource` before both inner queues (`ResourceNotRegistered`).
//
// NOT IN VIP-675:
//  - `setShortfallContract`: the markets are deployed with the Normal Timelock as `shortfall`.
//  - `setReserveFactor`: every market is deployed with 10%.
//  - `setProtocolSeizeShare` on a market whose share is the 5% it is deployed with: the liquidity markets, GOOGLB,
//    AAPLB and METAB.
//  - Oracle and DBO commands for NVDAB, TSLAB, SPCXB and SKHYB: their configs are per asset and already live for Core.
//  - Hub caps and outer queues: each Spoke source keeps its place and caps; the new markets sit inside it.
// ===================================================================================================

/// `Action.BORROW` in isolated-pools `ComptrollerInterface.sol`.
const ACTION_BORROW = 2;

/// Entries per aggregator batch, counting each batch's own grants and revokes. Keeps every `addBatch` under the per-tx
/// gas cap: a full batch seeds for about 13M in the simulation.
const MAX_BATCH_ENTRIES = 80;

export type Vip675Part = {
  vipNumber: number;
  comptroller: string;
  /// Part 1 stands up the pool and lists the liquidity markets. Later parts only add collateral markets.
  createsPool: boolean;
  liquidity: MainstreamLiquidityMarket[];
  collateral: MainstreamCollateralMarket[];
  /// The aggregator index of each of the part's batches, once `seedAggregatorBatches` has stored them.
  seededIndices?: number[];
};

const marketsOf = (part: Vip675Part): SpokeMarket[] => [...part.liquidity, ...part.collateral];

/// The part's assets that need pricing: every collateral asset not already priced for the Core pool.
const newlyPriced = (part: Vip675Part) => part.collateral.filter(m => !m.pricedOnCore);

/// Every address the part needs that is still `PENDING`. Exported so the simulation can check none is left.
export const pendingDeployments = (part: Vip675Part): string[] =>
  [
    { name: "Comptroller_bStockMainstream", address: part.comptroller },
    ...marketsOf(part).map(m => ({ name: m.symbol, address: m.vToken })),
    ...marketsOf(part).map(m => ({ name: `${m.symbol} rate model`, address: m.interestRateModel })),
    ...part.collateral.map(m => ({ name: `${m.symbol} Atlas feed`, address: m.atlasFeed })),
  ]
    .filter(({ address }) => address === PENDING)
    .map(({ name }) => name);

/// Every risk value the part needs that is still open.
export const pendingRiskValues = (part: Vip675Part): string[] => [
  ...marketsOf(part)
    .filter(m => m.initialSupply === null)
    .map(m => `${m.symbol} seed`),
  ...newlyPriced(part)
    .filter(m => m.dbo === null)
    .map(m => `${m.symbol} DBO window`),
];

const assertComplete = (part: Vip675Part) => {
  const missing = [...pendingDeployments(part), ...pendingRiskValues(part)];
  if (missing.length > 0) {
    throw new Error(
      `VIP-${part.vipNumber} [bscmainnet] is still a draft: ${missing.length} value(s) pending in ` +
        `vips/vip-675/addresses/bscmainnet.ts.\n  - ${missing.join("\n  - ")}\n` +
        `Deploy or decide them and fill them in first. Nothing here has a safe default.`,
    );
  }
};

/// `updatePoolMetadata(comptroller, (category, logoURL, description))`, with only the description set.
const setPoolDescription = (comptroller: string, description: string): Command => ({
  target: SPOKE_POOL_REGISTRY,
  signature: "updatePoolMetadata(address,(string,string,string))",
  params: [comptroller, ["", "", description]],
});

const poolCommands = ({ comptroller }: Vip675Part): Command[] => [
  { target: comptroller, signature: "acceptOwnership()", params: [] },
  { target: comptroller, signature: "setPriceOracle(address)", params: [RESILIENT_ORACLE] },
  { target: comptroller, signature: "setDeviationBoundedOracle(address)", params: [DEVIATION_BOUNDED_ORACLE] },
  ...REGISTRY_GRANTS_MAINSTREAM.map(({ role, account }) => giveCallPermission(ACM, comptroller, role, account)),
  {
    target: SPOKE_POOL_REGISTRY,
    signature: "addPool(string,address,uint256,uint256,uint256)",
    params: [MAINSTREAM_POOL_NAME, comptroller, CLOSE_FACTOR, POOL_LIQUIDATION_INCENTIVE, MIN_LIQUIDATABLE_COLLATERAL],
  },
  setPoolDescription(comptroller, MAINSTREAM_POOL_DESCRIPTION),
  setPoolDescription(SPOKE_COMPTROLLER, INDEX_POOL_DESCRIPTION),
];

const oracleCommands = (part: Vip675Part): Command[] => {
  const priced = newlyPriced(part);
  if (priced.length === 0) return [];
  // Both APRO-side batch setters revert on an empty array, so neither is sent without a pivoted asset.
  const pivoted = priced.filter(m => m.aproFeed !== null);
  return [
    {
      target: ATLAS_ORACLE,
      signature: "setTokenConfigs((address,address,uint256)[])",
      params: [priced.map(m => [m.underlying, m.atlasFeed, ATLAS_MAX_STALE_PERIOD])],
    },
    ...(pivoted.length === 0
      ? []
      : [
          {
            target: APRO_ORACLE,
            signature: "setTokenConfigs((address,address,uint256)[])",
            params: [pivoted.map(m => [m.underlying, m.aproFeed, APRO_MAX_STALE_PERIOD])],
          },
          {
            target: BOUND_VALIDATOR,
            signature: "setValidateConfigs((address,uint256,uint256)[])",
            params: [pivoted.map(m => [m.underlying, BOUND_UPPER_RATIO, BOUND_LOWER_RATIO])],
          },
        ]),
    {
      target: RESILIENT_ORACLE,
      signature: "setTokenConfigs((address,address[3],bool[3],bool)[])",
      params: [
        priced.map(m => [
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
        priced.map(({ underlying, dbo }) => [
          underlying,
          dbo!.cooldownPeriod,
          dbo!.triggerThreshold,
          dbo!.resetThreshold,
          dbo!.enableBoundedPricing,
          dbo!.enableCaching,
        ]),
      ],
    },
  ];
};

const listMarket = (m: SpokeMarket): Command[] => [
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
];

/// Each Spoke source keeps its bStock index market first to deposit and last to withdraw: Hub deposits reach the
/// bStock mainstream market once the bStock index market is full, and Hub withdrawals draw on the bStock mainstream
/// market first.
const wireHub = (comptroller: string, m: MainstreamLiquidityMarket): Command[] => {
  const { spokeSource } = m.stack;
  return [
    {
      target: comptroller,
      signature: "setAllowedSupplier(address,address,bool)",
      params: [m.vToken, spokeSource, true],
    },
    { target: spokeSource, signature: "addResource(address,address)", params: [m.vToken, ADAPTER_SPOKE_V1] },
    { target: spokeSource, signature: "setInnerDepositQueue(address[])", params: [[m.indexMarket, m.vToken]] },
    { target: spokeSource, signature: "setInnerWithdrawQueue(address[])", params: [[m.vToken, m.indexMarket]] },
  ];
};

const batchedCommands = (part: Vip675Part): Command[] => [
  ...(part.createsPool
    ? OTHER_GRANTS_MAINSTREAM.map(({ role, account }) => giveCallPermission(ACM, part.comptroller, role, account))
    : []),
  ...marketsOf(part).map(m => ({
    target: m.vToken,
    signature: "setReduceReservesBlockDelta(uint256)",
    params: [REDUCE_RESERVES_BLOCK_DELTA],
  })),
  ...part.collateral.map(m => ({
    target: part.comptroller,
    signature: "setMarketLiquidationIncentive(address,uint256)",
    params: [m.vToken, m.liquidationIncentive],
  })),
  // After the incentive: `setProtocolSeizeShare` bounds the share by the market's own incentive.
  ...part.collateral
    .filter(m => !m.protocolSeizeShare.eq(PROTOCOL_SEIZE_SHARE))
    .map(m => ({
      target: m.vToken,
      signature: "setProtocolSeizeShare(uint256)",
      params: [m.protocolSeizeShare],
    })),
  ...(part.collateral.length === 0
    ? []
    : [
        {
          target: part.comptroller,
          signature: "setActionsPaused(address[],uint8[],bool)",
          // The comptroller checks the `uint256[]` form, because `Action` is an enum.
          aclSignature: PAUSE_ROLE,
          params: [part.collateral.map(m => m.vToken), [ACTION_BORROW], true],
        },
      ]),
  ...part.liquidity.map(m => ({
    target: part.comptroller,
    signature: "setSupplyAllowlistEnabled(address,bool)",
    params: [m.vToken, true],
  })),
  ...part.liquidity.flatMap(m => wireHub(part.comptroller, m)),
];

/// Cuts the batched commands into adjacent batches of at most MAX_BATCH_ENTRIES entries. Each batch adds a grant and a
/// revoke per distinct target and role it calls, except on the ACM itself.
const toBatches = (commands: Command[], seededIndices: number[] = []): Batch[] => {
  const chunks: Command[][] = [];
  let chunk: Command[] = [];
  let roles = new Set<string>();
  for (const command of commands) {
    const role = `${command.target.toLowerCase()} ${command.aclSignature ?? command.signature}`;
    const newRole = command.target !== ACM && !roles.has(role);
    if (chunk.length + 2 * roles.size + 1 + (newRole ? 2 : 0) > MAX_BATCH_ENTRIES) {
      chunks.push(chunk);
      chunk = [];
      roles = new Set();
    }
    if (command.target !== ACM) roles.add(role);
    chunk.push(command);
  }
  chunks.push(chunk);
  if (seededIndices.length > 0 && seededIndices.length !== chunks.length) {
    throw new Error(`VIP-675: ${chunks.length} batches but ${seededIndices.length} seeded indices`);
  }
  return chunks.map((commands, i) =>
    batch(commands, seededIndices.length > 0 ? { raw: true, seededIndex: seededIndices[i] } : { raw: true }),
  );
};

export const buildCommands = (part: Vip675Part): (Command | Batch)[] => {
  assertComplete(part);
  return [
    ...(part.createsPool ? poolCommands(part) : []),
    ...oracleCommands(part),
    ...marketsOf(part).flatMap(listMarket),
    ...toBatches(batchedCommands(part), part.seededIndices),
  ];
};

// ---------------------------------------------------------------------------------------------------
// Proposal text.
// ---------------------------------------------------------------------------------------------------

export const pct = (mantissa: BigNumber, digits?: number) => {
  const value = Number(formatUnits(mantissa, 16));
  return `${digits === undefined ? value : value.toFixed(digits)}%`;
};
export const tokens = (amount: BigNumber) => {
  const [whole, fraction] = formatUnits(amount, 18).split(".");
  return `${BigInt(whole).toLocaleString("en-US")}${fraction === "0" ? "" : `.${fraction}`}`;
};
const ticker = (m: SpokeMarket) => m.symbol.replace(/^v/, "").replace(/_.*$/, "");

export const marketLines = (part: Vip675Part): string[] => [
  ...part.liquidity.map(
    m =>
      `- **${m.symbol}**: supply cap ${tokens(m.supplyCap)}, borrow cap ${tokens(m.borrowCap)}, reserve factor ${pct(
        m.reserveFactor,
      )}, seed ${tokens(m.initialSupply!)}`,
  ),
  ...part.collateral.map(
    m =>
      `- **${m.symbol}** (tier ${m.tier}): collateral factor ${pct(m.collateralFactor)}, liquidation threshold ${pct(
        m.liquidationThreshold,
      )}, liquidation incentive ${pct(m.liquidationIncentive.sub(parseUnits("1", 18)))}, protocol seize share ${pct(
        m.protocolSeizeShare,
      )}, supply cap ${tokens(m.supplyCap)}, borrow cap 0, reserve factor ${pct(m.reserveFactor)}, seed ${tokens(
        m.initialSupply!,
      )}`,
  ),
];

export const pricingLines = (part: Vip675Part): string[] =>
  part.collateral.map(m =>
    m.pricedOnCore
      ? `- ${ticker(m)}: unchanged, the Core pool's Atlas and APRO configs and DeviationBoundedOracle window`
      : `- ${ticker(m)}: Atlas ${m.atlasFeed}${
          m.aproFeed === null ? ", no pivot (APRO has no feed on BNB Chain)" : `, APRO ${m.aproFeed} as pivot`
        }`,
  );

export const contractLines = (part: Vip675Part): string[] =>
  [
    ...(part.createsPool ? [["Comptroller_bStockMainstream", part.comptroller]] : []),
    ...marketsOf(part).map(m => [m.symbol, m.vToken]),
    ...(part.createsPool ? [["CollateralGateway", COLLATERAL_GATEWAY]] : []),
  ].map(([name, address]) => `- ${name}: ${address}`);

/// The meta of a part that only adds collateral markets to the pool part 1 (`poolVipNumber`) creates.
export const collateralPartMeta = (part: Vip675Part, poolVipNumber: number, title: string) => ({
  version: "v2",
  title,
  description: `#### Summary

If passed, this VIP will list ${
    part.collateral.length
  } more single-stock bStocks as collateral in the **${MAINSTREAM_POOL_NAME}** Hub-Funded Spoke pool on BNB Chain, which VIP-${poolVipNumber} creates. Anyone may supply them and use them as collateral. They are not borrowable.

#### Proposed changes

1. Price the assets with Atlas as the main oracle and a DeviationBoundedOracle window, with APRO as pivot where it has a feed.
2. List the markets, each seeded from the Venus Treasury with the seed vTokens sent to ${SEED_RECEIVER}.
3. Give each market a liquidation incentive of its own, set its protocol seize share where it is not the default 5%, and pause borrowing on them.

Step 3 runs through the AuxiliaryCommandsAggregator, which holds the AccessControlManager admin role only while its batches run.

#### Market parameters

${marketLines(part).join("\n")}

${commonParameters(part)}

#### Pricing

${pricingLines(part).join("\n")}

#### Notes

${noteLines(part).join("\n")}

#### Deployed contracts

${contractLines(part).join("\n")}

#### References

${referenceLines.join("\n")}`,
  forDescription: "I agree that Venus Protocol should proceed with this proposal",
  againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
  abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
});

export const commonParameters = (part: Vip675Part) =>
  [
    ...(part.liquidity.length === 0
      ? []
      : [
          `- Interest rate model of USDT, USDC and U: the bStock index pool's JumpRateModelV2, with a ${pct(
            LIQUIDITY_IRM.baseRatePerYear,
            2,
          )} base rate, a ${pct(LIQUIDITY_IRM.multiplierPerYear, 2)} multiplier and a ${pct(
            LIQUIDITY_IRM.jumpMultiplierPerYear,
            2,
          )} jump multiplier per year, and a ${pct(LIQUIDITY_IRM.kink)} kink.`,
          `- USDT, USDC and U: ${pct(PROTOCOL_SEIZE_SHARE)} protocol seize share.`,
        ]),
    `- The bStocks charge no interest.`,
    `- Every market sends its reserves to the ProtocolShareReserve every ${REDUCE_RESERVES_BLOCK_DELTA.toLocaleString(
      "en-US",
    )} blocks.`,
    `- New assets are priced by Atlas (${ATLAS_MAX_STALE_PERIOD}s max stale period), with APRO (${APRO_MAX_STALE_PERIOD}s) as pivot inside a ±5% band where APRO has a feed, and a DeviationBoundedOracle window with a 1 hour cooldown, a 12.5% trigger and a 5% reset.`,
  ].join("\n");

export const noteLines = (part: Vip675Part): string[] => [
  "- Liquidations are permissionless. The pool's liquidation allowlist stays off.",
  ...(part.liquidity.length === 0
    ? []
    : [
        "- Each Spoke yield group deposits into its bStock index market first and into its bStock mainstream market after it, and withdraws from its bStock mainstream market first. Both markets share the yield group's caps on its Hub, which this VIP does not change.",
      ]),
];

export const referenceLines = [
  "- [Spoke pool contracts](https://github.com/VenusProtocol/isolated-pools/pull/559)",
  "- [bStock mainstream pool deployment](https://github.com/VenusProtocol/isolated-pools/pull/575)",
  "- [Spoke yield family](https://github.com/VenusProtocol/venus-liquidity-hub/pull/22)",
];
