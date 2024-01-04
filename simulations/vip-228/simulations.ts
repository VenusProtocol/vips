import { expect } from "chai";
import { BigNumber } from "ethers";
import { formatEther, parseEther, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents, setMaxStalePeriodInBinanceOracle, setMaxStalePeriodInChainlinkOracle } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { vip228 } from "../../vips/vip-228";
import ERC20_ABI from "./abi/ERC20.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import VTreasurer_ABI from "./abi/VTreasury.json";

const VTREASURY = "0xf322942f644a996a617bd29c16bd7d231d9f35e9";
const BINANCE_WALLET = "0x6657911F7411765979Da0794840D671Be55bA273";
const RESILIENT_ORACLE = "0x6592b5DE802159F3E74B2486b091D11a8256ab8A";
const CHAINLINK_ORACLE = "0x1B2103441A0A108daD8848D8F5d790e4D402921F";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const BINANCE_ORACLE = "0x594810b741d136f1960141C0d8Fb4a91bE78A820";
const REDSTONE_ORACLE = "0x8455EFA4D7Ff63b8BFD96AdD889483Ea7d39B70a";
const TRX_FEED_REDSTONE = "0xa17362dd9AD6d0aF646D7C8f8578fddbfc90B916";

interface Token {
  name: string;
  address: string;
  originalTreasuryBalance?: BigNumber;
  originalBinanceBalance?: BigNumber;
  feed?: string;
  binanceOracle?: boolean;
  amount?: BigNumber;
  usdValue: string;
}

const TOKENS: Token[] = [
  {
    name: "ETH",
    address: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
    feed: "0x9ef1b8c0e4f7dc8bf5719ea496883dc6401d5b2e",
    amount: parseUnits("69.89", 18),
    usdValue: "154983.884578"
  },
  {
    name: "CAKE",
    address: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
    feed: "0xb6064ed41d4f67e353768aa239ca86f4f73665a1",
    amount: parseUnits("54198.52", 18),
    usdValue: "172381.0426256428"
  },
  {
    name: "ADA",
    address: "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47",
    feed: "0xa767f745331D267c7751297D982b050c93985627",
    amount: parseUnits("107165.54", 18),
    usdValue: "60045.0974710866"
  },
  {
    name: "TUSD_OLD",
    address: "0x14016E85a25aeb13065688cAFB43044C2ef86784",
    feed: "0xa3334a9762090e827413a7495afece76f41dfc06",
    amount: parseUnits("39233.57", 18),
    usdValue: "39229.6470353357"
  },
  {
    name: "DOT",
    address: "0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402",
    feed: "0xc333eb0086309a16aa7c8308dfd32c8bba0a2592",
    amount: parseUnits("4845.75", 18),
    usdValue: "36755.78926383"
  },
  {
    name: "XRP",
    address: "0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE",
    feed: "0x93a67d414896a280bf8ffb3b389fe3686e014fda",
    amount: parseUnits("61727.99", 18),
    usdValue: "35491.1251304"
  },
  {
    name: "BETH",
    address: "0x250632378E573c6Be1AC2f97Fcdf00515d0Aa91B",
    feed: "0x2a3796273d47c4ed363b361d3aefb7f7e2a13782",
    amount: parseUnits("14.98882392", 18),
    usdValue: "33187.0511528330633208"
  },
  {
    name: "FIL",
    address: "0x0D8Ce2A99Bb6e3B7Db580eD848240e4a0F9aE153",
    feed: "0xe5dbfd9003bff9df5feb2f4f445ca00fb121fb83",
    amount: parseUnits("3426.22", 18),
    usdValue: "21675.5086283596"
  },
  {
    name: "LINK",
    address: "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD",
    feed: "0xca236e327f629f9fc2c30a4e95775ebf0b89fac8",
    amount: parseUnits("1474.51885596", 18),
    usdValue: "21051.15718552650288"
  },
  {
    name: "LTC",
    address: "0x4338665CBB7B2485A8855A139b75D5e34AB0DB94",
    feed: "0x74e72f37a8c415c8f1a98ed42e78ff997435791d",
    amount: parseUnits("306.882774686205524558", 18),
    usdValue: "19980.378231834268031503"
  },
  {
    name: "BCH",
    address: "0x8fF795a6F4D97E7887C79beA79aba5cc76444aDf",
    feed: "0x43d80f616daf0b0b42a928eed32147dc59027d41",
    amount: parseUnits("53.84898038", 18),
    usdValue: "12619.7916824529807868"
  },
  {
    name: "TRX_OLD",
    address: "0x85EAC5Ac2F758618dFa09bDbe0cf174e7d574D5B",
    feed: "0xF4C5e535756D11994fCBB12Ba8adD0192D9b88be",
    amount: parseUnits("72175.747054974582785017", 18),
    usdValue: "7752.191290295713259377"
  },
  {
    name: "DOGE",
    address: "0xbA2aE424d960c26247Dd6c32edC70B295c744C43",
    feed: "0x3ab0a0d137d4f946fbb19eecc6e92e64660231c8",
    amount: parseUnits("98579.90244918", 8),
    usdValue: "8096.0982650174671386"
  },
  {
    name: "FLOKI",
    address: "0xfb5B838b6cfEEdC2873aB27866079AC55363D37E",
    binanceOracle: true,
    amount: parseUnits("177082682.555785183", 9),
    usdValue: "5696.74989781960933711"
  },
  {
    name: "MATIC",
    address: "0xCC42724C6683B7E57334c4E856f4c9965ED682bD",
    feed: "0x7ca57b0ca6367191c94c8914d7df09a57655905f",
    amount: parseUnits("6242.52", 18),
    usdValue: "5359.2119722524"
  },
  {
    name: "TRX",
    address: "0xCE7de646e7208a4Ef112cb6ed5038FA6cC6b12e3",
    feed: "0xf4c5e535756d11994fcbb12ba8add0192d9b88be",
    amount: parseUnits("40954.233946", 6),
    usdValue: "4398.7775485731139"
  },
  {
    name: "SXP",
    address: "0x47BEAd2563dCBf3bF2c9407fEa4dC236fAbA485A",
    feed: "0xe188a9875af525d25334d75f3327863b2b8cd0f1",
    amount: parseUnits("32622.12", 18),
    usdValue: "12243.8586948984"
  },
  {
    name: "AAVE",
    address: "0xfb6115445Bff7b52FeB98650C87f44907E58f802",
    feed: "0xa8357bf572460fc40f4b0acacbb2a6a61c89f475",
    amount: parseUnits("28.45", 18),
    usdValue: "2914.7050135575"
  },
  {
    name: "TUSD",
    address: "0x40af3827F39D0EAcBF4A168f8D4ee67c121D11c9",
    feed: "0xa3334A9762090E827413A7495AfeCE76F41dFc06",
    amount: parseUnits("2201.65", 18),
    usdValue: "2201.4298570165"
  },
  {
    name: "BTT",
    address: "0x352Cb5E19b12FC216548a2677bD0fce83BaE434B",
    binanceOracle: true,
    amount: parseUnits("1392507212.37901", 6),
    usdValue: "0.000000001531757933"
  },
];

forking(34945549, () => {
  let resilientOracle: ethers.Contract;

  before(async () => {
    const provider = ethers.provider;
    resilientOracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
  });

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
    before(async () => {
      for (let i = 0; i < TOKENS.length; i++) {
        const token = TOKENS[i];
        if (token.binanceOracle) {
          await setMaxStalePeriodInBinanceOracle(BINANCE_ORACLE, token.name);
          continue;
        }

        if (token.name.includes("TRX")) {
          await setMaxStalePeriodInChainlinkOracle(REDSTONE_ORACLE, token.address, TRX_FEED_REDSTONE, NORMAL_TIMELOCK);
        }

        await setMaxStalePeriodInChainlinkOracle(CHAINLINK_ORACLE, token.address, token.feed || "", NORMAL_TIMELOCK);
      }
    });
    it("Check Balance", async () => {
      for (let i = 0; i < TOKENS.length; i++) {
        const token = TOKENS[i];
        const tokenContract = new ethers.Contract(token.address, ERC20_ABI, ethers.provider);
        const treasuryBalance = await tokenContract.balanceOf(VTREASURY);
        expect(treasuryBalance.add(token.amount)).to.be.eq(token.originalTreasuryBalance);

        const binanceBalance = await tokenContract.balanceOf(BINANCE_WALLET);
        expect(binanceBalance.sub(token.amount)).to.be.eq(token.originalBinanceBalance);

        const usdValue = (await resilientOracle.getPrice(token.address)).mul(token.amount);
        expect(formatEther(formatEther(usdValue).split(".")[0])).to.be.eq(token.usdValue);
      }
    });
  });
});
