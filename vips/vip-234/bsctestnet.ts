import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";
// IL
const IL_VTOKEN_IMPL = "0x72581fd0Ff9224Dbc8983ca45bbc61C75B0FD94c";
const VTOKEN_BEACON = "0xBF85A90673E61956f8c79b9150BAB7893b791bDd";
const SN_BNB_BEACON = "0x1103Bec24Eb194d69ae116d62DD9559412E7C23A";
// Core
const NEW_VBEP20_DELEGATE_IMPL = "0x5C7ED65F06A714a7128122749d7e1fF76ea303cf";

interface AssetConfig {
  name: string;
  address: string;
  isMock: boolean; // Defines underlying is MockToken
}

export const CORE_MARKETS: AssetConfig[] = [
  {
    name: "vETH",
    address: "0x162D005F0Fff510E54958Cfc5CF32A3180A84aab",
    isMock: false,
  },
  {
    name: "vLTC",
    address: "0xAfc13BC065ABeE838540823431055D2ea52eBA52",
    isMock: false,
  },
  {
    name: "VBTC",
    address: "0xb6e9322C49FD75a367Fcb17B0Fcd62C5070EbCBe",
    isMock: false,
  },
  {
    name: "vXRP",
    address: "0x488aB2826a154da01CC4CC16A8C83d4720D3cA2C",
    isMock: false,
  },
  {
    name: "vSXP",
    address: "0x74469281310195A04840Daf6EdF576F559a3dE80",
    isMock: true,
  },
  {
    name: "vTRX",
    address: "0x6AF3Fdb3282c5bb6926269Db10837fa8Aec67C04",
    isMock: true,
  },
  {
    name: "vTUSD",
    address: "0xEFAACF73CE2D38ED40991f29E72B12C74bd4cf23",
    isMock: true,
  },
  {
    name: "vUSDC",
    address: "0xD5C4C2e2facBEB59D0216D0595d63FcDc6F9A1a7",
    isMock: true,
  },
  {
    name: "vUSDT",
    address: "0xb7526572FFE56AB9D7489838Bf2E18e3323b441A",
    isMock: true,
  },
  {
    name: "vWBETH",
    address: "0x35566ED3AF9E537Be487C98b1811cDf95ad0C32b",
    isMock: true,
  },
  {
    name: "vXVS",
    address: "0x6d6F697e34145Bb95c54E77482d97cc261Dc237E",
    isMock: false,
  },
  {
    name: "vDOGE",
    address: "0xF912d3001CAf6DC4ADD366A62Cc9115B4303c9A9",
    isMock: true,
  },
  {
    name: "vMATIC",
    address: "0x3619bdDc61189F33365CC572DF3a68FB3b316516",
    isMock: true,
  },
  {
    name: "vCAKE",
    address: "0xeDaC03D29ff74b5fDc0CC936F6288312e1459BC6",
    isMock: true,
  },
  {
    name: "vADA",
    address: "0x37C28DE42bA3d22217995D146FC684B2326Ede64",
    isMock: true,
  },
  {
    name: "vAAVE",
    address: "0x714db6c38A17883964B68a07d56cE331501d9eb6",
    isMock: true,
  },
  {
    name: "vBUSD",
    address: "0x08e0A5575De71037aE36AbfAfb516595fE68e5e4",
    isMock: true,
  },
  {
    name: "vTRXOLD",
    address: "0x369Fea97f6fB7510755DCA389088d9E2e2819278",
    isMock: true,
  },
  {
    name: "vTUSDOLD",
    address: "0x3A00d9B02781f47d033BAd62edc55fBF8D083Fb0",
    isMock: true,
  },
  {
    name: "vUNI",
    address: "0x171B468b52d7027F12cEF90cd065d6776a25E24e",
    isMock: true,
  },
  {
    name: "vFDUSD",
    address: "0xF06e662a00796c122AaAE935EC4F0Be3F74f5636",
    isMock: true,
  },
];

export const vip219Testnet = () => {
  const meta = {
    version: "v2",
    title: `VIP-219 VToken Upgrade`,
    description: `If passed, this VIP will upgrade the implementation of every market in the Core pool - except vBNB (non upgradable), vLUNA and vUST (deprecated) and the markets in Isolated Pools allowing for reserves to reduced with either cash on hand or accrued revenues whichever is less.

    #### Description

    A situation can arise where the accrued revenues to reduce from the reserves are less than cash on hand. This can cause problems because interest accrual will throw an error that not enough cash is available and break features such as calculated fresh account balances.


    **Audit reports**

    **Deployed contracts**

    - Mainnet: ****[new VToken implementations](https://bscscan.com/address/<>)
    - Testnet: ****[new VToken implementations](https://testnet.bscscan.com/address/<>)

    **References**

    - [Pull request with the new Core Pool VToken contracts](https://github.com/VenusProtocol/venus-protocol/pull/414)
    - [Pull request with the new Isolated Pools VToken contracts](https://github.com/VenusProtocol/isolated-pools/pull/337)
    - [Simulation post upgrade](https://github.com/VenusProtocol/vips/pull/<>)
    - [Testnet deployment Core VToken](https://testnet.bscscan.com/tx/0xaa554add9a0ab1894beb97547b855715e0ca2ab2bd7cffb59678b199867713fb)
    - [Testnet deployment IL VToken](https://testnet.bscscan.com/tx/0x8506ab53fe5325fbaef0410e20c31cc0e384424648a6ebedc611e80dad94e0fe)
    - [Documentation](https://docs-v4.venus.io/technical-reference/reference-technical-articles/automatic-income-allocation)`,
    forDescription:
      "I agree that Venus Protocol should proceed with VToken Upgrade allowing for income to be reduced based on cash on hand",
    againstDescription:
      "I do not think that Venus Protocol should proceed with VToken Upgrade allowing for income to be reduced based on cash on hand",
    abstainDescription:
      "I am indifferent to whether Venus Protocol proceeds with VToken Upgrade allowing for income to be reduced based on cash on hand",
  };

  return makeProposal(
    [
      ...CORE_MARKETS.map(asset => {
        return {
          target: asset.address,
          signature: "_setImplementation(address,bool,bytes)",
          params: [NEW_VBEP20_DELEGATE_IMPL, false, "0x"],
        };
      }),
      // TRX is missing a set ProtocolShareReserve contract in testnet
      {
        target: "0x6AF3Fdb3282c5bb6926269Db10837fa8Aec67C04",
        signature: "setProtocolShareReserve(address)",
        params: ["0x25c7c7D6Bf710949fD7f03364E9BA19a1b3c10E3"],
      },
      {
        target: VTOKEN_BEACON,
        signature: "upgradeTo(address)",
        params: [IL_VTOKEN_IMPL],
      },
      {
        target: SN_BNB_BEACON,
        signature: "upgradeTo(address)",
        params: [IL_VTOKEN_IMPL],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
