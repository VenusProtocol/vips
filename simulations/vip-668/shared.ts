import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { batch } from "src/auxiliaryCommandsAggregator";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { expectEvents, initMainnetUser, makeProposal } from "src/utils";
import { seedProposalBatchesOnFork } from "src/vip-framework";

import { AggregatorChain, INITIAL_BATCHERS, NEW_IMPLEMENTATION, PROXY_ADMIN } from "../../vips/vip-668/bscmainnet";
import { TIMELOCK_SIGNATURES } from "../../vips/vip-668/bsctestnet";
import ACM_ABI from "./abi/AccessControlManager.json";
import AGGREGATOR_ABI from "./abi/AuxiliaryCommandsAggregator.json";
import PROXY_ADMIN_ABI from "./abi/ProxyAdmin.json";

const OLD_AGGREGATOR_ABI = ["function batchCount() view returns (uint256)"];
const PROXY_ABI = [
  {
    type: "event",
    name: "Upgraded",
    anonymous: false,
    inputs: [{ indexed: true, name: "implementation", type: "address" }],
  },
];

type Chain = AggregatorChain | "bsctestnet";

const contracts = (chain: Chain) => {
  const addresses = NETWORK_ADDRESSES[chain];
  return {
    addresses,
    aggregator: new Contract(addresses.AUXILIARY_COMMANDS_AGGREGATOR, AGGREGATOR_ABI, ethers.provider),
    acm: new Contract(addresses.ACCESS_CONTROL_MANAGER, ACM_ABI, ethers.provider),
  };
};

export const expectBatchers = async (aggregator: Contract, batchers: string[], authorized: boolean) => {
  for (const batcher of batchers) {
    expect(await aggregator.authorizedBatchers(batcher), batcher).to.equal(authorized);
  }
};

export const timelockPermissions = async (chain: Chain, timelocks: string[]) => {
  const { addresses, acm } = contracts(chain);
  const matrix: Record<string, boolean> = {};
  for (const signature of TIMELOCK_SIGNATURES) {
    for (const timelock of timelocks) {
      matrix[`${signature} ${timelock}`] = await acm.isAllowedToCall(timelock, signature, {
        from: addresses.AUXILIARY_COMMANDS_AGGREGATOR,
      });
    }
  }
  return matrix;
};

export const expectTimelockPermissions = async (chain: Chain, allowed: boolean, timelocks: string[]) => {
  for (const [key, value] of Object.entries(await timelockPermissions(chain, timelocks))) {
    expect(value, key).to.equal(allowed);
  }
};

export const expectUpgradeEvents = async (tx: TransactionResponse) => {
  await expectEvents(tx, [PROXY_ABI], ["Upgraded"], [1]);
  await expectEvents(tx, [AGGREGATOR_ABI], ["AuthorizedBatcherUpdated"], [0]);
};

// VIP-645 revoked the Critical Timelock's aggregator permissions, so the live matrix is recorded rather than assumed.
const permissionsBefore: Partial<Record<Chain, Record<string, boolean>>> = {};
const allTimelocks = (chain: Chain) => {
  const { NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK } = NETWORK_ADDRESSES[chain];
  return [NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK];
};

export const preUpgradeChecks = (chain: AggregatorChain) =>
  describe("Pre-VIP behavior", () => {
    const { addresses, aggregator } = contracts(chain);

    before(async () => {
      permissionsBefore[chain] = await timelockPermissions(chain, allTimelocks(chain));
    });

    it("runs the previous implementation", async () => {
      const proxyAdmin = new Contract(PROXY_ADMIN[chain], PROXY_ADMIN_ABI, ethers.provider);
      expect(await proxyAdmin.getProxyImplementation(aggregator.address)).to.not.equal(NEW_IMPLEMENTATION[chain]);
      await expect(aggregator.getBatchCount()).to.be.reverted;
    });

    it("has the VIP-628 batchers", async () => {
      await expectBatchers(aggregator, [...INITIAL_BATCHERS, addresses.GUARDIAN, addresses.NORMAL_TIMELOCK], true);
    });
  });

export const postUpgradeChecks = (chain: AggregatorChain) =>
  describe("Post-VIP behavior", () => {
    const { addresses, aggregator } = contracts(chain);

    it("runs the new implementation with an empty batch list", async () => {
      const proxyAdmin = new Contract(PROXY_ADMIN[chain], PROXY_ADMIN_ABI, ethers.provider);
      expect(await proxyAdmin.getProxyImplementation(aggregator.address)).to.equal(NEW_IMPLEMENTATION[chain]);
      expect(await aggregator.getBatchCount()).to.equal(0);
      await expect(new Contract(aggregator.address, OLD_AGGREGATOR_ABI, ethers.provider).batchCount()).to.be.reverted;
    });

    it("keeps the owner, the ACM, the timelock permissions and the batchers", async () => {
      expect(await aggregator.owner()).to.equal(addresses.NORMAL_TIMELOCK);
      expect(await aggregator.accessControlManager()).to.equal(addresses.ACCESS_CONTROL_MANAGER);
      const permissions = await timelockPermissions(chain, allTimelocks(chain));
      expect(permissions).to.deep.equal(permissionsBefore[chain]);
      expect(permissions[`executeBatch(uint256) ${addresses.NORMAL_TIMELOCK}`]).to.equal(true);
      await expectBatchers(aggregator, [...INITIAL_BATCHERS, addresses.GUARDIAN, addresses.NORMAL_TIMELOCK], true);
    });
  });

// Builds a one-command batch() against the forked aggregator, seeds it and runs it as the Normal Timelock, as a
// proposal would, so the framework's call format and the upgraded contract are checked together.
export const batchRoundTrip = (chain: Chain) =>
  describe("Post-VIP batch round trip", () => {
    const PROBE_TARGET = "0x000000000000000000000000000000000000dEaD";
    const PROBE_ACCOUNT = "0x00000000000000000000000000000000DeaDBeef";
    const PROBE_SIGNATURE = "probe(uint256)";

    it("a batch seeded on the upgraded aggregator executes once", async () => {
      const { addresses, aggregator, acm } = contracts(chain);
      const dstChainId = chain === "bscmainnet" || chain === "bsctestnet" ? undefined : LzChainId[chain];
      const proposal = await makeProposal(
        [
          batch([
            {
              target: addresses.ACCESS_CONTROL_MANAGER,
              signature: "giveCallPermission(address,string,address)",
              params: [PROBE_TARGET, PROBE_SIGNATURE, PROBE_ACCOUNT],
              dstChainId,
            },
          ]),
        ],
        undefined,
        ProposalType.REGULAR,
      );
      const index = await aggregator.getBatchCount();
      const [seeded] = proposal.aggregatorBatches ?? [];
      expect(seeded.index).to.equal(index);
      await seedProposalBatchesOnFork(proposal);

      const [call] = await aggregator.getBatch(index);
      expect(call.signature).to.equal("giveCallPermission(address,string,address)");
      expect(await acm.isAllowedToCall(PROBE_ACCOUNT, PROBE_SIGNATURE, { from: PROBE_TARGET })).to.equal(false);

      const timelock = await initMainnetUser(addresses.NORMAL_TIMELOCK, ethers.utils.parseEther("1"));
      await acm.connect(timelock).grantRole(ethers.constants.HashZero, aggregator.address);
      await aggregator.connect(timelock).executeBatch(index);
      await acm.connect(timelock).revokeRole(ethers.constants.HashZero, aggregator.address);

      expect(await acm.isAllowedToCall(PROBE_ACCOUNT, PROBE_SIGNATURE, { from: PROBE_TARGET })).to.equal(true);
      expect(await aggregator.batchExecuted(index)).to.equal(true);
      expect(await acm.hasRole(ethers.constants.HashZero, aggregator.address)).to.equal(false);
      // BatchAlreadyExecuted(uint256): hardhat reports the selector (no artifact to decode it), anvil-zksync the name.
      await expect(aggregator.connect(timelock).executeBatch(index)).to.be.rejectedWith(
        /BatchAlreadyExecuted|0x5bafbfc6/,
      );
    });
  });
