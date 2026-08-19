import { BigNumber, constants } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

// Testnet mirror of vips/vip-664/bscmainnet.ts. It runs the same capped ERC4626 oracle path rather
// than a mocked direct price, so the growth cap is exercised before mainnet.

const { bsctestnet } = NETWORK_ADDRESSES;

// TODO(deploy): mock 24-decimal ERC4626 vaults, deployed alongside the oracles on bsctestnet.
export const VHUSDT = constants.AddressZero;
export const VHUSDC = constants.AddressZero;
export const VHU = constants.AddressZero;

// TODO(deploy): fill after the capped ERC4626Oracle instances are deployed on bsctestnet.
export const VHUSDT_ORACLE = constants.AddressZero;
export const VHUSDC_ORACLE = constants.AddressZero;
export const VHU_ORACLE = constants.AddressZero;

// TODO(deploy): fill after the vTokens are deployed on bsctestnet.
export const VVHUSDT = constants.AddressZero;
export const VVHUSDC = constants.AddressZero;
export const VVHU = constants.AddressZero;

export const PROTOCOL_SHARE_RESERVE = "0x25c7c7D6Bf710949fD7f03364E9BA19a1b3c10E3";
export const REDUCE_RESERVES_BLOCK_DELTA = "28800";
export const BORROW_ACTION = 2; // Comptroller Action enum: BORROW

export const { RESILIENT_ORACLE } = bsctestnet;

// Already deployed; backs vasBNB and vslisBNB on testnet with these exact params.
export const JUMP_RATE_MODEL = "0x8734dBD8Ba959BbC75f2701a022f8d1D47e0722d";

// Same capped-oracle configuration as mainnet. A freshly deployed mock vault sits at an exchange
// rate of exactly 1, so the seed is 1 plus the gap.
export const CAPO_GROWTH_RATE_PER_YEAR = parseUnits("0.05", 18);
export const CAPO_SNAPSHOT_INTERVAL = 30 * 24 * 60 * 60;
export const CAPO_SNAPSHOT_GAP_BPS = BigNumber.from(41);
export const CAPO_SEED_TIMESTAMP = 1787137060;
export const SEED_EXCHANGE_RATE = parseUnits("1", 18);

export const snapshotGap = (exchangeRate: BigNumber) => exchangeRate.mul(CAPO_SNAPSHOT_GAP_BPS).div(10000);
export const seededSnapshot = (exchangeRate: BigNumber) => exchangeRate.add(snapshotGap(exchangeRate));

// Oracle Dynamic Protection Mode / "E-brake" (DeviationBoundedOracle, see VIP-617).
export const DEVIATION_BOUNDED_ORACLE = "0xE0dafC97895B3c98d3B96D3f8739AaC73166beB8";
export const DBO_COOLDOWN_PERIOD = 3600;
export const DBO_TRIGGER_THRESHOLD = parseUnits("0.05", 18); // 5% — the contract minimum
export const DBO_RESET_THRESHOLD = parseUnits("0.02", 18);

export type MarketSpec = {
  vToken: {
    address: string;
    name: string;
    symbol: string;
    underlying: { address: string; symbol: string; decimals: number };
    decimals: number;
    exchangeRate: BigNumber;
    comptroller: string;
    isLegacyPool: boolean;
  };
  rateModel: string;
  interestRateModel: {
    model: "jump";
    baseRatePerYear: string;
    multiplierPerYear: string;
    jumpMultiplierPerYear: string;
    kink: string;
  };
  oracle: {
    address: string;
    seedExchangeRate: BigNumber;
  };
  riskParameters: {
    collateralFactor: BigNumber;
    liquidationThreshold: BigNumber;
    liquidationIncentive: BigNumber;
    reserveFactor: BigNumber;
    supplyCap: BigNumber;
    borrowCap: BigNumber;
  };
  initialSupply: {
    amount: BigNumber;
    vTokenReceiver: string;
    vTokensToBurn: BigNumber;
  };
};

// exchangeRate scale = 18 + underlyingDecimals(24) - vTokenDecimals(8) = 34.
const EXCHANGE_RATE = parseUnits("1", 34);
const SUPPLY_CAP = parseUnits("10000000", 24);
const LIQUIDATION_INCENTIVE = parseUnits("1.1", 18);
const RESERVE_FACTOR = parseUnits("0.1", 18);
const BOOTSTRAP_AMOUNT = parseUnits("100", 24);
const BOOTSTRAP_BURN = parseUnits("10", 8);

const IRM = {
  model: "jump" as const,
  baseRatePerYear: "0",
  multiplierPerYear: "0.09",
  jumpMultiplierPerYear: "2",
  kink: "0.5",
};

const market = (
  vToken: string,
  name: string,
  symbol: string,
  underlying: string,
  underlyingSymbol: string,
  oracle: string,
  collateralFactor: BigNumber,
): MarketSpec => ({
  vToken: {
    address: vToken,
    name,
    symbol,
    underlying: { address: underlying, symbol: underlyingSymbol, decimals: 24 },
    decimals: 8,
    exchangeRate: EXCHANGE_RATE,
    comptroller: bsctestnet.UNITROLLER,
    isLegacyPool: true,
  },
  rateModel: JUMP_RATE_MODEL,
  interestRateModel: IRM,
  oracle: { address: oracle, seedExchangeRate: SEED_EXCHANGE_RATE },
  riskParameters: {
    collateralFactor,
    liquidationThreshold: collateralFactor,
    liquidationIncentive: LIQUIDATION_INCENTIVE,
    reserveFactor: RESERVE_FACTOR,
    supplyCap: SUPPLY_CAP,
    borrowCap: parseUnits("0", 24),
  },
  initialSupply: {
    amount: BOOTSTRAP_AMOUNT,
    vTokenReceiver: bsctestnet.VTREASURY,
    vTokensToBurn: BOOTSTRAP_BURN,
  },
});

export const MARKET_VHUSDT = market(
  VVHUSDT,
  "Venus vhUSDT",
  "vvhUSDT",
  VHUSDT,
  "vhUSDT",
  VHUSDT_ORACLE,
  parseUnits("0.8", 18),
);
export const MARKET_VHUSDC = market(
  VVHUSDC,
  "Venus vhUSDC",
  "vvhUSDC",
  VHUSDC,
  "vhUSDC",
  VHUSDC_ORACLE,
  parseUnits("0.825", 18),
);
export const MARKET_VHU = market(VVHU, "Venus vhU", "vvhU", VHU, "vhU", VHU_ORACLE, parseUnits("0.75", 18));

export const MARKETS: MarketSpec[] = [MARKET_VHUSDT, MARKET_VHUSDC, MARKET_VHU];

export const convertAmountToVTokens = (amount: BigNumber, exchangeRate: BigNumber) => {
  const EXP_SCALE = parseUnits("1", 18);
  return amount.mul(EXP_SCALE).div(exchangeRate);
};

export const vTokensMinted = (m: MarketSpec) => convertAmountToVTokens(m.initialSupply.amount, m.vToken.exchangeRate);

export const vTokensRemaining = (m: MarketSpec) => vTokensMinted(m).sub(m.initialSupply.vTokensToBurn);

export const vip664 = () => {
  const meta = {
    version: "v2",
    title: "VIP-664 [BNB Chain Testnet] List vhUSDT, vhUSDC and vhU markets in the Venus Core Pool",
    description: `#### Summary

If passed, this VIP will list three new non-borrowable collateral markets — Venus vhUSDT (vvhUSDT), Venus vhUSDC (vvhUSDC) and Venus vhU (vvhU), backed by Venus Hub receipt tokens (24-decimal ERC4626) — in the Venus Core Pool on BNB Chain testnet, with borrowing paused at launch.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    MARKETS.flatMap(m => [
      // Arm the growth cap before the price source goes live. setSnapshot must precede
      // setGrowthRate: updateSnapshot() on a zero snapshot collapses the cap to snapshotGap alone.
      {
        target: m.oracle.address,
        signature: "setSnapshot(uint256,uint256)",
        params: [seededSnapshot(m.oracle.seedExchangeRate), CAPO_SEED_TIMESTAMP],
      },
      {
        target: m.oracle.address,
        signature: "setGrowthRate(uint256,uint256)",
        params: [CAPO_GROWTH_RATE_PER_YEAR, CAPO_SNAPSHOT_INTERVAL],
      },
      {
        target: m.oracle.address,
        signature: "setSnapshotGap(uint256)",
        params: [snapshotGap(m.oracle.seedExchangeRate)],
      },

      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [
          [
            m.vToken.underlying.address,
            [m.oracle.address, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
            false,
          ],
        ],
      },

      {
        target: m.vToken.comptroller,
        signature: "_supportMarket(address)",
        params: [m.vToken.address],
      },
      {
        target: m.vToken.comptroller,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[m.vToken.address], [m.riskParameters.supplyCap]],
      },
      // Explicit, though a fresh market already defaults to 0: the borrow cap is a stated risk
      // parameter, and relying on a default is what hid the unarmed price cap.
      {
        target: m.vToken.comptroller,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[m.vToken.address], [m.riskParameters.borrowCap]],
      },
      {
        target: m.vToken.comptroller,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [[m.vToken.address], [BORROW_ACTION], true],
      },
      {
        target: m.vToken.address,
        signature: "setAccessControlManager(address)",
        params: [bsctestnet.ACCESS_CONTROL_MANAGER],
      },
      {
        target: m.vToken.address,
        signature: "setProtocolShareReserve(address)",
        params: [PROTOCOL_SHARE_RESERVE],
      },
      {
        target: m.vToken.address,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: [REDUCE_RESERVES_BLOCK_DELTA],
      },
      // Set here rather than trusted from the vToken constructor, since this reuses an already
      // deployed model instead of deploying one per market.
      {
        target: m.vToken.address,
        signature: "_setInterestRateModel(address)",
        params: [m.rateModel],
      },
      {
        target: m.vToken.address,
        signature: "_setReserveFactor(uint256)",
        params: [m.riskParameters.reserveFactor],
      },
      {
        target: m.vToken.comptroller,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [m.vToken.address, m.riskParameters.collateralFactor, m.riskParameters.liquidationThreshold],
      },
      {
        target: m.vToken.comptroller,
        signature: "setLiquidationIncentive(address,uint256)",
        params: [m.vToken.address, m.riskParameters.liquidationIncentive],
      },

      {
        target: bsctestnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [m.vToken.underlying.address, m.initialSupply.amount, bsctestnet.NORMAL_TIMELOCK],
      },
      {
        target: m.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [m.vToken.address, m.initialSupply.amount],
      },
      {
        target: m.vToken.address,
        signature: "mint(uint256)",
        params: [m.initialSupply.amount],
      },
      {
        target: m.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [m.vToken.address, 0],
      },
      {
        target: m.vToken.address,
        signature: "transfer(address,uint256)",
        params: [ethers.constants.AddressZero, m.initialSupply.vTokensToBurn],
      },
      {
        target: m.vToken.address,
        signature: "transfer(address,uint256)",
        params: [m.initialSupply.vTokenReceiver, vTokensRemaining(m)],
      },

      // Enable Oracle Dynamic Protection Mode / "E-brake" (DBO) for the vhToken with a 5% deviation
      // trigger. Must stay last: setTokenConfig seeds minPrice and maxPrice from
      // RESILIENT_ORACLE.getPrice(asset), so it reverts unless the capped oracle is already
      // registered above. The seeding is why no separate bounds command is needed.
      {
        target: DEVIATION_BOUNDED_ORACLE,
        signature: "setTokenConfig((address,uint64,uint256,uint256,bool,bool))",
        params: [
          [m.vToken.underlying.address, DBO_COOLDOWN_PERIOD, DBO_TRIGGER_THRESHOLD, DBO_RESET_THRESHOLD, true, false],
        ],
      },
    ]),
    meta,
    ProposalType.REGULAR,
  );
};

export default vip664;
