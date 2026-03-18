import { expect } from "chai";
import sinon from "sinon";
import { NETWORK_ADDRESSES } from "src/networkAddresses";

import {
  ExportJsonDeps,
  ExportResult,
  GenerateCommandsDeps,
  OrchestrateDeps,
  PAUSE_SIGNATURE,
  PauseInput,
  exportJson,
  generateCommands,
  orchestrate,
} from "./generateSafePauseJson";

// ─── Fixtures ───────────────────────────────────────────────────────────────

const COMPTROLLER = "0x" + "C".repeat(40);
const MARKET_A = "0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
const MARKET_B = "0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB";
const MARKET_C = "0xCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC";
const SAFE_ADDRESS = "0x" + "55".repeat(20);

function makeInput(overrides?: Partial<PauseInput>): PauseInput {
  return {
    comptroller: COMPTROLLER,
    comptrollerAbi: [],
    network: "bscmainnet",
    chainId: 56,
    marketAddresses: [MARKET_A, MARKET_B, MARKET_C],
    symbols: new Map([
      [MARKET_A, "vUSDT"],
      [MARKET_B, "vBTC"],
      [MARKET_C, "vETH"],
    ]),
    selectedAction: "pause",
    pauseActions: [0],
    includeEmode: false,
    blockNumber: 12345678,
    ...overrides,
  };
}

function makeGenDeps(overrides?: Partial<GenerateCommandsDeps>): GenerateCommandsDeps {
  return {
    fetchMarketFactors: sinon.stub().resolves({ cf: "500000000000000000", lt: "600000000000000000" }),
    fetchEmodeRange: sinon.stub().resolves({ corePoolId: 0, lastPoolId: 3 }),
    fetchEmodePoolsForMarket: sinon.stub().resolves([]),
    ...overrides,
  };
}

function makeExportDeps(overrides?: Partial<ExportJsonDeps>): ExportJsonDeps {
  const mockProposal = {
    targets: [COMPTROLLER],
    values: ["0"],
    signatures: ["setActionsPaused(address[],uint8[],bool)"],
    params: [[[MARKET_A], [0], true]],
  };
  const mockTxData = [{ to: COMPTROLLER, data: "0x01", value: "0", operation: 0 }];

  return {
    makeProposal: sinon.stub().resolves(mockProposal),
    buildMultiSigTx: sinon.stub().resolves(mockTxData),
    batchTx: sinon.stub().returns({
      version: "1.0",
      chainId: "56",
      meta: { createdFromSafeAddress: SAFE_ADDRESS },
      transactions: mockTxData,
    }),
    writeFileSync: sinon.stub(),
    mkdirSync: sinon.stub(),
    existsSync: sinon.stub().returns(false),
    readFileSync: sinon.stub().returns('{"last": 0}'),
    ...overrides,
  };
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("generateSafePauseJson", () => {
  afterEach(() => {
    sinon.restore();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Group 1: generateCommands — operation="pause"
  // ═══════════════════════════════════════════════════════════════════════════

  describe("generateCommands — pause", () => {
    it("1: single action, 3 markets → 1 command with all markets batched", async () => {
      const input = makeInput({ pauseActions: [0] });
      const deps = makeGenDeps();
      const commands = await generateCommands(input, "pause", deps);

      expect(commands).to.have.length(1);
      expect(commands[0].target).to.equal(COMPTROLLER);
      expect(commands[0].signature).to.equal(PAUSE_SIGNATURE);
      expect(commands[0].params).to.deep.equal([[MARKET_A, MARKET_B, MARKET_C], [0], true]);
    });

    it("2: multiple actions → one command per action", async () => {
      const input = makeInput({ pauseActions: [0, 2, 6] });
      const deps = makeGenDeps();
      const commands = await generateCommands(input, "pause", deps);

      expect(commands).to.have.length(3);
      expect(commands[0].params[1]).to.deep.equal([0]);
      expect(commands[1].params[1]).to.deep.equal([2]);
      expect(commands[2].params[1]).to.deep.equal([6]);
      commands.forEach(cmd => {
        expect(cmd.signature).to.equal(PAUSE_SIGNATURE);
        expect(cmd.params[0]).to.deep.equal([MARKET_A, MARKET_B, MARKET_C]);
        expect(cmd.params[2]).to.equal(true);
      });
    });

    it("3: empty actions → 0 commands", async () => {
      const input = makeInput({ pauseActions: [] });
      const deps = makeGenDeps();
      const commands = await generateCommands(input, "pause", deps);

      expect(commands).to.have.length(0);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Group 2: generateCommands — operation="cf_zero"
  // ═══════════════════════════════════════════════════════════════════════════

  describe("generateCommands — cf_zero", () => {
    it("4: normal market → setCollateralFactor with CF=0 and original LT", async () => {
      const input = makeInput({ marketAddresses: [MARKET_A], symbols: new Map([[MARKET_A, "vUSDT"]]) });
      const deps = makeGenDeps({
        fetchMarketFactors: sinon.stub().resolves({ cf: "500000000000000000", lt: "600000000000000000" }),
      });

      const commands = await generateCommands(input, "cf_zero", deps);

      expect(commands).to.have.length(1);
      expect(commands[0].signature).to.equal("setCollateralFactor(address,uint256,uint256)");
      expect(commands[0].params).to.deep.equal([MARKET_A, 0, "600000000000000000"]);
    });

    it("5: CF already 0 → skip, 0 commands", async () => {
      const input = makeInput({ marketAddresses: [MARKET_A], symbols: new Map([[MARKET_A, "vUSDT"]]) });
      const deps = makeGenDeps({
        fetchMarketFactors: sinon.stub().resolves({ cf: "0", lt: "600000000000000000" }),
      });

      const commands = await generateCommands(input, "cf_zero", deps);

      expect(commands).to.have.length(0);
    });

    it("6: mixed 3 markets, 1 already CF=0 → 2 commands", async () => {
      const input = makeInput();
      const fetchMarketFactors = sinon.stub();
      fetchMarketFactors.withArgs(COMPTROLLER, MARKET_A, sinon.match.any).resolves({
        cf: "500000000000000000",
        lt: "600000000000000000",
      });
      fetchMarketFactors.withArgs(COMPTROLLER, MARKET_B, sinon.match.any).resolves({
        cf: "0",
        lt: "600000000000000000",
      });
      fetchMarketFactors.withArgs(COMPTROLLER, MARKET_C, sinon.match.any).resolves({
        cf: "300000000000000000",
        lt: "400000000000000000",
      });

      const deps = makeGenDeps({ fetchMarketFactors });
      const commands = await generateCommands(input, "cf_zero", deps);

      expect(commands).to.have.length(2);
      expect(commands[0].params[0]).to.equal(MARKET_A);
      expect(commands[0].params[2]).to.equal("600000000000000000");
      expect(commands[1].params[0]).to.equal(MARKET_C);
      expect(commands[1].params[2]).to.equal("400000000000000000");
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Group 3: generateCommands — cf_zero + BSC e-mode
  // ═══════════════════════════════════════════════════════════════════════════

  describe("generateCommands — cf_zero + e-mode", () => {
    it("7: market in non-contiguous pools 0,1,3 → 3 e-mode commands", async () => {
      const input = makeInput({
        marketAddresses: [MARKET_A],
        symbols: new Map([[MARKET_A, "vUSDT"]]),
        includeEmode: true,
        network: "bscmainnet",
      });

      const deps = makeGenDeps({
        fetchMarketFactors: sinon.stub().resolves({ cf: "500000000000000000", lt: "600000000000000000" }),
        fetchEmodeRange: sinon.stub().resolves({ corePoolId: 0, lastPoolId: 3 }),
        fetchEmodePoolsForMarket: sinon.stub().resolves([
          {
            poolId: 0,
            collateralFactorMantissa: "500000000000000000",
            liquidationThresholdMantissa: "600000000000000000",
          },
          {
            poolId: 1,
            collateralFactorMantissa: "400000000000000000",
            liquidationThresholdMantissa: "500000000000000000",
          },
          {
            poolId: 3,
            collateralFactorMantissa: "300000000000000000",
            liquidationThresholdMantissa: "400000000000000000",
          },
        ]),
      });

      const commands = await generateCommands(input, "cf_zero", deps);

      // 1 regular CF=0 command + 3 e-mode commands
      const emodeCmds = commands.filter(c => c.signature === "setCollateralFactor(uint96,address,uint256,uint256)");
      expect(emodeCmds).to.have.length(3);
      expect(emodeCmds[0].params[0]).to.equal(0);
      expect(emodeCmds[1].params[0]).to.equal(1);
      expect(emodeCmds[2].params[0]).to.equal(3);

      // Each e-mode command targets the market with CF=0
      emodeCmds.forEach(cmd => {
        expect(cmd.params[1]).to.equal(MARKET_A);
        expect(cmd.params[2]).to.equal(0);
      });
    });

    it("8: multiple markets, different pools → correct e-mode commands per market", async () => {
      const input = makeInput({
        marketAddresses: [MARKET_A, MARKET_B],
        symbols: new Map([
          [MARKET_A, "vUSDT"],
          [MARKET_B, "vBTC"],
        ]),
        includeEmode: true,
        network: "bscmainnet",
      });

      const fetchEmodePoolsForMarket = sinon.stub();
      fetchEmodePoolsForMarket.withArgs(COMPTROLLER, MARKET_A, 0, 3).resolves([
        {
          poolId: 0,
          collateralFactorMantissa: "500000000000000000",
          liquidationThresholdMantissa: "600000000000000000",
        },
        {
          poolId: 1,
          collateralFactorMantissa: "400000000000000000",
          liquidationThresholdMantissa: "500000000000000000",
        },
      ]);
      fetchEmodePoolsForMarket.withArgs(COMPTROLLER, MARKET_B, 0, 3).resolves([
        {
          poolId: 2,
          collateralFactorMantissa: "300000000000000000",
          liquidationThresholdMantissa: "400000000000000000",
        },
      ]);

      const deps = makeGenDeps({
        fetchMarketFactors: sinon.stub().resolves({ cf: "500000000000000000", lt: "600000000000000000" }),
        fetchEmodeRange: sinon.stub().resolves({ corePoolId: 0, lastPoolId: 3 }),
        fetchEmodePoolsForMarket,
      });

      const commands = await generateCommands(input, "cf_zero", deps);

      const emodeCmds = commands.filter(c => c.signature === "setCollateralFactor(uint96,address,uint256,uint256)");
      expect(emodeCmds).to.have.length(3);

      // A → pool 0 and 1
      expect(emodeCmds[0].params[0]).to.equal(0);
      expect(emodeCmds[0].params[1]).to.equal(MARKET_A);
      expect(emodeCmds[1].params[0]).to.equal(1);
      expect(emodeCmds[1].params[1]).to.equal(MARKET_A);

      // B → pool 2
      expect(emodeCmds[2].params[0]).to.equal(2);
      expect(emodeCmds[2].params[1]).to.equal(MARKET_B);
    });

    it("9: pool CF already 0 → skip that pool", async () => {
      const input = makeInput({
        marketAddresses: [MARKET_A],
        symbols: new Map([[MARKET_A, "vUSDT"]]),
        includeEmode: true,
        network: "bscmainnet",
      });

      const deps = makeGenDeps({
        fetchMarketFactors: sinon.stub().resolves({ cf: "500000000000000000", lt: "600000000000000000" }),
        fetchEmodeRange: sinon.stub().resolves({ corePoolId: 0, lastPoolId: 1 }),
        fetchEmodePoolsForMarket: sinon.stub().resolves([
          { poolId: 0, collateralFactorMantissa: "0", liquidationThresholdMantissa: "600000000000000000" },
          {
            poolId: 1,
            collateralFactorMantissa: "400000000000000000",
            liquidationThresholdMantissa: "500000000000000000",
          },
        ]),
      });

      const commands = await generateCommands(input, "cf_zero", deps);

      const emodeCmds = commands.filter(c => c.signature === "setCollateralFactor(uint96,address,uint256,uint256)");
      expect(emodeCmds).to.have.length(1);
      expect(emodeCmds[0].params[0]).to.equal(1); // only pool 1 (pool 0 skipped)
    });

    it("10: market in no pools → 0 e-mode commands", async () => {
      const input = makeInput({
        marketAddresses: [MARKET_A],
        symbols: new Map([[MARKET_A, "vUSDT"]]),
        includeEmode: true,
        network: "bscmainnet",
      });

      const deps = makeGenDeps({
        fetchMarketFactors: sinon.stub().resolves({ cf: "500000000000000000", lt: "600000000000000000" }),
        fetchEmodeRange: sinon.stub().resolves({ corePoolId: 0, lastPoolId: 3 }),
        fetchEmodePoolsForMarket: sinon.stub().resolves([]),
      });

      const commands = await generateCommands(input, "cf_zero", deps);

      const emodeCmds = commands.filter(c => c.signature === "setCollateralFactor(uint96,address,uint256,uint256)");
      expect(emodeCmds).to.have.length(0);
    });

    it("11: includeEmode=false → fetchEmodeRange never called", async () => {
      const input = makeInput({
        marketAddresses: [MARKET_A],
        symbols: new Map([[MARKET_A, "vUSDT"]]),
        includeEmode: false,
        network: "bscmainnet",
      });

      const fetchEmodeRange = sinon.stub().resolves({ corePoolId: 0, lastPoolId: 3 });
      const deps = makeGenDeps({
        fetchMarketFactors: sinon.stub().resolves({ cf: "500000000000000000", lt: "600000000000000000" }),
        fetchEmodeRange,
      });

      const commands = await generateCommands(input, "cf_zero", deps);

      expect(fetchEmodeRange.called).to.be.false;
      const emodeCmds = commands.filter(c => c.signature === "setCollateralFactor(uint96,address,uint256,uint256)");
      expect(emodeCmds).to.have.length(0);
      // Still has the regular CF=0 command
      expect(commands).to.have.length(1);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Group 4: exportJson
  // ═══════════════════════════════════════════════════════════════════════════

  describe("exportJson", () => {
    it("12: empty commands → returns null, writeFileSync not called", async () => {
      const deps = makeExportDeps();
      const result = await exportJson([], makeInput(), SAFE_ADDRESS, undefined, deps);

      expect(result).to.be.null;
      expect((deps.writeFileSync as sinon.SinonStub).called).to.be.false;
    });

    it("13: normal commands → returns ExportResult, writeFileSync called 4x (txBuilder, metadata, record, counter)", async () => {
      const commands = [
        { target: COMPTROLLER, signature: "setActionsPaused(address[],uint8[],bool)", params: [[MARKET_A], [0], true] },
      ];
      const deps = makeExportDeps();
      const result = await exportJson(commands, makeInput(), SAFE_ADDRESS, undefined, deps);

      expect(result).to.not.be.null;
      expect(result!.txCount).to.equal(1);
      expect(result!.safeAddress).to.equal(SAFE_ADDRESS);
      expect((deps.writeFileSync as sinon.SinonStub).callCount).to.equal(4);
    });

    it("14: suffix='_cf' → file paths contain '_cf'", async () => {
      const commands = [{ target: COMPTROLLER, signature: "foo(uint256)", params: [1] }];
      const deps = makeExportDeps();
      const result = await exportJson(commands, makeInput(), SAFE_ADDRESS, "_cf", deps);

      expect(result).to.not.be.null;
      expect(result!.label).to.equal("_cf");
      expect(result!.txBuilderFile).to.include("_cf");
      expect(result!.metadataFile).to.include("_cf");
      expect(result!.recordFile).to.include("_cf");
    });

    it("15: txBuilder JSON has meta.createdFromSafeAddress, transactions[], blockNumber", async () => {
      const commands = [{ target: COMPTROLLER, signature: "foo(uint256)", params: [1] }];
      const deps = makeExportDeps();

      await exportJson(commands, makeInput(), SAFE_ADDRESS, undefined, deps);

      // First writeFileSync call is the txBuilder file
      const writeStub = deps.writeFileSync as sinon.SinonStub;
      const txBuilderJson = JSON.parse(writeStub.getCall(0).args[1]);

      expect(txBuilderJson).to.have.property("blockNumber", 12345678);
      expect(txBuilderJson).to.have.property("meta");
      expect(txBuilderJson.meta).to.have.property("createdFromSafeAddress", SAFE_ADDRESS);
      expect(txBuilderJson).to.have.property("transactions").that.is.an("array");
    });

    it("16: metadata JSON has comptroller, network, blockNumber, createdAt, symbols as object", async () => {
      const commands = [{ target: COMPTROLLER, signature: "foo(uint256)", params: [1] }];
      const deps = makeExportDeps();

      await exportJson(commands, makeInput(), SAFE_ADDRESS, undefined, deps);

      // Second writeFileSync call is the metadata file
      const writeStub = deps.writeFileSync as sinon.SinonStub;
      const metadataJson = JSON.parse(writeStub.getCall(1).args[1]);

      expect(metadataJson).to.have.property("comptroller", COMPTROLLER);
      expect(metadataJson).to.have.property("network", "bscmainnet");
      expect(metadataJson).to.have.property("blockNumber", 12345678);
      expect(metadataJson).to.have.property("createdAt").that.is.a("string");
      expect(metadataJson).to.have.property("symbols").that.is.an("object");
      expect(metadataJson.symbols).to.not.be.instanceOf(Map);
      expect(metadataJson.symbols[MARKET_A]).to.equal("vUSDT");
    });

    it("17: counter increments across consecutive calls → record files 001, 002", async () => {
      const commands = [{ target: COMPTROLLER, signature: "foo(uint256)", params: [1] }];

      // Track counter state across calls
      let counterState = 0;
      const existsSyncStub = sinon.stub();
      existsSyncStub.callsFake((p: string) => {
        if (String(p).includes("counter.json")) return counterState > 0;
        return false;
      });
      const readFileSyncStub = sinon.stub();
      readFileSyncStub.callsFake(() => JSON.stringify({ last: counterState }));
      const writeFileSyncStub = sinon.stub();
      writeFileSyncStub.callsFake((file: string, data: string) => {
        if (String(file).includes("counter.json")) {
          counterState = JSON.parse(data).last;
        }
      });

      const deps = makeExportDeps({
        existsSync: existsSyncStub,
        readFileSync: readFileSyncStub,
        writeFileSync: writeFileSyncStub,
      });

      // First call
      const result1 = await exportJson(commands, makeInput(), SAFE_ADDRESS, undefined, deps);
      expect(result1).to.not.be.null;
      expect(result1!.recordFile).to.include("001_");
      expect(counterState).to.equal(1);

      // Second call
      const result2 = await exportJson(commands, makeInput(), SAFE_ADDRESS, undefined, deps);
      expect(result2).to.not.be.null;
      expect(result2!.recordFile).to.include("002_");
      expect(counterState).to.equal(2);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Group 5: orchestrate (main routing)
  // ═══════════════════════════════════════════════════════════════════════════

  describe("orchestrate", () => {
    const BSC_GUARDIAN = (NETWORK_ADDRESSES as any).bscmainnet?.GUARDIAN || "";
    const BSC_CRITICAL_GUARDIAN = (NETWORK_ADDRESSES as any).bscmainnet?.CRITICAL_GUARDIAN || "";
    const ETH_GUARDIAN = (NETWORK_ADDRESSES as any).ethereum?.GUARDIAN || "";

    function makeOrcDeps(): OrchestrateDeps & { stubs: { gen: sinon.SinonStub; exp: sinon.SinonStub } } {
      const gen = sinon.stub().resolves([{ target: COMPTROLLER, signature: "foo()", params: [] }]);
      const exp = sinon.stub().resolves({
        label: "",
        txBuilderFile: "/tmp/tx.json",
        metadataFile: "/tmp/meta.json",
        recordFile: "/tmp/rec.json",
        txCount: 1,
        safeAddress: SAFE_ADDRESS,
      } as ExportResult);

      return {
        generateCommands: gen,
        exportJson: exp,
        stubs: { gen, exp },
      };
    }

    it("18: bscmainnet + pause → generateCommands('pause'), exportJson with Guardian", async () => {
      const input = makeInput({ network: "bscmainnet", selectedAction: "pause" });
      const deps = makeOrcDeps();
      await orchestrate(input, deps);

      expect(deps.stubs.gen.calledOnce).to.be.true;
      expect(deps.stubs.gen.firstCall.args[1]).to.equal("pause");
      expect(deps.stubs.exp.calledOnce).to.be.true;
      expect(deps.stubs.exp.firstCall.args[2]).to.equal(BSC_GUARDIAN);
    });

    it("19: bscmainnet + cf_zero → generateCommands('cf_zero'), exportJson with Critical Guardian", async () => {
      const input = makeInput({ network: "bscmainnet", selectedAction: "cf_zero" });
      const deps = makeOrcDeps();
      await orchestrate(input, deps);

      expect(deps.stubs.gen.calledOnce).to.be.true;
      expect(deps.stubs.gen.firstCall.args[1]).to.equal("cf_zero");
      expect(deps.stubs.exp.calledOnce).to.be.true;
      expect(deps.stubs.exp.firstCall.args[2]).to.equal(BSC_CRITICAL_GUARDIAN);
    });

    it("20: bscmainnet + both → 2x generateCommands (pause + cf_zero), 2x exportJson (Guardian + Critical Guardian)", async () => {
      const input = makeInput({ network: "bscmainnet", selectedAction: "both" });
      const deps = makeOrcDeps();
      await orchestrate(input, deps);

      expect(deps.stubs.gen.calledTwice).to.be.true;
      expect(deps.stubs.gen.firstCall.args[1]).to.equal("pause");
      expect(deps.stubs.gen.secondCall.args[1]).to.equal("cf_zero");

      expect(deps.stubs.exp.calledTwice).to.be.true;
      expect(deps.stubs.exp.firstCall.args[2]).to.equal(BSC_GUARDIAN);
      expect(deps.stubs.exp.secondCall.args[2]).to.equal(BSC_CRITICAL_GUARDIAN);
      expect(deps.stubs.exp.secondCall.args[3]).to.equal("_cf");
    });

    it("21: ethereum + pause → generateCommands('pause'), exportJson with Guardian", async () => {
      const input = makeInput({ network: "ethereum", chainId: 1, selectedAction: "pause" });
      const deps = makeOrcDeps();
      await orchestrate(input, deps);

      expect(deps.stubs.gen.calledOnce).to.be.true;
      expect(deps.stubs.gen.firstCall.args[1]).to.equal("pause");
      expect(deps.stubs.exp.calledOnce).to.be.true;
      expect(deps.stubs.exp.firstCall.args[2]).to.equal(ETH_GUARDIAN);
    });

    it("22: ethereum + cf_zero → generateCommands('cf_zero'), exportJson with Guardian", async () => {
      const input = makeInput({ network: "ethereum", chainId: 1, selectedAction: "cf_zero" });
      const deps = makeOrcDeps();
      await orchestrate(input, deps);

      expect(deps.stubs.gen.calledOnce).to.be.true;
      expect(deps.stubs.gen.firstCall.args[1]).to.equal("cf_zero");
      expect(deps.stubs.exp.calledOnce).to.be.true;
      expect(deps.stubs.exp.firstCall.args[2]).to.equal(ETH_GUARDIAN);
    });

    it("23: ethereum + both → BUG: 'both' passed as operation to generateCommands (not a valid operation)", async () => {
      const input = makeInput({ network: "ethereum", chainId: 1, selectedAction: "both" });
      const deps = makeOrcDeps();
      await orchestrate(input, deps);

      // Documents the bug: "both" is cast to "pause" | "cf_zero" and passed directly
      // Since generateCommands only handles "pause" and "cf_zero", "both" matches neither → empty commands
      expect(deps.stubs.gen.calledOnce).to.be.true;
      expect(deps.stubs.gen.firstCall.args[1]).to.equal("both");
    });
  });
});

// delay: true in mocha config requires run() to be deferred until after mocha finishes loading
setTimeout(run, 100);
