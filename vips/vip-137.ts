import { parseUnits } from "@ethersproject/units";
import { BigNumber, BigNumberish } from "ethers";
import { Command, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const BUYBACK_WALLET = "0x6657911F7411765979Da0794840D671Be55bA273";
const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";

const USDT = "0x55d398326f99059fF775485246999027B3197955";
const USDT_FOR_BUYBACK = parseUnits("33100.15", 18);
const PERCENT_OF_RESERVES_FOR_BUYBACK = "10"; // %

interface ReservesRecord {
  vToken: string;
  underlying: string;
  reservesMantissa: BigNumberish;
}

// All vTokens except vXVS (the amount is too small), vCAN, vLUNA, vUST (all three are deprecated)
// Snapshot taken at block 29567407 (2023-07-01 00:00 UTC)
const RESERVES = [
  {
    vToken: "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8",
    underlying: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    reservesMantissa: "90961409346731916424825",
  },
  {
    vToken: "0xfD5840Cd36d94D7229439859C0112a4185BC0255",
    underlying: "0x55d398326f99059fF775485246999027B3197955",
    reservesMantissa: "233809677763043735616026",
  },
  {
    vToken: "0x95c78222B3D6e262426483D42CfA53685A67Ab9D",
    underlying: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
    reservesMantissa: "64463417110550913112941",
  },
  {
    vToken: "0x2fF3d0F6990a40261c66E1ff2017aCBc282EB6d0",
    underlying: "0x47BEAd2563dCBf3bF2c9407fEa4dC236fAbA485A",
    reservesMantissa: "494639419180226659341",
  },
  {
    vToken: "0xA07c5b74C9B40447a954e1466938b865b6BBea36",
    underlying: "0x0",
    reservesMantissa: "5084994899629357449589",
  },
  {
    vToken: "0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B",
    underlying: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
    reservesMantissa: "2056911838950556722",
  },
  {
    vToken: "0xf508fCD89b8bd15579dc79A6827cB4686A3592c8",
    underlying: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
    reservesMantissa: "41691901781483610797",
  },
  {
    vToken: "0x57A5297F2cB2c0AaC9D554660acd6D385Ab50c6B",
    underlying: "0x4338665CBB7B2485A8855A139b75D5e34AB0DB94",
    reservesMantissa: "10073898629971519904",
  },
  {
    vToken: "0xB248a295732e0225acd3337607cc01068e3b9c10",
    underlying: "0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE",
    reservesMantissa: "4138395604110168816948",
  },
  {
    vToken: "0x5F0388EBc2B94FA8E123F404b79cCF5f40b29176",
    underlying: "0x8fF795a6F4D97E7887C79beA79aba5cc76444aDf",
    reservesMantissa: "12065935254849409839",
  },
  {
    vToken: "0x1610bc33319e9398de5f57B33a5b184c806aD217",
    underlying: "0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402",
    reservesMantissa: "760620735344563984100",
  },
  {
    vToken: "0x650b940a1033B8A1b1873f78730FcFC73ec11f1f",
    underlying: "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD",
    reservesMantissa: "109497011916499044609",
  },
  {
    vToken: "0x334b3eCB4DCa3593BCCC3c7EBD1A1C1d1780FBF1",
    underlying: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",
    reservesMantissa: "5811171300950137067313",
  },
  {
    vToken: "0xf91d58b5aE142DAcC749f58A49FCBac340Cb0343",
    underlying: "0x0D8Ce2A99Bb6e3B7Db580eD848240e4a0F9aE153",
    reservesMantissa: "158937700786393512140",
  },
  {
    vToken: "0x972207A639CC1B374B893cc33Fa251b55CEB7c07",
    underlying: "0x250632378E573c6Be1AC2f97Fcdf00515d0Aa91B",
    reservesMantissa: "2076296975837897759",
  },
  {
    vToken: "0x9A0AF7FDb2065Ce470D72664DE73cAE409dA28Ec",
    underlying: "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47",
    reservesMantissa: "12620546363462281314145",
  },
  {
    vToken: "0xec3422Ef92B2fb59e84c8B02Ba73F1fE84Ed8D71",
    underlying: "0xbA2aE424d960c26247Dd6c32edC70B295c744C43",
    reservesMantissa: "1039761441049",
  },
  {
    vToken: "0x5c9476FcD6a4F9a3654139721c949c2233bBbBc8",
    underlying: "0xCC42724C6683B7E57334c4E856f4c9965ED682bD",
    reservesMantissa: "933570380156715396491",
  },
  {
    vToken: "0x86aC3974e2BD0d60825230fa6F355fF11409df5c",
    underlying: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
    reservesMantissa: "14715064271203166443818",
  },
  {
    vToken: "0x26DA28954763B92139ED49283625ceCAf52C6f94",
    underlying: "0xfb6115445Bff7b52FeB98650C87f44907E58f802",
    reservesMantissa: "4678846229762904367",
  },
  {
    vToken: "0x08CEB3F4a7ed3500cA0982bcd0FC7816688084c3",
    underlying: "0x14016E85a25aeb13065688cAFB43044C2ef86784",
    reservesMantissa: "36270002169949939676791",
  },
  {
    vToken: "0x61eDcFe8Dd6bA3c891CB9bEc2dc7657B3B422E93",
    underlying: "0x85EAC5Ac2F758618dFa09bDbe0cf174e7d574D5B",
    reservesMantissa: "24062474042584016635599",
  },
  {
    vToken: "0xC5D3466aA484B040eE977073fcF337f2c00071c1",
    underlying: "0xCE7de646e7208a4Ef112cb6ed5038FA6cC6b12e3",
    reservesMantissa: "25125144850",
  },
  {
    vToken: "0x6CFdEc747f37DAf3b87a35a1D9c8AD3063A1A8A0",
    underlying: "0xa2E3356610840701BDf5611a53974510Ae27E2e1",
    reservesMantissa: "50916632995234085",
  },
  {
    vToken: "0xBf762cd5991cA1DCdDaC9ae5C638F5B5Dc3Bee6E",
    underlying: "0x40af3827F39D0EAcBF4A168f8D4ee67c121D11c9",
    reservesMantissa: "266347539258767550653",
  },
];

export const vip137 = () => {
  const meta = {
    version: "v2",
    title: "VIP-137 Reserves withdrawal",
    description: ``,
    forDescription: "I agree that Venus Protocol should withdraw the reserves",
    againstDescription: "I do not think that Venus Protocol should proceed with withdrawing the reserves",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with withdrawing the reserves or not",
  };

  const transferBNB = (target: string, amount: BigNumberish): Command => {
    return {
      target: target,
      signature: "",
      params: [],
      value: amount.toString(),
    };
  };

  const transferTokens = (token: string, target: string, amount: BigNumberish): Command => ({
    target: token,
    signature: "transfer(address,uint256)",
    params: [target, amount],
  });

  const transfer = (token: string, target: string, amount: BigNumberish): Command => {
    if (token === "0x0") {
      return transferBNB(target, amount);
    }
    return transferTokens(token, target, amount);
  };

  return makeProposal(
    [
      ...RESERVES.flatMap(({ vToken, underlying, reservesMantissa }: ReservesRecord) => {
        const reserve = BigNumber.from(reservesMantissa);
        const buybackShare = reserve.mul(PERCENT_OF_RESERVES_FOR_BUYBACK).div(100);
        const treasuryShare = reserve.sub(buybackShare);

        console.log(`underlying: ${underlying}`);
        console.log(`  reserves: ${reservesMantissa}`);
        console.log(`   buyback: ${buybackShare.toString()}`);
        console.log(`  treasury: ${treasuryShare.toString()}`);

        return [
          {
            target: vToken,
            signature: "_reduceReserves(uint256)",
            params: [reservesMantissa],
          },
          transfer(underlying, BUYBACK_WALLET, buybackShare),
          transfer(underlying, TREASURY, treasuryShare),
        ];
      }),

      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, USDT_FOR_BUYBACK, BUYBACK_WALLET],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
