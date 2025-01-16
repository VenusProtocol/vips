import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip024, {
  BOUND_VALIDATOR,
  COMPTROLLERS,
  COMPTROLLER_BEACON,
  DEFAULT_PROXY_ADMIN,
  NTGs,
  PSR,
  VTOKENS,
  VTOKEN_BEACON,
  XVS,
  XVS_BRIDGE_ADMIN_PROXY,
  XVS_STORE,
} from "../../../proposals/opbnbtestnet/vip-024";
import OWNERSHIP_ABI from "./abi/Ownership.json";

const { opbnbtestnet } = NETWORK_ADDRESSES;

const RESILIENT_ORACLE = opbnbtestnet.RESILIENT_ORACLE;
const NORMAL_TIMELOCK = opbnbtestnet.NORMAL_TIMELOCK;

forking(48788035, async () => {
  const provider = ethers.provider;
  let proxyAdmin: Contract;
  let psr: Contract;
  let comptrollerBeacon: Contract;
  let vTokenBeacon: Contract;
  let poolRegistry: Contract;
  let xvsVault: Contract;
  let xvsStore: Contract;
  let xvs: Contract;
  let xvsBridgeAdmin: Contract;
  let resilientOracle: Contract;
  let boundValidator: Contract;
  let treasury: Contract;

  describe("Pre-VIP behavior", async () => {
    before(async () => {
      proxyAdmin = new ethers.Contract(DEFAULT_PROXY_ADMIN, OWNERSHIP_ABI, provider);
      psr = new ethers.Contract(PSR, OWNERSHIP_ABI, provider);
      comptrollerBeacon = new ethers.Contract(COMPTROLLER_BEACON, OWNERSHIP_ABI, provider);
      vTokenBeacon = new ethers.Contract(VTOKEN_BEACON, OWNERSHIP_ABI, provider);
      poolRegistry = new ethers.Contract(opbnbtestnet.POOL_REGISTRY, OWNERSHIP_ABI, provider);
      xvsVault = new ethers.Contract(opbnbtestnet.XVS_VAULT_PROXY, OWNERSHIP_ABI, provider);
      xvsStore = new ethers.Contract(XVS_STORE, OWNERSHIP_ABI, provider);
      xvs = await ethers.getContractAt(OWNERSHIP_ABI, XVS);
      xvsBridgeAdmin = await ethers.getContractAt(OWNERSHIP_ABI, XVS_BRIDGE_ADMIN_PROXY);
      resilientOracle = new ethers.Contract(RESILIENT_ORACLE, OWNERSHIP_ABI, provider);
      boundValidator = new ethers.Contract(BOUND_VALIDATOR, OWNERSHIP_ABI, provider);
      treasury = await ethers.getContractAt(OWNERSHIP_ABI, NETWORK_ADDRESSES.opbnbtestnet.VTREASURY);
    });

    for (const ntg of NTGs) {
      it(`should have no pending owner for ${ntg}`, async () => {
        const c = new ethers.Contract(ntg, OWNERSHIP_ABI, provider);
        expect(await c.pendingOwner()).to.equal(ethers.constants.AddressZero);
      });
    }

    it("owner of proxy admin is guardian", async () => {
      expect(await proxyAdmin.owner()).to.equal(opbnbtestnet.GUARDIAN);
    });

    it("pending owner of psr", async () => {
      expect(await psr.pendingOwner()).to.equal(ethers.constants.AddressZero);
    });

    for (const comptrollerAddress of COMPTROLLERS) {
      it(`should have no pending owner for ${comptrollerAddress}`, async () => {
        const c = new ethers.Contract(comptrollerAddress, OWNERSHIP_ABI, provider);
        expect(await c.pendingOwner()).to.equal(ethers.constants.AddressZero);
      });
    }

    for (const vTokenAddress of VTOKENS) {
      it(`should have no pending owner for ${vTokenAddress}`, async () => {
        const v = new ethers.Contract(vTokenAddress, OWNERSHIP_ABI, provider);
        expect(await v.pendingOwner()).to.equal(ethers.constants.AddressZero);
      });
    }

    it("owner of ComptrollerBeacon is guardian", async () => {
      expect(await comptrollerBeacon.owner()).to.equal(opbnbtestnet.GUARDIAN);
    });

    it("owner of VTokenBeacon is guardian", async () => {
      expect(await vTokenBeacon.owner()).to.equal(opbnbtestnet.GUARDIAN);
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
      expect(await boundValidator.pendingOwner()).to.equal(ethers.constants.AddressZero);
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip024());
    });

    for (const ntg of NTGs) {
      it(`should have no pending owner for ${ntg}`, async () => {
        const c = new ethers.Contract(ntg, OWNERSHIP_ABI, provider);
        expect(await c.pendingOwner()).to.equal(opbnbtestnet.NORMAL_TIMELOCK);
      });
    }

    it("owner of proxy admin is timelock", async () => {
      expect(await proxyAdmin.owner()).to.equal(opbnbtestnet.NORMAL_TIMELOCK);
    });

    it("pending owner of psr", async () => {
      expect(await psr.pendingOwner()).to.equal(opbnbtestnet.NORMAL_TIMELOCK);
    });

    for (const comptrollerAddress of COMPTROLLERS) {
      it(`correct pending owner for ${comptrollerAddress}`, async () => {
        const c = new ethers.Contract(comptrollerAddress, OWNERSHIP_ABI, provider);
        expect(await c.pendingOwner()).to.equal(opbnbtestnet.NORMAL_TIMELOCK);
      });
    }

    for (const vTokenAddress of VTOKENS) {
      it(`correct pending owner for ${vTokenAddress}`, async () => {
        const v = new ethers.Contract(vTokenAddress, OWNERSHIP_ABI, provider);
        expect(await v.pendingOwner()).to.equal(opbnbtestnet.NORMAL_TIMELOCK);
      });
    }

    it("owner of ComptrollerBeacon is NT", async () => {
      expect(await comptrollerBeacon.owner()).to.equal(opbnbtestnet.NORMAL_TIMELOCK);
    });

    it("owner of VTokenBeacon is NT", async () => {
      expect(await vTokenBeacon.owner()).to.equal(opbnbtestnet.NORMAL_TIMELOCK);
    });

    it("pending owner of PoolRegistry is NT", async () => {
      expect(await poolRegistry.pendingOwner()).to.equal(opbnbtestnet.NORMAL_TIMELOCK);
    });

    it("correct pending owner", async () => {
      expect(await xvsVault.pendingAdmin()).to.equal(NORMAL_TIMELOCK);
    });

    it("correct pending owner", async () => {
      expect(await xvsStore.pendingAdmin()).to.equal(NORMAL_TIMELOCK);
    });

    it("Should set bridge pending owner to Normal Timelock", async () => {
      const pendingOwner = await xvsBridgeAdmin.pendingOwner();
      expect(pendingOwner).equals(opbnbtestnet.NORMAL_TIMELOCK);
    });
    it("Should set XVS owner to Normal Timelock", async () => {
      const owner = await xvs.owner();
      expect(owner).equals(opbnbtestnet.NORMAL_TIMELOCK);
    });
    it("correct pending owner", async () => {
      expect(await resilientOracle.pendingOwner()).to.equal(NORMAL_TIMELOCK);
      expect(await boundValidator.pendingOwner()).to.equal(NORMAL_TIMELOCK);
    });
    it("Should set pendingOwner to Normal Timelock", async () => {
      const pendingOwner = await treasury.pendingOwner();
      expect(pendingOwner).equals(NETWORK_ADDRESSES.opbnbtestnet.NORMAL_TIMELOCK);
    });
  });
});
