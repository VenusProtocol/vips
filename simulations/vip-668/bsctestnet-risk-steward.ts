import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { ACM, IRM_SPOKE, SPOKE_COMPTROLLER, VTSLAB_SPOKE, VUSDT_SPOKE } from "../../vips/vip-668/addresses/bsctestnet";
import vip668RiskSteward, {
  COLLATERAL_FACTORS_RISK_STEWARD,
  IRM_RISK_STEWARD,
  MARKET_CAPS_RISK_STEWARD,
  RISK_STEWARD_RECEIVER,
  STEWARD_GRANTS,
} from "../../vips/vip-668/bsctestnet-risk-steward";
import ACM_ABI from "./abi/AccessControlManager.json";
import COLLATERAL_FACTORS_STEWARD_ABI from "./abi/CollateralFactorsRiskSteward.json";
import IRM_STEWARD_ABI from "./abi/IRMRiskSteward.json";
import MARKET_CAPS_STEWARD_ABI from "./abi/MarketCapsRiskSteward.json";
import ORACLE_ABI from "./abi/RiskOracle.json";
import RECEIVER_ABI from "./abi/RiskStewardReceiver.json";
// Post-addendum-2 ABI: has `UnsafeLiquidationParams`, which ./abi/SpokeComptroller.json predates.
import COMPTROLLER_ABI from "./abi/SpokeComptrollerV2.json";
import VTOKEN_ABI from "./abi/VToken.json";

const FORK_BLOCK = 136939367;

/// Holds no role anywhere.
const UNPRIVILEGED = "0x0000000000000000000000000000000000000100";
/// No grant names this contract, so a role that works from here is a wildcard.
const UNRELATED_CONTRACT = "0x0000000000000000000000000000000000000200";

/// A collateral market listed after VIP-668, with nonzero collateral factors for the flow check.
const VSPCXB_HUBSPOKE = "0x7157241D1eaA53C823f292b605522B2B3adC1496";

/// The Risk Oracle and the account VIP-592 authorised on it and whitelisted on the receiver (vips/vip-592/bsctestnet-2.ts).
const RISK_ORACLE = "0x4DEA4D1A9F6101D4adacE89f16064D780D2F241d";
const RISK_PARAMETER_SENDER = "0xe2a089cA69a90f1E27E723EFD339Cff4c4701AcC";
/// Only for the test: an isolated-pools `JumpRateModelV2` (base 0, slope 3.5%, jump 80%, kink 80%, 70,080,000 blocks a
/// year) from isolated-pools deployments/bsctestnet, which no spoke market uses. The Core pool models are not
/// compatible: a spoke VToken reverts on `borrowRatePerBlock` after switching to one.
const ALTERNATE_IRM = "0xCaD99b428111930B588a815d9c187B2aaEaA86Df";

const PENDING = 1;
const REJECTED = 3;
const MAX_BPS = 10000;

const abi = ethers.utils.defaultAbiCoder;
const encodeUint = (v: BigNumber) => abi.encode(["uint256"], [v]);
const encodeFactors = (cf: BigNumber, lt: BigNumber) => abi.encode(["uint256", "uint256"], [cf, lt]);
const encodeAddress = (a: string) => abi.encode(["address"], [a]);

const travel = async (seconds: BigNumber | number) => {
  await ethers.provider.send("evm_increaseTime", [BigNumber.from(seconds).add(1).toNumber()]);
  await ethers.provider.send("evm_mine", []);
};

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

  testVip("VIP-668: risk stewards on the spoke pool", await vip668RiskSteward(), {
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

  /// Every update type through the real path: publish to the Risk Oracle, process on `RiskStewardReceiver`, and let
  /// the steward apply it to the comptroller or vToken. Timelock, debounce, expiry and safe delta are read from the chain.
  describe("Post-VIP behaviour, through the Risk Oracle and receiver", () => {
    const oracle = new Contract(RISK_ORACLE, ORACLE_ABI, ethers.provider);
    const vToken = new Contract(VSPCXB_HUBSPOKE, VTOKEN_ABI, ethers.provider);
    let sender: Awaited<ReturnType<typeof initMainnetUser>>;
    let executor: Awaited<ReturnType<typeof initMainnetUser>>;
    let capsSteward: Contract;
    let factorsSteward: Contract;
    let irmSteward: Contract;
    /// Per update type: the receiver configures debounce and timelock separately for each.
    let config: Record<string, { debounce: BigNumber; timelock: BigNumber }>;
    let expiration: BigNumber;
    let capsDelta: BigNumber;
    let factorsDelta: BigNumber;

    /// Publishes one update as the authorised sender and returns its id.
    const publish = async (updateType: string, market: string, value: string, poolId = 0): Promise<BigNumber> => {
      const id = (await oracle.updateCounter()).add(1);
      await oracle.connect(sender).publishRiskParameterUpdate("sim", value, updateType, market, poolId, 0, "0x");
      return id;
    };

    /// Processes an update that the steward must refuse to execute directly, and proves it stays pending.
    const register = async (id: BigNumber) => {
      await expect(receiver.connect(executor).processUpdate(id))
        .to.emit(receiver, "UpdateRegistered")
        .and.not.to.emit(receiver, "UpdateExecuted");
      expect((await receiver.updates(id)).status).to.equal(PENDING);
      await expect(receiver.connect(executor).executeRegisteredUpdate(id)).to.be.revertedWithCustomError(
        receiver,
        "UpdateNotUnlocked",
      );
    };

    const executeAfterTimelock = async (updateType: string, id: BigNumber) => {
      await travel(config[updateType].timelock);
      await expect(receiver.connect(executor).executeRegisteredUpdate(id))
        .to.emit(receiver, "UpdateExecuted")
        .withArgs(id);
    };

    /// A fraction of the current value: `ratioBps` of 10000.
    const scaled = (value: BigNumber, ratioBps: number) => value.mul(ratioBps).div(MAX_BPS);

    before(async () => {
      sender = await initMainnetUser(RISK_PARAMETER_SENDER, ethers.utils.parseEther("1"));
      executor = sender;
      config = {};
      for (const updateType of ["supplyCap", "borrowCap", "collateralFactors", "interestRateModel"]) {
        config[updateType] = await receiver.getRiskParameterConfig(updateType);
      }
      expiration = await receiver.UPDATE_EXPIRATION_TIME();
      capsSteward = new Contract(MARKET_CAPS_RISK_STEWARD, MARKET_CAPS_STEWARD_ABI, ethers.provider);
      factorsSteward = new Contract(COLLATERAL_FACTORS_RISK_STEWARD, COLLATERAL_FACTORS_STEWARD_ABI, ethers.provider);
      irmSteward = new Contract(IRM_RISK_STEWARD, IRM_STEWARD_ABI, ethers.provider);
      capsDelta = await capsSteward.safeDeltaBps();
      factorsDelta = await factorsSteward.safeDeltaBps();
    });

    describe("supply cap", () => {
      it("executes a change within the safe delta directly", async () => {
        const current: BigNumber = await comptroller.supplyCaps(VUSDT_SPOKE);
        const next = current.add(scaled(current, capsDelta.div(2).toNumber()));
        const id = await publish("supplyCap", VUSDT_SPOKE, encodeUint(next));
        await expect(receiver.connect(executor).processUpdate(id)).to.emit(receiver, "UpdateExecuted").withArgs(id);
        expect(await comptroller.supplyCaps(VUSDT_SPOKE)).to.equal(next);
      });

      it("refuses a second update inside the debounce window, then accepts it after", async () => {
        const current: BigNumber = await comptroller.supplyCaps(VUSDT_SPOKE);
        const next = current.add(1);
        const early = await publish("supplyCap", VUSDT_SPOKE, encodeUint(next));
        await expect(receiver.connect(executor).processUpdate(early)).to.be.revertedWithCustomError(
          receiver,
          "UpdateTooFrequent",
        );
        await travel(config.supplyCap.debounce);
        const late = await publish("supplyCap", VUSDT_SPOKE, encodeUint(next));
        await expect(receiver.connect(executor).processUpdate(late)).to.emit(receiver, "UpdateExecuted");
        expect(await comptroller.supplyCaps(VUSDT_SPOKE)).to.equal(next);
      });

      it("timelocks a change outside the safe delta, then applies it", async () => {
        await travel(config.supplyCap.debounce);
        const current: BigNumber = await comptroller.supplyCaps(VUSDT_SPOKE);
        const next = current.mul(3);
        const id = await publish("supplyCap", VUSDT_SPOKE, encodeUint(next));
        await register(id);
        expect(await comptroller.supplyCaps(VUSDT_SPOKE)).to.equal(current);
        await executeAfterTimelock("supplyCap", id);
        expect(await comptroller.supplyCaps(VUSDT_SPOKE)).to.equal(next);
      });

      it("lets the executor reject a timelocked update, which then never applies", async () => {
        await travel(config.supplyCap.debounce);
        const current: BigNumber = await comptroller.supplyCaps(VUSDT_SPOKE);
        const id = await publish("supplyCap", VUSDT_SPOKE, encodeUint(current.mul(3)));
        await register(id);
        await expect(receiver.connect(executor).rejectUpdate(id)).to.emit(receiver, "UpdateRejected").withArgs(id);
        expect((await receiver.updates(id)).status).to.equal(REJECTED);
        await travel(config.supplyCap.timelock);
        await expect(receiver.connect(executor).executeRegisteredUpdate(id)).to.be.revertedWithCustomError(
          receiver,
          "UpdateAlreadyResolved",
        );
        expect(await comptroller.supplyCaps(VUSDT_SPOKE)).to.equal(current);
      });

      it("expires a timelocked update that nobody executes in time", async () => {
        const current: BigNumber = await comptroller.supplyCaps(VUSDT_SPOKE);
        const id = await publish("supplyCap", VUSDT_SPOKE, encodeUint(current.mul(3)));
        await register(id);
        await travel(expiration);
        await expect(receiver.connect(executor).executeRegisteredUpdate(id)).to.be.revertedWithCustomError(
          receiver,
          "UpdateIsExpired",
        );
        expect(await comptroller.supplyCaps(VUSDT_SPOKE)).to.equal(current);
      });

      it("lets anyone process an update, but only a whitelisted executor execute or reject it", async () => {
        const outsider = await initMainnetUser(UNPRIVILEGED, ethers.utils.parseEther("1"));
        const current: BigNumber = await comptroller.supplyCaps(VUSDT_SPOKE);
        const id = await publish("supplyCap", VUSDT_SPOKE, encodeUint(current.mul(3)));
        await expect(receiver.connect(outsider).processUpdate(id)).to.emit(receiver, "UpdateRegistered");
        await travel(config.supplyCap.timelock);
        await expect(receiver.connect(outsider).executeRegisteredUpdate(id)).to.be.revertedWithCustomError(
          receiver,
          "NotAnExecutor",
        );
        await expect(receiver.connect(outsider).rejectUpdate(id)).to.be.revertedWithCustomError(
          receiver,
          "NotAnExecutor",
        );
        await receiver.connect(executor).rejectUpdate(id);
        expect(await comptroller.supplyCaps(VUSDT_SPOKE)).to.equal(current);
      });
    });

    describe("borrow cap", () => {
      it("executes a change within the safe delta directly", async () => {
        const current: BigNumber = await comptroller.borrowCaps(VUSDT_SPOKE);
        const next = current.add(scaled(current, capsDelta.div(2).toNumber()));
        const id = await publish("borrowCap", VUSDT_SPOKE, encodeUint(next));
        await expect(receiver.connect(executor).processUpdate(id)).to.emit(receiver, "UpdateExecuted").withArgs(id);
        expect(await comptroller.borrowCaps(VUSDT_SPOKE)).to.equal(next);
      });

      it("timelocks a change outside the safe delta, then applies it", async () => {
        await travel(config.borrowCap.debounce);
        const current: BigNumber = await comptroller.borrowCaps(VUSDT_SPOKE);
        const next = current.mul(3);
        const id = await publish("borrowCap", VUSDT_SPOKE, encodeUint(next));
        await register(id);
        await executeAfterTimelock("borrowCap", id);
        expect(await comptroller.borrowCaps(VUSDT_SPOKE)).to.equal(next);
      });
    });

    describe("collateral factors", () => {
      const factors = async () => {
        const m = await comptroller.markets(VSPCXB_HUBSPOKE);
        return { cf: m.collateralFactorMantissa as BigNumber, lt: m.liquidationThresholdMantissa as BigNumber };
      };

      it("executes a change within the safe delta directly, through the isolated-pool setter", async () => {
        const { cf, lt } = await factors();
        const ratio = MAX_BPS - factorsDelta.div(2).toNumber();
        const [nextCf, nextLt] = [scaled(cf, ratio), scaled(lt, ratio)];
        const id = await publish("collateralFactors", VSPCXB_HUBSPOKE, encodeFactors(nextCf, nextLt));
        await expect(receiver.connect(executor).processUpdate(id)).to.emit(receiver, "UpdateExecuted").withArgs(id);
        expect(await factors()).to.deep.equal({ cf: nextCf, lt: nextLt });
      });

      it("timelocks a change outside the safe delta, then applies it", async () => {
        await travel(config.collateralFactors.debounce);
        const { cf, lt } = await factors();
        const ratio = MAX_BPS - factorsDelta.toNumber() - 1;
        const [nextCf, nextLt] = [scaled(cf, ratio), scaled(lt, ratio)];
        const id = await publish("collateralFactors", VSPCXB_HUBSPOKE, encodeFactors(nextCf, nextLt));
        await register(id);
        await executeAfterTimelock("collateralFactors", id);
        expect(await factors()).to.deep.equal({ cf: nextCf, lt: nextLt });
      });

      it("refuses a nonzero pool id on a non-core comptroller", async () => {
        await travel(config.collateralFactors.debounce);
        const { cf, lt } = await factors();
        const id = await publish("collateralFactors", VSPCXB_HUBSPOKE, encodeFactors(cf.sub(1), lt), 1);
        await register(id);
        await travel(config.collateralFactors.timelock);
        await expect(receiver.connect(executor).executeRegisteredUpdate(id)).to.be.revertedWithCustomError(
          factorsSteward,
          "InvalidPool",
        );
      });
    });

    describe("interest rate model", () => {
      it("always timelocks, then applies through the isolated-pool setter", async () => {
        const current = await vToken.interestRateModel();
        expect(current).to.not.equal(ALTERNATE_IRM);
        const id = await publish("interestRateModel", VSPCXB_HUBSPOKE, encodeAddress(ALTERNATE_IRM));
        await register(id);
        expect(await vToken.interestRateModel()).to.equal(current);
        await executeAfterTimelock("interestRateModel", id);
        expect(await vToken.interestRateModel()).to.equal(ALTERNATE_IRM);
        // The market now prices through the new model: both rate getters call it, and accrual uses them.
        await vToken.borrowRatePerBlock();
        await vToken.supplyRatePerBlock();
        await expect(vToken.connect(executor).accrueInterest()).to.emit(vToken, "AccrueInterest");
      });

      it("refuses the model the market already has", async () => {
        await travel(config.interestRateModel.debounce);
        const current = await vToken.interestRateModel();
        const id = await publish("interestRateModel", VSPCXB_HUBSPOKE, encodeAddress(current));
        await expect(receiver.connect(executor).processUpdate(id)).to.be.revertedWithCustomError(
          irmSteward,
          "RedundantValue",
        );
      });
    });
  });
});
