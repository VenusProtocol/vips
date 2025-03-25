import { expect } from "chai";
import { ethers } from "hardhat";
import { parseUnits } from "ethers/lib/utils";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  RISK_STEWARD_RECEIVER,
  MARKET_CAPS_RISK_STEWARD,
} from "../../vips/vip-xxx/bsctestnet";
import { vipXXX_2, MARKET_CAPS_RISK_STEWARD_IMPLEMENTATION, ProxyAdmin } from "../../vips/vip-xxx/bsctestnet-2";
import { abi as RISK_STEWARD_RECEIVER_ABI } from "./abi/RiskStewardReceiver.json";
import TRANSPARENT_PROXY_ABI  from "./abi/TransparentProxyAbi.json";
import DEFAULT_PROXY_ADMIN_ABI  from "./abi/DefaultProxyAdmin.json";

forking(47640752, async () => {
  const provider = ethers.provider;
  const riskStewardReceiver = new ethers.Contract(RISK_STEWARD_RECEIVER, RISK_STEWARD_RECEIVER_ABI, provider);
  const proxyAdmin = new ethers.Contract(ProxyAdmin, DEFAULT_PROXY_ADMIN_ABI, provider);

  testVip("VIP-XXX-2", await vipXXX_2(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [TRANSPARENT_PROXY_ABI], ["Upgraded"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
   
    it("should update implementation", async () => {
      expect(await proxyAdmin.getProxyImplementation(MARKET_CAPS_RISK_STEWARD)).to.equal(MARKET_CAPS_RISK_STEWARD_IMPLEMENTATION);
    });

    it("should process update", async () => {
      const signer = await initMainnetUser("0xFEdD302cFAFC03A7d4DFC99342fe20E0521C265A", parseUnits("1", 18));
      await riskStewardReceiver.connect(signer).processUpdateById(5);
    });
  });
});

