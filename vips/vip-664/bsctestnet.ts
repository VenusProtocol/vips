import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bsctestnet } = NETWORK_ADDRESSES;
export const { RESILIENT_ORACLE } = NETWORK_ADDRESSES.bsctestnet;
export const ATLAS_ORACLE = "0x7F00af2f30a55e79311392C98fBBfA629D19b3A5";

export const PROTOCOL_SHARE_RESERVE = "0x25c7c7D6Bf710949fD7f03364E9BA19a1b3c10E3";
export const REDUCE_RESERVES_BLOCK_DELTA = "28800";
export const BORROW_ACTION = 2; // Comptroller Action enum: BORROW

// Oracle Dynamic Protection Mode (DeviationBoundedOracle)
export const DEVIATION_BOUNDED_ORACLE = "0xE0dafC97895B3c98d3B96D3f8739AaC73166beB8";
export const DBO_COOLDOWN_PERIOD = 3600; // 1h rolling window
export const DBO_TRIGGER_THRESHOLD = parseUnits("0.1667", 18); // 16.67% — arms protection beyond this deviation
export const DBO_RESET_THRESHOLD = parseUnits("0.05", 18); // 5%

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
    // Testnet uses a direct mocked price.
    directPrice: BigNumber;
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

// Market — SKHYB (Venus SK Hynix)
export const MARKET_SKHYB: MarketSpec = {
  vToken: {
    address: "0x101843eAbA6b98fbF4bba078b86EFdE62DF0fc16",
    name: "Venus SK Hynix",
    symbol: "vSKHYB",
    underlying: {
      address: "0xb52DE23C6D4be6Bb3E87fF64527E856Ab346FDf2", // MockSKHYB
      symbol: "SKHYB",
      decimals: 18,
    },
    decimals: 8,
    exchangeRate: parseUnits("1", 28),
    comptroller: bsctestnet.UNITROLLER,
    isLegacyPool: true,
  },
  rateModel: "0x1CcDaf39085bae4e27c3Ba100561b1AD1B5A6b80",
  interestRateModel: {
    model: "jump",
    baseRatePerYear: "0",
    multiplierPerYear: "0.0667",
    jumpMultiplierPerYear: "6.27",
    kink: "0.75",
  },
  oracle: {
    address: ATLAS_ORACLE,
    directPrice: parseUnits("130", 18), // $130 (mocked)
  },
  riskParameters: {
    collateralFactor: parseUnits("0.5", 18),
    liquidationThreshold: parseUnits("0.65", 18),
    liquidationIncentive: parseUnits("1.1", 18),
    reserveFactor: parseUnits("0.1", 18),
    supplyCap: parseUnits("1250", 18),
    borrowCap: parseUnits("0", 18), // borrowing disabled at launch
  },
  initialSupply: {
    amount: parseUnits("0.65", 18),
    vTokenReceiver: bsctestnet.VTREASURY,
    vTokensToBurn: parseUnits("0.065", 8), // 10% of minted vTokens
  },
};

export const MARKETS: MarketSpec[] = [MARKET_SKHYB];

export const convertAmountToVTokens = (amount: BigNumber, exchangeRate: BigNumber) => {
  const EXP_SCALE = parseUnits("1", 18);
  return amount.mul(EXP_SCALE).div(exchangeRate);
};

export const vTokensRemaining = (m: MarketSpec) =>
  convertAmountToVTokens(m.initialSupply.amount, m.vToken.exchangeRate).sub(m.initialSupply.vTokensToBurn);

export const vip664 = () => {
  const meta = {
    version: "v2",
    title: "VIP-664 [BNB Chain Testnet] List Venus SK Hynix (vSKHYB) in the Venus Core Pool",
    description: `#### Summary

If passed, this VIP will list a new tokenized-equity market — Venus SK Hynix (vSKHYB), backed by SKHYB (SK Hynix) — in the Venus Core Pool on BNB Chain testnet, with borrowing paused at launch.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    MARKETS.flatMap(m => [
      // Oracle configuration — set a direct mocked price on the Atlas Oracle, then route the ResilientOracle to it.
      {
        target: m.oracle.address,
        signature: "setDirectPrice(address,uint256)",
        params: [m.vToken.underlying.address, m.oracle.directPrice],
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

      // Initial liquidity: faucet the mock underlying, mint, burn a slice, send the rest to the receiver.
      {
        target: m.vToken.underlying.address,
        signature: "faucet(uint256)",
        params: [m.initialSupply.amount],
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

      // Enable Oracle Dynamic Protection Mode (DBO) for the underlying with a 16.67% deviation trigger.
      {
        target: DEVIATION_BOUNDED_ORACLE,
        signature: "setTokenConfig((address,uint64,uint256,uint256,bool,bool))",
        params: [
          [
            m.vToken.underlying.address,
            DBO_COOLDOWN_PERIOD,
            DBO_TRIGGER_THRESHOLD,
            DBO_RESET_THRESHOLD,
            true, // isBoundedPricingEnabled
            false, // cachingEnabled
          ],
        ],
      },
    ]),
    meta,
    ProposalType.REGULAR,
  );
};

export default vip664;
