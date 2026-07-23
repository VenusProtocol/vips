import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip664, {
  ETH_CORE_COMPTROLLER,
  ETH_DEVIATION_SENTINEL,
  ETH_EBRAKE,
  eBTC,
  veBTC,
} from "../../vips/vip-664/bscmainnet";

// Recent Ethereum block — the eBTC market, EBrake and DeviationSentinel (VIP-616) all predate it,
// and the Deviation Sentinel has already snapshotted eBTC's CF ([0.68, 0.72]) by this height.
const FORK_BLOCK = 25590000;
// Core pool id used for the EBrake CF-snapshot reads (single-pool IL comptroller).
const CORE_POOL_ID = 0;

const COMPTROLLER_ABI = ["function supplyCaps(address) view returns (uint256)"];
const EBRAKE_ABI = ["function getMarketCFSnapshot(address,uint96) view returns (uint256 cf, uint256 lt)"];
const DEVIATION_SENTINEL_ABI = ["function tokenConfigs(address) view returns (uint8 deviation, bool enabled)"];

forking(FORK_BLOCK, async () => {
  const comptroller = new Contract(ETH_CORE_COMPTROLLER, COMPTROLLER_ABI, ethers.provider);
  const ebrake = new Contract(ETH_EBRAKE, EBRAKE_ABI, ethers.provider);
  const deviationSentinel = new Contract(ETH_DEVIATION_SENTINEL, DEVIATION_SENTINEL_ABI, ethers.provider);

  describe("Pre-VIP state", () => {
    it("eBTC supply cap is 25 eBTC", async () => {
      expect(await comptroller.supplyCaps(veBTC)).to.equal(parseUnits("25", 8));
    });

    it("EBrake holds a CF snapshot [0.68, 0.72] for veBTC", async () => {
      const { cf, lt } = await ebrake.getMarketCFSnapshot(veBTC, CORE_POOL_ID);
      expect(cf).to.equal(parseUnits("0.68", 18));
      expect(lt).to.equal(parseUnits("0.72", 18));
    });

    it("Deviation Sentinel monitors eBTC (enabled)", async () => {
      const config = await deviationSentinel.tokenConfigs(eBTC);
      expect(config.enabled).to.equal(true);
    });
  });

  testForkedNetworkVipCommands("VIP-664 Ethereum eBTC delisting", await vip664());

  describe("Post-VIP state", () => {
    it("eBTC supply cap is 0", async () => {
      expect(await comptroller.supplyCaps(veBTC)).to.equal(0);
    });

    it("EBrake CF snapshot for veBTC is cleared", async () => {
      const { cf, lt } = await ebrake.getMarketCFSnapshot(veBTC, CORE_POOL_ID);
      expect(cf).to.equal(0);
      expect(lt).to.equal(0);
    });

    it("Deviation Sentinel no longer monitors eBTC (deviation config preserved)", async () => {
      const configBefore = 3; // deviation threshold set in VIP-616 era, preserved by a disable
      const config = await deviationSentinel.tokenConfigs(eBTC);
      expect(config.enabled).to.equal(false);
      expect(config.deviation).to.equal(configBefore);
    });
  });
});
