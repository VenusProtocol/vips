import { BigNumber } from "ethers";
import fs from "fs";
import { ethers } from "hardhat";
import path from "path";

import { opbnbmainnet, opmainnet, unichainmainnet } from "../../../vips/vip-999/bscmainnet";
import ERC20_ABI from "../abi/ERC20.json";
import PSR_ABI from "../abi/protocolShareReserve.json";
import VTOKEN_ABI from "../abi/vtoken.json";

type ChainKey = "opbnbmainnet" | "unichainmainnet" | "opmainnet";

interface ChainConfig {
  protocolShareReserve: string;
  vTreasury: string;
  nativeTokenGateway_vWBNB?: string;
  nativeTokenGateway_vWETH?: string;
  xvsVaultProxy?: string;
  xvs?: string;
  markets: { vToken: string; underlying: string }[];
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

interface MarketSnapshot {
  totalReserves: string;
  treasuryVTokenBalance: string;
  redeemCapacity: string;
  exchangeRate: string;
  psrPreBalance: string;
}

const XVS_VAULT_ABI = [
  "function rewardTokenAmountsPerBlock(address rewardToken) view returns (uint256)",
];

async function fetchOne(network: ChainKey) {
  const provider = ethers.provider;
  const cfg = CHAINS[network];

  // (1) Per-market snapshot.
  //   - totalReserves drives reduceReserves.
  //   - treasuryVTokenBalance + redeemCapacity + exchangeRate drive the
  //     treasury-redeem path.
  //   - psrPreBalance feeds the accounting aggregator (computeExpectedTotals.ts)
  //     so it can report how much of the Phase-1 Treasury gain came from
  //     pre-existing PSR balance vs. the reserves this VIP pushes in.
  const markets: Record<string, MarketSnapshot> = {};
  for (const m of cfg.markets) {
    const vToken = new ethers.Contract(m.vToken, VTOKEN_ABI, provider);
    const underlying = new ethers.Contract(m.underlying, ERC20_ABI, provider);
    const [totalReserves, treasuryVTokenBalance, cash, exchangeRate, psrPreBalance]: BigNumber[] = await Promise.all([
      vToken.totalReserves(),
      vToken.balanceOf(cfg.vTreasury),
      vToken.getCash(),
      vToken.exchangeRateStored(),
      underlying.balanceOf(cfg.protocolShareReserve),
    ]);
    const redeemCapacity = cash.gt(totalReserves) ? cash.sub(totalReserves) : BigNumber.from(0);
    markets[m.vToken] = {
      totalReserves: totalReserves.toString(),
      treasuryVTokenBalance: treasuryVTokenBalance.toString(),
      redeemCapacity: redeemCapacity.toString(),
      exchangeRate: exchangeRate.toString(),
      psrPreBalance: psrPreBalance.toString(),
    };
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

  // (3) XVSVault reward speed. Only populated for chains that expose the
  // vault in the chain config; we emit a zero-speed setter only when
  // this is non-zero. On opBNB and Optimism the speed is already 0 so the
  // chain config intentionally omits `xvsVaultProxy`.
  let xvsVaultRewardSpeed: string | undefined;
  if (cfg.xvsVaultProxy && cfg.xvs) {
    const vault = new ethers.Contract(cfg.xvsVaultProxy, XVS_VAULT_ABI, provider);
    const speed: BigNumber = await vault.rewardTokenAmountsPerBlock(cfg.xvs);
    xvsVaultRewardSpeed = speed.toString();
  }

  // (4) Native gateway balance — not consumed by the VIP itself
  // (sweepNative is a no-op at 0), but reported by the aggregator so the
  // user can see what's swept to the NormalTimelock in Phase 1 and
  // forwarded to VTreasuryV8 in Phase 2.
  const gateway = cfg.nativeTokenGateway_vWBNB ?? cfg.nativeTokenGateway_vWETH;
  let gatewayNativeBalance: string | undefined;
  if (gateway) {
    gatewayNativeBalance = (await provider.getBalance(gateway)).toString();
  }

  return { markets, psrDistribution, xvsVaultRewardSpeed, gatewayNativeBalance };
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
