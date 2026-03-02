import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const NEW_VBEP20_DELEGATE_IMPL = "0x7C72Eac19a2d233d23aA68d49145Ed527ABde2E6";

export const CORE_MARKETS = [
  {
    name: "vUSDC",
    address: "0xD5C4C2e2facBEB59D0216D0595d63FcDc6F9A1a7",
  },
  {
    name: "vUSDT",
    address: "0xb7526572FFE56AB9D7489838Bf2E18e3323b441A",
  },
  {
    name: "vBUSD",
    address: "0x08e0A5575De71037aE36AbfAfb516595fE68e5e4",
  },
  {
    name: "vSXP",
    address: "0x74469281310195A04840Daf6EdF576F559a3dE80",
  },
  {
    name: "vXVS",
    address: "0x6d6F697e34145Bb95c54E77482d97cc261Dc237E",
  },
  {
    name: "vETH",
    address: "0x162D005F0Fff510E54958Cfc5CF32A3180A84aab",
  },
  {
    name: "vLTC",
    address: "0xAfc13BC065ABeE838540823431055D2ea52eBA52",
  },
  {
    name: "vXRP",
    address: "0x488aB2826a154da01CC4CC16A8C83d4720D3cA2C",
  },
  {
    name: "vBTC",
    address: "0xb6e9322C49FD75a367Fcb17B0Fcd62C5070EbCBe",
  },
  {
    name: "vADA",
    address: "0x37C28DE42bA3d22217995D146FC684B2326Ede64",
  },
  {
    name: "vDOGE",
    address: "0xF912d3001CAf6DC4ADD366A62Cc9115B4303c9A9",
  },
  {
    name: "vCAKE",
    address: "0xeDaC03D29ff74b5fDc0CC936F6288312e1459BC6",
  },
  {
    name: "vMATIC",
    address: "0x3619bdDc61189F33365CC572DF3a68FB3b316516",
  },
  {
    name: "vAAVE",
    address: "0x714db6c38A17883964B68a07d56cE331501d9eb6",
  },
  {
    name: "vTUSDOLD",
    address: "0x3A00d9B02781f47d033BAd62edc55fBF8D083Fb0",
  },
  {
    name: "vTRXOLD",
    address: "0x369Fea97f6fB7510755DCA389088d9E2e2819278",
  },
  {
    name: "vTRX",
    address: "0x6AF3Fdb3282c5bb6926269Db10837fa8Aec67C04",
  },
  {
    name: "vWBETH",
    address: "0x35566ED3AF9E537Be487C98b1811cDf95ad0C32b",
  },
  {
    name: "vTUSD",
    address: "0xEFAACF73CE2D38ED40991f29E72B12C74bd4cf23",
  },
  {
    name: "vUNI",
    address: "0x171B468b52d7027F12cEF90cd065d6776a25E24e",
  },
  {
    name: "vFDUSD",
    address: "0xF06e662a00796c122AaAE935EC4F0Be3F74f5636",
  },
  {
    name: "vSolvBTC",
    address: "0xA38110ae4451A86ab754695057d5B5a9BEAd0387",
  },
  {
    name: "vTWT",
    address: "0x95DaED37fdD3F557b3A5cCEb7D50Be65b36721DF",
  },
  {
    name: "vTHE",
    address: "0x39A239F5117BFaC7a1b0b3A517c454113323451d",
  },
  {
    name: "vSOL",
    address: "0xbd9EB061444665Df7282Ec0888b72D60aC41Eb8C",
  },
  {
    name: "vlisUSD",
    address: "0x9447b1D4Bd192f25416B6aCc3B7f06be2f7D6309",
  },
  {
    name: "vPT-sUSDE-26JUN2025",
    address: "0x90535B06ddB00453a5e5f2bC094d498F1cc86032",
  },
  {
    name: "vsUSDe",
    address: "0x8c8A1a0b6e1cb8058037F7bF24de6b79Aca5B7B0",
  },
  {
    name: "vUSDe",
    address: "0x86f8DfB7CA84455174EE9C3edd94867b51Da46BD",
  },
  {
    name: "vUSD1",
    address: "0x519e61D2CDA04184FB086bbD2322C1bfEa0917Cf",
  },
  {
    name: "vxSolvBTC",
    address: "0x97cB97B05697c377C0bd09feDce67DBd86B7aB1e",
  },
  {
    name: "vasBNB",
    address: "0x73F506Aefd5e169D48Ea21A373B9B0a200E37585",
  },
  {
    name: "vUSDF",
    address: "0x140d5Da2cE9fb9A8725cabdDB2Fe8ea831342C78",
  },
  {
    name: "vWBNB",
    address: "0xd9E77847ec815E56ae2B9E69596C69b6972b0B1C",
  },
  {
    name: "vslisBNB",
    address: "0xaB5504A3cde0d8253E8F981D663c7Ff7128B3e56",
  },
  {
    name: "vU",
    address: "0x93969F17d4c1C7B22000eA26D5C2766E0f616D90",
  },
  {
    name: "vPT-clisBNB-25JUN2026",
    address: "0xCd5A0037ebfC4a22A755923bB5C983947FaBdCe7",
  },
  {
    name: "vXAUM",
    address: "0xc93CBF6CA7F3124737F2f4daDa8dBBC7be56d125",
  },
];

const vip596Testnet = () => {
  const meta = {
    version: "v2",
    title: "VIP-596 [BNB Chain] Repay Logic Improvement - VToken Implementation Upgrade",
    description: `This VIP upgrades the VBep20Delegate implementation for all core pool markets on BNB Chain testnet to include the repay logic improvement.

The updated implementation caps the repayment amount to the borrower's actual outstanding debt, preventing over-repayment scenarios. Previously, only \`type(uint256).max\` was treated as "repay full balance". Now, any amount exceeding the actual borrow balance is automatically capped.

#### References
- [Venus Protocol PR #646](https://github.com/VenusProtocol/venus-protocol/pull/646)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      ...CORE_MARKETS.map(vToken => {
        return {
          target: vToken.address,
          signature: "_setImplementation(address,bool,bytes)",
          params: [NEW_VBEP20_DELEGATE_IMPL, false, "0x"],
        };
      }),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip596Testnet;
