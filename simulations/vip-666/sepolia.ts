import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { ZERO_ADDRESS } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import { SEPOLIA_CONFIG, SEPOLIA_GUARDIAN_OWNER } from "../../vips/vip-666/addresses/sepolia";
import {
  DIAMOND_ONLY_EBRAKE_PERMS,
  EBRAKE_COMPTROLLER_PERMS_IL,
  SENTINEL_EBRAKE_PERMS,
} from "../../vips/vip-666/bscmainnet";
import vip666Sepolia, {
  DEPLOYER_COMPTROLLER_PERMS,
  DEPLOYER_EBRAKE_PERMS,
  DEPLOYER_SENTINEL_ORACLE_PERMS,
} from "../../vips/vip-666/bsctestnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";
import DEVIATION_SENTINEL_ABI from "./abi/DeviationSentinel.json";
import EBRAKE_ABI from "./abi/EBrake.json";
import SENTINEL_ORACLE_ABI from "./abi/SentinelOracle.json";

const FORK_BLOCK = 10761588;

const cfg = SEPOLIA_CONFIG;

// Trusted keepers in the new minimal VIP:
//   - SEPOLIA_GUARDIAN_OWNER: deployer EOA, drives the manual E2E test cycle
//   - cfg.keeper (= cfg.guardian on Sepolia): on-chain keeper backup
// These are two distinct addresses (GUARDIAN_OWNER ≠ GUARDIAN).
const TRUSTED_KEEPERS = [SEPOLIA_GUARDIAN_OWNER, cfg.keeper];

// RoleGranted events emitted by the unified 22-command VIP:
//   normalTimelock setTrustedKeeper perm on DS:    1
//   normalTimelock setTokenConfig perm on DS:      1
//   EBrake → Comptroller (4 sigs):                4
//   Sentinel → EBrake (3 sigs):                   3
//   Deployer extra (1 + 3 + 2):                   6
//                                                ---
//                                                 15
const EXPECTED_ROLE_GRANTED = 15;

forking(FORK_BLOCK, async () => {
  let acm: Contract;
  let deviationSentinel: Contract;
  let eBrake: Contract;
  let sentinelOracle: Contract;

  let impersonatedDeviationSentinel: SignerWithAddress;
  let impersonatedSentinelOracle: SignerWithAddress;
  let impersonatedComptroller: SignerWithAddress;

  before(async () => {
    acm = await ethers.getContractAt(ACCESS_CONTROL_MANAGER_ABI, cfg.acm);
    deviationSentinel = await ethers.getContractAt(DEVIATION_SENTINEL_ABI, cfg.deviationSentinel);
    eBrake = await ethers.getContractAt(EBRAKE_ABI, cfg.eBrake);
    sentinelOracle = await ethers.getContractAt(SENTINEL_ORACLE_ABI, cfg.sentinelOracle);

    impersonatedDeviationSentinel = await initMainnetUser(cfg.deviationSentinel, ethers.utils.parseEther("1"));
    impersonatedSentinelOracle = await initMainnetUser(cfg.sentinelOracle, ethers.utils.parseEther("1"));
    impersonatedComptroller = await initMainnetUser(cfg.comptroller, ethers.utils.parseEther("1"));
  });

  describe("VIP-666 [Sepolia] — Pre-VIP behaviour", () => {
    it("DeviationSentinel pendingOwner is Normal Timelock", async () => {
      expect(await deviationSentinel.pendingOwner()).to.equal(cfg.normalTimelock);
    });

    it("SentinelOracle pendingOwner is Normal Timelock", async () => {
      expect(await sentinelOracle.pendingOwner()).to.equal(cfg.normalTimelock);
    });

    it("EBrake pendingOwner is Normal Timelock", async () => {
      expect(await eBrake.pendingOwner()).to.equal(cfg.normalTimelock);
    });

    it("EBrake immutables are correctly set", async () => {
      expect(await eBrake.COMPTROLLER()).to.equal(cfg.comptroller);
      expect(await eBrake.IS_ISOLATED_POOL()).to.equal(true);
    });

    it("DeviationSentinel immutables wire to local EBrake + SentinelOracle", async () => {
      expect(await deviationSentinel.EBRAKE()).to.equal(cfg.eBrake);
      expect(await deviationSentinel.SENTINEL_ORACLE()).to.equal(cfg.sentinelOracle);
    });

    // Use hasPermission (not isAllowedToCall) to avoid false positives from wildcard
    // ACM grants already present on Sepolia testnet.
    it("EBrake has no permissions on the Comptroller yet", async () => {
      for (const sig of EBRAKE_COMPTROLLER_PERMS_IL) {
        expect(await acm.hasPermission(cfg.eBrake, cfg.comptroller, sig)).to.equal(false, `unexpected: ${sig}`);
      }
    });

    it("DeviationSentinel has no action permissions on EBrake yet", async () => {
      for (const sig of SENTINEL_EBRAKE_PERMS) {
        expect(await acm.hasPermission(cfg.deviationSentinel, cfg.eBrake, sig)).to.equal(false, `unexpected: ${sig}`);
      }
    });

    it("No accounts are whitelisted as trusted keepers yet", async () => {
      for (const account of TRUSTED_KEEPERS) {
        expect(await deviationSentinel.trustedKeepers(account)).to.equal(false);
      }
    });

    it("Deployer EOA has no extra permissions yet", async () => {
      for (const sig of DEPLOYER_SENTINEL_ORACLE_PERMS) {
        expect(await acm.hasPermission(SEPOLIA_GUARDIAN_OWNER, cfg.sentinelOracle, sig)).to.equal(false);
      }
      for (const sig of DEPLOYER_EBRAKE_PERMS) {
        expect(await acm.hasPermission(SEPOLIA_GUARDIAN_OWNER, cfg.eBrake, sig)).to.equal(false);
      }
      for (const sig of DEPLOYER_COMPTROLLER_PERMS) {
        expect(await acm.hasPermission(SEPOLIA_GUARDIAN_OWNER, cfg.comptroller, sig)).to.equal(false);
      }
    });

    it("WETH monitoring is not configured yet", async () => {
      const tc = await deviationSentinel.tokenConfigs(cfg.monitoredMarkets[0].token);
      expect(tc.deviation).to.equal(0);
      expect(tc.enabled).to.equal(false);
    });

    it("WBTC monitoring is not configured yet", async () => {
      const tc = await deviationSentinel.tokenConfigs(cfg.monitoredMarkets[1].token);
      expect(tc.deviation).to.equal(0);
      expect(tc.enabled).to.equal(false);
    });
  });

  testForkedNetworkVipCommands("VIP-666 [Sepolia] Minimal E2E Bootstrap", await vip666Sepolia(), {
    callbackAfterExecution: async txResponse => {
      // acceptOwnership(): DeviationSentinel + SentinelOracle + EBrake.
      // All three share the same OwnershipTransferred topic so any ABI catches all 3.
      await expectEvents(txResponse, [DEVIATION_SENTINEL_ABI], ["OwnershipTransferred"], [3]);

      // setTrustedKeeper: 2 accounts (GUARDIAN_OWNER + keeper/guardian)
      await expectEvents(txResponse, [DEVIATION_SENTINEL_ABI], ["TrustedKeeperUpdated"], [TRUSTED_KEEPERS.length]);

      // setTokenConfig: WETH + WBTC
      await expectEvents(txResponse, [DEVIATION_SENTINEL_ABI], ["TokenConfigUpdated"], [cfg.monitoredMarkets.length]);

      // RoleGranted: see EXPECTED_ROLE_GRANTED comment above
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["RoleGranted"], [EXPECTED_ROLE_GRANTED]);
    },
  });

  describe("VIP-666 [Sepolia] — Post-VIP behaviour", () => {
    describe("Ownership", () => {
      it("DeviationSentinel owner is Normal Timelock", async () => {
        expect(await deviationSentinel.owner()).to.equal(cfg.normalTimelock);
        expect(await deviationSentinel.pendingOwner()).to.equal(ZERO_ADDRESS);
      });

      it("SentinelOracle owner is Normal Timelock", async () => {
        expect(await sentinelOracle.owner()).to.equal(cfg.normalTimelock);
        expect(await sentinelOracle.pendingOwner()).to.equal(ZERO_ADDRESS);
      });

      it("EBrake owner is Normal Timelock", async () => {
        expect(await eBrake.owner()).to.equal(cfg.normalTimelock);
        expect(await eBrake.pendingOwner()).to.equal(ZERO_ADDRESS);
      });
    });

    describe("Permissions — EBrake → Comptroller", () => {
      it("EBrake has all four IL-supported permissions on the Comptroller", async () => {
        const a = acm.connect(impersonatedComptroller);
        for (const sig of EBRAKE_COMPTROLLER_PERMS_IL) {
          expect(await a.isAllowedToCall(cfg.eBrake, sig)).to.equal(true, `missing: ${sig}`);
        }
      });
    });

    describe("Permissions — Sentinel → EBrake", () => {
      it("DeviationSentinel has the three handleDeviation permissions on EBrake", async () => {
        for (const sig of SENTINEL_EBRAKE_PERMS) {
          expect(await acm.hasPermission(cfg.deviationSentinel, cfg.eBrake, sig)).to.equal(true, `missing: ${sig}`);
        }
      });
    });

    describe("Permissions — Diamond-only NOT granted", () => {
      it("Diamond-only EBrake permissions are not granted", async () => {
        for (const sig of DIAMOND_ONLY_EBRAKE_PERMS) {
          expect(await acm.hasPermission(cfg.deviationSentinel, cfg.eBrake, sig)).to.equal(
            false,
            `unexpected Diamond-only: ${sig}`,
          );
        }
      });
    });

    describe("Trusted keepers", () => {
      it("Deployer EOA and on-chain keeper are whitelisted", async () => {
        for (const account of TRUSTED_KEEPERS) {
          expect(await deviationSentinel.trustedKeepers(account)).to.equal(true, `not whitelisted: ${account}`);
        }
      });
    });

    describe("Deployer EOA extra permissions", () => {
      it("Deployer EOA has setDirectPrice on SentinelOracle", async () => {
        const a = acm.connect(impersonatedSentinelOracle);
        for (const sig of DEPLOYER_SENTINEL_ORACLE_PERMS) {
          expect(await a.isAllowedToCall(SEPOLIA_GUARDIAN_OWNER, sig)).to.equal(true, `missing: ${sig}`);
        }
      });

      it("Deployer EOA has reset perms on EBrake", async () => {
        for (const sig of DEPLOYER_EBRAKE_PERMS) {
          expect(await acm.hasPermission(SEPOLIA_GUARDIAN_OWNER, cfg.eBrake, sig)).to.equal(true, `missing: ${sig}`);
        }
      });

      it("Deployer EOA has setCollateralFactor + setActionsPaused on Comptroller", async () => {
        for (const sig of DEPLOYER_COMPTROLLER_PERMS) {
          expect(await acm.hasPermission(SEPOLIA_GUARDIAN_OWNER, cfg.comptroller, sig)).to.equal(
            true,
            `missing: ${sig}`,
          );
        }
      });
    });

    describe("Permissions — Normal Timelock can call DS functions used in this VIP", () => {
      it("Normal Timelock has setTrustedKeeper permission on DeviationSentinel", async () => {
        const a = acm.connect(impersonatedDeviationSentinel);
        expect(await a.isAllowedToCall(cfg.normalTimelock, "setTrustedKeeper(address,bool)")).to.equal(true);
      });

      it("Normal Timelock has setTokenConfig permission on DeviationSentinel", async () => {
        const a = acm.connect(impersonatedDeviationSentinel);
        expect(await a.isAllowedToCall(cfg.normalTimelock, "setTokenConfig(address,(uint8,bool))")).to.equal(true);
      });
    });

    describe("Market monitoring config", () => {
      it("WETH monitoring is enabled with 10% threshold", async () => {
        const market = cfg.monitoredMarkets[0];
        expect(market.symbol).to.equal("WETH");
        const tc = await deviationSentinel.tokenConfigs(market.token);
        expect(tc.deviation).to.equal(market.deviationPercent);
        expect(tc.enabled).to.equal(true);
      });

      it("WBTC monitoring is enabled with 10% threshold", async () => {
        const market = cfg.monitoredMarkets[1];
        expect(market.symbol).to.equal("WBTC");
        const tc = await deviationSentinel.tokenConfigs(market.token);
        expect(tc.deviation).to.equal(market.deviationPercent);
        expect(tc.enabled).to.equal(true);
      });

      it("SentinelOracle has no DEX oracle wired for WETH (direct price flow)", async () => {
        const tc = await sentinelOracle.tokenConfigs(cfg.monitoredMarkets[0].token);
        expect(tc.oracle ?? tc).to.equal(ZERO_ADDRESS);
      });

      it("SentinelOracle has no DEX oracle wired for WBTC (direct price flow)", async () => {
        const tc = await sentinelOracle.tokenConfigs(cfg.monitoredMarkets[1].token);
        expect(tc.oracle ?? tc).to.equal(ZERO_ADDRESS);
      });
    });
  });
});
