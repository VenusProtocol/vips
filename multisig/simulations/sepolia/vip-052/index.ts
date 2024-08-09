import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip052, {
  COMPTROLLER_BEACON, 
  VTOKEN_BEACON, 
  VTOKENS, 
  COMPTROLLERS
} from "../../../proposals/sepolia/vip-052";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import VTOKEN_ABI from "./abi/VToken.json";
import COMPTROLLER_BEACON_ABI from "./abi/ComptrollerBeacon.json";
import VTOKEN_BEACON_ABI from "./abi/VTokenBeacon.json";
import POOL_REGISTRY_ABI from "./abi/PoolRegistry.json";

const { sepolia } = NETWORK_ADDRESSES;

forking(6466682, async () => {
  const provider = ethers.provider;
  let comptrollerBeacon: Contract;
  let vTokenBeacon: Contract;
  let poolRegistry: Contract;

  describe("Pre-VIP behavior", async () => {
    before(async () => {
      comptrollerBeacon = new ethers.Contract(COMPTROLLER_BEACON, COMPTROLLER_BEACON_ABI, provider);
      vTokenBeacon = new ethers.Contract(VTOKEN_BEACON, VTOKEN_BEACON_ABI, provider)
      poolRegistry = new ethers.Contract(sepolia.POOL_REGISTRY, POOL_REGISTRY_ABI, provider);
    });

    for (const comptrollerAddress of COMPTROLLERS) {
      it(`should have no pending owner for ${comptrollerAddress}`, async () => {
        const c = new ethers.Contract(comptrollerAddress, COMPTROLLER_ABI, provider);
        expect(await c.pendingOwner()).to.equal(ethers.constants.AddressZero);
      });
    }

    for (const vTokenAddress of VTOKENS) {
      it(`should have no pending owner for ${vTokenAddress}`, async () => {
        const v = new ethers.Contract(vTokenAddress, VTOKEN_ABI, provider);
        expect(await v.pendingOwner()).to.equal(ethers.constants.AddressZero);
      });
    }

    it("owner of ComptrollerBeacon is guardian", async () => {
      expect(await comptrollerBeacon.owner()).to.equal(sepolia.GUARDIAN);
    });

    it("owner of VTokenBeacon is guardian", async () => {
      expect(await vTokenBeacon.owner()).to.equal(sepolia.GUARDIAN);
    });

    it("pending owner of PoolRegistry", async () => {
      expect(await poolRegistry.pendingOwner()).to.equal(ethers.constants.AddressZero);
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip052());
    });

    for (const comptrollerAddress of COMPTROLLERS) {
      it(`correct pending owner for ${comptrollerAddress}`, async () => {
        const c = new ethers.Contract(comptrollerAddress, COMPTROLLER_ABI, provider);
        expect(await c.pendingOwner()).to.equal(sepolia.NORMAL_TIMELOCK);
      });
    }

    for (const vTokenAddress of VTOKENS) {
      it(`correct pending owner for ${vTokenAddress}`, async () => {
        const v = new ethers.Contract(vTokenAddress, VTOKEN_ABI, provider);
        expect(await v.pendingOwner()).to.equal(sepolia.NORMAL_TIMELOCK);
      });
    }

    it("owner of ComptrollerBeacon is NT", async () => {
      expect(await comptrollerBeacon.owner()).to.equal(sepolia.NORMAL_TIMELOCK);
    });

    it("owner of VTokenBeacon is NT", async () => {
      expect(await vTokenBeacon.owner()).to.equal(sepolia.NORMAL_TIMELOCK);
    });

    it("pending owner of PoolRegistry is NT", async () => {
      expect(await poolRegistry.pendingOwner()).to.equal(sepolia.NORMAL_TIMELOCK);
    });
  });
});