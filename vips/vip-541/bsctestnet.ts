import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalMeta, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { cutParams as params } from "./cut-params-testnet.json";

const { bsctestnet } = NETWORK_ADDRESSES;

export const vBNB_ADMIN = "0x04109575c1dbB4ac2e59e60c783800ea10441BBe";
export const vBNB_ADMIN_IMPL = "0x920863fB3965fc411A1c0aC610C768F4347570fE";
export const DEFAULT_PROXY_ADMIN = "0x7877ffd62649b6a1557b55d4c20fcbab17344c91";
export const DIAMOND = "0x649616739bab52E2A98BC74d93c896Ca45944359";
export const COMPTROLLER_LENS = "0x3ec96D6a9a14ee57aB83F81BB7386EBE515936D1";
export const LIQUIDATOR = "0x55AEABa76ecf144031Ef64E222166eb28Cb4865F";
export const LIQUIDATOR_IMPL = "0xe442A62E3B1956EC5B42e06aA0E293A0cB300406";
export const LIQUIDATOR_PROXY_ADMIN = "0x1469AeB2768931f979a1c957692e32Aa802dd55a";
export const VAI_CONTROLLER = "0xf70C3C6b749BbAb89C081737334E74C9aFD4BE16";
export const VAI_CONTROLLER_IMPL = "0x5864e8BE0d4AD825feD65115a4f109f850A65aF7";
export const VTOKEN_DELEGATE = "0x585C508aF088123d990182a19e655ebB0e540CA1";

export const vTokens = {
  vAAVE: "0x714db6c38A17883964B68a07d56cE331501d9eb6",
  vADA: "0x37C28DE42bA3d22217995D146FC684B2326Ede64",
  vasBNB: "0x73F506Aefd5e169D48Ea21A373B9B0a200E37585",
  vBTC: "0xb6e9322C49FD75a367Fcb17B0Fcd62C5070EbCBe",
  vBUSD: "0x08e0A5575De71037aE36AbfAfb516595fE68e5e4",
  vCAKE: "0xeDaC03D29ff74b5fDc0CC936F6288312e1459BC6",
  vDOGE: "0xF912d3001CAf6DC4ADD366A62Cc9115B4303c9A9",
  vETH: "0x162D005F0Fff510E54958Cfc5CF32A3180A84aab",
  vFDUSD: "0xF06e662a00796c122AaAE935EC4F0Be3F74f5636",
  vlisUSD: "0x9447b1D4Bd192f25416B6aCc3B7f06be2f7D6309",
  vLTC: "0xAfc13BC065ABeE838540823431055D2ea52eBA52",
  vMATIC: "0x3619bdDc61189F33365CC572DF3a68FB3b316516",
  "vPT-sUSDE-26JUN2025": "0x90535B06ddB00453a5e5f2bC094d498F1cc86032",
  vSOL: "0xbd9EB061444665Df7282Ec0888b72D60aC41Eb8C",
  vSolvBTC: "0xA38110ae4451A86ab754695057d5B5a9BEAd0387",
  vsUSDe: "0x8c8A1a0b6e1cb8058037F7bF24de6b79Aca5B7B0",
  vSXP: "0x74469281310195A04840Daf6EdF576F559a3dE80",
  vTHE: "0x39A239F5117BFaC7a1b0b3A517c454113323451d",
  vTRX: "0x6AF3Fdb3282c5bb6926269Db10837fa8Aec67C04",
  vTRXOLD: "0x369Fea97f6fB7510755DCA389088d9E2e2819278",
  vTUSD: "0xEFAACF73CE2D38ED40991f29E72B12C74bd4cf23",
  vTUSDOLD: "0x3A00d9B02781f47d033BAd62edc55fBF8D083Fb0",
  vTWT: "0x95DaED37fdD3F557b3A5cCEb7D50Be65b36721DF",
  vUNI: "0x171B468b52d7027F12cEF90cd065d6776a25E24e",
  vUSDC: "0xD5C4C2e2facBEB59D0216D0595d63FcDc6F9A1a7",
  vUSDe: "0x86f8DfB7CA84455174EE9C3edd94867b51Da46BD",
  vUSDT: "0xb7526572FFE56AB9D7489838Bf2E18e3323b441A",
  vUSD1: "0x519e61D2CDA04184FB086bbD2322C1bfEa0917Cf",
  vWBETH: "0x35566ED3AF9E537Be487C98b1811cDf95ad0C32b",
  vXRP: "0x488aB2826a154da01CC4CC16A8C83d4720D3cA2C",
  vxSolvBTC: "0x97cB97B05697c377C0bd09feDce67DBd86B7aB1e",
  vXVS: "0x6d6F697e34145Bb95c54E77482d97cc261Dc237E",
};

export const vip541 = () => {
  const meta: ProposalMeta = {
    version: "v2",
    title: "VIP-541",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: bsctestnet.UNITROLLER,
        signature: "diamondCut((address,uint8,bytes4[])[])",
        params: [params],
      },
      {
        target: DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [vBNB_ADMIN, vBNB_ADMIN_IMPL],
      },
      {
        target: bsctestnet.UNITROLLER,
        signature: "_setPendingImplementation(address)",
        params: [DIAMOND],
      },
      {
        target: DIAMOND,
        signature: "_become(address)",
        params: [bsctestnet.UNITROLLER],
      },
      {
        target: bsctestnet.UNITROLLER,
        signature: "_setComptrollerLens(address)",
        params: [COMPTROLLER_LENS],
      },
      {
        target: LIQUIDATOR_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [LIQUIDATOR, LIQUIDATOR_IMPL],
      },
      {
        target: VAI_CONTROLLER,
        signature: "_setPendingImplementation(address)",
        params: [VAI_CONTROLLER_IMPL],
      },
      {
        target: VAI_CONTROLLER_IMPL,
        signature: "_become(address)",
        params: [VAI_CONTROLLER],
      },
      ...Object.values(vTokens).map(vToken => ({
        target: vToken,
        signature: "_setImplementation(address,bool,bytes)",
        params: [VTOKEN_DELEGATE, false, "0x"],
      })),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip541;
