import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { initMainnetUser } from "src/utils";

import AGGREGATOR_ABI from "../abi/AuxiliaryCommandsAggregator.json";
import PROXY_ADMIN_ABI from "../abi/DefaultProxyAdmin.json";

// Authorized on the aggregator of all five chains at the fork blocks
export const BATCHER = "0x9b0A3EAE7f174937d31745B710BbeA68e9D1BEf7";

export interface AggregatorUpgrade {
  aggregator: string;
  proxyAdmin: string;
  oldImplementation: string;
  newImplementation: string;
  acm: string;
  timelock: string;
}

export const checkBeforeUpgrade = (u: AggregatorUpgrade) => {
  describe("Pre-VIP behavior", () => {
    let proxyAdmin: Contract;

    before(async () => {
      proxyAdmin = new ethers.Contract(u.proxyAdmin, PROXY_ADMIN_ABI, ethers.provider);
    });

    it("proxy admin is owned by the Normal Timelock", async () => {
      expect(await proxyAdmin.owner()).to.equal(u.timelock);
    });

    it("aggregator runs the old implementation", async () => {
      expect(await proxyAdmin.getProxyImplementation(u.aggregator)).to.equal(u.oldImplementation);
    });

    it("new implementation has code", async () => {
      expect(await ethers.provider.getCode(u.newImplementation)).to.not.equal("0x");
    });
  });
};

export const checkAfterUpgrade = (u: AggregatorUpgrade) => {
  describe("Post-VIP behavior", () => {
    let proxyAdmin: Contract;
    let aggregator: Contract;

    before(async () => {
      proxyAdmin = new ethers.Contract(u.proxyAdmin, PROXY_ADMIN_ABI, ethers.provider);
      aggregator = new ethers.Contract(u.aggregator, AGGREGATOR_ABI, ethers.provider);
    });

    it("aggregator runs the new implementation", async () => {
      expect(await proxyAdmin.getProxyImplementation(u.aggregator)).to.equal(u.newImplementation);
    });

    it("keeps its Access Control Manager", async () => {
      expect(await aggregator.accessControlManager()).to.equal(u.acm);
    });

    it("keeps its authorized batchers", async () => {
      expect(await aggregator.authorizedBatchers(BATCHER)).to.equal(true);
    });

    it("starts with no batches", async () => {
      expect(await aggregator.getBatchCount()).to.equal(0);
    });

    it("an authorized batcher can add a batch in the signature format", async () => {
      const batcher = await initMainnetUser(BATCHER, parseUnits("1", 18));
      const data = ethers.utils.defaultAbiCoder.encode(["bytes32", "address"], [ethers.constants.HashZero, u.timelock]);
      await aggregator
        .connect(batcher)
        ["addBatch((address,string,bytes)[])"]([[u.acm, "hasRole(bytes32,address)", data]]);

      expect(await aggregator.getBatchCount()).to.equal(1);
      const [call] = await aggregator.getBatch(0);
      expect(call.target).to.equal(u.acm);
      expect(call.signature).to.equal("hasRole(bytes32,address)");
      expect(call.data).to.equal(data);
      expect(await aggregator.batchExecuted(0)).to.equal(false);
    });
  });
};
