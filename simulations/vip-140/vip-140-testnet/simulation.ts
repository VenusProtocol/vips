import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents, setMaxStalePeriodInChainlinkOracle } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { vip140Testnet } from "../../../vips/vip-140/vip-140-testnet";

import PROXY_ABI from "./abi/proxy.json";

const RESILIENT_ORACLE = "0x3cD69251D04A28d887Ac14cbe2E14c52F3D57823";
const RESILIENT_ORACLE_IMPL_OLD = "0x360506E086d6E4788b0970CD576307CCEccECbe6";
const RESILIENT_ORACLE_IMPL = "0xF53cFE89b4c3eFCbdd9aF712e94017454d43c181";

const PROXY_ADMIN = "0xef480a5654b231ff7d80A0681F938f3Db71a6Ca6"

forking(31460864, () => {
  const provider = ethers.provider;

  describe("Pre-VIP behavior", async () => {
    let resilientOracleProxy: ethers.Contract;

    before(async () => {
      await impersonateAccount(PROXY_ADMIN);
      resilientOracleProxy = new ethers.Contract(RESILIENT_ORACLE, PROXY_ABI, await ethers.getSigner(PROXY_ADMIN));
    });

    it("validate implementation address", async () => {
      expect(await resilientOracleProxy.callStatic.implementation()).to.be.equal(RESILIENT_ORACLE_IMPL_OLD)
    });
  });

  testVip("VIP-140 Change Oracle and Configure Resilient Oracle", vip140Testnet(), {
    callbackAfterExecution: async txResponse => {},
  });

  describe("Post-VIP behavior", async () => {
    let resilientOracleProxy: ethers.Contract;

    before(async () => {
      await impersonateAccount(PROXY_ADMIN);
      resilientOracleProxy = new ethers.Contract(RESILIENT_ORACLE, PROXY_ABI, await ethers.getSigner(PROXY_ADMIN));
    });

    it("validate implementation address", async () => {
      expect(await resilientOracleProxy.callStatic.implementation()).to.be.equal(RESILIENT_ORACLE_IMPL)
    });
  });
});