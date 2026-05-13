/**
 * Seeding script for VIP-999 AuxiliaryCommandsAggregator instances.
 *
 * Builds per-chain command arrays in the same { target, signature, params } format
 * used in VIP files — making it easy to cross-check against the proposal — then
 * hands them to seedAuxiliaryAggregator for encoding and submission.
 *
 * Run once per network after the aggregator is deployed:
 *   npx hardhat run vips/vip-999/scripts/seed-aggregators.ts --network ethereum
 *   npx hardhat run vips/vip-999/scripts/seed-aggregators.ts --network arbitrumone
 *   npx hardhat run vips/vip-999/scripts/seed-aggregators.ts --network basemainnet
 *   npx hardhat run vips/vip-999/scripts/seed-aggregators.ts --network zksyncmainnet
 */
import { BigNumber } from "ethers";
import { SeedCommand, seedAuxiliaryAggregator } from "src/auxiliary-aggregator";
import { NETWORK_ADDRESSES } from "src/networkAddresses";

import { CFEntry, COMPTROLLER_SIGS, CapEntry, DelistEntry, PauseEntry, delistCommands } from "../bscmainnet";
import * as arb from "../data/arbitrumone";
import * as base from "../data/basemainnet";
import * as eth from "../data/ethereum";

// Fill in after deploying AuxiliaryCommandsAggregator on each chain.
export const AUXILIARY_AGGREGATOR: Record<string, string> = {
  ethereum: "0x884E46c8639c8CaFcf249e34c22575f4dD09E87D",
  arbitrumone: "0xFAC9571b6406aD7c135a34859A121739FFf3C47a",
  basemainnet: "0x26FA3316c344B5d3261c44e67c6a72C926EEB89c",
};

const BORROW_ACTION = 2;

function buildRiskParamCommands(
  comptroller: string,
  cfChanges: CFEntry[],
  marketCapChanges: CapEntry[],
  borrowPauseChanges: PauseEntry[],
): SeedCommand[] {
  const commands: SeedCommand[] = [];

  cfChanges.forEach(c =>
    commands.push({
      target: comptroller,
      signature: "setCollateralFactor(address,uint256,uint256)",
      params: [c.vToken, c.new, c.liquidationThreshold],
    }),
  );

  const supplyChanges = marketCapChanges.filter(c => !BigNumber.from(c.supplyCap.old).eq(c.supplyCap.new));
  if (supplyChanges.length > 0) {
    commands.push({
      target: comptroller,
      signature: "setMarketSupplyCaps(address[],uint256[])",
      params: [supplyChanges.map(c => c.vToken), supplyChanges.map(c => c.supplyCap.new)],
    });
  }

  const borrowChanges = marketCapChanges.filter(c => !BigNumber.from(c.borrowCap.old).eq(c.borrowCap.new));
  if (borrowChanges.length > 0) {
    commands.push({
      target: comptroller,
      signature: "setMarketBorrowCaps(address[],uint256[])",
      params: [borrowChanges.map(c => c.vToken), borrowChanges.map(c => c.borrowCap.new)],
    });
  }

  const toUnpause = borrowPauseChanges.filter(c => c.old === true && c.new === false);
  if (toUnpause.length > 0) {
    commands.push({
      target: comptroller,
      signature: "setActionsPaused(address[],uint8[],bool)",
      params: [toUnpause.map(c => c.vToken), [BORROW_ACTION], false],
    });
  }

  return commands;
}

// ─── Chain configs ────────────────────────────────────────────────────────────

interface ChainConfig {
  comptroller: string;
  acm: string;
  aggregator: string;
  delistAssets?: DelistEntry[];
  cfChanges?: CFEntry[];
  marketCapChanges: CapEntry[];
  borrowPauseChanges: PauseEntry[];
}

function buildChainCommands(config: ChainConfig): SeedCommand[] {
  const grantCmds = COMPTROLLER_SIGS.map(sig => ({
    target: config.acm,
    signature: "giveCallPermission(address,string,address)",
    params: [config.comptroller, sig, config.aggregator],
  }));
  const revokeCmds = COMPTROLLER_SIGS.map(sig => ({
    target: config.acm,
    signature: "revokeCallPermission(address,string,address)",
    params: [config.comptroller, sig, config.aggregator],
  }));
  return [
    ...grantCmds,
    ...delistCommands(config.comptroller, config.delistAssets ?? []),
    ...buildRiskParamCommands(
      config.comptroller,
      config.cfChanges ?? [],
      config.marketCapChanges,
      config.borrowPauseChanges,
    ),
    ...revokeCmds,
  ];
}

function getChainConfig(network: string): ChainConfig {
  switch (network) {
    case "ethereum":
    case "sepolia":
      return {
        comptroller: eth.COMPTROLLER,
        acm: NETWORK_ADDRESSES.ethereum.ACCESS_CONTROL_MANAGER,
        aggregator: AUXILIARY_AGGREGATOR.ethereum,
        delistAssets: eth.delistAssets,
        cfChanges: eth.cfChanges,
        marketCapChanges: eth.marketCapChanges,
        borrowPauseChanges: eth.borrowPauseChanges,
      };
    case "arbitrumone":
    case "arbitrumsepolia":
      return {
        comptroller: arb.COMPTROLLER,
        acm: NETWORK_ADDRESSES.arbitrumone.ACCESS_CONTROL_MANAGER,
        aggregator: AUXILIARY_AGGREGATOR.arbitrumone,
        cfChanges: arb.cfChanges,
        marketCapChanges: arb.marketCapChanges,
        borrowPauseChanges: arb.borrowPauseChanges,
      };
    case "basemainnet":
    case "basesepolia":
      return {
        comptroller: base.COMPTROLLER,
        acm: NETWORK_ADDRESSES.basemainnet.ACCESS_CONTROL_MANAGER,
        aggregator: AUXILIARY_AGGREGATOR.basemainnet,
        delistAssets: base.delistAssets,
        marketCapChanges: base.marketCapChanges,
        borrowPauseChanges: base.borrowPauseChanges,
      };
    default:
      throw new Error(`Unsupported network for VIP-999 seeding: ${network}`);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const hreNetwork = process.env.HARDHAT_NETWORK ?? "unknown";
  console.log(`Seeding VIP-999 AuxiliaryCommandsAggregator on ${hreNetwork}…`);

  const aggregatorAddress = AUXILIARY_AGGREGATOR[hreNetwork];
  if (!aggregatorAddress || aggregatorAddress === "0x0000000000000000000000000000000000000000") {
    throw new Error(
      `No aggregator address configured for network "${hreNetwork}". Deploy first and fill AUXILIARY_AGGREGATOR.`,
    );
  }

  const config = getChainConfig(hreNetwork);
  const commands = buildChainCommands(config);

  console.log(`  Built ${commands.length} commands for ${hreNetwork}.`);
  await seedAuxiliaryAggregator(aggregatorAddress, commands, 1);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
