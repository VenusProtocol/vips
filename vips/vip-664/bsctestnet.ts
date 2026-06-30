import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bsctestnet } = NETWORK_ADDRESSES;
export const { RESILIENT_ORACLE, CHAINLINK_ORACLE } = NETWORK_ADDRESSES.bsctestnet;

export const PROTOCOL_SHARE_RESERVE = "0x25c7c7D6Bf710949fD7f03364E9BA19a1b3c10E3";
export const REDUCE_RESERVES_BLOCK_DELTA = "28800";

export const MCBT = "0x00298c15260FbE3C51D2a30765B1EedBd4f8b1F1"; // MockMCBT
export const vMCBT_ADDRESS = "0xf9C77bFA1F86574E6F39A61dab94d9Bb9ED21AFe";
export const RATE_MODEL = "0x1CcDaf39085bae4e27c3Ba100561b1AD1B5A6b80";

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

export const convertAmountToVTokens = (amount: BigNumber, exchangeRate: BigNumber) => {
  const EXP_SCALE = parseUnits("1", 18);
  return amount.mul(EXP_SCALE).div(exchangeRate);
};

export const vTokensRemaining = (m: MarketSpec) =>
  convertAmountToVTokens(m.initialSupply.amount, m.vToken.exchangeRate).sub(m.initialSupply.vTokensToBurn);

export const MARKET_MCBT: MarketSpec = {
  vToken: {
    address: vMCBT_ADDRESS,
    name: "Venus MCBT",
    symbol: "vMCBT",
    underlying: {
      address: MCBT,
      symbol: "MCBT",
      decimals: 18,
    },
    decimals: 8,
    exchangeRate: parseUnits("1", 28),
    comptroller: bsctestnet.UNITROLLER,
    isLegacyPool: true,
  },
  rateModel: RATE_MODEL,
  interestRateModel: {
    model: "jump",
    baseRatePerYear: "0",
    multiplierPerYear: "0.0667",
    jumpMultiplierPerYear: "6.27",
    kink: "0.75",
  },
  oracle: {
    directPrice: parseUnits("2.5", 18), // $2.50
  },
  riskParameters: {
    collateralFactor: parseUnits("0.6", 18),
    liquidationThreshold: parseUnits("0.7", 18),
    liquidationIncentive: parseUnits("1.1", 18),
    reserveFactor: parseUnits("0.25", 18),
    supplyCap: parseUnits("236", 18),
    borrowCap: parseUnits("236", 18),
  },
  initialSupply: {
    amount: parseUnits("0.1", 18),
    vTokenReceiver: bsctestnet.VTREASURY,
    vTokensToBurn: parseUnits("0.01", 8),
  },
};

export const vip664 = () => {
  const meta = {
    version: "v2",
    title: "VIP-664 [BNB Chain Testnet] Add MCBT market to the Venus Core Pool",
    description: `#### Summary

If passed, this VIP will list **Venus MCBT (vMCBT)** — backed by the mock Modern Central Bank Token — in the Venus Core Pool on BNB Chain testnet.

#### Market parameters

| Parameter | Value |
|-----------|-------|
| Underlying | MCBT (Modern Central Bank Token, mock BEP-20, 18 decimals) |
| Collateral factor | 60% |
| Liquidation threshold | 70% |
| Liquidation incentive | 10% |
| Reserve factor | 25% |
| Supply cap | 236 MCBT |
| Borrow cap | 236 MCBT |
| Interest rate model | JumpRateModel (base 0%, slope 6.67%, kink 75%, jump 627%) |
| Oracle | Chainlink direct price $2.50 |`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  const m = MARKET_MCBT;

  return makeProposal(
    [
      // Oracle: set direct price on ChainlinkOracle, then route ResilientOracle to it
      {
        target: CHAINLINK_ORACLE,
        signature: "setDirectPrice(address,uint256)",
        params: [m.vToken.underlying.address, m.oracle.directPrice],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [
          [
            m.vToken.underlying.address,
            [CHAINLINK_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
            false,
          ],
        ],
      },

      // List the market in the Core pool
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
      {
        target: m.vToken.comptroller,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[m.vToken.address], [m.riskParameters.borrowCap]],
      },

      // Configure the vToken
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
      {
        target: m.vToken.comptroller,
        signature: "setIsBorrowAllowed(uint96,address,bool)",
        params: [0, m.vToken.address, true],
      },

      // Seed initial liquidity: faucet mock underlying → mint vTokens → burn a slice → transfer rest to treasury
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
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip664;
