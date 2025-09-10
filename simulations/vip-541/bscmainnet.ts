import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";
import { checkCorePoolComptroller } from "src/vip-framework/checks/checkCorePoolComptroller";

import vip541, {
  DEFAULT_PROXY_ADMIN,
  DIAMOND,
  LIQUIDATOR,
  LIQUIDATOR_IMPL,
  VAI_CONTROLLER,
  VAI_CONTROLLER_IMPL,
  VTOKEN_DELEGATE,
  vBNB_ADMIN,
  vBNB_ADMIN_IMPL,
  vTokens,
  LIQUIDATOR_PROXY_ADMIN
} from "../../vips/vip-541/bscmainnet";
import DIAMOND_ABI from "./abi/Diamond.json";
import TRANSPARENT_PROXY_ABI from "./abi/TransparentUpgradeableProxy.json";
import UNITROLLER_ABI from "./abi/Unitroller.json";
import VAI_CONTROLLER_ABI from "./abi/VAIContoller.json";
import VBEP20_DELEGATOR_ABI from "./abi/VBep20Delegator.json";

const { bscmainnet } = NETWORK_ADDRESSES;

forking(60676242, async () => {
  const defaultProxyAdmin = await ethers.provider.getSigner(DEFAULT_PROXY_ADMIN);

  describe("Pre-VIP behavior", async () => {
    describe("check implementation", async () => {
      it("check vBNBAdmin implementation", async () => {
        const vBNBAdmin = (await ethers.getContractAt(TRANSPARENT_PROXY_ABI, vBNB_ADMIN)) as Contract;
        const impl = await vBNBAdmin.connect(defaultProxyAdmin).callStatic.implementation();
        expect(impl).to.equal("0xaA8D9558d8D45666552a72CECbdd0a746aeaCDc9");
      });

      it("check comptroller implementation", async () => {
        const unitroller = (await ethers.getContractAt(UNITROLLER_ABI, bscmainnet.UNITROLLER)) as Contract;
        const impl = await unitroller.comptrollerImplementation();
        expect(impl).to.equal("0x347ba9559fFC65A94af0F6a513037Cd4982b7b18");
      });

      it("check liquidator implementation", async () => {
        const liquidatorProxyAdmin = await ethers.getSigner(LIQUIDATOR_PROXY_ADMIN);
        const liquidator = (await ethers.getContractAt(TRANSPARENT_PROXY_ABI, LIQUIDATOR)) as Contract;
        const impl = await liquidator.connect(liquidatorProxyAdmin).callStatic.implementation();
        expect(impl).to.equal("0xE26cE9b5FDd602225cCcC4cef7FAE596Dcf2A965");
      });

      it("check VAIController implementation", async () => {
        const vaiController = (await ethers.getContractAt(VAI_CONTROLLER_ABI, VAI_CONTROLLER)) as Contract;
        const impl = await vaiController.vaiControllerImplementation();
        expect(impl).to.equal("0xF1A8B40CA68d08EFfa31a16a83f4fd9b5c174872");
      });

      for (const [name, address] of Object.entries(vTokens)) {
        it(`check ${name} implementation`, async () => {
          const vToken = (await ethers.getContractAt(VBEP20_DELEGATOR_ABI, address)) as Contract;
          const impl = await vToken.callStatic.implementation();
          expect(impl).to.equal("0x6E5cFf66C7b671fA1D5782866D80BD15955d79F6");
        });
      }
    });
  });

  testVip("VIP-541", await vip541(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [DIAMOND_ABI], ["DiamondCut"], [1]);
      await expectEvents(txResponse, [UNITROLLER_ABI], ["NewImplementation"], [40]);
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
        const unitroller = (await ethers.getContractAt(UNITROLLER_ABI, bscmainnet.UNITROLLER)) as Contract;
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
