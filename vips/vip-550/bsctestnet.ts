import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { cutParams as params } from "../../simulations/vip-550/utils/bsctestnet-cut-params.json";

export const UNITROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
export const VAI_UNITROLLER = "0xf70C3C6b749BbAb89C081737334E74C9aFD4BE16";
export const LIQUIDATOR = "0x55AEABa76ecf144031Ef64E222166eb28Cb4865F";
export const ACM = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";
export const LIQUIDATOR_PROXY_ADMIN = "0x1469AeB2768931f979a1c957692e32Aa802dd55a";

export const NEW_VAI_CONTROLLER = "0xECAd2AF0119Cce245817B61d4186d4708703d1a0";
export const NEW_DIAMOND = "0x1d100DAD71E56776bA3BdA3ec36D776BCE512B84";
export const NEW_COMPTROLLER_LENS = "0x5715933d62852C15eF97b6B4BB498CF45c40C244";
export const NEW_VBEP20_DELEGATE = "0xD922a9d900C25beE548586948cCf831e09FB2130";
export const NEW_LIQUIDATOR_IMPL = "0x28Be3ef68AFa00b1151669F2e6dA2DE8d1bb1Abc";

export const OLD_VAI_CONTROLLER = "0x5864e8BE0d4AD825feD65115a4f109f850A65aF7";
export const OLD_DIAMOND = "0x649616739bab52E2A98BC74d93c896Ca45944359";
export const OLD_COMPTROLLER_LENS = "0x3ec96D6a9a14ee57aB83F81BB7386EBE515936D1";
export const OLD_VBEP20_DELEGATE = "0x585C508aF088123d990182a19e655ebB0e540CA1";
export const OLD_LIQUIDATOR_IMPL = "0xe442A62E3B1956EC5B42e06aA0E293A0cB300406";
export const MARKET_CONFIGURATION_AGGREGATOR = "0x7bbC692907f23E4b7170de0e1483323ea322BDbF";

export const CURRENT_LIQUIDATION_INCENTIVE = parseUnits("1.1", 18);
export const LIQUIDATOR_TREASURTY_PERCENT = parseUnits("0.5", 18);

export const NEW_COMPT_METHODS = [
  "setCollateralFactor(address,uint256,uint256)",
  "setLiquidationIncentive(address,uint256)",
  "setIsBorrowAllowed(uint96,address,bool)",
  "createPool(string)",
  "addPoolMarkets(uint96[],address[])",
  "removePoolMarket(uint96,address)",
  "setCollateralFactor(uint96,address,uint256,uint256)",
  "setLiquidationIncentive(uint96,address,uint256)",
  "setPoolActive(uint96,bool)",
];

export const CORE_MARKETS = [
  {
    symbol: "vUSDC",
    address: "0xD5C4C2e2facBEB59D0216D0595d63FcDc6F9A1a7",
    asset: "0x16227D60f7a0e586C66B005219dfc887D13C9531",
    collateralFactor: 810000000000000000n,
  },
  {
    symbol: "vUSDT",
    address: "0xb7526572FFE56AB9D7489838Bf2E18e3323b441A",
    asset: "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c",
    collateralFactor: 800000000000000000n,
  },
  {
    symbol: "vBUSD",
    address: "0x08e0A5575De71037aE36AbfAfb516595fE68e5e4",
    asset: "0x8301F2213c0eeD49a7E28Ae4c3e91722919B8B47",
    collateralFactor: 0n,
  },
  {
    symbol: "vSXP",
    address: "0x74469281310195A04840Daf6EdF576F559a3dE80",
    asset: "0x75107940Cf1121232C0559c747A986DEfbc69DA9",
    collateralFactor: 500000000000000000n,
  },
  {
    symbol: "vBNB",
    address: "0x2E7222e51c0f6e98610A1543Aa3836E092CDe62c",
    asset: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
    collateralFactor: 800000000000000000n,
  },
  {
    symbol: "Venus XVS",
    address: "0x6d6F697e34145Bb95c54E77482d97cc261Dc237E",
    asset: "0xB9e0E753630434d7863528cc73CB7AC638a7c8ff",
    collateralFactor: 600000000000000000n,
  },
  {
    symbol: "vETH",
    address: "0x162D005F0Fff510E54958Cfc5CF32A3180A84aab",
    asset: "0x98f7A83361F7Ac8765CcEBAB1425da6b341958a7",
    collateralFactor: 800000000000000000n,
  },
  {
    symbol: "vLTC",
    address: "0xAfc13BC065ABeE838540823431055D2ea52eBA52",
    asset: "0x969F147B6b8D81f86175de33206A4FD43dF17913",
    collateralFactor: 600000000000000000n,
  },
  {
    symbol: "vXRP",
    address: "0x488aB2826a154da01CC4CC16A8C83d4720D3cA2C",
    asset: "0x3022A32fdAdB4f02281E8Fab33e0A6811237aab0",
    collateralFactor: 600000000000000000n,
  },
  {
    symbol: "vBTC",
    address: "0xb6e9322C49FD75a367Fcb17B0Fcd62C5070EbCBe",
    asset: "0xA808e341e8e723DC6BA0Bb5204Bafc2330d7B8e4",
    collateralFactor: 800000000000000000n,
  },
  {
    symbol: "vADA",
    address: "0x37C28DE42bA3d22217995D146FC684B2326Ede64",
    asset: "0xcD34BC54106bd45A04Ed99EBcC2A6a3e70d7210F",
    collateralFactor: 600000000000000000n,
  },
  {
    symbol: "vDOGE",
    address: "0xF912d3001CAf6DC4ADD366A62Cc9115B4303c9A9",
    asset: "0x67D262CE2b8b846d9B94060BC04DC40a83F0e25B",
    collateralFactor: 800000000000000000n,
  },
  {
    symbol: "vCAKE",
    address: "0xeDaC03D29ff74b5fDc0CC936F6288312e1459BC6",
    asset: "0xe8bd7cCC165FAEb9b81569B05424771B9A20cbEF",
    collateralFactor: 600000000000000000n,
  },
  {
    symbol: "vMATIC",
    address: "0x3619bdDc61189F33365CC572DF3a68FB3b316516",
    asset: "0xcfeb0103d4BEfa041EA4c2dACce7B3E83E1aE7E3",
    collateralFactor: 600000000000000000n,
  },
  {
    symbol: "vAAVE",
    address: "0x714db6c38A17883964B68a07d56cE331501d9eb6",
    asset: "0x4B7268FC7C727B88c5Fc127D41b491BfAe63e144",
    collateralFactor: 550000000000000000n,
  },
  {
    symbol: "vTUSDOLD",
    address: "0x3A00d9B02781f47d033BAd62edc55fBF8D083Fb0",
    asset: "0xFeC3A63401Eb9C1476200d7C32c4009Be0154169",
    collateralFactor: 550000000000000000n,
  },
  {
    symbol: "vTRXOLD",
    address: "0x369Fea97f6fB7510755DCA389088d9E2e2819278",
    asset: "0x19E7215abF8B2716EE807c9f4b83Af0e7f92653F",
    collateralFactor: 600000000000000000n,
  },
  {
    symbol: "vTRX",
    address: "0x6AF3Fdb3282c5bb6926269Db10837fa8Aec67C04",
    asset: "0x7D21841DC10BA1C5797951EFc62fADBBDD06704B",
    collateralFactor: 600000000000000000n,
  },
  {
    symbol: "vWBETH",
    address: "0x35566ED3AF9E537Be487C98b1811cDf95ad0C32b",
    asset: "0xf9F98365566F4D55234f24b99caA1AfBE6428D44",
    collateralFactor: 500000000000000000n,
  },
  {
    symbol: "vTUSD",
    address: "0xEFAACF73CE2D38ED40991f29E72B12C74bd4cf23",
    asset: "0xB32171ecD878607FFc4F8FC0bCcE6852BB3149E0",
    collateralFactor: 0n,
  },
  {
    symbol: "vUNI",
    address: "0x171B468b52d7027F12cEF90cd065d6776a25E24e",
    asset: "0x8D2f061C75780d8D91c10A7230B907411aCBC8fC",
    collateralFactor: 550000000000000000n,
  },
  {
    symbol: "vFDUSD",
    address: "0xF06e662a00796c122AaAE935EC4F0Be3F74f5636",
    asset: "0xcF27439fA231af9931ee40c4f27Bb77B83826F3C",
    collateralFactor: 750000000000000000n,
  },
  {
    symbol: "vSolvBTC",
    address: "0xA38110ae4451A86ab754695057d5B5a9BEAd0387",
    asset: "0x6855E14A6df91b8E4D55163d068E9ef2530fd4CE",
    collateralFactor: 750000000000000000n,
  },
  {
    // Binance
    symbol: "vTWT",
    address: "0x95DaED37fdD3F557b3A5cCEb7D50Be65b36721DF",
    asset: "0xb99c6b26fdf3678c6e2aff8466e3625a0e7182f8",
    collateralFactor: 500000000000000000n,
  },
  {
    symbol: "vTHE",
    address: "0x39A239F5117BFaC7a1b0b3A517c454113323451d",
    asset: "0x952653d23cB9bef19E442D2BF8fBc8843A968052",
    collateralFactor: 530000000000000000n,
  },
  {
    symbol: "vSOL",
    address: "0xbd9EB061444665Df7282Ec0888b72D60aC41Eb8C",
    asset: "0xC337Dd0390FdFD0Ee5D2b682E425986EDD7b59da",
    collateralFactor: 720000000000000000n,
  },
  {
    // BINANCE
    symbol: "vlisUSD",
    address: "0x9447b1D4Bd192f25416B6aCc3B7f06be2f7D6309",
    asset: "0xe73774DfCD551BF75650772dC2cC56a2B6323453",
    collateralFactor: 550000000000000000n,
  },

  {
    symbol: "vUSDe",
    address: "0x86f8DfB7CA84455174EE9C3edd94867b51Da46BD",
    asset: "0x986C30591f5aAb401ea3aa63aFA595608721B1B9",
    collateralFactor: 750000000000000000n,
  },
  {
    symbol: "vsUSDe",
    address: "0x8c8A1a0b6e1cb8058037F7bF24de6b79Aca5B7B0",
    asset: "0xcFec590e417Abb378cfEfE6296829E35fa25cEbd",
    collateralFactor: 750000000000000000n,
  },
  {
    symbol: "vPT-sUSDE-26JUN2025",
    address: "0x90535B06ddB00453a5e5f2bC094d498F1cc86032",
    asset: "0x95e58161BA2423c3034658d957F3f5b94DeAbf81",
    collateralFactor: 700000000000000000n,
  },
  {
    symbol: "vUSD1",
    address: "0x519e61D2CDA04184FB086bbD2322C1bfEa0917Cf",
    asset: "0x7792af341a10ccc4B1CDd7B317F0460a37346a0A",
    collateralFactor: 0n,
  },
  {
    symbol: "vxSolvBTC",
    address: "0x97cB97B05697c377C0bd09feDce67DBd86B7aB1e",
    asset: "0x3ea87323806586A0282b50377e0FEa76070F532B",
    collateralFactor: 720000000000000000n,
  },
  {
    symbol: "vasBNB",
    address: "0x73F506Aefd5e169D48Ea21A373B9B0a200E37585",
    asset: "0xc625f060ad25f4A6c2d9eBF30C133dB61B7AF072",
    collateralFactor: 720000000000000000n,
  },
  {
    symbol: "vUSDF",
    address: "0x140d5Da2cE9fb9A8725cabdDB2Fe8ea831342C78",
    asset: "0xC7a2b79432Fd3e3d5bd2d96A456c734AB93A0484",
    collateralFactor: 600000000000000000n,
  },
  {
    symbol: "vWBNB",
    address: "0xd9E77847ec815E56ae2B9E69596C69b6972b0B1C",
    asset: "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd",
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
export const MARKETS_BA = CORE_MARKETS.map(market => [0, market.address, true]);

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
      {
        target: ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [UNITROLLER, "_setCollateralFactor(address,uint256)", NETWORK_ADDRESSES.bsctestnet.NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [UNITROLLER, "_setLiquidationIncentive(uint256)", NETWORK_ADDRESSES.bsctestnet.NORMAL_TIMELOCK],
      },
      {
        target: UNITROLLER,
        signature: "_setComptrollerLens(address)",
        params: [NEW_COMPTROLLER_LENS],
      },

      ...NEW_COMPT_METHODS.map(method => {
        return {
          target: ACM,
          signature: "giveCallPermission(address,string,address)",
          params: [UNITROLLER, method, NETWORK_ADDRESSES.bsctestnet.NORMAL_TIMELOCK],
        };
      }),
      ...NEW_COMPT_METHODS.map(method => {
        return {
          target: ACM,
          signature: "giveCallPermission(address,string,address)",
          params: [UNITROLLER, method, NETWORK_ADDRESSES.bsctestnet.FAST_TRACK_TIMELOCK],
        };
      }),
      ...NEW_COMPT_METHODS.map(method => {
        return {
          target: ACM,
          signature: "giveCallPermission(address,string,address)",
          params: [UNITROLLER, method, NETWORK_ADDRESSES.bsctestnet.CRITICAL_TIMELOCK],
        };
      }),

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

      // remove temporary permissions
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
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip550;
