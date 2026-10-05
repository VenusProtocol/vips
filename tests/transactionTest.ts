import { expect } from "chai";
import { BigNumber } from "ethers";
import sinon from "sinon";
import * as transaction from "src/transactions";
import { AggregatorBatch, Proposal } from "src/types";

const mockCalldata =
  "0xda95691a00000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000000001a0000000000000000000000000000000000000000000000000000000000000022000000000000000000000000000000000000000000000000000000000000000010000000000000000000000002d56dc077072b53571b8252008c60e945108c75a000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000157465737446756e6374696f6e2875696e7432353629000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000003e800000000000000000000000000000000000000000000000000000000000000197b226465736372697074696f6e223a2274657374696e67227d00000000000000";

const mockCalldataWithType =
  "0x164a1ab100000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000014000000000000000000000000000000000000000000000000000000000000001c00000000000000000000000000000000000000000000000000000000000000240000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000010000000000000000000000002d56dc077072b53571b8252008c60e945108c75a000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000167465737446756e6374696f6e312875696e74323536290000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000003e8000000000000000000000000000000000000000000000000000000000000001a7b226465736372697074696f6e223a2274657374696e6731227d000000000000";

const mockedInput = {
  targets: ["0x2d56dC077072B53571b8252008C60e945108c75a"],
  signatures: ["testFunction(uint256)"],
  values: ["0"],
  params: [["1000"]],
  meta: { description: "testing" },
};

const mockedInput1 = {
  targets: ["0x2d56dC077072B53571b8252008C60e945108c75a"],
  signatures: ["testFunction1(uint256)"],
  values: ["0"],
  params: [["1000"]],
  meta: { description: "testing1" },
  type: 1,
};

const DEFAULT_GOVERNOR_PROXY = "0x2d56dC077072B53571b8252008C60e945108c75a";
describe("proposeVIP", () => {
  afterEach(function () {
    sinon.restore();
  });
  it("should match calldata without proposal type", async () => {
    const loadProposalStub = sinon.stub().returns(mockedInput);
    sinon.replace(transaction, "loadProposal", loadProposalStub);
    const result = await transaction.proposeVIP("1");
    expect(result.calldata).equal(mockCalldata);
  });

  it("should match calldata with proposal type", async () => {
    const loadProposalStub = sinon.stub().returns(mockedInput1);
    sinon.replace(transaction, "loadProposal", loadProposalStub);
    const result = await transaction.proposeVIP("1");
    expect(result.calldata).equal(mockCalldataWithType);
  });
  it("should return default governor address if not provided", async () => {
    const loadProposalStub = sinon.stub().returns(mockedInput);
    sinon.replace(transaction, "loadProposal", loadProposalStub);
    const result = await transaction.proposeVIP("1");
    expect(result.target).equal(DEFAULT_GOVERNOR_PROXY);
  });
  it("should return provided governor address if provided", async () => {
    const loadProposalStub = sinon.stub().returns(mockedInput);
    const governorAddress = "0x295e26495CEF6F69dFA69911d9D8e4F3bBadB89B";
    sinon.replace(transaction, "loadProposal", loadProposalStub);
    const result = await transaction.proposeVIP("1", governorAddress);
    expect(result.target).equal(governorAddress);
  });
});

describe("assertBatchesSeeded", () => {
  const PLACEHOLDER = "0x1111111111111111111111111111111111111111";
  const batch = (network: AggregatorBatch["network"], index: number | undefined, seeded: boolean): AggregatorBatch => ({
    network,
    seeded,
    aggregator: PLACEHOLDER,
    index: index === undefined ? undefined : BigNumber.from(index),
    calls: [{ target: PLACEHOLDER, data: "0x", signature: "" }],
    permissions: [],
  });
  const withBatches = (...aggregatorBatches: AggregatorBatch[]) =>
    ({ ...mockedInput, aggregatorBatches } as unknown as Proposal);

  it("refuses a proposal with unseeded aggregator batches", () => {
    expect(() =>
      transaction.assertBatchesSeeded(
        withBatches(batch("bscmainnet", 4, true), batch("ethereum", 2, false)),
        "vip-1/bsc",
      ),
    ).to.throw(
      "BATCH_NOT_SEEDED: ethereum batch 2 (1 calls); seed them with `npx hardhat seedAggregatorBatches vip-1/bsc --network bscmainnet`, then pin each with batch(commands, { actualIndex })",
    );
  });

  it("refuses a proposal built without reading a chain's batches", () => {
    expect(() =>
      transaction.assertBatchesSeeded(withBatches(batch("ethereum", undefined, false)), "vip-1/bsc"),
    ).to.throw("aggregate: ethereum batches were not read");
  });

  it("accepts a proposal whose batches are all seeded, or that has none", () => {
    expect(() =>
      transaction.assertBatchesSeeded(withBatches(batch("bscmainnet", 4, true)), "vip-1/bsc"),
    ).to.not.throw();
    expect(() => transaction.assertBatchesSeeded(withBatches(), "vip-1/bsc")).to.not.throw();
  });
});

// delay: true in mocha config requires run() to be deferred until after mocha finishes loading
setTimeout(run, 100);
