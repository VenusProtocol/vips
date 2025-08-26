import { TransactionResponse } from "@ethersproject/providers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  ACM,
  CORE_MARKETS,
  CURRENT_LIQUIDATION_INCENTIVE,
  LIQUIDATOR,
  NEW_COMPTROLLER_LENS,
  NEW_COMPT_METHODS,
  NEW_DIAMOND,
  NEW_LIQUIDATOR_IMPL,
  NEW_VAI_CONTROLLER,
  NEW_VBEP20_DELEGATE,
  OLD_COMPTROLLER_LENS,
  OLD_DIAMOND,
  OLD_LIQUIDATOR_IMPL,
  OLD_VAI_CONTROLLER,
  PROXY_ADMIN,
  UNITROLLER,
  VAI_UNITROLLER,
  vip550,
} from "../../vips/vip-550/bsctestnet";
import ACM_ABI from "./abi/AccessControlManager.json";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import UNITROLLER_ABI from "./abi/Diamond.json";
import LIQUIDATOR_PROXY_ABI from "./abi/LiquidatorProxy.json";
import VAI_UNITROLLR_ABI from "./abi/VAIUnitroller.json";
import VBEP20_DELEGATOR_ABI from "./abi/VBEP20Delegator.json";
import { cutParams as params } from "./utils/bsctestnet-cut-params.json";

type CutParam = [string, number, string[]];
const cutParams = params as unknown as CutParam[];

const OLD_SETTER_FACET = "0xb619F7ce96c0a6E3F0b44e993f663522F79f294A";
const OLD_REWARD_FACET = "0x905006DCD5DbAa9B67359bcB341a0C49AfC8d0A6";
const OLD_MARKET_FACET = "0x377c2E7CE08B4cc7033EDF678EE1224A290075Fd";
const OLD_POLICY_FACET = "0x671B787AEDB6769972f081C6ee4978146F7D92E6";

const NEW_SETTER_FACET = "0xe41Ab9b0ea3edD4cE3108650056641F1E361246c";
const NEW_REWARD_FACET = "0x0CB4FdDA118Da048B9AAaC15f34662C6AB34F5dB";
const NEW_MARKET_FACET = "0xfdFd4BEdc16339fE2dfa19Bab8bC9B8DA4149F75";
const NEW_POLICY_FACET = "0x284d000665296515280a4fB066a887EFF6A3bD9E";

forking(63158889, async () => {
  let unitroller: Contract;
  let comptroller: Contract;
  let accessControlManager: Contract;
  let vaiUnitroller: Contract;
  let liquidator: Contract;
  let proxyAdmin: SignerWithAddress;

  before(async () => {
    unitroller = await ethers.getContractAt(UNITROLLER_ABI, UNITROLLER);
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, UNITROLLER);
    accessControlManager = await ethers.getContractAt(ACM_ABI, ACM);
    vaiUnitroller = await ethers.getContractAt(VAI_UNITROLLR_ABI, VAI_UNITROLLER);
    liquidator = await ethers.getContractAt(LIQUIDATOR_PROXY_ABI, LIQUIDATOR);
    proxyAdmin = await initMainnetUser(PROXY_ADMIN, parseUnits("2", 18));
  });

  describe("Pre-VIP state", async () => {
    it("unitroller should have old implementation", async () => {
      expect((await unitroller.comptrollerImplementation()).toLowerCase()).to.equal(OLD_DIAMOND.toLowerCase());
    });

    it("comptroller should have old comptrollerLens", async () => {
      expect((await comptroller.comptrollerLens()).toLowerCase()).to.equal(OLD_COMPTROLLER_LENS.toLowerCase());
    });

    it("VAI Unitroller should point to old VAI Controller", async () => {
      expect(await vaiUnitroller.vaiControllerImplementation()).to.equal(OLD_VAI_CONTROLLER);
    });

    it("Liquidator should point to old implementation", async () => {
      const impl = await liquidator.connect(proxyAdmin).callStatic.implementation();
      expect(impl.toLowerCase()).to.equal(OLD_LIQUIDATOR_IMPL.toLowerCase());
    });
  });

  testVip("VIP-550", await vip550(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [UNITROLLER_ABI], ["DiamondCut"], [1]);
    },
  });

  describe("Post-VIP state", async () => {
    it("unitroller should have new implementation", async () => {
      expect((await unitroller.comptrollerImplementation()).toLowerCase()).to.equal(NEW_DIAMOND.toLowerCase());
    });

    it("market facet function selectors should be replaced with new facet address", async () => {
      const functionSelectors = [...cutParams[0][2], ...cutParams[1][2]];
      expect(await unitroller.facetFunctionSelectors(NEW_MARKET_FACET)).to.deep.equal(functionSelectors);
      expect(await unitroller.facetFunctionSelectors(OLD_MARKET_FACET)).to.deep.equal([]);
    });

    it("policy facet function selectors should be replaced with new facet address", async () => {
      const functionSelectors = [...cutParams[2][2]];
      expect(await unitroller.facetFunctionSelectors(NEW_POLICY_FACET)).to.deep.equal(functionSelectors);
      expect(await unitroller.facetFunctionSelectors(OLD_POLICY_FACET)).to.deep.equal([]);
    });

    it("reward facet function selectors should be replaced with new facet address", async () => {
      const functionSelectors = [...cutParams[3][2]];

      expect(await unitroller.facetFunctionSelectors(NEW_REWARD_FACET)).to.deep.equal(functionSelectors);
      expect(await unitroller.facetFunctionSelectors(OLD_REWARD_FACET)).to.deep.equal([]);
    });

    it("setter facet function selectors should be replaced with new facet address", async () => {
      const functionSelectors = [...cutParams[4][2], ...cutParams[5][2]];

      expect(await unitroller.facetFunctionSelectors(NEW_SETTER_FACET)).to.deep.equal(functionSelectors);
      expect(await unitroller.facetFunctionSelectors(OLD_SETTER_FACET)).to.deep.equal([]);
    });

    it("unitroller should contain the new facet addresses", async () => {
      expect(await unitroller.facetAddresses()).to.include(NEW_SETTER_FACET, NEW_REWARD_FACET);
      expect(await unitroller.facetAddresses()).to.include(NEW_MARKET_FACET, NEW_POLICY_FACET);

      expect(await unitroller.facetAddresses()).to.not.include(OLD_SETTER_FACET, OLD_REWARD_FACET);
      expect(await unitroller.facetAddresses()).to.not.include(OLD_MARKET_FACET, OLD_POLICY_FACET);
    });

    it("Check removed permission", async () => {
      expect(
        await accessControlManager.hasPermission(
          NETWORK_ADDRESSES.bsctestnet.NORMAL_TIMELOCK,
          UNITROLLER,
          "_setCollateralFactor(address,uint256)",
        ),
      ).to.equal(false);
      expect(
        await accessControlManager.hasPermission(
          NETWORK_ADDRESSES.bsctestnet.NORMAL_TIMELOCK,
          UNITROLLER,
          "_setLiquidationIncentive(uint256)",
        ),
      ).to.equal(false);
    });

    it("Check new permission", async () => {
      for (const method of NEW_COMPT_METHODS) {
        expect(
          await accessControlManager.hasPermission(NETWORK_ADDRESSES.bsctestnet.NORMAL_TIMELOCK, UNITROLLER, method),
        ).to.equal(true);
      }
    });

    it("comptroller should have new comptrollerLens", async () => {
      expect((await comptroller.comptrollerLens()).toLowerCase()).to.equal(NEW_COMPTROLLER_LENS.toLowerCase());
    });

    it("markets should have new implemenation", async () => {
      for (const market of CORE_MARKETS) {
        const marketContract = await ethers.getContractAt(VBEP20_DELEGATOR_ABI, market.address);
        expect((await marketContract.implementation()).toLowerCase()).to.equal(NEW_VBEP20_DELEGATE.toLowerCase());
      }
    });
    it("comptroller should have correct markets value", async () => {
      for (const market of CORE_MARKETS) {
        const data = await comptroller.markets(market.address);
        expect(data[1]).to.be.equal(market.collateralFactor);
        expect(data[3]).to.be.equal(market.collateralFactor); // same LT
        expect(data[4]).to.be.equal(CURRENT_LIQUIDATION_INCENTIVE);
        expect(data[5]).to.be.equal(0); // corePool
        expect(data[6]).to.be.equal(true); // isBorrowAllowed
      }
    });
    it("VAI Controller should point to new impl", async () => {
      expect(await vaiUnitroller.vaiControllerImplementation()).to.equal(NEW_VAI_CONTROLLER);
    });
    it("Liquidator should point to new implementation", async () => {
      const impl = await liquidator.connect(proxyAdmin).callStatic.implementation();
      expect(impl.toLowerCase()).to.equal(NEW_LIQUIDATOR_IMPL.toLowerCase());
    });
  });
});
