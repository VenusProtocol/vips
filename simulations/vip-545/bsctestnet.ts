import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";
import { checkCorePoolComptroller } from "src/vip-framework/checks/checkCorePoolComptroller";

import vip545, {
  DEFAULT_PROXY_ADMIN,
  DIAMOND,
  LIQUIDATOR,
  LIQUIDATOR_IMPL,
  LIQUIDATOR_PROXY_ADMIN,
  VAI_CONTROLLER,
  VAI_CONTROLLER_IMPL,
  VTOKEN_DELEGATE,
  vBNB_ADMIN,
  vBNB_ADMIN_IMPL,
  vTokens,
} from "../../vips/vip-545/bsctestnet";
import DIAMOND_ABI from "./abi/Diamond.json";
import TRANSPARENT_PROXY_ABI from "./abi/TransparentUpgradeableProxy.json";
import UNITROLLER_ABI from "./abi/Unitroller.json";
import VAI_CONTROLLER_ABI from "./abi/VAIContoller.json";
import VBEP20_DELEGATOR_ABI from "./abi/VBep20Delegator.json";

const { bsctestnet } = NETWORK_ADDRESSES;

forking(64855555, async () => {
  const defaultProxyAdmin = await ethers.provider.getSigner(DEFAULT_PROXY_ADMIN);

  describe("Pre-VIP behavior", async () => {
    describe("check implementation", async () => {
      it("check vBNBAdmin implementation", async () => {
        const vBNBAdmin = (await ethers.getContractAt(TRANSPARENT_PROXY_ABI, vBNB_ADMIN)) as Contract;
        const impl = await vBNBAdmin.connect(defaultProxyAdmin).callStatic.implementation();
        expect(impl).to.equal("0x90c891bb2b1821ADE159ECa6FbA0418b2bD1b86D");
      });

      it("check comptroller implementation", async () => {
        const unitroller = (await ethers.getContractAt(UNITROLLER_ABI, bsctestnet.UNITROLLER)) as Contract;
        const impl = await unitroller.comptrollerImplementation();
        expect(impl).to.equal("0x1D5F9752bA40cF7047db2E24Cb6Aa196E3c334DA");
      });

      it("check liquidator implementation", async () => {
        const liquidatorProxyAdmin = await ethers.getSigner(LIQUIDATOR_PROXY_ADMIN);
        const liquidator = (await ethers.getContractAt(TRANSPARENT_PROXY_ABI, LIQUIDATOR)) as Contract;
        const impl = await liquidator.connect(liquidatorProxyAdmin).callStatic.implementation();
        expect(impl).to.equal("0x83372155Dd4A4306af82795d5A27d40188ED1F3B");
      });

      it("check VAIController implementation", async () => {
        const vaiController = (await ethers.getContractAt(VAI_CONTROLLER_ABI, VAI_CONTROLLER)) as Contract;
        const impl = await vaiController.vaiControllerImplementation();
        expect(impl).to.equal("0xDFcbfb82a416B5CEbB80FECFbBF4E055299931FF");
      });

      for (const [name, address] of Object.entries(vTokens)) {
        it(`check ${name} implementation`, async () => {
          const vToken = (await ethers.getContractAt(VBEP20_DELEGATOR_ABI, address)) as Contract;
          const impl = await vToken.callStatic.implementation();
          if (name === "vSolvBTC") {
            expect(impl).to.equal("0x67ce26cAC0E1dF3901BA2d9c5d9dd6cc4F645454");
            return;
          }
          expect(impl).to.equal("0xad6aa8Bb4829560412A94AA930745f407BF8000B");
        });
      }
    });
  });

  testVip("VIP-545", await vip545(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [DIAMOND_ABI], ["DiamondCut"], [1]);
      await expectEvents(txResponse, [UNITROLLER_ABI], ["NewImplementation"], [35]);
    },
  });

  describe("Post-VIP behavior", async () => {
    describe("check implementation", async () => {
      it("check vBNBAdmin implementation", async () => {
        const vBNBAdmin = (await ethers.getContractAt(TRANSPARENT_PROXY_ABI, vBNB_ADMIN)) as Contract;
        const impl = await vBNBAdmin.connect(defaultProxyAdmin).callStatic.implementation();
        expect(impl).to.equal(vBNB_ADMIN_IMPL);
      });

      it("check comptroller implementation", async () => {
        const unitroller = (await ethers.getContractAt(UNITROLLER_ABI, bsctestnet.UNITROLLER)) as Contract;
        const impl = await unitroller.comptrollerImplementation();
        expect(impl).to.equal(DIAMOND);
      });

      it("check liquidator implementation", async () => {
        const liquidatorProxyAdmin = await ethers.getSigner(LIQUIDATOR_PROXY_ADMIN);
        const liquidator = (await ethers.getContractAt(TRANSPARENT_PROXY_ABI, LIQUIDATOR)) as Contract;
        const impl = await liquidator.connect(liquidatorProxyAdmin).callStatic.implementation();
        expect(impl).to.equal(LIQUIDATOR_IMPL);
      });

      it("check VAIController implementation", async () => {
        const vaiController = (await ethers.getContractAt(VAI_CONTROLLER_ABI, VAI_CONTROLLER)) as Contract;
        const impl = await vaiController.vaiControllerImplementation();
        expect(impl).to.equal(VAI_CONTROLLER_IMPL);
      });

      for (const [name, address] of Object.entries(vTokens)) {
        it(`check ${name} implementation`, async () => {
          const vToken = (await ethers.getContractAt(VBEP20_DELEGATOR_ABI, address)) as Contract;
          const impl = await vToken.callStatic.implementation();
          expect(impl).to.equal(VTOKEN_DELEGATE);
        });
      }
    });

    describe("generic tests", async () => {
      checkCorePoolComptroller();
    });
  });
});
