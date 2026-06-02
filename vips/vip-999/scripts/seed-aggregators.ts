import { NETWORK_ADDRESSES } from "src/networkAddresses";

import {
  AUXILIARY_AGGREGATOR,
  NEW_AGGREGATOR,
  NEW_AGGREGATOR_TIMELOCK_SIGS,
  REMOTE_BATCH_INDEX,
  RemoteChainKey,
} from "../bscmainnet";
import { SeedCommand, seedAuxiliaryAggregator } from "../utils/auxiliary-aggregator";
import {
  ARBITRUM_BOUND_VALIDATOR,
  ARBITRUM_MIGRATIONS,
  AssetMigration,
  BASE_BOUND_VALIDATOR,
  BASE_MIGRATIONS,
  ETHEREUM_BOUND_VALIDATOR,
  ETHEREUM_MIGRATIONS,
} from "../utils/data";

const REMOTE_CHAINS: Record<
  RemoteChainKey,
  { boundValidator?: string; migrations: AssetMigration[]; oracleMigration: boolean }
> = {
  ethereum: { boundValidator: ETHEREUM_BOUND_VALIDATOR, migrations: ETHEREUM_MIGRATIONS, oracleMigration: true },
  arbitrumone: { boundValidator: ARBITRUM_BOUND_VALIDATOR, migrations: ARBITRUM_MIGRATIONS, oracleMigration: true },
  basemainnet: { boundValidator: BASE_BOUND_VALIDATOR, migrations: BASE_MIGRATIONS, oracleMigration: true },
  zksyncmainnet: { migrations: [], oracleMigration: false },
};

// Batch executed by the aggregator
export function buildSeedBatch(chainKey: RemoteChainKey): SeedCommand[] {
  const {
    ACCESS_CONTROL_MANAGER: acm,
    REDSTONE_ORACLE: redstoneOracle,
    RESILIENT_ORACLE: resilientOracle,
    NORMAL_TIMELOCK,
    FAST_TRACK_TIMELOCK,
    CRITICAL_TIMELOCK,
  } = NETWORK_ADDRESSES[chainKey];
  const aggregator = AUXILIARY_AGGREGATOR[chainKey];
  const newAggregator = NEW_AGGREGATOR[chainKey];
  const timelocks = [NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK];
  const { boundValidator, migrations, oracleMigration } = REMOTE_CHAINS[chainKey];

  const grant = (target: string, signature: string): SeedCommand => ({
    target: acm,
    signature: "giveCallPermission(address,string,address)",
    params: [target, signature, aggregator],
  });
  const revoke = (target: string, signature: string): SeedCommand => ({
    target: acm,
    signature: "revokeCallPermission(address,string,address)",
    params: [target, signature, aggregator],
  });

  const oracleCommands: SeedCommand[] = !oracleMigration
    ? []
    : [
        grant(boundValidator!, "setValidateConfig(ValidateConfig)"),
        grant(redstoneOracle, "setTokenConfig(TokenConfig)"),
        grant(resilientOracle, "setTokenConfig(TokenConfig)"),
        ...migrations.map(migration => ({
          target: boundValidator!,
          signature: "setValidateConfig((address,uint256,uint256))",
          params: [[migration.asset, migration.boundConfig!.upperBoundRatio, migration.boundConfig!.lowerBoundRatio]],
        })),
        ...migrations.map(migration => ({
          target: redstoneOracle,
          signature: "setTokenConfig((address,address,uint256))",
          params: [[migration.asset, migration.redstoneFeed!.feed, migration.redstoneFeed!.maxStalePeriod]],
        })),
        ...migrations.map(migration => ({
          target: resilientOracle,
          signature: "setTokenConfig((address,address[3],bool[3],bool))",
          params: [[migration.asset, migration.newOracles, migration.newFlags, migration.cachingEnabled]],
        })),
        revoke(boundValidator!, "setValidateConfig(ValidateConfig)"),
        revoke(redstoneOracle, "setTokenConfig(TokenConfig)"),
        revoke(resilientOracle, "setTokenConfig(TokenConfig)"),
      ];

  const newAggregatorGrants: SeedCommand[] = NEW_AGGREGATOR_TIMELOCK_SIGS.flatMap(signature =>
    timelocks.map(timelock => ({
      target: acm,
      signature: "giveCallPermission(address,string,address)",
      params: [newAggregator, signature, timelock],
    })),
  );

  return [...oracleCommands, ...newAggregatorGrants];
}

const SUPPORTED: Record<string, RemoteChainKey> = {
  ethereum: "ethereum",
  arbitrumone: "arbitrumone",
  basemainnet: "basemainnet",
  zksyncmainnet: "zksyncmainnet",
};

async function main() {
  const network = process.env.HARDHAT_NETWORK ?? "unknown";
  const chainKey = SUPPORTED[network];
  if (!chainKey) {
    throw new Error(
      `Unsupported network for VIP-999 seeding: ${network}. Use ethereum | arbitrumone | basemainnet | zksyncmainnet.`,
    );
  }

  const aggregator = AUXILIARY_AGGREGATOR[chainKey];
  const commands = buildSeedBatch(chainKey);

  console.log(`Seeding ${aggregator} on ${network} with ${commands.length} commands…`);
  const index = await seedAuxiliaryAggregator(aggregator, commands);
  if (index !== REMOTE_BATCH_INDEX[chainKey]) {
    console.warn(
      `Batch stored at index ${index}; update REMOTE_BATCH_INDEX.${chainKey} (currently ${REMOTE_BATCH_INDEX[chainKey]}).`,
    );
  }
  console.log("Done.");
}

if (require.main === module) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
