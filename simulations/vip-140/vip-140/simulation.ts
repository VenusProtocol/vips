import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

import { forking, testVip } from "../../../src/vip-framework";

import PROXY_ABI from "./abi/proxy.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";
import BINANCE_ORACLE_ABI from "./abi/binanceOracle.json";
import CHAINLINK_ORACLE_ABI from "./abi/chainlinkOracle.json";
import { Signer, ethers } from "ethers";
import { vip140 } from "../../../vips/vip-140/vip-140";
import { parseUnits } from "ethers/lib/utils";
import { expectEvents } from "../../../src/utils";

const RESILIENT_ORACLE = "0x6592b5DE802159F3E74B2486b091D11a8256ab8A";
const RESILIENT_ORACLE_IMPL_OLD = "0xfE872ddeAe0A53486c25ed882786D592e302d80C";
const RESILIENT_ORACLE_IMPL = "0x95F9D968867E4fe89A1F768Ce853dB38d70eeC2B";

const CHAINLINK_ORACLE = "0x1B2103441A0A108daD8848D8F5d790e4D402921F";
const CHAINLINK_ORACLE_IMPL_OLD = "0xEebBfFC42e26386C631914e69B86aD398e91DD7f";
const CHAINLINK_ORACLE_IMPL = "0x38120f83734F719dc199109e09A822a80CD26EAd";

const BOUND_VALIDATOR = "0x6E332fF0bB52475304494E4AE5063c1051c7d735";
const BOUND_VALIDATOR_IMPL_OLD = "0x753192648599F58eEEd782cBf9A5880fFfEfd133";
const BOUND_VALIDATOR_IMPL = "0xCf0612CeafD63709d8f7EfE71EcD0aAbF075f6b1";

const BINANCE_ORACLE = "0x594810b741d136f1960141C0d8Fb4a91bE78A820";
const BINANCE_ORACLE_IMPL_OLD = "0xe38AbE42948ef249E84f4e935e4f56483C1EE3B9";
const BINANCE_ORACLE_IMPL = "0x8bf46792022126aE7f3ac8F4914Ed66e7DEb7388";

const TWAP_ORACLE = "0xea2f042e1A4f057EF8A5220e57733AD747ea8867";
const TWAP_ORACLE_IMPL_OLD = "0x17D00a8926566CB4b02B25f4EE6ecC2cEB34A784";
const TWAP_ORACLE_IMPL = "0x67c549A18AbfAd127b13F8d56738F43A21bB62A7";

const PYTH_ORACLE = "0xb893E38162f55fb80B18Aa44da76FaDf8E9B2262";
const PYTH_ORACLE_IMPL_OLD = "0x01e12AFa8D016D11dFBBde48e1a51038072b2129";
const PYTH_ORACLE_IMPL = "0x1b8dE8fe17735B80E30e1bAbcD78A20F573a3e9e";

const PROXY_ADMIN = "0x1BB765b741A5f3C2A338369DAb539385534E3343"
const COMPTROLLER = "0xfd36e2c2a6789db23113685031d7f16329158384";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";

const SD = "0x3bc5ac0dfdc871b365d159f728dd1b9a0b5481e8";

const DUMMY_SIGNER = "0xF474Cf03ccEfF28aBc65C9cbaE594F725c80e12d";
const MOCK_VTOKEN_CODE =
  "608060405234801561001057600080fd5b506101c3806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c806325671dcb1461003b5780636f307dc314610057575b600080fd5b610055600480360381019061005091906100f1565b610075565b005b61005f6100b8565b60405161006c9190610129565b60405180910390f35b806000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b6000813590506100eb81610176565b92915050565b60006020828403121561010357600080fd5b6000610111848285016100dc565b91505092915050565b61012381610144565b82525050565b600060208201905061013e600083018461011a565b92915050565b600061014f82610156565b9050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b61017f81610144565b811461018a57600080fd5b5056fea264697066735822122072c165598ea94093a05d15ef83a4a5cf715c200381a4687389a3455431698e7564736f6c63430008000033";
const MOCK_VTOKEN_ABI = [
  {
    inputs: [{ internalType: "address", name: "_asset", type: "address" }],
    name: "setUnderlyingAsset",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "underlying",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
];

interface TokenConfig {
  name: string;
  assetAddress: string;
  price: string;
}

const tokens: TokenConfig[] = [
  {
    name: "RACA",
    assetAddress: "0x12BB890508c125661E03b09EC06E404bc9289040",
    price: "0.00011653",
  },
  {
    name: "stkBNB",
    assetAddress: "0xc2E9d07F66A89c44062459A47a0D2Dc038E4fb16",
    price: "246.49764474",
  },
  {
    name: "USDD",
    assetAddress: "0xd17479997F34dd9156Deef8F95A52D81D265be9c",
    price: "0.99979993",
  },
  {
    name: "WBETH",
    assetAddress: "0xa2E3356610840701BDf5611a53974510Ae27E2e1",
    price: "1926.05167554",
  },
  {
    name: "ANKR",
    assetAddress: "0xf307910A4c7bbc79691fD374889b36d8531B08e3",
    price: "0.02498495",
  },
  {
    name: "ankrBNB",
    assetAddress: "0x52F24a5e03aee338Da5fd9Df68D2b6FAe1178827",
    price: "257.34608032",
  },
  {
    name: "BTT",
    assetAddress: "0x352Cb5E19b12FC216548a2677bD0fce83BaE434B",
    price: "0.00000047",
  },
  {
    name: "FLOKI",
    assetAddress: "0xfb5B838b6cfEEdC2873aB27866079AC55363D37E",
    price: "24070",
  },
  {
    name: "HAY",
    assetAddress: "0x0782b6d8c4551B9760e74c0545a9bCD90bdc41E5",
    price: "1.0010748",
  },
];

const chainlinkTokens: TokenConfig[] = [
  {
    name: "ALPACA",
    assetAddress: "0x8f0528ce5ef7b51152a59745befdd91d97091d2f",
    price: "0.14836879",
  },
  {
    name: "BIFI",
    assetAddress: "0xCa3F508B8e4Dd382eE878A314789373D80A5190A",
    price: "350.06",
  },
  {
    name: "BNBx",
    assetAddress: "0x1bdd3cf7f79cfb8edbb955f20ad99211551ba275",
    price: "258.0415293",
  },
  {
    name: "BSW",
    assetAddress: "0x965f527d9159dce6288a2219db51fc6eef120dd1",
    price: "0.09240646",
  },
  {
    name: "WBNB",
    assetAddress: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
    price: "241.5041",
  },
  {
    name: "WIN",
    assetAddress: "0xaeF0d72a118ce24feE3cD1d43d383897D05B4e99",
    price: "0.0000687",
  },
  {
    name: "WOO",
    assetAddress: "0x4691937a7508860f876c9c0a2a617e7d9e945d4b",
    price: "0.21463072",
  },
  {
    name: "USDC",
    assetAddress: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    price: "0.9999",
  },
  {
    name: "USDT",
    assetAddress: "0x55d398326f99059fF775485246999027B3197955",
    price: "1.0000924",
  },
  {
    name: "BUSD",
    assetAddress: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
    price: "1",
  },
  {
    name: "SXP",
    assetAddress: "0x47BEAd2563dCBf3bF2c9407fEa4dC236fAbA485A",
    price: "0.36402699",
  },
  {
    name: "XVS",
    assetAddress: "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63",
    price: "4.39021442",
  },
  {
    name: "BTCB",
    assetAddress: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
    price: "29977.1",
  },
  {
    name: "ETH",
    assetAddress: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
    price: "1908.08",
  },
  {
    name: "LTC",
    assetAddress: "0x4338665CBB7B2485A8855A139b75D5e34AB0DB94",
    price: "93.01",
  },
  {
    name: "XRP",
    assetAddress: "0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE",
    price: "0.7913001",
  },
  {
    name: "BCH",
    assetAddress: "0x8fF795a6F4D97E7887C79beA79aba5cc76444aDf",
    price: "245.20634004",
  },
  {
    name: "DOT",
    assetAddress: "0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402",
    price: "5.18647167",
  },
  {
    name: "LINK",
    assetAddress: "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD",
    price: "6.82403989",
  },
  {
    name: "DAI",
    assetAddress: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",
    price: "0.9999",
  },
  {
    name: "FIL",
    assetAddress: "0x0D8Ce2A99Bb6e3B7Db580eD848240e4a0F9aE153",
    price: "4.3010138",
  },
  {
    name: "BETH",
    assetAddress: "0x250632378E573c6Be1AC2f97Fcdf00515d0Aa91B",
    price: "1908.01573169",
  },
  {
    name: "ADA",
    assetAddress: "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47",
    price: "0.3157",
  },
  {
    name: "DOGE",
    assetAddress: "0xbA2aE424d960c26247Dd6c32edC70B295c744C43",
    price: "690547400",
  },
  {
    name: "MATIC",
    assetAddress: "0xCC42724C6683B7E57334c4E856f4c9965ED682bD",
    price: "0.7407",
  },
  {
    name: "CAKE",
    assetAddress: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
    price: "1.51107843",
  },
  {
    name: "AAVE",
    assetAddress: "0xfb6115445Bff7b52FeB98650C87f44907E58f802",
    price: "72.22214758",
  },
  {
    name: "TUSD",
    assetAddress: "0x14016E85a25aeb13065688cAFB43044C2ef86784",
    price: "0.99974863",
  },
  {
    name: "TRX",
    assetAddress: "0x85EAC5Ac2F758618dFa09bDbe0cf174e7d574D5B",
    price: "0.07992692",
  },
  {
    name: "TRX",
    assetAddress: "0xCE7de646e7208a4Ef112cb6ed5038FA6cC6b12e3",
    price: "79926920000",
  },
  {
    name: "BNB",
    assetAddress: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
    price: "241.5041",
  },
  {
    name: "VAI",
    assetAddress: "0x4BD17003473389A42DAF6a0a729f6Fdb328BbBd7",
    price: "0.97223236",
  },
]


forking(30098228, () => {
  const provider = ethers.provider;

  describe("Pre-VIP behavior", async () => {
    let resilientOracleProxy: ethers.Contract;
    let chainlinkOracleProxy: ethers.Contract;
    let boundValidatorProxy: ethers.Contract;
    let binanceOracleProxy: ethers.Contract;
    let twapOracleProxy: ethers.Contract;
    let pythOracleProxy: ethers.Contract;

    before(async () => {
      await impersonateAccount(PROXY_ADMIN);
      const signer = await ethers.getSigner(PROXY_ADMIN)

      resilientOracleProxy = new ethers.Contract(RESILIENT_ORACLE, PROXY_ABI, signer);
      chainlinkOracleProxy = new ethers.Contract(CHAINLINK_ORACLE, PROXY_ABI, signer);
      boundValidatorProxy = new ethers.Contract(BOUND_VALIDATOR, PROXY_ABI, signer);
      binanceOracleProxy = new ethers.Contract(BINANCE_ORACLE, PROXY_ABI, signer);
      twapOracleProxy = new ethers.Contract(TWAP_ORACLE, PROXY_ABI, signer);
      pythOracleProxy = new ethers.Contract(PYTH_ORACLE, PROXY_ABI, signer);
    });

    it("validate implementation address", async () => {
      expect(await resilientOracleProxy.callStatic.implementation()).to.be.equal(RESILIENT_ORACLE_IMPL_OLD)
      expect(await chainlinkOracleProxy.callStatic.implementation()).to.be.equal(CHAINLINK_ORACLE_IMPL_OLD)
      expect(await boundValidatorProxy.callStatic.implementation()).to.be.equal(BOUND_VALIDATOR_IMPL_OLD)
      expect(await binanceOracleProxy.callStatic.implementation()).to.be.equal(BINANCE_ORACLE_IMPL_OLD)
      expect(await twapOracleProxy.callStatic.implementation()).to.be.equal(TWAP_ORACLE_IMPL_OLD)
      expect(await pythOracleProxy.callStatic.implementation()).to.be.equal(PYTH_ORACLE_IMPL_OLD)
    });
  });

  testVip("VIP-140 Change Oracle and Configure Resilient Oracle", vip140(24 * 60 * 60 * 3), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [BINANCE_ORACLE_ABI], ["SymbolOverridden"], [2]);
      await expectEvents(txResponse, [BINANCE_ORACLE_ABI], ["MaxStalePeriodAdded"], [1]);
      await expectEvents(txResponse, [RESILIENT_ORACLE_ABI], ["TokenConfigAdded"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    
    let resilientOracleProxy: ethers.Contract;
    let chainlinkOracleProxy: ethers.Contract;
    let boundValidatorProxy: ethers.Contract;
    let binanceOracleProxy: ethers.Contract;
    let twapOracleProxy: ethers.Contract;
    let pythOracleProxy: ethers.Contract;
    let mockVToken: ethers.Contract;
    let resilientOracle: ethers.Contract;
    let comptroller: ethers.Contract;
    let binanceOracle: ethers.Contract;
    let timelockSigner: Signer
    let chainlinkOracle: ethers.Contract;

    before(async () => {
      await impersonateAccount(PROXY_ADMIN);
      await impersonateAccount(NORMAL_TIMELOCK);
      timelockSigner = await ethers.getSigner(NORMAL_TIMELOCK)
      const signer = await ethers.getSigner(PROXY_ADMIN)

      resilientOracleProxy = new ethers.Contract(RESILIENT_ORACLE, PROXY_ABI, signer);
      chainlinkOracleProxy = new ethers.Contract(CHAINLINK_ORACLE, PROXY_ABI, signer);
      boundValidatorProxy = new ethers.Contract(BOUND_VALIDATOR, PROXY_ABI, signer);
      binanceOracleProxy = new ethers.Contract(BINANCE_ORACLE, PROXY_ABI, signer);
      twapOracleProxy = new ethers.Contract(TWAP_ORACLE, PROXY_ABI, signer);
      pythOracleProxy = new ethers.Contract(PYTH_ORACLE, PROXY_ABI, signer);

      comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);
      resilientOracle = new ethers.Contract(await comptroller.oracle(), RESILIENT_ORACLE_ABI, provider);
      binanceOracle = new ethers.Contract(BINANCE_ORACLE, BINANCE_ORACLE_ABI, timelockSigner);
      chainlinkOracle = new ethers.Contract(CHAINLINK_ORACLE, CHAINLINK_ORACLE_ABI, timelockSigner);

      await impersonateAccount(DUMMY_SIGNER);
      const factory = new ethers.ContractFactory(
        MOCK_VTOKEN_ABI,
        MOCK_VTOKEN_CODE,
        await ethers.getSigner(DUMMY_SIGNER),
      );
      mockVToken = await factory.deploy();
    });

    it("validate implementation address", async () => {
      expect(await resilientOracleProxy.callStatic.implementation()).to.be.equal(RESILIENT_ORACLE_IMPL)
      expect(await chainlinkOracleProxy.callStatic.implementation()).to.be.equal(CHAINLINK_ORACLE_IMPL)
      expect(await boundValidatorProxy.callStatic.implementation()).to.be.equal(BOUND_VALIDATOR_IMPL)
      expect(await binanceOracleProxy.callStatic.implementation()).to.be.equal(BINANCE_ORACLE_IMPL)
      expect(await twapOracleProxy.callStatic.implementation()).to.be.equal(TWAP_ORACLE_IMPL)
      expect(await pythOracleProxy.callStatic.implementation()).to.be.equal(PYTH_ORACLE_IMPL)
    });

    it("validate binance vToken prices", async () => {
      for (let i = 0; i < tokens.length; i++) {
        const vToken = tokens[i];
        await binanceOracle.setMaxStalePeriod(vToken.name, 7 * 24 * 60 * 60);
        await mockVToken.setUnderlyingAsset(vToken.assetAddress);
        const price = await resilientOracle.getUnderlyingPrice(mockVToken.address);
        expect(price).to.be.equal(parseUnits(vToken.price, "18"));
      }
    });

    it("validate chainlink vToken prices", async () => {
      for (let i = 0; i < chainlinkTokens.length; i++) {
        const vToken = chainlinkTokens[i];
        const config = await chainlinkOracle.tokenConfigs(vToken.assetAddress)
        await chainlinkOracle.setTokenConfig({
          asset: config.asset,
          feed: config.feed,
          maxStalePeriod: (7 * 24 * 60 * 60)
        });
        await mockVToken.setUnderlyingAsset(vToken.assetAddress);
        const price = await resilientOracle.getUnderlyingPrice(mockVToken.address);
        expect(price).to.be.equal(parseUnits(vToken.price, "18"));
      }
    });

    it("get correct SD price from oracle ", async () => {
      await mockVToken.setUnderlyingAsset(SD);
      const price = await resilientOracle.getUnderlyingPrice(mockVToken.address);
      expect(price).to.equal(parseUnits("0.92596664", 18));
    });
  });
});