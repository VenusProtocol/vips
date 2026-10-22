import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES, ORACLE_BNB } from "src/networkAddresses";
import { expectEvents, setMaxStalePeriodForAllAssets } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip712, {
  COLLATERAL_GATEWAY,
  ENTER_MARKET_FOR_ACCOUNT_SIGNATURE,
  NEW_COMPTROLLER_LENS,
  NEW_MARKET_FACET,
  OLD_COMPTROLLER_LENS,
  OLD_MARKET_FACET,
  PRIME,
  PRIME_NEW_IMPLEMENTATION,
} from "../../vips/vip-712/bscmainnet";
import ACM_ABI from "./abi/AccessControlManager.json";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import DIAMOND_ABI from "./abi/Diamond.json";
import ERC20_ABI from "./abi/ERC20.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";

const { bscmainnet } = NETWORK_ADDRESSES;

const ENTER_MARKET_FOR_ACCOUNT_SELECTOR = "0x2e30a93c";

const USDT = "0x55d398326f99059fF775485246999027B3197955";
const VUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
const VBNB = "0xA07c5b74C9B40447a954e1466938b865b6BBea36";
const REPAY_AMOUNT = ethers.utils.parseUnits("1000", 18);

// EIP-1967 implementation slot: keccak256("eip1967.proxy.implementation") - 1
const IMPLEMENTATION_SLOT = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";

// Role the AccessControlManager stores for one function on one contract.
const callPermissionRole = (target: string, signature: string) =>
  ethers.utils.keccak256(ethers.utils.solidityPack(["address", "string"], [target, signature]));

// Reads the address held in the EIP-1967 implementation slot of a proxy.
const readImplementation = async (proxy: string) => {
  const raw = await ethers.provider.getStorageAt(proxy, IMPLEMENTATION_SLOT);
  return ethers.utils.getAddress(ethers.utils.hexDataSlice(raw, 12));
};

forking(129099700, async () => {
  const provider = ethers.provider;
  let unitroller: Contract;
  let acm: Contract;
  let oldMarketFacetSelectors: string[];
  let seizeTokensBefore: BigNumber;

  before(async () => {
    unitroller = new ethers.Contract(bscmainnet.UNITROLLER, COMPTROLLER_ABI, provider);
    acm = new ethers.Contract(bscmainnet.ACCESS_CONTROL_MANAGER, ACM_ABI, provider);
    oldMarketFacetSelectors = await unitroller.facetFunctionSelectors(OLD_MARKET_FACET);

    // Governance time travel leaves every feed stale, so widen the stale period for the two
    // markets the seize check prices.
    const resilientOracle = new ethers.Contract(bscmainnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
    await setMaxStalePeriodForAllAssets(resilientOracle, [
      new ethers.Contract(USDT, ERC20_ABI, provider),
      new ethers.Contract(ORACLE_BNB, ERC20_ABI, provider),
    ]);

    [, seizeTokensBefore] = await unitroller["liquidateCalculateSeizeTokens(address,address,uint256)"](
      VUSDT,
      VBNB,
      REPAY_AMOUNT,
    );
  });

  describe("Pre-VIP behavior", async () => {
    it("MarketFacet routes 31 selectors from the old facet", async () => {
      expect(oldMarketFacetSelectors).to.have.lengthOf(31);
      expect(await unitroller.facetAddresses()).to.include(OLD_MARKET_FACET);
      expect(await unitroller.facetFunctionSelectors(NEW_MARKET_FACET)).to.deep.equal([]);
    });

    it("enterMarketForAccount is not routed", async () => {
      expect(oldMarketFacetSelectors).to.not.include(ENTER_MARKET_FOR_ACCOUNT_SELECTOR);
    });

    it("Prime proxy points at the old implementation", async () => {
      expect(await readImplementation(PRIME)).to.not.equal(PRIME_NEW_IMPLEMENTATION);
    });

    it("gateway cannot call enterMarketForAccount", async () => {
      const role = callPermissionRole(bscmainnet.UNITROLLER, ENTER_MARKET_FOR_ACCOUNT_SIGNATURE);
      expect(await acm.hasRole(role, COLLATERAL_GATEWAY)).to.equal(false);
    });

    it("gateway is not a whitelisted flash loan account", async () => {
      expect(await unitroller.authorizedFlashLoan(COLLATERAL_GATEWAY)).to.equal(false);
    });

    it("Normal Timelock already holds the flash loan whitelist permission", async () => {
      const role = callPermissionRole(bscmainnet.UNITROLLER, "setWhiteListFlashLoanAccount(address,bool)");
      expect(await acm.hasRole(role, bscmainnet.NORMAL_TIMELOCK)).to.equal(true);
    });

    it("Comptroller uses the old lens", async () => {
      expect(await unitroller.comptrollerLens()).to.equal(OLD_COMPTROLLER_LENS);
      expect(seizeTokensBefore).to.be.gt(0);
    });
  });

  testVip("vip-712", await vip712(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [DIAMOND_ABI], ["DiamondCut"], [1]);
      await expectEvents(txResponse, [ACM_ABI], ["RoleGranted"], [1]);
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewComptrollerLens"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Prime proxy points at the new implementation", async () => {
      expect(await readImplementation(PRIME)).to.equal(ethers.utils.getAddress(PRIME_NEW_IMPLEMENTATION));
    });

    it("all MarketFacet selectors move to the new facet", async () => {
      const expected = [...oldMarketFacetSelectors, ENTER_MARKET_FOR_ACCOUNT_SELECTOR].sort();
      const actual = [...(await unitroller.facetFunctionSelectors(NEW_MARKET_FACET))].sort();

      expect(actual).to.deep.equal(expected);
      expect(await unitroller.facetFunctionSelectors(OLD_MARKET_FACET)).to.deep.equal([]);
      expect(await unitroller.facetAddresses()).to.include(NEW_MARKET_FACET);
      expect(await unitroller.facetAddresses()).to.not.include(OLD_MARKET_FACET);
    });

    it("gateway can call enterMarketForAccount", async () => {
      const role = callPermissionRole(bscmainnet.UNITROLLER, ENTER_MARKET_FOR_ACCOUNT_SIGNATURE);
      expect(await acm.hasRole(role, COLLATERAL_GATEWAY)).to.equal(true);
    });

    it("gateway is a whitelisted flash loan account", async () => {
      expect(await unitroller.authorizedFlashLoan(COLLATERAL_GATEWAY)).to.equal(true);
    });

    it("Comptroller uses the new lens and seize amounts for 18-decimal markets are unchanged", async () => {
      expect(await unitroller.comptrollerLens()).to.equal(NEW_COMPTROLLER_LENS);
      const [err, seizeTokensAfter] = await unitroller["liquidateCalculateSeizeTokens(address,address,uint256)"](
        VUSDT,
        VBNB,
        REPAY_AMOUNT,
      );
      expect(err).to.equal(0);
      // The old lens truncates the ratio before multiplying by the repay amount, so the two
      // results differ only by that rounding: well under one part per million.
      expect(seizeTokensAfter).to.be.closeTo(seizeTokensBefore, seizeTokensBefore.div(1_000_000));
    });
  });
});
