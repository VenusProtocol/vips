import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { POOL_REGISTRY, VTREASURY, RESILIENT_ORACLE, NORMAL_TIMELOCK } = NETWORK_ADDRESSES["bscmainnet"];

export const COMPTROLLER_LIQUID_STAKED_BNB_POOL = "0xd933909A4a2b7A4638903028f44D1d38ce27c352";
export const PT_CLISBNB_PENDLE_ORACLE = "0xEa7a92D12196A325C76ED26DBd36629d7EC46459";

export const vankrBNB_LiquidStakedBNB = "0xBfe25459BA784e70E2D7a718Be99a1f3521cA17f";
export const vBNBx_LiquidStakedBNB = "0x5E21bF67a6af41c74C1773E4b473ca5ce8fd3791";
export const vslisBNB_LiquidStakedBNB = "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A";
export const vstkBNB_LiquidStakedBNB = "0xcc5D9e502574cda17215E70bC0B4546663785227";
export const vWBNB_LiquidStakedBNB = "0xe10E80B7FD3a29fE46E16C30CC8F4dd938B742e2";

export const RISK_FUND_CONVERTER = "0xA5622D276CcbB8d9BBE3D1ffd1BB11a0032E53F0";
export const USDT_PRIME_CONVERTER = "0xD9f101AA67F3D72662609a2703387242452078C3";
export const USDC_PRIME_CONVERTER = "0xa758c9C215B6c4198F0a0e3FA46395Fa15Db691b";
export const BTCB_PRIME_CONVERTER = "0xE8CeAa79f082768f99266dFd208d665d2Dd18f53";
export const ETH_PRIME_CONVERTER = "0xca430B8A97Ea918fF634162acb0b731445B8195E";
export const XVS_VAULT_CONVERTER = "0xd5b9AE835F4C59272032B3B954417179573331E0";

export const BaseAssets = [
  "0x55d398326f99059fF775485246999027B3197955", // USDT RiskFundConverter BaseAsset
  "0x55d398326f99059fF775485246999027B3197955", // USDT USDTTokenConverter BaseAsset
  "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", // USDC USDCTokenConverter BaseAsset
  "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c", // BTCB BTCBTokenConverter BaseAsset
  "0x2170Ed0880ac9A755fd29B2688956BD959F933F8", // ETH ETHTokenConverter BaseAsset
  "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63", // XVS XVSTokenConverter BaseAsset
];

const CONVERSION_INCENTIVE = parseUnits("1", 14);

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
  address: "0xE8F1C9804770e11Ab73395bE54686Ad656601E9e",
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
    address: "0xA537ACf381b12Bbb91C58398b66D1D220f1C77c8",
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
    vTokenReceiver: "0x078357b0e6dca79450850d25cd48a1b5daf08f48",
  },
  interestRateModel: {
    address: "0xf03DAB984aCC5761df5f71Cc67fEA8F185f578fd",
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
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [token.address, market.initialSupply.amount, NORMAL_TIMELOCK],
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
          params: [market.initialSupply.vTokenReceiver, vTokensRemaining],
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
