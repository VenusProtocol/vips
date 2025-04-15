import { BigNumber, BigNumberish } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const {
  VTREASURY,
  RESILIENT_ORACLE,
  REDSTONE_ORACLE,
  CHAINLINK_ORACLE,
  UNITROLLER,
  ACCESS_CONTROL_MANAGER,
  NORMAL_TIMELOCK,
} = NETWORK_ADDRESSES.bsctestnet;
export const PROTOCOL_SHARE_RESERVE = "0x25c7c7D6Bf710949fD7f03364E9BA19a1b3c10E3";

const REDUCE_RESERVES_BLOCK_DELTA = "28800";

// Oracles
export const SUSDE_ONEJUMP_REDSTONE_ORACLE = "0x395cFE1448fB41DCB1e23D9C3e34A42759F501Fa";
export const SUSDE_ONEJUMP_CHAINLINK_ORACLE = "0x24443fBe1625052a0D10F08846f65335B258d30D";
export const MOCK_PENDLE_PT_ORACLE = "0xa37A9127C302fEc17d456a6E1a5643a18a1779aD";
export const PT_SUSDE_PENDLE_ORACLE = "0xff141CC0388224ddC923CDB7Fa64e9e2eb79254b";
const BOUND_VALIDATOR = "0x2842140e4Ad3a92e9af30e27e290300dd785076d";
const TWAP_DURATION = 1800;
const UPPER_BOUND_RATIO = parseUnits("1.01", 18);
const LOWER_BOUND_RATIO = parseUnits("0.99", 18);
export const USDE_FIXED_PRICE = parseUnits("1", 18);
export const SUSDE_FIXED_RATE = parseUnits("1.1", 18);

// Converters
const ETH = "0x98f7A83361F7Ac8765CcEBAB1425da6b341958a7";
const USDT = "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c";
const USDC = "0x16227D60f7a0e586C66B005219dfc887D13C9531";
const BTCB = "0xA808e341e8e723DC6BA0Bb5204Bafc2330d7B8e4";
const XVS = "0xB9e0E753630434d7863528cc73CB7AC638a7c8ff";
const RISK_FUND_CONVERTER = "0x32Fbf7bBbd79355B86741E3181ef8c1D9bD309Bb";
const USDT_PRIME_CONVERTER = "0xf1FA230D25fC5D6CAfe87C5A6F9e1B17Bc6F194E";
const USDC_PRIME_CONVERTER = "0x2ecEdE6989d8646c992344fF6C97c72a3f811A13";
const BTCB_PRIME_CONVERTER = "0x989A1993C023a45DA141928921C0dE8fD123b7d1";
const ETH_PRIME_CONVERTER = "0xf358650A007aa12ecC8dac08CF8929Be7f72A4D9";
const XVS_VAULT_CONVERTER = "0x258f49254C758a0E37DAb148ADDAEA851F4b02a2";
export const CONVERSION_INCENTIVE = 1e14;

export const converterBaseAssets = {
  [RISK_FUND_CONVERTER]: USDT,
  [USDT_PRIME_CONVERTER]: USDT,
  [USDC_PRIME_CONVERTER]: USDC,
  [BTCB_PRIME_CONVERTER]: BTCB,
  [ETH_PRIME_CONVERTER]: ETH,
  [XVS_VAULT_CONVERTER]: XVS,
};

const commonSpec = {
  decimals: 8,
  comptroller: UNITROLLER,
  isLegacyPool: true,
};

export const tokens = {
  "PT-sUSDE-26JUN2025": {
    address: "0x95e58161BA2423c3034658d957F3f5b94DeAbf81",
    decimals: 18,
    symbol: "PT-sUSDE-26JUN2025",
  },
  sUSDe: {
    address: "0xcFec590e417Abb378cfEfE6296829E35fa25cEbd",
    decimals: 18,
    symbol: "sUSDe",
  },
  USDe: {
    address: "0x986C30591f5aAb401ea3aa63aFA595608721B1B9",
    decimals: 18,
    symbol: "USDe",
  },
};

export const marketSpecs = {
  "PT-sUSDE-26JUN2025": {
    vToken: {
      address: "0x90535B06ddB00453a5e5f2bC094d498F1cc86032",
      name: "Venus PT-sUSDE-26JUN2025",
      symbol: "vPT-sUSDE-26JUN2025",
      underlying: tokens["PT-sUSDE-26JUN2025"],
      exchangeRate: parseUnits("1.0000000000003908632302865096", 28),
      ...commonSpec,
    },
    interestRateModel: {
      address: "0x4348FC0CBD4ab6E46311ef90ba706169e50fC804",
      base: "0",
      multiplier: "0.1",
      jump: "2.5",
      kink: "0.8",
    },
    initialSupply: {
      amount: parseUnits("10424.583228294074586275", 18),
      vTokensToBurn: parseUnits("10", 8), // Approximately $10
      vTokenReceiver: VTREASURY,
    },
    riskParameters: {
      collateralFactor: parseUnits("0.7", 18),
      reserveFactor: parseUnits("0", 18),
      supplyCap: parseUnits("2000000", 18),
      borrowCap: parseUnits("0", 18),
    },
  },
  sUSDe: {
    vToken: {
      address: "0x8c8A1a0b6e1cb8058037F7bF24de6b79Aca5B7B0",
      name: "Venus sUSDe",
      symbol: "vsUSDe",
      underlying: tokens.sUSDe,
      exchangeRate: parseUnits("1", 28),
      ...commonSpec,
    },
    interestRateModel: {
      address: "0x4348FC0CBD4ab6E46311ef90ba706169e50fC804",
      base: "0",
      multiplier: "0.1",
      jump: "2.5",
      kink: "0.8",
    },
    initialSupply: {
      amount: parseUnits("4300", 18),
      vTokensToBurn: parseUnits("10", 8), // Approximately $10
      vTokenReceiver: VTREASURY,
    },
    riskParameters: {
      collateralFactor: parseUnits("0.75", 18),
      reserveFactor: parseUnits("0", 18),
      supplyCap: parseUnits("2000000", 18),
      borrowCap: parseUnits("0", 18),
    },
  },
  USDe: {
    vToken: {
      address: "0x86f8DfB7CA84455174EE9C3edd94867b51Da46BD",
      name: "Venus USDe",
      symbol: "vUSDe",
      underlying: tokens.USDe,
      exchangeRate: parseUnits("1", 28),
      ...commonSpec,
    },
    interestRateModel: {
      address: "0x37bD1aFb1E9965FB9a229f85f71f8bEB5afdA91C",
      base: "0",
      multiplier: "0.075",
      jump: "0.5",
      kink: "0.8",
    },
    initialSupply: {
      amount: parseUnits("5000", 18),
      vTokensToBurn: parseUnits("10", 8), // Approximately $10
      vTokenReceiver: VTREASURY,
    },
    riskParameters: {
      collateralFactor: parseUnits("0.75", 18),
      reserveFactor: parseUnits("0.25", 18),
      supplyCap: parseUnits("2000000", 18),
      borrowCap: parseUnits("1600000", 18),
    },
  },
};

export const convertAmountToVTokens = (amount: BigNumber, exchangeRate: BigNumber) => {
  const EXP_SCALE = parseUnits("1", 18);
  return amount.mul(EXP_SCALE).div(exchangeRate);
};

const configureConverters = (fromAssets: string[], incentive: BigNumberish = CONVERSION_INCENTIVE) => {
  enum ConversionAccessibility {
    NONE = 0,
    ALL = 1,
    ONLY_FOR_CONVERTERS = 2,
    ONLY_FOR_USERS = 3,
  }

  return Object.entries(converterBaseAssets).map(([converter, baseAsset]: [string, string]) => {
    const conversionConfigs = fromAssets.map(() => [incentive, ConversionAccessibility.ALL]);
    return {
      target: converter,
      signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
      params: [baseAsset, fromAssets, conversionConfigs],
    };
  });
};

export const vip480 = () => {
  const meta = {
    version: "v2",
    title: "VIP-480 Ethena markets in the Core pool",
    description: `VIP-480 Ethena markets in the Core pool`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // Configure Oracle for USDe
      {
        target: REDSTONE_ORACLE,
        signature: "setDirectPrice(address,uint256)",
        params: [tokens.USDe.address, USDE_FIXED_PRICE],
      },
      {
        target: CHAINLINK_ORACLE,
        signature: "setDirectPrice(address,uint256)",
        params: [tokens.USDe.address, USDE_FIXED_PRICE],
      },
      {
        target: BOUND_VALIDATOR,
        signature: "setValidateConfig((address,uint256,uint256))",
        params: [[tokens.USDe.address, UPPER_BOUND_RATIO, LOWER_BOUND_RATIO]],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [[tokens.USDe.address, [REDSTONE_ORACLE, CHAINLINK_ORACLE, CHAINLINK_ORACLE], [true, true, true]]],
      },

      // Configure Oracle for sUSDe
      {
        target: REDSTONE_ORACLE,
        signature: "setDirectPrice(address,uint256)",
        params: [tokens.sUSDe.address, SUSDE_FIXED_RATE],
      },
      {
        target: CHAINLINK_ORACLE,
        signature: "setDirectPrice(address,uint256)",
        params: [tokens.sUSDe.address, SUSDE_FIXED_RATE],
      },
      {
        target: BOUND_VALIDATOR,
        signature: "setValidateConfig((address,uint256,uint256))",
        params: [[tokens.sUSDe.address, UPPER_BOUND_RATIO, LOWER_BOUND_RATIO]],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            tokens.sUSDe.address,
            [SUSDE_ONEJUMP_REDSTONE_ORACLE, SUSDE_ONEJUMP_CHAINLINK_ORACLE, SUSDE_ONEJUMP_CHAINLINK_ORACLE],
            [true, true, true],
          ],
        ],
      },

      // Configure Oracle for PT-sUSDe-26JUN2026
      {
        target: MOCK_PENDLE_PT_ORACLE,
        signature: "setPtToSyRate(address,uint32,uint256)",
        params: ["0x0000000000000000000000000000000000000003", TWAP_DURATION, parseUnits("0.85", 18)],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            tokens["PT-sUSDE-26JUN2025"].address,
            [PT_SUSDE_PENDLE_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
          ],
        ],
      },

      // Add Markets
      ...Object.values(marketSpecs).flatMap(({ vToken, initialSupply, riskParameters }) => [
        {
          target: vToken.comptroller,
          signature: "_supportMarket(address)",
          params: [vToken.address],
        },

        {
          target: vToken.comptroller,
          signature: "_setMarketSupplyCaps(address[],uint256[])",
          params: [[vToken.address], [riskParameters.supplyCap]],
        },

        {
          target: vToken.comptroller,
          signature: "_setMarketBorrowCaps(address[],uint256[])",
          params: [[vToken.address], [riskParameters.borrowCap]],
        },

        {
          target: vToken.comptroller,
          signature: "_setCollateralFactor(address,uint256)",
          params: [vToken.address, riskParameters.collateralFactor],
        },

        {
          target: vToken.address,
          signature: "setAccessControlManager(address)",
          params: [ACCESS_CONTROL_MANAGER],
        },
        {
          target: vToken.address,
          signature: "setProtocolShareReserve(address)",
          params: [PROTOCOL_SHARE_RESERVE],
        },

        {
          target: vToken.address,
          signature: "setReduceReservesBlockDelta(uint256)",
          params: [REDUCE_RESERVES_BLOCK_DELTA],
        },
        {
          target: vToken.address,
          signature: "_setReserveFactor(uint256)",
          params: [riskParameters.reserveFactor],
        },

        // Mint initial supply
        {
          target: vToken.underlying.address,
          signature: "faucet(uint256)",
          params: [initialSupply.amount],
        },
        {
          target: vToken.underlying.address,
          signature: "approve(address,uint256)",
          params: [vToken.address, initialSupply.amount],
        },
        {
          target: vToken.address,
          signature: "mintBehalf(address,uint256)",
          params: [NORMAL_TIMELOCK, initialSupply.amount],
        },
        {
          target: vToken.underlying.address,
          signature: "approve(address,uint256)",
          params: [vToken.address, 0],
        },

        // Burn some vtokens
        {
          target: vToken.address,
          signature: "transfer(address,uint256)",
          params: [ethers.constants.AddressZero, initialSupply.vTokensToBurn],
        },
        (() => {
          const vTokensMinted = convertAmountToVTokens(initialSupply.amount, vToken.exchangeRate);
          const vTokensRemaining = vTokensMinted.sub(initialSupply.vTokensToBurn);
          return {
            target: vToken.address,
            signature: "transfer(address,uint256)",
            params: [initialSupply.vTokenReceiver, vTokensRemaining],
          };
        })(),
      ]),

      // Pause actions
      {
        target: UNITROLLER,
        signature: "_setActionsPaused(address[],uint8[],bool)",
        params: [[marketSpecs.sUSDe.vToken.address, marketSpecs["PT-sUSDE-26JUN2025"].vToken.address], [2], true],
      },

      ...configureConverters(Object.values(tokens).map(({ address }) => address)),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip480;
