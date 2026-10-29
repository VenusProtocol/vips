import { BigNumber, constants } from "ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { ROUTER_ROLES, giveCallPermission } from "../vip-668/permissions";
import {
  CRITICAL_GUARDIAN_GRANTS,
  NORMAL_TIMELOCK_GRANTS,
  PAUSE_GUARDIAN_GRANTS,
  REGISTRY_GRANTS,
} from "../vip-668/permissions-bscmainnet";
import {
  ACM,
  ADAPTER_SPOKE_V1,
  BPNC_PRICE,
  BPN_CLOSE_FACTOR,
  BPN_INPUTS,
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
  PAUSE_GUARDIAN,
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
// Stands up the pool, prices BPNC at a fixed $1, lists BPNC as allowlisted collateral and USDT, USDC and U as
// Hub-funded liquidity at a flat 6% borrow APY, and connects each liquidity market to its Hub's Spoke source.
//
// STATUS: DRAFT. `vip678()` throws while any of BPN_INPUTS in ./addresses/bscmainnet.ts is still `PENDING`.
//
// 69 commands, under the Governor's 100-operation cap, so nothing goes through the AuxiliaryCommandsAggregator and
// nothing has to be seeded before proposing.
//
// ORDER that matters:
//  - The registry's six grants before `addPool`, which reverts without them.
//  - BPNC's price before its `addMarket`: a collateral factor above 0 needs a nonzero price.
//  - `addMarket` before every comptroller setter on that market (`MarketNotListed`).
//  - The Normal Timelock's six spoke-only grants before the incentive and allowlist setters that need them.
//  - `setProtocolSeizeShare(0)` before `setMarketLiquidationIncentive(1e18)`: the incentive has to be at least
//    1 + the market's seize share, which is 5% when the market is deployed.
//  - `setAllowedSupplier` before `addResource` (the Spoke adapter rejects a source the allowlist does not admit), and
//    `addResource` before both inner queues (`ResourceNotRegistered`).
//
// AT EXECUTION, or the whole proposal reverts:
//  - The VTreasury holds 10 BPNC. BPN sends it there; the VTreasury already holds the USDT, USDC and U seeds.
//  - VIP-675 has executed: each Spoke source's inner queues hold its bStock index and bStock mainstream markets, the
//    queues VIP-678 extends. Re-read them on chain before proposing.
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

const poolCommands = ({ comptroller }: BpnInputs) => [
  { target: comptroller, signature: "acceptOwnership()", params: [] },
  { target: comptroller, signature: "setPriceOracle(address)", params: [RESILIENT_ORACLE] },
  { target: comptroller, signature: "setDeviationBoundedOracle(address)", params: [DEVIATION_BOUNDED_ORACLE] },
  ...REGISTRY_GRANTS.map(role => giveCallPermission(ACM, comptroller, role, SPOKE_POOL_REGISTRY)),
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

const listMarket = (m: BpnMarket) => [
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

/// The other 14 comptroller grants: the Normal Timelock's six, the Critical Guardian's five, the Pause Guardian's two
/// and CollateralGateway's `enterMarketForAccount`, the same VIP-668 and VIP-670 gave the bStock index pool. None
/// carries over: each of those names its own comptroller.
const grantCommands = ({ comptroller }: BpnInputs) =>
  [
    ...NORMAL_TIMELOCK_GRANTS.map(role => ({ role, account: NORMAL_TIMELOCK })),
    ...CRITICAL_GUARDIAN_GRANTS.map(role => ({ role, account: CRITICAL_GUARDIAN })),
    ...PAUSE_GUARDIAN_GRANTS.map(role => ({ role, account: PAUSE_GUARDIAN })),
    ...ROUTER_ROLES.map(role => ({ role, account: COLLATERAL_GATEWAY })),
  ].map(({ role, account }) => giveCallPermission(ACM, comptroller, role, account));

const riskCommands = (comptroller: string, markets: BpnMarket[], collateral: BpnMarket) => [
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

const allowlistCommands = (comptroller: string, markets: BpnMarket[]) =>
  markets.flatMap(m => [
    { target: comptroller, signature: "setSupplyAllowlistEnabled(address,bool)", params: [m.vToken, true] },
    ...m.allowedSuppliers.map(supplier => ({
      target: comptroller,
      signature: "setAllowedSupplier(address,address,bool)",
      params: [m.vToken, supplier, true],
    })),
  ]);

/// The BPN Loan market goes last in each Spoke source's deposit queue and first in its withdraw queue.
const hubCommands = (m: BpnLiquidityMarket) => {
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

export const buildCommands = (inputs: BpnInputs) => {
  assertComplete(inputs);
  const collateral = collateralMarket(inputs);
  const liquidity = liquidityMarkets(inputs);
  const markets = [collateral, ...liquidity];
  return [
    ...poolCommands(inputs),
    ...oracleCommands(inputs),
    ...markets.flatMap(listMarket),
    ...grantCommands(inputs),
    ...riskCommands(inputs.comptroller, markets, collateral),
    ...allowlistCommands(inputs.comptroller, markets),
    ...liquidity.flatMap(hubCommands),
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

- **Collateral side**: BPNC (BPN Credit Token), priced at a fixed $1. Only allowlisted accounts may supply it. It is not borrowable.
- **Liquidity side**: USDT, USDC and U. Only the Liquidity Hub of the same token may supply each market, through the Spoke yield group that already funds the bStock pools. They are borrowable at a flat 6% APY and give no borrow power.

#### Proposed changes

1. Register the pool in the Spoke pool registry, with a ${pct(BPN_CLOSE_FACTOR)} close factor, a ${discount(
      BPN_POOL_LIQUIDATION_INCENTIVE,
    )} pool-wide liquidation incentive and a $${tokens(
      BPN_MIN_LIQUIDATABLE_COLLATERAL,
    )} minimum liquidatable collateral, priced by the ResilientOracle and the DeviationBoundedOracle.
2. Price BPNC at a fixed $1: a direct price on the ChainlinkOracle (${CHAINLINK_ORACLE}), the ResilientOracle's main and only oracle for BPNC.
3. List the four markets, each seeded with 10 tokens from the Venus Treasury, with the seed vTokens sent to ${SEED_RECEIVER}.
4. Set every market's liquidation incentive and protocol seize share to 0%, and pause borrowing on BPNC.
5. Restrict supply on every market to its allowlist: BPNC to the Venus custody Safe (${VENUS_CUSTODY_SAFE}) and BPN (${
      inputs.bpnSupplier
    }), and USDT, USDC and U each to its Hub's Spoke yield group.
6. Add each liquidity market to its Spoke yield group, last to deposit and first to withdraw.
7. Grant the pool's permissions: the registry's, the Normal Timelock's, the Critical and Pause Guardians', and \`enterMarketForAccount\` to the CollateralGateway (${COLLATERAL_GATEWAY}), against this comptroller only.

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
- Liquidations are permissionless. The pool's liquidation allowlist stays off.

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
