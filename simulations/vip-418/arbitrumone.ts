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
  PRIME,
  PSR,
  VTOKENS,
  XVS_STORE,
} from "../../multisig/proposals/arbitrumone/vip-019";
import vip418, { ARBITRUM_ONE_BOUND_VALIDATOR, ARBITRUM_XVS_BRIDGE_ADMIN } from "../../vips/vip-418/bscmainnet";
import OWNERSHIP_ABI from "../vip-416/abi/Ownership.json";

const XVS_BRIDGE = "0x20cEa49B5F7a6DBD78cAE772CA5973eF360AA1e6";
const { arbitrumone } = NETWORK_ADDRESSES;

forking(298392727, async () => {
  const provider = ethers.provider;
  let chainLinkOracle: Contract;
  let redstoneOracle: Contract;
  let resilientOracle: Contract;
  let boundValidator: Contract;
  let xvsBridgeAdmin: Contract;
  let xvsBridge: Contract;
  let prime: Contract;
  let plp: Contract;

  const xvsVaultProxy = new ethers.Contract(arbitrumone.XVS_VAULT_PROXY, OWNERSHIP_ABI, provider);
  const xvsStore = new ethers.Contract(XVS_STORE, OWNERSHIP_ABI, provider);
  before(async () => {
    chainLinkOracle = new ethers.Contract(arbitrumone.CHAINLINK_ORACLE, OWNERSHIP_ABI, provider);
    redstoneOracle = new ethers.Contract(arbitrumone.REDSTONE_ORACLE, OWNERSHIP_ABI, provider);
    resilientOracle = new ethers.Contract(arbitrumone.RESILIENT_ORACLE, OWNERSHIP_ABI, provider);
    boundValidator = new ethers.Contract(ARBITRUM_ONE_BOUND_VALIDATOR, OWNERSHIP_ABI, provider);
    xvsBridgeAdmin = await ethers.getContractAt(OWNERSHIP_ABI, ARBITRUM_XVS_BRIDGE_ADMIN);
    xvsBridge = await ethers.getContractAt(OWNERSHIP_ABI, XVS_BRIDGE);
    prime = new ethers.Contract(PRIME, OWNERSHIP_ABI, provider);
    plp = new ethers.Contract(PLP, OWNERSHIP_ABI, provider);

    await pretendExecutingVip(await vip014());
  });

  testForkedNetworkVipCommands("vip333 XVS Bridge permissions", await vip418());

  describe("Post-VIP behaviour", async () => {
    for (const converter of CONVERTERS) {
      it(`owner for ${converter}`, async () => {
        const c = new ethers.Contract(converter, OWNERSHIP_ABI, provider);
        expect(await c.owner()).to.equal(arbitrumone.NORMAL_TIMELOCK);
      });
    }
    it("XVSBridgeAdmin ownership transferred to Normal Timelock", async () => {
      expect(await xvsBridgeAdmin.owner()).to.be.equals(arbitrumone.NORMAL_TIMELOCK);
    });
    it("Normal Timelock should be whitelisted", async () => {
      expect(await xvsBridge.whitelist(arbitrumone.NORMAL_TIMELOCK)).to.be.true;
    });
    it("oracles should have correct owner", async () => {
      expect(await resilientOracle.owner()).equals(arbitrumone.NORMAL_TIMELOCK);
      expect(await chainLinkOracle.owner()).equals(arbitrumone.NORMAL_TIMELOCK);
      expect(await redstoneOracle.owner()).equals(arbitrumone.NORMAL_TIMELOCK);
      expect(await boundValidator.owner()).equals(arbitrumone.NORMAL_TIMELOCK);
    });
    it("should have the correct pending owner", async () => {
      expect(await xvsVaultProxy.admin()).to.equal(arbitrumone.NORMAL_TIMELOCK);
      expect(await xvsStore.admin()).to.equal(arbitrumone.NORMAL_TIMELOCK);
    });
    it(`correct owner `, async () => {
      expect(await prime.owner()).to.equal(arbitrumone.NORMAL_TIMELOCK);
      expect(await plp.owner()).to.equal(arbitrumone.NORMAL_TIMELOCK);
    });
    it(`owner for converter network`, async () => {
      const c = new ethers.Contract(CONVERTER_NETWORK, OWNERSHIP_ABI, provider);
      expect(await c.owner()).to.equal(arbitrumone.NORMAL_TIMELOCK);
    });

    for (const comptrollerAddress of COMPTROLLERS) {
      it(`correct owner for ${comptrollerAddress}`, async () => {
        const c = new ethers.Contract(comptrollerAddress, OWNERSHIP_ABI, provider);
        expect(await c.owner()).to.equal(arbitrumone.NORMAL_TIMELOCK);
      });
    }

    for (const vTokenAddress of VTOKENS) {
      it(`correct owner for ${vTokenAddress}`, async () => {
        const v = new ethers.Contract(vTokenAddress, OWNERSHIP_ABI, provider);
        expect(await v.owner()).to.equal(arbitrumone.NORMAL_TIMELOCK);
      });
    }

    for (const ntgAddress of NTGs) {
      it(`correct owner for ${ntgAddress}`, async () => {
        const ntg = new ethers.Contract(ntgAddress, OWNERSHIP_ABI, provider);
        expect(await ntg.owner()).to.equal(arbitrumone.NORMAL_TIMELOCK);
      });
    }

    it(`correct owner for psr`, async () => {
      const psr = new ethers.Contract(PSR, OWNERSHIP_ABI, provider);
      expect(await psr.owner()).to.equal(arbitrumone.NORMAL_TIMELOCK);
    });
  });
});
