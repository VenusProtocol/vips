import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { forking, testVip } from "src/vip-framework";

import { LEGACY_PRIME } from "../../vips/vip-675/bscmainnet";
import { PLP, PRIME_UNDERLYINGS, XVS_VAULT, default as vip675Critical } from "../../vips/vip-675/bscmainnet-critical";

const PLP_ABI = [
  "function tokenDistributionSpeeds(address) view returns (uint256)",
  "event TokenDistributionSpeedUpdated(address indexed token, uint256 distributionSpeed)",
];
const VAULT_ABI = ["function vaultPaused() view returns (bool)", "event VaultPaused(address indexed admin)"];
const LEGACY_PRIME_ABI = ["function paused() view returns (bool)"];

const BLOCK_NUMBER = 105868057;

forking(BLOCK_NUMBER, async () => {
  let plp: Contract;
  let xvsVault: Contract;
  let legacyPrime: Contract;

  before(async () => {
    plp = new ethers.Contract(PLP, PLP_ABI, ethers.provider);
    xvsVault = new ethers.Contract(XVS_VAULT, VAULT_ABI, ethers.provider);
    legacyPrime = new ethers.Contract(LEGACY_PRIME, LEGACY_PRIME_ABI, ethers.provider);
  });

  describe("Pre-VIP behavior", () => {
    it("XVS Vault is not paused", async () => {
      expect(await xvsVault.vaultPaused()).to.equal(false);
    });

    it("at least one Prime underlying still has a non-zero distribution speed", async () => {
      const speeds = await Promise.all(PRIME_UNDERLYINGS.map((t: string) => plp.tokenDistributionSpeeds(t)));
      expect(speeds.some(s => s.gt(0))).to.equal(true);
    });

    it("legacy Prime is active (claimInterest still works)", async () => {
      expect(await legacyPrime.paused()).to.equal(false);
    });
  });

  testVip("VIP-675 (Critical) Freeze XVS Vault and stop legacy Prime emissions", await vip675Critical());

  describe("Post-VIP behavior", () => {
    it("XVS Vault is paused", async () => {
      expect(await xvsVault.vaultPaused()).to.equal(true);
    });

    it("every Prime underlying distribution speed is zero", async () => {
      for (const token of PRIME_UNDERLYINGS) {
        expect(await plp.tokenDistributionSpeeds(token)).to.equal(0);
      }
    });

    it("legacy Prime remains active so claimInterest still works while frozen", async () => {
      expect(await legacyPrime.paused()).to.equal(false);
    });
  });
});
