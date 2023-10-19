import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const VTREASURY = "0xf322942f644a996a617bd29c16bd7d231d9f35e9";

interface AssetConfig {
  symbol: string;
  vTokenAddress: string;
  vTokenBalance: string;
  vTokenBalanceMantissa: string;
  exchangeRateStored: string;
  underlyingAddress: string;
  underlyingDecimals: number;
  underlyingAmount: string;
}

export const VTOKEN_SNAPSHOT: AssetConfig[] = [
  {
    symbol: "vUSDC",
    vTokenAddress: "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8",
    vTokenBalance: "2496189.684",
    vTokenBalanceMantissa: "249618968448324",
    exchangeRateStored: "225208397323589809886119583",
    underlyingAddress: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    underlyingDecimals: 18,
    underlyingAmount: "2217716895440922054537",
  },
  {
    symbol: "vUSDT",
    vTokenAddress: "0xfD5840Cd36d94D7229439859C0112a4185BC0255",
    vTokenBalance: "10150981.23",
    vTokenBalanceMantissa: "1015098123050060",
    exchangeRateStored: "225381514415978270864478652",
    underlyingAddress: "0x55d398326f99059fF775485246999027B3197955",
    underlyingDecimals: 18,
    underlyingAmount: "228784352253839582574982",
  },
  {
    symbol: "vSXP",
    vTokenAddress: "0x2fF3d0F6990a40261c66E1ff2017aCBc282EB6d0",
    vTokenBalance: "1196598.708",
    vTokenBalanceMantissa: "119659870814202",
    exchangeRateStored: "201711847160309508531974838",
    underlyingAddress: "0x47BEAd2563dCBf3bF2c9407fEa4dC236fAbA485A",
    underlyingDecimals: 18,
    underlyingAmount: "24136813572896693578350",
  },
  {
    symbol: "vXVS",
    vTokenAddress: "0x151B1e2635A717bcDc836ECd6FbB62B674FE3E1D",
    vTokenBalance: "235888.4663",
    vTokenBalanceMantissa: "23588846631992",
    exchangeRateStored: "201111175247462604688326613",
    underlyingAddress: "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63",
    underlyingDecimals: 18,
    underlyingAmount: "4743980668892061139746",
  },
  // {
  //   symbol: "vBNB",
  //   vTokenAddress: "0xA07c5b74C9B40447a954e1466938b865b6BBea36",
  //   vTokenBalance: "628469.4449",
  //   vTokenBalanceMantissa: "62846944490450",
  //   exchangeRateStored: "227452267946942758035857335",
  //   underlyingAddress: "0x0",
  //   underlyingDecimals: 18,
  //   underlyingAmount: "14294680057888471300063",
  // },
  {
    symbol: "vBTC",
    vTokenAddress: "0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B",
    vTokenBalance: "787.2457142",
    vTokenBalanceMantissa: "78724571423",
    exchangeRateStored: "203115484241707560900851198",
    underlyingAddress: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
    underlyingDecimals: 18,
    underlyingAmount: "15990179446303537874",
  },
  {
    symbol: "vETH",
    vTokenAddress: "0xf508fCD89b8bd15579dc79A6827cB4686A3592c8",
    vTokenBalance: "1831.128652",
    vTokenBalanceMantissa: "183112865219",
    exchangeRateStored: "205478504999369501621215120",
    underlyingAddress: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
    underlyingDecimals: 18,
    underlyingAmount: "37625757791351165230",
  },
  {
    symbol: "vLTC",
    vTokenAddress: "0x57A5297F2cB2c0AaC9D554660acd6D385Ab50c6B",
    vTokenBalance: "11741.25836",
    vTokenBalanceMantissa: "1174125836305",
    exchangeRateStored: "202576393130566399493358030",
    underlyingAddress: "0x4338665CBB7B2485A8855A139b75D5e34AB0DB94",
    underlyingDecimals: 18,
    underlyingAmount: "237850177000076730863",
  },
  {
    symbol: "vXRP",
    vTokenAddress: "0xB248a295732e0225acd3337607cc01068e3b9c10",
    vTokenBalance: "1609283.638",
    vTokenBalanceMantissa: "160928363785777",
    exchangeRateStored: "202911146685096474019972495",
    underlyingAddress: "0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE",
    underlyingDecimals: 18,
    underlyingAmount: "32654158829928364169881",
  },
  {
    symbol: "vBCH",
    vTokenAddress: "0x5F0388EBc2B94FA8E123F404b79cCF5f40b29176",
    vTokenBalance: "44.68371414",
    vTokenBalanceMantissa: "4468371414",
    exchangeRateStored: "206607806277697373340160596",
    underlyingAddress: "0x8fF795a6F4D97E7887C79beA79aba5cc76444aDf",
    underlyingDecimals: 18,
    underlyingAmount: "923200415480512689",
  },
  {
    symbol: "vDOT",
    vTokenAddress: "0x1610bc33319e9398de5f57B33a5b184c806aD217",
    vTokenBalance: "27568.46755",
    vTokenBalanceMantissa: "2756846755130",
    exchangeRateStored: "222634939637868984652973090",
    underlyingAddress: "0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402",
    underlyingDecimals: 18,
    underlyingAmount: "613770410919222527609",
  },
  {
    symbol: "vLINK",
    vTokenAddress: "0x650b940a1033B8A1b1873f78730FcFC73ec11f1f",
    vTokenBalance: "20534.84577",
    vTokenBalanceMantissa: "2053484577200",
    exchangeRateStored: "203199152361625425762425387",
    underlyingAddress: "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD",
    underlyingDecimals: 18,
    underlyingAmount: "417266325474710768927",
  },
  {
    symbol: "vDAI",
    vTokenAddress: "0x334b3eCB4DCa3593BCCC3c7EBD1A1C1d1780FBF1",
    vTokenBalance: "128787.7534",
    vTokenBalanceMantissa: "12878775340379",
    exchangeRateStored: "221962249680662354206736685",
    underlyingAddress: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",
    underlyingDecimals: 18,
    underlyingAmount: "2858601947682360894853",
  },
  {
    symbol: "vFIL",
    vTokenAddress: "0xf91d58b5aE142DAcC749f58A49FCBac340Cb0343",
    vTokenBalance: "139388.9578",
    vTokenBalanceMantissa: "13938895782926",
    exchangeRateStored: "206512732513760771825326912",
    underlyingAddress: "0x0D8Ce2A99Bb6e3B7Db580eD848240e4a0F9aE153",
    underlyingDecimals: 18,
    underlyingAmount: "2878559456356585069661",
  },
  {
    symbol: "vBETH",
    vTokenAddress: "0x972207A639CC1B374B893cc33Fa251b55CEB7c07",
    vTokenBalance: "13.55242648",
    vTokenBalanceMantissa: "1355242648",
    exchangeRateStored: "205141843674062569272416475",
    underlyingAddress: "0x250632378E573c6Be1AC2f97Fcdf00515d0Aa91B",
    underlyingDecimals: 18,
    underlyingAmount: "278016975436269725",
  },
  {
    symbol: "vADA",
    vTokenAddress: "0x9A0AF7FDb2065Ce470D72664DE73cAE409dA28Ec",
    vTokenBalance: "2595611.112",
    vTokenBalanceMantissa: "259561111178062",
    exchangeRateStored: "207604086899953879025630165",
    underlyingAddress: "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47",
    underlyingDecimals: 18,
    underlyingAmount: "53885947480858973610232",
  },
  {
    symbol: "vDOGE",
    vTokenAddress: "0xec3422Ef92B2fb59e84c8B02Ba73F1fE84Ed8D71",
    vTokenBalance: "1390358.078",
    vTokenBalanceMantissa: "139035807800630",
    exchangeRateStored: "20285488717235947",
    underlyingAddress: "0xbA2aE424d960c26247Dd6c32edC70B295c744C43",
    underlyingDecimals: 8,
    underlyingAmount: "2820409310431",
  },
  {
    symbol: "vMATIC",
    vTokenAddress: "0x5c9476FcD6a4F9a3654139721c949c2233bBbBc8",
    vTokenBalance: "73945.92897",
    vTokenBalanceMantissa: "7394592896686",
    exchangeRateStored: "208505580486174117037233981",
    underlyingAddress: "0xCC42724C6683B7E57334c4E856f4c9965ED682bD",
    underlyingDecimals: 18,
    underlyingAmount: "1541813884382454180276",
  },
  {
    symbol: "vCAKE",
    vTokenAddress: "0x86aC3974e2BD0d60825230fa6F355fF11409df5c",
    vTokenBalance: "329996.4915",
    vTokenBalanceMantissa: "32999649151776",
    exchangeRateStored: "276797508957824755004165914",
    underlyingAddress: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
    underlyingDecimals: 18,
    underlyingAmount: "9134220681693791438231",
  },
  {
    symbol: "vAAVE",
    vTokenAddress: "0x26DA28954763B92139ED49283625ceCAf52C6f94",
    vTokenBalance: "392.7567067",
    vTokenBalanceMantissa: "39275670672",
    exchangeRateStored: "206885049449354826174292817",
    underlyingAddress: "0xfb6115445Bff7b52FeB98650C87f44907E58f802",
    underlyingDecimals: 18,
    underlyingAmount: "8125549069133295096",
  },
  {
    symbol: "vTRXOLD",
    vTokenAddress: "0x61eDcFe8Dd6bA3c891CB9bEc2dc7657B3B422E93",
    vTokenBalance: "289015.6145",
    vTokenBalanceMantissa: "28901561446948",
    exchangeRateStored: "210423011871838831131243488",
    underlyingAddress: "0x85EAC5Ac2F758618dFa09bDbe0cf174e7d574D5B",
    underlyingDecimals: 18,
    underlyingAmount: "6081553607465818470202",
  },
  {
    symbol: "vTRX",
    vTokenAddress: "0xC5D3466aA484B040eE977073fcF337f2c00071c1",
    vTokenBalance: "3512.53533",
    vTokenBalanceMantissa: "351253533026",
    exchangeRateStored: "10255238096725",
    underlyingAddress: "0xCE7de646e7208a4Ef112cb6ed5038FA6cC6b12e3",
    underlyingDecimals: 6,
    underlyingAmount: "3602188613",
  },
  {
    symbol: "vWBETH",
    vTokenAddress: "0x6CFdEc747f37DAf3b87a35a1D9c8AD3063A1A8A0",
    vTokenBalance: "0",
    vTokenBalanceMantissa: "0",
    exchangeRateStored: "10009281505184402009699016023",
    underlyingAddress: "0xa2E3356610840701BDf5611a53974510Ae27E2e1",
    underlyingDecimals: 18,
    underlyingAmount: "0",
  },
  {
    symbol: "vTUSD",
    vTokenAddress: "0xBf762cd5991cA1DCdDaC9ae5C638F5B5Dc3Bee6E",
    vTokenBalance: "0",
    vTokenBalanceMantissa: "0",
    exchangeRateStored: "10093515247465409251768430378",
    underlyingAddress: "0x40af3827F39D0EAcBF4A168f8D4ee67c121D11c9",
    underlyingDecimals: 18,
    underlyingAmount: "0",
  },
];

export const vip188 = () => {
  const meta = {
    version: "v2",
    title: "VIP-188 VIP to redeem VTokens in the Treasury",
    description: `upgrade the implementation of the Vtoken core supportimg Automatic income allocation feature.`,
    forDescription: "I agree that Venus Protocol should proceed with VIP to redeem VTokens in the Treasury",
    againstDescription: "I do not think that Venus Protocol should proceed with VIP to redeem VTokens in the Treasury",
    abstainDescription:
      "I am indifferent to whether Venus Protocol proceeds with VIP to redeem VTokens in the Treasury or not",
  };

  return makeProposal(
    [
      ...VTOKEN_SNAPSHOT.map(object => {
        if (object.symbol === "vBNB") {
          return {
            target: VTREASURY,
            signature: "withdrawTreasuryBNB(uint256,address)",
            params: [object.vTokenBalanceMantissa, NORMAL_TIMELOCK],
          };
        } else {
          return {
            target: VTREASURY,
            signature: "withdrawTreasuryBEP20(address,uint256,address)",
            params: [object.vTokenAddress, object.vTokenBalanceMantissa, NORMAL_TIMELOCK],
          };
        }
      }),

      ...VTOKEN_SNAPSHOT.map(object => {
        return {
          target: object.vTokenAddress,
          signature: "redeem(uint)",
          params: [object.vTokenBalanceMantissa],
        };
      }),

      ...VTOKEN_SNAPSHOT.map(object => {
        if (object.symbol === "vBNB") {
          return {
            target: VTREASURY,
            signature: "",
            params: [],
            val: object.underlyingAmount,
          };
        } else {
          return {
            target: object.underlyingAddress,
            signature: "transfer(address,uint256)",
            params: [VTREASURY, object.underlyingAmount],
          };
        }
      }),
    ],
    meta,
    ProposalType.REGULAR,
  );
};
