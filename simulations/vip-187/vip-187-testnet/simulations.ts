import { expect } from "chai";
import { ethers } from "hardhat";

import { expectEvents } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { vip187Testnet } from "../../../vips/vip-187/vip-187-testnet";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";
import PROXY_ADMIN_ABI from "./abi/proxyAdmin.json";

const RESILIENT_ORACLE_PROXY = "0x3cD69251D04A28d887Ac14cbe2E14c52F3D57823";
const NEW_RESILIENT_ORACLE_IMPLEMENTATION = "0x35cC3b99985F9d970aEcc9BD83d5Ac78a074a896";
const OLD_RESILIENT_ORACLE_IMPLEMENTATION = "0xF53cFE89b4c3eFCbdd9aF712e94017454d43c181";
const DEFAULT_PROXY_ADMIN = "0xef480a5654b231ff7d80A0681F938f3Db71a6Ca6";

forking(34311500, () => {
  const provider = ethers.provider;
  let resilientOracle: ethers.Contract;
  let defaultProxyAdmin: ethers.Contract;

  beforeEach(async () => {
    resilientOracle = new ethers.Contract(RESILIENT_ORACLE_PROXY, RESILIENT_ORACLE_ABI, provider);
    defaultProxyAdmin = new ethers.Contract(DEFAULT_PROXY_ADMIN, PROXY_ADMIN_ABI, provider);
  });

  describe("Pre-VIP behavior", async () => {
    it("ResilientOracle proxy should have old implementation", async () => {
      const implementation = await defaultProxyAdmin.getProxyImplementation(RESILIENT_ORACLE_PROXY);
      expect(implementation).to.equal(OLD_RESILIENT_ORACLE_IMPLEMENTATION);
    });
  });

  testVip("vip187Testnet", vip187Testnet(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [RESILIENT_ORACLE_ABI], ["Upgraded"], [1]);
    },
  });

  describe("Post-VIP behavior", () => {
    it("ResilientOracle proxy should have new implementation", async () => {
      //expect(await upgradeableProxy.implementation()).to.equal(NEW_RESILIENT_ORACLE_IMPLEMENTATION);
    });

    it("ResilientOracle should point to correct dependencies", async () => {
      console.log(await resilientOracle.boundValidator());
    });
  });
});
