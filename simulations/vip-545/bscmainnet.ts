import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, setMaxStalePeriodInBinanceOracle, setMaxStalePeriodInChainlinkOracle } from "src/utils";
import { forking, testVip } from "src/vip-framework";
import { checkCorePoolComptroller } from "src/vip-framework/checks/checkCorePoolComptroller";

import { WBNBMarketSpec, vip543 } from "../../vips/vip-543/bscmainnet";
import vip544 from "../../vips/vip-544/bscmainnet";
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
} from "../../vips/vip-545/bscmainnet";
import DIAMOND_ABI from "./abi/Diamond.json";
import TRANSPARENT_PROXY_ABI from "./abi/TransparentUpgradeableProxy.json";
import UNITROLLER_ABI from "./abi/Unitroller.json";
import VAI_CONTROLLER_ABI from "./abi/VAIContoller.json";
import VBEP20_DELEGATOR_ABI from "./abi/VBep20Delegator.json";

const { bscmainnet } = NETWORK_ADDRESSES;
const CHAINLINK_WBNB_FEED = "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE";

const OLD_REWARD_FACET = "0xc2F6bDCEa4907E8CB7480d3d315bc01c125fb63C";
const OLD_SETTER_FACET = "0x9D1fdD581Bd6E638A7b98ac5567248A0c4E88f64";
const OLD_MARKET_FACET = "0x94573965fbCCAC5cD4558208A8cCB3F18E71B7Db";
const OLD_POLICY_FACET = "0x5bb2Dfe996629E558Cd5BDBfC4c0eC7367BB96E9";

const NEW_REWARD_FACET = "0x05e4C8f3dbb6c2eaD4eB1f28611FA7180e79f428";
const NEW_SETTER_FACET = "0x92B26cb819335DA336f59480F0ca30F9a3f18E0a";
const NEW_MARKET_FACET = "0xd47c074c219E6947BB350D9aD220eE20fCCC6549";
const NEW_POLICY_FACET = "0xF2095BeCa3030D43976ED46D5ca488D58354E8c9";

let marketFacetFunctionSelectors: string[];
let policyFacetFunctionSelectors: string[];
let rewardFacetFuntionSelectors: string[];
let setterFacetFuntionSelectors: string[];
let unitroller: Contract;

forking(60902107, async () => {
  before(async () => {
    await setMaxStalePeriodInChainlinkOracle(
      NETWORK_ADDRESSES.bscmainnet.CHAINLINK_ORACLE,
      WBNBMarketSpec.vToken.underlying.address,
      CHAINLINK_WBNB_FEED,
      NETWORK_ADDRESSES.bscmainnet.NORMAL_TIMELOCK,
      315360000,
    );
    await setMaxStalePeriodInBinanceOracle(bscmainnet.BINANCE_ORACLE, "BNB");
    unitroller = new ethers.Contract(bscmainnet.UNITROLLER, DIAMOND_ABI, ethers.provider);
  });

  testVip("vip-543", await vip543());
  testVip("vip-544", await vip544());
  const defaultProxyAdmin = await ethers.provider.getSigner(DEFAULT_PROXY_ADMIN);

  describe("Pre-VIP behavior", async () => {
    before(async () => {
      rewardFacetFuntionSelectors = await unitroller.facetFunctionSelectors(OLD_REWARD_FACET);
      setterFacetFuntionSelectors = await unitroller.facetFunctionSelectors(OLD_SETTER_FACET);
      marketFacetFunctionSelectors = await unitroller.facetFunctionSelectors(OLD_MARKET_FACET);
      policyFacetFunctionSelectors = await unitroller.facetFunctionSelectors(OLD_POLICY_FACET);
    });

    describe("facets", async () => {
      it("market facet function selectors should be correct", async () => {
        expect(await unitroller.facetFunctionSelectors(OLD_MARKET_FACET)).to.deep.equal(marketFacetFunctionSelectors);
        expect(await unitroller.facetFunctionSelectors(NEW_MARKET_FACET)).to.deep.equal([]);
      });

      it("policy facet function selectors should be correct", async () => {
        expect(await unitroller.facetFunctionSelectors(OLD_POLICY_FACET)).to.deep.equal(policyFacetFunctionSelectors);
        expect(await unitroller.facetFunctionSelectors(NEW_POLICY_FACET)).to.deep.equal([]);
      });

      it("setter facet function selectors should be correct", async () => {
        expect(await unitroller.facetFunctionSelectors(OLD_SETTER_FACET)).to.deep.equal(setterFacetFuntionSelectors);
        expect(await unitroller.facetFunctionSelectors(NEW_SETTER_FACET)).to.deep.equal([]);
      });

      it("reward facet function selectors should be correct", async () => {
        expect(await unitroller.facetFunctionSelectors(OLD_REWARD_FACET)).to.deep.equal(rewardFacetFuntionSelectors);
        expect(await unitroller.facetFunctionSelectors(NEW_REWARD_FACET)).to.deep.equal([]);
      });

      it("unitroller should contain only old facet addresses", async () => {
        expect(await unitroller.facetAddresses()).to.include(OLD_SETTER_FACET);
        expect(await unitroller.facetAddresses()).to.include(OLD_POLICY_FACET);
        expect(await unitroller.facetAddresses()).to.include(OLD_MARKET_FACET);
        expect(await unitroller.facetAddresses()).to.include(OLD_REWARD_FACET);

        expect(await unitroller.facetAddresses()).to.not.include(NEW_SETTER_FACET);
        expect(await unitroller.facetAddresses()).to.not.include(NEW_POLICY_FACET);
        expect(await unitroller.facetAddresses()).to.not.include(NEW_MARKET_FACET);
        expect(await unitroller.facetAddresses()).to.not.include(NEW_REWARD_FACET);
      });
    });

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

  testVip("VIP-545", await vip545(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [DIAMOND_ABI], ["DiamondCut"], [1]);
      await expectEvents(txResponse, [UNITROLLER_ABI], ["NewImplementation"], [41]);
    },
  });

  describe("Post-VIP behavior", async () => {
    describe("facets", async () => {
      it("market facet function selectors should be updated for new facet address", async () => {
        const expectSelectors = [...marketFacetFunctionSelectors].sort();
        const updatedSelectors = [...(await unitroller.facetFunctionSelectors(NEW_MARKET_FACET))].sort();

        expect(updatedSelectors).to.deep.equal(expectSelectors);
        expect(await unitroller.facetFunctionSelectors(OLD_MARKET_FACET)).to.deep.equal([]);
      });

      it("policy facet function selectors should be updated for new facet address", async () => {
        const expectSelectors = [...policyFacetFunctionSelectors].sort();
        const updatedSelectors = [...(await unitroller.facetFunctionSelectors(NEW_POLICY_FACET))].sort();

        expect(updatedSelectors).to.deep.equal(expectSelectors);
        expect(await unitroller.facetFunctionSelectors(OLD_POLICY_FACET)).to.deep.equal([]);
      });

      it("setter facet function selectors should be updated for new facet address", async () => {
        const expectSelectors = [...setterFacetFuntionSelectors].sort();
        const updatedSelectors = [...(await unitroller.facetFunctionSelectors(NEW_SETTER_FACET))].sort();

        expect(updatedSelectors).to.deep.equal(expectSelectors);
        expect(await unitroller.facetFunctionSelectors(OLD_SETTER_FACET)).to.deep.equal([]);
      });

      it("reward facet function selectors should be updated for new facet address", async () => {
        const expectSelectors = [...rewardFacetFuntionSelectors].sort();
        const updatedSelectors = [...(await unitroller.facetFunctionSelectors(NEW_REWARD_FACET))].sort();

        expect(updatedSelectors).to.deep.equal(expectSelectors);
        expect(await unitroller.facetFunctionSelectors(OLD_REWARD_FACET)).to.deep.equal([]);
      });
    });

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
