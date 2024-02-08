import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import {
  NEW_RISK_FUND_CONVERTER_IMP,
  NEW_SINGLE_TOKEN_CONVERTER_IMP,
  PROXY_ADMIN,
  RISK_FUND_CONVERTER_PROXY,
  SINGLE_TOKEN_CONVERTER_BEACON,
  vipConverter,
} from "../../../vips/vip-converter/bsctestnet";
import BEACON_ABI from "../abi/Beacon.json";
import DEFAULT_PROXY_ADMIN_ABI from "../abi/DefaultProxyAdmin.json";
import TRANSPARENT_PROXY_ABI from "../abi/TransparentProxyAbi.json";

forking(35781703, () => {
  const provider = ethers.provider;
  let proxyAdmin: Contract;
  let beacon: Contract;

  before(async () => {
    proxyAdmin = new ethers.Contract(PROXY_ADMIN, DEFAULT_PROXY_ADMIN_ABI, provider);
    beacon = new ethers.Contract(SINGLE_TOKEN_CONVERTER_BEACON, BEACON_ABI, provider);
  });

  testVip("VIP-Converter", vipConverter(), {
    callbackAfterExecution: async (txResponse: any) => {
      await expectEvents(txResponse, [TRANSPARENT_PROXY_ABI], ["Upgraded"], [1]);
      await expectEvents(txResponse, [BEACON_ABI], ["Upgraded"], [1]);
    },
  });

  describe("Post-VIP behavior", () => {
    it("RiskFundConverter and SingleTokenConverter should have new implementation", async () => {
      expect(await proxyAdmin.getProxyImplementation(RISK_FUND_CONVERTER_PROXY)).to.equal(NEW_RISK_FUND_CONVERTER_IMP);
      expect(await beacon.implementation()).to.equal(NEW_SINGLE_TOKEN_CONVERTER_IMP);
    });
  });
});
