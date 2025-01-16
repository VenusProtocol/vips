/* eslint-disable @typescript-eslint/no-unused-vars */
import { expect } from "chai";
import { BigNumber, Contract, Signer } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { initMainnetUser } from "src/utils";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip020, {
  BOUND_VALIDATOR,
  COMPTROLLERS,
  COMPTROLLER_BEACON,
  CONVERTERS,
  CONVERTER_NETWORK,
  DEFAULT_PROXY_ADMIN,
  NTGs,
  PLP,
  PRIME,
  PSR,
  REWARD_DISTRIBUTORS,
  SINGLE_TOKEN_CONVERTER_BEACON,
  VTOKENS,
  VTOKEN_BEACON,
  XVS,
  XVS_BRIDGE_ADMIN_PROXY,
  XVS_STORE,
} from "../../../proposals/arbitrumsepolia/vip-020";
import OWNERSHIP_ABI from "./abi/Ownership.json";

const { arbitrumsepolia } = NETWORK_ADDRESSES;

const RESILIENT_ORACLE = arbitrumsepolia.RESILIENT_ORACLE;
const CHAINLINK_ORACLE = arbitrumsepolia.CHAINLINK_ORACLE;
const REDSTONE_ORACLE = arbitrumsepolia.REDSTONE_ORACLE;
const NORMAL_TIMELOCK = arbitrumsepolia.NORMAL_TIMELOCK;

forking(115192126, async () => {
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
  let chainLinkOracle: Contract;
  let redstoneOracle: Contract;
  let boundValidator: Contract;
  let treasury: Contract;

  describe("Pre-VIP behavior", async () => {
    before(async () => {
      proxyAdmin = new ethers.Contract(DEFAULT_PROXY_ADMIN, OWNERSHIP_ABI, provider);
      prime = new ethers.Contract(PRIME, OWNERSHIP_ABI, provider);
      plp = new ethers.Contract(PLP, OWNERSHIP_ABI, provider);
      psr = new ethers.Contract(PSR, OWNERSHIP_ABI, provider);
      comptrollerBeacon = new ethers.Contract(COMPTROLLER_BEACON, OWNERSHIP_ABI, provider);
      vTokenBeacon = new ethers.Contract(VTOKEN_BEACON, OWNERSHIP_ABI, provider);
      poolRegistry = new ethers.Contract(arbitrumsepolia.POOL_REGISTRY, OWNERSHIP_ABI, provider);
      xvsVault = new ethers.Contract(arbitrumsepolia.XVS_VAULT_PROXY, OWNERSHIP_ABI, provider);
      xvsStore = new ethers.Contract(XVS_STORE, OWNERSHIP_ABI, provider);
      xvs = await ethers.getContractAt(OWNERSHIP_ABI, XVS);
      xvsBridgeAdmin = await ethers.getContractAt(OWNERSHIP_ABI, XVS_BRIDGE_ADMIN_PROXY);
      resilientOracle = new ethers.Contract(RESILIENT_ORACLE, OWNERSHIP_ABI, provider);
      chainLinkOracle = new ethers.Contract(CHAINLINK_ORACLE, OWNERSHIP_ABI, provider);
      redstoneOracle = new ethers.Contract(REDSTONE_ORACLE, OWNERSHIP_ABI, provider);
      boundValidator = new ethers.Contract(BOUND_VALIDATOR, OWNERSHIP_ABI, provider);
      treasury = await ethers.getContractAt(OWNERSHIP_ABI, NETWORK_ADDRESSES.arbitrumsepolia.VTREASURY);
    });

    for (const converter of CONVERTERS) {
      it(`should have no pending owner for ${converter}`, async () => {
        const c = new ethers.Contract(converter, OWNERSHIP_ABI, provider);
        expect(await c.pendingOwner()).to.equal(ethers.constants.AddressZero);
      });
    }

    for (const ntg of NTGs) {
      it(`should have no pending owner for ${ntg}`, async () => {
        const c = new ethers.Contract(ntg, OWNERSHIP_ABI, provider);
        expect(await c.pendingOwner()).to.equal(ethers.constants.AddressZero);
      });
    }

    it(`should have guardian as owner for converer beacon`, async () => {
      const c = new ethers.Contract(SINGLE_TOKEN_CONVERTER_BEACON, OWNERSHIP_ABI, provider);
      expect(await c.owner()).to.equal(arbitrumsepolia.GUARDIAN);
    });

    it(`should have no pending owner for converter network`, async () => {
      const c = new ethers.Contract(CONVERTER_NETWORK, OWNERSHIP_ABI, provider);
      expect(await c.pendingOwner()).to.equal(ethers.constants.AddressZero);
    });

    it("owner of proxy admin is guardian", async () => {
      expect(await proxyAdmin.owner()).to.equal(arbitrumsepolia.GUARDIAN);
    });
    it("pending owner", async () => {
      expect(await prime.pendingOwner()).to.equal(ethers.constants.AddressZero);
      expect(await plp.pendingOwner()).to.equal(ethers.constants.AddressZero);
    });

    for (const rewardDistributor of REWARD_DISTRIBUTORS) {
      it(`should have no pending owner for ${rewardDistributor}`, async () => {
        const c = new ethers.Contract(rewardDistributor, OWNERSHIP_ABI, provider);
        expect(await c.pendingOwner()).to.equal(ethers.constants.AddressZero);
      });
    }

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
      expect(await comptrollerBeacon.owner()).to.equal(arbitrumsepolia.GUARDIAN);
    });

    it("owner of VTokenBeacon is guardian", async () => {
      expect(await vTokenBeacon.owner()).to.equal(arbitrumsepolia.GUARDIAN);
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
      expect(await chainLinkOracle.pendingOwner()).to.equal(ethers.constants.AddressZero);
      expect(await redstoneOracle.pendingOwner()).to.equal(ethers.constants.AddressZero);
      expect(await boundValidator.pendingOwner()).to.equal(ethers.constants.AddressZero);
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip020());
    });

    for (const converter of CONVERTERS) {
      it(`should have no pending owner for ${converter}`, async () => {
        const c = new ethers.Contract(converter, OWNERSHIP_ABI, provider);
        expect(await c.pendingOwner()).to.equal(arbitrumsepolia.NORMAL_TIMELOCK);
      });
    }

    for (const ntg of NTGs) {
      it(`should have no pending owner for ${ntg}`, async () => {
        const c = new ethers.Contract(ntg, OWNERSHIP_ABI, provider);
        expect(await c.pendingOwner()).to.equal(arbitrumsepolia.NORMAL_TIMELOCK);
      });
    }

    it(`should have guardian as owner for converer beacon`, async () => {
      const c = new ethers.Contract(SINGLE_TOKEN_CONVERTER_BEACON, OWNERSHIP_ABI, provider);
      expect(await c.owner()).to.equal(arbitrumsepolia.NORMAL_TIMELOCK);
    });

    it(`should have no pending owner for converter network`, async () => {
      const c = new ethers.Contract(CONVERTER_NETWORK, OWNERSHIP_ABI, provider);
      expect(await c.pendingOwner()).to.equal(arbitrumsepolia.NORMAL_TIMELOCK);
    });

    it("owner of proxy admin is timelock", async () => {
      expect(await proxyAdmin.owner()).to.equal(arbitrumsepolia.NORMAL_TIMELOCK);
    });

    it("pending owner", async () => {
      expect(await prime.pendingOwner()).to.equal(arbitrumsepolia.NORMAL_TIMELOCK);
      expect(await plp.pendingOwner()).to.equal(arbitrumsepolia.NORMAL_TIMELOCK);
    });

    for (const rewardDistributor of REWARD_DISTRIBUTORS) {
      it(`should have Normal Timelock as pending owner for ${rewardDistributor}`, async () => {
        const c = new ethers.Contract(rewardDistributor, OWNERSHIP_ABI, provider);
        expect(await c.pendingOwner()).to.equal(arbitrumsepolia.NORMAL_TIMELOCK);
      });
    }

    it("pending owner of psr", async () => {
      expect(await psr.pendingOwner()).to.equal(arbitrumsepolia.NORMAL_TIMELOCK);
    });

    for (const comptrollerAddress of COMPTROLLERS) {
      it(`correct pending owner for ${comptrollerAddress}`, async () => {
        const c = new ethers.Contract(comptrollerAddress, OWNERSHIP_ABI, provider);
        expect(await c.pendingOwner()).to.equal(arbitrumsepolia.NORMAL_TIMELOCK);
      });
    }

    for (const vTokenAddress of VTOKENS) {
      it(`correct pending owner for ${vTokenAddress}`, async () => {
        const v = new ethers.Contract(vTokenAddress, OWNERSHIP_ABI, provider);
        expect(await v.pendingOwner()).to.equal(arbitrumsepolia.NORMAL_TIMELOCK);
      });
    }

    it("owner of ComptrollerBeacon is NT", async () => {
      expect(await comptrollerBeacon.owner()).to.equal(arbitrumsepolia.NORMAL_TIMELOCK);
    });

    it("owner of VTokenBeacon is NT", async () => {
      expect(await vTokenBeacon.owner()).to.equal(arbitrumsepolia.NORMAL_TIMELOCK);
    });

    it("pending owner of PoolRegistry is NT", async () => {
      expect(await poolRegistry.pendingOwner()).to.equal(arbitrumsepolia.NORMAL_TIMELOCK);
    });

    it("correct pending owner", async () => {
      expect(await xvsVault.pendingAdmin()).to.equal(NORMAL_TIMELOCK);
    });

    it("correct pending owner", async () => {
      expect(await xvsStore.pendingAdmin()).to.equal(NORMAL_TIMELOCK);
    });

    it("Should set bridge pending owner to Normal Timelock", async () => {
      const pendingOwner = await xvsBridgeAdmin.pendingOwner();
      expect(pendingOwner).equals(arbitrumsepolia.NORMAL_TIMELOCK);
    });
    it("Should set XVS owner to Normal Timelock", async () => {
      const owner = await xvs.owner();
      expect(owner).equals(arbitrumsepolia.NORMAL_TIMELOCK);
    });
    it("correct pending owner", async () => {
      expect(await resilientOracle.pendingOwner()).to.equal(NORMAL_TIMELOCK);
      expect(await chainLinkOracle.pendingOwner()).to.equal(NORMAL_TIMELOCK);
      expect(await redstoneOracle.pendingOwner()).to.equal(NORMAL_TIMELOCK);
      expect(await boundValidator.pendingOwner()).to.equal(NORMAL_TIMELOCK);
    });
    it("Should set pendingOwner to Normal Timelock", async () => {
      const pendingOwner = await treasury.pendingOwner();
      expect(pendingOwner).equals(NETWORK_ADDRESSES.arbitrumsepolia.NORMAL_TIMELOCK);
    });
  });
});