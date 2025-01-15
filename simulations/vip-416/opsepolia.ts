import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import vip021, { COMPTROLLERS, NTGs, PSR, VTOKENS, XVS_STORE } from "../../multisig/proposals/opsepolia/vip-008";
import vip416, { OPSEPOLIA_BOUND_VALIDATOR, OPSEPOLIA_XVS_BRIDGE_ADMIN } from "../../vips/vip-416/bsctestnet";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import NTG_ABI from "./abi/NativeTokenGateway.json";
import PSR_ABI from "./abi/ProtocolShareReserve.json";
import VTOKEN_ABI from "./abi/VToken.json";
import XVS_STORE_ABI from "./abi/XVSStore.json";
import XVS_VAULT_PROXY_ABI from "./abi/XVSVaultProxy.json";
import BOUND_VALIDATOR_ABI from "./abi/boundValidator.json";
import RESILLIENT_ORACLE_ABI from "./abi/resilientOracle.json";
import TREASURY_ABI from "./abi/treasury.json";
import XVS_BRIDGE_ABI from "./abi/xvsBridge.json";
import XVS_BRIDGE_ADMIN_ABI from "./abi/xvsBridgeAdmin.json";

const XVS_BRIDGE = "0x79a36dc9a43D05Db4747c59c02F48ed500e47dF1";
const { opsepolia } = NETWORK_ADDRESSES;

forking(22583622, async () => {
  const provider = ethers.provider;
  let resilientOracle: Contract;
  let boundValidator: Contract;
  let treasury: Contract;
  let xvsBridgeAdmin: Contract;
  let xvsBridge: Contract;
  const xvsVaultProxy = new ethers.Contract(opsepolia.XVS_VAULT_PROXY, XVS_VAULT_PROXY_ABI, provider);
  const xvsStore = new ethers.Contract(XVS_STORE, XVS_STORE_ABI, provider);

  before(async () => {
    resilientOracle = new ethers.Contract(opsepolia.RESILIENT_ORACLE, RESILLIENT_ORACLE_ABI, provider);
    boundValidator = new ethers.Contract(OPSEPOLIA_BOUND_VALIDATOR, BOUND_VALIDATOR_ABI, provider);
    xvsBridgeAdmin = await ethers.getContractAt(XVS_BRIDGE_ADMIN_ABI, OPSEPOLIA_XVS_BRIDGE_ADMIN);
    xvsBridge = await ethers.getContractAt(XVS_BRIDGE_ABI, XVS_BRIDGE);
    treasury = await ethers.getContractAt(TREASURY_ABI, opsepolia.VTREASURY);
    await pretendExecutingVip(await vip021());
  });

  testForkedNetworkVipCommands("vip333 XVS Bridge permissions", await vip416());

  describe("Post-VIP behaviour", async () => {
    it(`correct owner for psr`, async () => {
      const psr = new ethers.Contract(PSR, PSR_ABI, provider);
      expect(await psr.owner()).to.equal(opsepolia.NORMAL_TIMELOCK);
    });

    it("XVSBridgeAdmin ownership transferred to Normal Timelock", async () => {
      expect(await xvsBridgeAdmin.owner()).to.be.equals(opsepolia.NORMAL_TIMELOCK);
    });
    it("Normal Timelock should be whitelisted", async () => {
      expect(await xvsBridge.whitelist(opsepolia.NORMAL_TIMELOCK)).to.be.true;
    });

    it("oracles should have correct owner", async () => {
      expect(await resilientOracle.owner()).equals(opsepolia.NORMAL_TIMELOCK);
      expect(await boundValidator.owner()).equals(opsepolia.NORMAL_TIMELOCK);
    });

    it("Normal Timelock should be the owner of the Vtreasury", async () => {
      expect(await treasury.owner()).equals(opsepolia.NORMAL_TIMELOCK);
    });
    it("should have the correct pending owner", async () => {
      expect(await xvsVaultProxy.admin()).to.equal(opsepolia.NORMAL_TIMELOCK);
      expect(await xvsStore.admin()).to.equal(opsepolia.NORMAL_TIMELOCK);
    });
    for (const comptrollerAddress of COMPTROLLERS) {
      it(`correct owner for ${comptrollerAddress}`, async () => {
        const c = new ethers.Contract(comptrollerAddress, COMPTROLLER_ABI, provider);
        expect(await c.owner()).to.equal(opsepolia.NORMAL_TIMELOCK);
      });
    }

    for (const vTokenAddress of VTOKENS) {
      it(`correct owner for ${vTokenAddress}`, async () => {
        const v = new ethers.Contract(vTokenAddress, VTOKEN_ABI, provider);
        expect(await v.owner()).to.equal(opsepolia.NORMAL_TIMELOCK);
      });
    }

    for (const ntgAddress of NTGs) {
      it(`correct owner for ${ntgAddress}`, async () => {
        const ntg = new ethers.Contract(ntgAddress, NTG_ABI, provider);
        expect(await ntg.owner()).to.equal(opsepolia.NORMAL_TIMELOCK);
      });
    }
  });
});
