/**
 * Generates vips/vip-662/data/coreMarketOracles.json.
 *
 * The file has two arrays:
 *   - coreMarketOracles: every market returned by the Core Pool Comptroller's getAllMarkets(), with
 *     its current ResilientOracle main, pivot and fallback oracles, enable flags and caching flag.
 *     Known oracles are shown by name (see oracleAddresses), any other oracle by address, and an
 *     empty slot as null. This is the on-chain state the VIP starts from.
 *   - atlasPivotMarkets: the markets where Atlas is the fallback oracle. vips/vip-662/bscmainnet.ts
 *     moves Atlas to the pivot slot for exactly these markets.
 *
 * Each atlasPivotMarkets entry must match what the VIP assumes, otherwise the script fails and
 * writes nothing:
 *   - config is [Chainlink, RedStone, Atlas], all oracles enabled, caching disabled
 *   - the Chainlink price validates against the Atlas price with the asset's BoundValidator bounds,
 *     which is the check ResilientOracle runs once Atlas becomes the pivot
 *
 * Run:
 *   npx hardhat run vips/vip-662/scripts/fetchCoreMarketOracles.ts --network bscmainnet
 */
import fs from "fs";
import { ethers } from "hardhat";
import path from "path";
import { NETWORK_ADDRESSES } from "src/networkAddresses";

const { bscmainnet } = NETWORK_ADDRESSES;

const VBNB = "0xA07c5b74C9B40447a954e1466938b865b6BBea36";
const NATIVE_BNB = "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB";
const OUTPUT = path.resolve(__dirname, "../data/coreMarketOracles.json");

const COMPTROLLER_ABI = ["function getAllMarkets() view returns (address[])"];
const VTOKEN_ABI = ["function symbol() view returns (string)", "function underlying() view returns (address)"];
const RESILIENT_ORACLE_ABI = [
  "function getTokenConfig(address) view returns (tuple(address asset,address[3] oracles,bool[3] enableFlagsForOracles,bool cachingEnabled))",
  "function boundValidator() view returns (address)",
];
const ORACLE_ABI = ["function getPrice(address) view returns (uint256)"];
const BOUND_VALIDATOR_ABI = [
  "function validatePriceWithAnchorPrice(address asset,uint256 reportedPrice,uint256 anchorPrice) view returns (bool)",
];

const oracleAddresses: Record<string, string> = {
  ChainlinkOracle: bscmainnet.CHAINLINK_ORACLE,
  RedStoneOracle: bscmainnet.REDSTONE_ORACLE,
  BinanceOracle: bscmainnet.BINANCE_ORACLE,
  AtlasOracle: bscmainnet.ATLAS_ORACLE,
};

async function main() {
  const { getAddress } = ethers.utils;
  const provider = ethers.provider;
  const comptroller = new ethers.Contract(bscmainnet.UNITROLLER, COMPTROLLER_ABI, provider);
  const resilientOracle = new ethers.Contract(bscmainnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
  const boundValidator = new ethers.Contract(await resilientOracle.boundValidator(), BOUND_VALIDATOR_ABI, provider);
  const chainlinkOracle = new ethers.Contract(bscmainnet.CHAINLINK_ORACLE, ORACLE_ABI, provider);
  const atlasOracle = new ethers.Contract(bscmainnet.ATLAS_ORACLE, ORACLE_ABI, provider);

  const atlas = getAddress(bscmainnet.ATLAS_ORACLE);
  const expectedOracles = [bscmainnet.CHAINLINK_ORACLE, bscmainnet.REDSTONE_ORACLE, bscmainnet.ATLAS_ORACLE].map(
    getAddress,
  );
  const nameOf = (oracle: string): string | null => {
    if (oracle === ethers.constants.AddressZero) return null;
    const name = Object.keys(oracleAddresses).find(key => getAddress(oracleAddresses[key]) === oracle);
    return name ?? oracle;
  };

  const block = await provider.getBlockNumber();
  const markets: string[] = await comptroller.getAllMarkets();
  const coreMarketOracles = [];
  const atlasPivotMarkets = [];
  const failures: string[] = [];

  for (const market of markets) {
    const vToken = getAddress(market);
    const vTokenContract = new ethers.Contract(vToken, VTOKEN_ABI, provider);
    const symbol: string = await vTokenContract.symbol();
    const asset = vToken === VBNB ? NATIVE_BNB : getAddress(await vTokenContract.underlying());

    const config = await resilientOracle.getTokenConfig(asset);
    const oracles: string[] = config.oracles.map(getAddress);
    const [main, pivot, fallback] = oracles.map(nameOf);
    coreMarketOracles.push({
      symbol,
      vToken,
      asset,
      main,
      pivot,
      fallback,
      enableFlags: [...config.enableFlagsForOracles],
      cachingEnabled: config.cachingEnabled,
    });

    if (oracles[2] !== atlas) continue;
    atlasPivotMarkets.push({ symbol, vToken, asset });

    const configMatches =
      oracles.every((oracle, i) => oracle === expectedOracles[i]) &&
      config.enableFlagsForOracles.every((flag: boolean) => flag) &&
      !config.cachingEnabled;
    if (!configMatches) {
      failures.push(
        `${symbol}: unexpected config [${main}, ${pivot}, ${fallback}] flags=${config.enableFlagsForOracles} caching=${config.cachingEnabled}`,
      );
    }

    const [chainlinkPrice, atlasPrice] = await Promise.all([
      chainlinkOracle.getPrice(asset),
      atlasOracle.getPrice(asset),
    ]);
    if (!(await boundValidator.validatePriceWithAnchorPrice(asset, chainlinkPrice, atlasPrice))) {
      failures.push(`${symbol}: Chainlink price ${chainlinkPrice} is outside the bounds of Atlas price ${atlasPrice}`);
    }
  }

  console.log(`Block ${block}: ${markets.length} Core Pool markets, Atlas is fallback for ${atlasPivotMarkets.length}`);

  if (failures.length > 0) {
    throw new Error(`Nothing written:\n${failures.join("\n")}`);
  }

  const out = {
    block,
    comptroller: bscmainnet.UNITROLLER,
    resilientOracle: bscmainnet.RESILIENT_ORACLE,
    oracleAddresses,
    coreMarketOracles,
    atlasPivotMarkets,
  };
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, `${JSON.stringify(out, null, 2)}\n`);
  console.log(`Wrote ${path.relative(process.cwd(), OUTPUT)}: ${atlasPivotMarkets.map(m => m.symbol).join(", ")}`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
