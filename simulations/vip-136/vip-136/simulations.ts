import { expect } from "chai";
import { BigNumberish } from "ethers";
import { Contract } from "ethers";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import {
  initMainnetUser,
  setMaxStalePeriodInBinanceOracle,
  setMaxStalePeriodInChainlinkOracle,
} from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { vip136 } from "../../../vips/vip-136/vip-136";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import ERC20_ABI from "./abi/erc20.json";
import POOL_REGISTRY_ABI from "./abi/poolRegistry.json";
import RATE_MODEL_ABI from "./abi/rateModel.json";
import SWAP_ROUTER_ABI from "./abi/swapRouter.json";
import VTOKEN_ABI from "./abi/vToken.json";

const RESILIENT_ORACLE = "0x6592b5DE802159F3E74B2486b091D11a8256ab8A";
const CHAINLINK_ORACLE = "0x1B2103441A0A108daD8848D8F5d790e4D402921F";
const BINANCE_ORACLE = "0x594810b741d136f1960141C0d8Fb4a91bE78A820";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const POOL_REGISTRY = "0x9F7b01A536aFA00EF10310A162877fd792cD0666";
const SWAP_ROUTER_STABLECOINS = "0xBBd8E2b5d69fcE9Aaa599c50F0f0960AA58B32aA";

const VBNB_CORE_POOL = "0xA07c5b74C9B40447a954e1466938b865b6BBea36";

type PoolId = "DeFi" | "GameFi" | "LiquidStakedBNB" | "Tron";

interface PoolContracts {
  comptroller: string;
  swapRouter: string;
}

const pools: { [key in PoolId]: PoolContracts } = {
  DeFi: {
    comptroller: "0x3344417c9360b963ca93A4e8305361AEde340Ab9",
    swapRouter: "0x47bEe99BD8Cf5D8d7e815e2D2a3E2985CBCcC04b",
  },
  GameFi: {
    comptroller: "0x1b43ea8622e76627B81665B1eCeBB4867566B963",
    swapRouter: "0x9B15462a79D0948BdDF679E0E5a9841C44aAFB7A",
  },
  LiquidStakedBNB: {
    comptroller: "0xd933909A4a2b7A4638903028f44D1d38ce27c352",
    swapRouter: "0x5f0ce69Aa564468492e860e8083BB001e4eb8d56",
  },
  Tron: {
    comptroller: "0x23b4404E4E5eC5FF5a6FFb70B7d14E3FabF237B0",
    swapRouter: "0xacD270Ed7DFd4466Bd931d84fe5B904080E28Bfc",
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
  | "vWBNB_LiquidStakedBNB"
  | "vankrBNB_LiquidStakedBNB"
  | "vstkBNB_LiquidStakedBNB"
  | "vBTT_Tron"
  | "vTRX_Tron"
  | "vUSDD_Tron"
  | "vUSDT_Tron"
  | "vWIN_Tron";

const vTokens: { [key in VTokenSymbol]: string } = {
  vALPACA_DeFi: "0x02c5Fb0F26761093D297165e902e96D08576D344",
  vANKR_DeFi: "0x19CE11C8817a1828D1d357DFBF62dCf5b0B2A362",
  vBIFI_DeFi: "0xC718c51958d3fd44f5F9580c9fFAC2F89815C909",
  vUSDT_DeFi: "0x1D8bBDE12B6b34140604E18e9f9c6e14deC16854",
  vBSW_DeFi: "0x8f657dFD3a1354DEB4545765fE6840cc54AFd379",
  vUSDD_DeFi: "0xA615467caE6B9E0bb98BC04B4411d9296fd1dFa0",

  vFLOKI_GameFi: "0xc353B7a1E13dDba393B5E120D4169Da7185aA2cb",
  vRACA_GameFi: "0xE5FE5527A5b76C75eedE77FdFA6B80D52444A465",
  vUSDD_GameFi: "0x9f2FD23bd0A5E08C5f2b9DD6CF9C96Bfb5fA515C",
  vUSDT_GameFi: "0x4978591f17670A846137d9d613e333C38dc68A37",

  vBNBx_LiquidStakedBNB: "0x5E21bF67a6af41c74C1773E4b473ca5ce8fd3791",
  vWBNB_LiquidStakedBNB: "0xe10E80B7FD3a29fE46E16C30CC8F4dd938B742e2",
  vankrBNB_LiquidStakedBNB: "0xBfe25459BA784e70E2D7a718Be99a1f3521cA17f",
  vstkBNB_LiquidStakedBNB: "0xcc5D9e502574cda17215E70bC0B4546663785227",

  vBTT_Tron: "0x49c26e12959345472E2Fd95E5f79F8381058d3Ee",
  vTRX_Tron: "0x836beb2cB723C498136e1119248436A645845F4E",
  vUSDD_Tron: "0xf1da185CCe5BeD1BeBbb3007Ef738Ea4224025F7",
  vUSDT_Tron: "0x281E5378f99A4bc55b295ABc0A3E7eD32Deba059",
  vWIN_Tron: "0xb114cfA615c828D88021a41bFc524B800E64a9D5",
};

const tokens = {
  USDT: "0x55d398326f99059fF775485246999027B3197955",
  USDD: "0xd17479997F34dd9156Deef8F95A52D81D265be9c",

  BIFI: "0xCa3F508B8e4Dd382eE878A314789373D80A5190A",
  BSW: "0x965F527D9159dCe6288a2219DB51fc6Eef120dD1",
  ALPACA: "0x8F0528cE5eF7B51152A59745bEfDD91D97091d2F",
  ANKR: "0xf307910A4c7bbc79691fD374889b36d8531B08e3",

  RACA: "0x12BB890508c125661E03b09EC06E404bc9289040",
  FLOKI: "0xfb5B838b6cfEEdC2873aB27866079AC55363D37E",

  ankrBNB: "0x52F24a5e03aee338Da5fd9Df68D2b6FAe1178827",
  BNBx: "0x1bdd3Cf7F79cfB8EdbB955f20ad99211551BA275",
  stkBNB: "0xc2E9d07F66A89c44062459A47a0D2Dc038E4fb16",
  WBNB: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",

  BTT: "0x352Cb5E19b12FC216548a2677bD0fce83BaE434B",
  WIN: "0xaeF0d72a118ce24feE3cD1d43d383897D05B4e99",
  TRX: "0xCE7de646e7208a4Ef112cb6ed5038FA6cC6b12e3",
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
    exchangeRate: parseUnits("1", 28),
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
    exchangeRate: parseUnits("1", 19), // 1e8 * 1e19 / 1e18 = 1e9 (9 decimals)
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
    exchangeRate: parseUnits("1", 28),
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
    exchangeRate: parseUnits("1", 28),
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
  BIFI: "0xab827b69dacd586a37e80a7d552a4395d576e645",
  BSW: "0x08e70777b982a58d23d05e3d7714f44837c06a21",
  ALPACA: "0xe0073b60833249ffd1bb2af809112c2fbf221df6",
  BNBx: "0xc4429B539397a3166eF3ef132c29e34715a3ABb4",
  WBNB: "0x0567f2323251f0aab15c8dfb1967e4e8a7d42aee",
  WIN: "0x9e7377e194e41d63795907c92c3eb351a2eb0233",
  TRX: "0xf4c5e535756d11994fcbb12ba8add0192d9b88be",
  USDT: "0xb97ad0e74fa7d920791e90258a6e2085088b4320",
};

const treasuries = {
  "Beefy DAO Treasury": "0x7C780b8A63eE9B7d0F985E8a922Be38a1F7B2141",
  "Biswap Team": "0x109E8083a64c7DedE513e8b580c5b08B96f9cE73",
  "Alpaca Team": "0xAD9CADe20100B8b945da48e1bCbd805C38d8bE77",
  "Venus Treasury": "0xf322942f644a996a617bd29c16bd7d231d9f35e9",
  "Tron Ecosystem": "0x3DdfA8eC3052539b6C9549F12cEA2C295cfF5296",
  "ANKR Team": "0xAE1c38847Fb90A13a2a1D7E5552cCD80c62C6508",
  "RACA Team": "0x6Ee74536B3Ff10Ff639aa781B7220121287F6Fa5",
  "FLOKI Treasury": "0x17e98a24f992BB7bcd62d6722d714A3C74814B94",
  "Stader Treasury": "0xF0348E1748FCD45020151C097D234DbbD5730BE7",
  "pStake Treasury": "0xccc022502d6c65e1166fd34147040f05880f7972",
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
    vTokenReceiver: treasuries["Beefy DAO Treasury"],
  },
  vBSW_DeFi: {
    borrowCap: "10500000",
    supplyCap: "15000000",
    collateralFactor: "0.25",
    liquidationThreshold: "0.3",
    reserveFactor: "0.25",
    initialSupply: "475750",
    vTokenReceiver: treasuries["Biswap Team"],
  },
  vALPACA_DeFi: {
    borrowCap: "1750000",
    supplyCap: "2500000",
    collateralFactor: "0.25",
    liquidationThreshold: "0.3",
    reserveFactor: "0.25",
    initialSupply: "5189",
    vTokenReceiver: treasuries["Alpaca Team"],
  },
  vUSDT_DeFi: {
    borrowCap: "14880000",
    supplyCap: "18600000",
    collateralFactor: "0.8",
    liquidationThreshold: "0.88",
    reserveFactor: "0.1",
    initialSupply: "10000",
    vTokenReceiver: treasuries["Venus Treasury"],
  },
  vUSDD_DeFi: {
    borrowCap: "1600000",
    supplyCap: "2000000",
    collateralFactor: "0.65",
    liquidationThreshold: "0.7",
    reserveFactor: "0.1",
    initialSupply: "10000",
    vTokenReceiver: treasuries["Tron Ecosystem"],
  },
  vANKR_DeFi: {
    borrowCap: "6656161",
    supplyCap: "9508802",
    collateralFactor: "0.25",
    liquidationThreshold: "0.3",
    reserveFactor: "0.25",
    initialSupply: "500000",
    vTokenReceiver: treasuries["ANKR Team"],
  },

  // Pool GameFi
  vRACA_GameFi: {
    borrowCap: "2800000000",
    supplyCap: "4000000000",
    collateralFactor: "0.25",
    liquidationThreshold: "0.3",
    reserveFactor: "0.25",
    initialSupply: "175000000",
    vTokenReceiver: treasuries["RACA Team"],
  },
  vFLOKI_GameFi: {
    borrowCap: "28000000000",
    supplyCap: "40000000000",
    collateralFactor: "0.25",
    liquidationThreshold: "0.3",
    reserveFactor: "0.25",
    initialSupply: "1512860000",
    vTokenReceiver: treasuries["FLOKI Treasury"],
  },
  vUSDT_GameFi: {
    borrowCap: "14880000",
    supplyCap: "18600000",
    collateralFactor: "0.8",
    liquidationThreshold: "0.88",
    reserveFactor: "0.1",
    initialSupply: "10000",
    vTokenReceiver: treasuries["Venus Treasury"],
  },
  vUSDD_GameFi: {
    borrowCap: "1600000",
    supplyCap: "2000000",
    collateralFactor: "0.65",
    liquidationThreshold: "0.7",
    reserveFactor: "0.1",
    initialSupply: "10000",
    vTokenReceiver: treasuries["Tron Ecosystem"],
  },

  //Pool Liquid Staked BNB
  vankrBNB_LiquidStakedBNB: {
    borrowCap: "5600",
    supplyCap: "8000",
    collateralFactor: "0.35",
    liquidationThreshold: "0.4",
    reserveFactor: "0.25",
    initialSupply: "40",
    vTokenReceiver: treasuries["ANKR Team"],
  },
  vBNBx_LiquidStakedBNB: {
    borrowCap: "1272",
    supplyCap: "1818",
    collateralFactor: "0.35",
    liquidationThreshold: "0.4",
    reserveFactor: "0.25",
    initialSupply: "39.36",
    vTokenReceiver: treasuries["Stader Treasury"],
  },
  vstkBNB_LiquidStakedBNB: {
    borrowCap: "378",
    supplyCap: "540",
    collateralFactor: "0.35",
    liquidationThreshold: "0.4",
    reserveFactor: "0.25",
    initialSupply: "40",
    vTokenReceiver: treasuries["pStake Treasury"],
  },
  vWBNB_LiquidStakedBNB: {
    borrowCap: "56000",
    supplyCap: "80000",
    collateralFactor: "0.45",
    liquidationThreshold: "0.5",
    reserveFactor: "0.25",
    initialSupply: "35",
    vTokenReceiver: treasuries["Venus Treasury"],
  },

  // Pool Tron
  vBTT_Tron: {
    borrowCap: "1050000000000",
    supplyCap: "1500000000000",
    collateralFactor: "0.25",
    liquidationThreshold: "0.3",
    reserveFactor: "0.25",
    initialSupply: "16753000000",
    vTokenReceiver: treasuries["Tron Ecosystem"],
  },
  vWIN_Tron: {
    borrowCap: "2100000000",
    supplyCap: "3000000000",
    collateralFactor: "0.25",
    liquidationThreshold: "0.3",
    reserveFactor: "0.25",
    initialSupply: "134000000",
    vTokenReceiver: treasuries["Tron Ecosystem"],
  },
  vTRX_Tron: {
    borrowCap: "7700000",
    supplyCap: "11000000",
    collateralFactor: "0.25",
    liquidationThreshold: "0.3",
    reserveFactor: "0.25",
    initialSupply: "129000",
    vTokenReceiver: treasuries["Tron Ecosystem"],
  },
  vUSDT_Tron: {
    borrowCap: "14880000",
    supplyCap: "18600000",
    collateralFactor: "0.8",
    liquidationThreshold: "0.88",
    reserveFactor: "0.1",
    initialSupply: "10000",
    vTokenReceiver: treasuries["Venus Treasury"],
  },
  vUSDD_Tron: {
    borrowCap: "1600000",
    supplyCap: "2000000",
    collateralFactor: "0.65",
    liquidationThreshold: "0.7",
    reserveFactor: "0.1",
    initialSupply: "20000",
    vTokenReceiver: treasuries["Tron Ecosystem"],
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
    vTokens: ["vUSDT_DeFi", "vUSDD_DeFi", "vUSDT_GameFi", "vUSDD_GameFi", "vUSDT_Tron", "vUSDD_Tron"],
    kink: "0.6",
    base: "0.03",
    multiplier: "0.1",
    jump: "2.5",
  },
];

forking(29562000, () => {
  let poolRegistry: Contract;

  before(async () => {
    poolRegistry = await ethers.getContractAt(POOL_REGISTRY_ABI, POOL_REGISTRY);
    for (const [symbol, feed] of Object.entries(chainlinkFeeds) as [UnderlyingSymbol, string][]) {
      await setMaxStalePeriodInChainlinkOracle(CHAINLINK_ORACLE, tokens[symbol], feed, NORMAL_TIMELOCK);
    }
    for (const symbol of binanceFeeds) {
      await setMaxStalePeriodInBinanceOracle(BINANCE_ORACLE, symbol);
    }
    const admin = await initMainnetUser("0x1C2CAc6ec528c20800B2fe734820D87b581eAA6B", parseEther("1"));
    const governorAbi = ["function _setProposalMaxOperations(uint256) external"];
    const governor = await ethers.getContractAt(governorAbi, "0x2d56dC077072B53571b8252008C60e945108c75a");
    await governor.connect(admin)._setProposalMaxOperations(200);
  });

  describe("Contracts setup", () => {
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
      checkVToken(address, vTokenState[symbol]);
    }
  });

  testVip("VIP-136 IL phase 2", vip136());

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
        expect(poolVTokens).to.have.lengthOf(4);
        expect(poolVTokens).to.include(vTokens.vBNBx_LiquidStakedBNB);
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
      it("should accept ownerdship over Stablecoins SwapRouter", async () => {
        const swapRouter = await ethers.getContractAt(SWAP_ROUTER_ABI, SWAP_ROUTER_STABLECOINS);
        expect(await swapRouter.owner()).to.equal(NORMAL_TIMELOCK);
      });

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
