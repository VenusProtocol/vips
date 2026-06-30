import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { forking, testVip } from "src/vip-framework";

import { LEGACY_PRIME } from "../../vips/vip-637/bscmainnet";
import {
  ADDITIONAL_REVENUE,
  PLP,
  PRIME_UNDERLYINGS,
  PROTOCOL_RESERVES,
  PSR,
  USDT_PRIME_BUYBACK,
  U_PRIME_BUYBACK,
  XVS_BUYBACK,
  XVS_VAULT,
  default as vip638Critical,
} from "../../vips/vip-637/bscmainnet-critical";

const PLP_ABI = [
  "function tokenDistributionSpeeds(address) view returns (uint256)",
  "event TokenDistributionSpeedUpdated(address indexed token, uint256 distributionSpeed)",
];
const PSR_ABI = [
  "function getPercentageDistribution(address destination, uint8 schema) view returns (uint256)",
  "function totalDistributions() view returns (uint256)",
  "function distributionTargets(uint256) view returns (uint8 schema, uint16 percentage, address destination)",
];
const VAULT_ABI = ["function vaultPaused() view returns (bool)", "event VaultPaused(address indexed admin)"];
const LEGACY_PRIME_ABI = ["function paused() view returns (bool)"];
const LEGACY_PRIME_CLAIM_ABI = [
  "function claimInterest(address vToken, address user) returns (uint256)",
  "function isUserPrimeHolder(address user) view returns (bool)",
];
const ERC20_ABI = ["function balanceOf(address) view returns (uint256)"];

const BLOCK_NUMBER = 107043197;

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

// PSR distribution targets left untouched by this VIP (verified on-chain via each
// buyback's BASE_ASSET / DESTINATION). Used to assert the full post-VIP table.
const RISK_FUND_BUYBACK = "0x0c71EFabD00329E839745ef23aB946d3ed24A805";
const U_TREASURY_BUYBACK = "0xec63411423D03327De19135446dDdA3055D2feA8";
const BTCB_TREASURY_BUYBACK = "0x1F306a0d929a7098a0A0b12248Ba97600AB79026";
const ETH_TREASURY_BUYBACK = "0x41954F0bf26959dF2e1B8302DEBf736B5b154B64";
const USDT_TREASURY_BUYBACK = "0xB3dDf13E8B6b8dE10F5826087C202b80F1D1b490";
const USDC_TREASURY_BUYBACK = "0xd7aC40f9bd9A1beb8E2d121b4446CF90417cf169";
const XVS_TREASURY_BUYBACK = "0x6D2d239c16453062cF145A7a5128A6a60710d236";

// The complete distribution table expected AFTER this VIP executes (percentages in
// bps, MAX_PERCENT = 10000). XVS_BUYBACK is absent from both schemas (zeroed + removed).
//   schema 0 (PROTOCOL_RESERVES): 9 targets, sums to 10000
//   schema 1 (ADDITIONAL_REVENUE): 9 targets, sums to 10000
const EXPECTED_DISTRIBUTION = [
  // schema 0 — PROTOCOL_RESERVES
  { schema: PROTOCOL_RESERVES, destination: RISK_FUND_BUYBACK, percentage: 2000 },
  { schema: PROTOCOL_RESERVES, destination: USDT_PRIME_BUYBACK, percentage: 2000 },
  { schema: PROTOCOL_RESERVES, destination: U_PRIME_BUYBACK, percentage: 2000 },
  { schema: PROTOCOL_RESERVES, destination: U_TREASURY_BUYBACK, percentage: 1200 },
  { schema: PROTOCOL_RESERVES, destination: BTCB_TREASURY_BUYBACK, percentage: 600 },
  { schema: PROTOCOL_RESERVES, destination: ETH_TREASURY_BUYBACK, percentage: 600 },
  { schema: PROTOCOL_RESERVES, destination: USDT_TREASURY_BUYBACK, percentage: 600 },
  { schema: PROTOCOL_RESERVES, destination: USDC_TREASURY_BUYBACK, percentage: 600 },
  { schema: PROTOCOL_RESERVES, destination: XVS_TREASURY_BUYBACK, percentage: 400 },
  // schema 1 — ADDITIONAL_REVENUE
  { schema: ADDITIONAL_REVENUE, destination: RISK_FUND_BUYBACK, percentage: 2000 },
  { schema: ADDITIONAL_REVENUE, destination: U_TREASURY_BUYBACK, percentage: 1800 },
  { schema: ADDITIONAL_REVENUE, destination: BTCB_TREASURY_BUYBACK, percentage: 900 },
  { schema: ADDITIONAL_REVENUE, destination: ETH_TREASURY_BUYBACK, percentage: 900 },
  { schema: ADDITIONAL_REVENUE, destination: USDT_TREASURY_BUYBACK, percentage: 900 },
  { schema: ADDITIONAL_REVENUE, destination: USDC_TREASURY_BUYBACK, percentage: 900 },
  { schema: ADDITIONAL_REVENUE, destination: XVS_TREASURY_BUYBACK, percentage: 600 },
  { schema: ADDITIONAL_REVENUE, destination: USDT_PRIME_BUYBACK, percentage: 1000 },
  { schema: ADDITIONAL_REVENUE, destination: U_PRIME_BUYBACK, percentage: 1000 },
];

forking(BLOCK_NUMBER, async () => {
  let plp: Contract;
  let xvsVault: Contract;
  let legacyPrime: Contract;
  let psr: Contract;

  // Sum the configured percentages of every distribution target for a schema.
  const schemaTotal = async (schema: number): Promise<number> => {
    const n = (await psr.totalDistributions()).toNumber();
    let total = 0;
    for (let i = 0; i < n; i++) {
      const target = await psr.distributionTargets(i);
      if (target.schema === schema) total += target.percentage;
    }
    return total;
  };

  before(async () => {
    plp = new ethers.Contract(PLP, PLP_ABI, ethers.provider);
    xvsVault = new ethers.Contract(XVS_VAULT, VAULT_ABI, ethers.provider);
    legacyPrime = new ethers.Contract(LEGACY_PRIME, LEGACY_PRIME_ABI, ethers.provider);
    psr = new ethers.Contract(PSR, PSR_ABI, ethers.provider);
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

    it("XVS buyback holds 20% in both PSR distribution schemas", async () => {
      expect(await psr.getPercentageDistribution(XVS_BUYBACK, PROTOCOL_RESERVES)).to.equal(2000);
      expect(await psr.getPercentageDistribution(XVS_BUYBACK, ADDITIONAL_REVENUE)).to.equal(2000);
    });

    it("USDT & U Prime buybacks are at 10% in PROTOCOL_RESERVES and unset in ADDITIONAL_REVENUE", async () => {
      expect(await psr.getPercentageDistribution(USDT_PRIME_BUYBACK, PROTOCOL_RESERVES)).to.equal(1000);
      expect(await psr.getPercentageDistribution(U_PRIME_BUYBACK, PROTOCOL_RESERVES)).to.equal(1000);
      expect(await psr.getPercentageDistribution(USDT_PRIME_BUYBACK, ADDITIONAL_REVENUE)).to.equal(0);
      expect(await psr.getPercentageDistribution(U_PRIME_BUYBACK, ADDITIONAL_REVENUE)).to.equal(0);
    });

    it("both PSR schemas sum to 100%", async () => {
      expect(await schemaTotal(PROTOCOL_RESERVES)).to.equal(10000);
      expect(await schemaTotal(ADDITIONAL_REVENUE)).to.equal(10000);
    });
  });

  testVip("VIP-638 (Critical) Freeze XVS Vault and stop legacy Prime emissions", await vip638Critical());

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

    it("XVS buyback is zeroed and removed from both PSR schemas", async () => {
      expect(await psr.getPercentageDistribution(XVS_BUYBACK, PROTOCOL_RESERVES)).to.equal(0);
      expect(await psr.getPercentageDistribution(XVS_BUYBACK, ADDITIONAL_REVENUE)).to.equal(0);

      const n = (await psr.totalDistributions()).toNumber();
      for (let i = 0; i < n; i++) {
        const target = await psr.distributionTargets(i);
        expect(target.destination.toLowerCase()).to.not.equal(XVS_BUYBACK.toLowerCase());
      }
    });

    it("XVS share is re-routed to the USDT & U Prime buybacks", async () => {
      // PROTOCOL_RESERVES: 10% -> 20% each
      expect(await psr.getPercentageDistribution(USDT_PRIME_BUYBACK, PROTOCOL_RESERVES)).to.equal(2000);
      expect(await psr.getPercentageDistribution(U_PRIME_BUYBACK, PROTOCOL_RESERVES)).to.equal(2000);
      // ADDITIONAL_REVENUE: newly added at 10% each
      expect(await psr.getPercentageDistribution(USDT_PRIME_BUYBACK, ADDITIONAL_REVENUE)).to.equal(1000);
      expect(await psr.getPercentageDistribution(U_PRIME_BUYBACK, ADDITIONAL_REVENUE)).to.equal(1000);
    });

    it("both PSR schemas still sum to 100% and the target count is unchanged", async () => {
      expect(await schemaTotal(PROTOCOL_RESERVES)).to.equal(10000);
      expect(await schemaTotal(ADDITIONAL_REVENUE)).to.equal(10000);
      // two entries added (ADDITIONAL_REVENUE prime) and two removed (zeroed XVS) -> net 18
      expect((await psr.totalDistributions()).toNumber()).to.equal(18);
    });

    it("the full distribution table matches the expected post-VIP configuration exactly", async () => {
      // Read every on-chain target into a (schema, destination) -> percentage map.
      const n = (await psr.totalDistributions()).toNumber();
      const actual = new Map<string, number>();
      for (let i = 0; i < n; i++) {
        const target = await psr.distributionTargets(i);
        actual.set(`${target.schema}:${target.destination.toLowerCase()}`, target.percentage);
      }

      // Every expected entry exists with the exact percentage...
      for (const entry of EXPECTED_DISTRIBUTION) {
        const key = `${entry.schema}:${entry.destination.toLowerCase()}`;
        expect(actual.has(key), `missing target ${key}`).to.equal(true);
        expect(actual.get(key), `wrong percentage for ${key}`).to.equal(entry.percentage);
      }

      // ...and there are no extra on-chain targets beyond the expected set.
      const expectedKeys = new Set(EXPECTED_DISTRIBUTION.map(e => `${e.schema}:${e.destination.toLowerCase()}`));
      expect(actual.size).to.equal(expectedKeys.size);
      for (const key of actual.keys()) {
        expect(expectedKeys.has(key), `unexpected target ${key}`).to.equal(true);
      }
    });

    describe("legacy Prime claimInterest is permissionless after the freeze", () => {
      for (const whale of WHALES) {
        it(`a non-Prime EOA sweeps vUSDT interest on behalf of ${whale}`, async () => {
          const signers = await ethers.getSigners();
          const randomEoa = signers[1];
          const usdt = new ethers.Contract(USDT, ERC20_ABI, ethers.provider);
          const legacyClaim = new ethers.Contract(LEGACY_PRIME, LEGACY_PRIME_CLAIM_ABI, randomEoa);

          // The caller is an arbitrary EOA, NOT a Prime member; the whale IS one.
          const callerIsPrime = await legacyClaim.isUserPrimeHolder(randomEoa.address);
          const whaleIsPrime = await legacyClaim.isUserPrimeHolder(whale);
          console.log(
            `    caller ${randomEoa.address} isPrime=${callerIsPrime} | whale ${whale} isPrime=${whaleIsPrime}`,
          );
          expect(callerIsPrime).to.equal(false);
          expect(whaleIsPrime).to.equal(true);

          const before = await usdt.balanceOf(whale);
          await legacyClaim.claimInterest(VUSDT, whale);
          const after = await usdt.balanceOf(whale);
          console.log(
            `    whale USDT before=${before.toString()} after=${after.toString()} claimed=${after
              .sub(before)
              .toString()}`,
          );

          // Funds land with the whale, not the caller, and the caller never needed Prime status.
          expect(after.gt(before)).to.equal(true);
        });
      }
    });
  });
});
