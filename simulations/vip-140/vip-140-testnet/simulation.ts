import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents, setMaxStalePeriodInChainlinkOracle } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { vip140Testnet } from "../../../vips/vip-140/vip-140-testnet";

import PROXY_ABI from "./abi/proxy.json";
import { ethers } from "ethers";

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
const BINANCE_ORACLE_IMPL = "0xf015ac791B812b2564d975b8D78671eA4Bc1e2e5";

const TWAP_ORACLE = "0x3eeE05d929D1E9816185B1b6d8c470eC192b4432";
const TWAP_ORACLE_IMPL_OLD = "0xA65d9c3593B8ca0EF4C475E16Eb93f92Ca81F98B";
const TWAP_ORACLE_IMPL = "0x572ec272B4Ae3a50B99905AFd78671F84474ffd1";

const PYTH_ORACLE = "0x94E1534c14e0736BB24decA625f2F5364B198E0C";
const PYTH_ORACLE_IMPL_OLD = "0xb830C5F05334a364a80957dDACF5A336dc55Bab2";
const PYTH_ORACLE_IMPL = "0xb8a450101DF8ab770c8F8521E189a4B39e7Cf5f5";

const PROXY_ADMIN = "0xef480a5654b231ff7d80A0681F938f3Db71a6Ca6"

forking(31460864, () => {
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

  testVip("VIP-140 Change Oracle and Configure Resilient Oracle", vip140Testnet(), {
    callbackAfterExecution: async txResponse => {},
  });

  describe("Post-VIP behavior", async () => {
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
      expect(await resilientOracleProxy.callStatic.implementation()).to.be.equal(RESILIENT_ORACLE_IMPL)
      expect(await chainlinkOracleProxy.callStatic.implementation()).to.be.equal(CHAINLINK_ORACLE_IMPL)
      expect(await boundValidatorProxy.callStatic.implementation()).to.be.equal(BOUND_VALIDATOR_IMPL)
      expect(await binanceOracleProxy.callStatic.implementation()).to.be.equal(BINANCE_ORACLE_IMPL)
      expect(await twapOracleProxy.callStatic.implementation()).to.be.equal(TWAP_ORACLE_IMPL)
      expect(await pythOracleProxy.callStatic.implementation()).to.be.equal(PYTH_ORACLE_IMPL)
    });
  });
});