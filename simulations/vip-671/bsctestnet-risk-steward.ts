import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";
import { checkRiskStewardFlow } from "src/vip-framework/checks/checkRiskStewardFlow";

import { ACM, IRM_SPOKE, SPOKE_COMPTROLLER, VTSLAB_SPOKE, VUSDT_SPOKE } from "../../vips/vip-671/addresses/bsctestnet";
import vip671RiskSteward, {
  COLLATERAL_FACTORS_RISK_STEWARD,
  IRM_RISK_STEWARD,
  MARKET_CAPS_RISK_STEWARD,
  RISK_STEWARD_RECEIVER,
  STEWARD_GRANTS,
} from "../../vips/vip-671/bsctestnet-risk-steward";
import ACM_ABI from "./abi/AccessControlManager.json";
import RECEIVER_ABI from "./abi/RiskStewardReceiver.json";
// Post-addendum-2 ABI: has `UnsafeLiquidationParams`, which ./abi/SpokeComptroller.json predates.
import COMPTROLLER_ABI from "./abi/SpokeComptrollerV2.json";
import VTOKEN_ABI from "./abi/VToken.json";

const FORK_BLOCK = 136939367;

/// Holds no role anywhere.
const UNPRIVILEGED = "0x0000000000000000000000000000000000000100";
/// No grant names this contract, so a role that works from here is a wildcard.
const UNRELATED_CONTRACT = "0x0000000000000000000000000000000000000200";

/// A collateral market listed after VIP-671, with nonzero collateral factors for the flow check.
const VSPCXB_HUBSPOKE = "0x7157241D1eaA53C823f292b605522B2B3adC1496";

/// The Risk Oracle and the account VIP-592 authorised on it and whitelisted on the receiver (vips/vip-592/bsctestnet-2.ts).
const RISK_ORACLE = "0x4DEA4D1A9F6101D4adacE89f16064D780D2F241d";
const RISK_PARAMETER_SENDER = "0xe2a089cA69a90f1E27E723EFD339Cff4c4701AcC";
/// Only for the test: an isolated-pools `JumpRateModelV2` (base 0, slope 3.5%, jump 80%, kink 80%, 70,080,000 blocks a
/// year) from isolated-pools deployments/bsctestnet, which no spoke market uses. The Core pool models are not
/// compatible: a spoke VToken reverts on `borrowRatePerBlock` after switching to one.
const ALTERNATE_IRM = "0xCaD99b428111930B588a815d9c187B2aaEaA86Df";

/// `isAllowedToCall` keys the role on `msg.sender`, so the question is asked from the contract's own address.
const acm = new ethers.Contract(ACM, ACM_ABI, ethers.provider);
const mayCall = (contract: string, account: string, signature: string): Promise<boolean> =>
  acm.callStatic.isAllowedToCall(account, signature, { from: contract });

forking(FORK_BLOCK, async () => {
  const comptroller = new ethers.Contract(SPOKE_COMPTROLLER, COMPTROLLER_ABI, ethers.provider);
  const vTSLAB = new ethers.Contract(VTSLAB_SPOKE, VTOKEN_ABI, ethers.provider);
  const receiver = new ethers.Contract(RISK_STEWARD_RECEIVER, RECEIVER_ABI, ethers.provider);

  describe("Pre-VIP state", () => {
    it("routes the four update types to the three stewards this proposal grants", async () => {
      const expected = {
        supplyCap: MARKET_CAPS_RISK_STEWARD,
        borrowCap: MARKET_CAPS_RISK_STEWARD,
        collateralFactors: COLLATERAL_FACTORS_RISK_STEWARD,
        interestRateModel: IRM_RISK_STEWARD,
      };
      for (const [updateType, steward] of Object.entries(expected)) {
        const config = await receiver.getRiskParameterConfig(updateType);
        expect(config.active, updateType).to.be.true;
        expect(config.riskSteward, updateType).to.equal(steward);
      }
    });

    it("gives no steward any of the roles yet, on the comptroller, a market or as a wildcard", async () => {
      for (const { role, account } of STEWARD_GRANTS) {
        for (const contract of [SPOKE_COMPTROLLER, VTSLAB_SPOKE, UNRELATED_CONTRACT]) {
          expect(await mayCall(contract, account, role), `${account} ${role} on ${contract}`).to.be.false;
        }
      }
    });
  });

  testVip("VIP-671: risk stewards on the spoke pool", await vip671RiskSteward(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACM_ABI], ["RoleGranted"], [STEWARD_GRANTS.length]);
    },
  });

  describe("Post-VIP state", () => {
    it("grants every role as a wildcard, reaching the comptroller and a market", async () => {
      for (const { role, account } of STEWARD_GRANTS) {
        for (const contract of [SPOKE_COMPTROLLER, VTSLAB_SPOKE, UNRELATED_CONTRACT]) {
          expect(await mayCall(contract, account, role), `${account} ${role} on ${contract}`).to.be.true;
        }
        expect(await mayCall(SPOKE_COMPTROLLER, UNPRIVILEGED, role), `${role} is open`).to.be.false;
      }
    });
  });

  describe("Post-VIP behaviour, as the stewards", () => {
    let capsSteward: Awaited<ReturnType<typeof initMainnetUser>>;
    let factorsSteward: Awaited<ReturnType<typeof initMainnetUser>>;
    let irmSteward: Awaited<ReturnType<typeof initMainnetUser>>;
    let collateralFactor: BigNumber;
    let liquidationThreshold: BigNumber;

    before(async () => {
      capsSteward = await initMainnetUser(MARKET_CAPS_RISK_STEWARD, ethers.utils.parseEther("1"));
      factorsSteward = await initMainnetUser(COLLATERAL_FACTORS_RISK_STEWARD, ethers.utils.parseEther("1"));
      irmSteward = await initMainnetUser(IRM_RISK_STEWARD, ethers.utils.parseEther("1"));
      const market = await comptroller.markets(VTSLAB_SPOKE);
      collateralFactor = market.collateralFactorMantissa;
      liquidationThreshold = market.liquidationThresholdMantissa;
    });

    it("lets the caps steward set a supply cap", async () => {
      const cap: BigNumber = await comptroller.supplyCaps(VTSLAB_SPOKE);
      await comptroller.connect(capsSteward).setMarketSupplyCaps([VTSLAB_SPOKE], [cap.mul(2)]);
      expect(await comptroller.supplyCaps(VTSLAB_SPOKE)).to.equal(cap.mul(2));
    });

    it("lets the collateral factors steward set a collateral factor, under the pool's own checks", async () => {
      await comptroller
        .connect(factorsSteward)
        .setCollateralFactor(VTSLAB_SPOKE, collateralFactor.sub(1), liquidationThreshold);
      expect((await comptroller.markets(VTSLAB_SPOKE)).collateralFactorMantissa).to.equal(collateralFactor.sub(1));

      // A threshold below the collateral factor, and one the incentive makes unsafe, still revert for the steward.
      await expect(
        comptroller
          .connect(factorsSteward)
          .setCollateralFactor(VTSLAB_SPOKE, collateralFactor, collateralFactor.sub(1)),
      ).to.be.revertedWithCustomError(comptroller, "InvalidLiquidationThreshold");
      const incentive: BigNumber = await comptroller.liquidationIncentiveMantissa();
      const unsafeThreshold = ethers.utils.parseUnits("1", 36).add(incentive).sub(1).div(incentive);
      await expect(
        comptroller.connect(factorsSteward).setCollateralFactor(VTSLAB_SPOKE, collateralFactor, unsafeThreshold),
      ).to.be.revertedWithCustomError(comptroller, "UnsafeLiquidationParams");
    });

    it("lets the rate model steward set a market's interest rate model", async () => {
      expect(await vTSLAB.interestRateModel()).to.equal(IRM_SPOKE);
      await expect(vTSLAB.connect(irmSteward).setInterestRateModel(ALTERNATE_IRM))
        .to.emit(vTSLAB, "NewMarketInterestRateModel")
        .withArgs(IRM_SPOKE, ALTERNATE_IRM);
      expect(await vTSLAB.interestRateModel()).to.equal(ALTERNATE_IRM);
      // The market still prices through the new model.
      await vTSLAB.borrowRatePerBlock();
    });

    it("still refuses an account that holds nothing", async () => {
      const outsider = await initMainnetUser(UNPRIVILEGED, ethers.utils.parseEther("1"));
      await expect(
        comptroller.connect(outsider).setMarketSupplyCaps([VTSLAB_SPOKE], [1]),
      ).to.be.revertedWithCustomError(comptroller, "Unauthorized");
    });
  });

  describe("Post-VIP behaviour, through the Risk Oracle and receiver", () => {
    checkRiskStewardFlow({
      riskOracle: RISK_ORACLE,
      receiver: RISK_STEWARD_RECEIVER,
      comptroller: SPOKE_COMPTROLLER,
      authorizedSender: RISK_PARAMETER_SENDER,
      executor: RISK_PARAMETER_SENDER,
      capsMarket: VUSDT_SPOKE,
      collateralMarket: VSPCXB_HUBSPOKE,
      alternateInterestRateModel: ALTERNATE_IRM,
    });
  });
});
