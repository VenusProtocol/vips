import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { forking, testVip } from "src/vip-framework";

import {
  DEFAULT_PROXY_ADMIN,
  RISK_FUND_V2_NEW_IMPLEMENTATION,
  RISK_FUND_V2_PROXY,
  vip780,
} from "../../vips/vip-780/bscmainnet";
import PROXY_ADMIN_ABI from "./abi/ProxyAdmin.json";
import RISK_FUND_V2_ABI from "./abi/RiskFundV2.json";

forking(73352569, async () => {
  let proxyAdmin: Contract;
  let riskFundV2: Contract;
  let oldImplementation: string;

  before(async () => {
    proxyAdmin = await ethers.getContractAt(PROXY_ADMIN_ABI, DEFAULT_PROXY_ADMIN);
    riskFundV2 = await ethers.getContractAt(RISK_FUND_V2_ABI, RISK_FUND_V2_PROXY);
    oldImplementation = await proxyAdmin.getProxyImplementation(RISK_FUND_V2_PROXY);
  });

  describe("Pre-VIP state", async () => {
    it("should have the old implementation", async () => {
      expect(oldImplementation).to.equal("0x7Ef5ABbcC9A701e728BeB7Afd4fb5747fAB15A28");
    });

    it("should be able to call existing functions", async () => {
      // Verify the contract is working by checking a basic function
      const owner = await riskFundV2.owner();
      expect(owner).to.not.equal(ethers.constants.AddressZero);
    });
  });

  testVip("VIP-780 Upgrade RiskFundV2", await vip780());

  describe("Post-VIP state", async () => {
    it("should have the new implementation", async () => {
      expect(await proxyAdmin.getProxyImplementation(RISK_FUND_V2_PROXY)).to.equal(RISK_FUND_V2_NEW_IMPLEMENTATION);
    });

    it("should maintain proxy state after upgrade", async () => {
      // Verify the contract still works and maintains its state
      const owner = await riskFundV2.owner();
      expect(owner).to.not.equal(ethers.constants.AddressZero);
    });

    it("should still have access to proxy functions", async () => {
      // Check that standard proxy functions still work
      const shortfall = await riskFundV2.shortfall();
      expect(shortfall).to.not.equal(ethers.constants.AddressZero);
    });
  });
});
