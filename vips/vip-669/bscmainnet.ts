import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

export const PROTOCOL_SHARE_RESERVE = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";
export const REDUCE_RESERVES_BLOCK_DELTA = "28800";
export const BORROW_ACTION = 2; // Comptroller Action enum: BORROW

export const { RESILIENT_ORACLE } = NETWORK_ADDRESSES.bscmainnet;
export const ATLAS_ORACLE = "0x9E6928Ec418948ceb9f1cd9872fD312b13D841D0";
export const ATLAS_MAX_STALE_PERIOD = 3800; // ~1h
// Used in simulations only: the governance lifecycle mines ~72h of blocks, which would exceed the
// real stale period and make getUnderlyingPrice revert. See VIP-615 stale-period workaround.
export const ONE_YEAR = 31536000;

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
    feed: string;
    maxStalePeriod: number;
    price: BigNumber;
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

// Market 1 — TSLAB
export const MARKET_1: MarketSpec = {
  vToken: {
    address: "0x97421799419Eb782628e73e7220d8E0A207469a3",
    name: "Venus TSLAB",
    symbol: "vTSLAB",
    underlying: {
      address: "0x5b1910eAaD6450E50f816082Aa078C41F10C292f",
      symbol: "TSLAB",
      decimals: 18,
    },
    decimals: 8,
    exchangeRate: parseUnits("1", 28),
    comptroller: bscmainnet.UNITROLLER,
    isLegacyPool: true,
  },
  rateModel: "0xe589E884f69dF3137B43A760C4Ec9E55D944439D",
  interestRateModel: {
    model: "jump",
    baseRatePerYear: "0",
    multiplierPerYear: "0.0667",
    jumpMultiplierPerYear: "6.27",
    kink: "0.75",
  },
  oracle: {
    address: ATLAS_ORACLE,
    feed: "0x63950C265e7CDB4016bA60C288c46291C0148ce2", // Atlas TSLAB/USD feed (id 772)
    maxStalePeriod: ATLAS_MAX_STALE_PERIOD,
    price: BigNumber.from("404989994819567769480"), // feed answer @ FORK_BLOCK (~$405.00)
  },
  riskParameters: {
    collateralFactor: parseUnits("0.6", 18),
    liquidationThreshold: parseUnits("0.7", 18),
    liquidationIncentive: parseUnits("1.1", 18),
    reserveFactor: parseUnits("0.1", 18),
    supplyCap: parseUnits("236", 18),
    borrowCap: parseUnits("0", 18), // borrowing disabled at launch
  },
  initialSupply: {
    amount: parseUnits("0.26", 18),
    vTokenReceiver: bscmainnet.VTREASURY,
    vTokensToBurn: parseUnits("0.026", 8),
  },
};

// Market 2 — NVDAB
export const MARKET_2: MarketSpec = {
  vToken: {
    address: "0xEb8Ca841cBe1BC4832A10b15c7dAB1081eDaD371",
    name: "Venus NVDAB",
    symbol: "vNVDAB",
    underlying: {
      address: "0x02Fca66C1D1aFB4E2A7884261eB00F63598a7436",
      symbol: "NVDAB",
      decimals: 18,
    },
    decimals: 8,
    exchangeRate: parseUnits("1", 28),
    comptroller: bscmainnet.UNITROLLER,
    isLegacyPool: true,
  },
  rateModel: "0xe589E884f69dF3137B43A760C4Ec9E55D944439D",
  interestRateModel: {
    model: "jump",
    baseRatePerYear: "0",
    multiplierPerYear: "0.0667",
    jumpMultiplierPerYear: "6.27",
    kink: "0.75",
  },
  oracle: {
    address: ATLAS_ORACLE,
    feed: "0x8a44cF4E55adD99EB8bAC5D5DB749C63106d54AA", // Atlas NVDAB/USD feed (id 773)
    maxStalePeriod: ATLAS_MAX_STALE_PERIOD,
    price: BigNumber.from("211086527189540030430"), // feed answer @ FORK_BLOCK (~$211.09)
  },
  riskParameters: {
    collateralFactor: parseUnits("0.6", 18),
    liquidationThreshold: parseUnits("0.7", 18),
    liquidationIncentive: parseUnits("1.1", 18),
    reserveFactor: parseUnits("0.1", 18),
    supplyCap: parseUnits("450", 18),
    borrowCap: parseUnits("0", 18), // borrowing disabled at launch
  },
  initialSupply: {
    amount: parseUnits("0.5", 18),
    vTokenReceiver: bscmainnet.VTREASURY,
    vTokensToBurn: parseUnits("0.05", 8),
  },
};

export const MARKETS: MarketSpec[] = [MARKET_1, MARKET_2];

export const convertAmountToVTokens = (amount: BigNumber, exchangeRate: BigNumber) => {
  const EXP_SCALE = parseUnits("1", 18);
  return amount.mul(EXP_SCALE).div(exchangeRate);
};

export const vTokensMinted = (m: MarketSpec) => convertAmountToVTokens(m.initialSupply.amount, m.vToken.exchangeRate);

export const vTokensRemaining = (m: MarketSpec) => vTokensMinted(m).sub(m.initialSupply.vTokensToBurn);

export const vip669 = (simulations = false) => {
  const meta = {
    version: "v2",
    title: "VIP-669 [BNB Chain] List new markets in the Venus Core Pool",
    description: `#### Summary

If passed, this VIP will list two new tokenized-equity markets in the Venus Core Pool on BNB Chain, with borrowing paused at launch:

- **Venus TSLAB (vTSLAB)** — backed by TSLAB (Tesla, Inc.)
- **Venus NVDAB (vNVDAB)** — backed by NVDAB (NVIDIA Corp)

#### Description

For each new market this VIP will:

- Configure the underlying to use its Atlas Oracle price feed (TSLAB/USD, NVDAB/USD) in the ResilientOracle
- Add the market to the Core Pool Comptroller
- Set the supply cap, collateral factor, liquidation threshold, liquidation incentive and reserve factor
- Set the AccessControlManager, ProtocolShareReserve and reduce-reserves block delta on the vToken
- Provide bootstrap liquidity (minting an initial supply and sending the resulting vTokens to the VTreasury)
- Pause borrowing for the market at launch

#### Risk parameters

Both markets share the same interest rate model (base 0%, multiplier 6.67%, jump multiplier 627%, kink 75%) and the following parameters:

| Parameter | Venus TSLAB | Venus NVDAB |
| --- | --- | --- |
| Collateral factor | 60% | 60% |
| Liquidation threshold | 70% | 70% |
| Liquidation incentive | 10% | 10% |
| Reserve factor | 10% | 10% |
| Supply cap | 236 TSLAB | 450 NVDAB |
| Borrow cap | 0 (borrowing disabled) | 0 (borrowing disabled) |
| Bootstrap liquidity | 0.26 TSLAB | 0.5 NVDAB |`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    MARKETS.flatMap(m => [
      // Oracle configuration — single source: the Atlas Oracle.
      // In simulations use a 1-year stale period so the mined governance lifecycle doesn't make
      // the feed appear stale.
      {
        target: m.oracle.address,
        signature: "setTokenConfig((address,address,uint256))",
        params: [[m.vToken.underlying.address, m.oracle.feed, simulations ? ONE_YEAR : m.oracle.maxStalePeriod]],
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

      // Add market
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
      // Pause borrowing for the market at launch.
      {
        target: m.vToken.comptroller,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [[m.vToken.address], [BORROW_ACTION], true],
      },
      {
        target: m.vToken.address,
        signature: "setAccessControlManager(address)",
        params: [bscmainnet.ACCESS_CONTROL_MANAGER],
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

      // Initial liquidity: pull underlying from the Treasury, mint, burn a slice, and send the remainder to the receiver.
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [m.vToken.underlying.address, m.initialSupply.amount, bscmainnet.NORMAL_TIMELOCK],
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
      // Burn a slice of vTokens.
      {
        target: m.vToken.address,
        signature: "transfer(address,uint256)",
        params: [ethers.constants.AddressZero, m.initialSupply.vTokensToBurn],
      },
      // Transfer remaining vTokens to the receiver (VTreasury).
      {
        target: m.vToken.address,
        signature: "transfer(address,uint256)",
        params: [m.initialSupply.vTokenReceiver, vTokensRemaining(m)],
      },
    ]),
    meta,
    ProposalType.REGULAR,
  );
};

export default vip669;
