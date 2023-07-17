import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

import { forking, testVip } from "../../../src/vip-framework";

import PROXY_ABI from "./abi/proxy.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";
import BINANCE_ORACLE_ABI from "./abi/binanceOracle.json";
import { Signer, ethers } from "ethers";
import { vip140 } from "../../../vips/vip-140/vip-140";
import { parseUnits } from "ethers/lib/utils";

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

interface ILVTokenConfig {
  name: string;
  assetAddress: string;
  price: string;
}

const ilPoolTokens: ILVTokenConfig[] = [
  {
    name: "RACA",
    assetAddress: "0x12BB890508c125661E03b09EC06E404bc9289040",
    price: "0.00011397",
  },
  {
    name: "stkBNB",
    assetAddress: "0xc2E9d07F66A89c44062459A47a0D2Dc038E4fb16",
    price: "246.12408473",
  },
  {
    name: "USDD",
    assetAddress: "0xd17479997F34dd9156Deef8F95A52D81D265be9c",
    price: "0.99951394",
  },
  {
    name: "WBETH",
    assetAddress: "0xa2E3356610840701BDf5611a53974510Ae27E2e1",
    price: "1906.3847959",
  },
];


forking(30049205, () => {
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

  testVip("VIP-140 Change Oracle and Configure Resilient Oracle", vip140(), {
    callbackAfterExecution: async txResponse => {},
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

    it("validate IL vToken prices", async () => {
      for (let i = 0; i < ilPoolTokens.length; i++) {
        const vToken = ilPoolTokens[i];
        await binanceOracle.setMaxStalePeriod(vToken.name, 7 * 24 * 60 * 60);
        await mockVToken.setUnderlyingAsset(vToken.assetAddress);
        const price = await resilientOracle.getUnderlyingPrice(mockVToken.address);
        expect(price).to.be.equal(parseUnits(vToken.price, "18"));
      }
    });
  });
});