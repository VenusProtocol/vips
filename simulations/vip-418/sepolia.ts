import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import vip060, {
  CONVERTERS,
  CONVERTER_NETWORK,
  NTGs,
  PLP,
  POOL_REGISTRY,
  PRIME,
  PSR,
  REWARD_DISTRIBUTORS,
  XVS_STORE,
} from "../../multisig/proposals/sepolia/vip-071";
import vip418, {
  SEPOLIA_BOUND_VALIDATOR,
  SEPOLIA_XVS_BRIDGE_ADMIN,
  SEPOLIA_sFrxETH_ORACLE,
} from "../../vips/vip-418/bsctestnet";
import OWNERSHIP_ABI from "../vip-416/abi/Ownership.json";

const XVS_BRIDGE = "0xc340b7d3406502F43dC11a988E4EC5bbE536E642";
const { sepolia } = NETWORK_ADDRESSES;

forking(7553307, async () => {
  const provider = ethers.provider;
  let chainLinkOracle: Contract;
  let redstoneOracle: Contract;
  let resilientOracle: Contract;
  let boundValidator: Contract;
  let sfraxETH: Contract;
  let prime: Contract;
  let plp: Contract;
  let poolRegistry: Contract;

  const xvsVaultProxy = new ethers.Contract(sepolia.XVS_VAULT_PROXY, OWNERSHIP_ABI, provider);
  const xvsStore = new ethers.Contract(XVS_STORE, OWNERSHIP_ABI, provider);

  before(async () => {
    chainLinkOracle = new ethers.Contract(sepolia.CHAINLINK_ORACLE, OWNERSHIP_ABI, provider);
    redstoneOracle = new ethers.Contract(sepolia.REDSTONE_ORACLE, OWNERSHIP_ABI, provider);
    resilientOracle = new ethers.Contract(sepolia.RESILIENT_ORACLE, OWNERSHIP_ABI, provider);
    boundValidator = new ethers.Contract(SEPOLIA_BOUND_VALIDATOR, OWNERSHIP_ABI, provider);
    sfraxETH = new ethers.Contract(SEPOLIA_sFrxETH_ORACLE, OWNERSHIP_ABI, provider);
    prime = new ethers.Contract(PRIME, OWNERSHIP_ABI, provider);
    plp = new ethers.Contract(PLP, OWNERSHIP_ABI, provider);
    poolRegistry = new ethers.Contract(POOL_REGISTRY, OWNERSHIP_ABI, provider);
    await pretendExecutingVip(await vip060());
  });

  testForkedNetworkVipCommands("Accept ownerships/admins", await vip418());

  describe("Post-VIP behaviour", async () => {
    let xvsBridgeAdmin: Contract;
    let xvsBridge: Contract;
    before(async () => {
      xvsBridgeAdmin = await ethers.getContractAt(OWNERSHIP_ABI, SEPOLIA_XVS_BRIDGE_ADMIN);
      xvsBridge = await ethers.getContractAt(OWNERSHIP_ABI, XVS_BRIDGE);
    });

    it("correct owner for pool registry", async () => {
      expect(await poolRegistry.owner()).to.equal(sepolia.NORMAL_TIMELOCK);
    });

    for (const rewardDistributor of REWARD_DISTRIBUTORS) {
      it(`correct owner for ${rewardDistributor}`, async () => {
        const c = new ethers.Contract(rewardDistributor, OWNERSHIP_ABI, provider);
        expect(await c.owner()).to.equal(sepolia.NORMAL_TIMELOCK);
      });
    }

    it(`correct owner for psr`, async () => {
      const psr = new ethers.Contract(PSR, OWNERSHIP_ABI, provider);
      expect(await psr.owner()).to.equal(sepolia.NORMAL_TIMELOCK);
    });

    for (const converter of CONVERTERS) {
      it(`owner for ${converter}`, async () => {
        const c = new ethers.Contract(converter, OWNERSHIP_ABI, provider);
        expect(await c.owner()).to.equal(sepolia.NORMAL_TIMELOCK);
      });
    }

    it("XVSBridgeAdmin ownership transferred to Normal Timelock", async () => {
      expect(await xvsBridgeAdmin.owner()).to.be.equals(sepolia.NORMAL_TIMELOCK);
    });
    it("Normal Timelock should be whitelisted", async () => {
      expect(await xvsBridge.whitelist(sepolia.NORMAL_TIMELOCK)).to.be.true;
    });
    it("oracles should have correct owner", async () => {
      expect(await resilientOracle.owner()).equals(sepolia.NORMAL_TIMELOCK);
      expect(await chainLinkOracle.owner()).equals(sepolia.NORMAL_TIMELOCK);
      expect(await redstoneOracle.owner()).equals(sepolia.NORMAL_TIMELOCK);
      expect(await boundValidator.owner()).equals(sepolia.NORMAL_TIMELOCK);
      expect(await sfraxETH.owner()).equals(sepolia.NORMAL_TIMELOCK);
    });
    it("should have the correct pending owner", async () => {
      expect(await xvsVaultProxy.admin()).to.equal(sepolia.NORMAL_TIMELOCK);
      expect(await xvsStore.admin()).to.equal(sepolia.NORMAL_TIMELOCK);
    });

    it(`owner for converter network`, async () => {
      const c = new ethers.Contract(CONVERTER_NETWORK, OWNERSHIP_ABI, provider);
      expect(await c.owner()).to.equal(sepolia.NORMAL_TIMELOCK);
    });

    it(`correct owner `, async () => {
      expect(await prime.owner()).to.equal(sepolia.NORMAL_TIMELOCK);
      expect(await plp.owner()).to.equal(sepolia.NORMAL_TIMELOCK);
    });
    for (const ntgAddress of NTGs) {
      it(`correct owner for ${ntgAddress}`, async () => {
        const ntg = new ethers.Contract(ntgAddress, OWNERSHIP_ABI, provider);
        expect(await ntg.owner()).to.equal(sepolia.NORMAL_TIMELOCK);
      });
    }
  });
});
