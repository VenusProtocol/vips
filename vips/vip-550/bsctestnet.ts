import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { cutParams as params } from "../../simulations/vip-550/utils/bsctestnet-cut-params.json";

export const UNITROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
export const VAI_UNITROLLER = "0xf70C3C6b749BbAb89C081737334E74C9aFD4BE16";
export const LIQUIDATOR = "0x55AEABa76ecf144031Ef64E222166eb28Cb4865F";
export const ACM = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";
export const PROXY_ADMIN = "0x1469AeB2768931f979a1c957692e32Aa802dd55a";

export const NEW_VAI_CONTROLLER = "0x5361EeCB35Dbbf239F0AB3600e460bFdBa14c592";
export const NEW_DIAMOND = "0xC1eCF5Ee6B2F43194359c02FB460B31e4494895d";
export const NEW_COMPTROLLER_LENS = "0x5675112bf79C66d8CEbe48C40f25e9Dd6576c4e6";
export const NEW_VBEP20_DELEGATE = "0xf292c8F321fF1BC49A3FeADf4D0971E519485e19";
export const NEW_LIQUIDATOR_IMPL = "0x0F30B2a844339b7bD2Be0D82298e82f44286A0cA";

export const OLD_VAI_CONTROLLER = "0xDFcbfb82a416B5CEbB80FECFbBF4E055299931FF";
export const OLD_DIAMOND = "0x1D5F9752bA40cF7047db2E24Cb6Aa196E3c334DA";
export const OLD_COMPTROLLER_LENS = "0x350d56985A269C148648207E4Cea9f87656E762a";
export const OLD_VBEP20_DELEGATE = "0xad6aa8Bb4829560412A94AA930745f407BF8000B";
export const OLD_LIQUIDATOR_IMPL = "0x83372155dd4a4306af82795d5a27d40188ed1f3b";

export const CURRENT_LIQUIDATION_INCENTIVE = parseUnits("1.1", 18);
export const LIQUIDATOR_TREASURTY_PERCENT = parseUnits("0.5", 18);

export const NEW_COMPT_METHODS = [
  "setLiquidationIncentive(address,uint256)",
  "setIsBorrowAllowed(uint96,address,bool)",
];

export const CORE_MARKETS = [
  // {
  //   symbol: "vUSDC",
  //   address: "0xD5C4C2e2facBEB59D0216D0595d63FcDc6F9A1a7",
  //   collateralFactor: 810000000000000000n,
  // },
  // {
  //   symbol: "vUSDT",
  //   address: "0xb7526572FFE56AB9D7489838Bf2E18e3323b441A",
  //   collateralFactor: 800000000000000000n,
  // },
  // {
  //   symbol: "vBUSD",
  //   address: "0x08e0A5575De71037aE36AbfAfb516595fE68e5e4",
  //   collateralFactor: 0n,
  // },
  // {
  //   symbol: "vSXP",
  //   address: "0x74469281310195A04840Daf6EdF576F559a3dE80",
  //   collateralFactor: 500000000000000000n,
  // },
  // {
  //   symbol: "vBNB",
  //   address: "0x2E7222e51c0f6e98610A1543Aa3836E092CDe62c",
  //   collateralFactor: 800000000000000000n,
  // },
  // {
  //   symbol: "Venus XVS",
  //   address: "0x6d6F697e34145Bb95c54E77482d97cc261Dc237E",
  //   collateralFactor: 600000000000000000n,
  // },
  // {
  //   symbol: "vETH",
  //   address: "0x162D005F0Fff510E54958Cfc5CF32A3180A84aab",
  //   collateralFactor: 800000000000000000n,
  // },
  // {
  //   symbol: "vLTC",
  //   address: "0xAfc13BC065ABeE838540823431055D2ea52eBA52",
  //   collateralFactor: 600000000000000000n,
  // },
  // {
  //   symbol: "vXRP",
  //   address: "0x488aB2826a154da01CC4CC16A8C83d4720D3cA2C",
  //   collateralFactor: 600000000000000000n,
  // },
  // {
  //   symbol: "vBTC",
  //   address: "0xb6e9322C49FD75a367Fcb17B0Fcd62C5070EbCBe",
  //   collateralFactor: 800000000000000000n,
  // },
  // {
  //   symbol: "vADA",
  //   address: "0x37C28DE42bA3d22217995D146FC684B2326Ede64",
  //   collateralFactor: 600000000000000000n,
  // },
  // {
  //   symbol: "vDOGE",
  //   address: "0xF912d3001CAf6DC4ADD366A62Cc9115B4303c9A9",
  //   collateralFactor: 800000000000000000n,
  // },
  // {
  //   symbol: "vCAKE",
  //   address: "0xeDaC03D29ff74b5fDc0CC936F6288312e1459BC6",
  //   collateralFactor: 600000000000000000n,
  // },
  // {
  //   symbol: "vMATIC",
  //   address: "0x3619bdDc61189F33365CC572DF3a68FB3b316516",
  //   collateralFactor: 600000000000000000n,
  // },
  // {
  //   symbol: "vAAVE",
  //   address: "0x714db6c38A17883964B68a07d56cE331501d9eb6",
  //   collateralFactor: 550000000000000000n,
  // },
  {
    symbol: "vTUSDOLD",
    address: "0x3A00d9B02781f47d033BAd62edc55fBF8D083Fb0",
    collateralFactor: 550000000000000000n,
  },
  // {
  //   symbol: "vTRXOLD",
  //   address: "0x369Fea97f6fB7510755DCA389088d9E2e2819278",
  //   collateralFactor: 600000000000000000n,
  // },
  // {
  //   symbol: "vTRX",
  //   address: "0x6AF3Fdb3282c5bb6926269Db10837fa8Aec67C04",
  //   collateralFactor: 600000000000000000n,
  // },
  // {
  //   symbol: "vWBETH",
  //   address: "0x35566ED3AF9E537Be487C98b1811cDf95ad0C32b",
  //   collateralFactor: 500000000000000000n,
  // },
  // {
  //   symbol: "vTUSD",
  //   address: "0xEFAACF73CE2D38ED40991f29E72B12C74bd4cf23",
  //   collateralFactor: 0n,
  // },
  {
    symbol: "vUNI",
    address: "0x171B468b52d7027F12cEF90cd065d6776a25E24e",
    collateralFactor: 550000000000000000n,
  },
  {
    symbol: "vFDUSD",
    address: "0xF06e662a00796c122AaAE935EC4F0Be3F74f5636",
    collateralFactor: 750000000000000000n,
  },
  {
    symbol: "vSolvBTC",
    address: "0xA38110ae4451A86ab754695057d5B5a9BEAd0387",
    collateralFactor: 750000000000000000n,
  },
  {
    symbol: "vTWT",
    address: "0x95DaED37fdD3F557b3A5cCEb7D50Be65b36721DF",
    collateralFactor: 500000000000000000n,
  },
  {
    symbol: "vTHE",
    address: "0x39A239F5117BFaC7a1b0b3A517c454113323451d",
    collateralFactor: 530000000000000000n,
  },
  {
    symbol: "vSOL",
    address: "0xbd9EB061444665Df7282Ec0888b72D60aC41Eb8C",
    collateralFactor: 720000000000000000n,
  },
  {
    symbol: "vlisUSD",
    address: "0x9447b1D4Bd192f25416B6aCc3B7f06be2f7D6309",
    collateralFactor: 550000000000000000n,
  },
  {
    symbol: "vPT-sUSDE-26JUN2025",
    address: "0x90535B06ddB00453a5e5f2bC094d498F1cc86032",
    collateralFactor: 700000000000000000n,
  },
  {
    symbol: "vsUSDe",
    address: "0x8c8A1a0b6e1cb8058037F7bF24de6b79Aca5B7B0",
    collateralFactor: 750000000000000000n,
  },
  {
    symbol: "vUSDe",
    address: "0x86f8DfB7CA84455174EE9C3edd94867b51Da46BD",
    collateralFactor: 750000000000000000n,
  },
  {
    symbol: "vUSD1",
    address: "0x519e61D2CDA04184FB086bbD2322C1bfEa0917Cf",
    collateralFactor: 0n,
  },
  {
    symbol: "vxSolvBTC",
    address: "0x97cB97B05697c377C0bd09feDce67DBd86B7aB1e",
    collateralFactor: 720000000000000000n,
  },
  // {
  //   symbol: "vasBNB",
  //   address: "0x73F506Aefd5e169D48Ea21A373B9B0a200E37585",
  //   collateralFactor: 720000000000000000n,
  // },
  // {
  //   symbol: "vUSDF",
  //   address: "0x140d5Da2cE9fb9A8725cabdDB2Fe8ea831342C78",
  //   collateralFactor: 600000000000000000n,
  // },
];

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
      ...NEW_COMPT_METHODS.map(method => {
        return {
          target: ACM,
          signature: "giveCallPermission(address,string,address)",
          params: [UNITROLLER, method, NETWORK_ADDRESSES.bsctestnet.NORMAL_TIMELOCK],
        };
      }),
      {
        target: UNITROLLER,
        signature: "_setComptrollerLens(address)",
        params: [NEW_COMPTROLLER_LENS],
      },
      ...CORE_MARKETS.map(vToken => {
        return {
          target: vToken.address,
          signature: "_setImplementation(address,bool,bytes)",
          params: [NEW_VBEP20_DELEGATE, false, "0x"],
        };
      }),
      ...CORE_MARKETS.map(vToken => {
        return {
          target: UNITROLLER,
          signature: "setCollateralFactor(address,uint256,uint256)",
          params: [vToken.address, vToken.collateralFactor, vToken.collateralFactor],
        };
      }),
      ...CORE_MARKETS.map(vToken => {
        return {
          target: UNITROLLER,
          signature: "setLiquidationIncentive(address,uint256)",
          params: [vToken.address, CURRENT_LIQUIDATION_INCENTIVE],
        };
      }),
      ...CORE_MARKETS.map(vToken => {
        return {
          target: UNITROLLER,
          signature: "setIsBorrowAllowed(uint96,address,bool)",
          params: [0, vToken.address, true],
        };
      }),
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
        target: PROXY_ADMIN,
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
