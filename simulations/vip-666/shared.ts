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
  governanceAccounts,
} from "../../vips/vip-666/bscmainnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";
import DEVIATION_SENTINEL_ABI from "./abi/DeviationSentinel.json";
import EBRAKE_ABI from "./abi/EBrake.json";
import SENTINEL_ORACLE_ABI from "./abi/SentinelOracle.json";
import UNISWAP_ORACLE_ABI from "./abi/UniswapOracle.json";

// RoleGranted events emitted by VIP-666 (Sub-A) per chain.
// Sum of: admin grants (12+8+4) + ebrake→comptroller (4) + reset (12) + sentinel→ebrake (3)
// + multisig ebrake action (8) = 51. See buildChainCommandsA in vips/vip-666/bscmainnet.ts.
const PERMS_GRANTED_PER_CHAIN = 51;

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
  let impersonatedComptroller: SignerWithAddress;

  const govAccounts = governanceAccounts(cfg);
  const trustedKeeperAccounts = [cfg.keeper, ...govAccounts];

  before(async () => {
    acm = await ethers.getContractAt(ACCESS_CONTROL_MANAGER_ABI, cfg.acm);
    deviationSentinel = await ethers.getContractAt(DEVIATION_SENTINEL_ABI, cfg.deviationSentinel);
    eBrake = await ethers.getContractAt(EBRAKE_ABI, cfg.eBrake);
    sentinelOracle = await ethers.getContractAt(SENTINEL_ORACLE_ABI, cfg.sentinelOracle);
    uniswapOracle = await ethers.getContractAt(UNISWAP_ORACLE_ABI, cfg.uniswapOracle);

    impersonatedDeviationSentinel = await initMainnetUser(cfg.deviationSentinel, ethers.utils.parseEther("1"));
    impersonatedSentinelOracle = await initMainnetUser(cfg.sentinelOracle, ethers.utils.parseEther("1"));
    impersonatedUniswapOracle = await initMainnetUser(cfg.uniswapOracle, ethers.utils.parseEther("1"));
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
      for (const account of govAccounts) {
        for (const sig of SENTINEL_ADMIN_PERMS) {
          expect(await a.isAllowedToCall(account, sig)).to.equal(false, `unexpected ${sig} for ${account}`);
        }
      }
    });

    it("Guardian + Timelocks have no admin permissions on SentinelOracle yet", async () => {
      const a = acm.connect(impersonatedSentinelOracle);
      for (const account of govAccounts) {
        for (const sig of SENTINEL_ORACLE_ADMIN_PERMS) {
          expect(await a.isAllowedToCall(account, sig)).to.equal(false, `unexpected ${sig} for ${account}`);
        }
      }
    });

    it("Guardian + Timelocks have no admin permissions on UniswapOracle yet", async () => {
      const a = acm.connect(impersonatedUniswapOracle);
      for (const account of govAccounts) {
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
      for (const account of govAccounts) {
        for (const sig of RESET_PERMS) {
          expect(await acm.hasPermission(account, cfg.eBrake, sig)).to.equal(false, `unexpected ${sig} for ${account}`);
        }
      }
    });

    it("DeviationSentinel has no action permissions on EBrake yet", async () => {
      for (const sig of SENTINEL_EBRAKE_PERMS) {
        expect(await acm.hasPermission(cfg.deviationSentinel, cfg.eBrake, sig)).to.equal(false, `unexpected ${sig}`);
      }
    });

    it("Multisig Pauser has no EBrake action permissions yet", async () => {
      for (const sig of GOVERNANCE_EBRAKE_PERMS_IL) {
        expect(await acm.hasPermission(cfg.multisigPauser, cfg.eBrake, sig)).to.equal(false, `unexpected ${sig}`);
      }
    });

    it("No accounts are whitelisted as trusted keepers yet", async () => {
      for (const account of trustedKeeperAccounts) {
        expect(await deviationSentinel.trustedKeepers(account)).to.equal(false);
      }
    });
  });

  testForkedNetworkVipCommands(`VIP-666 [${cfg.name}] Bootstrap & Permissions`, await vip666(), {
    callbackAfterExecution: async txResponse => {
      // 4 acceptOwnership() calls per chain
      await expectEvents(txResponse, [DEVIATION_SENTINEL_ABI], ["OwnershipTransferred"], [4]);
      // 5 trusted keepers whitelisted per chain
      await expectEvents(txResponse, [DEVIATION_SENTINEL_ABI], ["TrustedKeeperUpdated"], [5]);
      // 51 RoleGranted events per chain (Sub-A only — governance EBrake actions deferred to VIP-667)
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
      for (const account of govAccounts) {
        for (const sig of SENTINEL_ADMIN_PERMS) {
          expect(await a.isAllowedToCall(account, sig)).to.equal(true, `missing ${sig} for ${account}`);
        }
      }
    });

    it("Guardian + Timelocks have all admin permissions on SentinelOracle", async () => {
      const a = acm.connect(impersonatedSentinelOracle);
      for (const account of govAccounts) {
        for (const sig of SENTINEL_ORACLE_ADMIN_PERMS) {
          expect(await a.isAllowedToCall(account, sig)).to.equal(true, `missing ${sig} for ${account}`);
        }
      }
    });

    it("Guardian + Timelocks have setPoolConfig permission on UniswapOracle", async () => {
      const a = acm.connect(impersonatedUniswapOracle);
      for (const account of govAccounts) {
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
      for (const account of govAccounts) {
        for (const sig of RESET_PERMS) {
          expect(await acm.hasPermission(account, cfg.eBrake, sig)).to.equal(true, `missing ${sig} for ${account}`);
        }
      }
    });

    it("DeviationSentinel has the three handleDeviation permissions on EBrake", async () => {
      for (const sig of SENTINEL_EBRAKE_PERMS) {
        expect(await acm.hasPermission(cfg.deviationSentinel, cfg.eBrake, sig)).to.equal(true, `missing ${sig}`);
      }
    });

    it("Multisig Pauser has all 8 IL-supported EBrake action permissions", async () => {
      for (const sig of GOVERNANCE_EBRAKE_PERMS_IL) {
        expect(await acm.hasPermission(cfg.multisigPauser, cfg.eBrake, sig)).to.equal(true, `missing ${sig}`);
      }
    });

    it("Diamond-only EBrake permissions are intentionally NOT granted", async () => {
      for (const account of govAccounts) {
        for (const sig of DIAMOND_ONLY_EBRAKE_PERMS) {
          expect(await acm.hasPermission(account, cfg.eBrake, sig)).to.equal(
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

    // Sub-A intentionally does NOT grant governance EBrake action perms or wire markets
    // — those land in VIP-667. Assert the deferred state explicitly so a regression is loud.
    it("Guardian + Timelocks still have no EBrake-specific action permissions (deferred to VIP-667)", async () => {
      for (const account of govAccounts) {
        for (const sig of GOVERNANCE_EBRAKE_PERMS_IL) {
          expect(await acm.hasPermission(account, cfg.eBrake, sig)).to.equal(
            false,
            `unexpected ${sig} for ${account} — should be granted by VIP-667`,
          );
        }
      }
    });

    for (const market of cfg.monitoredMarkets) {
      if (market.token === ZERO_ADDRESS || market.pool === ZERO_ADDRESS) continue;
      it(`${market.symbol} is still not wired (deferred to VIP-667)`, async () => {
        expect(await uniswapOracle.tokenPools(market.token)).to.equal(ZERO_ADDRESS);
        const tcSentinel = await sentinelOracle.tokenConfigs(market.token);
        expect(tcSentinel.oracle ?? tcSentinel).to.equal(ZERO_ADDRESS);
        const tcDev = await deviationSentinel.tokenConfigs(market.token);
        expect(tcDev.deviation).to.equal(0);
        expect(tcDev.enabled).to.equal(false);
      });
    }
  });
};
