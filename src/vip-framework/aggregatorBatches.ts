import { TransactionReceipt } from "@ethersproject/providers";
import { takeSnapshot } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { FORKED_NETWORK, ethers } from "hardhat";

import { isSimulation, seedBatches } from "../auxiliaryCommandsAggregator";
import { NETWORK_ADDRESSES } from "../networkAddresses";
import { Proposal } from "../types";
import { initMainnetUser, resolvePerTxGasCap } from "../utils";
import AGGREGATOR_ABI from "./abi/AuxiliaryCommandsAggregator.json";

export const forkedBatches = (proposal: Proposal) =>
  (proposal.aggregatorBatches ?? []).filter(batch => batch.network === FORKED_NETWORK);

// Seeds only the current fork's unseeded batches. Test runners call this automatically during setup unless
// seedProposalBatches is false. It is also available for manual setup. Building a proposal never seeds batches.
export const seedProposalBatchesOnFork = async (proposal: Proposal) => {
  const pending = forkedBatches(proposal).filter(batch => !batch.seeded);
  if (pending.length === 0) return;
  if (!isSimulation() || !FORKED_NETWORK) {
    throw new Error("batch: seedProposalBatchesOnFork requires a local simulation with a forked network");
  }
  if (pending.some(batch => batch.index === undefined)) {
    throw new Error("batch: build the proposal against the current fork before seeding its batches");
  }
  const timelock = NETWORK_ADDRESSES[FORKED_NETWORK as "bscmainnet"].NORMAL_TIMELOCK;
  const balance = await ethers.provider.getBalance(timelock);
  const batcher = await initMainnetUser(timelock, balance.add(ethers.utils.parseEther("10")));
  try {
    const cap = await resolvePerTxGasCap(FORKED_NETWORK);
    await seedBatches(batcher, pending, Number.isFinite(cap) ? { gasLimit: cap } : {});
    for (const batch of pending) batch.seeded = true;
  } finally {
    await initMainnetUser(timelock, balance);
  }
};

export const expectForkedBatchesRan = async (proposal: Proposal, receipt: TransactionReceipt) => {
  const batches = forkedBatches(proposal);
  const aggregatorInterface = new ethers.utils.Interface(AGGREGATOR_ABI);
  const executedIndices = receipt.logs
    .filter(
      log =>
        // The aggregator is a proxy, so its logs can include proxy events its ABI can't parse.
        log.topics[0] === aggregatorInterface.getEventTopic("BatchExecuted") &&
        batches.some(batch => batch.aggregator.toLowerCase() === log.address.toLowerCase()),
    )
    .map(log => String(aggregatorInterface.parseLog(log).args.index));
  const acm = new ethers.Contract(
    NETWORK_ADDRESSES[FORKED_NETWORK as "bscmainnet"].ACCESS_CONTROL_MANAGER,
    ["function hasRole(bytes32,address) view returns (bool)"],
    ethers.provider,
  );

  for (const batch of batches) {
    expect(executedIndices, `batch ${batch.index} did not run`).to.include(String(batch.index));
    expect(
      await acm.hasRole(ethers.constants.HashZero, batch.aggregator),
      "aggregator kept DEFAULT_ADMIN_ROLE",
    ).to.equal(false);
    for (const { target, signature } of batch.permissions) {
      const role = ethers.utils.solidityKeccak256(["address", "string"], [target, signature]);
      expect(await acm.hasRole(role, batch.aggregator), `aggregator kept ${signature} on ${target}`).to.equal(false);
    }
  }
};

// executeBatch reports a failure as CallFailed with only the call's index and raw revert data, so replaying the batch
// from the aggregator names the call (by its signature, or its selector for a raw call) and lets the node decode its
// revert reason.
export const explainBatchFailure = async (proposal: Proposal, commandIdx: number, error: unknown) => {
  const batch = forkedBatches(proposal).find(
    candidate =>
      proposal.targets[commandIdx] === candidate.aggregator &&
      proposal.signatures[commandIdx] === "executeBatch(uint256)" &&
      candidate.index?.eq(proposal.params[commandIdx][0]),
  );
  if (!batch) throw error;

  const snapshot = await takeSnapshot();
  const aggregator = await initMainnetUser(batch.aggregator, ethers.utils.parseEther("1"));
  try {
    for (const [i, { target, signature, data }] of batch.calls.entries()) {
      const calldata = signature ? ethers.utils.id(signature).slice(0, 10) + data.slice(2) : data;
      await aggregator.sendTransaction({ to: target, data: calldata }).catch((failure: { reason?: string }) => {
        const reason = failure.reason ?? failure;
        const name = signature || calldata.slice(0, 10);
        throw new Error(`aggregator batch ${batch.index} call ${i} (${name} on ${target}) reverted: ${reason}`);
      });
    }
  } finally {
    await snapshot.restore();
  }
  throw error;
};
