import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";

export interface SpeedRecord {
  market: string;
  symbol: string;
  supplySideSpeed: string;
  borrowSideSpeed: string;
}

export const newSpeeds: SpeedRecord[] = [
  {
    market: "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8",
    symbol: "vUSDC",
    supplySideSpeed: "0",
    borrowSideSpeed: "0",
  },
  {
    market: "0xfD5840Cd36d94D7229439859C0112a4185BC0255",
    symbol: "vUSDT",
    supplySideSpeed: "0",
    borrowSideSpeed: "0",
  },
  {
    market: "0xA07c5b74C9B40447a954e1466938b865b6BBea36",
    symbol: "vBNB",
    supplySideSpeed: "0",
    borrowSideSpeed: "0",
  },
  {
    market: "0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B",
    symbol: "vBTC",
    supplySideSpeed: "0",
    borrowSideSpeed: "0",
  },
  {
    market: "0xf508fCD89b8bd15579dc79A6827cB4686A3592c8",
    symbol: "vETH",
    supplySideSpeed: "0",
    borrowSideSpeed: "0",
  },
  {
    market: "0x57A5297F2cB2c0AaC9D554660acd6D385Ab50c6B",
    symbol: "vLTC",
    supplySideSpeed: "0",
    borrowSideSpeed: "0",
  },
  {
    market: "0xB248a295732e0225acd3337607cc01068e3b9c10",
    symbol: "vXRP",
    supplySideSpeed: "0",
    borrowSideSpeed: "0",
  },
  {
    market: "0x5F0388EBc2B94FA8E123F404b79cCF5f40b29176",
    symbol: "vBCH",
    supplySideSpeed: "0",
    borrowSideSpeed: "0",
  },
  {
    market: "0x1610bc33319e9398de5f57B33a5b184c806aD217",
    symbol: "vDOT",
    supplySideSpeed: "0",
    borrowSideSpeed: "0",
  },
  {
    market: "0x650b940a1033B8A1b1873f78730FcFC73ec11f1f",
    symbol: "vLINK",
    supplySideSpeed: "0",
    borrowSideSpeed: "0",
  },
  {
    market: "0x334b3eCB4DCa3593BCCC3c7EBD1A1C1d1780FBF1",
    symbol: "vDAI",
    supplySideSpeed: "0",
    borrowSideSpeed: "0",
  },
  {
    market: "0xf91d58b5aE142DAcC749f58A49FCBac340Cb0343",
    symbol: "vFIL",
    supplySideSpeed: "0",
    borrowSideSpeed: "0",
  },
  {
    market: "0x9A0AF7FDb2065Ce470D72664DE73cAE409dA28Ec",
    symbol: "vADA",
    supplySideSpeed: "0",
    borrowSideSpeed: "0",
  },
  {
    market: "0xec3422Ef92B2fb59e84c8B02Ba73F1fE84Ed8D71",
    symbol: "vDOGE",
    supplySideSpeed: "0",
    borrowSideSpeed: "0",
  },
  {
    market: "0x5c9476FcD6a4F9a3654139721c949c2233bBbBc8",
    symbol: "vMATIC",
    supplySideSpeed: "0",
    borrowSideSpeed: "0",
  },
  {
    market: "0x86aC3974e2BD0d60825230fa6F355fF11409df5c",
    symbol: "vCAKE",
    supplySideSpeed: "0",
    borrowSideSpeed: "0",
  },
  {
    market: "0x26DA28954763B92139ED49283625ceCAf52C6f94",
    symbol: "vAAVE",
    supplySideSpeed: "0",
    borrowSideSpeed: "0",
  },
  {
    market: "0xC5D3466aA484B040eE977073fcF337f2c00071c1",
    symbol: "vTRX",
    supplySideSpeed: "0",
    borrowSideSpeed: "0",
  },
  {
    market: "0x6CFdEc747f37DAf3b87a35a1D9c8AD3063A1A8A0",
    symbol: "vWBETH",
    supplySideSpeed: "0",
    borrowSideSpeed: "0",
  },
  {
    market: "0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba",
    symbol: "vFDUSD",
    supplySideSpeed: "0",
    borrowSideSpeed: "0",
  },
  {
    market: "0x27FF564707786720C71A2e5c1490A63266683612",
    symbol: "vUNI",
    supplySideSpeed: "0",
    borrowSideSpeed: "0",
  },
  {
    market: "0x151B1e2635A717bcDc836ECd6FbB62B674FE3E1D",
    symbol: "vXVS",
    supplySideSpeed: "1388888888888888",
    borrowSideSpeed: "0",
  },
];

export const vip364 = () => {
  const meta = {
    version: "v2",
    title: "VIP-364 XVS Emission Reduction",
    description: ``,
    forDescription: "I agree, Venus should reduce daily XVS emissions",
    againstDescription: "I disagree, Venus should not reduce daily XVS emissions",
    abstainDescription: "I am indifferent to whether Venus proceeds or not",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER,
        signature: "_setVenusSpeeds(address[],uint256[],uint256[])",
        params: [
          newSpeeds.map(s => s.market),
          newSpeeds.map(s => s.supplySideSpeed),
          newSpeeds.map(s => s.borrowSideSpeed),
        ],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
