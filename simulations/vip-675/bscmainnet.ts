import { expect } from "chai";
import { Contract, constants } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, pretendExecutingVip, testVip } from "src/vip-framework";

import {
  BSCMAINNET_MULTISIG_PAUSER,
  COMPTROLLER,
  KEEPER,
  LEGACY_PRIME,
  PLP,
  PLP_DISTRIBUTION_SPEEDS,
  PRIME_LEADERBOARD,
  PRIME_MARKETS,
  PRIME_V2,
  XVS_VAULT,
  default as vip675,
} from "../../vips/vip-675/bscmainnet";
import vip675Critical from "../../vips/vip-675/bscmainnet-critical";
import ACM_FULL_ABI from "./abi/AccessControlManager.json";

const { bscmainnet } = NETWORK_ADDRESSES;

const ACM_ABI = [
  "function hasRole(bytes32 role, address account) view returns (bool)",
  "event PermissionGranted(address account, address contractAddress, string functionSig)",
];

const PRIME_V2_ABI = [
  "function owner() view returns (address)",
  "function pendingOwner() view returns (address)",
  "function primeLeaderboard() view returns (address)",
  "function tokenLimit() view returns (uint256)",
  "function mintThreshold() view returns (uint256)",
  "function mintDeadline() view returns (uint256)",
  "function markets(address) view returns (uint256 supplyMultiplier, uint256 borrowMultiplier, uint256 rewardIndex, uint256 sumOfMembersScore, bool exists)",
  "event MarketAdded(address indexed market, uint256 supplyMultiplier, uint256 borrowMultiplier)",
  "event PrimeLeaderboardSet(address indexed oldLeaderboard, address indexed newLeaderboard)",
];

const PRIME_LEADERBOARD_ABI = [
  "function owner() view returns (address)",
  "function pendingOwner() view returns (address)",
  "function primeV2() view returns (address)",
];

const PLP_ABI = [
  "function prime() view returns (address)",
  "function tokenDistributionSpeeds(address) view returns (uint256)",
  "function setTokensDistributionSpeed(address[],uint256[])",
];
const LEGACY_PRIME_ABI = ["function paused() view returns (bool)"];
const VAULT_ABI = [
  "function primeToken() view returns (address)",
  "function vaultPaused() view returns (bool)",
  "function pause()",
];
const COMPTROLLER_ABI = ["function prime() view returns (address)"];

const BLOCK_NUMBER = 105868057;

const KEEPER_CYCLE_SIGS_V2 = [
  "issue(address)",
  "issueBatch(address[])",
  "burn(address)",
  "burnBatch(address[])",
  "recordCycleSnapshot(uint256)",
];

// setMintThreshold is governance + Venus Guardian multisig only (NOT the Keeper).
const MINT_THRESHOLD_SIG = "setMintThreshold(uint256,uint256)";

const KEEPER_CYCLE_SIGS_LEADERBOARD = ["initializeStakers(address[],uint256[],uint64[])", "finalizeInitialization()"];

const NT_ONLY_SIGS_V2 = [
  "setPrimeLeaderboard(address)",
  "addMarket(address,uint256,uint256)",
  "removeMarket(address)",
  "setLimit(uint256)",
  "updateAlpha(uint128,uint128)",
  "updateMultipliers(address,uint256,uint256)",
  "setMaxLoopsLimit(uint256)",
  "sweepUndistributed(address,address)",
];

const NT_ONLY_SIGS_LEADERBOARD = [
  "setMultiplierTiers(uint256[],uint256[])",
  "setPrimeV2(address)",
  "setMaxLoopsLimit(uint256)",
];

forking(BLOCK_NUMBER, async () => {
  let primeV2: Contract;
  let primeLeaderboard: Contract;
  let plp: Contract;
  let legacyPrime: Contract;
  let acm: Contract;
  let xvsVault: Contract;
  let comptroller: Contract;

  before(async () => {
    primeV2 = new ethers.Contract(PRIME_V2, PRIME_V2_ABI, ethers.provider);
    primeLeaderboard = new ethers.Contract(PRIME_LEADERBOARD, PRIME_LEADERBOARD_ABI, ethers.provider);
    plp = new ethers.Contract(PLP, PLP_ABI, ethers.provider);
    legacyPrime = new ethers.Contract(LEGACY_PRIME, LEGACY_PRIME_ABI, ethers.provider);
    acm = new ethers.Contract(bscmainnet.ACCESS_CONTROL_MANAGER, ACM_ABI, ethers.provider);
    xvsVault = new ethers.Contract(XVS_VAULT, VAULT_ABI, ethers.provider);
    comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, ethers.provider);

    // Run the preceding critical VIP (vip-675/bscmainnet-critical.ts) so this VIP
    // executes against the real prior state: XVS Vault paused and every Prime
    // underlying's PLP distribution speed zeroed. Commands run through the
    // CriticalTimelock, which holds the pause() and setTokensDistributionSpeed perms.
    await pretendExecutingVip(await vip675Critical(), bscmainnet.CRITICAL_TIMELOCK);
  });

  const roleFor = (target: string, signature: string) =>
    ethers.utils.solidityKeccak256(["address", "string"], [target, signature]);

  describe("Pre-VIP behavior", () => {
    it("PrimeV2 ownership pending on NormalTimelock (not accepted)", async () => {
      expect(await primeV2.pendingOwner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
    });

    it("PrimeLeaderboard ownership pending on NormalTimelock (not accepted)", async () => {
      expect(await primeLeaderboard.pendingOwner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
    });

    it("PLP prime token is still the legacy Prime", async () => {
      expect(await plp.prime()).to.equal(LEGACY_PRIME);
    });

    it("PrimeV2 <-> PrimeLeaderboard are not yet wired", async () => {
      expect(await primeV2.primeLeaderboard()).to.equal(constants.AddressZero);
      expect(await primeLeaderboard.primeV2()).to.equal(constants.AddressZero);
    });

    it("PrimeV2 mint window is uninitialized", async () => {
      expect(await primeV2.mintThreshold()).to.equal(0);
      expect(await primeV2.mintDeadline()).to.equal(0);
    });

    it("legacy Prime is active (unpaused)", async () => {
      expect(await legacyPrime.paused()).to.equal(false);
    });

    it("XVSVault prime hook still points at legacy Prime", async () => {
      expect(await xvsVault.primeToken()).to.equal(LEGACY_PRIME);
    });

    it("XVSVault is already paused (by the preceding critical VIP)", async () => {
      expect(await xvsVault.vaultPaused()).to.equal(true);
    });

    it("Comptroller prime still points at legacy Prime", async () => {
      expect(await comptroller.prime()).to.equal(LEGACY_PRIME);
    });

    it("PLP distribution speeds are zeroed (by the preceding critical VIP)", async () => {
      for (const { token } of PLP_DISTRIBUTION_SPEEDS) {
        expect(await plp.tokenDistributionSpeeds(token)).to.equal(0);
      }
    });
  });

  testVip("VIP-675 PrimeV2 + PrimeLeaderboard setup", await vip675(), {
    callbackAfterExecution: async txResponse => {
      await expect(txResponse)
        .to.emit(primeV2, "PrimeLeaderboardSet")
        .withArgs(constants.AddressZero, PRIME_LEADERBOARD);
      for (const market of PRIME_MARKETS) {
        await expect(txResponse)
          .to.emit(primeV2, "MarketAdded")
          .withArgs(market.vToken, market.supplyMultiplier, market.borrowMultiplier);
      }
      // RoleGranted count breakdown:
      //   PrimeV2:    15 cycle (5×3) + 2 setMintThreshold (NT + Guardian) + 8 admin
      //               + 6 pause/unpause (2×3) + 1 multisig pauser                          = 32
      //   Leaderboard: 6 seeding (2×3) + 3 admin                                            = 9
      //   XVSVault:   1 multisig pauser                                                     = 1
      //   Total                                                                              = 42
      await expectEvents(txResponse, [ACM_FULL_ABI], ["RoleGranted"], [42]);
    },
  });

  describe("Post-VIP behavior", () => {
    it("PrimeV2 owner is the NormalTimelock", async () => {
      expect(await primeV2.owner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
    });

    it("PrimeLeaderboard owner is the NormalTimelock", async () => {
      expect(await primeLeaderboard.owner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
    });

    it("PLP points at PrimeV2", async () => {
      expect(await plp.prime()).to.equal(PRIME_V2);
    });

    it("PrimeV2 <-> PrimeLeaderboard are wired", async () => {
      expect(await primeV2.primeLeaderboard()).to.equal(PRIME_LEADERBOARD);
      expect(await primeLeaderboard.primeV2()).to.equal(PRIME_V2);
    });

    it("PrimeV2 token limit is the initializer default (500)", async () => {
      expect(await primeV2.tokenLimit()).to.equal(500);
    });

    it("PrimeV2 mint window is left uninitialized", async () => {
      expect(await primeV2.mintThreshold()).to.equal(0);
      expect(await primeV2.mintDeadline()).to.equal(0);
    });

    it("XVSVault prime hook points at PrimeLeaderboard", async () => {
      expect(await xvsVault.primeToken()).to.equal(PRIME_LEADERBOARD);
    });

    it("XVSVault stays paused (awaiting off-chain staker seeding)", async () => {
      expect(await xvsVault.vaultPaused()).to.equal(true);
    });

    it("Comptroller prime points at PrimeV2", async () => {
      expect(await comptroller.prime()).to.equal(PRIME_V2);
    });

    it("PLP distribution speeds restored for USDT and WBNB", async () => {
      for (const { token, speed } of PLP_DISTRIBUTION_SPEEDS) {
        expect(await plp.tokenDistributionSpeeds(token)).to.equal(speed);
      }
    });

    it("legacy Prime is decommissioned (paused)", async () => {
      expect(await legacyPrime.paused()).to.equal(true);
    });

    for (const account of [bscmainnet.NORMAL_TIMELOCK, KEEPER, bscmainnet.GUARDIAN]) {
      it(`account ${account} holds the cycle permissions on PrimeV2`, async () => {
        for (const sig of KEEPER_CYCLE_SIGS_V2) {
          expect(await acm.hasRole(roleFor(PRIME_V2, sig), account)).to.equal(true);
        }
      });

      it(`account ${account} holds the seeding permissions on PrimeLeaderboard`, async () => {
        for (const sig of KEEPER_CYCLE_SIGS_LEADERBOARD) {
          expect(await acm.hasRole(roleFor(PRIME_LEADERBOARD, sig), account)).to.equal(true);
        }
      });
    }

    it("setMintThreshold is held by the NormalTimelock and the Guardian multisig only", async () => {
      expect(await acm.hasRole(roleFor(PRIME_V2, MINT_THRESHOLD_SIG), bscmainnet.NORMAL_TIMELOCK)).to.equal(true);
      expect(await acm.hasRole(roleFor(PRIME_V2, MINT_THRESHOLD_SIG), bscmainnet.GUARDIAN)).to.equal(true);
    });

    it("Keeper does NOT hold setMintThreshold on PrimeV2", async () => {
      expect(await acm.hasRole(roleFor(PRIME_V2, MINT_THRESHOLD_SIG), KEEPER)).to.equal(false);
    });

    it("Keeper does NOT hold the admin-only permissions on PrimeV2", async () => {
      for (const sig of NT_ONLY_SIGS_V2) {
        expect(await acm.hasRole(roleFor(PRIME_V2, sig), KEEPER)).to.equal(false);
      }
    });

    it("Keeper does NOT hold the admin-only permissions on PrimeLeaderboard", async () => {
      for (const sig of NT_ONLY_SIGS_LEADERBOARD) {
        expect(await acm.hasRole(roleFor(PRIME_LEADERBOARD, sig), KEEPER)).to.equal(false);
      }
    });

    it("Guardian holds the XVSVault resume() permission", async () => {
      expect(await acm.hasRole(roleFor(XVS_VAULT, "resume()"), bscmainnet.GUARDIAN)).to.equal(true);
    });

    it("Venus team multisig holds the circuit-breaker pause() permissions", async () => {
      expect(await acm.hasRole(roleFor(PRIME_V2, "pause()"), BSCMAINNET_MULTISIG_PAUSER)).to.equal(true);
      expect(await acm.hasRole(roleFor(XVS_VAULT, "pause()"), BSCMAINNET_MULTISIG_PAUSER)).to.equal(true);
    });

    for (const market of PRIME_MARKETS) {
      it(`market ${market.vToken} is configured on PrimeV2`, async () => {
        const m = await primeV2.markets(market.vToken);
        expect(m.exists).to.equal(true);
        expect(m.supplyMultiplier).to.equal(market.supplyMultiplier);
        expect(m.borrowMultiplier).to.equal(market.borrowMultiplier);
      });
    }
  });
});
