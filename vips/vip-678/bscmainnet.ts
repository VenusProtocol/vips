import { BigNumber, constants } from "ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { batch } from "src/auxiliaryCommandsAggregator";
import { Batch, Command, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { SET_CLOSE_FACTOR, giveCallPermission } from "../vip-668/permissions";
import {
  ACM,
  ADAPTER_SPOKE_V1,
  BPNC_FIRST_MINT,
  BPNC_PRICE,
  BPNC_ROLES,
  BPN_CLOSE_FACTOR,
  BPN_INPUTS,
  BPN_LIQUIDATORS,
  BPN_MIN_LIQUIDATABLE_COLLATERAL,
  BPN_POOL_LIQUIDATION_INCENTIVE,
  BPN_POOL_NAME,
  BpnInputs,
  BpnLiquidityMarket,
  BpnMarket,
  CHAINLINK_ORACLE,
  COLLATERAL_GATEWAY,
  CRITICAL_GUARDIAN,
  DEVIATION_BOUNDED_ORACLE,
  FLAT_6_IRM,
  NORMAL_TIMELOCK,
  OPERATOR,
  PENDING,
  REDUCE_RESERVES_BLOCK_DELTA,
  RESILIENT_ORACLE,
  SEED_RECEIVER,
  SPOKE_POOL_REGISTRY,
  VENUS_CUSTODY_SAFE,
  VTREASURY,
  collateralMarket,
  liquidityMarkets,
} from "./addresses/bscmainnet";

// ===================================================================================================
// VIP-678 [BNB Chain]: the BPN Loan Hub-Funded Spoke pool.
//
// Takes over BPNC and mints its first supply to the Operator, stands up the pool, prices BPNC at a fixed $1, lists BPNC
// as allowlisted collateral and USDT, USDC and U as Hub-funded liquidity at a flat 6% borrow APY, and connects each
// liquidity market to its Hub's Spoke source.
//
// STATUS: DRAFT. `vip678()` throws while any of BPN_INPUTS in ./addresses/bscmainnet.ts is still `PENDING`.
//
// WHY TWO AGGREGATOR BATCHES: as 79 plain commands, propose() through the proposer Safe needed 99.3% of the 16,777,216
// per-tx gas cap. Everything after the listings goes through the AuxiliaryCommandsAggregator instead, in two adjacent
// batches, which the team seeds with `seedAggregatorBatches` and pins in `BpnInputs.seededIndices` before proposing.
// The aggregator holds the ACM admin role only while they run, and each batch revokes the grants it gave itself.
//
// INLINE, because the aggregator cannot do them: `acceptOwnership` and every call that has to come from the Normal
// Timelock (the BPNC mints into its own balance, the VTreasury withdrawals, `approve` and `addMarket`, which pulls the
// seed from the caller), and the price, which has to come before BPNC's `addMarket`.
//
// ORDER that matters:
//  - The Normal Timelock's `mint` grant before both BPNC mints.
//  - BPNC's price before its `addMarket`: a collateral factor above 0 needs a nonzero price.
//  - `addMarket` before every comptroller setter on that market (`MarketNotListed`).
//  - `setProtocolSeizeShare(0)` before `setMarketLiquidationIncentive(1e18)`: the incentive has to be at least
//    1 + the market's seize share, which is 5% when the market is deployed.
//  - `setAllowedSupplier` before `addResource` (the Spoke adapter rejects a source the allowlist does not admit), and
//    `addResource` before both inner queues (`ResourceNotRegistered`).
//
// AT EXECUTION, or the whole proposal reverts:
//  - BPNC is deployed with the Normal Timelock as pending owner.
//  - The VTreasury holds the USDT, USDC and U seeds, as it did on 2026-10-29.
//  - VIP-675 has executed: each Spoke source's inner queues hold its bStock index and bStock mainstream markets, the
//    queues VIP-678 extends, and every spoke comptroller's roles are granted as address(0) wildcards, including the six
//    `addPool` needs. Re-read the queues on chain before proposing.
//
// NOT IN VIP-678:
//  - `setShortfallContract` and `setReserveFactor`: the markets are deployed with the Normal Timelock as `shortfall`
//    and a 10% reserve factor.
//  - A DeviationBoundedOracle window for BPNC: without one the DBO passes the spot price through, and a fixed price
//    never deviates.
//  - Hub caps and outer queues: each Spoke source keeps its place and caps. VIP-669 set them to 50% of each Hub's TVL
//    and an absolute cap of 300M USDT, 90M USDC and 30M U, above the 8M supply cap of each new market.
// ===================================================================================================

/// The governor assigns the real number at proposal time.
const VIP_NUMBER = 678;

/// `Action.BORROW` in isolated-pools `ComptrollerInterface.sol`.
const ACTION_BORROW = 2;

/// `setActionsPaused` checks the `uint256[]` form, because `Action` is an enum.
const PAUSE_ROLE = "setActionsPaused(address[],uint256[],bool)";

/// Every input still `PENDING`. Exported so the simulation can report what it stands in for.
export const pendingInputs = (inputs: BpnInputs): string[] =>
  Object.entries(inputs)
    .filter(([, value]) => value === PENDING)
    .map(([name]) => name);

const assertComplete = (inputs: BpnInputs) => {
  const missing = pendingInputs(inputs);
  if (missing.length > 0) {
    throw new Error(
      `VIP-${VIP_NUMBER} [bscmainnet] is still a draft: ${missing.length} value(s) pending in ` +
        `vips/vip-678/addresses/bscmainnet.ts: ${missing.join(", ")}. Deploy or decide them and fill them in first.`,
    );
  }
};

/// The Normal Timelock's own `mint`, which the two mints below need. BPNC's other roles are granted in the first batch.
const TIMELOCK_MINT = { role: "mint(address,uint256)", account: NORMAL_TIMELOCK };

/// The Normal Timelock mints the first supply to the Operator and the market's seed to itself.
const tokenCommands = ({ bpnc }: BpnInputs, seed: BigNumber): Command[] => [
  { target: bpnc, signature: "acceptOwnership()", params: [] },
  giveCallPermission(ACM, bpnc, TIMELOCK_MINT.role, TIMELOCK_MINT.account),
  { target: bpnc, signature: "mint(address,uint256)", params: [OPERATOR, BPNC_FIRST_MINT] },
  { target: bpnc, signature: "mint(address,uint256)", params: [NORMAL_TIMELOCK, seed] },
];

const poolCommands = ({ comptroller }: BpnInputs) => [
  { target: comptroller, signature: "acceptOwnership()", params: [] },
  { target: comptroller, signature: "setPriceOracle(address)", params: [RESILIENT_ORACLE] },
  { target: comptroller, signature: "setDeviationBoundedOracle(address)", params: [DEVIATION_BOUNDED_ORACLE] },
  {
    target: SPOKE_POOL_REGISTRY,
    signature: "addPool(string,address,uint256,uint256,uint256)",
    params: [
      BPN_POOL_NAME,
      comptroller,
      BPN_CLOSE_FACTOR,
      BPN_POOL_LIQUIDATION_INCENTIVE,
      BPN_MIN_LIQUIDATABLE_COLLATERAL,
    ],
  },
];

const oracleCommands = ({ bpnc }: BpnInputs) => [
  { target: CHAINLINK_ORACLE, signature: "setDirectPrice(address,uint256)", params: [bpnc, BPNC_PRICE] },
  {
    target: RESILIENT_ORACLE,
    signature: "setTokenConfig((address,address[3],bool[3],bool))",
    params: [[bpnc, [CHAINLINK_ORACLE, constants.AddressZero, constants.AddressZero], [true, false, false], false]],
  },
];

/// BPNC's seed is already with the Normal Timelock, from `tokenCommands`. The others come from the VTreasury.
const listMarket = (m: BpnMarket, fromTreasury: boolean) => [
  ...(fromTreasury
    ? [
        {
          target: VTREASURY,
          signature: "withdrawTreasuryBEP20(address,uint256,address)",
          params: [m.underlying, m.initialSupply, NORMAL_TIMELOCK],
        },
      ]
    : []),
  { target: m.underlying, signature: "approve(address,uint256)", params: [SPOKE_POOL_REGISTRY, m.initialSupply] },
  {
    target: SPOKE_POOL_REGISTRY,
    signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
    params: [
      [m.vToken, m.collateralFactor, m.liquidationThreshold, m.initialSupply, SEED_RECEIVER, m.supplyCap, m.borrowCap],
    ],
  },
];

/// The comptroller's other roles are VIP-675's address(0) wildcards. Its Critical Guardian `setCloseFactor` is not:
/// FRV's LiquidationAdapter checks the same string, so it stays scoped. Then BPNC's roles, except the Normal Timelock's
/// `mint`, which `tokenCommands` already granted.
const grantCommands = ({ comptroller, bpnc }: BpnInputs): Command[] => [
  giveCallPermission(ACM, comptroller, SET_CLOSE_FACTOR, CRITICAL_GUARDIAN),
  ...BPNC_ROLES.flatMap(({ role, accounts }) => accounts.map(account => ({ role, account })))
    .filter(({ role, account }) => role !== TIMELOCK_MINT.role || account !== TIMELOCK_MINT.account)
    .map(({ role, account }) => giveCallPermission(ACM, bpnc, role, account)),
];

const riskCommands = (comptroller: string, markets: BpnMarket[], collateral: BpnMarket): Command[] => [
  ...markets.map(m => ({
    target: m.vToken,
    signature: "setReduceReservesBlockDelta(uint256)",
    params: [REDUCE_RESERVES_BLOCK_DELTA],
  })),
  ...markets.flatMap(m => [
    { target: m.vToken, signature: "setProtocolSeizeShare(uint256)", params: [m.protocolSeizeShare] },
    {
      target: comptroller,
      signature: "setMarketLiquidationIncentive(address,uint256)",
      params: [m.vToken, m.liquidationIncentive],
    },
  ]),
  {
    target: comptroller,
    signature: "setActionsPaused(address[],uint8[],bool)",
    aclSignature: PAUSE_ROLE,
    params: [[collateral.vToken], [ACTION_BORROW], true],
  },
];

const allowlistCommands = (comptroller: string, markets: BpnMarket[]): Command[] =>
  markets.flatMap(m => [
    { target: comptroller, signature: "setSupplyAllowlistEnabled(address,bool)", params: [m.vToken, true] },
    ...m.allowedSuppliers.map(supplier => ({
      target: comptroller,
      signature: "setAllowedSupplier(address,address,bool)",
      params: [m.vToken, supplier, true],
    })),
  ]);

/// Only BPN_LIQUIDATORS may liquidate, listed before the allowlist is switched on.
const liquidationCommands = (comptroller: string): Command[] => [
  ...BPN_LIQUIDATORS.map(liquidator => ({
    target: comptroller,
    signature: "setAllowedLiquidator(address,bool)",
    params: [liquidator, true],
  })),
  { target: comptroller, signature: "setLiquidationAllowlistEnabled(bool)", params: [true] },
];

/// The BPN Loan market goes last in each Spoke source's deposit queue and first in its withdraw queue.
const hubCommands = (m: BpnLiquidityMarket): Command[] => {
  const { spokeSource } = m.stack;
  return [
    { target: spokeSource, signature: "addResource(address,address)", params: [m.vToken, ADAPTER_SPOKE_V1] },
    {
      target: spokeSource,
      signature: "setInnerDepositQueue(address[])",
      params: [[...m.queuesBefore.deposit, m.vToken]],
    },
    {
      target: spokeSource,
      signature: "setInnerWithdrawQueue(address[])",
      params: [[m.vToken, ...m.queuesBefore.withdraw]],
    },
  ];
};

/// Each batch adds a grant and a revoke per distinct target and signature it calls, except on the ACM: 43 entries in
/// the first and 46 in the second, each seeded in one `addBatch` well under the per-tx gas cap.
const toBatch = (commands: Command[], seededIndex?: number): Batch =>
  batch(commands, seededIndex === undefined ? { raw: true } : { raw: true, seededIndex });

export const buildCommands = (inputs: BpnInputs): (Command | Batch)[] => {
  assertComplete(inputs);
  const collateral = collateralMarket(inputs);
  const liquidity = liquidityMarkets(inputs);
  const markets = [collateral, ...liquidity];
  const [grantsAndRisk, allowlistsAndHub] = inputs.seededIndices ?? [];
  return [
    ...tokenCommands(inputs, collateral.initialSupply),
    ...poolCommands(inputs),
    ...oracleCommands(inputs),
    ...listMarket(collateral, false),
    ...liquidity.flatMap(m => listMarket(m, true)),
    toBatch([...grantCommands(inputs), ...riskCommands(inputs.comptroller, markets, collateral)], grantsAndRisk),
    toBatch(
      [
        ...allowlistCommands(inputs.comptroller, markets),
        ...liquidationCommands(inputs.comptroller),
        ...liquidity.flatMap(hubCommands),
      ],
      allowlistsAndHub,
    ),
  ];
};

// ---------------------------------------------------------------------------------------------------
// Proposal text.
// ---------------------------------------------------------------------------------------------------

const ONE = parseUnits("1", 18);
const pct = (mantissa: BigNumber, digits?: number) => {
  const value = Number(formatUnits(mantissa, 16));
  return `${digits === undefined ? value : value.toFixed(digits)}%`;
};
const tokens = (amount: BigNumber) => Number(formatUnits(amount, 18)).toLocaleString("en-US");
const discount = (incentive: BigNumber) => pct(incentive.sub(ONE));

export const vip678 = (inputs: BpnInputs = BPN_INPUTS) => {
  const commands = buildCommands(inputs);
  const collateral = collateralMarket(inputs);
  const liquidity = liquidityMarkets(inputs);

  const meta = {
    version: "v2",
    title: `VIP-${VIP_NUMBER} [BNB Chain] BPN Loan Hub-Funded Spoke pool`,
    description: `#### Summary

If passed, this VIP will create the **${BPN_POOL_NAME}** Hub-Funded Spoke pool on BNB Chain, a loan to Better Payment Network (BPN):

- **Collateral side**: BPNC (BPN Credit Token), a new token governed by Venus and priced at a fixed $1. Only allowlisted accounts may supply it. It is not borrowable.
- **Liquidity side**: USDT, USDC and U. Only the Liquidity Hub of the same token may supply each market, through the Spoke yield group that already funds the bStock pools. They are borrowable at a flat 6% APY and give no borrow power.

#### Proposed changes

1. Take ownership of BPNC (${inputs.bpnc}) and mint its first ${tokens(
      BPNC_FIRST_MINT,
    )} BPNC to the Liquidity Hub Operator (${OPERATOR}), plus the 10 BPNC that seed its market. Then give BPNC's \`mint\` and \`pause\` to the Operator, the Normal Timelock and the Critical Guardian, and its \`burn\` and \`unpause\` to the Normal Timelock and the Critical Guardian.
2. Register the pool in the Spoke pool registry, with a ${pct(BPN_CLOSE_FACTOR)} close factor, a ${discount(
      BPN_POOL_LIQUIDATION_INCENTIVE,
    )} pool-wide liquidation incentive and a $${tokens(
      BPN_MIN_LIQUIDATABLE_COLLATERAL,
    )} minimum liquidatable collateral, priced by the ResilientOracle and the DeviationBoundedOracle.
3. Price BPNC at a fixed $1: a direct price on the ChainlinkOracle (${CHAINLINK_ORACLE}), the ResilientOracle's main and only oracle for BPNC.
4. List the four markets, each seeded with 10 tokens: BPNC's minted in step 1, the others from the Venus Treasury, with the seed vTokens sent to ${SEED_RECEIVER}.
5. Set every market's liquidation incentive and protocol seize share to 0%, and pause borrowing on BPNC.
6. Restrict supply on every market to its allowlist: BPNC to the Venus custody Safe (${VENUS_CUSTODY_SAFE}) and BPN (${
      inputs.bpnSupplier
    }), and USDT, USDC and U each to its Hub's Spoke yield group.
7. Turn on the pool's liquidation allowlist, with only the Operator on it.
8. Add each liquidity market to its Spoke yield group, last to deposit and first to withdraw.
9. Give the Critical Guardian \`setCloseFactor\` on this comptroller. Its other roles, including the CollateralGateway's (${COLLATERAL_GATEWAY}) \`enterMarketForAccount\`, come from the wildcards VIP-675 grants to every spoke comptroller.

Steps 5 to 9 and BPNC's lasting roles in step 1 run through the AuxiliaryCommandsAggregator, which holds the AccessControlManager admin role only while its batches run.

#### Market parameters

- **${collateral.symbol}**: collateral factor ${pct(collateral.collateralFactor)}, liquidation threshold ${pct(
      collateral.liquidationThreshold,
    )}, liquidation incentive ${discount(collateral.liquidationIncentive)}, protocol seize share ${pct(
      collateral.protocolSeizeShare,
    )}, supply cap ${tokens(collateral.supplyCap)}, borrow cap 0, reserve factor ${pct(
      collateral.reserveFactor,
    )}, no interest
${liquidity
  .map(
    m =>
      `- **${m.symbol}**: supply cap ${tokens(m.supplyCap)}, borrow cap ${tokens(m.borrowCap)}, reserve factor ${pct(
        m.reserveFactor,
      )}, liquidation incentive ${discount(m.liquidationIncentive)}, protocol seize share ${pct(m.protocolSeizeShare)}`,
  )
  .join("\n")}
- Interest rate model of USDT, USDC and U: a JumpRateModelV2 with a ${pct(
      FLAT_6_IRM.baseRatePerYear,
      4,
    )} base rate per year, no multiplier and no kink, so the borrow APY is 6% at any utilization, compounded daily.
- Every market sends its reserves to the ProtocolShareReserve every ${REDUCE_RESERVES_BLOCK_DELTA.toLocaleString(
      "en-US",
    )} blocks.

#### Notes

- BPNC is priced at a fixed $1 whatever happens to BPN. The supply allowlist and the ${tokens(
      collateral.supplyCap,
    )} BPNC supply cap bound what can be borrowed against it.
- With a 0% liquidation incentive a liquidator receives exactly the value it repays, in BPNC.
- Only the Operator can liquidate: every seizure in the pool checks the liquidation allowlist.
- Pausing BPNC stops its transfers, so while it is paused BPNC can be neither supplied nor redeemed.
- This VIP must execute after VIP-675, which grants the spoke comptroller wildcards and adds the bStock mainstream markets to each Spoke yield group's queues.

#### Deployed contracts

- Comptroller_BPNLoan: ${inputs.comptroller}
- BPNC: ${inputs.bpnc}
${[collateral, ...liquidity].map(m => `- ${m.symbol}: ${m.vToken}`).join("\n")}
- Flat 6% rate model: ${inputs.irmFlat6}

#### References

- [Spoke pool contracts](https://github.com/VenusProtocol/isolated-pools/pull/559)
- [Spoke yield family](https://github.com/VenusProtocol/venus-liquidity-hub/pull/22)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(commands, meta, ProposalType.REGULAR);
};

export default vip678;
