import { ethers } from "hardhat";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { cutParams as params } from "../../simulations/vip-555/utils/bsctestnet-cut-params.json";

export const UNITROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
export const NEW_VBEP20_DELEGATE_IMPL = "0xf4f8049c5d6d2cFC968E18DF74188B8Cc875B840";
export const NEW_DIAMOND_IMPLEMENTATION = "0x18D1697c7a0eDFAdFB6A51e97A53Cf48B7407922";
export const ACM = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";

export const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
export const FAST_TRACK_TIMELOCK = "0x3CFf21b7AF8390fE68799D58727d3b4C25a83cb6";
export const CRITICAL_TIMELOCK = "0x23B893a7C45a5Eb8c8C062b9F32d0D2e43eD286D";

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

export const vip555 = () => {
  const meta = {
    version: "v2",
    title: "VIP-555",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };
  return makeProposal(
    [
      {
        target: UNITROLLER,
        signature: "_setPendingImplementation(address)",
        params: [NEW_DIAMOND_IMPLEMENTATION],
      },
      {
        target: NEW_DIAMOND_IMPLEMENTATION,
        signature: "_become(address)",
        params: [UNITROLLER],
      },
      {
        // Note that mainnet cuts should be updated after Prime VIP is executed
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
      ...[NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK].map((timelock: string) => ({
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [UNITROLLER, "setWhiteListFlashLoanAccount(address,bool)", timelock],
      })),
      ...[NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK].map((timelock: string) => ({
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "toggleFlashLoan()", timelock],
      })),
      ...[NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK].map((timelock: string) => ({
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setFlashLoanFeeMantissa(uint256,uint256)", timelock],
      })),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip555;
