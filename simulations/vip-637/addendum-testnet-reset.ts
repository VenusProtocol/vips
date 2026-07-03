import { expect } from "chai";
import { Contract, constants } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testVip } from "src/vip-framework";

import vip675Addendum3, { PRIME_LEADERBOARD, PRIME_V2 } from "../../vips/vip-637/addendum-testnet-reset";
import {
  COMPTROLLER,
  MINT_DEADLINE,
  MINT_THRESHOLD,
  PRIME_LEADERBOARD as OLD_PRIME_LEADERBOARD,
  PRIME_V2 as OLD_PRIME_V2,
  PLP,
  PRIME_MARKETS,
  XVS_VAULT,
} from "../../vips/vip-637/bsctestnet";

const { bsctestnet } = NETWORK_ADDRESSES;
const ACM_ABI = [
  "function hasRole(bytes32 role, address account) view returns (bool)",
  "event PermissionGranted(address account, address contractAddress, string functionSig)",
];
const VAULT_ABI = ["function primeToken() view returns (address)"];
const COMPTROLLER_ABI = ["function prime() view returns (address)"];

const PRIME_V2_ABI = [
  "function owner() view returns (address)",
  "function pendingOwner() view returns (address)",
  "function primeLeaderboard() view returns (address)",
  "function tokenLimit() view returns (uint256)",
  "function mintThreshold() view returns (uint256)",
  "function mintDeadline() view returns (uint256)",
  "function markets(address) view returns (uint256 supplyMultiplier, uint256 borrowMultiplier, uint256 rewardIndex, uint256 sumOfMembersScore, bool exists)",
  "event MarketAdded(address indexed market, uint256 supplyMultiplier, uint256 borrowMultiplier)",
  "event MintThresholdUpdated(uint256 oldThreshold, uint256 newThreshold, uint256 deadline)",
  "event PrimeLeaderboardSet(address indexed oldLeaderboard, address indexed newLeaderboard)",
];
const PRIME_LEADERBOARD_ABI = [
  "function owner() view returns (address)",
  "function pendingOwner() view returns (address)",
  "function primeV2() view returns (address)",
];
const PLP_ABI = ["function prime() view returns (address)"];

const BLOCK_NUMBER = 112386041;

const roleFor = (target: string, signature: string) =>
  ethers.utils.solidityKeccak256(["address", "string"], [target, signature]);

forking(BLOCK_NUMBER, async () => {
  let primeV2: Contract;
  let primeLeaderboard: Contract;
  let plp: Contract;
  let acm: Contract;
  let xvsVault: Contract;
  let comptroller: Contract;

  before(async () => {
    primeV2 = new ethers.Contract(PRIME_V2, PRIME_V2_ABI, ethers.provider);
    primeLeaderboard = new ethers.Contract(PRIME_LEADERBOARD, PRIME_LEADERBOARD_ABI, ethers.provider);
    plp = new ethers.Contract(PLP, PLP_ABI, ethers.provider);
    acm = new ethers.Contract(bsctestnet.ACCESS_CONTROL_MANAGER, ACM_ABI, ethers.provider);
    xvsVault = new ethers.Contract(XVS_VAULT, VAULT_ABI, ethers.provider);
    comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, ethers.provider);
  });

  describe("Pre-VIP behavior", () => {
    it("new PrimeV2 ownership pending on NormalTimelock (not accepted)", async () => {
      expect(await primeV2.pendingOwner()).to.equal(bsctestnet.NORMAL_TIMELOCK);
    });

    it("new PrimeLeaderboard ownership pending on NormalTimelock (not accepted)", async () => {
      expect(await primeLeaderboard.pendingOwner()).to.equal(bsctestnet.NORMAL_TIMELOCK);
    });

    it("new PrimeV2 <-> PrimeLeaderboard are not yet wired", async () => {
      expect(await primeV2.primeLeaderboard()).to.equal(constants.AddressZero);
      expect(await primeLeaderboard.primeV2()).to.equal(constants.AddressZero);
    });

    it("new PrimeV2 mint window is not yet open", async () => {
      expect(await primeV2.mintThreshold()).to.equal(0);
      expect(await primeV2.mintDeadline()).to.equal(0);
    });

    it("shared hooks still point at the OLD pair", async () => {
      expect(await plp.prime()).to.equal(OLD_PRIME_V2);
      expect(await xvsVault.primeToken()).to.equal(OLD_PRIME_LEADERBOARD);
      expect(await comptroller.prime()).to.equal(OLD_PRIME_V2);
    });
  });

  testVip("VIP-675 addendum 3 [Testnet] Re-wire to redeployed pair", await vip675Addendum3(), {
    callbackAfterExecution: async txResponse => {
      await expect(txResponse)
        .to.emit(primeV2, "PrimeLeaderboardSet")
        .withArgs(constants.AddressZero, PRIME_LEADERBOARD);
      await expect(txResponse).to.emit(primeV2, "MintThresholdUpdated").withArgs(0, MINT_THRESHOLD, MINT_DEADLINE);
      for (const market of PRIME_MARKETS) {
        await expect(txResponse)
          .to.emit(primeV2, "MarketAdded")
          .withArgs(market.vToken, market.supplyMultiplier, market.borrowMultiplier);
      }
      // Spot-check the Guardian's testnet-only resetCycle grant on the new PrimeV2.
      await expect(txResponse)
        .to.emit(acm, "PermissionGranted")
        .withArgs(bsctestnet.GUARDIAN, PRIME_V2, "resetCycle(address[])");
    },
  });

  describe("Post-VIP behavior", () => {
    it("new PrimeV2 owner is the NormalTimelock", async () => {
      expect(await primeV2.owner()).to.equal(bsctestnet.NORMAL_TIMELOCK);
    });

    it("new PrimeLeaderboard owner is the NormalTimelock", async () => {
      expect(await primeLeaderboard.owner()).to.equal(bsctestnet.NORMAL_TIMELOCK);
    });

    it("new PrimeV2 <-> PrimeLeaderboard are wired", async () => {
      expect(await primeV2.primeLeaderboard()).to.equal(PRIME_LEADERBOARD);
      expect(await primeLeaderboard.primeV2()).to.equal(PRIME_V2);
    });

    it("new PrimeV2 mint window is configured", async () => {
      expect(await primeV2.mintThreshold()).to.equal(MINT_THRESHOLD);
      expect(await primeV2.mintDeadline()).to.equal(MINT_DEADLINE);
    });

    it("shared hooks repointed to the NEW pair", async () => {
      expect(await plp.prime()).to.equal(PRIME_V2);
      expect(await xvsVault.primeToken()).to.equal(PRIME_LEADERBOARD);
      expect(await comptroller.prime()).to.equal(PRIME_V2);
    });

    it("Guardian holds epoch + resetCycle perms on the new PrimeV2", async () => {
      for (const sig of [
        "issue(address)",
        "issueBatch(address[])",
        "burn(address)",
        "burnBatch(address[])",
        "setMintThreshold(uint256,uint256)",
        "recordCycleSnapshot(uint256)",
        "resetCycle(address[])",
      ]) {
        expect(await acm.hasRole(roleFor(PRIME_V2, sig), bsctestnet.GUARDIAN)).to.equal(true);
      }
    });

    it("Guardian holds seeding + resetCycle perms on the new PrimeLeaderboard", async () => {
      for (const sig of [
        "initializeStakers(address[],uint256[],uint64[])",
        "finalizeInitialization()",
        "resetCycle(address[])",
      ]) {
        expect(await acm.hasRole(roleFor(PRIME_LEADERBOARD, sig), bsctestnet.GUARDIAN)).to.equal(true);
      }
    });

    for (const market of PRIME_MARKETS) {
      it(`market ${market.vToken} is configured on the new PrimeV2`, async () => {
        const m = await primeV2.markets(market.vToken);
        expect(m.exists).to.equal(true);
        expect(m.supplyMultiplier).to.equal(market.supplyMultiplier);
        expect(m.borrowMultiplier).to.equal(market.borrowMultiplier);
      });
    }
  });
});
