import { expect } from "chai";

import { forking, pretendExecutingVip } from "../../../../src/vip-framework/index";
import { LOCK_PERIOD, POOL_ID, XVS, XVS_VAULT_PROXY } from "../../../proposals/vip-007/vip-007-sepolia";
import { vip007 } from "../../../proposals/vip-007/vip-007-sepolia";
import XVS_VAULT_PROXY_ABI from "./abi/xvsVaultProxy.json";

forking(5072241, () => {
  before(async () => {
    await pretendExecutingVip(vip007());
  });

  describe("Lockup period", () => {
    it("should be 5 minutes", async () => {
      const xvsVaultProxy = new ethers.Contract(XVS_VAULT_PROXY, XVS_VAULT_PROXY_ABI, ethers.provider);
      const pool = await xvsVaultProxy.poolInfos(XVS, POOL_ID);
      expect(pool.lockPeriod).to.equal(LOCK_PERIOD);
    });
  });
});
