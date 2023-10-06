import { parseUnits } from "@ethersproject/units";
import { BigNumber, BigNumberish } from "ethers";

import { Command, ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const BUYBACK_WALLET = "0x6657911F7411765979Da0794840D671Be55bA273";
const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";

const USDT = "0x55d398326f99059fF775485246999027B3197955";
const USDT_FOR_BUYBACK = parseUnits("22793.63", 18);
const PERCENT_OF_RESERVES_FOR_BUYBACK = "10"; // %

interface ReservesRecord {
  vToken: string;
  underlying: string;
  reservesMantissa: BigNumberish;
}

interface ILIncomeRecord {
  tokenName: string;
  underlying: string;
  totalIncome: BigNumberish;
}

// All vTokens except:
//   * vXVS (the amount is too small)
//   * vCAN, vLUNA, vUST (all three are deprecated),
//   * vBUSD (the reserves for this token will be used to repay the shortfall),
//   * vTUSDOLD (not enough liquidity)
// Snapshot taken at block 32208206 (2023-09-30 23:59:59 UTC)
const RESERVES = [
  {
    vToken: "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8",
    underlying: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    reservesMantissa: "98498926789255473836157",
  },
  {
    vToken: "0xfD5840Cd36d94D7229439859C0112a4185BC0255",
    underlying: "0x55d398326f99059fF775485246999027B3197955",
    reservesMantissa: "184447370197292410062746",
  },
  {
    vToken: "0x2fF3d0F6990a40261c66E1ff2017aCBc282EB6d0",
    underlying: "0x47BEAd2563dCBf3bF2c9407fEa4dC236fAbA485A",
    reservesMantissa: "8934592094738016743491",
  },
  {
    vToken: "0xA07c5b74C9B40447a954e1466938b865b6BBea36",
    underlying: "0x0",
    reservesMantissa: "6011828235105929876367",
  },
  {
    vToken: "0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B",
    underlying: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
    reservesMantissa: "1561173017145913973",
  },
  {
    vToken: "0xf508fCD89b8bd15579dc79A6827cB4686A3592c8",
    underlying: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
    reservesMantissa: "40252435119110084050",
  },
  {
    vToken: "0x57A5297F2cB2c0AaC9D554660acd6D385Ab50c6B",
    underlying: "0x4338665CBB7B2485A8855A139b75D5e34AB0DB94",
    reservesMantissa: "7188826031818264737",
  },
  {
    vToken: "0xB248a295732e0225acd3337607cc01068e3b9c10",
    underlying: "0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE",
    reservesMantissa: "954029502612355561188",
  },
  {
    vToken: "0x5F0388EBc2B94FA8E123F404b79cCF5f40b29176",
    underlying: "0x8fF795a6F4D97E7887C79beA79aba5cc76444aDf",
    reservesMantissa: "13399846260516787700",
  },
  {
    vToken: "0x1610bc33319e9398de5f57B33a5b184c806aD217",
    underlying: "0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402",
    reservesMantissa: "1203135189324707831898",
  },
  {
    vToken: "0x650b940a1033B8A1b1873f78730FcFC73ec11f1f",
    underlying: "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD",
    reservesMantissa: "50536389354148166548",
  },
  {
    vToken: "0x334b3eCB4DCa3593BCCC3c7EBD1A1C1d1780FBF1",
    underlying: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",
    reservesMantissa: "5846359687973723281769",
  },
  {
    vToken: "0xf91d58b5aE142DAcC749f58A49FCBac340Cb0343",
    underlying: "0x0D8Ce2A99Bb6e3B7Db580eD848240e4a0F9aE153",
    reservesMantissa: "99836302133465558671",
  },
  {
    vToken: "0x972207A639CC1B374B893cc33Fa251b55CEB7c07",
    underlying: "0x250632378E573c6Be1AC2f97Fcdf00515d0Aa91B",
    reservesMantissa: "3674377922773556",
  },
  {
    vToken: "0x9A0AF7FDb2065Ce470D72664DE73cAE409dA28Ec",
    underlying: "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47",
    reservesMantissa: "8138480609647517985902",
  },
  {
    vToken: "0xec3422Ef92B2fb59e84c8B02Ba73F1fE84Ed8D71",
    underlying: "0xbA2aE424d960c26247Dd6c32edC70B295c744C43",
    reservesMantissa: "325213779187",
  },
  {
    vToken: "0x5c9476FcD6a4F9a3654139721c949c2233bBbBc8",
    underlying: "0xCC42724C6683B7E57334c4E856f4c9965ED682bD",
    reservesMantissa: "1101397574014436881481",
  },
  {
    vToken: "0x86aC3974e2BD0d60825230fa6F355fF11409df5c",
    underlying: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
    reservesMantissa: "5618812258113588970706",
  },
  {
    vToken: "0x26DA28954763B92139ED49283625ceCAf52C6f94",
    underlying: "0xfb6115445Bff7b52FeB98650C87f44907E58f802",
    reservesMantissa: "3111309082634439242",
  },
  {
    vToken: "0x61eDcFe8Dd6bA3c891CB9bEc2dc7657B3B422E93",
    underlying: "0x85EAC5Ac2F758618dFa09bDbe0cf174e7d574D5B",
    reservesMantissa: "14866230131031181003978",
  },
  {
    vToken: "0xC5D3466aA484B040eE977073fcF337f2c00071c1",
    underlying: "0xCE7de646e7208a4Ef112cb6ed5038FA6cC6b12e3",
    reservesMantissa: "12719006997",
  },
  {
    vToken: "0x6CFdEc747f37DAf3b87a35a1D9c8AD3063A1A8A0",
    underlying: "0xa2E3356610840701BDf5611a53974510Ae27E2e1",
    reservesMantissa: "406314994676354653",
  },
  {
    vToken: "0xBf762cd5991cA1DCdDaC9ae5C638F5B5Dc3Bee6E",
    underlying: "0x40af3827F39D0EAcBF4A168f8D4ee67c121D11c9",
    reservesMantissa: "2180434412870916662487",
  },
];

const IL_INCOME: ILIncomeRecord[] = [
  {
    tokenName: "HAY_Stablecoins",
    underlying: "0x0782b6d8c4551B9760e74c0545a9bCD90bdc41E5",
    totalIncome: "227841726404150047770",
  },
  {
    tokenName: "BSW_DeFi",
    underlying: "0x965F527D9159dCe6288a2219DB51fc6Eef120dD1",
    totalIncome: "3742976395258453300631",
  },
  {
    tokenName: "TWT_DeFi",
    underlying: "0x4B0F1812e5Df2A09796481Ff14017e6005508003",
    totalIncome: "39190899156773316",
  },
  {
    tokenName: "RACA_GameFi",
    underlying: "0x12BB890508c125661E03b09EC06E404bc9289040",
    totalIncome: "633448752331009233640759",
  },
  {
    tokenName: "FLOKI_GameFi",
    underlying: "0xfb5B838b6cfEEdC2873aB27866079AC55363D37E",
    totalIncome: "354165365111570367",
  },
  {
    tokenName: "BNBx_LiquidStakedBNB",
    underlying: "0x1bdd3Cf7F79cfB8EdbB955f20ad99211551BA275",
    totalIncome: "1172620649237200345",
  },
  {
    tokenName: "stkBNB_LiquidStakedBNB",
    underlying: "0xc2E9d07F66A89c44062459A47a0D2Dc038E4fb16",
    totalIncome: "416834061143724483",
  },
  {
    tokenName: "WBNB_LiquidStakedBNB",
    underlying: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    totalIncome: "1187200301778226534",
  },
  {
    tokenName: "BTT_Tron",
    underlying: "0x352Cb5E19b12FC216548a2677bD0fce83BaE434B",
    totalIncome: "2785014424758029079102709203",
  },
  {
    tokenName: "TRX_Tron",
    underlying: "0xCE7de646e7208a4Ef112cb6ed5038FA6cC6b12e3",
    totalIncome: "3667377278",
  },
  {
    tokenName: "WIN_Tron",
    underlying: "0xaeF0d72a118ce24feE3cD1d43d383897D05B4e99",
    totalIncome: "2824821053197039938432999",
  },
  {
    tokenName: "USDD",
    underlying: "0xd17479997F34dd9156Deef8F95A52D81D265be9c",
    totalIncome: "784927868707361292702",
  },
  {
    tokenName: "USDT",
    underlying: "0x55d398326f99059fF775485246999027B3197955",
    totalIncome: "747650370762189142817",
  },
  {
    tokenName: "ankrBNB",
    underlying: "0x52F24a5e03aee338Da5fd9Df68D2b6FAe1178827",
    totalIncome: "5792194256144213293",
  },
];

export const vip183 = () => {
  const meta = {
    version: "v2",
    title: "VIP-183 Reserves withdrawal",
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

      ...IL_INCOME.map(({ underlying, totalIncome }: ILIncomeRecord) => {
        const buybackShare = BigNumber.from(totalIncome).mul(PERCENT_OF_RESERVES_FOR_BUYBACK).div(100);
        return {
          target: TREASURY,
          signature: "withdrawTreasuryBEP20(address,uint256,address)",
          params: [underlying, buybackShare, BUYBACK_WALLET],
        };
      }),
    ],
    meta,
    ProposalType.REGULAR,
  );
};
