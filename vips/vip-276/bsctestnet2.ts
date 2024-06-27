import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { cutParams as params } from "../../simulations/vip-276/utils/bsctestnet-cut-params2.json";

export const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
export const FAST_TRACK_TIMELOCK = "0x3CFf21b7AF8390fE68799D58727d3b4C25a83cb6";
export const CRITICAL_TIMELOCK = "0x23B893a7C45a5Eb8c8C062b9F32d0D2e43eD286D";
export const ACM_CORE_POOL = "0x69a9e5dee4007fb1311c4d086fed4803e09a30b5";

export const XVS = "0xB9e0E753630434d7863528cc73CB7AC638a7c8ff";
export const XVSVTOKEN = "0x6d6F697e34145Bb95c54E77482d97cc261Dc237E";
export const DIAMOND = "0x1D5F9752bA40cF7047db2E24Cb6Aa196E3c334DA";

export const UNITROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
export const NEW_VBEP20_DELEGATE_IMPL = "0xad6aa8Bb4829560412A94AA930745f407BF8000B";

export const SN_BNB_BEACON = "0x1103Bec24Eb194d69ae116d62DD9559412E7C23A";
export const COMPTROLLER_BEACON = "0xdddd7725c073105fb2abfcbdec16708fc4c24b74";
export const VTOKEN_BEACON = "0xBF85A90673E61956f8c79b9150BAB7893b791bDd";
export const NEW_COMPTROLLER_IMPLEMENTATION = "0x2CF0e211c99dFd28892cf80D142aA27a9042Dbf4";
export const NEW_VTOKEN_IMPLEMENTATION = "0xa60b28FDDaAB87240C3AF319892e7A4ad6FbF41F";
export const NATIVE_TOKEN_GATEWAY = "0xCf4C75398DaD73f16c762026144a1496f6869CD1";

export const CORE_MARKETS = [
  {
    name: "vTRX",
    address: "0x6AF3Fdb3282c5bb6926269Db10837fa8Aec67C04",
  },
  {
    name: "vUST",
    address: "0xF206af85BC2761c4F876d27Bd474681CfB335EfA",
  },
  {
    name: "vLUNA",
    address: "0x9C3015191d39cF1930F92EB7e7BCbd020bCA286a",
  },
  {
    name: "vAAVE",
    address: "0x714db6c38A17883964B68a07d56cE331501d9eb6",
  },
  {
    name: "vADA",
    address: "0x37C28DE42bA3d22217995D146FC684B2326Ede64",
  },
  {
    name: "vBTC",
    address: "0xb6e9322C49FD75a367Fcb17B0Fcd62C5070EbCBe",
  },
  {
    name: "vBUSD",
    address: "0x08e0A5575De71037aE36AbfAfb516595fE68e5e4",
  },
  {
    name: "vCAKE",
    address: "0xeDaC03D29ff74b5fDc0CC936F6288312e1459BC6",
  },
  {
    name: "vDOGE",
    address: "0xF912d3001CAf6DC4ADD366A62Cc9115B4303c9A9",
  },
  {
    name: "vETH",
    address: "0x162D005F0Fff510E54958Cfc5CF32A3180A84aab",
  },
  {
    name: "vFDUSD",
    address: "0xF06e662a00796c122AaAE935EC4F0Be3F74f5636",
  },
  {
    name: "vLTC",
    address: "0xAfc13BC065ABeE838540823431055D2ea52eBA52",
  },
  {
    name: "vMATIC",
    address: "0x3619bdDc61189F33365CC572DF3a68FB3b316516",
  },
  {
    name: "vSXP",
    address: "0x74469281310195A04840Daf6EdF576F559a3dE80",
  },
  {
    name: "vTRXOLD",
    address: "0x369Fea97f6fB7510755DCA389088d9E2e2819278",
  },
  {
    name: "vTUSD",
    address: "0xEFAACF73CE2D38ED40991f29E72B12C74bd4cf23",
  },
  {
    name: "vTUSDOLD",
    address: "0x3A00d9B02781f47d033BAd62edc55fBF8D083Fb0",
  },
  {
    name: "vUNI",
    address: "0x171B468b52d7027F12cEF90cd065d6776a25E24e",
  },
  {
    name: "vUSDC",
    address: "0xD5C4C2e2facBEB59D0216D0595d63FcDc6F9A1a7",
  },
  {
    name: "vUSDT",
    address: "0xb7526572FFE56AB9D7489838Bf2E18e3323b441A",
  },
  {
    name: "vWBETH",
    address: "0x35566ED3AF9E537Be487C98b1811cDf95ad0C32b",
  },
  {
    name: "vXRP",
    address: "0x488aB2826a154da01CC4CC16A8C83d4720D3cA2C",
  },
  {
    name: "vXVS",
    address: "0x6d6F697e34145Bb95c54E77482d97cc261Dc237E",
  },
];

export const vip276 = () => {
  const meta = {
    version: "v2",
    title:
      "VIP-Gateway Update VToken and comptroller implementation in IL and Core Pool and introduces the NativeTokenGateway contract",
    description: `
    This VIP does the following:
    1. Updates the implementation of all VTokens and Comptroller market facet in Core Pool
    2. Updates the implementation of VTokens and Comptrollers in IL
    3. Accepts the ownership of the NativeTokenGateway contract
    4. Gives call permissions to Timelocks for seizeVenus function
    5. Sets XVS and vXVS address in unitroller`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: UNITROLLER,
        signature: "_setPendingImplementation(address)",
        params: [DIAMOND],
      },
      {
        target: DIAMOND,
        signature: "_become(address)",
        params: [UNITROLLER],
      },
      {
        target: UNITROLLER,
        signature: "diamondCut((address,uint8,bytes4[])[])",
        params: [params],
      },

      ...CORE_MARKETS.map(vToken => {
        return {
          target: vToken.address,
          signature: "_setImplementation(address,bool,bytes)",
          params: [NEW_VBEP20_DELEGATE_IMPL, false, "0x"],
        };
      }),
      {
        target: COMPTROLLER_BEACON,
        signature: "upgradeTo(address)",
        params: [NEW_COMPTROLLER_IMPLEMENTATION],
      },
      {
        target: VTOKEN_BEACON,
        signature: "upgradeTo(address)",
        params: [NEW_VTOKEN_IMPLEMENTATION],
      },
      {
        target: SN_BNB_BEACON,
        signature: "upgradeTo(address)",
        params: [NEW_VTOKEN_IMPLEMENTATION],
      },
      {
        target: NATIVE_TOKEN_GATEWAY,
        signature: "acceptOwnership()",
        params: [],
      },

      ...[NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK].map((timelock: string) => ({
        target: ACM_CORE_POOL,
        signature: "giveCallPermission(address,string,address)",
        params: [UNITROLLER, "seizeVenus(address[],address)", timelock],
      })),
      {
        target: UNITROLLER,
        signature: "_setXVSToken(address)",
        params: [XVS],
      },
      {
        target: UNITROLLER,
        signature: "_setXVSVToken(address)",
        params: [XVSVTOKEN],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip276;
