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
const LEGACY_PRIME_CLAIM_ABI = ["function claimInterest(address vToken, address user) returns (uint256)"];
const ERC20_ABI = ["function balanceOf(address) view returns (uint256)"];

const BLOCK_NUMBER = 105868057;

// vUSDT market on the Core pool and its underlying. Used to prove the off-chain
// claimInterest sweep still works after the freeze.
const VUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
const USDT = "0x55d398326f99059fF775485246999027B3197955";

// Legacy Prime members (whales) holding non-zero accrued vUSDT interest at the
// fork block (discovered from recent on-chain InterestClaimed events). The
// post-freeze sweep claims on their behalf; verified here that any EOA can do it.
const WHALES = [
  "0xa205358b29bb5466c8d0ad25f84d2aa118e967e5",
  "0x18c14a4f2c4b1433bc20078e86f935a988eca86c",
  "0x923f2eedfdc7ba8f60083dff1a9413cbd032841d",
  "0x52fd0feb41960d660cd4e1c6604a39b50d66f28c",
];

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

    describe("legacy Prime claimInterest is permissionless after the freeze", () => {
      for (const whale of WHALES) {
        it(`an arbitrary EOA sweeps vUSDT interest on behalf of ${whale}`, async () => {
          const signers = await ethers.getSigners();
          const randomEoa = signers[1];
          const usdt = new ethers.Contract(USDT, ERC20_ABI, ethers.provider);
          const legacyClaim = new ethers.Contract(LEGACY_PRIME, LEGACY_PRIME_CLAIM_ABI, randomEoa);

          const before = await usdt.balanceOf(whale);
          await legacyClaim.claimInterest(VUSDT, whale);
          const after = await usdt.balanceOf(whale);

          expect(after.gt(before)).to.equal(true);
        });
      }
    });
  });
});
