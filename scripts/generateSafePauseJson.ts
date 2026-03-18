import { TxBuilder } from "@morpho-labs/gnosis-tx-builder";
import * as fs from "fs";
import { ethers, network } from "hardhat";
import * as path from "path";
import * as readline from "readline";
import { buildMultiSigTx } from "src/multisig/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { Command, Proposal } from "src/types";
import { makeProposal } from "src/utils";

// ─── Configuration ──────────────────────────────────────────────────────────

// Matches the Action enum in the Comptroller contract exactly
const Actions: Record<string, number> = {
  MINT: 0,
  REDEEM: 1,
  BORROW: 2,
  REPAY: 3,
  SEIZE: 4,
  LIQUIDATE: 5,
  TRANSFER: 6,
  ENTER_MARKET: 7,
  EXIT_MARKET: 8,
};

const PAUSE_SIGNATURE = "setActionsPaused(address[],uint8[],bool)";

const MARKETS_FILE = path.resolve(__dirname, "data", "markets.json");
const OUTPUT_DIR = path.resolve(__dirname, "data");
const RECORDS_DIR = path.resolve(OUTPUT_DIR, "safePauseTXRecords");

// ─── Types ──────────────────────────────────────────────────────────────────

interface PauseMetadata {
  comptroller: string;
  network: string;
  blockNumber: number;
  createdAt: string;
  symbols: Record<string, string>;
}

interface PauseInput {
  comptroller: string;
  comptrollerAbi: string[];
  network: string;
  chainId: number;
  marketAddresses: string[];
  symbols: Map<string, string>;
  selectedAction: "pause" | "cf_zero" | "both";
  pauseActions: number[];
  includeEmode: boolean;
  blockNumber: number;
}

interface ExportResult {
  label: string;
  txBuilderFile: string;
  metadataFile: string;
  recordFile: string;
  txCount: number;
  safeAddress: string;
}

interface EmodePoolInfo {
  poolId: number;
  collateralFactorMantissa: string;
  liquidationThresholdMantissa: string;
}

interface GenerateCommandsDeps {
  fetchMarketFactors: (comptroller: string, vToken: string, abi: string[]) => Promise<{ cf: string; lt: string }>;
  fetchEmodeRange: (comptroller: string) => Promise<{ corePoolId: number; lastPoolId: number }>;
  fetchEmodePoolsForMarket: (
    comptroller: string,
    vToken: string,
    corePoolId: number,
    lastPoolId: number,
  ) => Promise<EmodePoolInfo[]>;
}

interface ExportJsonDeps {
  makeProposal: (...args: any[]) => Promise<any>;
  buildMultiSigTx: (...args: any[]) => Promise<any[]>;
  batchTx: (safeAddress: string, txData: any[], options: any) => any;
  writeFileSync: (...args: any[]) => void;
  mkdirSync: (...args: any[]) => void;
  existsSync: (...args: any[]) => boolean;
  readFileSync: (...args: any[]) => any;
}

interface OrchestrateDeps {
  generateCommands: (
    input: PauseInput,
    operation: "pause" | "cf_zero",
    deps?: GenerateCommandsDeps,
  ) => Promise<Command[]>;
  exportJson: (
    commands: Command[],
    input: PauseInput,
    safeAddress: string,
    suffix?: string,
    deps?: ExportJsonDeps,
  ) => Promise<ExportResult | null>;
}

// BSC core pool markets() returns extra fields (isVenus, liquidationIncentive, etc.)
const BSC_COMPTROLLER_ABI = [
  "function getAllMarkets() view returns (address[])",
  "function markets(address) view returns (bool isListed, uint256 collateralFactorMantissa, bool isVenus, uint256 liquidationThresholdMantissa, uint256 liquidationIncentiveMantissa, uint96 marketPoolId, bool isBorrowAllowed)",
  "function corePoolId() view returns (uint96)",
  "function lastPoolId() view returns (uint96)",
  "function poolMarkets(uint96,address) view returns (bool isListed, uint256 collateralFactorMantissa, bool isVenus, uint256 liquidationThresholdMantissa, uint256 liquidationIncentiveMantissa, uint96 marketPoolId, bool isBorrowAllowed)",
];

// Remote chain comptrollers (isolated pool style)
const REMOTE_COMPTROLLER_ABI = [
  "function getAllMarkets() view returns (address[])",
  "function markets(address) view returns (bool isListed, uint256 collateralFactorMantissa, uint256 liquidationThresholdMantissa)",
];

const getComptrollerAbi = (networkName: string) => {
  return networkName === "bscmainnet" ? BSC_COMPTROLLER_ABI : REMOTE_COMPTROLLER_ABI;
};

// ─── On-chain queries ───────────────────────────────────────────────────────

const VTOKEN_ABI = ["function symbol() view returns (string)"];

const fetchSymbol = async (vToken: string): Promise<string> => {
  try {
    const contract = new ethers.Contract(vToken, VTOKEN_ABI, ethers.provider);
    return await contract.symbol();
  } catch {
    return `MARKET_${vToken.slice(2, 8).toUpperCase()}`;
  }
};

/**
 * Fetches all market addresses from the comptroller via getAllMarkets().
 */
const fetchAllMarkets = async (comptroller: string, abi: string[]): Promise<string[]> => {
  const contract = new ethers.Contract(comptroller, abi, ethers.provider);
  const allMarkets: string[] = await contract.getAllMarkets();
  console.log(`Found ${allMarkets.length} market(s) on comptroller.`);
  return allMarkets;
};

/**
 * Filters markets to only listed ones and fetches their symbols.
 * When logUnlisted is true (user-provided addresses), logs any unlisted markets that are removed.
 */
const filterListedAndFetchSymbols = async (
  comptroller: string,
  abi: string[],
  markets: string[],
  logUnlisted: boolean,
): Promise<{ addresses: string[]; symbols: Map<string, string> }> => {
  const contract = new ethers.Contract(comptroller, abi, ethers.provider);
  const addresses: string[] = [];
  const symbols = new Map<string, string>();
  console.log(`Checking ${markets.length} market(s)...`);
  for (let i = 0; i < markets.length; i++) {
    const market = markets[i];
    const { isListed } = await contract.markets(market);
    if (isListed) {
      addresses.push(market);
      const symbol = await fetchSymbol(market);
      symbols.set(market, symbol);
    } else if (logUnlisted) {
      console.log(`  Skipping unlisted market: ${market}`);
    }
    const pct = Math.round(((i + 1) / markets.length) * 100);
    process.stdout.write(`\r  Progress: ${i + 1}/${markets.length} (${pct}%) — ${addresses.length} listed`);
  }
  process.stdout.write("\n");
  return { addresses, symbols };
};

const fetchMarketFactors = async (
  comptroller: string,
  vToken: string,
  abi: string[],
): Promise<{ cf: string; lt: string }> => {
  const contract = new ethers.Contract(comptroller, abi, ethers.provider);
  const marketData = await contract.markets(vToken);
  return {
    cf: marketData.collateralFactorMantissa.toString(),
    lt: marketData.liquidationThresholdMantissa.toString(),
  };
};

// ─── E-mode helpers (BSC core pool) ─────────────────────────────────────────

const fetchEmodeRange = async (comptroller: string): Promise<{ corePoolId: number; lastPoolId: number }> => {
  const contract = new ethers.Contract(comptroller, BSC_COMPTROLLER_ABI, ethers.provider);
  const coreId = (await contract.corePoolId()).toNumber();
  const lastId = (await contract.lastPoolId()).toNumber();
  return { corePoolId: coreId, lastPoolId: lastId };
};

const fetchEmodePoolsForMarket = async (
  comptroller: string,
  vToken: string,
  corePoolId: number,
  lastPoolId: number,
): Promise<EmodePoolInfo[]> => {
  const contract = new ethers.Contract(comptroller, BSC_COMPTROLLER_ABI, ethers.provider);
  const pools: EmodePoolInfo[] = [];
  for (let poolId = corePoolId; poolId <= lastPoolId; poolId++) {
    const data = await contract.poolMarkets(poolId, vToken);
    if (data.isListed) {
      pools.push({
        poolId,
        collateralFactorMantissa: data.collateralFactorMantissa.toString(),
        liquidationThresholdMantissa: data.liquidationThresholdMantissa.toString(),
      });
    }
  }
  return pools;
};

// ─── Markets file ───────────────────────────────────────────────────────────

const loadMarketsFromFile = (): string[] => {
  if (!fs.existsSync(MARKETS_FILE)) return [];
  const content = JSON.parse(fs.readFileSync(MARKETS_FILE, "utf-8"));
  if (!Array.isArray(content)) return [];
  return content.filter((addr: string) => ethers.utils.isAddress(addr));
};

const saveMarketsToFile = (addresses: string[]) => {
  fs.writeFileSync(MARKETS_FILE, JSON.stringify(addresses, null, 2));
  console.log(`Markets saved to ${MARKETS_FILE} (${addresses.length} addresses)`);
};

// ─── Network helpers ────────────────────────────────────────────────────────

const getComptrollerAddress = (networkName: string): string => {
  const config = (NETWORK_ADDRESSES as Record<string, Record<string, string>>)[networkName] || {};
  return config.UNITROLLER || config.CORE_COMPTROLLER || "";
};

const getGuardianAddress = (networkName: string): string => {
  const config = (NETWORK_ADDRESSES as Record<string, Record<string, string>>)[networkName] || {};
  return config.GUARDIAN || "";
};

const getCriticalGuardianAddress = (networkName: string): string => {
  const config = (NETWORK_ADDRESSES as Record<string, Record<string, string>>)[networkName] || {};
  return config.CRITICAL_GUARDIAN || "";
};

// ─── Default dependencies ───────────────────────────────────────────────────

const defaultGenerateCommandsDeps: GenerateCommandsDeps = {
  fetchMarketFactors,
  fetchEmodeRange,
  fetchEmodePoolsForMarket,
};

const defaultExportJsonDeps: ExportJsonDeps = {
  makeProposal,
  buildMultiSigTx,
  batchTx: (safeAddr: string, txData: any[], opts: any) => TxBuilder.batch(safeAddr, txData, opts),
  writeFileSync: (file: any, data: any) => fs.writeFileSync(file, data),
  mkdirSync: (dir: any, opts: any) => fs.mkdirSync(dir, opts),
  existsSync: (p: any) => fs.existsSync(p),
  readFileSync: (p: any, opts: any) => fs.readFileSync(p, opts),
};

// ─── Phase 1: Gather Input ──────────────────────────────────────────────────

const gatherInput = async (): Promise<PauseInput> => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const ask = (question: string): Promise<string> =>
    new Promise(resolve => rl.question(question, answer => resolve(answer.trim())));

  const pickOne = async (prompt: string, options: string[]): Promise<string> => {
    console.log(`\n${prompt}`);
    options.forEach((opt, i) => console.log(`  ${i + 1}. ${opt}`));
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const answer = await ask("Enter number: ");
      const idx = parseInt(answer) - 1;
      if (idx >= 0 && idx < options.length) {
        return options[idx];
      }
      console.log(`Invalid selection "${answer}". Please enter a number between 1 and ${options.length}.`);
    }
  };

  const pickMultiple = async (prompt: string, options: { name: string; value: string }[]): Promise<string[]> => {
    console.log(`\n${prompt}`);
    options.forEach(opt => console.log(`  ${opt.value}. ${opt.name}`));
    const validValues = new Set(options.map(o => o.value));
    // eslint-disable-next-line no-constant-condition
    while (true) {
      console.log("Enter comma-separated values (e.g., 0,2,6) or 'all' for all:");
      const answer = await ask("> ");
      if (answer.toLowerCase() === "all") return options.map(o => o.value);
      const selected = answer
        .split(",")
        .map(n => n.trim())
        .filter(v => validValues.has(v));
      if (selected.length > 0) return selected;
      const invalid = answer
        .split(",")
        .map(n => n.trim())
        .filter(v => !validValues.has(v));
      console.log(`Invalid value(s): ${invalid.join(", ")}. Valid options are: ${[...validValues].join(", ")}.`);
    }
  };

  try {
    const networkName = network.name;
    const chainId = network.config.chainId!;

    console.log(`=== Safe Pause JSON Generator (${networkName}, chain ${chainId}) ===\n`);

    // 1. Comptroller address
    const defaultComptroller = getComptrollerAddress(networkName);
    let comptroller: string;
    if (defaultComptroller) {
      console.log(`Default Comptroller (Core Pool): ${defaultComptroller}`);
      const override = await ask("Press enter to use default, or paste a different address: ");
      comptroller = override || defaultComptroller;
    } else {
      console.log(`No default Comptroller found in networkAddresses for "${networkName}".`);
      comptroller = await ask("Enter Comptroller address manually: ");
    }
    if (!ethers.utils.isAddress(comptroller)) {
      throw new Error("Invalid address!");
    }

    const comptrollerAbi = getComptrollerAbi(networkName);

    // 2. Load markets
    console.log("\n--- Market Selection ---");
    const marketMode = await pickOne("How to load markets?", [
      "Fetch all markets from comptroller (saves to markets.json)",
      "Use addresses from markets.json (edit the file manually first)",
      "Enter addresses manually in CLI",
    ]);

    let marketAddresses: string[] = [];
    let symbols = new Map<string, string>();

    if (marketMode.startsWith("Fetch")) {
      console.log("\nQuerying comptroller for all markets...");
      const allMarkets = await fetchAllMarkets(comptroller, comptrollerAbi);
      const result = await filterListedAndFetchSymbols(comptroller, comptrollerAbi, allMarkets, false);
      marketAddresses = result.addresses;
      symbols = result.symbols;
      console.log(`Found ${marketAddresses.length} listed market(s):`);
      marketAddresses.forEach(addr => console.log(`  ${symbols.get(addr)} (${addr})`));
      saveMarketsToFile(marketAddresses);
    } else if (marketMode.startsWith("Use")) {
      const loaded = loadMarketsFromFile();
      if (loaded.length === 0) {
        throw new Error(`No addresses found in ${MARKETS_FILE}.`);
      }
      console.log(`\nLoaded ${loaded.length} address(es) from ${MARKETS_FILE}`);
      const result = await filterListedAndFetchSymbols(comptroller, comptrollerAbi, loaded, true);
      marketAddresses = result.addresses;
      symbols = result.symbols;
      marketAddresses.forEach(addr => console.log(`  ${symbols.get(addr)} (${addr})`));
    } else {
      console.log("\nEnter market addresses (comma-separated):");
      const manualInput = await ask("> ");
      const entered = manualInput
        .split(",")
        .map(a => a.trim())
        .filter(a => ethers.utils.isAddress(a));
      if (entered.length === 0) {
        throw new Error("No valid addresses provided.");
      }
      const result = await filterListedAndFetchSymbols(comptroller, comptrollerAbi, entered, true);
      marketAddresses = result.addresses;
      symbols = result.symbols;
      console.log(`\nUsing ${marketAddresses.length} address(es):`);
      marketAddresses.forEach(addr => console.log(`  ${symbols.get(addr)} (${addr})`));
    }

    if (marketAddresses.length === 0) {
      throw new Error("No listed markets found.");
    }

    // 3. Select operation
    console.log("\n--- Actions ---");
    const actionChoices = [
      { name: "Pause actions on markets", value: "pause" as const },
      { name: "Set collateral factor to 0", value: "cf_zero" as const },
      { name: "Both (pause + set CF to 0)", value: "both" as const },
    ];
    const actionMode = await pickOne(
      "What do you want to do?",
      actionChoices.map(a => a.name),
    );
    const selectedAction = actionChoices.find(a => a.name === actionMode)?.value || ("pause" as const);

    // 4. If pausing, which actions?
    let pauseActions: number[] = [];
    if (selectedAction === "pause" || selectedAction === "both") {
      const actionOptions = Object.entries(Actions).map(([name, value]) => ({ name, value: String(value) }));
      const selected = await pickMultiple("Select actions to pause:", actionOptions);
      pauseActions = selected.map(Number);

      if (pauseActions.length === 0) {
        console.log("No pause actions selected.");
        if (selectedAction === "pause") {
          throw new Error("No pause actions selected.");
        }
      }
    }

    // 5. If CF=0 on BSC, ask about e-mode upfront
    let includeEmode = false;
    if ((selectedAction === "cf_zero" || selectedAction === "both") && networkName === "bscmainnet") {
      const emodeAnswer = await ask("\nAlso set CF to 0 for e-mode pools? (y/n): ");
      includeEmode = emodeAnswer.toLowerCase() === "y" || emodeAnswer.toLowerCase() === "yes";
    }

    const blockNumber = await ethers.provider.getBlockNumber();

    return {
      comptroller,
      comptrollerAbi,
      network: networkName,
      chainId,
      marketAddresses,
      symbols,
      selectedAction,
      pauseActions,
      includeEmode,
      blockNumber,
    };
  } finally {
    rl.close();
  }
};

// ─── Phase 2: Generate Commands ─────────────────────────────────────────────

const generateCommands = async (
  input: PauseInput,
  operation: "pause" | "cf_zero",
  deps: GenerateCommandsDeps = defaultGenerateCommandsDeps,
): Promise<Command[]> => {
  const { comptroller, comptrollerAbi, marketAddresses, symbols, pauseActions, includeEmode } = input;
  const commands: Command[] = [];

  if (operation === "cf_zero") {
    console.log("\nQuerying market factors from comptroller...");
    for (const vToken of marketAddresses) {
      const symbol = symbols.get(vToken) || vToken;
      const { cf, lt } = await deps.fetchMarketFactors(comptroller, vToken, comptrollerAbi);
      if (cf === "0") {
        console.log(`  ${symbol} (${vToken}) → CF already 0, skipping`);
        continue;
      }
      console.log(`  ${symbol} (${vToken}) → CF: ${cf}, LT: ${lt}`);
      commands.push({
        target: comptroller,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [vToken, 0, lt],
      });
    }

    // E-mode CF=0 (BSC core pool only)
    if (includeEmode) {
      console.log("\nFetching e-mode pool range...");
      const { corePoolId, lastPoolId } = await deps.fetchEmodeRange(comptroller);
      console.log(`  E-mode pools: ${corePoolId} to ${lastPoolId} (${lastPoolId - corePoolId + 1} pool(s))`);

      for (const vToken of marketAddresses) {
        const symbol = symbols.get(vToken) || vToken;
        const pools = await deps.fetchEmodePoolsForMarket(comptroller, vToken, corePoolId, lastPoolId);
        if (pools.length === 0) {
          console.log(`  ${symbol} — not listed in any e-mode pool, skipping`);
          continue;
        }
        for (const pool of pools) {
          if (pool.collateralFactorMantissa === "0") {
            console.log(`  ${symbol} — pool ${pool.poolId}: CF already 0, skipping`);
            continue;
          }
          console.log(
            `  ${symbol} — pool ${pool.poolId}: CF=${pool.collateralFactorMantissa}, LT=${pool.liquidationThresholdMantissa}`,
          );
          commands.push({
            target: comptroller,
            signature: "setCollateralFactor(uint96,address,uint256,uint256)",
            params: [pool.poolId, vToken, 0, pool.liquidationThresholdMantissa],
          });
        }
      }
    }
  }

  if (operation === "pause") {
    for (const action of pauseActions) {
      const actionName = Object.entries(Actions).find(([, v]) => v === action)?.[0] || String(action);
      console.log(`\nAdding pause ${actionName} for ${marketAddresses.length} market(s)`);
      commands.push({
        target: comptroller,
        signature: PAUSE_SIGNATURE,
        params: [marketAddresses, [action], true],
      });
    }
  }

  return commands;
};

// ─── Phase 3: Export JSON ───────────────────────────────────────────────────

const exportJson = async (
  commands: Command[],
  input: PauseInput,
  safeAddress: string,
  suffix?: string,
  deps: ExportJsonDeps = defaultExportJsonDeps,
): Promise<ExportResult | null> => {
  if (commands.length === 0) {
    console.log(`No commands generated${suffix ? ` for ${suffix}` : ""}. Skipping.`);
    return null;
  }

  const label = suffix || "";
  const txBuilderFile = path.resolve(OUTPUT_DIR, `safePauseTxBuilder${label}.json`);
  const metadataFile = path.resolve(OUTPUT_DIR, `safePauseTxMetadata${label}.json`);

  const symbolsRecord: Record<string, string> = {};
  input.symbols.forEach((sym, addr) => {
    symbolsRecord[addr] = sym;
  });

  const metadata: PauseMetadata = {
    comptroller: input.comptroller,
    network: input.network,
    blockNumber: input.blockNumber,
    createdAt: new Date().toISOString(),
    symbols: symbolsRecord,
  };

  // Build Proposal and generate Safe TX Builder JSON
  const proposal: Proposal = await deps.makeProposal(commands);
  const multisigTxData = await deps.buildMultiSigTx(proposal);
  const batchJson = deps.batchTx(safeAddress, multisigTxData, { chainId: input.chainId });

  const outputJson = { ...batchJson, blockNumber: input.blockNumber };
  deps.writeFileSync(txBuilderFile, JSON.stringify(outputJson, null, 2));
  deps.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2));

  // Save a numbered record
  deps.mkdirSync(RECORDS_DIR, { recursive: true });
  const counterFile = path.resolve(RECORDS_DIR, "counter.json");
  let last = 0;
  if (deps.existsSync(counterFile)) {
    last = JSON.parse(deps.readFileSync(counterFile, "utf-8")).last || 0;
  }
  const next = last + 1;
  const recordFile = path.resolve(RECORDS_DIR, `${String(next).padStart(3, "0")}_${input.network}${label}.json`);
  const record = { metadata, safeTxBuilder: outputJson };
  deps.writeFileSync(recordFile, JSON.stringify(record, null, 2));
  deps.writeFileSync(counterFile, JSON.stringify({ last: next }, null, 2));

  return { label, txBuilderFile, metadataFile, recordFile, txCount: commands.length, safeAddress };
};

// ─── Phase 4: Orchestrate ───────────────────────────────────────────────────

const orchestrate = async (
  input: PauseInput,
  deps: OrchestrateDeps = { generateCommands, exportJson },
): Promise<ExportResult[]> => {
  const results: ExportResult[] = [];
  const guardianAddress = getGuardianAddress(input.network);

  if (input.network === "bscmainnet" && input.selectedAction === "both") {
    const criticalGuardianAddress = getCriticalGuardianAddress(input.network);

    const pauseCmds = await deps.generateCommands(input, "pause");
    const pauseResult = await deps.exportJson(pauseCmds, input, guardianAddress);
    if (pauseResult) results.push(pauseResult);

    const cfCmds = await deps.generateCommands(input, "cf_zero");
    const cfResult = await deps.exportJson(cfCmds, input, criticalGuardianAddress, "_cf");
    if (cfResult) results.push(cfResult);
  } else if (input.network === "bscmainnet" && input.selectedAction === "cf_zero") {
    const criticalGuardianAddress = getCriticalGuardianAddress(input.network);

    const cmds = await deps.generateCommands(input, "cf_zero");
    const result = await deps.exportJson(cmds, input, criticalGuardianAddress);
    if (result) results.push(result);
  } else {
    const cmds = await deps.generateCommands(input, input.selectedAction as "pause" | "cf_zero");
    const result = await deps.exportJson(cmds, input, guardianAddress);
    if (result) results.push(result);
  }

  return results;
};

// ─── Output ─────────────────────────────────────────────────────────────────

const printResults = (results: ExportResult[], networkName: string) => {
  console.log("\n=== Output ===");
  for (const r of results) {
    console.log(`\n  ${r.label || "(default)"}`);
    console.log(`    Safe TX Builder JSON: ${r.txBuilderFile}`);
    console.log(`    Metadata:             ${r.metadataFile}`);
    console.log(`    Record:               ${r.recordFile}`);
    console.log(`    Transactions:         ${r.txCount}`);
    console.log(`    Safe address:         ${r.safeAddress}`);
    const cfPrefix = r.label === "_cf" ? "TEST_CF=true " : "";
    console.log(
      `    Simulate:             ${cfPrefix}npx hardhat test scripts/simulateSafePauseTx.ts --fork ${networkName}`,
    );
  }
};

// ─── Main ───────────────────────────────────────────────────────────────────

const main = async () => {
  const input = await gatherInput();

  console.log("\n--- Processing ---");

  const results = await orchestrate(input);

  if (results.length > 0) {
    printResults(results, input.network);
  }
};

// ─── Auto-execution guard ───────────────────────────────────────────────────

if (require.main === module) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

// ─── Exports ────────────────────────────────────────────────────────────────

export { generateCommands, exportJson, orchestrate, Actions, PAUSE_SIGNATURE };

export type {
  PauseInput,
  ExportResult,
  PauseMetadata,
  EmodePoolInfo,
  GenerateCommandsDeps,
  ExportJsonDeps,
  OrchestrateDeps,
};
