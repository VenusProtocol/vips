import { TxBuilder } from "@morpho-labs/gnosis-tx-builder";
import * as fs from "fs";
import { ethers, network } from "hardhat";
import * as path from "path";
import * as readline from "readline";
import { buildMultiSigTx } from "src/multisig/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { Command, Proposal } from "src/types";
import { makeProposal } from "src/utils";

// ─── Retry helper ────────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function retry<T = any>(fn: () => Promise<T>, retries = 3, delayMs = 1000): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        console.log(`  RPC call failed (attempt ${attempt}/${retries}), retrying in ${delayMs / 1000}s...`);
        await sleep(delayMs);
      }
    }
  }
  throw lastError;
}

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

export const PAUSE_SIGNATURE = "setActionsPaused(address[],uint8[],bool)";

const MARKETS_FILE = path.resolve(__dirname, "data", "markets.json");
const OUTPUT_DIR = path.resolve(__dirname, "data");

interface PauseMetadata {
  comptroller: string;
  network: string;
  blockNumber: number;
  createdAt: string;
  symbols: Record<string, string>;
}

export interface PauseInput {
  comptroller: string;
  comptrollerAbi: string[];
  network: string;
  chainId: number;
  marketAddresses: string[];
  symbols: Map<string, string>;
  selectedAction: string;
  pauseActions: number[];
  includeEmode: boolean;
  blockNumber: number;
}

export interface GenerateCommandsDeps {
  fetchMarketFactors: (comptroller: string, vToken: string, abi: string[]) => Promise<{ cf: string; lt: string }>;
  fetchEmodeRange: (comptroller: string) => Promise<{ corePoolId: number; lastPoolId: number }>;
  fetchEmodePoolsForMarket: (
    comptroller: string,
    vToken: string,
    corePoolId: number,
    lastPoolId: number,
  ) => Promise<EmodePoolInfo[]>;
}

export interface EmodePoolInfo {
  poolId: number;
  collateralFactorMantissa: string;
  liquidationThresholdMantissa: string;
}

export interface ExportResult {
  label: string;
  txBuilderFile: string;
  metadataFile: string;
  txCount: number;
  safeAddress: string;
}

export interface ExportJsonDeps {
  makeProposal: (...args: any[]) => Promise<any>;
  buildMultiSigTx: (...args: any[]) => Promise<any[]>;
  batchTx: (safeAddress: string, txData: any[], options: any) => any;
  writeFileSync: (...args: any[]) => void;
  mkdirSync: (...args: any[]) => void;
}

export interface OrchestrateDeps {
  generateCommands: (input: PauseInput, operation: "pause" | "cf_zero") => Promise<Command[]>;
  exportJson: (
    commands: Command[],
    input: PauseInput,
    safeAddress: string,
    suffix?: string,
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

// ─── Helpers ────────────────────────────────────────────────────────────────

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
    const tokens = answer
      .split(",")
      .map(n => n.trim())
      .filter(v => v.length > 0);
    if (tokens.length === 0) {
      console.log("No values entered. Please try again.");
      continue;
    }
    const invalid = tokens.filter(v => !validValues.has(v));
    if (invalid.length > 0) {
      console.log(`Invalid value(s): ${invalid.join(", ")}. Valid options are: ${[...validValues].join(", ")}.`);
      continue;
    }
    return [...new Set(tokens)];
  }
};

// ─── On-chain queries ───────────────────────────────────────────────────────

const VTOKEN_ABI = ["function symbol() view returns (string)"];

const fetchSymbol = async (vToken: string): Promise<string> => {
  try {
    const contract = new ethers.Contract(vToken, VTOKEN_ABI, ethers.provider);
    return await retry(() => contract.symbol());
  } catch {
    return `MARKET_${vToken.slice(2, 8).toUpperCase()}`;
  }
};

/**
 * Fetches all market addresses from the comptroller via getAllMarkets().
 */
const fetchAllMarkets = async (comptroller: string, abi: string[]): Promise<string[]> => {
  const contract = new ethers.Contract(comptroller, abi, ethers.provider);
  const allMarkets: string[] = await retry(() => contract.getAllMarkets());
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
  console.log(`Checking ${markets.length} market(s)...`);
  const results = await Promise.all(
    markets.map(async market => {
      const { isListed } = await retry(() => contract.markets(market));
      if (isListed) {
        const symbol = await fetchSymbol(market);
        return { market, isListed: true, symbol };
      }
      return { market, isListed: false, symbol: "" };
    }),
  );
  const addresses: string[] = [];
  const symbols = new Map<string, string>();
  for (const { market, isListed, symbol } of results) {
    if (isListed) {
      addresses.push(market);
      symbols.set(market, symbol);
    } else if (logUnlisted) {
      console.log(`  Skipping unlisted market: ${market}`);
    }
  }
  console.log(`  Found ${addresses.length} listed market(s)`);
  return { addresses, symbols };
};

const fetchMarketFactors = async (
  comptroller: string,
  vToken: string,
  abi: string[],
): Promise<{ cf: string; lt: string }> => {
  const contract = new ethers.Contract(comptroller, abi, ethers.provider);
  const marketData = await retry(() => contract.markets(vToken));
  return {
    cf: marketData.collateralFactorMantissa.toString(),
    lt: marketData.liquidationThresholdMantissa.toString(),
  };
};

// ─── E-mode helpers (BSC core pool) ─────────────────────────────────────────

const fetchEmodeRange = async (comptroller: string): Promise<{ corePoolId: number; lastPoolId: number }> => {
  const contract = new ethers.Contract(comptroller, BSC_COMPTROLLER_ABI, ethers.provider);
  const coreId = (await retry(() => contract.corePoolId())).toNumber();
  const lastId = (await retry(() => contract.lastPoolId())).toNumber();
  return { corePoolId: coreId, lastPoolId: lastId };
};

const fetchEmodePoolsForMarket = async (
  comptroller: string,
  vToken: string,
  corePoolId: number,
  lastPoolId: number,
): Promise<EmodePoolInfo[]> => {
  const contract = new ethers.Contract(comptroller, BSC_COMPTROLLER_ABI, ethers.provider);
  const poolIds = Array.from({ length: lastPoolId - corePoolId + 1 }, (_, i) => corePoolId + i);
  const results = await Promise.all(
    poolIds.map(async poolId => {
      const data = await retry(() => contract.poolMarkets(poolId, vToken));
      if (data.isListed) {
        return {
          poolId,
          collateralFactorMantissa: data.collateralFactorMantissa.toString(),
          liquidationThresholdMantissa: data.liquidationThresholdMantissa.toString(),
        };
      }
      return null;
    }),
  );
  return results.filter((p): p is EmodePoolInfo => p !== null);
};

// ─── Markets file ───────────────────────────────────────────────────────────

const loadMarketsFromFile = (): string[] => {
  if (!fs.existsSync(MARKETS_FILE)) return [];
  let content: unknown;
  try {
    content = JSON.parse(fs.readFileSync(MARKETS_FILE, "utf-8"));
  } catch (error) {
    console.error(`Failed to parse ${MARKETS_FILE}: ${(error as Error).message}`);
    return [];
  }
  if (!Array.isArray(content)) return [];
  return content.filter((addr: string) => ethers.utils.isAddress(addr));
};

const saveMarketsToFile = (addresses: string[]) => {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
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
  const guardian = config.GUARDIAN;
  if (!guardian) {
    throw new Error(`No GUARDIAN address found for network "${networkName}".`);
  }
  return guardian;
};

const getCriticalGuardianAddress = (networkName: string): string => {
  const config = (NETWORK_ADDRESSES as Record<string, Record<string, string>>)[networkName] || {};
  const guardian = config.CRITICAL_GUARDIAN;
  if (!guardian) {
    throw new Error(`No CRITICAL_GUARDIAN address found for network "${networkName}".`);
  }
  return guardian;
};

// ─── Phase 1: Gather Input ──────────────────────────────────────────────────

export const gatherInput = async (): Promise<PauseInput> => {
  const networkName = network.name;
  const chainId = network.config.chainId;
  if (!chainId) {
    console.error(`No chainId configured for network "${networkName}".`);
    rl.close();
    process.exit(1);
  }

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
    console.error("Invalid address!");
    rl.close();
    process.exit(1);
  }

  const comptrollerAbi = getComptrollerAbi(networkName);

  // 2. Load markets
  console.log("\n--- Market Selection ---");
  const marketMode = await pickOne("How to load markets?", [
    "Fetch all markets from comptroller (saves to scripts/data/markets.json)",
    "Use addresses from scripts/data/markets.json (edit the file manually first)",
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
      console.error(`\nNo addresses found in ${MARKETS_FILE}.`);
      console.log("Add vToken addresses to the file and run again.");
      rl.close();
      process.exit(1);
    }
    console.log(`\nLoaded ${loaded.length} address(es) from ${MARKETS_FILE}`);
    const result = await filterListedAndFetchSymbols(comptroller, comptrollerAbi, loaded, true);
    marketAddresses = result.addresses;
    symbols = result.symbols;
    marketAddresses.forEach(addr => console.log(`  ${symbols.get(addr)} (${addr})`));
  } else {
    console.log("\nEnter market addresses (comma-separated):");
    const input = await ask("> ");
    const entered = input
      .split(",")
      .map(a => a.trim())
      .filter(a => ethers.utils.isAddress(a));
    if (entered.length === 0) {
      console.error("No valid addresses provided.");
      rl.close();
      process.exit(1);
    }
    const result = await filterListedAndFetchSymbols(comptroller, comptrollerAbi, entered, true);
    marketAddresses = result.addresses;
    symbols = result.symbols;
    console.log(`\nUsing ${marketAddresses.length} address(es):`);
    marketAddresses.forEach(addr => console.log(`  ${symbols.get(addr)} (${addr})`));
  }

  if (marketAddresses.length === 0) {
    console.error("\nNo listed markets found. Exiting.");
    rl.close();
    process.exit(1);
  }

  // 3. Select operation
  console.log("\n--- Actions ---");
  const actionChoices = [
    { name: "Pause actions on markets", value: "pause" },
    { name: "Set collateral factor to 0", value: "cf_zero" },
    { name: "Both (pause + set CF to 0)", value: "both" },
  ];
  const actionMode = await pickOne(
    "What do you want to do?",
    actionChoices.map(a => a.name),
  );
  const selectedAction = actionChoices.find(a => a.name === actionMode)?.value;
  if (!selectedAction) {
    console.error("Invalid action selection.");
    rl.close();
    process.exit(1);
  }

  // 4. If pausing, which actions?
  let pauseActions: number[] = [];
  if (selectedAction === "pause" || selectedAction === "both") {
    const actionOptions = Object.entries(Actions).map(([name, value]) => ({ name, value: String(value) }));
    const selected = await pickMultiple("Select actions to pause:", actionOptions);
    pauseActions = selected.map(Number);

    if (pauseActions.length === 0) {
      console.log("No pause actions selected.");
      if (selectedAction === "pause") {
        rl.close();
        process.exit(1);
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
};

// ─── Phase 2: Generate Commands ─────────────────────────────────────────────

export const generateCommands = async (
  input: PauseInput,
  operation: "pause" | "cf_zero",
  deps: GenerateCommandsDeps = {
    fetchMarketFactors,
    fetchEmodeRange,
    fetchEmodePoolsForMarket,
  },
): Promise<Command[]> => {
  const { comptroller, comptrollerAbi, marketAddresses, symbols, pauseActions, includeEmode } = input;
  const commands: Command[] = [];

  if (operation === "cf_zero") {
    console.log("\nQuerying market factors from comptroller...");
    const factorResults = await Promise.all(
      marketAddresses.map(async vToken => {
        const symbol = symbols.get(vToken) || vToken;
        const { cf, lt } = await deps.fetchMarketFactors(comptroller, vToken, comptrollerAbi);
        return { vToken, symbol, cf, lt };
      }),
    );
    for (const { vToken, symbol, cf, lt } of factorResults) {
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

      const emodeResults = await Promise.all(
        marketAddresses.map(async vToken => {
          const symbol = symbols.get(vToken) || vToken;
          const pools = await deps.fetchEmodePoolsForMarket(comptroller, vToken, corePoolId, lastPoolId);
          return { vToken, symbol, pools };
        }),
      );
      for (const { vToken, symbol, pools } of emodeResults) {
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

export const exportJson = async (
  commands: Command[],
  input: PauseInput,
  safeAddress: string,
  suffix: string | undefined,
  deps: ExportJsonDeps = {
    makeProposal,
    buildMultiSigTx,
    batchTx: TxBuilder.batch,
    writeFileSync: fs.writeFileSync,
    mkdirSync: fs.mkdirSync,
  },
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
  deps.mkdirSync(OUTPUT_DIR, { recursive: true });
  deps.writeFileSync(txBuilderFile, JSON.stringify(outputJson, null, 2));
  deps.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2));

  return { label, txBuilderFile, metadataFile, txCount: commands.length, safeAddress };
};

// ─── Phase 4: Orchestration (pure, testable) ──────────────────────────────────

export const orchestrate = async (input: PauseInput, deps: OrchestrateDeps): Promise<ExportResult[]> => {
  const results: ExportResult[] = [];
  const guardianAddress = getGuardianAddress(input.network);

  if (input.network === "bscmainnet") {
    if (input.selectedAction === "pause" || input.selectedAction === "both") {
      const pauseCmds = await deps.generateCommands(input, "pause");
      const pauseResult = await deps.exportJson(pauseCmds, input, guardianAddress);
      if (pauseResult) results.push(pauseResult);
    }
    if (input.selectedAction === "cf_zero" || input.selectedAction === "both") {
      const cfGuardianAddress = getCriticalGuardianAddress(input.network);
      const cfCmds = await deps.generateCommands(input, "cf_zero");
      const cfResult = await deps.exportJson(cfCmds, input, cfGuardianAddress, "_cf");
      if (cfResult) results.push(cfResult);
    }
  } else {
    const cmds = [
      ...(input.selectedAction === "pause" || input.selectedAction === "both"
        ? await deps.generateCommands(input, "pause")
        : []),
      ...(input.selectedAction === "cf_zero" || input.selectedAction === "both"
        ? await deps.generateCommands(input, "cf_zero")
        : []),
    ];
    const result = await deps.exportJson(cmds, input, guardianAddress);
    if (result) results.push(result);
  }

  return results;
};

// ─── Main ───────────────────────────────────────────────────────────────────

const printResults = (results: ExportResult[], networkName: string) => {
  console.log("\n=== Output ===");
  for (const r of results) {
    console.log(`\n  ${r.label || "(default)"}`);
    console.log(`    Safe TX Builder JSON: ${r.txBuilderFile}`);
    console.log(`    Metadata:             ${r.metadataFile}`);
    console.log(`    Transactions:         ${r.txCount}`);
    console.log(`    Safe address:         ${r.safeAddress}`);
    const cfPrefix = r.label === "_cf" ? "TEST_CF=true " : "";
    console.log(
      `    Simulate:             ${cfPrefix}npx hardhat test scripts/simulateSafePauseTx.ts --fork ${networkName}`,
    );
  }
};

export const main = async () => {
  const input = await gatherInput();

  console.log("\n--- Processing ---");

  const results = await orchestrate(input, {
    generateCommands,
    exportJson,
  });

  if (results.length > 0) {
    printResults(results, input.network);
  }

  rl.close();
};

if (require.main === module) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
