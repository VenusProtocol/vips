import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, setMaxStalePeriodInChainlinkOracle } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip554, { WBETH } from "../../vips/vip-554/bscmainnet";
import CAPPED_ORACLE_ABI from "./abi/CappedOracle.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";

const { bscmainnet } = NETWORK_ADDRESSES;
const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";

forking(64203506, async () => {
  const provider = ethers.provider;
  const resilientOracle = new ethers.Contract(bscmainnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);

  describe("Pre-VIP behaviour", async () => {
    it("check WBETH price", async () => {
      expect(await resilientOracle.getPrice(WBETH)).to.equal(parseUnits("4073.04437123", 18));
    });
  });

  testVip("VIP-554", await vip554(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [CAPPED_ORACLE_ABI],
        ["SnapshotUpdated", "GrowthRateUpdated", "SnapshotGapUpdated"],
        [1, 1, 1],
      );
    },
  });

  describe("Post-VIP behaviour", async () => {
    before(async () => {
      await setMaxStalePeriodInChainlinkOracle(
        bscmainnet.CHAINLINK_ORACLE,
        ETH,
        "0x9ef1B8c0E4F7dc8bF5719Ea496883DC6401d5b2e",
        bscmainnet.NORMAL_TIMELOCK,
      );
    });
    it("check WBETH price", async () => {
      expect(await resilientOracle.getPrice(ETH)).to.equal(parseUnits("3814.78091719", 18));
    });
  });
});
