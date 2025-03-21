import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import vip014, {
  COMPTROLLERS,
  CONVERTERS,
  CONVERTER_NETWORK,
  NTGs,
  PLP,
  POOL_REGISTRY,
  PRIME,
  VTOKENS,
  XVS_STORE,
} from "../../multisig/proposals/arbitrumsepolia/vip-020";
import { PSR, REWARD_DISTRIBUTORS } from "../../multisig/proposals/arbitrumsepolia/vip-020";
import vip438, {
  ARBITRUM_SEPOLIA_BOUND_VALIDATOR,
  ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN,
} from "../../vips/vip-438/bsctestnet";
import OWNERSHIP_ABI from "../vip-433/abi/Ownership.json";

const XVS_BRIDGE = "0xFdC5cEC63FD167DA46cF006585b30D03B104eFD4";
const { arbitrumsepolia } = NETWORK_ADDRESSES;

forking(117063164, async () => {
  const provider = ethers.provider;
  let chainLinkOracle: Contract;
  let redstoneOracle: Contract;
  let resilientOracle: Contract;
  let boundValidator: Contract;
  let xvsBridgeAdmin: Contract;
  let xvsBridge: Contract;
  let treasury: Contract;
  let prime: Contract;
  let plp: Contract;
  let poolRegistry: Contract;
  const xvsVaultProxy = new ethers.Contract(arbitrumsepolia.XVS_VAULT_PROXY, OWNERSHIP_ABI, provider);
  const xvsStore = new ethers.Contract(XVS_STORE, OWNERSHIP_ABI, provider);

  before(async () => {
    chainLinkOracle = new ethers.Contract(arbitrumsepolia.CHAINLINK_ORACLE, OWNERSHIP_ABI, provider);
    redstoneOracle = new ethers.Contract(arbitrumsepolia.REDSTONE_ORACLE, OWNERSHIP_ABI, provider);
    resilientOracle = new ethers.Contract(arbitrumsepolia.RESILIENT_ORACLE, OWNERSHIP_ABI, provider);
    boundValidator = new ethers.Contract(ARBITRUM_SEPOLIA_BOUND_VALIDATOR, OWNERSHIP_ABI, provider);
    xvsBridgeAdmin = await ethers.getContractAt(OWNERSHIP_ABI, ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN);
    xvsBridge = await ethers.getContractAt(OWNERSHIP_ABI, XVS_BRIDGE);
    treasury = await ethers.getContractAt(OWNERSHIP_ABI, arbitrumsepolia.VTREASURY);
    prime = new ethers.Contract(PRIME, OWNERSHIP_ABI, provider);
    plp = new ethers.Contract(PLP, OWNERSHIP_ABI, provider);
    poolRegistry = new ethers.Contract(POOL_REGISTRY, OWNERSHIP_ABI, provider);

    await pretendExecutingVip(await vip014());
  });

  testForkedNetworkVipCommands("Accept ownerships/admins", await vip438());

  describe("Post-VIP behaviour", async () => {
    it("correct owner for pool registry", async () => {
      expect(await poolRegistry.owner()).to.equal(arbitrumsepolia.NORMAL_TIMELOCK);
    });

    for (const converter of CONVERTERS) {
      it(`owner for ${converter}`, async () => {
        const c = new ethers.Contract(converter, OWNERSHIP_ABI, provider);
        expect(await c.owner()).to.equal(arbitrumsepolia.NORMAL_TIMELOCK);
      });
    }

    it("XVSBridgeAdmin ownership transferred to Normal Timelock", async () => {
      expect(await xvsBridgeAdmin.owner()).to.be.equals(arbitrumsepolia.NORMAL_TIMELOCK);
    });
    it("Normal Timelock should be whitelisted", async () => {
      expect(await xvsBridge.whitelist(arbitrumsepolia.NORMAL_TIMELOCK)).to.be.true;
    });
    it("oracles should have correct owner", async () => {
      expect(await resilientOracle.owner()).equals(arbitrumsepolia.NORMAL_TIMELOCK);
      expect(await chainLinkOracle.owner()).equals(arbitrumsepolia.NORMAL_TIMELOCK);
      expect(await redstoneOracle.owner()).equals(arbitrumsepolia.NORMAL_TIMELOCK);
      expect(await boundValidator.owner()).equals(arbitrumsepolia.NORMAL_TIMELOCK);
    });
    it("Normal Timelock should be the owner of the Vtreasury", async () => {
      expect(await treasury.owner()).equals(arbitrumsepolia.NORMAL_TIMELOCK);
    });
    it("should have the correct pending owner", async () => {
      expect(await xvsVaultProxy.admin()).to.equal(arbitrumsepolia.NORMAL_TIMELOCK);
      expect(await xvsStore.admin()).to.equal(arbitrumsepolia.NORMAL_TIMELOCK);
    });
    it(`owner for converter network`, async () => {
      const c = new ethers.Contract(CONVERTER_NETWORK, OWNERSHIP_ABI, provider);
      expect(await c.owner()).to.equal(arbitrumsepolia.NORMAL_TIMELOCK);
    });
    it(`correct owner `, async () => {
      expect(await prime.owner()).to.equal(arbitrumsepolia.NORMAL_TIMELOCK);
      expect(await plp.owner()).to.equal(arbitrumsepolia.NORMAL_TIMELOCK);
    });
    for (const comptrollerAddress of COMPTROLLERS) {
      it(`correct owner for ${comptrollerAddress}`, async () => {
        const c = new ethers.Contract(comptrollerAddress, OWNERSHIP_ABI, provider);
        expect(await c.owner()).to.equal(arbitrumsepolia.NORMAL_TIMELOCK);
      });
    }

    for (const vTokenAddress of VTOKENS) {
      it(`correct owner for ${vTokenAddress}`, async () => {
        const v = new ethers.Contract(vTokenAddress, OWNERSHIP_ABI, provider);
        expect(await v.owner()).to.equal(arbitrumsepolia.NORMAL_TIMELOCK);
      });
    }

    for (const ntgAddress of NTGs) {
      it(`correct owner for ${ntgAddress}`, async () => {
        const ntg = new ethers.Contract(ntgAddress, OWNERSHIP_ABI, provider);
        expect(await ntg.owner()).to.equal(arbitrumsepolia.NORMAL_TIMELOCK);
      });
    }

    for (const rewardDistributor of REWARD_DISTRIBUTORS) {
      it(`correct owner for ${rewardDistributor}`, async () => {
        const c = new ethers.Contract(rewardDistributor, OWNERSHIP_ABI, provider);
        expect(await c.owner()).to.equal(arbitrumsepolia.NORMAL_TIMELOCK);
      });
    }

    it(`correct owner for psr`, async () => {
      const psr = new ethers.Contract(PSR, OWNERSHIP_ABI, provider);
      expect(await psr.owner()).to.equal(arbitrumsepolia.NORMAL_TIMELOCK);
    });
  });
});
