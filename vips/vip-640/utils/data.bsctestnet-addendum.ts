import { NETWORK_ADDRESSES } from "src/networkAddresses";

const { bsctestnet } = NETWORK_ADDRESSES;

export const UNITROLLER = bsctestnet.UNITROLLER; // Core Pool Comptroller (Diamond)

export const NEW_DIAMOND = "0xbb34bBC161C9dbBE1dbCbC0A03478581f04b0E44"; // Diamond (Unitroller implementation)
export const NEW_COMPTROLLER_LENS = "0x0Dab769617B2d690DDbe8A6D730D9C9b85F26ca0";
export const NEW_VTOKEN_DELEGATE = "0x73fF75092Da265b87b25ffB943c47C90419a04A6";
export const EXECUTOR = "0x6E447F044b59F4e0Ed46052cD7c5F6a2579FC661"; // Executor proxy
export const PROXY_ADMIN = "0x7877fFd62649b6A1557B55D4c20fcBaB17344C91"; // DefaultProxyAdmin
export const NEW_EXECUTOR_IMPL = "0x005205d97Afc4aF4eF05Cd9D6a56dD068ED586F3";

// Core Pool Comptroller diamond re-recut for the addendum.
export interface FacetCut {
  name: string;
  oldFacet: string;
  newFacet: string;
  selectors: string[];
  newSelectors: string[];
}

export const FACETS: FacetCut[] = [
  {
    name: "MarketFacet",
    oldFacet: "0xBf827F216CA97e83a753958d84E391E195AeC246",
    newFacet: "0x3372D6aeb32aa6AB0933127ac9194E8915172752",
    selectors: [
      "0xa76b3fda",
      "0x89c13be0",
      "0x929fe9a1",
      "0xd0d13036",
      "0xd585c3c6",
      "0xc2998238",
      "0xf9682732",
      "0xede4edd0",
      "0xb0772d0b",
      "0xabfceffc",
      "0x23617585",
      "0xafd3783b",
      "0x19ef3e8b",
      "0xd686e9ee",
      "0x7b86e42c",
      "0x63e0d634",
      "0xf02fdf97",
      "0x007e3dd2",
      "0x3d98a1e5",
      "0x0ef332ca",
      "0xc488847b",
      "0xa78dc775",
      "0x8e8f294b",
      "0x3093c11e",
      "0xd137f36e",
      "0xcab4f84c",
      "0x0686dab6",
      "0xddbf54fd",
      "0xd463654c",
      "0x4d99c776",
      "0xc5b4db55",
    ],
    newSelectors: [],
  },
  {
    name: "PolicyFacet",
    oldFacet: "0xd72894576D30B0081fB63F9c015dc02471F2BD04",
    newFacet: "0x808746E246393a98209990844951826D67da970A",
    selectors: [
      "0xead1a8a0",
      "0xda3d454c",
      "0x5c778605",
      "0x5ec88c79",
      "0x528a174c",
      "0x4e79238f",
      "0x5fc7e71e",
      "0x47ef3b3b",
      "0x4ef4c3e1",
      "0x41c728b9",
      "0xeabe7d91",
      "0x51dff989",
      "0x24008a62",
      "0x1ededc91",
      "0xd02f7351",
      "0x6d35bf91",
      "0xbdcdc258",
      "0x6a56947e",
    ],
    newSelectors: [],
  },
  {
    name: "RewardFacet",
    oldFacet: "0x61F0CC11D37Cc6CebE92A3980F0a52476945D80d",
    newFacet: "0x68C120C4b35874593EE494faf4Db6deFcEFf53b4",
    selectors: [
      "0xa7604b41", // _grantXVS(address,uint256)
      "0xe85a2960", // actionPaused(address,uint8)
      "0x70bf66f0", // claimVenus(address[],address[],bool,bool,bool)
      "0x86df31ee", // claimVenus(address,address[])
      "0xadcd5fb9", // claimVenus(address)
      "0xd09c54ba", // claimVenus(address[],address[],bool,bool)
      "0x7858524d", // claimVenusAsCollateral(address)
      "0xbf32442d", // getXVSAddress()
      "0xededbae6", // getXVSVTokenAddress()
      "0x655f0725", // seizeVenus(address[],address)
      "0xc2dbfc50", // claimVenusAsCollateral(address,address[]) — already added by the original VIP
      "0xf74c8f31", // seizeVenus(address[],address,address[]) — already added by the original VIP
    ],
    newSelectors: [],
  },
  {
    name: "SetterFacet",
    oldFacet: "0x36452b3316A8e684e2890E43D2871f90180735ec",
    newFacet: "0x4eC6D748a2647000895b455c408f85602A144Ed6",
    selectors: [
      "0xf519fc30",
      "0x2b5d790c",
      "0x317b0b77",
      "0x9bf34cbb",
      "0x522c656b",
      "0x17db2163",
      "0xbb857450",
      "0x607ef6c1",
      "0x51a485e4",
      "0x5f5af1aa",
      "0x55ee1fe1",
      "0x9460c8b5",
      "0x2a6a6065",
      "0xd24febad",
      "0x9cfdd9e6",
      "0x2ec04124",
      "0x4e0853db",
      "0x6662c7c9",
      "0x919a3736",
      "0x4ef233fc",
      "0x24aaa220",
      "0x7938146f",
      "0x12348e96",
      "0x5cc4fdeb",
      "0x9159b177",
      "0xd6ad5c39",
      "0x8b3113f6",
      "0xa89766dd",
      "0x35439240",
      "0x9bd8f6e8",
      "0x186db48f",
      "0xd136af44",
      "0xfd51a3ad",
      "0x4964f48c",
      "0xb88d846b",
      "0x530e784f",
      "0xc32094c7",
      "0x42adb211",
      "0xfe40768f",
    ],
    newSelectors: [],
  },
  {
    name: "FlashLoanFacet",
    oldFacet: "0xf26aF9e67222eabcC6A70A01e530B9e10f8930EE",
    newFacet: "0x528A428748dfE73DFcc844176B401475D1831057",
    selectors: ["0x5544ed9c"],
    newSelectors: [],
  },
];

export const VTOKENS_TO_UPGRADE: Record<string, string> = {
  vUSDC: "0xD5C4C2e2facBEB59D0216D0595d63FcDc6F9A1a7",
  vUSDT: "0xb7526572FFE56AB9D7489838Bf2E18e3323b441A",
  vBUSD: "0x08e0A5575De71037aE36AbfAfb516595fE68e5e4",
  vSXP: "0x74469281310195A04840Daf6EdF576F559a3dE80",
  vXVS: "0x6d6F697e34145Bb95c54E77482d97cc261Dc237E",
  vETH: "0x162D005F0Fff510E54958Cfc5CF32A3180A84aab",
  vLTC: "0xAfc13BC065ABeE838540823431055D2ea52eBA52",
  vXRP: "0x488aB2826a154da01CC4CC16A8C83d4720D3cA2C",
  vBTC: "0xb6e9322C49FD75a367Fcb17B0Fcd62C5070EbCBe",
  vADA: "0x37C28DE42bA3d22217995D146FC684B2326Ede64",
  vDOGE: "0xF912d3001CAf6DC4ADD366A62Cc9115B4303c9A9",
  vCAKE: "0xeDaC03D29ff74b5fDc0CC936F6288312e1459BC6",
  vMATIC: "0x3619bdDc61189F33365CC572DF3a68FB3b316516",
  vAAVE: "0x714db6c38A17883964B68a07d56cE331501d9eb6",
  vTUSDOLD: "0x3A00d9B02781f47d033BAd62edc55fBF8D083Fb0",
  vTRXOLD: "0x369Fea97f6fB7510755DCA389088d9E2e2819278",
  vUST: "0xF206af85BC2761c4F876d27Bd474681CfB335EfA",
  vLUNA: "0x9C3015191d39cF1930F92EB7e7BCbd020bCA286a",
  vTRX: "0x6AF3Fdb3282c5bb6926269Db10837fa8Aec67C04",
  vWBETH: "0x35566ED3AF9E537Be487C98b1811cDf95ad0C32b",
  vTUSD: "0xEFAACF73CE2D38ED40991f29E72B12C74bd4cf23",
  vUNI: "0x171B468b52d7027F12cEF90cd065d6776a25E24e",
  vFDUSD: "0xF06e662a00796c122AaAE935EC4F0Be3F74f5636",
  vSolvBTC: "0xA38110ae4451A86ab754695057d5B5a9BEAd0387",
  vTWT: "0x95DaED37fdD3F557b3A5cCEb7D50Be65b36721DF",
  vTHE: "0x39A239F5117BFaC7a1b0b3A517c454113323451d",
  vSOL: "0xbd9EB061444665Df7282Ec0888b72D60aC41Eb8C",
  vlisUSD: "0x9447b1D4Bd192f25416B6aCc3B7f06be2f7D6309",
  vsUSDe: "0x8c8A1a0b6e1cb8058037F7bF24de6b79Aca5B7B0",
  vUSDe: "0x86f8DfB7CA84455174EE9C3edd94867b51Da46BD",
  vUSD1: "0x519e61D2CDA04184FB086bbD2322C1bfEa0917Cf",
  vxSolvBTC: "0x97cB97B05697c377C0bd09feDce67DBd86B7aB1e",
  vasBNB: "0x73F506Aefd5e169D48Ea21A373B9B0a200E37585",
  vUSDF: "0x140d5Da2cE9fb9A8725cabdDB2Fe8ea831342C78",
  vWBNB: "0xd9E77847ec815E56ae2B9E69596C69b6972b0B1C",
  "vPT-USDe-30OCT2025": "0x86a94290f2B8295daA3e53bA1286f2Ff21199143",
  vslisBNB: "0xaB5504A3cde0d8253E8F981D663c7Ff7128B3e56",
  vU: "0x93969F17d4c1C7B22000eA26D5C2766E0f616D90",
  "vPT-clisBNB-25JUN2026": "0xCd5A0037ebfC4a22A755923bB5C983947FaBdCe7",
  vXAUM: "0xc93CBF6CA7F3124737F2f4daDa8dBBC7be56d125",
};

// BStock markets
export const BSTOCK_MARKETS: Record<string, string> = {
  vTSLAB: "0x3Ed56f6937fc8549f9325405d1e8E650739647Fa",
  vNVDAB: "0x9e1ECb2671AfabE9eaAA2e74Cb2318a9b6A2Eb5d",
  vSPCXB: "0x05B2EC5B7437FB188175bf440e3EB36af79fe319",
};
