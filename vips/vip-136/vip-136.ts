import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const ANY_TARGET_CONTRACT = "0x0000000000000000000000000000000000000000";

const ACCESS_CONTROL_MANAGER = "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const FAST_TRACK_TIMELOCK = "0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02";
const CRITICAL_TIMELOCK = "0x213c446ec11e45b15a6E29C1C1b402B8897f606d";

const RESILIENT_ORACLE = "0x6592b5DE802159F3E74B2486b091D11a8256ab8A";
const POOL_REGISTRY = "0x9F7b01A536aFA00EF10310A162877fd792cD0666";
const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";

const COMPTROLLER_DEFI = "0x3344417c9360b963ca93A4e8305361AEde340Ab9";
const COMPTROLLER_GAMEFI = "0x1b43ea8622e76627B81665B1eCeBB4867566B963";
const COMPTROLLER_LIQUID_STAKED_BNB = "0xd933909A4a2b7A4638903028f44D1d38ce27c352";
const COMPTROLLER_TRON = "0x23b4404E4E5eC5FF5a6FFb70B7d14E3FabF237B0";

const SWAP_ROUTER_STABLECOINS = "0xBBd8E2b5d69fcE9Aaa599c50F0f0960AA58B32aA";
const SWAP_ROUTER_DEFI = "0x47bEe99BD8Cf5D8d7e815e2D2a3E2985CBCcC04b";
const SWAP_ROUTER_GAMEFI = "0x9B15462a79D0948BdDF679E0E5a9841C44aAFB7A";
const SWAP_ROUTER_LIQUID_STAKED_BNB = "0x5f0ce69Aa564468492e860e8083BB001e4eb8d56";
const SWAP_ROUTER_TRON = "0xacD270Ed7DFd4466Bd931d84fe5B904080E28Bfc";

const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
const USDT = "0x55d398326f99059fF775485246999027B3197955";
const USDD = "0xd17479997F34dd9156Deef8F95A52D81D265be9c";

const commands = [
  {
    target: ACCESS_CONTROL_MANAGER,
    signature: "giveCallPermission(address,string,address)",
    params: [ANY_TARGET_CONTRACT, "setReserveFactor(uint256)", FAST_TRACK_TIMELOCK],
  },
  {
    target: ACCESS_CONTROL_MANAGER,
    signature: "giveCallPermission(address,string,address)",
    params: [ANY_TARGET_CONTRACT, "setInterestRateModel(address)", FAST_TRACK_TIMELOCK],
  },
  {
    target: ACCESS_CONTROL_MANAGER,
    signature: "giveCallPermission(address,string,address)",
    params: [ANY_TARGET_CONTRACT, "updateJumpRateModel(uint256,uint256,uint256,uint256)", FAST_TRACK_TIMELOCK],
  },
  {
    target: ACCESS_CONTROL_MANAGER,
    signature: "giveCallPermission(address,string,address)",
    params: [ANY_TARGET_CONTRACT, "setReserveFactor(uint256)", CRITICAL_TIMELOCK],
  },
  {
    target: ACCESS_CONTROL_MANAGER,
    signature: "giveCallPermission(address,string,address)",
    params: [ANY_TARGET_CONTRACT, "setInterestRateModel(address)", CRITICAL_TIMELOCK],
  },
  {
    target: ACCESS_CONTROL_MANAGER,
    signature: "giveCallPermission(address,string,address)",
    params: [ANY_TARGET_CONTRACT, "updateJumpRateModel(uint256,uint256,uint256,uint256)", CRITICAL_TIMELOCK],
  },
  {
    target: SWAP_ROUTER_STABLECOINS,
    signature: "acceptOwnership()",
    params: [],
    value: "0",
  },
  {
    target: COMPTROLLER_DEFI,
    signature: "acceptOwnership()",
    params: [],
    value: "0",
  },
  {
    target: COMPTROLLER_DEFI,
    signature: "setPriceOracle(address)",
    params: [RESILIENT_ORACLE],
    value: "0",
  },
  {
    target: POOL_REGISTRY,
    signature: "addPool(string,address,uint256,uint256,uint256)",
    params: ["DeFi", COMPTROLLER_DEFI, "500000000000000000", "1100000000000000000", "100000000000000000000"],
    value: "0",
  },
  {
    target: SWAP_ROUTER_DEFI,
    signature: "acceptOwnership()",
    params: [],
    value: "0",
  },
  {
    target: COMPTROLLER_GAMEFI,
    signature: "acceptOwnership()",
    params: [],
    value: "0",
  },
  {
    target: COMPTROLLER_GAMEFI,
    signature: "setPriceOracle(address)",
    params: [RESILIENT_ORACLE],
    value: "0",
  },
  {
    target: POOL_REGISTRY,
    signature: "addPool(string,address,uint256,uint256,uint256)",
    params: ["GameFi", COMPTROLLER_GAMEFI, "500000000000000000", "1100000000000000000", "100000000000000000000"],
    value: "0",
  },
  {
    target: SWAP_ROUTER_GAMEFI,
    signature: "acceptOwnership()",
    params: [],
    value: "0",
  },
  {
    target: COMPTROLLER_LIQUID_STAKED_BNB,
    signature: "acceptOwnership()",
    params: [],
    value: "0",
  },
  {
    target: COMPTROLLER_LIQUID_STAKED_BNB,
    signature: "setPriceOracle(address)",
    params: [RESILIENT_ORACLE],
    value: "0",
  },
  {
    target: POOL_REGISTRY,
    signature: "addPool(string,address,uint256,uint256,uint256)",
    params: [
      "Liquid Staked BNB",
      COMPTROLLER_LIQUID_STAKED_BNB,
      "500000000000000000",
      "1100000000000000000",
      "100000000000000000000",
    ],
    value: "0",
  },
  {
    target: SWAP_ROUTER_LIQUID_STAKED_BNB,
    signature: "acceptOwnership()",
    params: [],
    value: "0",
  },
  {
    target: COMPTROLLER_TRON,
    signature: "acceptOwnership()",
    params: [],
    value: "0",
  },
  {
    target: COMPTROLLER_TRON,
    signature: "setPriceOracle(address)",
    params: [RESILIENT_ORACLE],
    value: "0",
  },
  {
    target: POOL_REGISTRY,
    signature: "addPool(string,address,uint256,uint256,uint256)",
    params: ["Tron", COMPTROLLER_TRON, "500000000000000000", "1100000000000000000", "100000000000000000000"],
    value: "0",
  },
  {
    target: SWAP_ROUTER_TRON,
    signature: "acceptOwnership()",
    params: [],
    value: "0",
  },
  {
    target: TREASURY,
    signature: "withdrawTreasuryBEP20(address,uint256,address)",
    params: ["0xCa3F508B8e4Dd382eE878A314789373D80A5190A", "50000000000000000000", NORMAL_TIMELOCK],
    value: "0",
  },
  {
    target: "0xCa3F508B8e4Dd382eE878A314789373D80A5190A",
    signature: "approve(address,uint256)",
    params: [POOL_REGISTRY, 0],
    value: "0",
  },
  {
    target: "0xCa3F508B8e4Dd382eE878A314789373D80A5190A",
    signature: "approve(address,uint256)",
    params: [POOL_REGISTRY, "50000000000000000000"],
    value: "0",
  },
  {
    target: POOL_REGISTRY,
    signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
    params: [
      [
        "0xC718c51958d3fd44f5F9580c9fFAC2F89815C909",
        "250000000000000000",
        "300000000000000000",
        "50000000000000000000",
        "0x7C780b8A63eE9B7d0F985E8a922Be38a1F7B2141",
        "379000000000000000000",
        "266000000000000000000",
      ],
    ],
    value: "0",
  },
  {
    target: TREASURY,
    signature: "withdrawTreasuryBEP20(address,uint256,address)",
    params: ["0x965f527d9159dce6288a2219db51fc6eef120dd1", "475750000000000000000000", NORMAL_TIMELOCK],
    value: "0",
  },
  {
    target: "0x965f527d9159dce6288a2219db51fc6eef120dd1",
    signature: "approve(address,uint256)",
    params: [POOL_REGISTRY, 0],
    value: "0",
  },
  {
    target: "0x965f527d9159dce6288a2219db51fc6eef120dd1",
    signature: "approve(address,uint256)",
    params: [POOL_REGISTRY, "475750000000000000000000"],
    value: "0",
  },
  {
    target: POOL_REGISTRY,
    signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
    params: [
      [
        "0x8f657dFD3a1354DEB4545765fE6840cc54AFd379",
        "250000000000000000",
        "300000000000000000",
        "475750000000000000000000",
        "0x109E8083a64c7DedE513e8b580c5b08B96f9cE73",
        "15000000000000000000000000",
        "10500000000000000000000000",
      ],
    ],
    value: "0",
  },
  {
    target: TREASURY,
    signature: "withdrawTreasuryBEP20(address,uint256,address)",
    params: ["0x8f0528ce5ef7b51152a59745befdd91d97091d2f", "5189000000000000000000", NORMAL_TIMELOCK],
    value: "0",
  },
  {
    target: "0x8f0528ce5ef7b51152a59745befdd91d97091d2f",
    signature: "approve(address,uint256)",
    params: [POOL_REGISTRY, 0],
    value: "0",
  },
  {
    target: "0x8f0528ce5ef7b51152a59745befdd91d97091d2f",
    signature: "approve(address,uint256)",
    params: [POOL_REGISTRY, "5189000000000000000000"],
    value: "0",
  },
  {
    target: POOL_REGISTRY,
    signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
    params: [
      [
        "0x02c5Fb0F26761093D297165e902e96D08576D344",
        "250000000000000000",
        "300000000000000000",
        "5189000000000000000000",
        "0xAD9CADe20100B8b945da48e1bCbd805C38d8bE77",
        "2500000000000000000000000",
        "1750000000000000000000000",
      ],
    ],
    value: "0",
  },
  {
    target: TREASURY,
    signature: "withdrawTreasuryBEP20(address,uint256,address)",
    params: [USDT, "30000000000000000000000", NORMAL_TIMELOCK],
    value: "0",
  },
  {
    target: USDT,
    signature: "approve(address,uint256)",
    params: [POOL_REGISTRY, 0],
    value: "0",
  },
  {
    target: USDT,
    signature: "approve(address,uint256)",
    params: [POOL_REGISTRY, "30000000000000000000000"],
    value: "0",
  },
  {
    target: POOL_REGISTRY,
    signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
    params: [
      [
        "0x1D8bBDE12B6b34140604E18e9f9c6e14deC16854",
        "800000000000000000",
        "880000000000000000",
        "10000000000000000000000",
        TREASURY,
        "18600000000000000000000000",
        "14880000000000000000000000",
      ],
    ],
    value: "0",
  },
  {
    target: TREASURY,
    signature: "withdrawTreasuryBEP20(address,uint256,address)",
    params: [USDD, "40000000000000000000000", NORMAL_TIMELOCK],
    value: "0",
  },
  {
    target: USDD,
    signature: "approve(address,uint256)",
    params: [POOL_REGISTRY, 0],
    value: "0",
  },
  {
    target: USDD,
    signature: "approve(address,uint256)",
    params: [POOL_REGISTRY, "40000000000000000000000"],
    value: "0",
  },

  {
    target: POOL_REGISTRY,
    signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
    params: [
      [
        "0xA615467caE6B9E0bb98BC04B4411d9296fd1dFa0",
        "650000000000000000",
        "700000000000000000",
        "10000000000000000000000",
        "0x3DdfA8eC3052539b6C9549F12cEA2C295cfF5296",
        "2000000000000000000000000",
        "1600000000000000000000000",
      ],
    ],
    value: "0",
  },
  {
    target: TREASURY,
    signature: "withdrawTreasuryBEP20(address,uint256,address)",
    params: ["0xf307910A4c7bbc79691fD374889b36d8531B08e3", "500000000000000000000000", NORMAL_TIMELOCK],
    value: "0",
  },
  {
    target: "0xf307910A4c7bbc79691fD374889b36d8531B08e3",
    signature: "approve(address,uint256)",
    params: [POOL_REGISTRY, 0],
    value: "0",
  },
  {
    target: "0xf307910A4c7bbc79691fD374889b36d8531B08e3",
    signature: "approve(address,uint256)",
    params: [POOL_REGISTRY, "500000000000000000000000"],
    value: "0",
  },
  {
    target: POOL_REGISTRY,
    signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
    params: [
      [
        "0x19CE11C8817a1828D1d357DFBF62dCf5b0B2A362",
        "250000000000000000",
        "300000000000000000",
        "500000000000000000000000",
        "0xAE1c38847Fb90A13a2a1D7E5552cCD80c62C6508",
        "9508802000000000000000000",
        "6656161000000000000000000",
      ],
    ],
    value: "0",
  },
  {
    target: TREASURY,
    signature: "withdrawTreasuryBEP20(address,uint256,address)",
    params: ["0x12BB890508c125661E03b09EC06E404bc9289040", "175000000000000000000000000", NORMAL_TIMELOCK],
    value: "0",
  },
  {
    target: "0x12BB890508c125661E03b09EC06E404bc9289040",
    signature: "approve(address,uint256)",
    params: [POOL_REGISTRY, 0],
    value: "0",
  },
  {
    target: "0x12BB890508c125661E03b09EC06E404bc9289040",
    signature: "approve(address,uint256)",
    params: [POOL_REGISTRY, "175000000000000000000000000"],
    value: "0",
  },
  {
    target: POOL_REGISTRY,
    signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
    params: [
      [
        "0xE5FE5527A5b76C75eedE77FdFA6B80D52444A465",
        "250000000000000000",
        "300000000000000000",
        "175000000000000000000000000",
        "0x6Ee74536B3Ff10Ff639aa781B7220121287F6Fa5",
        "4000000000000000000000000000",
        "2800000000000000000000000000",
      ],
    ],
    value: "0",
  },
  {
    target: TREASURY,
    signature: "withdrawTreasuryBEP20(address,uint256,address)",
    params: ["0xfb5B838b6cfEEdC2873aB27866079AC55363D37E", "1512860000000000000", NORMAL_TIMELOCK],
    value: "0",
  },
  {
    target: "0xfb5B838b6cfEEdC2873aB27866079AC55363D37E",
    signature: "approve(address,uint256)",
    params: [POOL_REGISTRY, 0],
    value: "0",
  },
  {
    target: "0xfb5B838b6cfEEdC2873aB27866079AC55363D37E",
    signature: "approve(address,uint256)",
    params: [POOL_REGISTRY, "1512860000000000000"],
    value: "0",
  },
  {
    target: POOL_REGISTRY,
    signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
    params: [
      [
        "0xc353B7a1E13dDba393B5E120D4169Da7185aA2cb",
        "250000000000000000",
        "300000000000000000",
        "1512860000000000000",
        "0x17e98a24f992BB7bcd62d6722d714A3C74814B94",
        "40000000000000000000",
        "28000000000000000000",
      ],
    ],
    value: "0",
  },
  {
    target: POOL_REGISTRY,
    signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
    params: [
      [
        "0x4978591f17670A846137d9d613e333C38dc68A37",
        "800000000000000000",
        "880000000000000000",
        "10000000000000000000000",
        TREASURY,
        "18600000000000000000000000",
        "14880000000000000000000000",
      ],
    ],
    value: "0",
  },
  {
    target: POOL_REGISTRY,
    signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
    params: [
      [
        "0x9f2FD23bd0A5E08C5f2b9DD6CF9C96Bfb5fA515C",
        "650000000000000000",
        "700000000000000000",
        "10000000000000000000000",
        "0x3DdfA8eC3052539b6C9549F12cEA2C295cfF5296",
        "2000000000000000000000000",
        "1600000000000000000000000",
      ],
    ],
    value: "0",
  },
  {
    target: TREASURY,
    signature: "withdrawTreasuryBEP20(address,uint256,address)",
    params: ["0x52F24a5e03aee338Da5fd9Df68D2b6FAe1178827", "40000000000000000000", NORMAL_TIMELOCK],
    value: "0",
  },
  {
    target: "0x52F24a5e03aee338Da5fd9Df68D2b6FAe1178827",
    signature: "approve(address,uint256)",
    params: [POOL_REGISTRY, 0],
    value: "0",
  },
  {
    target: "0x52F24a5e03aee338Da5fd9Df68D2b6FAe1178827",
    signature: "approve(address,uint256)",
    params: [POOL_REGISTRY, "40000000000000000000"],
    value: "0",
  },
  {
    target: POOL_REGISTRY,
    signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
    params: [
      [
        "0xBfe25459BA784e70E2D7a718Be99a1f3521cA17f",
        "350000000000000000",
        "400000000000000000",
        "40000000000000000000",
        "0xAE1c38847Fb90A13a2a1D7E5552cCD80c62C6508",
        "8000000000000000000000",
        "5600000000000000000000",
      ],
    ],
    value: "0",
  },
  {
    target: TREASURY,
    signature: "withdrawTreasuryBEP20(address,uint256,address)",
    params: ["0x1bdd3cf7f79cfb8edbb955f20ad99211551ba275", "39360000000000000000", NORMAL_TIMELOCK],
    value: "0",
  },
  {
    target: "0x1bdd3cf7f79cfb8edbb955f20ad99211551ba275",
    signature: "approve(address,uint256)",
    params: [POOL_REGISTRY, 0],
    value: "0",
  },
  {
    target: "0x1bdd3cf7f79cfb8edbb955f20ad99211551ba275",
    signature: "approve(address,uint256)",
    params: [POOL_REGISTRY, "39360000000000000000"],
    value: "0",
  },
  {
    target: POOL_REGISTRY,
    signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
    params: [
      [
        "0x5E21bF67a6af41c74C1773E4b473ca5ce8fd3791",
        "350000000000000000",
        "400000000000000000",
        "39360000000000000000",
        "0xF0348E1748FCD45020151C097D234DbbD5730BE7",
        "1818000000000000000000",
        "1272000000000000000000",
      ],
    ],
    value: "0",
  },
  {
    target: TREASURY,
    signature: "withdrawTreasuryBEP20(address,uint256,address)",
    params: ["0xc2E9d07F66A89c44062459A47a0D2Dc038E4fb16", "40000000000000000000", NORMAL_TIMELOCK],
    value: "0",
  },
  {
    target: "0xc2E9d07F66A89c44062459A47a0D2Dc038E4fb16",
    signature: "approve(address,uint256)",
    params: [POOL_REGISTRY, 0],
    value: "0",
  },
  {
    target: "0xc2E9d07F66A89c44062459A47a0D2Dc038E4fb16",
    signature: "approve(address,uint256)",
    params: [POOL_REGISTRY, "40000000000000000000"],
    value: "0",
  },
  {
    target: POOL_REGISTRY,
    signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
    params: [
      [
        "0xcc5D9e502574cda17215E70bC0B4546663785227",
        "350000000000000000",
        "400000000000000000",
        "40000000000000000000",
        "0xccc022502d6c65e1166fd34147040f05880f7972",
        "540000000000000000000",
        "378000000000000000000",
      ],
    ],
    value: "0",
  },
  {
    target: TREASURY,
    signature: "withdrawTreasuryBNB(uint256,address)",
    params: ["35000000000000000000", NORMAL_TIMELOCK],
    value: "0",
  },
  {
    target: WBNB,
    signature: "deposit()",
    params: [],
    value: "35000000000000000000",
  },
  {
    target: WBNB,
    signature: "approve(address,uint256)",
    params: [POOL_REGISTRY, 0],
    value: "0",
  },
  {
    target: WBNB,
    signature: "approve(address,uint256)",
    params: [POOL_REGISTRY, "35000000000000000000"],
    value: "0",
  },
  {
    target: POOL_REGISTRY,
    signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
    params: [
      [
        "0xe10E80B7FD3a29fE46E16C30CC8F4dd938B742e2",
        "450000000000000000",
        "500000000000000000",
        "35000000000000000000",
        TREASURY,
        "80000000000000000000000",
        "56000000000000000000000",
      ],
    ],
    value: "0",
  },
  {
    target: TREASURY,
    signature: "withdrawTreasuryBEP20(address,uint256,address)",
    params: ["0x352Cb5E19b12FC216548a2677bD0fce83BaE434B", "16753000000000000000000000000", NORMAL_TIMELOCK],
    value: "0",
  },
  {
    target: "0x352Cb5E19b12FC216548a2677bD0fce83BaE434B",
    signature: "approve(address,uint256)",
    params: [POOL_REGISTRY, 0],
    value: "0",
  },
  {
    target: "0x352Cb5E19b12FC216548a2677bD0fce83BaE434B",
    signature: "approve(address,uint256)",
    params: [POOL_REGISTRY, "16753000000000000000000000000"],
    value: "0",
  },
  {
    target: POOL_REGISTRY,
    signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
    params: [
      [
        "0x49c26e12959345472E2Fd95E5f79F8381058d3Ee",
        "250000000000000000",
        "300000000000000000",
        "16753000000000000000000000000",
        "0x3DdfA8eC3052539b6C9549F12cEA2C295cfF5296",
        "1500000000000000000000000000000",
        "1050000000000000000000000000000",
      ],
    ],
    value: "0",
  },
  {
    target: TREASURY,
    signature: "withdrawTreasuryBEP20(address,uint256,address)",
    params: ["0xaeF0d72a118ce24feE3cD1d43d383897D05B4e99", "134000000000000000000000000", NORMAL_TIMELOCK],
    value: "0",
  },
  {
    target: "0xaeF0d72a118ce24feE3cD1d43d383897D05B4e99",
    signature: "approve(address,uint256)",
    params: [POOL_REGISTRY, 0],
    value: "0",
  },
  {
    target: "0xaeF0d72a118ce24feE3cD1d43d383897D05B4e99",
    signature: "approve(address,uint256)",
    params: [POOL_REGISTRY, "134000000000000000000000000"],
    value: "0",
  },
  {
    target: POOL_REGISTRY,
    signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
    params: [
      [
        "0xb114cfA615c828D88021a41bFc524B800E64a9D5",
        "250000000000000000",
        "300000000000000000",
        "134000000000000000000000000",
        "0x3DdfA8eC3052539b6C9549F12cEA2C295cfF5296",
        "3000000000000000000000000000",
        "2100000000000000000000000000",
      ],
    ],
    value: "0",
  },
  {
    target: TREASURY,
    signature: "withdrawTreasuryBEP20(address,uint256,address)",
    params: ["0xCE7de646e7208a4Ef112cb6ed5038FA6cC6b12e3", "129000000000", NORMAL_TIMELOCK],
    value: "0",
  },
  {
    target: "0xCE7de646e7208a4Ef112cb6ed5038FA6cC6b12e3",
    signature: "approve(address,uint256)",
    params: [POOL_REGISTRY, 0],
    value: "0",
  },
  {
    target: "0xCE7de646e7208a4Ef112cb6ed5038FA6cC6b12e3",
    signature: "approve(address,uint256)",
    params: [POOL_REGISTRY, "129000000000"],
    value: "0",
  },
  {
    target: POOL_REGISTRY,
    signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
    params: [
      [
        "0x836beb2cB723C498136e1119248436A645845F4E",
        "250000000000000000",
        "300000000000000000",
        "129000000000",
        "0x3DdfA8eC3052539b6C9549F12cEA2C295cfF5296",
        "11000000000000",
        "7700000000000",
      ],
    ],
    value: "0",
  },
  {
    target: POOL_REGISTRY,
    signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
    params: [
      [
        "0x281E5378f99A4bc55b295ABc0A3E7eD32Deba059",
        "800000000000000000",
        "880000000000000000",
        "10000000000000000000000",
        TREASURY,
        "18600000000000000000000000",
        "14880000000000000000000000",
      ],
    ],
    value: "0",
  },
  {
    target: POOL_REGISTRY,
    signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
    params: [
      [
        "0xf1da185CCe5BeD1BeBbb3007Ef738Ea4224025F7",
        "650000000000000000",
        "700000000000000000",
        "20000000000000000000000",
        "0x3DdfA8eC3052539b6C9549F12cEA2C295cfF5296",
        "2000000000000000000000000",
        "1600000000000000000000000",
      ],
    ],
    value: "0",
  },
];

export const vip136 = () => {
  const meta = {
    version: "v2",
    title: "Isolated lending, phase 2",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with IL Phase 2",
    againstDescription: "I do not think that Venus Protocol should proceed with IL Phase 2",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with IL Phase 2",
  };

  return makeProposal(commands, meta, ProposalType.REGULAR);
};
