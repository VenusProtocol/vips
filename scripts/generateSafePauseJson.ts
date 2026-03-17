import { TxBuilder } from "@morpho-labs/gnosis-tx-builder";
import * as fs from "fs";
import { ethers, network } from "hardhat";
import * as path from "path";
import * as readline from "readline";
import { buildMultiSigTx, getSafeAddress } from "src/multisig/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { Command, Proposal, SUPPORTED_NETWORKS } from "src/types";
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
const TX_BUILDER_FILE = path.resolve(OUTPUT_DIR, "safePauseTxBuilder.json");
const METADATA_FILE = path.resolve(OUTPUT_DIR, "safePauseTxMetadata.json");
const RECORDS_DIR = path.resolve(OUTPUT_DIR, "safePauseTXRecords");

interface PauseMetadata {
  comptroller: string;
  network: string;
  blockNumber: number;
  createdAt: string;
  symbols: Record<string, string>;
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
  const answer = await ask("Enter number: ");
  const idx = parseInt(answer) - 1;
  if (idx < 0 || idx >= options.length) {
    console.log("Invalid selection, defaulting to first option.");
    return options[0];
  }
  return options[idx];
};

const pickMultiple = async (prompt: string, options: { name: string; value: string }[]): Promise<string[]> => {
  console.log(`\n${prompt}`);
  options.forEach(opt => console.log(`  ${opt.value}. ${opt.name}`));
  console.log("Enter comma-separated values (e.g., 0,2,6) or 'all' for all:");
  const answer = await ask("> ");
  if (answer.toLowerCase() === "all") return options.map(o => o.value);
  const validValues = new Set(options.map(o => o.value));
  return answer
    .split(",")
    .map(n => n.trim())
    .filter(v => validValues.has(v));
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
 * Fetches all listed markets from the comptroller along with their symbols in a single pass.
 */
const fetchAllMarketsWithMetadata = async (
  comptroller: string,
  abi: string[],
): Promise<{ addresses: string[]; symbols: Map<string, string> }> => {
  const contract = new ethers.Contract(comptroller, abi, ethers.provider);
  const allMarkets: string[] = await contract.getAllMarkets();
  console.log(`Found ${allMarkets.length} market(s), loading market data...`);
  const addresses: string[] = [];
  const symbols = new Map<string, string>();
  for (let i = 0; i < allMarkets.length; i++) {
    const market = allMarkets[i];
    const { isListed } = await contract.markets(market);
    if (isListed) {
      addresses.push(market);
      const symbol = await fetchSymbol(market);
      symbols.set(market, symbol);
    }
    const pct = Math.round(((i + 1) / allMarkets.length) * 100);
    process.stdout.write(`\r  Progress: ${i + 1}/${allMarkets.length} (${pct}%) — ${addresses.length} listed`);
  }
  process.stdout.write("\n");
  return { addresses, symbols };
};

/**
 * Fetches symbols for a pre-known list of market addresses.
 */
const fetchMarketMetadata = async (marketAddresses: string[]): Promise<Map<string, string>> => {
  const symbols = new Map<string, string>();
  console.log(`Loading market data for ${marketAddresses.length} market(s)...`);
  for (let i = 0; i < marketAddresses.length; i++) {
    const symbol = await fetchSymbol(marketAddresses[i]);
    symbols.set(marketAddresses[i], symbol);
    const pct = Math.round(((i + 1) / marketAddresses.length) * 100);
    process.stdout.write(`\r  Progress: ${i + 1}/${marketAddresses.length} (${pct}%)`);
  }
  process.stdout.write("\n");
  return symbols;
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

interface EmodePoolInfo {
  poolId: number;
  collateralFactorMantissa: string;
  liquidationThresholdMantissa: string;
}

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

// ─── Main ───────────────────────────────────────────────────────────────────

const main = async () => {
  const networkName = network.name;
  const chainId = network.config.chainId;

  console.log(`=== Safe Pause JSON Generator (${networkName}, chain ${chainId}) ===\n`);

  const safeAddress = getSafeAddress(networkName as SUPPORTED_NETWORKS);

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
    return;
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
    const result = await fetchAllMarketsWithMetadata(comptroller, comptrollerAbi);
    marketAddresses = result.addresses;
    symbols = result.symbols;
    console.log(`Found ${marketAddresses.length} listed market(s):`);
    marketAddresses.forEach(addr => console.log(`  ${symbols.get(addr)} (${addr})`));
    saveMarketsToFile(marketAddresses);
  } else if (marketMode.startsWith("Use")) {
    marketAddresses = loadMarketsFromFile();
    if (marketAddresses.length === 0) {
      console.error(`\nNo addresses found in ${MARKETS_FILE}.`);
      console.log("Add vToken addresses to the file and run again.");
      rl.close();
      return;
    }
    console.log(`\nLoaded ${marketAddresses.length} address(es) from ${MARKETS_FILE}`);
    symbols = await fetchMarketMetadata(marketAddresses);
    marketAddresses.forEach(addr => console.log(`  ${symbols.get(addr)} (${addr})`));
  } else {
    console.log("\nEnter market addresses (comma-separated):");
    const input = await ask("> ");
    marketAddresses = input
      .split(",")
      .map(a => a.trim())
      .filter(a => ethers.utils.isAddress(a));
    if (marketAddresses.length === 0) {
      console.error("No valid addresses provided.");
      rl.close();
      return;
    }
    symbols = await fetchMarketMetadata(marketAddresses);
    console.log(`\nUsing ${marketAddresses.length} address(es):`);
    marketAddresses.forEach(addr => console.log(`  ${symbols.get(addr)} (${addr})`));
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
  const selectedAction = actionChoices.find(a => a.name === actionMode)?.value || "pause";

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
        return;
      }
    }
  }

  // 5. Build Command[] array
  const commands: Command[] = [];
  const symbolsRecord: Record<string, string> = {};
  symbols.forEach((sym, addr) => {
    symbolsRecord[addr] = sym;
  });
  const blockNumber = await ethers.provider.getBlockNumber();
  const metadata: PauseMetadata = {
    comptroller,
    network: networkName,
    blockNumber,
    createdAt: new Date().toISOString(),
    symbols: symbolsRecord,
  };

  // CF=0 commands
  if (selectedAction === "cf_zero" || selectedAction === "both") {
    console.log("\nQuerying market factors from comptroller...");
    for (const vToken of marketAddresses) {
      const symbol = symbols.get(vToken) || vToken;
      const { cf, lt } = await fetchMarketFactors(comptroller, vToken, comptrollerAbi);
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
    if (networkName === "bscmainnet") {
      const emodeAnswer = await ask("\nAlso set CF to 0 for e-mode pools? (y/n): ");
      if (emodeAnswer.toLowerCase() === "y" || emodeAnswer.toLowerCase() === "yes") {
        console.log("\nFetching e-mode pool range...");
        const { corePoolId, lastPoolId } = await fetchEmodeRange(comptroller);
        console.log(`  E-mode pools: ${corePoolId} to ${lastPoolId} (${lastPoolId - corePoolId + 1} pool(s))`);

        for (const vToken of marketAddresses) {
          const symbol = symbols.get(vToken) || vToken;
          const pools = await fetchEmodePoolsForMarket(comptroller, vToken, corePoolId, lastPoolId);
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
  }

  // Pause commands
  if ((selectedAction === "pause" || selectedAction === "both") && pauseActions.length > 0) {
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

  if (commands.length === 0) {
    console.log("No commands generated.");
    rl.close();
    return;
  }

  // 6. Build Proposal and generate Safe TX Builder JSON
  const proposal: Proposal = await makeProposal(commands);
  const multisigTxData = await buildMultiSigTx(proposal);
  const batchJson = TxBuilder.batch(safeAddress, multisigTxData, { chainId });

  // 7. Write safePauseTxBuilder.json (include blockNumber for simulation)
  const outputJson = { ...batchJson, blockNumber };
  fs.writeFileSync(TX_BUILDER_FILE, JSON.stringify(outputJson, null, 2));

  // 8. Write metadata for simulation verification
  fs.writeFileSync(METADATA_FILE, JSON.stringify(metadata, null, 2));

  // 9. Save a numbered record
  fs.mkdirSync(RECORDS_DIR, { recursive: true });
  const counterFile = path.resolve(RECORDS_DIR, "counter.json");
  let last = 0;
  if (fs.existsSync(counterFile)) {
    last = JSON.parse(fs.readFileSync(counterFile, "utf-8")).last || 0;
  }
  const next = last + 1;
  const recordFile = path.resolve(RECORDS_DIR, `${String(next).padStart(3, "0")}_${networkName}.json`);
  fs.writeFileSync(recordFile, JSON.stringify(metadata, null, 2));
  fs.writeFileSync(counterFile, JSON.stringify({ last: next }, null, 2));

  console.log(`\n--- Output ---`);
  console.log(`  Safe TX Builder JSON: ${TX_BUILDER_FILE}`);
  console.log(`  Pause metadata: ${METADATA_FILE}`);
  console.log(`  Record: ${recordFile}`);
  console.log(`  Transactions: ${commands.length} for ${networkName} (chain ${chainId})`);
  console.log(`\nTo simulate: npx hardhat test scripts/simulateSafePauseTx.ts --fork ${networkName}`);

  rl.close();
};

main().catch(err => {
  console.error(err);
  process.exit(1);
});
