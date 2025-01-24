import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import vip014, {
  COMPTROLLERS,
  NTGs,
  PLP,
  PRIME,
  PSR,
  VTOKENS,
  XVS_STORE,
  REWARD_DISTRIBUTORS
} from "../../multisig/proposals/zksyncsepolia/vip-017";
import vip418, { ZKSYNCSEPOLIA_BOUND_VALIDATOR, ZKSYNCSEPOLIA_XVS_BRIDGE_ADMIN } from "../../vips/vip-418/bsctestnet";
import OWNERSHIP_ABI from "../vip-416/abi/Ownership.json";

const XVS_BRIDGE = "0x760461ccB2508CAAa2ECe0c28af3a4707b853043";
const { zksyncsepolia } = NETWORK_ADDRESSES;

forking(4529969, async () => {
  const provider = ethers.provider;
  let chainLinkOracle: Contract;
  let redstoneOracle: Contract;
  let resilientOracle: Contract;
  let boundValidator: Contract;
  let treasury: Contract;
  let xvsBridgeAdmin: Contract;
  let xvsBridge: Contract;
  let prime: Contract;
  let plp: Contract;

  const xvsVaultProxy = new ethers.Contract(zksyncsepolia.XVS_VAULT_PROXY, OWNERSHIP_ABI, provider);
  const xvsStore = new ethers.Contract(XVS_STORE, OWNERSHIP_ABI, provider);
  before(async () => {
    chainLinkOracle = new ethers.Contract(zksyncsepolia.CHAINLINK_ORACLE, OWNERSHIP_ABI, provider);
    redstoneOracle = new ethers.Contract(zksyncsepolia.REDSTONE_ORACLE, OWNERSHIP_ABI, provider);
    resilientOracle = new ethers.Contract(zksyncsepolia.RESILIENT_ORACLE, OWNERSHIP_ABI, provider);
    boundValidator = new ethers.Contract(ZKSYNCSEPOLIA_BOUND_VALIDATOR, OWNERSHIP_ABI, provider);
    treasury = await ethers.getContractAt(OWNERSHIP_ABI, zksyncsepolia.VTREASURY);
    xvsBridgeAdmin = await ethers.getContractAt(OWNERSHIP_ABI, ZKSYNCSEPOLIA_XVS_BRIDGE_ADMIN);
    xvsBridge = await ethers.getContractAt(OWNERSHIP_ABI, XVS_BRIDGE);
    prime = new ethers.Contract(PRIME, OWNERSHIP_ABI, provider);
    plp = new ethers.Contract(PLP, OWNERSHIP_ABI, provider);

    await pretendExecutingVip(await vip014());
  });

  testForkedNetworkVipCommands("Accept ownerships/admins", await vip418());

  describe("Post-VIP behaviour", async () => {
    for (const rewardDistributor of REWARD_DISTRIBUTORS) {
      it(`correct owner for ${rewardDistributor}`, async () => {
        const c = new ethers.Contract(rewardDistributor, OWNERSHIP_ABI, provider);
        expect(await c.owner()).to.equal(zksyncsepolia.NORMAL_TIMELOCK);
      });
    }

    it("XVSBridgeAdmin ownership transferred to Normal Timelock", async () => {
      expect(await xvsBridgeAdmin.owner()).to.be.equals(zksyncsepolia.NORMAL_TIMELOCK);
    });
    it("Normal Timelock should be whitelisted", async () => {
      expect(await xvsBridge.whitelist(zksyncsepolia.NORMAL_TIMELOCK)).to.be.true;
    });
    it("oracles should have correct owner", async () => {
      expect(await resilientOracle.owner()).equals(zksyncsepolia.NORMAL_TIMELOCK);
      expect(await chainLinkOracle.owner()).equals(zksyncsepolia.NORMAL_TIMELOCK);
      expect(await redstoneOracle.owner()).equals(zksyncsepolia.NORMAL_TIMELOCK);
      expect(await boundValidator.owner()).equals(zksyncsepolia.NORMAL_TIMELOCK);
    });
    it("Normal Timelock should be the owner of the Vtreasury", async () => {
      expect(await treasury.owner()).equals(zksyncsepolia.NORMAL_TIMELOCK);
    });
    it("should have the correct pending owner", async () => {
      expect(await xvsVaultProxy.admin()).to.equal(zksyncsepolia.NORMAL_TIMELOCK);
      expect(await xvsStore.admin()).to.equal(zksyncsepolia.NORMAL_TIMELOCK);
    });
    it(`correct owner `, async () => {
      expect(await prime.owner()).to.equal(zksyncsepolia.NORMAL_TIMELOCK);
      expect(await plp.owner()).to.equal(zksyncsepolia.NORMAL_TIMELOCK);
    });

    for (const comptrollerAddress of COMPTROLLERS) {
      it(`correct owner for ${comptrollerAddress}`, async () => {
        const c = new ethers.Contract(comptrollerAddress, OWNERSHIP_ABI, provider);
        expect(await c.owner()).to.equal(zksyncsepolia.NORMAL_TIMELOCK);
      });
    }

    for (const vTokenAddress of VTOKENS) {
      it(`correct owner for ${vTokenAddress}`, async () => {
        const v = new ethers.Contract(vTokenAddress, OWNERSHIP_ABI, provider);
        expect(await v.owner()).to.equal(zksyncsepolia.NORMAL_TIMELOCK);
      });
    }

    for (const ntgAddress of NTGs) {
      it(`correct owner for ${ntgAddress}`, async () => {
        const ntg = new ethers.Contract(ntgAddress, OWNERSHIP_ABI, provider);
        expect(await ntg.owner()).to.equal(zksyncsepolia.NORMAL_TIMELOCK);
      });
    }

    it(`correct owner for psr`, async () => {
      const psr = new ethers.Contract(PSR, OWNERSHIP_ABI, provider);
      expect(await psr.owner()).to.equal(zksyncsepolia.NORMAL_TIMELOCK);
    });
  });
});
