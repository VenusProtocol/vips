import { TransactionResponse } from "@ethersproject/providers";
import { parseUnits } from "@ethersproject/units";
import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip544, {
  MARKET_CAP_RISK_STEWARD_BSCMAINNET,
  RISK_STEWARD_RECEIVER_BSCMAINNET,
} from "../../vips/vip-544/bscmainnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";
import COMPTROLLER_ABI from "./abi/Comproller.json";
import DIAMOND_ABI from "./abi/Diamond.json";
import ISOLATED_POOL_COMPTROLLER_ABI from "./abi/IsolatedPoolComptroller.json";
import VENUS_RISK_STEWARD_RECEIVER_ABI from "./abi/VenusRiskStewardReceiver.json";

const { bscmainnet } = NETWORK_ADDRESSES;

const OLD_SETTER_FACET = "0x9B0D9D7c50d90f23449c4BbCAA671Ce7cd19DbCf";
const OLD_MARKET_FACET = "0x4b093a3299F39615bA6b34B7897FDedCe7b83D63";
const OLD_POLICY_FACET = "0x93e7Ff7c87B496aE76fFb22d437c9d46461A9B51";

const NEW_SETTER_FACET = "0x9D1fdD581Bd6E638A7b98ac5567248A0c4E88f64";
const NEW_MARKET_FACET = "0x94573965fbCCAC5cD4558208A8cCB3F18E71B7Db";
const NEW_POLICY_FACET = "0x5bb2Dfe996629E558Cd5BDBfC4c0eC7367BB96E9";

const UNCHANGED_REWARD_FACET = "0xc2F6bDCEa4907E8CB7480d3d315bc01c125fb63C";

const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

forking(61240501, async () => {
  const provider = ethers.provider;
  let unitroller: Contract;
  let acm: Contract;
  let isolatedPoolComptroller: Contract;

  let marketFacetFunctionSelectors: string[];
  let policyFacetFunctionSelectors: string[];
  let rewardFacetFuntionSelectors: string[];
  let setterFacetFuntionSelectors: string[];

  before(async () => {
    unitroller = new ethers.Contract(bscmainnet.UNITROLLER, COMPTROLLER_ABI, provider);
    rewardFacetFuntionSelectors = await unitroller.facetFunctionSelectors(UNCHANGED_REWARD_FACET);
    setterFacetFuntionSelectors = await unitroller.facetFunctionSelectors(OLD_SETTER_FACET);
    marketFacetFunctionSelectors = await unitroller.facetFunctionSelectors(OLD_MARKET_FACET);
    policyFacetFunctionSelectors = await unitroller.facetFunctionSelectors(OLD_POLICY_FACET);

    acm = new ethers.Contract(bscmainnet.ACCESS_CONTROL_MANAGER, ACCESS_CONTROL_MANAGER_ABI, provider);
    isolatedPoolComptroller = new ethers.Contract(
      "0x1b43ea8622e76627B81665B1eCeBB4867566B963",
      ISOLATED_POOL_COMPTROLLER_ABI,
      provider,
    );
  });

  describe("Pre-VIP behaviour", async () => {
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
      expect(await unitroller.facetFunctionSelectors(UNCHANGED_REWARD_FACET)).to.deep.equal(
        rewardFacetFuntionSelectors,
      );
    });

    it("unitroller should contain only old facet addresses", async () => {
      expect(await unitroller.facetAddresses()).to.include(OLD_SETTER_FACET);
      expect(await unitroller.facetAddresses()).to.include(OLD_POLICY_FACET);
      expect(await unitroller.facetAddresses()).to.include(OLD_MARKET_FACET);
      expect(await unitroller.facetAddresses()).to.include(UNCHANGED_REWARD_FACET);

      expect(await unitroller.facetAddresses()).to.not.include(NEW_SETTER_FACET);
      expect(await unitroller.facetAddresses()).to.not.include(NEW_POLICY_FACET);
      expect(await unitroller.facetAddresses()).to.not.include(NEW_MARKET_FACET);
    });

    it("normal timelock is not owner of risk steward receiver", async () => {
      const riskStewardReceiver = new ethers.Contract(
        RISK_STEWARD_RECEIVER_BSCMAINNET,
        VENUS_RISK_STEWARD_RECEIVER_ABI,
        provider,
      );
      expect(await riskStewardReceiver.owner()).to.not.equal(bscmainnet.NORMAL_TIMELOCK);
    });

    it("normal timelock is not owner of market cap risk steward", async () => {
      const marketCapRiskSteward = new ethers.Contract(
        MARKET_CAP_RISK_STEWARD_BSCMAINNET,
        VENUS_RISK_STEWARD_RECEIVER_ABI,
        provider,
      );
      expect(await marketCapRiskSteward.owner()).to.not.equal(bscmainnet.NORMAL_TIMELOCK);
    });
  });

  testVip("vip-544", await vip544(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(
        txResponse,
        [DIAMOND_ABI, ACCESS_CONTROL_MANAGER_ABI, VENUS_RISK_STEWARD_RECEIVER_ABI],
        ["DiamondCut", "RiskParameterConfigSet", "RoleGranted"],
        [1, 2, 17],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    it("market facet function selectors should be updated for new facet address", async () => {
      const newMarketFacetFunctionSelectors = ["0x3d98a1e5", "0xcab4f84c"];

      const expectSelectors = [...marketFacetFunctionSelectors, ...newMarketFacetFunctionSelectors].sort();
      const updatedSelectors = [...(await unitroller.facetFunctionSelectors(NEW_MARKET_FACET))].sort();

      expect(updatedSelectors).to.deep.equal(expectSelectors);
      expect(await unitroller.facetFunctionSelectors(OLD_MARKET_FACET)).to.deep.equal([]);
    });

    it("policy facet function selectors should be updated for new facet address", async () => {
      const newPolicyFacetFunctionSelectors = ["0x528a174c"];

      const expectSelectors = [...policyFacetFunctionSelectors, ...newPolicyFacetFunctionSelectors].sort();
      const updatedSelectors = [...(await unitroller.facetFunctionSelectors(NEW_POLICY_FACET))].sort();

      expect(updatedSelectors).to.deep.equal(expectSelectors);
      expect(await unitroller.facetFunctionSelectors(OLD_POLICY_FACET)).to.deep.equal([]);
    });

    it("setter facet function selectors should be updated for new facet address", async () => {
      const newSetterFacetFunctionSelectors = [
        "0x8b3113f6",
        "0xc32094c7",
        "0x24aaa220",
        "0xd136af44",
        "0x186db48f",
        "0xa8431081",
        "0x5cc4fdeb",
        "0x12348e96",
        "0x530e784f",
      ];

      const expectSelectors = [...setterFacetFuntionSelectors, ...newSetterFacetFunctionSelectors].sort();
      const updatedSelectors = [...(await unitroller.facetFunctionSelectors(NEW_SETTER_FACET))].sort();

      expect(updatedSelectors).to.deep.equal(expectSelectors);
      expect(await unitroller.facetFunctionSelectors(OLD_SETTER_FACET)).to.deep.equal([]);
    });

    it("reward facet function selectors should not be changed", async () => {
      expect(await unitroller.facetFunctionSelectors(UNCHANGED_REWARD_FACET)).to.deep.equal(
        rewardFacetFuntionSelectors,
      );
    });

    it("unitroller should contain the new and old facet addresses", async () => {
      expect(await unitroller.facetAddresses()).to.include(NEW_SETTER_FACET);
      expect(await unitroller.facetAddresses()).to.include(NEW_POLICY_FACET);
      expect(await unitroller.facetAddresses()).to.include(NEW_MARKET_FACET);
      expect(await unitroller.facetAddresses()).to.include(UNCHANGED_REWARD_FACET);

      expect(await unitroller.facetAddresses()).to.not.include(OLD_SETTER_FACET);
      expect(await unitroller.facetAddresses()).to.not.include(OLD_POLICY_FACET);
      expect(await unitroller.facetAddresses()).to.not.include(OLD_MARKET_FACET);
    });

    it("grants Market Cap Risk Steward permissions to call setMarketSupplyCaps and setMarketBorrowCaps on any target contract (Isolated Pools)", async () => {
      const supplyCapRole = ethers.utils.solidityPack(
        ["address", "string"],
        [DEFAULT_ADMIN_ROLE, "setMarketSupplyCaps(address[],uint256[])"],
      );
      const supplyCapRoleHash = ethers.utils.keccak256(supplyCapRole);
      expect(await acm.hasRole(supplyCapRoleHash, MARKET_CAP_RISK_STEWARD_BSCMAINNET)).to.be.true;

      const borrowCapRole = ethers.utils.solidityPack(
        ["address", "string"],
        [DEFAULT_ADMIN_ROLE, "setMarketBorrowCaps(address[],uint256[])"],
      );
      const borrowCapRoleHash = ethers.utils.keccak256(borrowCapRole);
      expect(await acm.hasRole(borrowCapRoleHash, MARKET_CAP_RISK_STEWARD_BSCMAINNET)).to.be.true;
    });

    it("does not grant permissions for Market Cap Risk Steward to call CORE pool comptlorer", async () => {
      const supplyCapCorePoolRole = ethers.utils.solidityPack(
        ["address", "string"],
        [bscmainnet.UNITROLLER, "_setMarketSupplyCaps(address[],uint256[])"],
      );
      const supplyCapCorePoolRoleHash = ethers.utils.keccak256(supplyCapCorePoolRole);
      expect(await acm.hasRole(supplyCapCorePoolRoleHash, MARKET_CAP_RISK_STEWARD_BSCMAINNET)).to.be.false;

      const borrowCapCorePoolRole = ethers.utils.solidityPack(
        ["address", "string"],
        [bscmainnet.UNITROLLER, "_setMarketSupplyCaps(address[],uint256[])"],
      );
      const borrowCapCorePoolRoleHash = ethers.utils.keccak256(borrowCapCorePoolRole);
      expect(await acm.hasRole(borrowCapCorePoolRoleHash, MARKET_CAP_RISK_STEWARD_BSCMAINNET)).to.be.false;
    });

    it("grants timelocks and guardian permissions to pause and unpause Risk Steward Receiver", async () => {
      const pauseRole = ethers.utils.solidityPack(["address", "string"], [RISK_STEWARD_RECEIVER_BSCMAINNET, "pause()"]);
      const pauseRoleHash = ethers.utils.keccak256(pauseRole);
      expect(await acm.hasRole(pauseRoleHash, bscmainnet.GUARDIAN)).to.be.true;
      expect(await acm.hasRole(pauseRoleHash, bscmainnet.NORMAL_TIMELOCK)).to.be.true;
      expect(await acm.hasRole(pauseRoleHash, bscmainnet.CRITICAL_TIMELOCK)).to.be.true;
      expect(await acm.hasRole(pauseRoleHash, bscmainnet.FAST_TRACK_TIMELOCK)).to.be.true;

      const unpauseRole = ethers.utils.solidityPack(
        ["address", "string"],
        [RISK_STEWARD_RECEIVER_BSCMAINNET, "unpause()"],
      );
      const unpauseRoleHash = ethers.utils.keccak256(unpauseRole);
      expect(await acm.hasRole(unpauseRoleHash, bscmainnet.GUARDIAN)).to.be.true;
      expect(await acm.hasRole(unpauseRoleHash, bscmainnet.NORMAL_TIMELOCK)).to.be.true;
      expect(await acm.hasRole(unpauseRoleHash, bscmainnet.CRITICAL_TIMELOCK)).to.be.true;
      expect(await acm.hasRole(unpauseRoleHash, bscmainnet.FAST_TRACK_TIMELOCK)).to.be.true;
    });

    it("Market Cap Risk Steward should be able to set supply and borrow caps on markets", async () => {
      await impersonateAccount(MARKET_CAP_RISK_STEWARD_BSCMAINNET);
      await setBalance(MARKET_CAP_RISK_STEWARD_BSCMAINNET, parseUnits("1000000", 18));

      await expect(
        isolatedPoolComptroller
          .connect(await ethers.getSigner(MARKET_CAP_RISK_STEWARD_BSCMAINNET))
          .setMarketSupplyCaps(["0xef470AbC365F88e4582D8027172a392C473A5B53"], ["150000000000000000000000"]),
      ).to.emit(isolatedPoolComptroller, "NewSupplyCap");

      await expect(
        isolatedPoolComptroller
          .connect(await ethers.getSigner(MARKET_CAP_RISK_STEWARD_BSCMAINNET))
          .setMarketBorrowCaps(["0xef470AbC365F88e4582D8027172a392C473A5B53"], ["55000000000000000000000"]),
      ).to.emit(isolatedPoolComptroller, "NewBorrowCap");
    });

    it("normal timelock is owner of risk steward receiver", async () => {
      const riskStewardReceiver = new ethers.Contract(
        RISK_STEWARD_RECEIVER_BSCMAINNET,
        VENUS_RISK_STEWARD_RECEIVER_ABI,
        provider,
      );
      expect(await riskStewardReceiver.owner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
    });

    it("normal timelock is owner of market cap risk steward", async () => {
      const marketCapRiskSteward = new ethers.Contract(
        MARKET_CAP_RISK_STEWARD_BSCMAINNET,
        VENUS_RISK_STEWARD_RECEIVER_ABI,
        provider,
      );
      expect(await marketCapRiskSteward.owner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
    });

    it("Risk Steward Receiver should be paused", async () => {
      const riskStewardReceiver = new ethers.Contract(
        RISK_STEWARD_RECEIVER_BSCMAINNET,
        VENUS_RISK_STEWARD_RECEIVER_ABI,
        provider,
      );
      expect(await riskStewardReceiver.paused()).to.be.true;
    });
  });
});
