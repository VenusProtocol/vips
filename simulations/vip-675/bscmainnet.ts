import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testVip } from "src/vip-framework";

import vip675, { PLP, PRIME_LEADERBOARD, PRIME_V2 } from "../../vips/vip-675/bscmainnet";

const { bscmainnet } = NETWORK_ADDRESSES;

// Minimal inline ABIs — PrimeV2 / PrimeLeaderboard not deployed yet, so no
// generated ABI files exist. Copy full ABIs into ./abi once deployed and swap these out.
const OWNABLE2STEP_ABI = ["function owner() view returns (address)", "function pendingOwner() view returns (address)"];
const PLP_ABI = ["function prime() view returns (address)"];

// TODO: set to a block after PrimeV2 / PrimeLeaderboard are deployed on bscmainnet
const BLOCK_NUMBER = 0;

forking(BLOCK_NUMBER, async () => {
  let primeV2: Contract;
  let primeLeaderboard: Contract;
  let plp: Contract;

  before(async () => {
    primeV2 = new ethers.Contract(PRIME_V2, OWNABLE2STEP_ABI, ethers.provider);
    primeLeaderboard = new ethers.Contract(PRIME_LEADERBOARD, OWNABLE2STEP_ABI, ethers.provider);
    plp = new ethers.Contract(PLP, PLP_ABI, ethers.provider);
  });

  describe("Pre-VIP behavior", () => {
    it("PrimeV2 ownership pending on NormalTimelock (not accepted)", async () => {
      expect(await primeV2.pendingOwner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
    });

    it("PrimeLeaderboard ownership pending on NormalTimelock (not accepted)", async () => {
      expect(await primeLeaderboard.pendingOwner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
    });

    it("PLP prime token is not yet PrimeV2", async () => {
      expect(await plp.prime()).to.not.equal(PRIME_V2);
    });
  });

  testVip("VIP-675 PrimeV2 + PrimeLeaderboard setup", await vip675(), {
    callbackAfterExecution: async () => {
      // TODO: assert OwnershipTransferred / PermissionGranted / MarketAdded events
      // once PrimeV2 / PrimeLeaderboard ABIs are available
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

    it("Prime markets are configured on PrimeV2", async () => {
      // TODO: assert each addMarket entry exists with the expected multipliers
    });
  });
});
