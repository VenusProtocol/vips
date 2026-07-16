/**
 * Seeds the VIP-665 grant / revoke batches onto a chain's ACMCommandsAggregator.
 *
 * Run once per chain, by a funded account, BEFORE the VIP is proposed. addGrant/RevokePermissions are
 * permissionless, so any signer works. The printed indices must be wired into GRANT_INDEX / REVOKE_INDICES in
 * vips/vip-665/utils/commands.ts. Revokes are split into batches (buildRevokeBatches) so no seed tx exceeds
 * the Osaka per-tx gas cap; each batch lands at its own index.
 *
 *   npx hardhat run vips/vip-665/scripts/seedAggregators.ts --network <chain>
 *   # for zksync add: --config hardhat.config.zksync.ts
 */
import { ethers, network } from "hardhat";

import { AGGREGATOR, Chain, bscRevokeBatches, buildGrantPermissions, buildRevokePermissions } from "../utils/commands";
import { seedAggregator } from "../utils/seed";

async function main() {
  const chain = network.name as Chain;
  if (!(chain in AGGREGATOR)) throw new Error(`VIP-665 has no aggregator for network "${chain}"`);

  const [signer] = await ethers.getSigners();
  const grants = buildGrantPermissions(chain);
  // BNB Chain seeds its revokes as two halves (Osaka per-tx gas cap); every other chain seeds one batch.
  const revokeBatches = chain === "bscmainnet" ? bscRevokeBatches() : [buildRevokePermissions(chain)];
  const revokeCount = revokeBatches.reduce((n, b) => n + b.length, 0);

  console.log(`Chain ${chain} — aggregator ${AGGREGATOR[chain]}`);
  console.log(
    `  seeding ${grants.length} grant(s) and ${revokeCount} revoke(s) in ${revokeBatches.length} batch(es) ` +
      `from ${await signer.getAddress()}`,
  );

  const { grantIndex, revokeIndices } = await seedAggregator(signer, AGGREGATOR[chain], grants, revokeBatches);

  if (grantIndex !== undefined) console.log(`  grant batch landed at index ${grantIndex} → set GRANT_INDEX.${chain}`);
  if (revokeIndices.length > 0)
    console.log(
      `  revoke batch(es) landed at index/indices [${revokeIndices.join(", ")}] → set REVOKE_INDICES.${chain}`,
    );
}

main().then(
  () => process.exit(0),
  err => {
    console.error(err);
    process.exit(1);
  },
);
