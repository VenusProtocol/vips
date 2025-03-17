import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { POOL_REGISTRY, VTREASURY, RESILIENT_ORACLE, NORMAL_TIMELOCK } = NETWORK_ADDRESSES["bsctestnet"];

export const COMPTROLLER_LIQUID_STAKED_BNB_POOL = "0x596B11acAACF03217287939f88d63b51d3771704";
export const MOCK_PENDLE_PT_ORACLE = "0xa37A9127C302fEc17d456a6E1a5643a18a1779aD";
export const PT_CLISBNB_PENDLE_ORACLE = "0xeF663663e802Ff4510aDE14975820FFB5d2EE9E8";

export const vankrBNB_LiquidStakedBNB = "0x57a664Dd7f1dE19545fEE9c86C949e3BF43d6D47";
export const vBNBx_LiquidStakedBNB = "0x644A149853E5507AdF3e682218b8AC86cdD62951";
export const vslisBNB_LiquidStakedBNB = "0xeffE7874C345aE877c1D893cd5160DDD359b24dA";
export const vstkBNB_LiquidStakedBNB = "0x75aa42c832a8911B77219DbeBABBB40040d16987";
export const vWBNB_LiquidStakedBNB = "0x231dED0Dfc99634e52EE1a1329586bc970d773b3";

export const RISK_FUND_CONVERTER = "0x32Fbf7bBbd79355B86741E3181ef8c1D9bD309Bb";
export const USDT_PRIME_CONVERTER = "0xf1FA230D25fC5D6CAfe87C5A6F9e1B17Bc6F194E";
export const USDC_PRIME_CONVERTER = "0x2ecEdE6989d8646c992344fF6C97c72a3f811A13";
export const BTCB_PRIME_CONVERTER = "0x989A1993C023a45DA141928921C0dE8fD123b7d1";
export const ETH_PRIME_CONVERTER = "0xf358650A007aa12ecC8dac08CF8929Be7f72A4D9";
export const XVS_VAULT_CONVERTER = "0x258f49254C758a0E37DAb148ADDAEA851F4b02a2";

export const BaseAssets = [
  "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c", // USDT RiskFundConverter BaseAsset
  "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c", // USDT USDTTokenConverter BaseAsset
  "0x16227D60f7a0e586C66B005219dfc887D13C9531", // USDC USDCTokenConverter BaseAsset
  "0xA808e341e8e723DC6BA0Bb5204Bafc2330d7B8e4", // BTCB BTCBTokenConverter BaseAsset
  "0x98f7A83361F7Ac8765CcEBAB1425da6b341958a7", // ETH ETHTokenConverter BaseAsset
  "0xB9e0E753630434d7863528cc73CB7AC638a7c8ff", // XVS XVSTokenConverter BaseAsset
];

export const CONVERSION_INCENTIVE = parseUnits("1", 14);

export const convertAmountToVTokens = (amount: BigNumber, exchangeRate: BigNumber) => {
  const EXP_SCALE = parseUnits("1", 18);
  return amount.mul(EXP_SCALE).div(exchangeRate);
};

type Token = {
  address: string;
  decimals: number;
  symbol: string;
};

export const token = {
  address: "0x14AECeEc177085fd09EA07348B4E1F7Fcc030fA1",
  decimals: 18,
  symbol: "PT-clisBNB-24APR2025",
};

type Market = {
  vToken: {
    address: string;
    name: string;
    symbol: string;
    underlying: Token;
    decimals: number;
    exchangeRate: BigNumber;
    comptroller: string;
  };
  riskParameters: {
    collateralFactor: BigNumber;
    liquidationThreshold: BigNumber;
    supplyCap: BigNumber;
    borrowCap: BigNumber;
    reserveFactor: BigNumber;
    protocolSeizeShare: BigNumber;
  };
  initialSupply: {
    amount: BigNumber;
    vTokenReceiver: string;
  };
  interestRateModel: {
    address: string;
    base: string;
    multiplier: string;
    jump: string;
    kink: string;
  };
};

export const market: Market = {
  vToken: {
    address: "0x7C4890D673985CE22A4D38761473f190e434c956",
    name: "Venus PT-clisBNB-24APR2025 (Liquid Staked BNB)",
    symbol: "vPT-clisBNB-24APR2025_LiquidStakedBNB",
    underlying: token,
    decimals: 8,
    exchangeRate: parseUnits("1.0000000006850831610492571416", 28),
    comptroller: COMPTROLLER_LIQUID_STAKED_BNB_POOL,
  },
  riskParameters: {
    collateralFactor: parseUnits("0.8", 18),
    liquidationThreshold: parseUnits("0.85", 18),
    supplyCap: parseUnits("2000", 18),
    borrowCap: parseUnits("0", 18),
    reserveFactor: parseUnits("0.1", 18),
    protocolSeizeShare: parseUnits("0.0125", 18),
  },
  initialSupply: {
    amount: parseUnits("10.178770086973303982", 18),
    vTokenReceiver: VTREASURY,
  },
  interestRateModel: {
    address: "0x2b37a63AFB834B6C47C319cDC5694bD104c86454",
    base: "0",
    multiplier: "0.035",
    jump: "0.8",
    kink: "0.8",
  },
};

const vip465 = () => {
  const meta = {
    version: "v2",
    title: "VIP-465",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: MOCK_PENDLE_PT_ORACLE,
        signature: "setPtToSyRate(address,uint32,uint256)",
        params: ["0x0000000000000000000000000000000000000002", 1800, "956271978187548724"],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            token.address,
            [PT_CLISBNB_PENDLE_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
          ],
        ],
      },
      {
        target: token.address,
        signature: "faucet(uint256)",
        params: [market.initialSupply.amount],
      },
      {
        target: market.vToken.address,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["28800"],
      },
      {
        target: market.vToken.address,
        signature: "setReserveFactor(uint256)",
        params: [market.riskParameters.reserveFactor],
      },
      {
        target: market.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, market.initialSupply.amount],
      },
      {
        target: POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            market.vToken.address,
            market.riskParameters.collateralFactor,
            market.riskParameters.liquidationThreshold,
            market.initialSupply.amount,
            NORMAL_TIMELOCK,
            market.riskParameters.supplyCap,
            market.riskParameters.borrowCap,
          ],
        ],
      },
      {
        target: market.vToken.address,
        signature: "transfer(address,uint256)",
        params: [ethers.constants.AddressZero, parseUnits("0.01692047", 8)], // around $10
      },
      (() => {
        const vTokensMinted = convertAmountToVTokens(market.initialSupply.amount, parseUnits("1", 28));
        const vTokensRemaining = vTokensMinted.sub(parseUnits("0.01692047", 8));
        return {
          target: market.vToken.address,
          signature: "transfer(address,uint256)",
          params: [VTREASURY, vTokensRemaining],
        };
      })(),
      {
        target: market.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, 0],
      },
      {
        target: COMPTROLLER_LIQUID_STAKED_BNB_POOL,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [[market.vToken.address], [2], true],
      },
      {
        target: market.vToken.address,
        signature: "setProtocolSeizeShare(uint256)",
        params: [market.riskParameters.protocolSeizeShare],
      },
      {
        target: vankrBNB_LiquidStakedBNB,
        signature: "setProtocolSeizeShare(uint256)",
        params: [market.riskParameters.protocolSeizeShare],
      },
      {
        target: vBNBx_LiquidStakedBNB,
        signature: "setProtocolSeizeShare(uint256)",
        params: [market.riskParameters.protocolSeizeShare],
      },
      {
        target: vslisBNB_LiquidStakedBNB,
        signature: "setProtocolSeizeShare(uint256)",
        params: [market.riskParameters.protocolSeizeShare],
      },
      {
        target: vstkBNB_LiquidStakedBNB,
        signature: "setProtocolSeizeShare(uint256)",
        params: [market.riskParameters.protocolSeizeShare],
      },
      {
        target: vWBNB_LiquidStakedBNB,
        signature: "setProtocolSeizeShare(uint256)",
        params: [market.riskParameters.protocolSeizeShare],
      },
      {
        target: COMPTROLLER_LIQUID_STAKED_BNB_POOL,
        signature: "setLiquidationIncentive(uint256)",
        params: ["1025000000000000000"],
      },
      {
        target: RISK_FUND_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[0], [token.address], [[CONVERSION_INCENTIVE, 1]]],
      },
      {
        target: USDT_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[1], [token.address], [[CONVERSION_INCENTIVE, 1]]],
      },
      {
        target: USDC_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[2], [token.address], [[CONVERSION_INCENTIVE, 1]]],
      },
      {
        target: BTCB_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[3], [token.address], [[CONVERSION_INCENTIVE, 1]]],
      },
      {
        target: ETH_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[4], [token.address], [[CONVERSION_INCENTIVE, 1]]],
      },
      {
        target: XVS_VAULT_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[5], [token.address], [[CONVERSION_INCENTIVE, 1]]],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip465;
