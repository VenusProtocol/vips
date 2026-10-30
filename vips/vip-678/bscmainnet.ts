import { BigNumber, constants } from "ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import {
  ADAPTER_SPOKE_V1,
  BPNC_FIRST_MINT,
  BPNC_PRICE,
  BPN_CLOSE_FACTOR,
  BPN_INPUTS,
  BPN_MIN_LIQUIDATABLE_COLLATERAL,
  BPN_POOL_DESCRIPTION,
  BPN_POOL_LIQUIDATION_INCENTIVE,
  BPN_POOL_NAME,
  COLLATERAL_GATEWAY,
  DEVIATION_BOUNDED_ORACLE,
  FLAT_6_IRM,
  OPERATOR,
  REDUCE_RESERVES_BLOCK_DELTA,
  SEED_RECEIVER,
  SPOKE_POOL_REGISTRY,
  VENUS_CUSTODY_SAFE,
  collateralMarket,
  liquidityMarkets,
} from "./config";

const { ACCESS_CONTROL_MANAGER, CHAINLINK_ORACLE, CRITICAL_GUARDIAN, NORMAL_TIMELOCK, RESILIENT_ORACLE, VTREASURY } =
  NETWORK_ADDRESSES.bscmainnet;

// ===================================================================================================
// VIP-678 [BNB Chain]: the BPN Loan Hub-Funded Spoke pool.
//
// Every command is in vip678's `makeProposal` call below, in execution order, under numbered sections that match the
// description's steps. What has to hold at execution and what the VIP leaves out are in the description's Notes.
//
// STATUS: DRAFT. BPN_INPUTS.bpnSupplier in ./config.ts is a placeholder until BPN names its address.
// ===================================================================================================

/// `Action.BORROW` in isolated-pools `ComptrollerInterface.sol`.
const ACTION_BORROW = 2;

const giveCallPermission = (contract: string, signature: string, account: string) => ({
  target: ACCESS_CONTROL_MANAGER,
  signature: "giveCallPermission(address,string,address)",
  params: [contract, signature, account],
});

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

const { bpnc: BPNC, comptroller: COMPTROLLER, bpnSupplier: BPN_SUPPLIER, irmFlat6: IRM_FLAT_6 } = BPN_INPUTS;
const COLLATERAL = collateralMarket(BPN_INPUTS);
const LIQUIDITY = liquidityMarkets(BPN_INPUTS);
const MARKETS = [COLLATERAL, ...LIQUIDITY];

export const vip678 = () => {
  const meta = {
    version: "v2",
    title: "VIP-678 [BNB Chain] BPN Loan Hub-Funded Spoke pool",
    description: `#### Summary

If passed, this VIP will create the **${BPN_POOL_NAME}** Hub-Funded Spoke pool on BNB Chain, a loan to Better Payment Network (BPN):

- **Collateral side**: BPNC (BPN Credit Token), a new token governed by Venus and priced at a fixed $1. Only allowlisted accounts may supply it. It is not borrowable.
- **Liquidity side**: USDT, USDC and U. Only the Liquidity Hub of the same token may supply each market, through the Spoke yield group that already funds the bStock pools. They are borrowable at a flat 6% APY and give no borrow power.

#### Proposed changes

1. Take ownership of BPNC (${BPNC}) and mint its first ${tokens(
      BPNC_FIRST_MINT,
    )} BPNC to the Liquidity Hub Operator (${OPERATOR}), plus the 10 BPNC that seed its market.
2. Take ownership of the pool's comptroller, price it with the ResilientOracle and the DeviationBoundedOracle, and register the pool in the Spoke pool registry with a ${pct(
      BPN_CLOSE_FACTOR,
    )} close factor, a ${discount(BPN_POOL_LIQUIDATION_INCENTIVE)} pool-wide liquidation incentive and a $${tokens(
      BPN_MIN_LIQUIDATABLE_COLLATERAL,
    )} minimum liquidatable collateral, and set its description to "${BPN_POOL_DESCRIPTION}".
3. Price BPNC at a fixed $1: a direct price on the ChainlinkOracle (${CHAINLINK_ORACLE}), the ResilientOracle's main and only oracle for BPNC.
4. List the four markets, each seeded with 10 tokens: BPNC's minted in step 1, the others from the Venus Treasury, with the seed vTokens sent to ${SEED_RECEIVER}.
5. Give BPNC's \`mint\` and \`pause\` to the Operator, the Normal Timelock and the Critical Guardian, and its \`burn\` and \`unpause\` to the Normal Timelock and the Critical Guardian. Give the Critical Guardian \`setCloseFactor\` on this comptroller. The comptroller's other roles, including the CollateralGateway's (${COLLATERAL_GATEWAY}) \`enterMarketForAccount\`, come from the wildcards VIP-675 grants to every spoke comptroller.
6. Send every market's reserves to the ProtocolShareReserve every ${REDUCE_RESERVES_BLOCK_DELTA.toLocaleString(
      "en-US",
    )} blocks, set every market's liquidation incentive and protocol seize share to 0%, and pause borrowing on BPNC.
7. Restrict supply on every market to its allowlist: BPNC to the Venus custody Safe (${VENUS_CUSTODY_SAFE}) and BPN (${BPN_SUPPLIER}), and USDT, USDC and U each to its Hub's Spoke yield group.
8. Turn on the pool's liquidation allowlist, with only the Operator on it.
9. Add each liquidity market to its Spoke yield group, last to deposit and first to withdraw.

#### Market parameters

- **${COLLATERAL.symbol}**: collateral factor ${pct(COLLATERAL.collateralFactor)}, liquidation threshold ${pct(
      COLLATERAL.liquidationThreshold,
    )}, liquidation incentive ${discount(COLLATERAL.liquidationIncentive)}, protocol seize share ${pct(
      COLLATERAL.protocolSeizeShare,
    )}, supply cap ${tokens(COLLATERAL.supplyCap)}, borrow cap 0, reserve factor ${pct(
      COLLATERAL.reserveFactor,
    )}, no interest
${LIQUIDITY.map(
  m =>
    `- **${m.symbol}**: supply cap ${tokens(m.supplyCap)}, borrow cap ${tokens(m.borrowCap)}, reserve factor ${pct(
      m.reserveFactor,
    )}, liquidation incentive ${discount(m.liquidationIncentive)}, protocol seize share ${pct(m.protocolSeizeShare)}`,
).join("\n")}
- Interest rate model of USDT, USDC and U: a JumpRateModelV2 with a ${pct(
      FLAT_6_IRM.baseRatePerYear,
      4,
    )} base rate per year, no multiplier and no kink, so the borrow APY is 6% at any utilization, compounded daily.

#### Notes

- BPNC is priced at a fixed $1 whatever happens to BPN. The supply allowlist and the ${tokens(
      COLLATERAL.supplyCap,
    )} BPNC supply cap bound what can be borrowed against it.
- With a 0% liquidation incentive a liquidator receives exactly the value it repays, in BPNC.
- Only the Operator can liquidate: every seizure in the pool checks the liquidation allowlist.
- Pausing BPNC stops its transfers, so while it is paused BPNC can be neither supplied nor redeemed.
- This VIP must execute after VIP-675, which grants the spoke comptroller wildcards and adds the bStock mainstream markets to each Spoke yield group's queues, which step 9 extends.
- The proposal reverts unless, at execution, BPNC and the comptroller name the Normal Timelock as pending owner and the Venus Treasury holds the 10 USDT, 10 USDC and 10 U seeds.
- Not in this VIP: the shortfall contract and reserve factor, set when the markets were deployed (the Normal Timelock and 10%); a DeviationBoundedOracle window for BPNC, since a fixed price never deviates; and Hub caps or outer queues, where each Spoke yield group keeps the caps VIP-669 set (50% of its Hub's TVL, at most 300M USDT, 90M USDC and 30M U), above each new market's 8M supply cap.

#### Deployed contracts

- Comptroller_BPNLoan: ${COMPTROLLER}
- BPNC: ${BPNC}
${[COLLATERAL, ...LIQUIDITY].map(m => `- ${m.symbol}: ${m.vToken}`).join("\n")}
- Flat 6% rate model: ${IRM_FLAT_6}

#### References

- [Spoke pool contracts](https://github.com/VenusProtocol/isolated-pools/pull/559)
- [Spoke yield family](https://github.com/VenusProtocol/venus-liquidity-hub/pull/22)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // ────────────────────────────────────────────────────────────────
      // 1. BPNC: take ownership and mint the first supply
      // ────────────────────────────────────────────────────────────────
      { target: BPNC, signature: "acceptOwnership()", params: [] },
      // before both mints; the Normal Timelock keeps it
      giveCallPermission(BPNC, "mint(address,uint256)", NORMAL_TIMELOCK),
      { target: BPNC, signature: "mint(address,uint256)", params: [OPERATOR, BPNC_FIRST_MINT] },
      // vBPNC's seed, supplied in step 4
      { target: BPNC, signature: "mint(address,uint256)", params: [NORMAL_TIMELOCK, COLLATERAL.initialSupply] },

      // ────────────────────────────────────────────────────────────────
      // 2. Pool
      // ────────────────────────────────────────────────────────────────
      { target: COMPTROLLER, signature: "acceptOwnership()", params: [] },
      { target: COMPTROLLER, signature: "setPriceOracle(address)", params: [RESILIENT_ORACLE] },
      { target: COMPTROLLER, signature: "setDeviationBoundedOracle(address)", params: [DEVIATION_BOUNDED_ORACLE] },
      // the registry's setter roles on this comptroller are VIP-675's spoke comptroller wildcards
      {
        target: SPOKE_POOL_REGISTRY,
        signature: "addPool(string,address,uint256,uint256,uint256)",
        params: [
          BPN_POOL_NAME,
          COMPTROLLER,
          BPN_CLOSE_FACTOR, // 50%
          BPN_POOL_LIQUIDATION_INCENTIVE, // 5%, the floor addPool accepts; every market overrides it in step 6
          BPN_MIN_LIQUIDATABLE_COLLATERAL, // $100
        ],
      },
      // after addPool: addPool stores no metadata; only the description is set
      {
        target: SPOKE_POOL_REGISTRY,
        signature: "updatePoolMetadata(address,(string,string,string))",
        params: [COMPTROLLER, ["", "", BPN_POOL_DESCRIPTION]], // (category, logoURL, description)
      },

      // ────────────────────────────────────────────────────────────────
      // 3. BPNC price: a fixed $1
      // ────────────────────────────────────────────────────────────────
      { target: CHAINLINK_ORACLE, signature: "setDirectPrice(address,uint256)", params: [BPNC, BPNC_PRICE] },
      // main oracle only: no pivot, no fallback, no caching
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [[BPNC, [CHAINLINK_ORACLE, constants.AddressZero, constants.AddressZero], [true, false, false], false]],
      },

      // ────────────────────────────────────────────────────────────────
      // 4. Markets, each seeded with 10 tokens, the seed vTokens sent to SEED_RECEIVER
      // ────────────────────────────────────────────────────────────────
      { target: BPNC, signature: "approve(address,uint256)", params: [SPOKE_POOL_REGISTRY, COLLATERAL.initialSupply] },
      {
        target: SPOKE_POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            COLLATERAL.vToken,
            COLLATERAL.collateralFactor, // 90%
            COLLATERAL.liquidationThreshold, // 95%
            COLLATERAL.initialSupply, // the 10 BPNC minted in step 1
            SEED_RECEIVER,
            COLLATERAL.supplyCap, // 10,000,000 BPNC
            COLLATERAL.borrowCap, // 0: not borrowable
          ],
        ],
      },
      ...LIQUIDITY.flatMap(m => [
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
            [
              m.vToken,
              m.collateralFactor, // 0: no borrow power
              m.liquidationThreshold, // 0
              m.initialSupply, // 10, from the VTreasury
              SEED_RECEIVER,
              m.supplyCap, // 8,000,000
              m.borrowCap, // 8,000,000
            ],
          ],
        },
      ]),

      // ────────────────────────────────────────────────────────────────
      // 5. Permissions
      // ────────────────────────────────────────────────────────────────
      // scoped, not a wildcard: FRV's LiquidationAdapter checks the same string
      giveCallPermission(COMPTROLLER, "setCloseFactor(uint256)", CRITICAL_GUARDIAN),
      // the Normal Timelock's mint was granted in step 1
      giveCallPermission(BPNC, "mint(address,uint256)", OPERATOR),
      giveCallPermission(BPNC, "mint(address,uint256)", CRITICAL_GUARDIAN),
      giveCallPermission(BPNC, "pause()", OPERATOR),
      giveCallPermission(BPNC, "pause()", NORMAL_TIMELOCK),
      giveCallPermission(BPNC, "pause()", CRITICAL_GUARDIAN),
      // burn takes BPNC from any holder, so governance only
      giveCallPermission(BPNC, "burn(address,uint256)", NORMAL_TIMELOCK),
      giveCallPermission(BPNC, "burn(address,uint256)", CRITICAL_GUARDIAN),
      giveCallPermission(BPNC, "unpause()", NORMAL_TIMELOCK),
      giveCallPermission(BPNC, "unpause()", CRITICAL_GUARDIAN),

      // ────────────────────────────────────────────────────────────────
      // 6. Risk parameters
      // ────────────────────────────────────────────────────────────────
      ...MARKETS.map(m => ({
        target: m.vToken,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: [REDUCE_RESERVES_BLOCK_DELTA],
      })),
      ...MARKETS.flatMap(m => [
        { target: m.vToken, signature: "setProtocolSeizeShare(uint256)", params: [m.protocolSeizeShare] }, // 0%
        // after the seize share: the incentive must be at least 1 + seize share, which is 5% at deploy
        {
          target: COMPTROLLER,
          signature: "setMarketLiquidationIncentive(address,uint256)",
          params: [m.vToken, m.liquidationIncentive], // 0%
        },
      ]),
      {
        target: COMPTROLLER,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [[COLLATERAL.vToken], [ACTION_BORROW], true],
      },

      // ────────────────────────────────────────────────────────────────
      // 7. Supply allowlists
      // ────────────────────────────────────────────────────────────────
      {
        target: COMPTROLLER,
        signature: "setSupplyAllowlistEnabled(address,bool)",
        params: [COLLATERAL.vToken, true],
      },
      {
        target: COMPTROLLER,
        signature: "setAllowedSupplier(address,address,bool)",
        params: [COLLATERAL.vToken, VENUS_CUSTODY_SAFE, true],
      },
      {
        target: COMPTROLLER,
        signature: "setAllowedSupplier(address,address,bool)",
        params: [COLLATERAL.vToken, BPN_SUPPLIER, true],
      },

      ...LIQUIDITY.flatMap(m => [
        { target: COMPTROLLER, signature: "setSupplyAllowlistEnabled(address,bool)", params: [m.vToken, true] },
        {
          target: COMPTROLLER,
          signature: "setAllowedSupplier(address,address,bool)",
          params: [m.vToken, m.spokeSource, true], // spoke yield group
        },
      ]),

      // ────────────────────────────────────────────────────────────────
      // 8. Liquidation allowlist: only the Operator
      // ────────────────────────────────────────────────────────────────
      { target: COMPTROLLER, signature: "setAllowedLiquidator(address,bool)", params: [OPERATOR, true] },
      { target: COMPTROLLER, signature: "setLiquidationAllowlistEnabled(bool)", params: [true] },

      // ────────────────────────────────────────────────────────────────
      // 9. Hub wiring: last in each deposit queue, first in each withdraw queue
      // ────────────────────────────────────────────────────────────────
      ...LIQUIDITY.flatMap(m => [
        // after step 7: the Spoke adapter rejects a source the allowlist does not admit
        {
          target: m.spokeSource, // spoke yield group
          signature: "addResource(address,address)",
          params: [m.vToken, ADAPTER_SPOKE_V1],
        },
        // after addResource (ResourceNotRegistered); extends the queues VIP-675 leaves
        {
          target: m.spokeSource, // spoke yield group
          signature: "setInnerDepositQueue(address[])",
          params: [[...m.queuesBefore.deposit, m.vToken]],
        },
        {
          target: m.spokeSource, // spoke yield group
          signature: "setInnerWithdrawQueue(address[])",
          params: [[m.vToken, ...m.queuesBefore.withdraw]],
        },
      ]),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip678;
