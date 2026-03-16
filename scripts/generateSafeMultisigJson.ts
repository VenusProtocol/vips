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

// BSC core pool markets() returns extra fields (isVenus, liquidationIncentive, etc.)
const BSC_COMPTROLLER_ABI = [
  "function getAllMarkets() view returns (address[])",
  "function markets(address) view returns (bool isListed, uint256 collateralFactorMantissa, bool isVenus, uint256 liquidationThresholdMantissa, uint256 liquidationIncentiveMantissa, uint96 marketPoolId, bool isBorrowAllowed)",
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

const fetchAllMarkets = async (comptroller: string, abi: string[]): Promise<string[]> => {
  const contract = new ethers.Contract(comptroller, abi, ethers.provider);
  const allMarkets: string[] = await contract.getAllMarkets();
  console.log(`Found ${allMarkets.length} market(s), checking isListed...`);
  const listed: string[] = [];
  for (let i = 0; i < allMarkets.length; i++) {
    const market = allMarkets[i];
    const { isListed } = await contract.markets(market);
    if (isListed) listed.push(market);
    // Overwrite the same line to show a loading indicator
    const pct = Math.round(((i + 1) / allMarkets.length) * 100);
    process.stdout.write(`\r  Progress: ${i + 1}/${allMarkets.length} (${pct}%) — ${listed.length} listed`);
  }
  process.stdout.write("\n");
  return listed;
};

const fetchLiquidationThreshold = async (comptroller: string, vToken: string, abi: string[]): Promise<string> => {
  const contract = new ethers.Contract(comptroller, abi, ethers.provider);
  const marketData = await contract.markets(vToken);
  return marketData.liquidationThresholdMantissa.toString();
};

const VTOKEN_ABI = ["function symbol() view returns (string)"];

const fetchSymbols = async (marketAddresses: string[]): Promise<Map<string, string>> => {
  const symbols = new Map<string, string>();
  console.log(`Fetching symbols for ${marketAddresses.length} market(s)...`);
  for (let i = 0; i < marketAddresses.length; i++) {
    const addr = marketAddresses[i];
    try {
      const contract = new ethers.Contract(addr, VTOKEN_ABI, ethers.provider);
      const symbol: string = await contract.symbol();
      symbols.set(addr, symbol);
    } catch {
      // Fallback to address-based name if symbol() fails
      symbols.set(addr, `MARKET_${addr.slice(2, 8).toUpperCase()}`);
    }
    // Overwrite the same line to show a loading indicator
    const pct = Math.round(((i + 1) / marketAddresses.length) * 100);
    process.stdout.write(`\r  Progress: ${i + 1}/${marketAddresses.length} (${pct}%)`);
  }
  process.stdout.write("\n");
  return symbols;
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

  console.log(`=== Safe Multisig JSON Generator (${networkName}, chain ${chainId}) ===\n`);

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

  if (marketMode.startsWith("Fetch")) {
    console.log("\nQuerying comptroller for all markets...");
    marketAddresses = await fetchAllMarkets(comptroller, comptrollerAbi);
    console.log(`Found ${marketAddresses.length} market(s)`);
    marketAddresses.forEach(addr => console.log(`  ${addr}`));
    saveMarketsToFile(marketAddresses);
  } else if (marketMode.startsWith("Use")) {
    marketAddresses = loadMarketsFromFile();
    if (marketAddresses.length === 0) {
      console.error(`\nNo addresses found in ${MARKETS_FILE}.`);
      console.log("Add vToken addresses to the file and run again.");
      rl.close();
      return;
    }
    console.log(`\nLoaded ${marketAddresses.length} address(es) from ${MARKETS_FILE}:`);
    marketAddresses.forEach(addr => console.log(`  ${addr}`));
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
    console.log(`\nUsing ${marketAddresses.length} address(es):`);
    marketAddresses.forEach(addr => console.log(`  ${addr}`));
  }

  // Fetch vToken symbols for display
  const symbols = await fetchSymbols(marketAddresses);

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

  // CF=0 commands
  if (selectedAction === "cf_zero" || selectedAction === "both") {
    console.log("\nQuerying liquidation thresholds from comptroller...");
    for (const vToken of marketAddresses) {
      const symbol = symbols.get(vToken) || vToken;
      const lt = await fetchLiquidationThreshold(comptroller, vToken, comptrollerAbi);
      console.log(`  ${symbol} (${vToken}) → LT: ${lt}`);
      commands.push({
        target: comptroller,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [vToken, 0, lt],
      });
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

  // 7. Write gnosisTXBuilder.json (include blockNumber for simulation)
  const blockNumber = await ethers.provider.getBlockNumber();
  const outputJson = { ...batchJson, blockNumber };
  const outputPath = path.resolve(__dirname, "..", "gnosisTXBuilder.json");
  fs.writeFileSync(outputPath, JSON.stringify(outputJson, null, 2));

  console.log(`\n--- Output ---`);
  console.log(`  Safe TX Builder JSON: ${outputPath}`);
  console.log(`  Transactions: ${commands.length} for ${networkName} (chain ${chainId})`);
  console.log(`\nTo simulate: npx hardhat test scripts/simulateSafeJson.ts --fork ${networkName}`);

  rl.close();
};

main().catch(err => {
  console.error(err);
  process.exit(1);
});
