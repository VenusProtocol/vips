import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, setMaxStalePeriodInChainlinkOracle } from "src/utils";
import { forking, pretendExecutingVip, testVip } from "src/vip-framework";

import { POOL_SPECS, UNITROLLER, vip545 } from "../../vips/vip-545/bsctestnet-remove-spark";
import { vip545 as addSparkEmode } from "../../vips/vip-545/bsctestnet-spark";
import COMPTROLLER_ABI from "./abi/Comptroller.json";

forking(65686652, async () => {
  let comptroller: Contract;

  before(async () => {
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, UNITROLLER);
    const BTCB = "0xA808e341e8e723DC6BA0Bb5204Bafc2330d7B8e4";
    await setMaxStalePeriodInChainlinkOracle(
      NETWORK_ADDRESSES.bsctestnet.CHAINLINK_ORACLE,
      BTCB,
      ethers.constants.AddressZero,
      NETWORK_ADDRESSES.bsctestnet.NORMAL_TIMELOCK,
      315360000,
    );
    await pretendExecutingVip(await addSparkEmode(), NETWORK_ADDRESSES.bsctestnet.NORMAL_TIMELOCK);
  });

  describe("Pre-VIP state", async () => {
    it("check the current pool status to be active", async () => {
      const pool = await comptroller.pools(POOL_SPECS.id);
      expect(pool.label).to.equals(POOL_SPECS.label);
      expect(pool.isActive).to.equals(true);
    });
  });

  testVip("VIP-545", await vip545(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["PoolActiveStatusUpdated"], [1]);
    },
  });

  describe("Post-VIP state", async () => {
    it("should update the pool status to inactive", async () => {
      const pool = await comptroller.pools(POOL_SPECS.id);
      expect(pool.label).to.equals(POOL_SPECS.label);
      expect(pool.isActive).to.equals(false);
    });
  });
});
