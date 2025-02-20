import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import vip010, {
  BOUND_VALIDATOR,
  COMPTROLLER,
  NTG,
  PLP,
  POOL_REGISTRY,
  PRIME,
  PSR,
  VTOKENS,
  XVS_BRIDGE_ADMIN_PROXY,
  XVS_STORE,
} from "../../multisig/proposals/unichainsepolia/vip-010";
import vip460 from "../../vips/vip-460/bsctestnet";
import OWNERSHIP_ABI from "./abi/Ownership.json";

const XVS_BRIDGE = "0xCAF833318a6663bb23aa7f218e597c2F7970b4D2";
const { unichainsepolia } = NETWORK_ADDRESSES;

forking(13182108, async () => {
  const provider = ethers.provider;
  let resilientOracle: Contract;
  let boundValidator: Contract;
  let treasury: Contract;
  let xvsBridgeAdmin: Contract;
  let xvsBridge: Contract;
  let poolRegistry: Contract;
  let prime: Contract;
  let plp: Contract;
  let redstoneOracle: Contract;

  const xvsVaultProxy = new ethers.Contract(unichainsepolia.XVS_VAULT_PROXY, OWNERSHIP_ABI, provider);
  const xvsStore = new ethers.Contract(XVS_STORE, OWNERSHIP_ABI, provider);

  before(async () => {
    resilientOracle = new ethers.Contract(unichainsepolia.RESILIENT_ORACLE, OWNERSHIP_ABI, provider);
    boundValidator = new ethers.Contract(BOUND_VALIDATOR, OWNERSHIP_ABI, provider);
    xvsBridgeAdmin = await ethers.getContractAt(OWNERSHIP_ABI, XVS_BRIDGE_ADMIN_PROXY);
    xvsBridge = await ethers.getContractAt(OWNERSHIP_ABI, XVS_BRIDGE);
    treasury = await ethers.getContractAt(OWNERSHIP_ABI, unichainsepolia.VTREASURY);
    poolRegistry = await ethers.getContractAt(OWNERSHIP_ABI, POOL_REGISTRY);
    prime = new ethers.Contract(PRIME, OWNERSHIP_ABI, provider);
    plp = new ethers.Contract(PLP, OWNERSHIP_ABI, provider);
    redstoneOracle = new ethers.Contract(unichainsepolia.REDSTONE_ORACLE, OWNERSHIP_ABI, provider);

    await pretendExecutingVip(await vip010());
  });

  testForkedNetworkVipCommands("Accept ownerships/admins", await vip460());

  describe("Post-VIP behaviour", async () => {
    it("correct owner for pool registry", async () => {
      expect(await poolRegistry.owner()).to.equal(unichainsepolia.NORMAL_TIMELOCK);
    });

    it("correct owner for prime", async () => {
      expect(await prime.owner()).to.equal(unichainsepolia.NORMAL_TIMELOCK);
    });

    it("correct owner for plp", async () => {
      expect(await plp.owner()).to.equal(unichainsepolia.NORMAL_TIMELOCK);
    });

    it("correct owner for redstone oracle", async () => {
      expect(await redstoneOracle.owner()).to.equal(unichainsepolia.NORMAL_TIMELOCK);
    });

    it(`correct owner for psr`, async () => {
      const psr = new ethers.Contract(PSR, OWNERSHIP_ABI, provider);
      expect(await psr.owner()).to.equal(unichainsepolia.NORMAL_TIMELOCK);
    });

    it("XVSBridgeAdmin ownership transferred to Normal Timelock", async () => {
      expect(await xvsBridgeAdmin.owner()).to.be.equals(unichainsepolia.NORMAL_TIMELOCK);
    });
    it("Normal Timelock should be whitelisted", async () => {
      expect(await xvsBridge.whitelist(unichainsepolia.NORMAL_TIMELOCK)).to.be.true;
    });

    it("oracles should have correct owner", async () => {
      expect(await resilientOracle.owner()).equals(unichainsepolia.NORMAL_TIMELOCK);
      expect(await boundValidator.owner()).equals(unichainsepolia.NORMAL_TIMELOCK);
    });

    it("Normal Timelock should be the owner of the Vtreasury", async () => {
      expect(await treasury.owner()).equals(unichainsepolia.NORMAL_TIMELOCK);
    });
    it("should have the correct pending owner", async () => {
      expect(await xvsVaultProxy.admin()).to.equal(unichainsepolia.NORMAL_TIMELOCK);
      expect(await xvsStore.admin()).to.equal(unichainsepolia.NORMAL_TIMELOCK);
    });
    it(`correct owner for ${COMPTROLLER}`, async () => {
      const c = new ethers.Contract(COMPTROLLER, OWNERSHIP_ABI, provider);
      expect(await c.owner()).to.equal(unichainsepolia.NORMAL_TIMELOCK);
    });

    for (const vTokenAddress of VTOKENS) {
      it(`correct owner for ${vTokenAddress}`, async () => {
        const v = new ethers.Contract(vTokenAddress, OWNERSHIP_ABI, provider);
        expect(await v.owner()).to.equal(unichainsepolia.NORMAL_TIMELOCK);
      });
    }

    it(`correct owner for ${NTG}`, async () => {
      const ntg = new ethers.Contract(NTG, OWNERSHIP_ABI, provider);
      expect(await ntg.owner()).to.equal(unichainsepolia.NORMAL_TIMELOCK);
    });
  });
});
