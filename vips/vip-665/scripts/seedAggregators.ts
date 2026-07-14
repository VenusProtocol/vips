/**
 * Seeds the VIP-665 grant / revoke batches onto a chain's ACMCommandsAggregator.
 *
 * Run once per chain, by a funded account, BEFORE the VIP is proposed. addGrant/RevokePermissions are
 * permissionless, so any signer works. The printed indices must be wired into GRANT_INDEX / REVOKE_INDEX in
 * vips/vip-665/utils/commands.ts.
 *
 *   npx hardhat run vips/vip-665/scripts/seedAggregators.ts --network <chain>
 *   # for zksync add: --config hardhat.config.zksync.ts
 */
import { ethers, network } from "hardhat";

import { AGGREGATOR, Chain, buildGrantPermissions, buildRevokePermissions } from "../utils/commands";
import { seedAggregator } from "../utils/seed";

async function main() {
  const chain = network.name as Chain;
  if (!(chain in AGGREGATOR)) throw new Error(`VIP-665 has no aggregator for network "${chain}"`);

  const [signer] = await ethers.getSigners();
  const grants = buildGrantPermissions(chain);
  const revokes = buildRevokePermissions(chain);

  console.log(`Chain ${chain} — aggregator ${AGGREGATOR[chain]}`);
  console.log(`  seeding ${grants.length} grant(s) and ${revokes.length} revoke(s) from ${await signer.getAddress()}`);

  const { grantIndex, revokeIndex } = await seedAggregator(signer, AGGREGATOR[chain], grants, revokes);

  if (grantIndex !== undefined) console.log(`  grant batch landed at index ${grantIndex} → set GRANT_INDEX.${chain}`);
  if (revokeIndex !== undefined)
    console.log(`  revoke batch landed at index ${revokeIndex} → set REVOKE_INDEX.${chain}`);
}

main().then(
  () => process.exit(0),
  err => {
    console.error(err);
    process.exit(1);
  },
);
