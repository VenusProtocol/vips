import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const ANY_TARGET_CONTRACT = "0x0000000000000000000000000000000000000000";

const ACCESS_CONTROL_MANAGER = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const FAST_TRACK_TIMELOCK = "0x3CFf21b7AF8390fE68799D58727d3b4C25a83cb6";
const CRITICAL_TIMELOCK = "0x23B893a7C45a5Eb8c8C062b9F32d0D2e43eD286D";

const RESILIENT_ORACLE = "0x3cD69251D04A28d887Ac14cbe2E14c52F3D57823";
const POOL_REGISTRY = "0xC85491616Fa949E048F3aAc39fbf5b0703800667";
const TREASURY = "0x8b293600c50d6fbdc6ed4251cc75ece29880276f";

const COMPTROLLER_DEFI = "0x23a73971A6B9f6580c048B9CB188869B2A2aA2aD";
const COMPTROLLER_GAMEFI = "0x1F4f0989C51f12DAcacD4025018176711f3Bf289";
const COMPTROLLER_LIQUID_STAKED_BNB = "0x596B11acAACF03217287939f88d63b51d3771704";
const COMPTROLLER_TRON = "0x11537D023f489E4EF0C7157cc729C7B69CbE0c97";

const SWAP_ROUTER_DEFI = "0x89Bc8dFe0Af08b60ec285071d133FCdfa9B3C08e";
const SWAP_ROUTER_GAMEFI = "0x5D254Bc7c7f2670395B9E0716C21249083D41a4f";
const SWAP_ROUTER_LIQUID_STAKED_BNB = "0xb16792E90d6478DaBbd0144e13f41CeA21ACE116";
const SWAP_ROUTER_TRON = "0x1D8cA5AFB88F07489786A3d2E0FF50F3F9314d97";

const WBNB = "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd";

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
    target: "0x5B662703775171c4212F2FBAdb7F92e64116c154",
    signature: "transferFrom(address,address,uint256)",
    params: ["0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706", NORMAL_TIMELOCK, "50000000000000000000"],
    value: "0",
  },
  {
    target: "0x5B662703775171c4212F2FBAdb7F92e64116c154",
    signature: "approve(address,uint256)",
    params: [POOL_REGISTRY, 0],
    value: "0",
  },
  {
    target: "0x5B662703775171c4212F2FBAdb7F92e64116c154",
    signature: "approve(address,uint256)",
    params: [POOL_REGISTRY, "50000000000000000000"],
    value: "0",
  },
  {
    target: POOL_REGISTRY,
    signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
    params: [
      [
        "0xEF949287834Be010C1A5EDd757c385FB9b644E4A",
        "250000000000000000",
        "300000000000000000",
        "50000000000000000000",
        TREASURY,
        "379000000000000000000",
        "266000000000000000000",
      ],
    ],
    value: "0",
  },
  {
    target: "0x7FCC76fc1F573d8Eb445c236Cc282246bC562bCE",
    signature: "transferFrom(address,address,uint256)",
    params: ["0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706", NORMAL_TIMELOCK, "475750000000000000000000"],
    value: "0",
  },
  {
    target: "0x7FCC76fc1F573d8Eb445c236Cc282246bC562bCE",
    signature: "approve(address,uint256)",
    params: [POOL_REGISTRY, 0],
    value: "0",
  },
  {
    target: "0x7FCC76fc1F573d8Eb445c236Cc282246bC562bCE",
    signature: "approve(address,uint256)",
    params: [POOL_REGISTRY, "475750000000000000000000"],
    value: "0",
  },
  {
    target: POOL_REGISTRY,
    signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
    params: [
      [
        "0x5e68913fbbfb91af30366ab1B21324410b49a308",
        "250000000000000000",
        "300000000000000000",
        "475750000000000000000000",
        TREASURY,
        "15000000000000000000000000",
        "10500000000000000000000000",
      ],
    ],
    value: "0",
  },
  {
    target: "0x6923189d91fdF62dBAe623a55273F1d20306D9f2",
    signature: "transferFrom(address,address,uint256)",
    params: ["0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706", NORMAL_TIMELOCK, "5189000000000000000000"],
    value: "0",
  },
  {
    target: "0x6923189d91fdF62dBAe623a55273F1d20306D9f2",
    signature: "approve(address,uint256)",
    params: [POOL_REGISTRY, 0],
    value: "0",
  },
  {
    target: "0x6923189d91fdF62dBAe623a55273F1d20306D9f2",
    signature: "approve(address,uint256)",
    params: [POOL_REGISTRY, "5189000000000000000000"],
    value: "0",
  },
  {
    target: POOL_REGISTRY,
    signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
    params: [
      [
        "0xb7caC5Ef82cb7f9197ee184779bdc52c5490C02a",
        "250000000000000000",
        "300000000000000000",
        "5189000000000000000000",
        TREASURY,
        "2500000000000000000000000",
        "1750000000000000000000000",
      ],
    ],
    value: "0",
  },
  {
    target: "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c",
    signature: "transferFrom(address,address,uint256)",
    params: ["0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706", NORMAL_TIMELOCK, "40000000000"],
    value: "0",
  },
  {
    target: "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c",
    signature: "approve(address,uint256)",
    params: [POOL_REGISTRY, 0],
    value: "0",
  },
  {
    target: "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c",
    signature: "approve(address,uint256)",
    params: [POOL_REGISTRY, "40000000000"],
    value: "0",
  },
  {
    target: POOL_REGISTRY,
    signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
    params: [
      [
        "0x80CC30811e362aC9aB857C3d7875CbcCc0b65750",
        "800000000000000000",
        "880000000000000000",
        "10000000000",
        TREASURY,
        "18600000000000",
        "14880000000000",
      ],
    ],
    value: "0",
  },
  {
    target: "0x2E2466e22FcbE0732Be385ee2FBb9C59a1098382",
    signature: "transferFrom(address,address,uint256)",
    params: ["0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706", NORMAL_TIMELOCK, "40000000000000000000000"],
    value: "0",
  },
  {
    target: "0x2E2466e22FcbE0732Be385ee2FBb9C59a1098382",
    signature: "approve(address,uint256)",
    params: [POOL_REGISTRY, 0],
    value: "0",
  },
  {
    target: "0x2E2466e22FcbE0732Be385ee2FBb9C59a1098382",
    signature: "approve(address,uint256)",
    params: [POOL_REGISTRY, "40000000000000000000000"],
    value: "0",
  },
  {
    target: POOL_REGISTRY,
    signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
    params: [
      [
        "0xa109DE0abaeefC521Ec29D89eA42E64F37A6882E",
        "650000000000000000",
        "700000000000000000",
        "10000000000000000000000",
        TREASURY,
        "2000000000000000000000000",
        "1600000000000000000000000",
      ],
    ],
    value: "0",
  },
  {
    target: "0xe4a90EB942CF2DA7238e8F6cC9EF510c49FC8B4B",
    signature: "transferFrom(address,address,uint256)",
    params: ["0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706", NORMAL_TIMELOCK, "500000000000000000000000"],
    value: "0",
  },
  {
    target: "0xe4a90EB942CF2DA7238e8F6cC9EF510c49FC8B4B",
    signature: "approve(address,uint256)",
    params: [POOL_REGISTRY, 0],
    value: "0",
  },
  {
    target: "0xe4a90EB942CF2DA7238e8F6cC9EF510c49FC8B4B",
    signature: "approve(address,uint256)",
    params: [POOL_REGISTRY, "500000000000000000000000"],
    value: "0",
  },
  {
    target: POOL_REGISTRY,
    signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
    params: [
      [
        "0xb677e080148368EeeE70fA3865d07E92c6500174",
        "250000000000000000",
        "300000000000000000",
        "500000000000000000000000",
        TREASURY,
        "9508802000000000000000000",
        "6656161000000000000000000",
      ],
    ],
    value: "0",
  },
  {
    target: "0xD60cC803d888A3e743F21D0bdE4bF2cAfdEA1F26",
    signature: "transferFrom(address,address,uint256)",
    params: ["0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706", NORMAL_TIMELOCK, "175000000000000000000000000"],
    value: "0",
  },
  {
    target: "0xD60cC803d888A3e743F21D0bdE4bF2cAfdEA1F26",
    signature: "approve(address,uint256)",
    params: [POOL_REGISTRY, 0],
    value: "0",
  },
  {
    target: "0xD60cC803d888A3e743F21D0bdE4bF2cAfdEA1F26",
    signature: "approve(address,uint256)",
    params: [POOL_REGISTRY, "175000000000000000000000000"],
    value: "0",
  },
  {
    target: POOL_REGISTRY,
    signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
    params: [
      [
        "0x1958035231E125830bA5d17D168cEa07Bb42184a",
        "250000000000000000",
        "300000000000000000",
        "175000000000000000000000000",
        TREASURY,
        "4000000000000000000000000000",
        "2800000000000000000000000000",
      ],
    ],
    value: "0",
  },
  {
    target: "0xb22cF15FBc089d470f8e532aeAd2baB76bE87c88",
    signature: "transferFrom(address,address,uint256)",
    params: ["0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706", NORMAL_TIMELOCK, "1512860000000000000000000000"],
    value: "0",
  },
  {
    target: "0xb22cF15FBc089d470f8e532aeAd2baB76bE87c88",
    signature: "approve(address,uint256)",
    params: [POOL_REGISTRY, 0],
    value: "0",
  },
  {
    target: "0xb22cF15FBc089d470f8e532aeAd2baB76bE87c88",
    signature: "approve(address,uint256)",
    params: [POOL_REGISTRY, "1512860000000000000000000000"],
    value: "0",
  },
  {
    target: POOL_REGISTRY,
    signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
    params: [
      [
        "0xef470AbC365F88e4582D8027172a392C473A5B53",
        "250000000000000000",
        "300000000000000000",
        "1512860000000000000000000000",
        TREASURY,
        "40000000000000000000000000000",
        "28000000000000000000000000000",
      ],
    ],
    value: "0",
  },
  {
    target: POOL_REGISTRY,
    signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
    params: [
      [
        "0x0bFE4e0B8A2a096A27e5B18b078d25be57C08634",
        "800000000000000000",
        "880000000000000000",
        "10000000000",
        TREASURY,
        "18600000000000",
        "14880000000000",
      ],
    ],
    value: "0",
  },
  {
    target: POOL_REGISTRY,
    signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
    params: [
      [
        "0xdeDf3B2bcF25d0023115fd71a0F8221C91C92B1a",
        "650000000000000000",
        "700000000000000000",
        "10000000000000000000000",
        TREASURY,
        "2000000000000000000000000",
        "1600000000000000000000000",
      ],
    ],
    value: "0",
  },
  {
    target: "0x167F1F9EF531b3576201aa3146b13c57dbEda514",
    signature: "transferFrom(address,address,uint256)",
    params: ["0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706", NORMAL_TIMELOCK, "40000000000000000000"],
    value: "0",
  },
  {
    target: "0x167F1F9EF531b3576201aa3146b13c57dbEda514",
    signature: "approve(address,uint256)",
    params: [POOL_REGISTRY, 0],
    value: "0",
  },
  {
    target: "0x167F1F9EF531b3576201aa3146b13c57dbEda514",
    signature: "approve(address,uint256)",
    params: [POOL_REGISTRY, "40000000000000000000"],
    value: "0",
  },
  {
    target: POOL_REGISTRY,
    signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
    params: [
      [
        "0x57a664Dd7f1dE19545fEE9c86C949e3BF43d6D47",
        "350000000000000000",
        "400000000000000000",
        "40000000000000000000",
        TREASURY,
        "8000000000000000000000",
        "5600000000000000000000",
      ],
    ],
    value: "0",
  },
  {
    target: "0x327d6E6FAC0228070884e913263CFF9eFed4a2C8",
    signature: "transferFrom(address,address,uint256)",
    params: ["0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706", NORMAL_TIMELOCK, "39360000000000000000"],
    value: "0",
  },
  {
    target: "0x327d6E6FAC0228070884e913263CFF9eFed4a2C8",
    signature: "approve(address,uint256)",
    params: [POOL_REGISTRY, 0],
    value: "0",
  },
  {
    target: "0x327d6E6FAC0228070884e913263CFF9eFed4a2C8",
    signature: "approve(address,uint256)",
    params: [POOL_REGISTRY, "39360000000000000000"],
    value: "0",
  },
  {
    target: POOL_REGISTRY,
    signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
    params: [
      [
        "0x644A149853E5507AdF3e682218b8AC86cdD62951",
        "350000000000000000",
        "400000000000000000",
        "39360000000000000000",
        TREASURY,
        "1818000000000000000000",
        "1272000000000000000000",
      ],
    ],
    value: "0",
  },
  {
    target: "0x2999C176eBf66ecda3a646E70CeB5FF4d5fCFb8C",
    signature: "transferFrom(address,address,uint256)",
    params: ["0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706", NORMAL_TIMELOCK, "40000000000000000000"],
    value: "0",
  },
  {
    target: "0x2999C176eBf66ecda3a646E70CeB5FF4d5fCFb8C",
    signature: "approve(address,uint256)",
    params: [POOL_REGISTRY, 0],
    value: "0",
  },
  {
    target: "0x2999C176eBf66ecda3a646E70CeB5FF4d5fCFb8C",
    signature: "approve(address,uint256)",
    params: [POOL_REGISTRY, "40000000000000000000"],
    value: "0",
  },
  {
    target: POOL_REGISTRY,
    signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
    params: [
      [
        "0x75aa42c832a8911B77219DbeBABBB40040d16987",
        "350000000000000000",
        "400000000000000000",
        "40000000000000000000",
        TREASURY,
        "540000000000000000000",
        "378000000000000000000",
      ],
    ],
    value: "0",
  },
  {
    target: WBNB,
    signature: "deposit()",
    params: [],
    value: "100000000000000000",
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
    params: [POOL_REGISTRY, "100000000000000000"],
    value: "0",
  },
  {
    target: POOL_REGISTRY,
    signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
    params: [
      [
        "0x231dED0Dfc99634e52EE1a1329586bc970d773b3",
        "450000000000000000",
        "500000000000000000",
        "100000000000000000",
        TREASURY,
        "80000000000000000000000",
        "56000000000000000000000",
      ],
    ],
    value: "0",
  },
  {
    target: POOL_REGISTRY,
    signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
    params: [
      [
        "0x2197d02cC9cd1ad51317A0a85A656a0c82383A7c",
        "800000000000000000",
        "880000000000000000",
        "10000000000",
        TREASURY,
        "18600000000000",
        "14880000000000",
      ],
    ],
    value: "0",
  },
  {
    target: POOL_REGISTRY,
    signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
    params: [
      [
        "0xD5b20708d8f0FcA52cb609938D0594C4e32E5DaD",
        "650000000000000000",
        "700000000000000000",
        "10000000000000000000000",
        TREASURY,
        "2000000000000000000000000",
        "1600000000000000000000000",
      ],
    ],
    value: "0",
  },
  {
    target: "0xE98344A7c691B200EF47c9b8829110087D832C64",
    signature: "transferFrom(address,address,uint256)",
    params: ["0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706", NORMAL_TIMELOCK, "16753000000000000000000000000"],
    value: "0",
  },
  {
    target: "0xE98344A7c691B200EF47c9b8829110087D832C64",
    signature: "approve(address,uint256)",
    params: [POOL_REGISTRY, 0],
    value: "0",
  },
  {
    target: "0xE98344A7c691B200EF47c9b8829110087D832C64",
    signature: "approve(address,uint256)",
    params: [POOL_REGISTRY, "16753000000000000000000000000"],
    value: "0",
  },
  {
    target: POOL_REGISTRY,
    signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
    params: [
      [
        "0x47793540757c6E6D84155B33cd8D9535CFdb9334",
        "250000000000000000",
        "300000000000000000",
        "16753000000000000000000000000",
        TREASURY,
        "1500000000000000000000000000000",
        "1050000000000000000000000000000",
      ],
    ],
    value: "0",
  },
  {
    target: "0x2E6Af3f3F059F43D764060968658c9F3c8f9479D",
    signature: "transferFrom(address,address,uint256)",
    params: ["0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706", NORMAL_TIMELOCK, "134000000000000000000000000"],
    value: "0",
  },
  {
    target: "0x2E6Af3f3F059F43D764060968658c9F3c8f9479D",
    signature: "approve(address,uint256)",
    params: [POOL_REGISTRY, 0],
    value: "0",
  },
  {
    target: "0x2E6Af3f3F059F43D764060968658c9F3c8f9479D",
    signature: "approve(address,uint256)",
    params: [POOL_REGISTRY, "134000000000000000000000000"],
    value: "0",
  },
  {
    target: POOL_REGISTRY,
    signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
    params: [
      [
        "0xEe543D5de2Dbb5b07675Fc72831A2f1812428393",
        "250000000000000000",
        "300000000000000000",
        "134000000000000000000000000",
        TREASURY,
        "3000000000000000000000000000",
        "2100000000000000000000000000",
      ],
    ],
    value: "0",
  },
  {
    target: "0x7D21841DC10BA1C5797951EFc62fADBBDD06704B",
    signature: "transferFrom(address,address,uint256)",
    params: ["0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706", NORMAL_TIMELOCK, "129000000000"],
    value: "0",
  },
  {
    target: "0x7D21841DC10BA1C5797951EFc62fADBBDD06704B",
    signature: "approve(address,uint256)",
    params: [POOL_REGISTRY, 0],
    value: "0",
  },
  {
    target: "0x7D21841DC10BA1C5797951EFc62fADBBDD06704B",
    signature: "approve(address,uint256)",
    params: [POOL_REGISTRY, "129000000000"],
    value: "0",
  },
  {
    target: POOL_REGISTRY,
    signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
    params: [
      [
        "0x410286c43a525E1DCC7468a9B091C111C8324cd1",
        "250000000000000000",
        "300000000000000000",
        "129000000000",
        TREASURY,
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
        "0x712774CBFFCBD60e9825871CcEFF2F917442b2c3",
        "800000000000000000",
        "880000000000000000",
        "10000000000",
        TREASURY,
        "18600000000000",
        "14880000000000",
      ],
    ],
    value: "0",
  },
  {
    target: POOL_REGISTRY,
    signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
    params: [
      [
        "0xD804F74fe21290d213c46610ab171f7c2EeEBDE7",
        "650000000000000000",
        "700000000000000000",
        "10000000000000000000000",
        TREASURY,
        "2000000000000000000000000",
        "1600000000000000000000000",
      ],
    ],
    value: "0",
  },
  {
    target: "0xb0269d68CfdCc30Cb7Cd2E0b52b08Fa7Ffd3079b",
    signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
    params: [["0x170d3b2da05cc2124334240fB34ad1359e34C562"], ["1736111111111111"], ["1736111111111111"]],
    value: "0",
  },
];

export const vip136Testnet = () => {
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
