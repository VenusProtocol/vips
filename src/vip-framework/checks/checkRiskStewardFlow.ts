import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";

import { initMainnetUser } from "../../utils";
import COLLATERAL_FACTORS_STEWARD_ABI from "../abi/CollateralFactorsRiskSteward.json";
import IRM_STEWARD_ABI from "../abi/IRMRiskSteward.json";
import MARKET_CAPS_STEWARD_ABI from "../abi/MarketCapsRiskSteward.json";
import ORACLE_ABI from "../abi/RiskOracle.json";
import RECEIVER_ABI from "../abi/RiskStewardReceiver.json";
import COMPTROLLER_ABI from "../abi/il_comptroller.json";
import VTOKEN_ABI from "../abi/il_vToken.json";

/// Runs every Risk Steward update type through the real path on one pool: publish to the Risk Oracle, process on
/// `RiskStewardReceiver`, and let the steward contract apply it to the comptroller or vToken. Timelock, debounce,
/// expiry and safe delta are read from the chain, so the same spec works on testnet and mainnet.
export interface RiskStewardFlowSpec {
  riskOracle: string;
  receiver: string;
  comptroller: string;
  /// Authorised on the oracle; impersonated to publish.
  authorizedSender: string;
  /// Whitelisted on the receiver; impersonated to process, execute and reject.
  executor: string;
  /// A market with nonzero supply and borrow caps.
  capsMarket: string;
  /// A market with nonzero collateral factor and liquidation threshold.
  collateralMarket: string;
  /// A deployed rate model the collateral market does not use yet.
  alternateInterestRateModel: string;
}

/// Holds no role anywhere.
const OUTSIDER = "0x0000000000000000000000000000000000000100";

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

export const checkRiskStewardFlow = (spec: RiskStewardFlowSpec) => {
  describe("Risk Steward flow", () => {
    const oracle = new Contract(spec.riskOracle, ORACLE_ABI, ethers.provider);
    const receiver = new Contract(spec.receiver, RECEIVER_ABI, ethers.provider);
    const comptroller = new Contract(spec.comptroller, COMPTROLLER_ABI, ethers.provider);
    const vToken = new Contract(spec.collateralMarket, VTOKEN_ABI, ethers.provider);
    let sender: Awaited<ReturnType<typeof initMainnetUser>>;
    let executor: Awaited<ReturnType<typeof initMainnetUser>>;
    let capsSteward: Contract;
    let factorsSteward: Contract;
    let irmSteward: Contract;
    let timelock: BigNumber;
    let debounce: BigNumber;
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

    const executeAfterTimelock = async (id: BigNumber) => {
      await travel(timelock);
      await expect(receiver.connect(executor).executeRegisteredUpdate(id))
        .to.emit(receiver, "UpdateExecuted")
        .withArgs(id);
    };

    /// A fraction of the current value: `ratioBps` of 10000.
    const scaled = (value: BigNumber, ratioBps: number) => value.mul(ratioBps).div(MAX_BPS);

    before(async () => {
      sender = await initMainnetUser(spec.authorizedSender, ethers.utils.parseEther("1"));
      executor = await initMainnetUser(spec.executor, ethers.utils.parseEther("1"));
      const supply = await receiver.getRiskParameterConfig("supplyCap");
      const factors = await receiver.getRiskParameterConfig("collateralFactors");
      timelock = supply.timelock;
      debounce = supply.debounce;
      expiration = await receiver.UPDATE_EXPIRATION_TIME();
      capsSteward = new Contract(supply.riskSteward, MARKET_CAPS_STEWARD_ABI, ethers.provider);
      factorsSteward = new Contract(factors.riskSteward, COLLATERAL_FACTORS_STEWARD_ABI, ethers.provider);
      const irm = await receiver.getRiskParameterConfig("interestRateModel");
      irmSteward = new Contract(irm.riskSteward, IRM_STEWARD_ABI, ethers.provider);
      capsDelta = await capsSteward.safeDeltaBps();
      factorsDelta = await factorsSteward.safeDeltaBps();
    });

    describe("supply cap", () => {
      it("executes a change within the safe delta directly", async () => {
        const current: BigNumber = await comptroller.supplyCaps(spec.capsMarket);
        const next = current.add(scaled(current, capsDelta.div(2).toNumber()));
        const id = await publish("supplyCap", spec.capsMarket, encodeUint(next));
        await expect(receiver.connect(executor).processUpdate(id)).to.emit(receiver, "UpdateExecuted").withArgs(id);
        expect(await comptroller.supplyCaps(spec.capsMarket)).to.equal(next);
      });

      it("refuses a second update inside the debounce window, then accepts it after", async () => {
        const current: BigNumber = await comptroller.supplyCaps(spec.capsMarket);
        const next = current.add(1);
        const early = await publish("supplyCap", spec.capsMarket, encodeUint(next));
        await expect(receiver.connect(executor).processUpdate(early)).to.be.revertedWithCustomError(
          receiver,
          "UpdateTooFrequent",
        );
        await travel(debounce);
        const late = await publish("supplyCap", spec.capsMarket, encodeUint(next));
        await expect(receiver.connect(executor).processUpdate(late)).to.emit(receiver, "UpdateExecuted");
        expect(await comptroller.supplyCaps(spec.capsMarket)).to.equal(next);
      });

      it("timelocks a change outside the safe delta, then applies it", async () => {
        await travel(debounce);
        const current: BigNumber = await comptroller.supplyCaps(spec.capsMarket);
        const next = current.mul(3);
        const id = await publish("supplyCap", spec.capsMarket, encodeUint(next));
        await register(id);
        expect(await comptroller.supplyCaps(spec.capsMarket)).to.equal(current);
        await executeAfterTimelock(id);
        expect(await comptroller.supplyCaps(spec.capsMarket)).to.equal(next);
      });

      it("lets the executor reject a timelocked update, which then never applies", async () => {
        await travel(debounce);
        const current: BigNumber = await comptroller.supplyCaps(spec.capsMarket);
        const id = await publish("supplyCap", spec.capsMarket, encodeUint(current.mul(3)));
        await register(id);
        await expect(receiver.connect(executor).rejectUpdate(id)).to.emit(receiver, "UpdateRejected").withArgs(id);
        expect((await receiver.updates(id)).status).to.equal(REJECTED);
        await travel(timelock);
        await expect(receiver.connect(executor).executeRegisteredUpdate(id)).to.be.revertedWithCustomError(
          receiver,
          "UpdateAlreadyResolved",
        );
        expect(await comptroller.supplyCaps(spec.capsMarket)).to.equal(current);
      });

      it("expires a timelocked update that nobody executes in time", async () => {
        const current: BigNumber = await comptroller.supplyCaps(spec.capsMarket);
        const id = await publish("supplyCap", spec.capsMarket, encodeUint(current.mul(3)));
        await register(id);
        await travel(expiration);
        await expect(receiver.connect(executor).executeRegisteredUpdate(id)).to.be.revertedWithCustomError(
          receiver,
          "UpdateIsExpired",
        );
        expect(await comptroller.supplyCaps(spec.capsMarket)).to.equal(current);
      });

      it("lets anyone process an update, but only a whitelisted executor execute or reject it", async () => {
        const outsider = await initMainnetUser(OUTSIDER, ethers.utils.parseEther("1"));
        const current: BigNumber = await comptroller.supplyCaps(spec.capsMarket);
        const id = await publish("supplyCap", spec.capsMarket, encodeUint(current.mul(3)));
        await expect(receiver.connect(outsider).processUpdate(id)).to.emit(receiver, "UpdateRegistered");
        await travel(timelock);
        await expect(receiver.connect(outsider).executeRegisteredUpdate(id)).to.be.revertedWithCustomError(
          receiver,
          "NotAnExecutor",
        );
        await expect(receiver.connect(outsider).rejectUpdate(id)).to.be.revertedWithCustomError(
          receiver,
          "NotAnExecutor",
        );
        await receiver.connect(executor).rejectUpdate(id);
        expect(await comptroller.supplyCaps(spec.capsMarket)).to.equal(current);
      });
    });

    describe("borrow cap", () => {
      it("executes a change within the safe delta directly", async () => {
        const current: BigNumber = await comptroller.borrowCaps(spec.capsMarket);
        const next = current.add(scaled(current, capsDelta.div(2).toNumber()));
        const id = await publish("borrowCap", spec.capsMarket, encodeUint(next));
        await expect(receiver.connect(executor).processUpdate(id)).to.emit(receiver, "UpdateExecuted").withArgs(id);
        expect(await comptroller.borrowCaps(spec.capsMarket)).to.equal(next);
      });

      it("timelocks a change outside the safe delta, then applies it", async () => {
        await travel(debounce);
        const current: BigNumber = await comptroller.borrowCaps(spec.capsMarket);
        const next = current.mul(3);
        const id = await publish("borrowCap", spec.capsMarket, encodeUint(next));
        await register(id);
        await executeAfterTimelock(id);
        expect(await comptroller.borrowCaps(spec.capsMarket)).to.equal(next);
      });
    });

    describe("collateral factors", () => {
      const factors = async () => {
        const m = await comptroller.markets(spec.collateralMarket);
        return { cf: m.collateralFactorMantissa as BigNumber, lt: m.liquidationThresholdMantissa as BigNumber };
      };

      it("executes a change within the safe delta directly, through the isolated-pool setter", async () => {
        const { cf, lt } = await factors();
        const ratio = MAX_BPS - factorsDelta.div(2).toNumber();
        const [nextCf, nextLt] = [scaled(cf, ratio), scaled(lt, ratio)];
        const id = await publish("collateralFactors", spec.collateralMarket, encodeFactors(nextCf, nextLt));
        await expect(receiver.connect(executor).processUpdate(id)).to.emit(receiver, "UpdateExecuted").withArgs(id);
        expect(await factors()).to.deep.equal({ cf: nextCf, lt: nextLt });
      });

      it("timelocks a change outside the safe delta, then applies it", async () => {
        await travel(debounce);
        const { cf, lt } = await factors();
        const ratio = MAX_BPS - factorsDelta.toNumber() - 1;
        const [nextCf, nextLt] = [scaled(cf, ratio), scaled(lt, ratio)];
        const id = await publish("collateralFactors", spec.collateralMarket, encodeFactors(nextCf, nextLt));
        await register(id);
        await executeAfterTimelock(id);
        expect(await factors()).to.deep.equal({ cf: nextCf, lt: nextLt });
      });

      it("refuses an e-mode pool id on a pool that has none", async () => {
        await travel(debounce);
        const { cf, lt } = await factors();
        const id = await publish("collateralFactors", spec.collateralMarket, encodeFactors(cf.sub(1), lt), 1);
        await register(id);
        await travel(timelock);
        await expect(receiver.connect(executor).executeRegisteredUpdate(id)).to.be.revertedWithCustomError(
          factorsSteward,
          "InvalidPool",
        );
      });
    });

    describe("interest rate model", () => {
      it("always timelocks, then applies through the isolated-pool setter", async () => {
        const current = await vToken.interestRateModel();
        expect(current).to.not.equal(spec.alternateInterestRateModel);
        const id = await publish(
          "interestRateModel",
          spec.collateralMarket,
          encodeAddress(spec.alternateInterestRateModel),
        );
        await register(id);
        expect(await vToken.interestRateModel()).to.equal(current);
        await executeAfterTimelock(id);
        expect(await vToken.interestRateModel()).to.equal(spec.alternateInterestRateModel);
        // The market now prices through the new model: both rate getters call it, and accrual uses them.
        await vToken.borrowRatePerBlock();
        await vToken.supplyRatePerBlock();
        await vToken.connect(executor).accrueInterest();
      });

      it("refuses the model the market already has", async () => {
        await travel(debounce);
        const current = await vToken.interestRateModel();
        const id = await publish("interestRateModel", spec.collateralMarket, encodeAddress(current));
        await expect(receiver.connect(executor).processUpdate(id)).to.be.revertedWithCustomError(
          irmSteward,
          "RedundantValue",
        );
      });
    });
  });
};
