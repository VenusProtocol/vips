import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";

import { forking, testVip } from "../../src/vip-framework";
import vip778Addendum, {
  BSCTESTNET_NEW_VTOKEN_IMPLEMENTATION,
  BSCTESTNET_VPLANET_BEACON,
  BSCTESTNET_VSLIS_BEACON,
  BSCTESTNET_VTOKEN_BEACON,
} from "../../vips/vip-582/bsctestnet-addendum";
import POOL_REGISTRY_ABI from "./abi/PoolRegistry.json";
import VTOKEN_ABI from "./abi/vtoken.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import VTOKEN_BEACON_ABI from "./abi/vtokenBeacon.json";

forking(77292356, async () => {
  let poolRegistry: Contract;

  before(async () => {
    poolRegistry = await ethers.getContractAt(POOL_REGISTRY_ABI, NETWORK_ADDRESSES.bsctestnet.POOL_REGISTRY);
  });

  describe("Pre-VIP behavior", async () => {
    it("should have old vToken implementation", async () => {
      const beacon = await ethers.getContractAt(VTOKEN_BEACON_ABI, BSCTESTNET_VTOKEN_BEACON);
      const currentImpl = await beacon.implementation();
      expect(currentImpl).to.not.equal(BSCTESTNET_NEW_VTOKEN_IMPLEMENTATION);
    });

    it("should have old VSLIS beacon implementation", async () => {
      const beacon = await ethers.getContractAt(VTOKEN_BEACON_ABI, BSCTESTNET_VSLIS_BEACON);
      const currentImpl = await beacon.implementation();
      expect(currentImpl).to.not.equal(BSCTESTNET_NEW_VTOKEN_IMPLEMENTATION);
    });

    it("should have old VPLANET beacon implementation", async () => {
      const beacon = await ethers.getContractAt(VTOKEN_BEACON_ABI, BSCTESTNET_VPLANET_BEACON);
      const currentImpl = await beacon.implementation();
      expect(currentImpl).to.not.equal(BSCTESTNET_NEW_VTOKEN_IMPLEMENTATION);
    });
  });

  testVip("VIP-778 Addendum", await vip778Addendum(), {});

  describe("Post-VIP behavior", async () => {
    it("should have new vToken implementation", async () => {
      const beacon = await ethers.getContractAt(VTOKEN_BEACON_ABI, BSCTESTNET_VTOKEN_BEACON);
      const currentImpl = await beacon.implementation();
      expect(currentImpl).to.equal(BSCTESTNET_NEW_VTOKEN_IMPLEMENTATION);
    });

    it("should have new VSLIS beacon implementation", async () => {
      const beacon = await ethers.getContractAt(VTOKEN_BEACON_ABI, BSCTESTNET_VSLIS_BEACON);
      const currentImpl = await beacon.implementation();
      expect(currentImpl).to.equal(BSCTESTNET_NEW_VTOKEN_IMPLEMENTATION);
    });

    it("should have new VPLANET beacon implementation", async () => {
      const beacon = await ethers.getContractAt(VTOKEN_BEACON_ABI, BSCTESTNET_VPLANET_BEACON);
      const currentImpl = await beacon.implementation();
      expect(currentImpl).to.equal(BSCTESTNET_NEW_VTOKEN_IMPLEMENTATION);
    });

    it("All Vtokens should have new block rate in IL", async () => {
      const registeredPools = await poolRegistry.getAllPools();
      for (const pool of registeredPools) {
        const comptrollerAddress = pool.comptroller;
        const comptroller = await ethers.getContractAt(COMPTROLLER_ABI, comptrollerAddress);
        const poolVTokens = await comptroller.getAllMarkets();

        for (const vtokenAddress of poolVTokens) {
          const vtoken = await ethers.getContractAt(VTOKEN_ABI, vtokenAddress);
          expect(await vtoken.blocksOrSecondsPerYear()).equals(70080000);
        }
      }
    });

    describe("Beacon ownership verification", async () => {
      it("beacons should still have correct ownership", async () => {
        const beacons = [
          { address: BSCTESTNET_VTOKEN_BEACON, name: "VToken Beacon" },
          { address: BSCTESTNET_VSLIS_BEACON, name: "VSLIS Beacon" },
          { address: BSCTESTNET_VPLANET_BEACON, name: "VPLANET Beacon" },
        ];

        for (const beacon of beacons) {
          const beaconContract = await ethers.getContractAt(VTOKEN_BEACON_ABI, beacon.address);

          const owner = await beaconContract.owner();
          expect(owner).to.not.equal(ethers.constants.AddressZero);
        }
      });
    });
  });
});
