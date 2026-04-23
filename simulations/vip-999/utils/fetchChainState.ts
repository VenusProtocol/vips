import { BigNumber } from "ethers";
import fs from "fs";
import { ethers } from "hardhat";
import path from "path";

import { opbnbmainnet, opmainnet, unichainmainnet } from "../../../vips/vip-999/bscmainnet";
import PSR_ABI from "../abi/protocolShareReserve.json";
import VTOKEN_ABI from "../abi/vtoken.json";

type ChainKey = "opbnbmainnet" | "unichainmainnet" | "opmainnet";

interface ChainConfig {
  protocolShareReserve: string;
  markets: { vToken: string }[];
}

const CHAINS: Record<ChainKey, ChainConfig> = {
  opbnbmainnet,
  unichainmainnet,
  opmainnet,
};

interface DistributionTarget {
  schema: number;
  percentage: number;
  destination: string;
}

async function fetchOne(network: ChainKey) {
  const provider = ethers.provider;
  const cfg = CHAINS[network];

  // (1) totalReserves per market
  const markets: Record<string, { totalReserves: string }> = {};
  for (const m of cfg.markets) {
    const vToken = new ethers.Contract(m.vToken, VTOKEN_ABI, provider);
    const totalReserves: BigNumber = await vToken.totalReserves();
    markets[m.vToken] = { totalReserves: totalReserves.toString() };
  }

  // (2) PSR distribution targets (used by the sim to build a data-driven
  // conservation-of-value assertion after releaseFunds).
  const psr = new ethers.Contract(cfg.protocolShareReserve, PSR_ABI, provider);
  const total: BigNumber = await psr.totalDistributions();
  const psrDistribution: DistributionTarget[] = [];
  for (let i = 0; i < total.toNumber(); i++) {
    const [schema, percentage, destination] = await psr.distributionTargets(i);
    psrDistribution.push({ schema, percentage, destination });
  }

  return { markets, psrDistribution };
}

async function main() {
  const network = process.env.HARDHAT_NETWORK as ChainKey | undefined;
  if (!network || !CHAINS[network]) {
    console.error(`Set HARDHAT_NETWORK to one of: ${Object.keys(CHAINS).join(", ")}`);
    process.exit(1);
  }
  const outputPath = path.join(__dirname, "chainState.json");
  const existing = fs.existsSync(outputPath) ? JSON.parse(fs.readFileSync(outputPath, "utf-8")) : {};
  existing[network] = await fetchOne(network);
  fs.writeFileSync(outputPath, JSON.stringify(existing, null, 2) + "\n", "utf-8");
  console.log(`Updated ${outputPath} for ${network}:`);
  console.log(JSON.stringify(existing[network], null, 2));
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch(e => {
      console.error(e);
      process.exit(1);
    });
}

export { fetchOne };
