import { expect } from "chai";
import { BigNumberish } from "ethers";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { setMaxStalePeriodInBinanceOracle, setMaxStalePeriodInChainlinkOracle } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { vip136Testnet } from "../../../vips/vip-136/vip-136-testnet";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import ERC20_ABI from "./abi/erc20.json";
import POOL_REGISTRY_ABI from "./abi/poolRegistry.json";
import RATE_MODEL_ABI from "./abi/rateModel.json";
import SWAP_ROUTER_ABI from "./abi/swapRouter.json";
import VTOKEN_ABI from "./abi/vToken.json";

const RESILIENT_ORACLE = "0x3cD69251D04A28d887Ac14cbe2E14c52F3D57823";
const CHAINLINK_ORACLE = "0xCeA29f1266e880A1482c06eD656cD08C148BaA32";
const BINANCE_ORACLE = "0xB58BFDCE610042311Dc0e034a80Cc7776c1D68f5";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const POOL_REGISTRY = "0xC85491616Fa949E048F3aAc39fbf5b0703800667";
const TREASURY = "0x8b293600c50d6fbdc6ed4251cc75ece29880276f";

const VBNB_CORE_POOL = "0x2E7222e51c0f6e98610A1543Aa3836E092CDe62c";

type PoolId = "DeFi" | "GameFi" | "LiquidStakedBNB" | "Tron";

interface PoolContracts {
  comptroller: string;
  swapRouter: string;
}

const pools: { [key in PoolId]: PoolContracts } = {
  DeFi: {
    comptroller: "0x23a73971A6B9f6580c048B9CB188869B2A2aA2aD",
    swapRouter: "0x89Bc8dFe0Af08b60ec285071d133FCdfa9B3C08e",
  },
  GameFi: {
    comptroller: "0x1F4f0989C51f12DAcacD4025018176711f3Bf289",
    swapRouter: "0x5D254Bc7c7f2670395B9E0716C21249083D41a4f",
  },
  LiquidStakedBNB: {
    comptroller: "0x596B11acAACF03217287939f88d63b51d3771704",
    swapRouter: "0xb16792E90d6478DaBbd0144e13f41CeA21ACE116",
  },
  Tron: {
    comptroller: "0x11537D023f489E4EF0C7157cc729C7B69CbE0c97",
    swapRouter: "0x1D8cA5AFB88F07489786A3d2E0FF50F3F9314d97",
  },
};

type UnderlyingSymbol =
  | "USDT"
  | "USDD"
  | "BIFI"
  | "BSW"
  | "ALPACA"
  | "ANKR"
  | "RACA"
  | "FLOKI"
  | "ankrBNB"
  | "BNBx"
  | "stkBNB"
  | "WBNB"
  | "BTT"
  | "WIN"
  | "TRX";

type VTokenSymbol =
  | "vALPACA_DeFi"
  | "vANKR_DeFi"
  | "vBIFI_DeFi"
  | "vUSDT_DeFi"
  | "vBSW_DeFi"
  | "vUSDD_DeFi"
  | "vFLOKI_GameFi"
  | "vRACA_GameFi"
  | "vUSDD_GameFi"
  | "vUSDT_GameFi"
  | "vBNBx_LiquidStakedBNB"
  | "vUSDD_LiquidStakedBNB"
  | "vUSDT_LiquidStakedBNB"
  | "vWBNB_LiquidStakedBNB"
  | "vankrBNB_LiquidStakedBNB"
  | "vstkBNB_LiquidStakedBNB"
  | "vBTT_Tron"
  | "vTRX_Tron"
  | "vUSDD_Tron"
  | "vUSDT_Tron"
  | "vWIN_Tron";

const vTokens: { [key in VTokenSymbol]: string } = {
  vALPACA_DeFi: "0xb7caC5Ef82cb7f9197ee184779bdc52c5490C02a",
  vANKR_DeFi: "0xb677e080148368EeeE70fA3865d07E92c6500174",
  vBIFI_DeFi: "0xEF949287834Be010C1A5EDd757c385FB9b644E4A",
  vUSDT_DeFi: "0x80CC30811e362aC9aB857C3d7875CbcCc0b65750",
  vBSW_DeFi: "0x5e68913fbbfb91af30366ab1B21324410b49a308",
  vUSDD_DeFi: "0xa109DE0abaeefC521Ec29D89eA42E64F37A6882E",

  vFLOKI_GameFi: "0xef470AbC365F88e4582D8027172a392C473A5B53",
  vRACA_GameFi: "0x1958035231E125830bA5d17D168cEa07Bb42184a",
  vUSDD_GameFi: "0xdeDf3B2bcF25d0023115fd71a0F8221C91C92B1a",
  vUSDT_GameFi: "0x0bFE4e0B8A2a096A27e5B18b078d25be57C08634",

  vBNBx_LiquidStakedBNB: "0x644A149853E5507AdF3e682218b8AC86cdD62951",
  vUSDD_LiquidStakedBNB: "0xD5b20708d8f0FcA52cb609938D0594C4e32E5DaD",
  vUSDT_LiquidStakedBNB: "0x2197d02cC9cd1ad51317A0a85A656a0c82383A7c",
  vWBNB_LiquidStakedBNB: "0x231dED0Dfc99634e52EE1a1329586bc970d773b3",
  vankrBNB_LiquidStakedBNB: "0x57a664Dd7f1dE19545fEE9c86C949e3BF43d6D47",
  vstkBNB_LiquidStakedBNB: "0x75aa42c832a8911B77219DbeBABBB40040d16987",

  vBTT_Tron: "0x47793540757c6E6D84155B33cd8D9535CFdb9334",
  vTRX_Tron: "0x410286c43a525E1DCC7468a9B091C111C8324cd1",
  vUSDD_Tron: "0xD804F74fe21290d213c46610ab171f7c2EeEBDE7",
  vUSDT_Tron: "0x712774CBFFCBD60e9825871CcEFF2F917442b2c3",
  vWIN_Tron: "0xEe543D5de2Dbb5b07675Fc72831A2f1812428393",
};

const tokens = {
  USDT: "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c",
  USDD: "0x2E2466e22FcbE0732Be385ee2FBb9C59a1098382",

  BIFI: "0x5B662703775171c4212F2FBAdb7F92e64116c154",
  BSW: "0x7FCC76fc1F573d8Eb445c236Cc282246bC562bCE",
  ALPACA: "0x6923189d91fdF62dBAe623a55273F1d20306D9f2",
  ANKR: "0xe4a90EB942CF2DA7238e8F6cC9EF510c49FC8B4B",

  RACA: "0xD60cC803d888A3e743F21D0bdE4bF2cAfdEA1F26",
  FLOKI: "0xb22cF15FBc089d470f8e532aeAd2baB76bE87c88",

  ankrBNB: "0x167F1F9EF531b3576201aa3146b13c57dbEda514",
  BNBx: "0x327d6E6FAC0228070884e913263CFF9eFed4a2C8",
  stkBNB: "0x2999C176eBf66ecda3a646E70CeB5FF4d5fCFb8C",
  WBNB: "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd",

  BTT: "0xE98344A7c691B200EF47c9b8829110087D832C64",
  WIN: "0x2E6Af3f3F059F43D764060968658c9F3c8f9479D",
  TRX: "0x7D21841DC10BA1C5797951EFc62fADBBDD06704B",
};

interface VTokenState {
  name: string;
  symbol: string;
  decimals: BigNumberish;
  underlying: string;
  exchangeRate: BigNumberish;
  comptroller: string;
}

const vTokenState: { [key in VTokenSymbol]: VTokenState } = {
  // DeFi pool
  vALPACA_DeFi: {
    name: "Venus ALPACA (DeFi)",
    symbol: "vALPACA_DeFi",
    decimals: 8,
    underlying: tokens.ALPACA,
    exchangeRate: parseUnits("1", 28),
    comptroller: pools.DeFi.comptroller,
  },
  vANKR_DeFi: {
    name: "Venus ANKR (DeFi)",
    symbol: "vANKR_DeFi",
    decimals: 8,
    underlying: tokens.ANKR,
    exchangeRate: parseUnits("1", 28),
    comptroller: pools.DeFi.comptroller,
  },
  vBIFI_DeFi: {
    name: "Venus BIFI (DeFi)",
    symbol: "vBIFI_DeFi",
    decimals: 8,
    underlying: tokens.BIFI,
    exchangeRate: parseUnits("1", 28),
    comptroller: pools.DeFi.comptroller,
  },
  vUSDT_DeFi: {
    name: "Venus USDT (DeFi)",
    symbol: "vUSDT_DeFi",
    decimals: 8,
    underlying: tokens.USDT,
    exchangeRate: parseUnits("1", 16), // 1e8 * 1e16 / 1e18 = 1e6 (6 decimals)
    comptroller: pools.DeFi.comptroller,
  },
  vBSW_DeFi: {
    name: "Venus BSW (DeFi)",
    symbol: "vBSW_DeFi",
    decimals: 8,
    underlying: tokens.BSW,
    exchangeRate: parseUnits("1", 28),
    comptroller: pools.DeFi.comptroller,
  },
  vUSDD_DeFi: {
    name: "Venus USDD (DeFi)",
    symbol: "vUSDD_DeFi",
    decimals: 8,
    underlying: tokens.USDD,
    exchangeRate: parseUnits("1", 28),
    comptroller: pools.DeFi.comptroller,
  },

  // GameFi pool
  vFLOKI_GameFi: {
    name: "Venus FLOKI (GameFi)",
    symbol: "vFLOKI_GameFi",
    decimals: 8,
    underlying: tokens.FLOKI,
    exchangeRate: parseUnits("1", 28), // FLOKI has 18 decimals on testnet
    comptroller: pools.GameFi.comptroller,
  },
  vRACA_GameFi: {
    name: "Venus RACA (GameFi)",
    symbol: "vRACA_GameFi",
    decimals: 8,
    underlying: tokens.RACA,
    exchangeRate: parseUnits("1", 28),
    comptroller: pools.GameFi.comptroller,
  },
  vUSDT_GameFi: {
    name: "Venus USDT (GameFi)",
    symbol: "vUSDT_GameFi",
    decimals: 8,
    underlying: tokens.USDT,
    exchangeRate: parseUnits("1", 16), // 1e8 * 1e16 / 1e18 = 1e6 (6 decimals)
    comptroller: pools.GameFi.comptroller,
  },
  vUSDD_GameFi: {
    name: "Venus USDD (GameFi)",
    symbol: "vUSDD_GameFi",
    decimals: 8,
    underlying: tokens.USDD,
    exchangeRate: parseUnits("1", 28),
    comptroller: pools.GameFi.comptroller,
  },

  // Liquid Staked BNB pool
  vBNBx_LiquidStakedBNB: {
    name: "Venus BNBx (Liquid Staked BNB)",
    symbol: "vBNBx_LiquidStakedBNB",
    decimals: 8,
    underlying: tokens.BNBx,
    exchangeRate: parseUnits("1", 28),
    comptroller: pools.LiquidStakedBNB.comptroller,
  },
  vUSDD_LiquidStakedBNB: {
    name: "Venus USDD (Liquid Staked BNB)",
    symbol: "vUSDD_LiquidStakedBNB",
    decimals: 8,
    underlying: tokens.USDD,
    exchangeRate: parseUnits("1", 28),
    comptroller: pools.LiquidStakedBNB.comptroller,
  },
  vUSDT_LiquidStakedBNB: {
    name: "Venus USDT (Liquid Staked BNB)",
    symbol: "vUSDT_LiquidStakedBNB",
    decimals: 8,
    underlying: tokens.USDT,
    exchangeRate: parseUnits("1", 16), // 1e8 * 1e16 / 1e18 = 1e6 (6 decimals)
    comptroller: pools.LiquidStakedBNB.comptroller,
  },
  vWBNB_LiquidStakedBNB: {
    name: "Venus WBNB (Liquid Staked BNB)",
    symbol: "vWBNB_LiquidStakedBNB",
    decimals: 8,
    underlying: tokens.WBNB,
    exchangeRate: parseUnits("1", 28),
    comptroller: pools.LiquidStakedBNB.comptroller,
  },
  vankrBNB_LiquidStakedBNB: {
    name: "Venus ankrBNB (Liquid Staked BNB)",
    symbol: "vankrBNB_LiquidStakedBNB",
    decimals: 8,
    underlying: tokens.ankrBNB,
    exchangeRate: parseUnits("1", 28),
    comptroller: pools.LiquidStakedBNB.comptroller,
  },
  vstkBNB_LiquidStakedBNB: {
    name: "Venus stkBNB (Liquid Staked BNB)",
    symbol: "vstkBNB_LiquidStakedBNB",
    decimals: 8,
    underlying: tokens.stkBNB,
    exchangeRate: parseUnits("1", 28),
    comptroller: pools.LiquidStakedBNB.comptroller,
  },

  // Tron pool
  vBTT_Tron: {
    name: "Venus BTT (Tron)",
    symbol: "vBTT_Tron",
    decimals: 8,
    underlying: tokens.BTT,
    exchangeRate: parseUnits("1", 28),
    comptroller: pools.Tron.comptroller,
  },
  vTRX_Tron: {
    name: "Venus TRX (Tron)",
    symbol: "vTRX_Tron",
    decimals: 8,
    underlying: tokens.TRX,
    exchangeRate: parseUnits("1", 16), // 1e8 * 1e16 / 1e18 = 1e6 (6 decimals)
    comptroller: pools.Tron.comptroller,
  },
  vUSDT_Tron: {
    name: "Venus USDT (Tron)",
    symbol: "vUSDT_Tron",
    decimals: 8,
    underlying: tokens.USDT,
    exchangeRate: parseUnits("1", 16), // 1e8 * 1e16 / 1e18 = 1e6 (6 decimals)
    comptroller: pools.Tron.comptroller,
  },
  vUSDD_Tron: {
    name: "Venus USDD (Tron)",
    symbol: "vUSDD_Tron",
    decimals: 8,
    underlying: tokens.USDD,
    exchangeRate: parseUnits("1", 28),
    comptroller: pools.Tron.comptroller,
  },
  vWIN_Tron: {
    name: "Venus WIN (Tron)",
    symbol: "vWIN_Tron",
    decimals: 8,
    underlying: tokens.WIN,
    exchangeRate: parseUnits("1", 28),
    comptroller: pools.Tron.comptroller,
  },
};

const binanceFeeds: UnderlyingSymbol[] = ["USDD", "ANKR", "RACA", "FLOKI", "BTT", "stkBNB", "ankrBNB"];

const chainlinkFeeds: { [key in UnderlyingSymbol]?: string } = {
  WBNB: "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526",
  TRX: "0x135deD16bFFEB51E01afab45362D3C4be31AA2B0",
  USDT: "0xEca2605f0BCF2BA5966372C99837b1F182d3D620",
};

interface RiskParameters {
  borrowCap: string;
  supplyCap: string;
  collateralFactor: string;
  liquidationThreshold: string;
  reserveFactor: string;
  initialSupply: string;
  vTokenReceiver: string;
}

const riskParameters: { [key in VTokenSymbol]: RiskParameters } = {
  // DeFi
  vBIFI_DeFi: {
    borrowCap: "266",
    supplyCap: "379",
    collateralFactor: "0.25",
    liquidationThreshold: "0.3",
    reserveFactor: "0.25",
    initialSupply: "50",
    vTokenReceiver: TREASURY,
  },
  vBSW_DeFi: {
    borrowCap: "10500000",
    supplyCap: "15000000",
    collateralFactor: "0.25",
    liquidationThreshold: "0.3",
    reserveFactor: "0.25",
    initialSupply: "475750",
    vTokenReceiver: TREASURY,
  },
  vALPACA_DeFi: {
    borrowCap: "1750000",
    supplyCap: "2500000",
    collateralFactor: "0.25",
    liquidationThreshold: "0.3",
    reserveFactor: "0.25",
    initialSupply: "5189",
    vTokenReceiver: TREASURY,
  },
  vUSDT_DeFi: {
    borrowCap: "14880000",
    supplyCap: "18600000",
    collateralFactor: "0.8",
    liquidationThreshold: "0.88",
    reserveFactor: "0.1",
    initialSupply: "10000",
    vTokenReceiver: TREASURY,
  },
  vUSDD_DeFi: {
    borrowCap: "1600000",
    supplyCap: "2000000",
    collateralFactor: "0.65",
    liquidationThreshold: "0.7",
    reserveFactor: "0.1",
    initialSupply: "10000",
    vTokenReceiver: TREASURY,
  },
  vANKR_DeFi: {
    borrowCap: "6656161",
    supplyCap: "9508802",
    collateralFactor: "0.25",
    liquidationThreshold: "0.3",
    reserveFactor: "0.25",
    initialSupply: "500000",
    vTokenReceiver: TREASURY,
  },

  // Pool GameFi
  vRACA_GameFi: {
    borrowCap: "2800000000",
    supplyCap: "4000000000",
    collateralFactor: "0.25",
    liquidationThreshold: "0.3",
    reserveFactor: "0.25",
    initialSupply: "175000000",
    vTokenReceiver: TREASURY,
  },
  vFLOKI_GameFi: {
    borrowCap: "28000000000",
    supplyCap: "40000000000",
    collateralFactor: "0.25",
    liquidationThreshold: "0.3",
    reserveFactor: "0.25",
    initialSupply: "1512860000",
    vTokenReceiver: TREASURY,
  },
  vUSDT_GameFi: {
    borrowCap: "14880000",
    supplyCap: "18600000",
    collateralFactor: "0.8",
    liquidationThreshold: "0.88",
    reserveFactor: "0.1",
    initialSupply: "10000",
    vTokenReceiver: TREASURY,
  },
  vUSDD_GameFi: {
    borrowCap: "1600000",
    supplyCap: "2000000",
    collateralFactor: "0.65",
    liquidationThreshold: "0.7",
    reserveFactor: "0.1",
    initialSupply: "10000",
    vTokenReceiver: TREASURY,
  },

  // Pool Liquid Staked BNB
  vankrBNB_LiquidStakedBNB: {
    borrowCap: "5600",
    supplyCap: "8000",
    collateralFactor: "0.35",
    liquidationThreshold: "0.4",
    reserveFactor: "0.25",
    initialSupply: "40",
    vTokenReceiver: TREASURY,
  },
  vBNBx_LiquidStakedBNB: {
    borrowCap: "1272",
    supplyCap: "1818",
    collateralFactor: "0.35",
    liquidationThreshold: "0.4",
    reserveFactor: "0.25",
    initialSupply: "39.36",
    vTokenReceiver: TREASURY,
  },
  vstkBNB_LiquidStakedBNB: {
    borrowCap: "378",
    supplyCap: "540",
    collateralFactor: "0.35",
    liquidationThreshold: "0.4",
    reserveFactor: "0.25",
    initialSupply: "40",
    vTokenReceiver: TREASURY,
  },
  vWBNB_LiquidStakedBNB: {
    borrowCap: "56000",
    supplyCap: "80000",
    collateralFactor: "0.45",
    liquidationThreshold: "0.5",
    reserveFactor: "0.25",
    initialSupply: "0.1",
    vTokenReceiver: TREASURY,
  },
  vUSDT_LiquidStakedBNB: {
    borrowCap: "14880000",
    supplyCap: "18600000",
    collateralFactor: "0.8",
    liquidationThreshold: "0.88",
    reserveFactor: "0.1",
    initialSupply: "10000",
    vTokenReceiver: TREASURY,
  },
  vUSDD_LiquidStakedBNB: {
    borrowCap: "1600000",
    supplyCap: "2000000",
    collateralFactor: "0.65",
    liquidationThreshold: "0.7",
    reserveFactor: "0.1",
    initialSupply: "10000",
    vTokenReceiver: TREASURY,
  },

  // Pool Tron
  vBTT_Tron: {
    borrowCap: "1050000000000",
    supplyCap: "1500000000000",
    collateralFactor: "0.25",
    liquidationThreshold: "0.3",
    reserveFactor: "0.25",
    initialSupply: "16753000000",
    vTokenReceiver: TREASURY,
  },
  vWIN_Tron: {
    borrowCap: "2100000000",
    supplyCap: "3000000000",
    collateralFactor: "0.25",
    liquidationThreshold: "0.3",
    reserveFactor: "0.25",
    initialSupply: "134000000",
    vTokenReceiver: TREASURY,
  },
  vTRX_Tron: {
    borrowCap: "7700000",
    supplyCap: "11000000",
    collateralFactor: "0.25",
    liquidationThreshold: "0.3",
    reserveFactor: "0.25",
    initialSupply: "129000",
    vTokenReceiver: TREASURY,
  },
  vUSDT_Tron: {
    borrowCap: "14880000",
    supplyCap: "18600000",
    collateralFactor: "0.8",
    liquidationThreshold: "0.88",
    reserveFactor: "0.1",
    initialSupply: "10000",
    vTokenReceiver: TREASURY,
  },
  vUSDD_Tron: {
    borrowCap: "1600000",
    supplyCap: "2000000",
    collateralFactor: "0.65",
    liquidationThreshold: "0.7",
    reserveFactor: "0.1",
    initialSupply: "10000",
    vTokenReceiver: TREASURY,
  },
};

interface InterestRateModelSpec {
  vTokens: VTokenSymbol[];
  kink: string;
  base: string;
  multiplier: string;
  jump: string;
}

const interestRateModels: InterestRateModelSpec[] = [
  {
    vTokens: [
      "vBIFI_DeFi",
      "vBSW_DeFi",
      "vALPACA_DeFi",
      "vANKR_DeFi",
      "vRACA_GameFi",
      "vFLOKI_GameFi",
      "vankrBNB_LiquidStakedBNB",
      "vBNBx_LiquidStakedBNB",
      "vstkBNB_LiquidStakedBNB",
      "vWBNB_LiquidStakedBNB",
      "vBTT_Tron",
      "vWIN_Tron",
      "vTRX_Tron",
    ],
    kink: "0.5",
    base: "0.02",
    multiplier: "0.2",
    jump: "3",
  },
  {
    vTokens: [
      "vUSDT_DeFi",
      "vUSDD_DeFi",
      "vUSDT_GameFi",
      "vUSDD_GameFi",
      "vUSDT_LiquidStakedBNB",
      "vUSDD_LiquidStakedBNB",
      "vUSDT_Tron",
      "vUSDD_Tron",
    ],
    kink: "0.6",
    base: "0.03",
    multiplier: "0.1",
    jump: "2.5",
  },
];

forking(31152370, async () => {
  let poolRegistry: Contract;

  before(async () => {
    poolRegistry = await ethers.getContractAt(POOL_REGISTRY_ABI, POOL_REGISTRY);
    for (const [symbol, feed] of Object.entries(chainlinkFeeds) as [UnderlyingSymbol, string][]) {
      await setMaxStalePeriodInChainlinkOracle(CHAINLINK_ORACLE, tokens[symbol], feed, NORMAL_TIMELOCK);
    }
    for (const symbol of binanceFeeds) {
      await setMaxStalePeriodInBinanceOracle(BINANCE_ORACLE, symbol);
    }
  });

  describe("Contracts setup", async () => {
    const checkVToken = (
      vTokenAddress: string,
      { name, symbol, decimals, underlying, exchangeRate, comptroller }: VTokenState,
    ) => {
      describe(symbol, () => {
        let vToken: Contract;

        before(async () => {
          vToken = await ethers.getContractAt(VTOKEN_ABI, vTokenAddress);
        });

        it(`should have name = "${name}"`, async () => {
          expect(await vToken.name()).to.equal(name);
        });

        it(`should have symbol = "${symbol}"`, async () => {
          expect(await vToken.symbol()).to.equal(symbol);
        });

        it(`should have ${decimals.toString()} decimals`, async () => {
          expect(await vToken.decimals()).to.equal(decimals);
        });

        it(`should have underlying = "${underlying}"`, async () => {
          expect(await vToken.underlying()).to.equal(underlying);
        });

        it(`should have initial exchange rate of ${exchangeRate.toString()}`, async () => {
          expect(await vToken.exchangeRateStored()).to.equal(exchangeRate);
        });

        it("should have the correct Comptroller", async () => {
          expect(await vToken.comptroller()).to.equal(comptroller);
        });
      });
    };

    for (const [symbol, address] of Object.entries(vTokens) as [VTokenSymbol, string][]) {
      await checkVToken(address, vTokenState[symbol]);
    }
  });

  testVip("VIP-136 IL phase 2", await vip136Testnet());

  describe("Post-VIP state", () => {
    describe("PoolRegistry state", () => {
      let registeredPools: { name: string; creator: string; comptroller: string }[];

      before(async () => {
        registeredPools = await poolRegistry.getAllPools();
      });

      it("should have 5 pools", async () => {
        expect(registeredPools).to.have.lengthOf(5);
      });

      it("should register DeFi pool in PoolRegistry", async () => {
        const pool = registeredPools[1];
        expect(pool.name).to.equal("DeFi");
        expect(pool.creator).to.equal(NORMAL_TIMELOCK);
        expect(pool.comptroller).to.equal(pools.DeFi.comptroller);
      });

      it("should register GameFi pool in PoolRegistry", async () => {
        const pool = registeredPools[2];
        expect(pool.name).to.equal("GameFi");
        expect(pool.creator).to.equal(NORMAL_TIMELOCK);
        expect(pool.comptroller).to.equal(pools.GameFi.comptroller);
      });

      it("should register Liquid Staked BNB pool in PoolRegistry", async () => {
        const pool = registeredPools[3];
        expect(pool.name).to.equal("Liquid Staked BNB");
        expect(pool.creator).to.equal(NORMAL_TIMELOCK);
        expect(pool.comptroller).to.equal(pools.LiquidStakedBNB.comptroller);
      });

      it("should register Tron pool in PoolRegistry", async () => {
        const pool = registeredPools[4];
        expect(pool.name).to.equal("Tron");
        expect(pool.creator).to.equal(NORMAL_TIMELOCK);
        expect(pool.comptroller).to.equal(pools.Tron.comptroller);
      });

      it("should register DeFi pool vTokens in DeFi pool Comptroller", async () => {
        const comptroller = await ethers.getContractAt(COMPTROLLER_ABI, pools.DeFi.comptroller);
        const poolVTokens = await comptroller.getAllMarkets();
        expect(poolVTokens).to.have.lengthOf(6);
        expect(poolVTokens).to.include(vTokens.vALPACA_DeFi);
        expect(poolVTokens).to.include(vTokens.vANKR_DeFi);
        expect(poolVTokens).to.include(vTokens.vBIFI_DeFi);
        expect(poolVTokens).to.include(vTokens.vUSDT_DeFi);
        expect(poolVTokens).to.include(vTokens.vBSW_DeFi);
        expect(poolVTokens).to.include(vTokens.vUSDD_DeFi);
      });

      it("should register GameFi pool vTokens in GameFi pool Comptroller", async () => {
        const comptroller = await ethers.getContractAt(COMPTROLLER_ABI, pools.GameFi.comptroller);
        const poolVTokens = await comptroller.getAllMarkets();
        expect(poolVTokens).to.have.lengthOf(4);
        expect(poolVTokens).to.include(vTokens.vFLOKI_GameFi);
        expect(poolVTokens).to.include(vTokens.vRACA_GameFi);
        expect(poolVTokens).to.include(vTokens.vUSDD_GameFi);
        expect(poolVTokens).to.include(vTokens.vUSDT_GameFi);
      });

      it("should register Liquid Staked BNB pool vTokens in Liquid Staked BNB pool Comptroller", async () => {
        const comptroller = await ethers.getContractAt(COMPTROLLER_ABI, pools.LiquidStakedBNB.comptroller);
        const poolVTokens = await comptroller.getAllMarkets();
        expect(poolVTokens).to.have.lengthOf(6);
        expect(poolVTokens).to.include(vTokens.vBNBx_LiquidStakedBNB);
        expect(poolVTokens).to.include(vTokens.vUSDD_LiquidStakedBNB);
        expect(poolVTokens).to.include(vTokens.vUSDT_LiquidStakedBNB);
        expect(poolVTokens).to.include(vTokens.vWBNB_LiquidStakedBNB);
        expect(poolVTokens).to.include(vTokens.vankrBNB_LiquidStakedBNB);
        expect(poolVTokens).to.include(vTokens.vstkBNB_LiquidStakedBNB);
      });

      it("should register Tron pool vTokens in Tron pool Comptroller", async () => {
        const comptroller = await ethers.getContractAt(COMPTROLLER_ABI, pools.Tron.comptroller);
        const poolVTokens = await comptroller.getAllMarkets();
        expect(poolVTokens).to.have.lengthOf(5);
        expect(poolVTokens).to.include(vTokens.vBTT_Tron);
        expect(poolVTokens).to.include(vTokens.vTRX_Tron);
        expect(poolVTokens).to.include(vTokens.vUSDD_Tron);
        expect(poolVTokens).to.include(vTokens.vUSDT_Tron);
        expect(poolVTokens).to.include(vTokens.vWIN_Tron);
      });

      for (const [symbol, { underlying }] of Object.entries(vTokenState) as [VTokenSymbol, VTokenState][]) {
        it(`should register ${symbol} in PoolRegistry`, async () => {
          const registeredVToken = await poolRegistry.getVTokenForAsset(vTokenState[symbol].comptroller, underlying);
          expect(registeredVToken).to.equal(vTokens[symbol]);
        });
      }
    });

    describe("Ownership", () => {
      for (const [symbol, address] of Object.entries(vTokens) as [VTokenSymbol, string][]) {
        it(`should transfer ownership of ${symbol} to Timelock`, async () => {
          const vToken = await ethers.getContractAt(VTOKEN_ABI, address);
          expect(await vToken.owner()).to.equal(NORMAL_TIMELOCK);
        });
      }
    });

    describe("Initial supply", () => {
      for (const [symbol, params] of Object.entries(riskParameters) as [VTokenSymbol, RiskParameters][]) {
        it(`should mint initial supply of ${symbol} to ${params.vTokenReceiver}`, async () => {
          // Since we're distributing 1:1, decimals should be accounted for in the exchange rate
          const expectedSupply = parseUnits(params.initialSupply, 8);
          const vToken = await ethers.getContractAt(VTOKEN_ABI, vTokens[symbol]);
          expect(await vToken.balanceOf(params.vTokenReceiver)).to.equal(expectedSupply);
        });
      }
    });

    describe("Risk parameters", () => {
      for (const [symbol, params] of Object.entries(riskParameters) as [VTokenSymbol, RiskParameters][]) {
        describe(`${symbol} risk parameters`, () => {
          let vToken: Contract;
          let comptroller: Contract;
          let underlyingDecimals: number;

          before(async () => {
            vToken = await ethers.getContractAt(VTOKEN_ABI, vTokens[symbol]);
            comptroller = await ethers.getContractAt(COMPTROLLER_ABI, vTokenState[symbol].comptroller);
            const underlyingAddress = vTokenState[symbol].underlying;
            const underlying = await ethers.getContractAt(ERC20_ABI, underlyingAddress);
            underlyingDecimals = await underlying.decimals();
          });

          it(`should set ${symbol} reserve factor to ${params.reserveFactor}`, async () => {
            expect(await vToken.reserveFactorMantissa()).to.equal(parseUnits(params.reserveFactor, 18));
          });

          it(`should set ${symbol} collateral factor to ${params.collateralFactor}`, async () => {
            const market = await comptroller.markets(vTokens[symbol]);
            expect(market.collateralFactorMantissa).to.equal(parseUnits(params.collateralFactor, 18));
          });

          it(`should set ${symbol} liquidation threshold to ${params.liquidationThreshold}`, async () => {
            const market = await comptroller.markets(vTokens[symbol]);
            expect(market.liquidationThresholdMantissa).to.equal(parseUnits(params.liquidationThreshold, 18));
          });

          it(`should set ${symbol} protocol seize share to 0.05`, async () => {
            expect(await vToken.protocolSeizeShareMantissa()).to.equal(parseUnits("0.05", 18));
          });

          it(`should set ${symbol} supply cap to ${params.supplyCap}`, async () => {
            expect(await comptroller.supplyCaps(vTokens[symbol])).to.equal(
              parseUnits(params.supplyCap, underlyingDecimals),
            );
          });

          it(`should set ${symbol} borrow cap to ${params.borrowCap}`, async () => {
            expect(await comptroller.borrowCaps(vTokens[symbol])).to.equal(
              parseUnits(params.borrowCap, underlyingDecimals),
            );
          });
        });
      }
    });

    describe("Pool configuration", () => {
      for (const [name, pool] of Object.entries(pools) as [PoolId, PoolContracts][]) {
        describe(`${name} Comptroller`, () => {
          let comptroller: Contract;

          before(async () => {
            comptroller = await ethers.getContractAt(COMPTROLLER_ABI, pool.comptroller);
          });

          it("should have the correct price oracle", async () => {
            expect(await comptroller.oracle()).to.equal(RESILIENT_ORACLE);
          });

          it("should have close factor = 0.5", async () => {
            expect(await comptroller.closeFactorMantissa()).to.equal(parseUnits("0.5", 18));
          });

          it("should have liquidation incentive = 1.1", async () => {
            expect(await comptroller.liquidationIncentiveMantissa()).to.equal(parseUnits("1.1", 18));
          });

          it("should have minLiquidatableCollateral = $100", async () => {
            expect(await comptroller.minLiquidatableCollateral()).to.equal(parseUnits("100", 18));
          });

          it("should have owner = NormalTimelock", async () => {
            expect(await comptroller.owner()).to.equal(NORMAL_TIMELOCK);
          });
        });

        describe(`${name} SwapRouter`, () => {
          let swapRouter: Contract;

          before(async () => {
            swapRouter = await ethers.getContractAt(SWAP_ROUTER_ABI, pool.swapRouter);
          });

          it(`should have WBNB = ${tokens.WBNB}`, async () => {
            expect(await swapRouter.WBNB()).to.equal(tokens.WBNB);
          });

          it(`should have vBNB = core pool vBNB (${VBNB_CORE_POOL})`, async () => {
            expect(await swapRouter.vBNBAddress()).to.equal(VBNB_CORE_POOL);
          });

          it(`should have comptroller = Comptroller_${name}`, async () => {
            expect(await swapRouter.comptrollerAddress()).to.equal(pool.comptroller);
          });

          it("should have owner = NormalTimelock", async () => {
            expect(await swapRouter.owner()).to.equal(NORMAL_TIMELOCK);
          });
        });
      }
    });
  });

  describe("Interest rate models", () => {
    const checkInterestRate = (
      vTokenAddress: string,
      symbol: string,
      {
        base,
        multiplier,
        jump,
        kink,
      }: {
        base: string;
        multiplier: string;
        jump: string;
        kink: string;
      },
    ) => {
      describe(`${symbol} interest rate model`, () => {
        const BLOCKS_PER_YEAR = 10512000;
        let rateModel: Contract;

        before(async () => {
          const vToken = await ethers.getContractAt(VTOKEN_ABI, vTokenAddress);
          rateModel = await ethers.getContractAt(RATE_MODEL_ABI, await vToken.interestRateModel());
        });

        it(`should have base = ${base}`, async () => {
          const basePerBlock = parseUnits(base, 18).div(BLOCKS_PER_YEAR);
          expect(await rateModel.baseRatePerBlock()).to.equal(basePerBlock);
        });

        it(`should have jump = ${jump}`, async () => {
          const jumpPerBlock = parseUnits(jump, 18).div(BLOCKS_PER_YEAR);
          expect(await rateModel.jumpMultiplierPerBlock()).to.equal(jumpPerBlock);
        });

        it(`should have multiplier = ${multiplier}`, async () => {
          const multiplierPerBlock = parseUnits(multiplier, 18).div(BLOCKS_PER_YEAR);
          expect(await rateModel.multiplierPerBlock()).to.equal(multiplierPerBlock);
        });

        it(`should have kink = ${kink}`, async () => {
          expect(await rateModel.kink()).to.equal(parseUnits(kink, 18));
        });
      });
    };

    describe("Interest rate models", () => {
      for (const model of interestRateModels) {
        for (const symbol of model.vTokens) {
          checkInterestRate(vTokens[symbol], symbol, {
            base: model.base,
            multiplier: model.multiplier,
            jump: model.jump,
            kink: model.kink,
          });
        }
      }
    });
  });
});
