import { TransactionReceipt } from "@ethersproject/providers";
import { takeSnapshot } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { FORKED_NETWORK, ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../networkAddresses";
import { Proposal } from "../types";
import { initMainnetUser } from "../utils";
import AGGREGATOR_ABI from "./abi/AuxiliaryCommandsAggregator.json";

export const forkedBatches = (proposal: Proposal) =>
  (proposal.aggregatorBatches ?? []).filter(batch => batch.network === FORKED_NETWORK);

export const expectForkedBatchesRan = async (proposal: Proposal, receipt: TransactionReceipt) => {
  const batches = forkedBatches(proposal);
  const aggregatorInterface = new ethers.utils.Interface(AGGREGATOR_ABI);
  const executed = receipt.logs
    .filter(log => batches.some(batch => batch.aggregator.toLowerCase() === log.address.toLowerCase()))
    .map(log => aggregatorInterface.parseLog(log))
    .filter(event => event.name === "BatchExecuted")
    .map(event => String(event.args.index));
  const acm = new ethers.Contract(
    NETWORK_ADDRESSES[FORKED_NETWORK as "bscmainnet"].ACCESS_CONTROL_MANAGER,
    ["function hasRole(bytes32,address) view returns (bool)"],
    ethers.provider,
  );

  for (const batch of batches) {
    expect(executed, `batch ${batch.index} did not run`).to.include(String(batch.index));
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

// executeBatch drops the failing call's revert reason, so replaying the batch from the aggregator recovers it.
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
    for (const [i, { target, data, signature }] of batch.calls.entries()) {
      await aggregator.sendTransaction({ to: target, data }).catch((failure: { reason?: string }) => {
        const reason = failure.reason ?? failure;
        throw new Error(`aggregator batch ${batch.index} call ${i} (${signature} on ${target}) reverted: ${reason}`);
      });
    }
  } finally {
    await snapshot.restore();
  }
  throw error;
};
