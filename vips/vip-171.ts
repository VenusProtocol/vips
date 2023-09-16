import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";

export interface SpeedRecord {
  market: string;
  symbol: string;
  supplySideSpeed: string;
  borrowSideSpeed: string;
}

const newSpeeds: SpeedRecord[] = [
  {
    market: "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8",
    symbol: "vUSDC",
    supplySideSpeed: "678168402777777",
    borrowSideSpeed: "678168402777777",
  },
  {
    market: "0xfD5840Cd36d94D7229439859C0112a4185BC0255",
    symbol: "vUSDT",
    supplySideSpeed: "678168402777777",
    borrowSideSpeed: "678168402777777",
  },
  {
    market: "0xA07c5b74C9B40447a954e1466938b865b6BBea36",
    symbol: "vBNB",
    supplySideSpeed: "1627604166666666",
    borrowSideSpeed: "1627604166666666",
  },
  {
    market: "0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B",
    symbol: "vBTC",
    supplySideSpeed: "1627604166666666",
    borrowSideSpeed: "1627604166666666",
  },
  {
    market: "0xf508fCD89b8bd15579dc79A6827cB4686A3592c8",
    symbol: "vETH",
    supplySideSpeed: "813802083333333",
    borrowSideSpeed: "813802083333333",
  },
  {
    market: "0x57A5297F2cB2c0AaC9D554660acd6D385Ab50c6B",
    symbol: "vLTC",
    supplySideSpeed: "49717881944444",
    borrowSideSpeed: "49717881944444",
  },
  {
    market: "0xB248a295732e0225acd3337607cc01068e3b9c10",
    symbol: "vXRP",
    supplySideSpeed: "49717881944444",
    borrowSideSpeed: "49717881944444",
  },
  {
    market: "0x5F0388EBc2B94FA8E123F404b79cCF5f40b29176",
    symbol: "vBCH",
    supplySideSpeed: "27126736111111",
    borrowSideSpeed: "27126736111111",
  },
  {
    market: "0x1610bc33319e9398de5f57B33a5b184c806aD217",
    symbol: "vDOT",
    supplySideSpeed: "79535590277777",
    borrowSideSpeed: "79535590277777",
  },
  {
    market: "0x650b940a1033B8A1b1873f78730FcFC73ec11f1f",
    symbol: "vLINK",
    supplySideSpeed: "49717881944444",
    borrowSideSpeed: "49717881944444",
  },
  {
    market: "0x334b3eCB4DCa3593BCCC3c7EBD1A1C1d1780FBF1",
    symbol: "vDAI",
    supplySideSpeed: "81380208333333",
    borrowSideSpeed: "81380208333333",
  },
  {
    market: "0xf91d58b5aE142DAcC749f58A49FCBac340Cb0343",
    symbol: "vFIL",
    supplySideSpeed: "27126736111111",
    borrowSideSpeed: "27126736111111",
  },
  {
    market: "0x9A0AF7FDb2065Ce470D72664DE73cAE409dA28Ec",
    symbol: "vADA",
    supplySideSpeed: "81380208333333",
    borrowSideSpeed: "81380208333333",
  },
  {
    market: "0xec3422Ef92B2fb59e84c8B02Ba73F1fE84Ed8D71",
    symbol: "vDOGE",
    supplySideSpeed: "27126736111111",
    borrowSideSpeed: "27126736111111",
  },
  {
    market: "0x5c9476FcD6a4F9a3654139721c949c2233bBbBc8",
    symbol: "vMATIC",
    supplySideSpeed: "54253472222222",
    borrowSideSpeed: "54253472222222",
  },
  {
    market: "0x86aC3974e2BD0d60825230fa6F355fF11409df5c",
    symbol: "vCAKE",
    supplySideSpeed: "54253472222222",
    borrowSideSpeed: "54253472222222",
  },
  {
    market: "0x26DA28954763B92139ED49283625ceCAf52C6f94",
    symbol: "vAAVE",
    supplySideSpeed: "27126736111111",
    borrowSideSpeed: "27126736111111",
  },
  {
    market: "0xC5D3466aA484B040eE977073fcF337f2c00071c1",
    symbol: "vTRX",
    supplySideSpeed: "54253472222222",
    borrowSideSpeed: "54253472222222",
  },
  {
    market: "0x6CFdEc747f37DAf3b87a35a1D9c8AD3063A1A8A0",
    symbol: "vWBETH",
    supplySideSpeed: "149110243055555",
    borrowSideSpeed: "149110243055555",
  },
  {
    market: "0xBf762cd5991cA1DCdDaC9ae5C638F5B5Dc3Bee6E",
    symbol: "vTUSD",
    supplySideSpeed: "54253472222222",
    borrowSideSpeed: "54253472222222",
  },
];

export const vip171 = () => {
  const meta = {
    version: "v2",
    title: "VIP-171 XVS Emission Reduction",
    description: `#### Summary

After the successful passing of the [snapshot vote](https://snapshot.org/#/venus-xvs.eth/proposal/0x031cec704a0b3cf3163fa03b8f04bca2b3d7299f0b53962d595a252952a1cc9a) to reduce XVS emissions earlier this week, this VIP is now being issued for the changes to be implemented and take effect immediately after its execution. If approved by the majority of XVS Holders, this VIP will reduce the amount of daily XVS emission on Venus Core pool markets.

The current emission on the core pool markets is 1,449.55 XVS/day, and after the change the daily emission of XVS in the markets will be 362.38625 XVS/day.

#### Reasoning

With the upcoming launch of the Venus Prime program and current market trends, this proposal aims to further reduce XVS emissions on Venus Core markets by 75%. The new organic reward system for this program will help offset the effects. The goal is to keep reducing token inflation and with it, support protocol growth and reinvestment.

#### Venus Prime Program Overview

Venus Prime stands as a strategic shift in the Venus Protocol’s reward mechanism. Diverging from the traditional token emission method, Venus Prime is engineered to distribute rewards based on protocol performance. This organic reward system is expected to drive user engagement and loyalty, while simultaneously reducing dependency on regular emissions which can contribute to token inflation and associated market pressures.

#### Mitigating Impact of Emission Reduction with Venus Prime

Organic Rewards: Venus Prime eliminates the need for frequent token emissions, thus reducing the inflationary pressures on the XVS token.

Incentivizing Long-Term Engagement: With Venus Prime, users are not just rewarded for mere participation but for their loyalty and consistent engagement with the protocol. This ensures that while emissions are cut, user retention and attraction remain high.

The shift towards a sustainable rewards model ensures that the Venus Protocol remains financially robust, aligning the interests of users with the protocol’s long-term viability.

#### Conclusion

The Venus Prime program offers a sustainable and innovative solution to the challenges posed by regular token emissions. By harnessing the protocol’s own revenues for user rewards and fostering an environment of long-term engagement, Venus Prime ensures that the proposed emission reductions not only maintain but enhance the protocol’s market position and user appeal.`,
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
