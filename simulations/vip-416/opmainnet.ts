import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import vip021, {
  COMPTROLLERS,
  NTGs,
  PLP,
  POOL_REGISTRY,
  PRIME,
  PSR,
  VTOKENS,
  XVS_STORE,
} from "../../multisig/proposals/opmainnet/vip-007";
import vip416, { OPMAINNET_BOUND_VALIDATOR, OPMAINNET_XVS_BRIDGE_ADMIN } from "../../vips/vip-416/bscmainnet";
import OWNERSHIP_ABI from "../vip-416/abi/Ownership.json";

const XVS_BRIDGE = "0xbBe46bAec851355c3FC4856914c47eB6Cea0B8B4";
const { opmainnet } = NETWORK_ADDRESSES;

forking(131013820, async () => {
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
  let chainLinkOracle: Contract;

  const xvsVaultProxy = new ethers.Contract(opmainnet.XVS_VAULT_PROXY, OWNERSHIP_ABI, provider);
  const xvsStore = new ethers.Contract(XVS_STORE, OWNERSHIP_ABI, provider);

  before(async () => {
    resilientOracle = new ethers.Contract(opmainnet.RESILIENT_ORACLE, OWNERSHIP_ABI, provider);
    boundValidator = new ethers.Contract(OPMAINNET_BOUND_VALIDATOR, OWNERSHIP_ABI, provider);
    xvsBridgeAdmin = await ethers.getContractAt(OWNERSHIP_ABI, OPMAINNET_XVS_BRIDGE_ADMIN);
    xvsBridge = await ethers.getContractAt(OWNERSHIP_ABI, XVS_BRIDGE);
    treasury = await ethers.getContractAt(OWNERSHIP_ABI, opmainnet.VTREASURY);
    poolRegistry = await ethers.getContractAt(OWNERSHIP_ABI, POOL_REGISTRY);
    prime = new ethers.Contract(PRIME, OWNERSHIP_ABI, provider);
    plp = new ethers.Contract(PLP, OWNERSHIP_ABI, provider);
    redstoneOracle = new ethers.Contract(opmainnet.REDSTONE_ORACLE, OWNERSHIP_ABI, provider);
    chainLinkOracle = new ethers.Contract(opmainnet.CHAINLINK_ORACLE, OWNERSHIP_ABI, provider);
    await pretendExecutingVip(await vip021());
  });

  testForkedNetworkVipCommands("Accept ownerships/admins", await vip416());

  describe("Post-VIP behaviour", async () => {
    it("correct owner for pool registry", async () => {
      expect(await poolRegistry.owner()).to.equal(opmainnet.NORMAL_TIMELOCK);
    });

    it("correct owner for prime", async () => {
      expect(await prime.owner()).to.equal(opmainnet.NORMAL_TIMELOCK);
    });

    it("correct owner for plp", async () => {
      expect(await plp.owner()).to.equal(opmainnet.NORMAL_TIMELOCK);
    });

    it("correct owner for chainlink oracle", async () => {
      expect(await chainLinkOracle.owner()).to.equal(opmainnet.NORMAL_TIMELOCK);
    });

    it("correct owner for redstone oracle", async () => {
      expect(await redstoneOracle.owner()).to.equal(opmainnet.NORMAL_TIMELOCK);
    });

    it(`correct owner for psr`, async () => {
      const psr = new ethers.Contract(PSR, OWNERSHIP_ABI, provider);
      expect(await psr.owner()).to.equal(opmainnet.NORMAL_TIMELOCK);
    });

    it("XVSBridgeAdmin ownership transferred to Normal Timelock", async () => {
      expect(await xvsBridgeAdmin.owner()).to.be.equals(opmainnet.NORMAL_TIMELOCK);
    });
    it("Normal Timelock should be whitelisted", async () => {
      expect(await xvsBridge.whitelist(opmainnet.NORMAL_TIMELOCK)).to.be.true;
    });

    it("oracles should have correct owner", async () => {
      expect(await resilientOracle.owner()).equals(opmainnet.NORMAL_TIMELOCK);
      expect(await boundValidator.owner()).equals(opmainnet.NORMAL_TIMELOCK);
    });

    it("Normal Timelock should be the owner of the Vtreasury", async () => {
      expect(await treasury.owner()).equals(opmainnet.NORMAL_TIMELOCK);
    });
    it("should have the correct pending owner", async () => {
      expect(await xvsVaultProxy.admin()).to.equal(opmainnet.NORMAL_TIMELOCK);
      expect(await xvsStore.admin()).to.equal(opmainnet.NORMAL_TIMELOCK);
    });
    for (const comptrollerAddress of COMPTROLLERS) {
      it(`correct owner for ${comptrollerAddress}`, async () => {
        const c = new ethers.Contract(comptrollerAddress, OWNERSHIP_ABI, provider);
        expect(await c.owner()).to.equal(opmainnet.NORMAL_TIMELOCK);
      });
    }

    for (const vTokenAddress of VTOKENS) {
      it(`correct owner for ${vTokenAddress}`, async () => {
        const v = new ethers.Contract(vTokenAddress, OWNERSHIP_ABI, provider);
        expect(await v.owner()).to.equal(opmainnet.NORMAL_TIMELOCK);
      });
    }

    for (const ntgAddress of NTGs) {
      it(`correct owner for ${ntgAddress}`, async () => {
        const ntg = new ethers.Contract(ntgAddress, OWNERSHIP_ABI, provider);
        expect(await ntg.owner()).to.equal(opmainnet.NORMAL_TIMELOCK);
      });
    }
  });
});
