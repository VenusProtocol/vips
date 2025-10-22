import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, setMaxStalePeriodInChainlinkOracle } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip557, { WBETH, WBETHOracle } from "../../vips/vip-557/bscmainnet";
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

  testVip("VIP-557", await vip557(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [CAPPED_ORACLE_ABI],
        ["SnapshotUpdated", "GrowthRateUpdated", "SnapshotGapUpdated"],
        [1, 1, 1],
      );
      await expectEvents(txResponse, [RESILIENT_ORACLE_ABI], ["TokenConfigAdded"], [1]);
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
    it("check ETH price", async () => {
      expect(await resilientOracle.getPrice(ETH)).to.equal(parseUnits("3814.78091719", 18));
    });

    it("check WBETH price", async () => {
      // around ETH price * 1.0808
      expect(await resilientOracle.getPrice(WBETH)).to.equal(parseUnits("4123.023634772211778864", 18));
    });

    it("Validate main oracle is set for WBETH", async () => {
      const tokenConfig = await resilientOracle.getTokenConfig(WBETH);
      expect(tokenConfig.oracles[0]).to.equal(WBETHOracle);
      expect(tokenConfig.enableFlagsForOracles[0]).to.equal(true);
    });
  });
});
