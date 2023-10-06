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

// All vTokens except:
//   * vXVS (the amount is too small)
//   * vCAN, vLUNA, vUST (all three are deprecated),
//   * vBUSD (the reserves for this token will be used to repay the shortfall),
//   * vTUSDOLD (not enough liquidity)
//   * IL pool assets
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

export const vip183 = () => {
  const meta = {
    version: "v2",
    title: "VIP-183 Quarterly XVS Buyback and Funds Allocation",
    description: `#### Description

VIP-183 relates to the Quarterly Venus Protocol XVS Buyback & Funds allocation as indicated in our Tokenomics.

#### Specifications

As per our Tokenomics v.3.1, this VIP will proceed to withdraw funds for our Quarterly Buyback and distributions. The complete details on our latest tokenomics are available here: [Revision of Venus Tokenomics](https://community.venus.io/t/proposal-for-revision-of-venus-protocol-tokenomics/3599)

Exceptionally for this quarter, we are proposing sending the BNB exploiter liquidation fees to the risk fund to be used towards active shortfalls repayment which will greatly benefit Venus in the long term.

Due to the depreciation of BUSD and TUSD (OLD), we will not be able to withdraw those reserves as there is no available liquidity. They will be withdrawn at a later date and we can proceed to adjust the distributions then.

Q3 Revenues Denominated in USD Were as Follows:

1 Liquidation Fee Revenue:

- vUSDC: $1,894.17
- vUSDT: $29,912.92
- vBUSD: $2,359.87
- vSXP: $1.19
- vXVS: $5,226.87
- vBNB: $23,566.01
- vBTC: $111,688.80
- vETH: $27,118.88
- vLTC: $4,887.78
- vXRP: $13,857.77
- vBCH: $166.37
- vDOT: $1,141.84
- vLINK: $1,491.03
- vDAI: $0.76
- vFIL: $250.98
- vBETH: $320.29
- vADA: $413.54
- vDOGE: $154.68
- vMATIC: $203.79
- vCAKE: $2,659.70
- vAAVE: $206.47
- vTUSDOLD: $267.97
- vTRXOLD: $114.49
- vTRX: $30.11

**Total: $227,936.29**

2 Reserve Revenue:

- USDC: $98,497.51
- USDT: $184,479.76
- SXP: $2,589.48
- BNB: $1,289,916.01
- BTCB: $42,098.59
- ETH: $67,272.47
- LTC: $474.64
- XRP: $491.37
- BCH: $3,141.49
- DOT: $4,935.95
- LINK: $413.64
- DAI: $5,845.55
- FIL: $334.99
- BETH: $6.14
- ADA: $2,066.92
- DOGE: $201.89
- MATIC: $587.02
- Cake: $6,568.77
- AAVE: $210.09
- TRXOLD: $1,317.43
- TRX: $1,127.14
- wBETH: $690.96
- TUSD: $2,177.59

**Total: $1,715,445.40**

**Total Protocol Revenues: 1,2 : $1,943,381.69**

- *Considering USD token prices from October 1, 2023*

**Estimated buyback values:**

- $194,338 USD for approximately 38k XVS
- 96K XVS from legacy rewards

Total: 135k XVS for Vault rewards

**Estimated Q4 2023 XVS Vault APR: 1480 XVS per day or 8.2% APR**`,
    forDescription: "I agree that Venus Protocol should proceed with the Buyback & Tokenomics Distribution",
    againstDescription: "I do not think that Venus Protocol should proceed with the Buyback & Tokenomics Distribution",
    abstainDescription:
      "I am indifferent to whether Venus Protocol proceeds with the Buyback & Tokenomics Distribution",
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
