import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import vip021, {
  COMPTROLLERS,
  NTGs,
  POOL_REGISTRY,
  PSR,
  VTOKENS,
  XVS_STORE,
} from "../../multisig/proposals/opbnbtestnet/vip-024";
import vip433, { OPBNBTESTNET_BOUND_VALIDATOR, OPBNBTESTNET_XVS_BRIDGE_ADMIN } from "../../vips/vip-433/bsctestnet";
import OWNERSHIP_ABI from "../vip-433/abi/Ownership.json";

const XVS_BRIDGE = "0xA03205bC635A772E533E7BE36b5701E331a70ea3";
const { opbnbtestnet } = NETWORK_ADDRESSES;

forking(50751046, async () => {
  const provider = ethers.provider;
  let binanceOracle: Contract;
  let resilientOracle: Contract;
  let boundValidator: Contract;
  let treasury: Contract;
  let xvsBridgeAdmin: Contract;
  let xvsBridge: Contract;
  let poolRegistry: Contract;
  const xvsVaultProxy = new ethers.Contract(opbnbtestnet.XVS_VAULT_PROXY, OWNERSHIP_ABI, provider);
  const xvsStore = new ethers.Contract(XVS_STORE, OWNERSHIP_ABI, provider);
  before(async () => {
    binanceOracle = new ethers.Contract(opbnbtestnet.BINANCE_ORACLE, OWNERSHIP_ABI, provider);
    resilientOracle = new ethers.Contract(opbnbtestnet.RESILIENT_ORACLE, OWNERSHIP_ABI, provider);
    boundValidator = new ethers.Contract(OPBNBTESTNET_BOUND_VALIDATOR, OWNERSHIP_ABI, provider);
    xvsBridgeAdmin = await ethers.getContractAt(OWNERSHIP_ABI, OPBNBTESTNET_XVS_BRIDGE_ADMIN);
    xvsBridge = await ethers.getContractAt(OWNERSHIP_ABI, XVS_BRIDGE);
    treasury = await ethers.getContractAt(OWNERSHIP_ABI, opbnbtestnet.VTREASURY);
    poolRegistry = await ethers.getContractAt(OWNERSHIP_ABI, POOL_REGISTRY);
    await pretendExecutingVip(await vip021());
  });

  testForkedNetworkVipCommands("Accept ownerships/admins", await vip433(), {});

  describe("Post-VIP behaviour", async () => {
    it("correct owner for pool registry", async () => {
      expect(await poolRegistry.owner()).to.equal(opbnbtestnet.NORMAL_TIMELOCK);
    });

    it(`correct owner for psr`, async () => {
      const psr = new ethers.Contract(PSR, OWNERSHIP_ABI, provider);
      expect(await psr.owner()).to.equal(opbnbtestnet.NORMAL_TIMELOCK);
    });
    it("XVSBridgeAdmin ownership transferred to Normal Timelock", async () => {
      expect(await xvsBridgeAdmin.owner()).to.be.equals(opbnbtestnet.NORMAL_TIMELOCK);
    });
    it("Normal Timelock should be whitelisted", async () => {
      expect(await xvsBridge.whitelist(opbnbtestnet.NORMAL_TIMELOCK)).to.be.true;
    });
    it("oracles should have correct owner", async () => {
      expect(await resilientOracle.owner()).equals(opbnbtestnet.NORMAL_TIMELOCK);
      expect(await binanceOracle.owner()).equals(opbnbtestnet.NORMAL_TIMELOCK);
      expect(await boundValidator.owner()).equals(opbnbtestnet.NORMAL_TIMELOCK);
    });
    it("Normal Timelock should be the owner of the Vtreasury", async () => {
      expect(await treasury.owner()).equals(opbnbtestnet.NORMAL_TIMELOCK);
    });
    it("should have the correct pending owner", async () => {
      expect(await xvsVaultProxy.admin()).to.equal(opbnbtestnet.NORMAL_TIMELOCK);
      expect(await xvsStore.admin()).to.equal(opbnbtestnet.NORMAL_TIMELOCK);
    });
    for (const comptrollerAddress of COMPTROLLERS) {
      it(`correct owner for ${comptrollerAddress}`, async () => {
        const c = new ethers.Contract(comptrollerAddress, OWNERSHIP_ABI, provider);
        expect(await c.owner()).to.equal(opbnbtestnet.NORMAL_TIMELOCK);
      });
    }

    for (const vTokenAddress of VTOKENS) {
      it(`correct owner for ${vTokenAddress}`, async () => {
        const v = new ethers.Contract(vTokenAddress, OWNERSHIP_ABI, provider);
        expect(await v.owner()).to.equal(opbnbtestnet.NORMAL_TIMELOCK);
      });
    }

    for (const ntgAddress of NTGs) {
      it(`correct owner for ${ntgAddress}`, async () => {
        const ntg = new ethers.Contract(ntgAddress, OWNERSHIP_ABI, provider);
        expect(await ntg.owner()).to.equal(opbnbtestnet.NORMAL_TIMELOCK);
      });
    }
  });
});
