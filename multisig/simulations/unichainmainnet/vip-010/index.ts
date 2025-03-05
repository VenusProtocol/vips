import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";

import { vip008 } from "../../../proposals/unichainmainnet/vip-008";
import vip010, {
  BOUND_VALIDATOR,
  COMPTROLLER,
  COMPTROLLER_BEACON,
  DEFAULT_PROXY_ADMIN,
  NTG,
  PLP,
  PRIME,
  PSR,
  REWARD_DISTRIBUTOR,
  VTOKENS,
  VTOKEN_BEACON,
  XVS,
  XVS_BRIDGE_ADMIN_PROXY,
  XVS_STORE,
} from "../../../proposals/unichainmainnet/vip-010";
import OWNERSHIP_ABI from "./abi/Ownership.json";

const { unichainmainnet } = NETWORK_ADDRESSES;

const RESILIENT_ORACLE = unichainmainnet.RESILIENT_ORACLE;
const REDSTONE_ORACLE = unichainmainnet.REDSTONE_ORACLE;
const NORMAL_TIMELOCK = unichainmainnet.NORMAL_TIMELOCK;

forking(9393677, async () => {
  const provider = ethers.provider;
  let proxyAdmin: Contract;
  let prime: Contract;
  let plp: Contract;
  let psr: Contract;
  let comptrollerBeacon: Contract;
  let vTokenBeacon: Contract;
  let poolRegistry: Contract;
  let xvsVault: Contract;
  let xvsStore: Contract;
  let xvs: Contract;
  let xvsBridgeAdmin: Contract;
  let resilientOracle: Contract;
  let redstoneOracle: Contract;
  let boundValidator: Contract;

  describe("Pre-VIP behavior", async () => {
    before(async () => {
      proxyAdmin = new ethers.Contract(DEFAULT_PROXY_ADMIN, OWNERSHIP_ABI, provider);
      prime = new ethers.Contract(PRIME, OWNERSHIP_ABI, provider);
      plp = new ethers.Contract(PLP, OWNERSHIP_ABI, provider);
      psr = new ethers.Contract(PSR, OWNERSHIP_ABI, provider);
      comptrollerBeacon = new ethers.Contract(COMPTROLLER_BEACON, OWNERSHIP_ABI, provider);
      vTokenBeacon = new ethers.Contract(VTOKEN_BEACON, OWNERSHIP_ABI, provider);
      poolRegistry = new ethers.Contract(unichainmainnet.POOL_REGISTRY, OWNERSHIP_ABI, provider);
      xvsVault = new ethers.Contract(unichainmainnet.XVS_VAULT_PROXY, OWNERSHIP_ABI, provider);
      xvsStore = new ethers.Contract(XVS_STORE, OWNERSHIP_ABI, provider);
      xvs = await ethers.getContractAt(OWNERSHIP_ABI, XVS);
      xvsBridgeAdmin = await ethers.getContractAt(OWNERSHIP_ABI, XVS_BRIDGE_ADMIN_PROXY);
      resilientOracle = new ethers.Contract(RESILIENT_ORACLE, OWNERSHIP_ABI, provider);
      redstoneOracle = new ethers.Contract(REDSTONE_ORACLE, OWNERSHIP_ABI, provider);
      boundValidator = new ethers.Contract(BOUND_VALIDATOR, OWNERSHIP_ABI, provider);

      await pretendExecutingVip(await vip008());
    });

    it(`should have no pending owner for ${NTG}`, async () => {
      const c = new ethers.Contract(NTG, OWNERSHIP_ABI, provider);
      expect(await c.pendingOwner()).to.equal(ethers.constants.AddressZero);
    });

    it("owner of proxy admin is guardian", async () => {
      expect(await proxyAdmin.owner()).to.equal(unichainmainnet.GUARDIAN);
    });
    it("pending owner", async () => {
      expect(await prime.pendingOwner()).to.equal(ethers.constants.AddressZero);
      expect(await plp.pendingOwner()).to.equal(ethers.constants.AddressZero);
    });

    it(`should have no pending owner for ${REWARD_DISTRIBUTOR}`, async () => {
      const c = new ethers.Contract(REWARD_DISTRIBUTOR, OWNERSHIP_ABI, provider);
      expect(await c.pendingOwner()).to.equal(ethers.constants.AddressZero);
    });

    it("pending owner of psr", async () => {
      expect(await psr.pendingOwner()).to.equal(ethers.constants.AddressZero);
    });

    it(`should have no pending owner for ${COMPTROLLER}`, async () => {
      const c = new ethers.Contract(COMPTROLLER, OWNERSHIP_ABI, provider);
      expect(await c.pendingOwner()).to.equal(ethers.constants.AddressZero);
    });

    for (const vTokenAddress of VTOKENS) {
      it(`should have no pending owner for ${vTokenAddress}`, async () => {
        const v = new ethers.Contract(vTokenAddress, OWNERSHIP_ABI, provider);
        expect(await v.pendingOwner()).to.equal(ethers.constants.AddressZero);
      });
    }

    it("owner of ComptrollerBeacon is guardian", async () => {
      expect(await comptrollerBeacon.owner()).to.equal(unichainmainnet.GUARDIAN);
    });

    it("owner of VTokenBeacon is guardian", async () => {
      expect(await vTokenBeacon.owner()).to.equal(unichainmainnet.GUARDIAN);
    });

    it("pending owner of PoolRegistry", async () => {
      expect(await poolRegistry.pendingOwner()).to.equal(ethers.constants.AddressZero);
    });
    it("should have no pending owner", async () => {
      expect(await xvsVault.pendingAdmin()).to.equal(ethers.constants.AddressZero);
    });

    it("should have no pending owner", async () => {
      expect(await xvsStore.pendingAdmin()).to.equal(ethers.constants.AddressZero);
    });

    it("should have no pending owner", async () => {
      expect(await resilientOracle.pendingOwner()).to.equal(ethers.constants.AddressZero);
      expect(await redstoneOracle.pendingOwner()).to.equal(ethers.constants.AddressZero);
      expect(await boundValidator.pendingOwner()).to.equal(ethers.constants.AddressZero);
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip010());
    });

    it(`should have no pending owner for ${NTG}`, async () => {
      const c = new ethers.Contract(NTG, OWNERSHIP_ABI, provider);
      expect(await c.pendingOwner()).to.equal(unichainmainnet.NORMAL_TIMELOCK);
    });

    it("owner of proxy admin is timelock", async () => {
      expect(await proxyAdmin.owner()).to.equal(unichainmainnet.NORMAL_TIMELOCK);
    });

    it("pending owner", async () => {
      expect(await prime.pendingOwner()).to.equal(unichainmainnet.NORMAL_TIMELOCK);
      expect(await plp.pendingOwner()).to.equal(unichainmainnet.NORMAL_TIMELOCK);
    });

    it(`should have Normal Timelock as pending owner for ${REWARD_DISTRIBUTOR}`, async () => {
      const c = new ethers.Contract(REWARD_DISTRIBUTOR, OWNERSHIP_ABI, provider);
      expect(await c.pendingOwner()).to.equal(unichainmainnet.NORMAL_TIMELOCK);
    });

    it("pending owner of psr", async () => {
      expect(await psr.pendingOwner()).to.equal(unichainmainnet.NORMAL_TIMELOCK);
    });

    it(`correct pending owner for ${COMPTROLLER}`, async () => {
      const c = new ethers.Contract(COMPTROLLER, OWNERSHIP_ABI, provider);
      expect(await c.pendingOwner()).to.equal(unichainmainnet.NORMAL_TIMELOCK);
    });

    for (const vTokenAddress of VTOKENS) {
      it(`correct pending owner for ${vTokenAddress}`, async () => {
        const v = new ethers.Contract(vTokenAddress, OWNERSHIP_ABI, provider);
        expect(await v.pendingOwner()).to.equal(unichainmainnet.NORMAL_TIMELOCK);
      });
    }

    it("owner of ComptrollerBeacon is NT", async () => {
      expect(await comptrollerBeacon.owner()).to.equal(unichainmainnet.NORMAL_TIMELOCK);
    });

    it("owner of VTokenBeacon is NT", async () => {
      expect(await vTokenBeacon.owner()).to.equal(unichainmainnet.NORMAL_TIMELOCK);
    });

    it("pending owner of PoolRegistry is NT", async () => {
      expect(await poolRegistry.pendingOwner()).to.equal(unichainmainnet.NORMAL_TIMELOCK);
    });

    it("correct pending owner", async () => {
      expect(await xvsVault.pendingAdmin()).to.equal(NORMAL_TIMELOCK);
    });

    it("correct pending owner", async () => {
      expect(await xvsStore.pendingAdmin()).to.equal(NORMAL_TIMELOCK);
    });

    it("Should set bridge pending owner to Normal Timelock", async () => {
      const pendingOwner = await xvsBridgeAdmin.pendingOwner();
      expect(pendingOwner).equals(unichainmainnet.NORMAL_TIMELOCK);
    });
    it("Should set XVS owner to Normal Timelock", async () => {
      const owner = await xvs.owner();
      expect(owner).equals(unichainmainnet.NORMAL_TIMELOCK);
    });
    it("correct pending owner", async () => {
      expect(await resilientOracle.pendingOwner()).to.equal(NORMAL_TIMELOCK);
      expect(await redstoneOracle.pendingOwner()).to.equal(NORMAL_TIMELOCK);
      expect(await boundValidator.pendingOwner()).to.equal(NORMAL_TIMELOCK);
    });
  });
});
