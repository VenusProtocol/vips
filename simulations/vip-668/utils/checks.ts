import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { initMainnetUser } from "src/utils";

import AGGREGATOR_ABI from "../abi/AuxiliaryCommandsAggregator.json";
import PROXY_ADMIN_ABI from "../abi/DefaultProxyAdmin.json";

const ACM_ABI = [
  "function grantRole(bytes32,address)",
  "function revokeRole(bytes32,address)",
  "function hasRole(bytes32,address) view returns (bool)",
];

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

    for (const raw of [false, true]) {
      it(`seeds and executes a ${raw ? "raw" : "signature"} batch with temporary ACM permissions`, async () => {
        const batcher = await initMainnetUser(BATCHER, parseUnits("1", 18));
        const timelock = await initMainnetUser(u.timelock, parseUnits("1", 18));
        const acm = new ethers.Contract(u.acm, ACM_ABI, timelock);
        const adminRole = ethers.constants.HashZero;
        const signature = "addAuthorizedBatchers(address[])";
        const permissionRole = ethers.utils.solidityKeccak256(["address", "string"], [u.aggregator, signature]);
        // Use the real upgraded aggregator as an ACM-controlled target on every chain.
        const newBatcher = raw
          ? "0x0000000000000000000000000000000000001002"
          : "0x0000000000000000000000000000000000001001";
        const index = await aggregator.getBatchCount();
        const calls = [
          {
            target: u.acm,
            signature: "giveCallPermission(address,string,address)",
            data: ethers.utils.defaultAbiCoder.encode(
              ["address", "string", "address"],
              [u.aggregator, signature, u.aggregator],
            ),
          },
          {
            target: u.aggregator,
            signature,
            data: ethers.utils.defaultAbiCoder.encode(["address[]"], [[newBatcher]]),
          },
          {
            target: u.acm,
            signature: "revokeCallPermission(address,string,address)",
            data: ethers.utils.defaultAbiCoder.encode(
              ["address", "string", "address"],
              [u.aggregator, signature, u.aggregator],
            ),
          },
        ].map(call =>
          raw
            ? { ...call, signature: "", data: ethers.utils.id(call.signature).slice(0, 10) + call.data.slice(2) }
            : call,
        );

        expect(await aggregator.authorizedBatchers(newBatcher)).to.equal(false);
        expect(await acm.hasRole(adminRole, u.aggregator)).to.equal(false);
        expect(await acm.hasRole(permissionRole, u.aggregator)).to.equal(false);

        await (await aggregator.connect(batcher)["addBatch((address,string,bytes)[],uint256)"](calls, index)).wait();
        expect(await aggregator.getBatchCount()).to.equal(index.add(1));
        expect(
          (await aggregator.getBatch(index)).map((call: { target: string; signature: string; data: string }) => [
            call.target,
            call.signature,
            call.data,
          ]),
        ).to.deep.equal(calls.map(call => [call.target, call.signature, call.data]));
        // Seeding only stores calls: it neither changes the target nor grants any role.
        expect(await aggregator.authorizedBatchers(newBatcher)).to.equal(false);
        expect(await acm.hasRole(adminRole, u.aggregator)).to.equal(false);
        expect(await acm.hasRole(permissionRole, u.aggregator)).to.equal(false);
        expect(await aggregator.batchExecuted(index)).to.equal(false);

        // Reproduce a future VIP's grant -> execute -> revoke sequence on the fork.
        await (await acm.grantRole(adminRole, u.aggregator)).wait();
        await expect(aggregator.connect(batcher).callStatic.executeBatch(index)).to.be.revertedWithCustomError(
          aggregator,
          "Unauthorized",
        );
        await expect(aggregator.connect(timelock).executeBatch(index))
          .to.emit(aggregator, "BatchExecuted")
          .withArgs(index)
          .and.to.emit(aggregator, "AuthorizedBatcherUpdated")
          .withArgs(newBatcher, true);
        await (await acm.revokeRole(adminRole, u.aggregator)).wait();

        expect(await aggregator.authorizedBatchers(newBatcher)).to.equal(true);
        expect(await aggregator.batchExecuted(index)).to.equal(true);
        expect(await acm.hasRole(adminRole, u.aggregator)).to.equal(false);
        expect(await acm.hasRole(permissionRole, u.aggregator)).to.equal(false);
        await expect(aggregator.connect(timelock).callStatic.executeBatch(index))
          .to.be.revertedWithCustomError(aggregator, "BatchAlreadyExecuted")
          .withArgs(index);
      });
    }
  });
};
