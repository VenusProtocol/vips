import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { POOL_REGISTRY, VTREASURY, RESILIENT_ORACLE, NORMAL_TIMELOCK } = NETWORK_ADDRESSES["bsctestnet"];

export const COMPTROLLER_LIQUID_STAKED_BNB_POOL = "0x596B11acAACF03217287939f88d63b51d3771704";
export const AS_BNB_ORACLE = "0x823408a1A230D3ffa34F4bC9f3cA05213C18E67A";

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
  address: "0xc625f060ad25f4A6c2d9eBF30C133dB61B7AF072",
  decimals: 18,
  symbol: "asBNB",
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
    address: "0xc9D979AA6F3bE732A53a27188D74e929FD107187",
    name: "Venus asBNB (Liquid Staked BNB)",
    symbol: "vasBNB_LiquidStakedBNB",
    underlying: token,
    decimals: 8,
    exchangeRate: parseUnits("1", 28),
    comptroller: COMPTROLLER_LIQUID_STAKED_BNB_POOL,
  },
  riskParameters: {
    collateralFactor: parseUnits("0.87", 18),
    liquidationThreshold: parseUnits("0.90", 18),
    supplyCap: parseUnits("2000", 18),
    borrowCap: parseUnits("0", 18),
    reserveFactor: parseUnits("0.1", 18),
    protocolSeizeShare: parseUnits("0.0125", 18),
  },
  initialSupply: {
    amount: parseUnits("18", 18),
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

const vip469 = () => {
  const meta = {
    version: "v2",
    title: "VIP-469 [BNB Chain] New asBNB market in the Liquid Staked BNB pool",
    description: `VIP-469 [BNB Chain] New asBNB market in the Liquid Staked BNB pool`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            token.address,
            [AS_BNB_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
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
        const vTokensMinted = convertAmountToVTokens(market.initialSupply.amount, market.vToken.exchangeRate);
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

export default vip469;
