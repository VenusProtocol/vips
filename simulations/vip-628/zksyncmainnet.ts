import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { initMainnetUser } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip628, {
  AUXILIARY_AGGREGATOR,
  NEW_AGGREGATOR,
  NEW_AGGREGATOR_TIMELOCK_SIGS,
  REMOTE_BATCH_INDEX,
  newAggregatorBatchers,
} from "../../vips/vip-628/bscmainnet";
import { buildSeedBatch } from "../../vips/vip-628/scripts/seed-aggregators";
import { encodeSeedCommands } from "../../vips/vip-628/utils/auxiliary-aggregator";
import AGGREGATOR_ABI from "./abi/AuxiliaryCommandsAggregator.json";
import ACM_ABI from "./abi/accessControlManager.json";

// zkSync's batch carries only the new-aggregator grants (no oracle migration), so this is verified on its own
// rather than through the oracle-focused remoteSuite.
const NETWORK = "zksyncmainnet";
const networkAddresses = NETWORK_ADDRESSES[NETWORK];
const aggregatorAddress = AUXILIARY_AGGREGATOR[NETWORK];
const newAggregator = NEW_AGGREGATOR[NETWORK];
const batchers = newAggregatorBatchers(NETWORK);
const batchIndex = REMOTE_BATCH_INDEX[NETWORK];
const seededBatch = buildSeedBatch(NETWORK);

forking(70394852, async () => {
  describe("Pre-VIP behavior", () => {
    it("seeded batch matches the expected commands exactly", async () => {
      const aggregator = new ethers.Contract(aggregatorAddress, AGGREGATOR_ABI, ethers.provider);
      const onchain = await aggregator.getBatch(batchIndex);
      const expected = encodeSeedCommands(seededBatch);
      expect(onchain.length).to.equal(expected.length);
      for (let i = 0; i < expected.length; i++) {
        expect(onchain[i].target.toLowerCase()).to.equal(expected[i].target.toLowerCase(), `batch call ${i} target`);
        expect(onchain[i].data.toLowerCase()).to.equal(expected[i].data.toLowerCase(), `batch call ${i} data`);
      }
    });

    it("aggregator holds no admin role pre-VIP", async () => {
      const acm = new ethers.Contract(networkAddresses.ACCESS_CONTROL_MANAGER, ACM_ABI, ethers.provider);
      expect(await acm.hasRole(ethers.constants.HashZero, aggregatorAddress)).to.equal(false);
    });
  });

  testForkedNetworkVipCommands("vip628", await vip628());

  describe("Post-VIP new aggregator wiring", () => {
    const timelocks = [
      networkAddresses.NORMAL_TIMELOCK,
      networkAddresses.FAST_TRACK_TIMELOCK,
      networkAddresses.CRITICAL_TIMELOCK,
    ];

    it("old aggregator admin role is revoked", async () => {
      const acm = new ethers.Contract(networkAddresses.ACCESS_CONTROL_MANAGER, ACM_ABI, ethers.provider);
      expect(await acm.hasRole(ethers.constants.HashZero, aggregatorAddress)).to.equal(false);
    });

    it("ownership accepted by the Normal Timelock", async () => {
      const aggregator = new ethers.Contract(newAggregator, AGGREGATOR_ABI, ethers.provider);
      expect((await aggregator.owner()).toLowerCase()).to.equal(networkAddresses.NORMAL_TIMELOCK.toLowerCase());
    });

    it("executeBatch / add / removeAuthorizedBatchers granted to all three timelocks", async () => {
      const acm = new ethers.Contract(networkAddresses.ACCESS_CONTROL_MANAGER, ACM_ABI, ethers.provider);
      for (const signature of NEW_AGGREGATOR_TIMELOCK_SIGS) {
        for (const timelock of timelocks) {
          expect(await acm.hasPermission(timelock, newAggregator, signature)).to.equal(
            true,
            `${signature} ${timelock}`,
          );
        }
      }
    });

    it("batcher allowlist seeded", async () => {
      const aggregator = new ethers.Contract(newAggregator, AGGREGATOR_ABI, ethers.provider);
      for (const batcher of batchers) {
        expect(await aggregator.authorizedBatchers(batcher)).to.equal(true);
      }
    });
  });

  describe("Post-VIP new aggregator is operational (e2e)", () => {
    const PROBE_TARGET = ethers.utils.getAddress("0x000000000000000000000000000000000000dead");
    const PROBE_ACCOUNT = ethers.utils.getAddress("0x00000000000000000000000000000000deadbeef");
    const PROBE_SIG = "e2eProbe(uint256)";

    it("authorized batcher seeds a batch and a timelock executes it", async () => {
      const acmRead = new ethers.Contract(networkAddresses.ACCESS_CONTROL_MANAGER, ACM_ABI, ethers.provider);
      expect(await acmRead.hasPermission(PROBE_ACCOUNT, PROBE_TARGET, PROBE_SIG)).to.equal(false);

      const batcher = await initMainnetUser(batchers[0], ethers.utils.parseEther("1"));
      const aggAsBatcher = new ethers.Contract(newAggregator, AGGREGATOR_ABI, batcher);
      const probeData = new ethers.utils.Interface(ACM_ABI).encodeFunctionData("giveCallPermission", [
        PROBE_TARGET,
        PROBE_SIG,
        PROBE_ACCOUNT,
      ]);
      const newIndex = (await aggAsBatcher.batchCount()).toNumber();
      await aggAsBatcher["addBatch((address,bytes)[])"]([
        { target: networkAddresses.ACCESS_CONTROL_MANAGER, data: probeData },
      ]);

      const timelock = await initMainnetUser(networkAddresses.NORMAL_TIMELOCK, ethers.utils.parseEther("1"));
      const acm = new ethers.Contract(networkAddresses.ACCESS_CONTROL_MANAGER, ACM_ABI, timelock);
      const aggAsTimelock = new ethers.Contract(newAggregator, AGGREGATOR_ABI, timelock);
      await acm.grantRole(ethers.constants.HashZero, newAggregator);
      await aggAsTimelock.executeBatch(newIndex);
      await acm.revokeRole(ethers.constants.HashZero, newAggregator);

      expect(await acmRead.hasPermission(PROBE_ACCOUNT, PROBE_TARGET, PROBE_SIG)).to.equal(true);
      expect(await acmRead.hasRole(ethers.constants.HashZero, newAggregator)).to.equal(false);
    });
  });
});
