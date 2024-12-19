import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";
import { NORMAL_TIMELOCK } from "src/vip-framework";

export const COMPTROLLER = "0xfE87008bf29DeCACC09a75FaAc2d128367D46e7a";
export const SWAP_ROUTER = "0x98C108285E389A5a12EdDa585b70b30C786AFb86";

const { POOL_REGISTRY, VTREASURY, REDSTONE_ORACLE, RESILIENT_ORACLE } = NETWORK_ADDRESSES["bsctestnet"];

export const SOLVBTC_BBN_ONEJUMP_REDSTONE_ORACLE = "0x9767348B2e36E649A42b1DEA975D2474F72C6B96";
export const PT_SOLVBTC_BBN_PENDLE_ORACLE = "0x31B78f0Ef6A87cF0E812197226306954a65907d5";
export const MOCK_PENDLE_PT_ORACLE = "0xa37A9127C302fEc17d456a6E1a5643a18a1779aD";

export const PRIME = "0xe840F8EC2Dc50E7D22e5e2991975b9F6e34b62Ad";

export const USDT = "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c";
export const USDC = "0x16227D60f7a0e586C66B005219dfc887D13C9531";
export const BTCB = "0xA808e341e8e723DC6BA0Bb5204Bafc2330d7B8e4";
export const ETH = "0x98f7A83361F7Ac8765CcEBAB1425da6b341958a7";
export const XVS = "0xB9e0E753630434d7863528cc73CB7AC638a7c8ff";
export const RISK_FUND_CONVERTER = "0x32Fbf7bBbd79355B86741E3181ef8c1D9bD309Bb";
export const USDT_PRIME_CONVERTER = "0xf1FA230D25fC5D6CAfe87C5A6F9e1B17Bc6F194E";
export const USDC_PRIME_CONVERTER = "0x2ecEdE6989d8646c992344fF6C97c72a3f811A13";
export const BTCB_PRIME_CONVERTER = "0x989A1993C023a45DA141928921C0dE8fD123b7d1";
export const ETH_PRIME_CONVERTER = "0xf358650A007aa12ecC8dac08CF8929Be7f72A4D9";
export const XVS_VAULT_CONVERTER = "0x258f49254C758a0E37DAb148ADDAEA851F4b02a2";

const commonSpec = {
  decimals: 8,
  exchangeRate: parseUnits("1", 28),
  comptroller: COMPTROLLER,
};

export const tokens = {
  "PT-SolvBTC.BBN-27MAR2025": {
    address: "0x964Ea3dC70Ee5b35Ea881cf8416B7a5F50E13f56",
    decimals: 18,
    symbol: "PT-SolvBTC.BBN-27MAR2025",
  },
  "SolvBTC.BBN": {
    address: "0x8FD14481C1616d9AdA7195Be60f9d8d0994b9AE1",
    decimals: 18,
    symbol: "SolvBTC.BBN",
  },
  BTCB: {
    address: "0xA808e341e8e723DC6BA0Bb5204Bafc2330d7B8e4",
    decimals: 18,
    symbol: "BTCB",
  },
};

export const newMarkets = {
  "vPT-SolvBTC.BBN-27MAR2025_BTC": {
    vToken: {
      address: "0xf3bF150A7D3d42E8C712e2461102593Dc50266Bb",
      name: "Venus PT-SolvBTC.BBN-27MAR2025 (BTC)",
      symbol: "vPT-SolvBTC.BBN-27MAR2025_BTC",
      underlying: tokens["PT-SolvBTC.BBN-27MAR2025"],
      ...commonSpec,
    },
    riskParameters: {
      collateralFactor: parseUnits("0.8", 18),
      liquidationThreshold: parseUnits("0.85", 18),
      supplyCap: parseUnits("80", 18),
      borrowCap: parseUnits("0", 18),
      reserveFactor: parseUnits("0", 18),
      protocolSeizeShare: parseUnits("0.015", 18),
    },
    initialSupply: {
      amount: parseUnits("0.110483117280995732", 18),
      vTokenReceiver: VTREASURY,
    },
    interestRateModel: {
      address: "0x87BC48C851B47e199288139e05AB9B9B761cE4DB",
      base: "0",
      multiplier: "0.0875",
      jump: "2.0",
      kink: "0.8",
    },
  },
  vBTCB_BTC: {
    vToken: {
      address: "0x138500e8502f32f004F79507143E4FaaCA03E26d",
      name: "Venus BTCB (BTC)",
      symbol: "vBTCB_BTC",
      underlying: tokens["BTCB"],
      ...commonSpec,
    },
    riskParameters: {
      collateralFactor: parseUnits("0", 18),
      liquidationThreshold: parseUnits("0", 18),
      supplyCap: parseUnits("175", 18),
      borrowCap: parseUnits("140", 18),
      reserveFactor: parseUnits("0.2", 18),
      protocolSeizeShare: parseUnits("0.015", 18),
    },
    initialSupply: {
      amount: parseUnits("0.1", 18),
      vTokenReceiver: VTREASURY,
    },
    interestRateModel: {
      address: "0x87BC48C851B47e199288139e05AB9B9B761cE4DB",
      base: "0",
      multiplier: "0.0875",
      jump: "2.0",
      kink: "0.8",
    },
  },
};

export const converterBaseAssets = {
  [RISK_FUND_CONVERTER]: USDT,
  [USDT_PRIME_CONVERTER]: USDT,
  [USDC_PRIME_CONVERTER]: USDC,
  [BTCB_PRIME_CONVERTER]: BTCB,
  [ETH_PRIME_CONVERTER]: ETH,
  [XVS_VAULT_CONVERTER]: XVS,
};

enum ConversionAccessibility {
  NONE = 0,
  ALL = 1,
  ONLY_FOR_CONVERTERS = 2,
  ONLY_FOR_USERS = 3,
}

export const FIXED_LST_PRICE = parseUnits("1.1", 18);
export const CLOSE_FACTOR = parseUnits("0.5", 18);
export const LIQUIDATION_INCENTIVE = parseUnits("1.03", 18);
export const MIN_LIQUIDATABLE_COLLATERAL = parseUnits("100", 18);

const vip500 = () => {
  const meta = {
    version: "v2",
    title: "BTC pool on BNB chain",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // Oracle config
      {
        target: REDSTONE_ORACLE,
        signature: "setDirectPrice(address,uint256)",
        params: [tokens["SolvBTC.BBN"].address, FIXED_LST_PRICE],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            tokens["SolvBTC.BBN"].address,
            [SOLVBTC_BBN_ONEJUMP_REDSTONE_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
          ],
        ],
      },
      {
        target: MOCK_PENDLE_PT_ORACLE,
        signature: "setPtToSyRate(address,uint32,uint256)",
        params: ["0x0000000000000000000000000000000000000001", 900, "985657949449619080"],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            tokens["PT-SolvBTC.BBN-27MAR2025"].address,
            [PT_SOLVBTC_BBN_PENDLE_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
          ],
        ],
      },

      // Swap router
      {
        target: SWAP_ROUTER,
        signature: "acceptOwnership()",
        params: [],
      },

      // BTC pool
      {
        target: COMPTROLLER,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: COMPTROLLER,
        signature: "setPriceOracle(address)",
        params: [RESILIENT_ORACLE],
      },
      {
        target: POOL_REGISTRY,
        signature: "addPool(string,address,uint256,uint256,uint256)",
        params: ["BTC", COMPTROLLER, CLOSE_FACTOR, LIQUIDATION_INCENTIVE, MIN_LIQUIDATABLE_COLLATERAL],
      },
      {
        target: COMPTROLLER,
        signature: "setPrimeToken(address)",
        params: [PRIME],
      },

      // Markets
      ...Object.values(newMarkets).flatMap(({ vToken, initialSupply, riskParameters }) => [
        {
          target: vToken.address,
          signature: "setReduceReservesBlockDelta(uint256)",
          params: ["28800"],
        },
        {
          target: vToken.address,
          signature: "setReserveFactor(uint256)",
          params: [riskParameters.reserveFactor],
        },
        {
          target: VTREASURY,
          signature: "withdrawTreasuryBEP20(address,uint256,address)",
          params: [vToken.underlying.address, initialSupply.amount, NORMAL_TIMELOCK],
        },
        {
          target: vToken.underlying.address,
          signature: "approve(address,uint256)",
          params: [POOL_REGISTRY, initialSupply.amount],
        },
        {
          target: POOL_REGISTRY,
          signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
          params: [
            [
              vToken.address,
              riskParameters.collateralFactor,
              riskParameters.liquidationThreshold,
              initialSupply.amount,
              initialSupply.vTokenReceiver,
              riskParameters.supplyCap,
              riskParameters.borrowCap,
            ],
          ],
        },
        {
          target: vToken.underlying.address,
          signature: "approve(address,uint256)",
          params: [POOL_REGISTRY, 0],
        },
        {
          target: vToken.address,
          signature: "setProtocolSeizeShare(uint256)",
          params: [riskParameters.protocolSeizeShare],
        },
      ]),

      {
        target: COMPTROLLER,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [[newMarkets["vPT-SolvBTC.BBN-27MAR2025_BTC"].vToken.address], [2], true],
      },

      // Conversions Config
      ...Object.entries(converterBaseAssets).map(([converter, baseAsset]: [string, string]) => {
        const tokensToConfigure = [tokens["PT-SolvBTC.BBN-27MAR2025"].address]; // BTCB is already configured
        const conversionConfigs = tokensToConfigure.map(() => [0, ConversionAccessibility.ALL]);
        return {
          target: converter,
          signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
          params: [baseAsset, tokensToConfigure, conversionConfigs],
        };
      }),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip500;
