import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testVip } from "src/vip-framework";

import { PRIME_LEADERBOARD, PRIME_V2 } from "../../vips/vip-637/bsctestnet";
import vip675Addendum, { TIER_DURATIONS, TIER_MULTIPLIERS } from "../../vips/vip-637/bsctestnet-addendum";

const { bsctestnet } = NETWORK_ADDRESSES;

const ACM_ABI = [
  "function hasRole(bytes32 role, address account) view returns (bool)",
  "event PermissionGranted(address account, address contractAddress, string functionSig)",
];
const LEADERBOARD_ABI = [
  "function getMultiplierTiers() view returns (uint256[] durations, uint256[] multipliers)",
  "event MultiplierTiersUpdated(uint256[] durations, uint256[] multipliers)",
];

const BLOCK_NUMBER = 111353484;

// All ACM-gated functions on PrimeV2 / PrimeLeaderboard that the addendum grants to the Guardian.
const PRIME_V2_NEW_GUARDIAN_SIGS = [
  "setPrimeLeaderboard(address)",
  "addMarket(address,uint256,uint256)",
  "removeMarket(address)",
  "setLimit(uint256)",
  "updateAlpha(uint128,uint128)",
  "updateMultipliers(address,uint256,uint256)",
  "setMaxLoopsLimit(uint256)",
  "pause()",
  "unpause()",
];
const PRIME_LEADERBOARD_NEW_GUARDIAN_SIGS = [
  "setMultiplierTiers(uint256[],uint256[])",
  "setPrimeV2(address)",
  "setMaxLoopsLimit(uint256)",
];

forking(BLOCK_NUMBER, async () => {
  let acm: Contract;
  let leaderboard: Contract;

  before(async () => {
    acm = new ethers.Contract(bsctestnet.ACCESS_CONTROL_MANAGER, ACM_ABI, ethers.provider);
    leaderboard = new ethers.Contract(PRIME_LEADERBOARD, LEADERBOARD_ABI, ethers.provider);
  });

  const roleFor = (target: string, signature: string) =>
    ethers.utils.solidityKeccak256(["address", "string"], [target, signature]);

  describe("Pre-VIP behavior", () => {
    it("Guardian does not yet hold the addendum permissions on PrimeV2", async () => {
      for (const sig of PRIME_V2_NEW_GUARDIAN_SIGS) {
        expect(await acm.hasRole(roleFor(PRIME_V2, sig), bsctestnet.GUARDIAN)).to.equal(false);
      }
    });

    it("Guardian does not yet hold the addendum permissions on PrimeLeaderboard", async () => {
      for (const sig of PRIME_LEADERBOARD_NEW_GUARDIAN_SIGS) {
        expect(await acm.hasRole(roleFor(PRIME_LEADERBOARD, sig), bsctestnet.GUARDIAN)).to.equal(false);
      }
    });

    it("PrimeLeaderboard tiers are still the day-scale defaults", async () => {
      const { durations, multipliers } = await leaderboard.getMultiplierTiers();
      expect(durations.map((d: { toString: () => string }) => d.toString())).to.deep.equal([
        (30 * 24 * 60 * 60).toString(),
        (60 * 24 * 60 * 60).toString(),
        (90 * 24 * 60 * 60).toString(),
      ]);
      expect(multipliers.map((m: { toString: () => string }) => m.toString())).to.deep.equal([
        "1300000000000000000",
        "1600000000000000000",
        "2000000000000000000",
      ]);
    });
  });

  testVip("VIP-675 addendum [Testnet]", await vip675Addendum(), {
    callbackAfterExecution: async txResponse => {
      await expect(txResponse)
        .to.emit(leaderboard, "MultiplierTiersUpdated")
        .withArgs(TIER_DURATIONS, TIER_MULTIPLIERS);
      await expect(txResponse)
        .to.emit(acm, "PermissionGranted")
        .withArgs(bsctestnet.GUARDIAN, PRIME_LEADERBOARD, "setMultiplierTiers(uint256[],uint256[])");
    },
  });

  describe("Post-VIP behavior", () => {
    it("Guardian holds all addendum permissions on PrimeV2", async () => {
      for (const sig of PRIME_V2_NEW_GUARDIAN_SIGS) {
        expect(await acm.hasRole(roleFor(PRIME_V2, sig), bsctestnet.GUARDIAN)).to.equal(true);
      }
    });

    it("Guardian holds all addendum permissions on PrimeLeaderboard", async () => {
      for (const sig of PRIME_LEADERBOARD_NEW_GUARDIAN_SIGS) {
        expect(await acm.hasRole(roleFor(PRIME_LEADERBOARD, sig), bsctestnet.GUARDIAN)).to.equal(true);
      }
    });

    it("PrimeLeaderboard tiers are compressed to the hour-scale schedule", async () => {
      const { durations, multipliers } = await leaderboard.getMultiplierTiers();
      expect(durations.map((d: { toString: () => string }) => d.toString())).to.deep.equal(
        TIER_DURATIONS.map(d => d.toString()),
      );
      expect(multipliers.map((m: { toString: () => string }) => m.toString())).to.deep.equal(TIER_MULTIPLIERS);
    });
  });
});
