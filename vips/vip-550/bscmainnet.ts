import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { cutParams as params } from "../../simulations/vip-550/utils/bscmainnet-cut-params.json";

const { bscmainnet } = NETWORK_ADDRESSES;

export const UNITROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const VAI_UNITROLLER = "0x004065D34C6b18cE4370ced1CeBDE94865DbFAFE";
export const LIQUIDATOR = "0x0870793286aaDA55D39CE7f82fb2766e8004cF43";
export const ACM = "0x4788629abc6cfca10f9f969efdeaa1cf70c23555";
export const LIQUIDATOR_PROXY_ADMIN = "0x2b40B43AC5F7949905b0d2Ed9D6154a8ce06084a";
export const GUARDIAN_1 = "0x7B1AE5Ea599bC56734624b95589e7E8E64C351c9";
export const GUARDIAN_2 = "0x1C2CAc6ec528c20800B2fe734820D87b581eAA6B";

export const NEW_DIAMOND = "0x6c151A4134006395D41319d713349660259DAB4e";
export const NEW_VAI_CONTROLLER = "0x5134C9D11c397efdF36F828eEf23B14F3F399da4";
export const NEW_VBEP20_DELEGATE = "0xAF658DF443a937C88c955c737532E9a601ccEF8c";
export const NEW_LIQUIDATOR_IMPL = "0xD65297007411694aA18c2941a5EB2b6ed4E0b819";
export const NEW_COMPTROLLER_LENS = "0xd701C1fDAE34f9Cf242a4de19a2e7288f924EA1C";
export const MARKET_CONFIGURATION_AGGREGATOR = "0x16bb2CEc0B286ceECca3aE195e378FDe264b43b4";

export const OLD_VAI_CONTROLLER = "0xE4109433CEE11172dcCaE80d9c3bcDDFF4A7Cf57";
export const OLD_DIAMOND = "0xb61a58aCA9F39dEA8C22F4c9a377C68a1Ea3723C";
export const OLD_COMPTROLLER_LENS = "0x9D228f57227839a9c514077c3909c9992F7900Af";
export const OLD_VBEP20_DELEGATE = "0xA674296091B703e38dB2f3a937f02334627dCdaD";
export const OLD_LIQUIDATOR_IMPL = "0x1da2Fe628F50C14bc2A873A96B6D10392830621f";

export const CURRENT_LIQUIDATION_INCENTIVE = parseUnits("1.1", 18);
export const LIQUIDATOR_TREASURTY_PERCENT = parseUnits("0.5", 18);

export const NEW_COMPT_METHODS_FOR_EVERY_TIMELOCK = [
  "createPool(string)",
  "addPoolMarkets(uint96[],address[])",
  "removePoolMarket(uint96,address)",
  "setPoolActive(uint96,bool)",
  "setCollateralFactor(address,uint256,uint256)",
  "setCollateralFactor(uint96,address,uint256,uint256)",
  "setIsBorrowAllowed(uint96,address,bool)",
  "setAllowCorePoolFallback(uint96,bool)",
  "setPoolLabel(uint96,string)",
];

export const NEW_COMPT_METHODS_FOR_NORMAL_TIMELOCK = [
  "setLiquidationIncentive(address,uint256)",
  "setLiquidationIncentive(uint96,address,uint256)",
];

export const NEW_COMPT_METHODS_FOR_GUARDIAN_1 = [
  "setCollateralFactor(address,uint256,uint256)",
  "setCollateralFactor(uint96,address,uint256,uint256)",
];

export const NEW_COMPT_METHODS_FOR_GUARDIAN_2 = "setIsBorrowAllowed(uint96,address,bool)";

export const CORE_MARKETS = [
  {
    symbol: "vUSDC",
    underlying: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    address: "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8",
    collateralFactor: 825000000000000000n,
  },
  {
    symbol: "vUSDT",
    underlying: "0x55d398326f99059fF775485246999027B3197955",
    address: "0xfD5840Cd36d94D7229439859C0112a4185BC0255",
    collateralFactor: 800000000000000000n,
  },
  {
    symbol: "vBUSD",
    underlying: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
    address: "0x95c78222B3D6e262426483D42CfA53685A67Ab9D",
    collateralFactor: 0n,
  },
  {
    symbol: "vSXP",
    underlying: "0x47BEAd2563dCBf3bF2c9407fEa4dC236fAbA485A",
    address: "0x2fF3d0F6990a40261c66E1ff2017aCBc282EB6d0",
    collateralFactor: 0n,
  },
  {
    symbol: "vXVS",
    underlying: "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63",
    address: "0x151B1e2635A717bcDc836ECd6FbB62B674FE3E1D",
    collateralFactor: 600000000000000000n,
  },
  {
    symbol: "vBNB",
    underlying: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
    address: "0xA07c5b74C9B40447a954e1466938b865b6BBea36",
    collateralFactor: 800000000000000000n,
  },
  {
    symbol: "vBTC",
    underlying: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
    address: "0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B",
    collateralFactor: 800000000000000000n,
  },
  {
    symbol: "vETH",
    underlying: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
    address: "0xf508fCD89b8bd15579dc79A6827cB4686A3592c8",
    collateralFactor: 800000000000000000n,
  },
  {
    symbol: "vLTC",
    underlying: "0x4338665CBB7B2485A8855A139b75D5e34AB0DB94",
    address: "0x57A5297F2cB2c0AaC9D554660acd6D385Ab50c6B",
    collateralFactor: 630000000000000000n,
  },
  {
    symbol: "vXRP",
    underlying: "0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE",
    address: "0xB248a295732e0225acd3337607cc01068e3b9c10",
    collateralFactor: 650000000000000000n,
  },
  {
    symbol: "vBCH",
    underlying: "0x8fF795a6F4D97E7887C79beA79aba5cc76444aDf",
    address: "0x5F0388EBc2B94FA8E123F404b79cCF5f40b29176",
    collateralFactor: 600000000000000000n,
  },
  {
    symbol: "vDOT",
    underlying: "0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402",
    address: "0x1610bc33319e9398de5f57B33a5b184c806aD217",
    collateralFactor: 650000000000000000n,
  },
  {
    symbol: "vLINK",
    underlying: "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD",
    address: "0x650b940a1033B8A1b1873f78730FcFC73ec11f1f",
    collateralFactor: 630000000000000000n,
  },
  {
    symbol: "vDAI",
    underlying: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",
    address: "0x334b3eCB4DCa3593BCCC3c7EBD1A1C1d1780FBF1",
    collateralFactor: 750000000000000000n,
  },
  {
    symbol: "vFIL",
    underlying: "0x0D8Ce2A99Bb6e3B7Db580eD848240e4a0F9aE153",
    address: "0xf91d58b5aE142DAcC749f58A49FCBac340Cb0343",
    collateralFactor: 630000000000000000n,
  },
  {
    symbol: "vBETH",
    underlying: "0x250632378E573c6Be1AC2f97Fcdf00515d0Aa91B",
    address: "0x972207A639CC1B374B893cc33Fa251b55CEB7c07",
    collateralFactor: 400000000000000000n,
  },
  {
    symbol: "vADA",
    underlying: "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47",
    address: "0x9A0AF7FDb2065Ce470D72664DE73cAE409dA28Ec",
    collateralFactor: 630000000000000000n,
  },
  {
    symbol: "vDOGE",
    underlying: "0xbA2aE424d960c26247Dd6c32edC70B295c744C43",
    address: "0xec3422Ef92B2fb59e84c8B02Ba73F1fE84Ed8D71",
    collateralFactor: 430000000000000000n,
  },
  {
    symbol: "vMATIC",
    underlying: "0xCC42724C6683B7E57334c4E856f4c9965ED682bD",
    address: "0x5c9476FcD6a4F9a3654139721c949c2233bBbBc8",
    collateralFactor: 650000000000000000n,
  },
  {
    symbol: "vCAKE",
    underlying: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
    address: "0x86aC3974e2BD0d60825230fa6F355fF11409df5c",
    collateralFactor: 550000000000000000n,
  },
  {
    symbol: "vAAVE",
    underlying: "0xfb6115445Bff7b52FeB98650C87f44907E58f802",
    address: "0x26DA28954763B92139ED49283625ceCAf52C6f94",
    collateralFactor: 550000000000000000n,
  },
  {
    symbol: "vTUSDOLD",
    underlying: "0x14016E85a25aeb13065688cAFB43044C2ef86784",
    address: "0x08CEB3F4a7ed3500cA0982bcd0FC7816688084c3",
    collateralFactor: 0n,
  },
  {
    symbol: "vTRXOLD",
    underlying: "0x85EAC5Ac2F758618dFa09bDbe0cf174e7d574D5B",
    address: "0x61eDcFe8Dd6bA3c891CB9bEc2dc7657B3B422E93",
    collateralFactor: 0n,
  },
  {
    symbol: "vTRX",
    underlying: "0xCE7de646e7208a4Ef112cb6ed5038FA6cC6b12e3",
    address: "0xC5D3466aA484B040eE977073fcF337f2c00071c1",
    collateralFactor: 525000000000000000n,
  },
  {
    symbol: "vWBETH",
    underlying: "0xa2E3356610840701BDf5611a53974510Ae27E2e1",
    address: "0x6CFdEc747f37DAf3b87a35a1D9c8AD3063A1A8A0",
    collateralFactor: 800000000000000000n,
  },
  {
    symbol: "vTUSD",
    underlying: "0x40af3827F39D0EAcBF4A168f8D4ee67c121D11c9",
    address: "0xBf762cd5991cA1DCdDaC9ae5C638F5B5Dc3Bee6E",
    collateralFactor: 750000000000000000n,
  },
  {
    symbol: "vUNI",
    underlying: "0xBf5140A22578168FD562DCcF235E5D43A02ce9B1",
    address: "0x27FF564707786720C71A2e5c1490A63266683612",
    collateralFactor: 550000000000000000n,
  },
  {
    symbol: "vFDUSD",
    underlying: "0xc5f0f7b66764F6ec8C8Dff7BA683102295E16409",
    address: "0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba",
    collateralFactor: 750000000000000000n,
  },
  {
    symbol: "vTWT",
    underlying: "0x4B0F1812e5Df2A09796481Ff14017e6005508003",
    address: "0x4d41a36D04D97785bcEA57b057C412b278e6Edcc",
    collateralFactor: 500000000000000000n,
  },
  {
    symbol: "vSolvBTC",
    underlying: "0x4aae823a6a0b376De6A78e74eCC5b079d38cBCf7",
    address: "0xf841cb62c19fCd4fF5CD0AaB5939f3140BaaC3Ea",
    collateralFactor: 750000000000000000n,
  },
  {
    symbol: "vTHE",
    underlying: "0xF4C8E32EaDEC4BFe97E0F595AdD0f4450a863a11",
    address: "0x86e06EAfa6A1eA631Eab51DE500E3D474933739f",
    collateralFactor: 530000000000000000n,
  },
  {
    symbol: "vSOL",
    underlying: "0x570A5D26f7765Ecb712C0924E4De545B89fD43dF",
    address: "0xBf515bA4D1b52FFdCeaBF20d31D705Ce789F2cEC",
    collateralFactor: 720000000000000000n,
  },
  {
    symbol: "vlisUSD",
    underlying: "0x0782b6d8c4551B9760e74c0545a9bCD90bdc41E5",
    address: "0x689E0daB47Ab16bcae87Ec18491692BF621Dc6Ab",
    collateralFactor: 550000000000000000n,
  },
  //   {
  //     symbol: "vPT-sUSDE-26JUN2025",
  //     underlying: "0xDD809435ba6c9d6903730f923038801781cA66ce",
  //     address: "0x9e4E5fed5Ac5B9F732d0D850A615206330Bf1866",
  //     collateralFactor: 700000000000000000n,
  //   },
  {
    symbol: "vsUSDe",
    underlying: "0x211Cc4DD073734dA055fbF44a2b4667d5E5fE5d2",
    address: "0x699658323d58eE25c69F1a29d476946ab011bD18",
    collateralFactor: 750000000000000000n,
  },
  {
    symbol: "vUSDe",
    underlying: "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34",
    address: "0x74ca6930108F775CC667894EEa33843e691680d7",
    collateralFactor: 750000000000000000n,
  },
  {
    symbol: "vUSD1",
    underlying: "0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d",
    address: "0x0C1DA220D301155b87318B90692Da8dc43B67340",
    collateralFactor: 500000000000000000n,
  },
  {
    symbol: "vxSolvBTC",
    underlying: "0x1346b618dC92810EC74163e4c27004c921D446a5",
    address: "0xd804dE60aFD05EE6B89aab5D152258fD461B07D5",
    collateralFactor: 720000000000000000n,
  },
  {
    symbol: "vasBNB",
    underlying: "0x77734e70b6E88b4d82fE632a168EDf6e700912b6",
    address: "0xCC1dB43a06d97f736C7B045AedD03C6707c09BDF",
    collateralFactor: 720000000000000000n,
  },
  {
    symbol: "vWBNB",
    underlying: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    address: "0x6bCa74586218dB34cdB402295796b79663d816e9",
    collateralFactor: 800000000000000000n,
  },
];

export const CORE_MARKETS_WITHOUT_VBNB = CORE_MARKETS.filter(market => market.symbol != "vBNB");
export const MARKETS_CF_LT = CORE_MARKETS.map(market => [
  market.address,
  market.collateralFactor,
  market.collateralFactor,
]);
export const MARKETS_LI = CORE_MARKETS.map(market => [market.address, CURRENT_LIQUIDATION_INCENTIVE]);
export const BORROW_PAUSED_MARKETS = [
  "vasBNB",
  "vsUSDe",
  "vxSolvBTC",
  "vPT-sUSDE-26JUN2025",
  "vBUSD",
  "vSXP",
  "vXVS",
  "vBETH",
  "vTUSDOLD",
  "vTRXOLD",
];
export const MARKETS_BA = CORE_MARKETS.filter(market => !BORROW_PAUSED_MARKETS.includes(market.symbol)).map(market => [
  0,
  market.address,
  true,
]);

// emode group
export const vUSDE = "0x74ca6930108F775CC667894EEa33843e691680d7";
export const vsUSDE = "0x699658323d58eE25c69F1a29d476946ab011bD18";
export const POOL_SPECS = {
  label: "Stablecoins",
  id: 1,
  allowCorePoolFallback: true,
  markets: [vUSDE, vsUSDE],
  marketsConfig: [
    {
      address: vUSDE,
      collateralFactor: parseUnits("0.90", 18),
      liquidationThreshold: parseUnits("0.92", 18),
      liquidationIncentive: parseUnits("1.06", 18),
      borrowAllowed: true,
    },
    {
      address: vsUSDE,
      collateralFactor: parseUnits("0.89", 18),
      liquidationThreshold: parseUnits("0.91", 18),
      liquidationIncentive: parseUnits("1.08", 18),
      borrowAllowed: false,
    },
  ],
};

export const vip550 = () => {
  const meta = {
    version: "v2",
    title: "Emode in the BNB Core Pool",
    description: `Emode in the BNB Core Pool`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: UNITROLLER,
        signature: "_setPendingImplementation(address)",
        params: [NEW_DIAMOND],
      },
      {
        target: NEW_DIAMOND,
        signature: "_become(address)",
        params: [UNITROLLER],
      },
      {
        target: UNITROLLER,
        signature: "diamondCut((address,uint8,bytes4[])[])",
        params: [params],
      },

      // revoke permissions for removed methods
      ...[bscmainnet.NORMAL_TIMELOCK, bscmainnet.FAST_TRACK_TIMELOCK, bscmainnet.CRITICAL_TIMELOCK].map(timelock => {
        return {
          target: ACM,
          signature: "revokeCallPermission(address,string,address)",
          params: [UNITROLLER, "_setCollateralFactor(address,uint256)", timelock],
        };
      }),
      {
        target: ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [UNITROLLER, "_setLiquidationIncentive(uint256)", bscmainnet.NORMAL_TIMELOCK],
      },

      {
        target: UNITROLLER,
        signature: "_setComptrollerLens(address)",
        params: [NEW_COMPTROLLER_LENS],
      },

      // Give permission for new methods
      ...[...NEW_COMPT_METHODS_FOR_EVERY_TIMELOCK, ...NEW_COMPT_METHODS_FOR_NORMAL_TIMELOCK].map(method => {
        return {
          target: ACM,
          signature: "giveCallPermission(address,string,address)",
          params: [UNITROLLER, method, bscmainnet.NORMAL_TIMELOCK],
        };
      }),
      ...NEW_COMPT_METHODS_FOR_EVERY_TIMELOCK.map(method => {
        return {
          target: ACM,
          signature: "giveCallPermission(address,string,address)",
          params: [UNITROLLER, method, bscmainnet.FAST_TRACK_TIMELOCK],
        };
      }),
      ...NEW_COMPT_METHODS_FOR_EVERY_TIMELOCK.map(method => {
        return {
          target: ACM,
          signature: "giveCallPermission(address,string,address)",
          params: [UNITROLLER, method, bscmainnet.CRITICAL_TIMELOCK],
        };
      }),
      ...NEW_COMPT_METHODS_FOR_GUARDIAN_1.map(method => {
        return {
          target: ACM,
          signature: "giveCallPermission(address,string,address)",
          params: [UNITROLLER, method, GUARDIAN_1],
        };
      }),
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [UNITROLLER, NEW_COMPT_METHODS_FOR_GUARDIAN_2, GUARDIAN_2],
      },
      ...CORE_MARKETS_WITHOUT_VBNB.map(vToken => {
        return {
          target: vToken.address,
          signature: "_setImplementation(address,bool,bytes)",
          params: [NEW_VBEP20_DELEGATE, false, "0x"],
        };
      }),

      // give temporary permission
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [UNITROLLER, "setCollateralFactor(address,uint256,uint256)", MARKET_CONFIGURATION_AGGREGATOR],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [UNITROLLER, "setLiquidationIncentive(address,uint256)", MARKET_CONFIGURATION_AGGREGATOR],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [UNITROLLER, "setIsBorrowAllowed(uint96,address,bool)", MARKET_CONFIGURATION_AGGREGATOR],
      },

      // execute in batch
      {
        target: MARKET_CONFIGURATION_AGGREGATOR,
        signature: "executeCollateralFactorBatch((address,uint256,uint256)[])",
        params: [MARKETS_CF_LT],
      },
      {
        target: MARKET_CONFIGURATION_AGGREGATOR,
        signature: "executeLiquidationIncentiveBatch((address,uint256)[])",
        params: [MARKETS_LI],
      },
      {
        target: MARKET_CONFIGURATION_AGGREGATOR,
        signature: "executeBorrowAllowedBatch((uint96,address,bool)[])",
        params: [MARKETS_BA],
      },

      //   remove temporary permissions
      {
        target: ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [UNITROLLER, "setCollateralFactor(address,uint256,uint256)", MARKET_CONFIGURATION_AGGREGATOR],
      },
      {
        target: ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [UNITROLLER, "setLiquidationIncentive(address,uint256)", MARKET_CONFIGURATION_AGGREGATOR],
      },
      {
        target: ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [UNITROLLER, "setIsBorrowAllowed(uint96,address,bool)", MARKET_CONFIGURATION_AGGREGATOR],
      },

      // update IMPL
      {
        target: VAI_UNITROLLER,
        signature: "_setPendingImplementation(address)",
        params: [NEW_VAI_CONTROLLER],
      },
      {
        target: NEW_VAI_CONTROLLER,
        signature: "_become(address)",
        params: [VAI_UNITROLLER],
      },
      {
        target: LIQUIDATOR_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [LIQUIDATOR, NEW_LIQUIDATOR_IMPL],
      },
      {
        target: LIQUIDATOR,
        signature: "setTreasuryPercent(uint256)",
        params: [LIQUIDATOR_TREASURTY_PERCENT],
      },

      // Stablecoins emode
      {
        target: UNITROLLER,
        signature: "createPool(string)",
        params: [POOL_SPECS.label],
      },
      {
        target: UNITROLLER,
        signature: "addPoolMarkets(uint96[],address[])",
        params: [Array(POOL_SPECS.markets.length).fill(POOL_SPECS.id), POOL_SPECS.markets],
      },
      ...POOL_SPECS.marketsConfig.map(market => {
        return {
          target: UNITROLLER,
          signature: "setCollateralFactor(uint96,address,uint256,uint256)",
          params: [POOL_SPECS.id, market.address, market.collateralFactor, market.liquidationThreshold],
        };
      }),
      ...POOL_SPECS.marketsConfig.map(market => {
        return {
          target: UNITROLLER,
          signature: "setLiquidationIncentive(uint96,address,uint256)",
          params: [POOL_SPECS.id, market.address, market.liquidationIncentive],
        };
      }),
      {
        target: UNITROLLER,
        signature: "setIsBorrowAllowed(uint96,address,bool)",
        params: [POOL_SPECS.id, vUSDE, true],
      },
      {
        target: UNITROLLER,
        signature: "setAllowCorePoolFallback(uint96,bool)",
        params: [POOL_SPECS.id, POOL_SPECS.allowCorePoolFallback],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip550;
