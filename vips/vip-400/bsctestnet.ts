import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";
import { NORMAL_TIMELOCK } from "src/vip-framework";

export const POOL_REGISTRY = "0xC85491616Fa949E048F3aAc39fbf5b0703800667";
export const COMPTROLLER = "0xC7859B809Ed5A2e98659ab5427D5B69e706aE26b";
export const WSTETH = "0x4349016259FCd8eE452f696b2a7beeE31667D129";
export const WEETH = "0x7df9372096c8ca2401f30B3dF931bEFF493f1FdC";
export const ETH = "0x98f7A83361F7Ac8765CcEBAB1425da6b341958a7";

export const USDT = "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c";
export const USDC = "0x16227D60f7a0e586C66B005219dfc887D13C9531";
export const BTCB = "0xA808e341e8e723DC6BA0Bb5204Bafc2330d7B8e4";
export const XVS = "0xB9e0E753630434d7863528cc73CB7AC638a7c8ff";

export const WSTETH_VTOKEN = "0x16eb5Ce6d186B49709dD588518CD545985096Ff5";
export const WEETH_VTOKEN = "0x4BD7EfB423f06fa033404FBd0935A2097918084d";
export const ETH_VTOKEN = "0x46D49adF48172d2e79d813A3f4F27aB61724B01e";

export const SWAP_ROUTER = "0x4A73EbD3dcA511CF3574768BD6184747342C23f2";
export const TREASURY = "0x8b293600C50D6fbdc6Ed4251cc75ECe29880276f";

export const BOUND_VALIDATOR = "0x2842140e4Ad3a92e9af30e27e290300dd785076d";
export const UPPER_BOUND_RATIO = parseUnits("1.01", 18);
export const LOWER_BOUND_RATIO = parseUnits("0.99", 18);

export const CHAINLINK_ORACLE = "0xCeA29f1266e880A1482c06eD656cD08C148BaA32";
export const REDSTONE_ORACLE = "0x0Af51d1504ac5B711A9EAFe2fAC11A51d32029Ad";
export const RESILIENT_ORACLE = "0x3cD69251D04A28d887Ac14cbe2E14c52F3D57823";
export const WSTETH_ONEJUMP_REDSTONE_ORACLE = "0x35af302A0B4653f214240FCb2dFf059Fe42eC2CE";
export const WSTETH_ONEJUMP_CHAINLINK_ORACLE = "0xB1bf3f668e0E047ab214c7373cf6B06De37c8152";
export const WEETH_ONEJUMP_REDSTONE_ORACLE = "0xF1B65d1331DceEd40Da71CFc4f06d9754A3f3756";
export const WEETH_ONEJUMP_CHAINLINK_ORACLE = "0x8C8a70695DC952CA2e8CD4038907201FaBB8134E";

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

export const newMarkets = {
  wstETH: {
    vToken: {
      address: WSTETH_VTOKEN,
      name: "Venus wstETH (Liquid Staked ETH)",
      symbol: "vwstETH_LiquidStakedETH",
      underlying: {
        address: WSTETH,
        decimals: 18,
        symbol: "wstETH",
      },
      ...commonSpec,
    },
    riskParameters: {
      collateralFactor: parseUnits("0.9", 18),
      liquidationThreshold: parseUnits("0.93", 18),
      supplyCap: parseUnits("50", 18),
      borrowCap: parseUnits("5", 18),
      reserveFactor: parseUnits("0.25", 18),
      protocolSeizeShare: parseUnits("0.01", 18),
    },
    initialSupply: {
      amount: parseUnits("2", 18),
      vTokenReceiver: TREASURY,
    },
    interestRateModel: {
      address: "0x469D5Ce78347Bb0874220127f82Accd94d6d29c5",
      base: "0",
      multiplier: "0.09",
      jump: "0.75",
      kink: "0.45",
    },
  },
  weETH: {
    vToken: {
      address: WEETH_VTOKEN,
      name: "Venus weETH (Liquid Staked ETH)",
      symbol: "vweETH_LiquidStakedETH",
      underlying: {
        address: WEETH,
        decimals: 18,
        symbol: "weETH",
      },
      ...commonSpec,
    },
    riskParameters: {
      collateralFactor: parseUnits("0.9", 18),
      liquidationThreshold: parseUnits("0.93", 18),
      supplyCap: parseUnits("125", 18),
      borrowCap: parseUnits("65", 18),
      reserveFactor: parseUnits("0.2", 18),
      protocolSeizeShare: parseUnits("0.01", 18),
    },
    initialSupply: {
      amount: parseUnits("2", 18),
      vTokenReceiver: TREASURY,
    },
    interestRateModel: {
      address: "0x469D5Ce78347Bb0874220127f82Accd94d6d29c5",
      base: "0",
      multiplier: "0.09",
      jump: "0.75",
      kink: "0.45",
    },
  },
  ETH: {
    vToken: {
      address: ETH_VTOKEN,
      name: "Venus ETH (Liquid Staked ETH)",
      symbol: "vETH_LiquidStakedETH",
      underlying: {
        address: ETH,
        decimals: 18,
        symbol: "ETH",
      },
      ...commonSpec,
    },
    riskParameters: {
      collateralFactor: parseUnits("0.9", 18),
      liquidationThreshold: parseUnits("0.93", 18),
      supplyCap: parseUnits("125", 18),
      borrowCap: parseUnits("110", 18),
      reserveFactor: parseUnits("0.15", 18),
      protocolSeizeShare: parseUnits("0.01", 18),
    },
    initialSupply: {
      amount: parseUnits("2", 18),
      vTokenReceiver: TREASURY,
    },
    interestRateModel: {
      address: "0x2b37a63AFB834B6C47C319cDC5694bD104c86454",
      base: "0",
      multiplier: "0.035",
      jump: "0.8",
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
export const LIQUIDATION_INCENTIVE = parseUnits("1.02", 18);
export const MIN_LIQUIDATABLE_COLLATERAL = parseUnits("100", 18);

const vip400 = () => {
  const meta = {
    version: "v2",
    title: "VIP-400",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // Oracle config
      ...[WSTETH, WEETH].flatMap((token: string) => [
        {
          target: CHAINLINK_ORACLE,
          signature: "setDirectPrice(address,uint256)",
          params: [token, FIXED_LST_PRICE],
        },
        {
          target: REDSTONE_ORACLE,
          signature: "setDirectPrice(address,uint256)",
          params: [token, FIXED_LST_PRICE],
        },
        {
          target: BOUND_VALIDATOR,
          signature: "setValidateConfig((address,uint256,uint256))",
          params: [[token, UPPER_BOUND_RATIO, LOWER_BOUND_RATIO]],
        },
      ]),
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            WSTETH,
            [WSTETH_ONEJUMP_REDSTONE_ORACLE, WSTETH_ONEJUMP_CHAINLINK_ORACLE, WSTETH_ONEJUMP_CHAINLINK_ORACLE],
            [true, true, true],
          ],
        ],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            WEETH,
            [WEETH_ONEJUMP_REDSTONE_ORACLE, WEETH_ONEJUMP_CHAINLINK_ORACLE, WEETH_ONEJUMP_CHAINLINK_ORACLE],
            [true, true, true],
          ],
        ],
      },

      // Swap router
      {
        target: SWAP_ROUTER,
        signature: "acceptOwnership()",
        params: [],
      },

      // Liquid Staked ETH pool
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
        params: ["Liquid Staked ETH", COMPTROLLER, CLOSE_FACTOR, LIQUIDATION_INCENTIVE, MIN_LIQUIDATABLE_COLLATERAL],
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
          target: TREASURY,
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

      // Conversions Config
      ...Object.entries(converterBaseAssets).map(([converter, baseAsset]: [string, string]) => {
        const tokens = [WSTETH, WEETH];
        const conversionConfigs = tokens.map(() => [0, ConversionAccessibility.ALL]);
        return {
          target: converter,
          signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
          params: [baseAsset, tokens, conversionConfigs],
        };
      }),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip400;
