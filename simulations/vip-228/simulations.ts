import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { vip228 } from "../../vips/vip-228";
import ERC20_ABI from "./abi/ERC20.json";
import VTreasurer_ABI from "./abi/VTreasury.json";

const VTREASURY = "0xf322942f644a996a617bd29c16bd7d231d9f35e9";
const BINANCE_WALLET = "0x6657911F7411765979Da0794840D671Be55bA273";

interface Token {
  name: string;
  address: string;
  originalTreasuryBalance?: BigNumber;
  originalBinanceBalance?: BigNumber;
}

const TOKENS: Token[] = [
  {
    name: "ETH",
    address: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
  },
  {
    name: "CAKE",
    address: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
  },
  {
    name: "ADA",
    address: "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47",
  },
  {
    name: "TUSD_OLD",
    address: "0x14016E85a25aeb13065688cAFB43044C2ef86784",
  },
  {
    name: "DOT",
    address: "0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402",
  },
  {
    name: "XRP",
    address: "0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE",
  },
  {
    name: "BETH",
    address: "0x250632378E573c6Be1AC2f97Fcdf00515d0Aa91B",
  },
  {
    name: "FIL",
    address: "0x0D8Ce2A99Bb6e3B7Db580eD848240e4a0F9aE153",
  }, 
  {
    name: "LINK",
    address: "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD",
  }, 
  {
    name: "LTC",
    address: "0x4338665CBB7B2485A8855A139b75D5e34AB0DB94",
  }, 
  {
    name: "BCH",
    address: "0x8fF795a6F4D97E7887C79beA79aba5cc76444aDf",
  },
  {
    name: "TRX_OLD",
    address: "0x85EAC5Ac2F758618dFa09bDbe0cf174e7d574D5B",
  },
  {
    name: "DOGE",
    address: "0xbA2aE424d960c26247Dd6c32edC70B295c744C43",
  },
  {
    name: "FLOKI",
    address: "0xfb5B838b6cfEEdC2873aB27866079AC55363D37E",
  },
  {
    name: "MATIC",
    address: "0xCC42724C6683B7E57334c4E856f4c9965ED682bD",
  }, 
  {
    name: "TRX",
    address: "0xCE7de646e7208a4Ef112cb6ed5038FA6cC6b12e3",
  },
  {
    name: "SXP",
    address: "0x47BEAd2563dCBf3bF2c9407fEa4dC236fAbA485A",
  },
  {
    name: "AAVE",
    address: "0xfb6115445Bff7b52FeB98650C87f44907E58f802",
  },
  {
    name: "TUSD",
    address: "0x40af3827F39D0EAcBF4A168f8D4ee67c121D11c9",
  },
  {
    name: "BTT",
    address: "0x352Cb5E19b12FC216548a2677bD0fce83BaE434B",
  }
]

forking(34945549, () => {
  describe("Pre-VIP behavior", async () => {
    it("Check Balances", async () => {
      for (let i = 0; i < TOKENS.length; i++) {
        const token = TOKENS[i];
        const tokenContract = new ethers.Contract(token.address, ERC20_ABI, ethers.provider);
        const balance = await tokenContract.balanceOf(VTREASURY);
        TOKENS[i].originalTreasuryBalance = balance;
        const binanceBalance = await tokenContract.balanceOf(BINANCE_WALLET);
        TOKENS[i].originalBinanceBalance = binanceBalance;
      }
    });
  });

  testVip("VIP-228", vip228(), {
    callbackAfterExecution: async txResponse => {
      expectEvents(txResponse, [VTreasurer_ABI], ["WithdrawTreasuryBEP20"], [20]); 
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Check Balance", async () => {
      for (let i = 0; i < TOKENS.length; i++) {
        const token = TOKENS[i];
        const tokenContract = new ethers.Contract(token.address, ERC20_ABI, ethers.provider);
        const balance = await tokenContract.balanceOf(BINANCE_WALLET);
        expect(balance).to.be.gt(token.originalBinanceBalance);
        const treasuryBalance = await tokenContract.balanceOf(VTREASURY);
        expect(treasuryBalance).to.be.lt(token.originalTreasuryBalance);
      }
    });
  });
});