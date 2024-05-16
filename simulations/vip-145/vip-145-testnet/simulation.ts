import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract, Signer } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { forking, testVip } from "../../../src/vip-framework";
import { vip145Testnet } from "../../../vips/vip-145/vip-145-testnet";
import BINANCE_ORACLE_ABI from "./abi/binanceOracle.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import MOCK_VTOKEN_ABI from "./abi/mockVToken.json";
import PROXY_ABI from "./abi/proxy.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";

const RESILIENT_ORACLE = "0x3cD69251D04A28d887Ac14cbe2E14c52F3D57823";
const RESILIENT_ORACLE_IMPL_OLD = "0x360506E086d6E4788b0970CD576307CCEccECbe6";
const RESILIENT_ORACLE_IMPL = "0xF53cFE89b4c3eFCbdd9aF712e94017454d43c181";

const CHAINLINK_ORACLE = "0xCeA29f1266e880A1482c06eD656cD08C148BaA32";
const CHAINLINK_ORACLE_IMPL_OLD = "0xb6D0D2a0B8Eb799Fc1Bcf63D31011878F576EeC3";
const CHAINLINK_ORACLE_IMPL = "0xa074529FD3d0E7261A730d0f867107BA0C20d74A";

const BOUND_VALIDATOR = "0x2842140e4Ad3a92e9af30e27e290300dd785076d";
const BOUND_VALIDATOR_IMPL_OLD = "0x0EbBBc805Ed9b6F4FAe2cd3103a3653547018dba";
const BOUND_VALIDATOR_IMPL = "0x4915F67a57FDcbA22535F0F021D64b66b095d026";

const BINANCE_ORACLE = "0xB58BFDCE610042311Dc0e034a80Cc7776c1D68f5";
const BINANCE_ORACLE_IMPL_OLD = "0x693A5ae5F9b8da5b8125f9BC0d8f04C7c63d2384";
const BINANCE_ORACLE_IMPL = "0xCd64844CD0E8E34782cd0d1bF3E537bf7b474FAe";

const TWAP_ORACLE = "0x3eeE05d929D1E9816185B1b6d8c470eC192b4432";
const TWAP_ORACLE_IMPL_OLD = "0xA65d9c3593B8ca0EF4C475E16Eb93f92Ca81F98B";
const TWAP_ORACLE_IMPL = "0x572ec272B4Ae3a50B99905AFd78671F84474ffd1";

const PYTH_ORACLE = "0x94E1534c14e0736BB24decA625f2F5364B198E0C";
const PYTH_ORACLE_IMPL_OLD = "0xb830C5F05334a364a80957dDACF5A336dc55Bab2";
const PYTH_ORACLE_IMPL = "0xb8a450101DF8ab770c8F8521E189a4B39e7Cf5f5";

const PROXY_ADMIN = "0xef480a5654b231ff7d80A0681F938f3Db71a6Ca6";
const COMPTROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";

const DUMMY_SIGNER = "0xF474Cf03ccEfF28aBc65C9cbaE594F725c80e12d";
const MOCK_VTOKEN = "0x65d77756974d3DA088F75DA527009c286F0228EE";

interface ILVTokenConfig {
  assetName: string;
  assetAddress: string;
  price: string;
}

const ilPoolTokens: ILVTokenConfig[] = [
  {
    assetName: "FLOKI",
    assetAddress: "0xb22cF15FBc089d470f8e532aeAd2baB76bE87c88",
    price: "0.00002483",
  },
  {
    assetName: "HAY",
    assetAddress: "0xe73774DfCD551BF75650772dC2cC56a2B6323453",
    price: "1.00079564",
  },
  {
    assetName: "BTT",
    assetAddress: "0xE98344A7c691B200EF47c9b8829110087D832C64",
    price: "0.00000046",
  },
  {
    assetName: "WBETH",
    assetAddress: "0xf9F98365566F4D55234f24b99caA1AfBE6428D44",
    price: "1897.64221232",
  },
];

forking(31522791, () => {
  const provider = ethers.provider;

  describe("Pre-VIP behavior", async () => {
    let resilientOracleProxy: Contract;
    let chainlinkOracleProxy: Contract;
    let boundValidatorProxy: Contract;
    let binanceOracleProxy: Contract;
    let twapOracleProxy: Contract;
    let pythOracleProxy: Contract;

    before(async () => {
      await impersonateAccount(PROXY_ADMIN);
      const signer = await ethers.getSigner(PROXY_ADMIN);

      resilientOracleProxy = new ethers.Contract(RESILIENT_ORACLE, PROXY_ABI, signer);
      chainlinkOracleProxy = new ethers.Contract(CHAINLINK_ORACLE, PROXY_ABI, signer);
      boundValidatorProxy = new ethers.Contract(BOUND_VALIDATOR, PROXY_ABI, signer);
      binanceOracleProxy = new ethers.Contract(BINANCE_ORACLE, PROXY_ABI, signer);
      twapOracleProxy = new ethers.Contract(TWAP_ORACLE, PROXY_ABI, signer);
      pythOracleProxy = new ethers.Contract(PYTH_ORACLE, PROXY_ABI, signer);
    });

    it("validate implementation address", async () => {
      expect(await resilientOracleProxy.callStatic.implementation()).to.be.equal(RESILIENT_ORACLE_IMPL_OLD);
      expect(await chainlinkOracleProxy.callStatic.implementation()).to.be.equal(CHAINLINK_ORACLE_IMPL_OLD);
      expect(await boundValidatorProxy.callStatic.implementation()).to.be.equal(BOUND_VALIDATOR_IMPL_OLD);
      expect(await binanceOracleProxy.callStatic.implementation()).to.be.equal(BINANCE_ORACLE_IMPL_OLD);
      expect(await twapOracleProxy.callStatic.implementation()).to.be.equal(TWAP_ORACLE_IMPL_OLD);
      expect(await pythOracleProxy.callStatic.implementation()).to.be.equal(PYTH_ORACLE_IMPL_OLD);
    });
  });

  testVip("VIP-145 Change Oracle and Configure Resilient Oracle", vip145Testnet());

  describe("Post-VIP behavior", async () => {
    let resilientOracleProxy: Contract;
    let chainlinkOracleProxy: Contract;
    let boundValidatorProxy: Contract;
    let binanceOracleProxy: Contract;
    let twapOracleProxy: Contract;
    let pythOracleProxy: Contract;
    let mockVToken: Contract;
    let resilientOracle: Contract;
    let comptroller: Contract;
    let binanceOracle: Contract;
    let timelockSigner: Signer;

    before(async () => {
      await impersonateAccount(PROXY_ADMIN);
      await impersonateAccount(NORMAL_TIMELOCK);
      timelockSigner = await ethers.getSigner(NORMAL_TIMELOCK);
      const signer = await ethers.getSigner(PROXY_ADMIN);

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
      mockVToken = new ethers.Contract(MOCK_VTOKEN, MOCK_VTOKEN_ABI, await ethers.getSigner(DUMMY_SIGNER));
    });

    it("validate implementation address", async () => {
      expect(await resilientOracleProxy.callStatic.implementation()).to.be.equal(RESILIENT_ORACLE_IMPL);
      expect(await chainlinkOracleProxy.callStatic.implementation()).to.be.equal(CHAINLINK_ORACLE_IMPL);
      expect(await boundValidatorProxy.callStatic.implementation()).to.be.equal(BOUND_VALIDATOR_IMPL);
      expect(await binanceOracleProxy.callStatic.implementation()).to.be.equal(BINANCE_ORACLE_IMPL);
      expect(await twapOracleProxy.callStatic.implementation()).to.be.equal(TWAP_ORACLE_IMPL);
      expect(await pythOracleProxy.callStatic.implementation()).to.be.equal(PYTH_ORACLE_IMPL);
    });

    it("validate IL vToken prices", async () => {
      for (let i = 0; i < ilPoolTokens.length; i++) {
        const vToken = ilPoolTokens[i];
        await binanceOracle.setMaxStalePeriod(vToken.assetName, 7 * 24 * 60 * 60);
        await mockVToken.setUnderlyingAsset(vToken.assetAddress);
        const price = await resilientOracle.getUnderlyingPrice(mockVToken.address);
        expect(price).to.be.equal(parseUnits(vToken.price, "18"));
      }
    });
  });
});
