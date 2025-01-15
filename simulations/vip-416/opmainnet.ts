import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import vip021, { COMPTROLLERS, NTGs, PSR, VTOKENS, XVS_STORE } from "../../multisig/proposals/opmainnet/vip-007";
import vip416, { OPMAINNET_BOUND_VALIDATOR, OPMAINNET_XVS_BRIDGE_ADMIN } from "../../vips/vip-416/bscmainnet";
import COMPTROLLER_ABI from "../vip-416/abi/Comptroller.json";
import NTG_ABI from "../vip-416/abi/NativeTokenGateway.json";
import PSR_ABI from "../vip-416/abi/ProtocolShareReserve.json";
import VTOKEN_ABI from "../vip-416/abi/VToken.json";
import XVS_STORE_ABI from "../vip-416/abi/XVSStore.json";
import XVS_VAULT_PROXY_ABI from "../vip-416/abi/XVSVaultProxy.json";
import BOUND_VALIDATOR_ABI from "../vip-416/abi/boundValidator.json";
import RESILLIENT_ORACLE_ABI from "../vip-416/abi/resilientOracle.json";
import TREASURY_ABI from "../vip-416/abi/treasury.json";
import XVS_BRIDGE_ABI from "../vip-416/abi/xvsBridge.json";
import XVS_BRIDGE_ADMIN_ABI from "../vip-416/abi/xvsBridgeAdmin.json";

const XVS_BRIDGE = "0xbBe46bAec851355c3FC4856914c47eB6Cea0B8B4";
const { opmainnet } = NETWORK_ADDRESSES;

forking(130685460, async () => {
  const provider = ethers.provider;
  let resilientOracle: Contract;
  let boundValidator: Contract;
  let treasury: Contract;
  let xvsBridgeAdmin: Contract;
  let xvsBridge: Contract;
  const xvsVaultProxy = new ethers.Contract(opmainnet.XVS_VAULT_PROXY, XVS_VAULT_PROXY_ABI, provider);
  const xvsStore = new ethers.Contract(XVS_STORE, XVS_STORE_ABI, provider);

  before(async () => {
    resilientOracle = new ethers.Contract(opmainnet.RESILIENT_ORACLE, RESILLIENT_ORACLE_ABI, provider);
    boundValidator = new ethers.Contract(OPMAINNET_BOUND_VALIDATOR, BOUND_VALIDATOR_ABI, provider);
    xvsBridgeAdmin = await ethers.getContractAt(XVS_BRIDGE_ADMIN_ABI, OPMAINNET_XVS_BRIDGE_ADMIN);
    xvsBridge = await ethers.getContractAt(XVS_BRIDGE_ABI, XVS_BRIDGE);
    treasury = await ethers.getContractAt(TREASURY_ABI, opmainnet.VTREASURY);
    await pretendExecutingVip(await vip021());
  });

  testForkedNetworkVipCommands("vip333 XVS Bridge permissions", await vip416());

  describe("Post-VIP behaviour", async () => {
    it(`correct owner for psr`, async () => {
      const psr = new ethers.Contract(PSR, PSR_ABI, provider);
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
        const c = new ethers.Contract(comptrollerAddress, COMPTROLLER_ABI, provider);
        expect(await c.owner()).to.equal(opmainnet.NORMAL_TIMELOCK);
      });
    }

    for (const vTokenAddress of VTOKENS) {
      it(`correct owner for ${vTokenAddress}`, async () => {
        const v = new ethers.Contract(vTokenAddress, VTOKEN_ABI, provider);
        expect(await v.owner()).to.equal(opmainnet.NORMAL_TIMELOCK);
      });
    }

    for (const ntgAddress of NTGs) {
      it(`correct owner for ${ntgAddress}`, async () => {
        const ntg = new ethers.Contract(ntgAddress, NTG_ABI, provider);
        expect(await ntg.owner()).to.equal(opmainnet.NORMAL_TIMELOCK);
      });
    }
  });
});
