import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { ZERO_ADDRESS } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { testForkedNetworkVipCommands } from "src/vip-framework";

import vip666, {
  ChainConfig,
  DIAMOND_ONLY_EBRAKE_PERMS,
  EBRAKE_COMPTROLLER_PERMS_IL,
  GOVERNANCE_EBRAKE_PERMS_IL,
  RESET_PERMS,
  SENTINEL_ADMIN_PERMS,
  SENTINEL_EBRAKE_PERMS,
  SENTINEL_ORACLE_ADMIN_PERMS,
  UNISWAP_ORACLE_ADMIN_PERMS,
} from "../../vips/vip-666/bscmainnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";
import DEVIATION_SENTINEL_ABI from "./abi/DeviationSentinel.json";
import EBRAKE_ABI from "./abi/EBrake.json";
import SENTINEL_ORACLE_ABI from "./abi/SentinelOracle.json";
import UNISWAP_ORACLE_ABI from "./abi/UniswapOracle.json";

// Total RoleGranted events per chain when no token wiring runs:
//   3 (sentinel admin) × 4 + 2 (sentinel oracle admin) × 4 + 1 (uniswap oracle admin) × 4
//   + 4 (ebrake → comptroller) + 3 (reset) × 4 + 3 (sentinel → ebrake)
//   + 8 (governance ebrake action) × 4 + 8 (multisig ebrake action)
//   = 12 + 8 + 4 + 4 + 12 + 3 + 32 + 8 = 83
const PERMS_GRANTED_PER_CHAIN = 83;

const collectMissingPlaceholders = (cfg: ChainConfig): string[] => {
  const missing: string[] = [];
  if (cfg.deviationSentinel === ZERO_ADDRESS) missing.push("deviationSentinel");
  if (cfg.eBrake === ZERO_ADDRESS) missing.push("eBrake");
  if (cfg.sentinelOracle === ZERO_ADDRESS) missing.push("sentinelOracle");
  if (cfg.uniswapOracle === ZERO_ADDRESS) missing.push("uniswapOracle");
  if (cfg.multisigPauser === ZERO_ADDRESS) missing.push("multisigPauser");
  if (cfg.keeper === ZERO_ADDRESS) missing.push("keeper");
  return missing;
};

export const runVip666Suite = async (cfg: ChainConfig) => {
  const missing = collectMissingPlaceholders(cfg);
  if (missing.length > 0) {
    describe.skip(`VIP-666 [${cfg.name}] — placeholder addresses missing: ${missing.join(", ")}`, () => {
      it(`Fill ${missing.join(", ")} in addresses/${cfg.name
        .toLowerCase()
        .replace(/\s/g, "")}.ts to run this suite`, () => {
        // intentionally empty — skip stub
      });
    });
    return;
  }

  let acm: Contract;
  let deviationSentinel: Contract;
  let eBrake: Contract;
  let sentinelOracle: Contract;
  let uniswapOracle: Contract;

  // ACM.isAllowedToCall(account, sig) checks msg.sender as the host contract.
  // Impersonate each host so the role lookup resolves correctly.
  let impersonatedDeviationSentinel: SignerWithAddress;
  let impersonatedSentinelOracle: SignerWithAddress;
  let impersonatedUniswapOracle: SignerWithAddress;
  let impersonatedEBrake: SignerWithAddress;
  let impersonatedComptroller: SignerWithAddress;

  const governanceAccounts = [cfg.guardian, cfg.normalTimelock, cfg.fastTrackTimelock, cfg.criticalTimelock];
  const trustedKeeperAccounts = [cfg.keeper, ...governanceAccounts];

  before(async () => {
    acm = await ethers.getContractAt(ACCESS_CONTROL_MANAGER_ABI, cfg.acm);
    deviationSentinel = await ethers.getContractAt(DEVIATION_SENTINEL_ABI, cfg.deviationSentinel);
    eBrake = await ethers.getContractAt(EBRAKE_ABI, cfg.eBrake);
    sentinelOracle = await ethers.getContractAt(SENTINEL_ORACLE_ABI, cfg.sentinelOracle);
    uniswapOracle = await ethers.getContractAt(UNISWAP_ORACLE_ABI, cfg.uniswapOracle);

    impersonatedDeviationSentinel = await initMainnetUser(cfg.deviationSentinel, ethers.utils.parseEther("1"));
    impersonatedSentinelOracle = await initMainnetUser(cfg.sentinelOracle, ethers.utils.parseEther("1"));
    impersonatedUniswapOracle = await initMainnetUser(cfg.uniswapOracle, ethers.utils.parseEther("1"));
    impersonatedEBrake = await initMainnetUser(cfg.eBrake, ethers.utils.parseEther("1"));
    impersonatedComptroller = await initMainnetUser(cfg.comptroller, ethers.utils.parseEther("1"));
  });

  describe(`VIP-666 [${cfg.name}] — Pre-VIP behaviour`, () => {
    it("DeviationSentinel pendingOwner is Normal Timelock", async () => {
      expect(await deviationSentinel.pendingOwner()).to.equal(cfg.normalTimelock);
    });

    it("SentinelOracle pendingOwner is Normal Timelock", async () => {
      expect(await sentinelOracle.pendingOwner()).to.equal(cfg.normalTimelock);
    });

    it("UniswapOracle pendingOwner is Normal Timelock", async () => {
      expect(await uniswapOracle.pendingOwner()).to.equal(cfg.normalTimelock);
    });

    it("EBrake pendingOwner is Normal Timelock", async () => {
      expect(await eBrake.pendingOwner()).to.equal(cfg.normalTimelock);
    });

    it("EBrake immutables are correctly set for IL", async () => {
      expect(await eBrake.COMPTROLLER()).to.equal(cfg.comptroller);
      expect(await eBrake.IS_ISOLATED_POOL()).to.equal(true);
    });

    it("DeviationSentinel immutables wire to local EBrake + SentinelOracle", async () => {
      expect(await deviationSentinel.EBRAKE()).to.equal(cfg.eBrake);
      expect(await deviationSentinel.SENTINEL_ORACLE()).to.equal(cfg.sentinelOracle);
    });

    it("Guardian + Timelocks have no admin permissions on DeviationSentinel yet", async () => {
      const a = acm.connect(impersonatedDeviationSentinel);
      for (const account of governanceAccounts) {
        for (const sig of SENTINEL_ADMIN_PERMS) {
          expect(await a.isAllowedToCall(account, sig)).to.equal(false, `unexpected ${sig} for ${account}`);
        }
      }
    });

    it("Guardian + Timelocks have no admin permissions on SentinelOracle yet", async () => {
      const a = acm.connect(impersonatedSentinelOracle);
      for (const account of governanceAccounts) {
        for (const sig of SENTINEL_ORACLE_ADMIN_PERMS) {
          expect(await a.isAllowedToCall(account, sig)).to.equal(false, `unexpected ${sig} for ${account}`);
        }
      }
    });

    it("Guardian + Timelocks have no admin permissions on UniswapOracle yet", async () => {
      const a = acm.connect(impersonatedUniswapOracle);
      for (const account of governanceAccounts) {
        for (const sig of UNISWAP_ORACLE_ADMIN_PERMS) {
          expect(await a.isAllowedToCall(account, sig)).to.equal(false, `unexpected ${sig} for ${account}`);
        }
      }
    });

    it("EBrake has no permissions on the IL Comptroller yet", async () => {
      const a = acm.connect(impersonatedComptroller);
      for (const sig of EBRAKE_COMPTROLLER_PERMS_IL) {
        expect(await a.isAllowedToCall(cfg.eBrake, sig)).to.equal(false, `unexpected ${sig}`);
      }
    });

    it("Guardian + Timelocks have no reset permissions on EBrake yet", async () => {
      const a = acm.connect(impersonatedEBrake);
      for (const account of governanceAccounts) {
        for (const sig of RESET_PERMS) {
          expect(await a.isAllowedToCall(account, sig)).to.equal(false, `unexpected ${sig} for ${account}`);
        }
      }
    });

    it("DeviationSentinel has no action permissions on EBrake yet", async () => {
      const a = acm.connect(impersonatedEBrake);
      for (const sig of SENTINEL_EBRAKE_PERMS) {
        expect(await a.isAllowedToCall(cfg.deviationSentinel, sig)).to.equal(false, `unexpected ${sig}`);
      }
    });

    it("Guardian + Timelocks have no EBrake action permissions yet", async () => {
      const a = acm.connect(impersonatedEBrake);
      for (const account of governanceAccounts) {
        for (const sig of GOVERNANCE_EBRAKE_PERMS_IL) {
          expect(await a.isAllowedToCall(account, sig)).to.equal(false, `unexpected ${sig} for ${account}`);
        }
      }
    });

    it("Multisig Pauser has no EBrake action permissions yet", async () => {
      const a = acm.connect(impersonatedEBrake);
      for (const sig of GOVERNANCE_EBRAKE_PERMS_IL) {
        expect(await a.isAllowedToCall(cfg.multisigPauser, sig)).to.equal(false, `unexpected ${sig}`);
      }
    });

    it("No accounts are whitelisted as trusted keepers yet", async () => {
      for (const account of trustedKeeperAccounts) {
        expect(await deviationSentinel.trustedKeepers(account)).to.equal(false);
      }
    });

    if (cfg.monitoredToken !== ZERO_ADDRESS) {
      it("Monitored token has no pool configured on UniswapOracle yet", async () => {
        expect(await uniswapOracle.tokenPools(cfg.monitoredToken)).to.equal(ZERO_ADDRESS);
      });

      it("Monitored token has no oracle configured on SentinelOracle yet", async () => {
        const tc = await sentinelOracle.tokenConfigs(cfg.monitoredToken);
        // tokenConfigs returns an address (the oracle address) packed as a struct;
        // accessing .oracle works whether the ABI exposes it as a struct or just a single value.
        expect(tc.oracle ?? tc).to.equal(ZERO_ADDRESS);
      });

      it("Monitored token has no deviation config on DeviationSentinel yet", async () => {
        const tc = await deviationSentinel.tokenConfigs(cfg.monitoredToken);
        expect(tc.deviation).to.equal(0);
        expect(tc.enabled).to.equal(false);
      });
    }
  });

  testForkedNetworkVipCommands(`VIP-666 [${cfg.name}] Configure DeviationSentinel + EBrakeV2`, await vip666(), {
    callbackAfterExecution: async txResponse => {
      // 4 acceptOwnership() calls per chain
      await expectEvents(txResponse, [DEVIATION_SENTINEL_ABI], ["OwnershipTransferred"], [4]);
      // 5 trusted keepers whitelisted per chain
      await expectEvents(txResponse, [DEVIATION_SENTINEL_ABI], ["TrustedKeeperUpdated"], [5]);
      // 83 RoleGranted events per chain (token wiring not counted; gated by monitoredToken)
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["RoleGranted"], [PERMS_GRANTED_PER_CHAIN]);
    },
  });

  describe(`VIP-666 [${cfg.name}] — Post-VIP behaviour`, () => {
    it("All four contracts have Normal Timelock as owner", async () => {
      expect(await deviationSentinel.owner()).to.equal(cfg.normalTimelock);
      expect(await sentinelOracle.owner()).to.equal(cfg.normalTimelock);
      expect(await uniswapOracle.owner()).to.equal(cfg.normalTimelock);
      expect(await eBrake.owner()).to.equal(cfg.normalTimelock);
    });

    it("All four contracts have AddressZero as pendingOwner (acceptOwnership cleared it)", async () => {
      expect(await deviationSentinel.pendingOwner()).to.equal(ZERO_ADDRESS);
      expect(await sentinelOracle.pendingOwner()).to.equal(ZERO_ADDRESS);
      expect(await uniswapOracle.pendingOwner()).to.equal(ZERO_ADDRESS);
      expect(await eBrake.pendingOwner()).to.equal(ZERO_ADDRESS);
    });

    it("Guardian + Timelocks have all admin permissions on DeviationSentinel", async () => {
      const a = acm.connect(impersonatedDeviationSentinel);
      for (const account of governanceAccounts) {
        for (const sig of SENTINEL_ADMIN_PERMS) {
          expect(await a.isAllowedToCall(account, sig)).to.equal(true, `missing ${sig} for ${account}`);
        }
      }
    });

    it("Guardian + Timelocks have all admin permissions on SentinelOracle", async () => {
      const a = acm.connect(impersonatedSentinelOracle);
      for (const account of governanceAccounts) {
        for (const sig of SENTINEL_ORACLE_ADMIN_PERMS) {
          expect(await a.isAllowedToCall(account, sig)).to.equal(true, `missing ${sig} for ${account}`);
        }
      }
    });

    it("Guardian + Timelocks have setPoolConfig permission on UniswapOracle", async () => {
      const a = acm.connect(impersonatedUniswapOracle);
      for (const account of governanceAccounts) {
        for (const sig of UNISWAP_ORACLE_ADMIN_PERMS) {
          expect(await a.isAllowedToCall(account, sig)).to.equal(true, `missing ${sig} for ${account}`);
        }
      }
    });

    it("EBrake has all four IL-supported permissions on the local IL Comptroller", async () => {
      const a = acm.connect(impersonatedComptroller);
      for (const sig of EBRAKE_COMPTROLLER_PERMS_IL) {
        expect(await a.isAllowedToCall(cfg.eBrake, sig)).to.equal(true, `missing ${sig}`);
      }
    });

    it("Guardian + Timelocks have all reset permissions on EBrake", async () => {
      const a = acm.connect(impersonatedEBrake);
      for (const account of governanceAccounts) {
        for (const sig of RESET_PERMS) {
          expect(await a.isAllowedToCall(account, sig)).to.equal(true, `missing ${sig} for ${account}`);
        }
      }
    });

    it("DeviationSentinel has the three handleDeviation permissions on EBrake", async () => {
      const a = acm.connect(impersonatedEBrake);
      for (const sig of SENTINEL_EBRAKE_PERMS) {
        expect(await a.isAllowedToCall(cfg.deviationSentinel, sig)).to.equal(true, `missing ${sig}`);
      }
    });

    it("Guardian + Timelocks have all 8 IL-supported EBrake action permissions", async () => {
      const a = acm.connect(impersonatedEBrake);
      for (const account of governanceAccounts) {
        for (const sig of GOVERNANCE_EBRAKE_PERMS_IL) {
          expect(await a.isAllowedToCall(account, sig)).to.equal(true, `missing ${sig} for ${account}`);
        }
      }
    });

    it("Multisig Pauser has all 8 IL-supported EBrake action permissions", async () => {
      const a = acm.connect(impersonatedEBrake);
      for (const sig of GOVERNANCE_EBRAKE_PERMS_IL) {
        expect(await a.isAllowedToCall(cfg.multisigPauser, sig)).to.equal(true, `missing ${sig}`);
      }
    });

    it("Diamond-only EBrake permissions are intentionally NOT granted", async () => {
      const a = acm.connect(impersonatedEBrake);
      for (const account of governanceAccounts) {
        for (const sig of DIAMOND_ONLY_EBRAKE_PERMS) {
          expect(await a.isAllowedToCall(account, sig)).to.equal(
            false,
            `Diamond-only ${sig} unexpectedly granted to ${account}`,
          );
        }
      }
    });

    it("Keeper + Guardian + Timelocks are whitelisted as trusted keepers on DeviationSentinel", async () => {
      for (const account of trustedKeeperAccounts) {
        expect(await deviationSentinel.trustedKeepers(account)).to.equal(true);
      }
    });

    if (cfg.monitoredToken !== ZERO_ADDRESS) {
      it("Monitored token's pool is configured on UniswapOracle", async () => {
        expect(await uniswapOracle.tokenPools(cfg.monitoredToken)).to.equal(cfg.monitoredPool);
      });

      it("Monitored token's oracle is configured on SentinelOracle", async () => {
        const tc = await sentinelOracle.tokenConfigs(cfg.monitoredToken);
        expect(tc.oracle ?? tc).to.equal(cfg.uniswapOracle);
      });

      it("Monitored token's deviation threshold is configured on DeviationSentinel", async () => {
        const tc = await deviationSentinel.tokenConfigs(cfg.monitoredToken);
        expect(tc.deviation).to.equal(cfg.deviationPercent);
        expect(tc.enabled).to.equal(true);
      });
    }
  });

  describe(`VIP-666 [${cfg.name}] — Functional sanity checks`, () => {
    let randomEoa: SignerWithAddress;
    let normalTimelockSigner: SignerWithAddress;

    before(async () => {
      [randomEoa] = await ethers.getSigners();
      normalTimelockSigner = await initMainnetUser(cfg.normalTimelock, ethers.utils.parseEther("10"));
    });

    it("Random EOA cannot call DeviationSentinel.setTrustedKeeper (no ACM perm)", async () => {
      await expect(deviationSentinel.connect(randomEoa).setTrustedKeeper(randomEoa.address, true)).to.be.reverted;
    });

    it("Normal Timelock can call DeviationSentinel.setTrustedKeeper (perm granted by VIP)", async () => {
      const probe = ethers.Wallet.createRandom().address;
      await expect(deviationSentinel.connect(normalTimelockSigner).setTrustedKeeper(probe, true))
        .to.emit(deviationSentinel, "TrustedKeeperUpdated")
        .withArgs(probe, true);
      expect(await deviationSentinel.trustedKeepers(probe)).to.equal(true);
    });

    it("Random EOA cannot call EBrake.pauseBorrow (no ACM perm)", async () => {
      const market = ethers.Wallet.createRandom().address;
      await expect(eBrake.connect(randomEoa).pauseBorrow(market)).to.be.reverted;
    });

    it("DeviationSentinel.handleDeviation reverts UnauthorizedKeeper for a non-keeper EOA", async () => {
      const market = ethers.Wallet.createRandom().address;
      await expect(deviationSentinel.connect(randomEoa).handleDeviation(market)).to.be.reverted;
    });
  });
};
