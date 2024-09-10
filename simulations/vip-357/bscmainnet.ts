import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { BigNumberish } from "ethers";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents, initMainnetUser } from "src/utils";
import { CRITICAL_TIMELOCK, forking, testVip } from "src/vip-framework";

import { NEW_RISK_FUND_IMPL, OLD_RISK_FUND_IMPL, PROXY_ADMIN, RISK_FUND, vip357 } from "../../vips/vip-357/bscmainnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";
import PROXY_ADMIN_ABI from "./abi/DefaultProxyAdmin.json";
import RISK_FUND_ABI from "./abi/RiskFundV2.json";
import TRANSPARENT_PROXY_ABI from "./abi/TransparentProxyAbi.json";

forking(41350730, async () => {
  const provider = ethers.provider;
  const riskFund = new ethers.Contract(RISK_FUND, RISK_FUND_ABI, provider);
  const proxyAdmin = new ethers.Contract(PROXY_ADMIN, PROXY_ADMIN_ABI, provider);

  let state: {
    acm: string;
    convertibleBaseAsset: string;
    maxLoopsLimit: BigNumberish;
    owner: string;
    shortfall: string;
  };

  before(async () => {
    state = {
      acm: await riskFund.accessControlManager(),
      convertibleBaseAsset: await riskFund.convertibleBaseAsset(),
      maxLoopsLimit: await riskFund.maxLoopsLimit(),
      owner: await riskFund.owner(),
      shortfall: await riskFund.shortfall(),
    };
  });

  describe("Pre-VIP state", () => {
    it("RiskFund Proxy should have old implementation", async () => {
      expect(await proxyAdmin.getProxyImplementation(RISK_FUND)).to.equal(OLD_RISK_FUND_IMPL);
    });
  });

  testVip("VIP-357", await vip357(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["RoleGranted"], [5]);
      await expectEvents(txResponse, [TRANSPARENT_PROXY_ABI], ["Upgraded"], [1]);
    },
  });

  describe("Post-VIP behavior", () => {
    it("should set the new implementation for the risk fund", async () => {
      expect(await proxyAdmin.getProxyImplementation(RISK_FUND)).to.equal(NEW_RISK_FUND_IMPL);
    });

    it("should preserve storage", async () => {
      expect(await riskFund.accessControlManager()).to.equal(state.acm);
      expect(await riskFund.convertibleBaseAsset()).to.equal(state.convertibleBaseAsset);
      expect(await riskFund.maxLoopsLimit()).to.equal(state.maxLoopsLimit);
      expect(await riskFund.owner()).to.equal(state.owner);
      expect(await riskFund.shortfall()).to.equal(state.shortfall);
    });

    it("can sweep tokens from pool's allocation", async () => {
      const timelock = await initMainnetUser(CRITICAL_TIMELOCK, parseEther("1"));
      const usdtAddress = "0x55d398326f99059fF775485246999027B3197955";
      const comptrollerAddress = "0xfD36E2c2a6789Db23113685031d7F16329158384";
      const amount = parseUnits("840320.493777076510891477", 18);
      await riskFund.connect(timelock).sweepTokenFromPool(usdtAddress, comptrollerAddress, CRITICAL_TIMELOCK, amount);
    });
  });
});
