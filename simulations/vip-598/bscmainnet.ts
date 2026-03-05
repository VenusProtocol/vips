import { expect } from "chai";
import { BigNumber, Contract, Signer } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip598, {
  ALLEZ_LABS,
  BORROW_CAP_CONFIG,
  COLLATERAL_FACTORS_CONFIG,
  FLUX_FLA,
  IRM_CONFIG,
  MARKETCAP_STEWARD,
  MARKETCAP_STEWARD_SAFE_DELTA,
  NEW_CF,
  NEW_LI,
  NEW_LT,
  NEW_PRIME_SPEED_FOR_USDT,
  PRIME_LIQUIDITY_PROVIDER,
  RISK_ORACLE,
  RISK_STEWARD_RECEIVER,
  SUPPLY_CAP_CONFIG,
  USDT,
  vslisBNB,
} from "../../vips/vip-598/bscmainnet";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import ERC20_ABI from "./abi/ERC20.json";
import PRIME_LIQUIDITY_PROVIDER_ABI from "./abi/PrimeLiquidityProvider.json";
import REDSTONE_ORACLE_ABI from "./abi/RedstoneOracle.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import STEWARD_ABI from "./abi/MarketCapSteward.json";
import RISK_ORACLE_ABI from "./abi/RiskOracle.json";
import RSR_ABI from "./abi/RiskStewardReceiver.json";
import VTOKEN_ABI from "./abi/VToken.json";

const { bscmainnet } = NETWORK_ADDRESSES;

const slisBNB = "0xB0b84D294e0C75A6abe60171b70edEb2EFd14A1B";
const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";

// Risk steward behavioral verification helpers
const AUTHORIZED_SENDER = "0x83f426233B358A36953F6951161E76FB7c866a7A";
const WHITELISTED_EXECUTOR = "0x83f426233B358A36953F6951161E76FB7c866a7A";
const vBTC = "0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B";
const vETH = "0xf508fCD89b8bd15579dc79A6827cB4686A3592c8";
const vUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
const vLINK = "0x650b940a1033B8A1b1873f78730FcFC73ec11f1f";
const ONE_DAY = 86400;
const OLD_DEBOUNCE = 259200;

const FORK_BLOCK = 84773489;

const setOraclePrice = async (token: string, price: string) => {
  const impersonatedTimelock = await initMainnetUser(bscmainnet.NORMAL_TIMELOCK, ethers.utils.parseEther("2"));
  const resilientOracle = new ethers.Contract(bscmainnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);
  const redstoneOracle = new ethers.Contract(bscmainnet.REDSTONE_ORACLE, REDSTONE_ORACLE_ABI, ethers.provider);

  await resilientOracle
    .connect(impersonatedTimelock)
    .setTokenConfig([
      token,
      [bscmainnet.REDSTONE_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
      [true, false, false],
      false,
    ]);
  await redstoneOracle.connect(impersonatedTimelock).setDirectPrice(token, parseUnits(price, 18));
};

forking(FORK_BLOCK, async () => {
  let comptroller: Contract;
  let primeLiquidityProvider: Contract;
  let rsr: Contract;
  let cfSteward: Contract;
  let mcSteward: Contract;
  let riskOracle: Contract;

  before(async () => {
    comptroller = new ethers.Contract(bscmainnet.UNITROLLER, COMPTROLLER_ABI, ethers.provider);
    primeLiquidityProvider = await ethers.getContractAt(PRIME_LIQUIDITY_PROVIDER_ABI, PRIME_LIQUIDITY_PROVIDER);
    rsr = new ethers.Contract(RISK_STEWARD_RECEIVER, RSR_ABI, ethers.provider);
    cfSteward = new ethers.Contract(COLLATERAL_FACTORS_CONFIG.steward, STEWARD_ABI, ethers.provider);
    mcSteward = new ethers.Contract(MARKETCAP_STEWARD, STEWARD_ABI, ethers.provider);
    riskOracle = new ethers.Contract(RISK_ORACLE, RISK_ORACLE_ABI, ethers.provider);
    await setOraclePrice(slisBNB, "1");
  });

  describe("Pre-VIP behavior", () => {
    // -------------------------------------------------------
    // VIP-598-A: slisBNB Core Pool Risk Parameters
    // -------------------------------------------------------
    describe("slisBNB Core Pool Risk Parameters", () => {
      it("vslisBNB should have CF = 0%", async () => {
        const market = await comptroller.markets(vslisBNB);
        expect(market.collateralFactorMantissa).to.equal(parseUnits("0", 18));
      });

      it("vslisBNB should have LT = 0%", async () => {
        const market = await comptroller.markets(vslisBNB);
        expect(market.liquidationThresholdMantissa).to.equal(parseUnits("0", 18));
      });

      it("vslisBNB should have LI = 100% (no incentive bonus)", async () => {
        const market = await comptroller.markets(vslisBNB);
        expect(market.liquidationIncentiveMantissa).to.equal(parseUnits("1", 18));
      });
    });

    // -------------------------------------------------------
    // VIP-598-B: March 2026 Prime Rewards
    // -------------------------------------------------------
    describe("March 2026 Prime Rewards", () => {
      it("check current prime reward distribution speed for USDT", async () => {
        expect(await primeLiquidityProvider.tokenDistributionSpeeds(USDT)).to.equal(8556547619047620n);
      });
    });

    // -------------------------------------------------------
    // VIP-598-C: Risk Stewards Parameters
    // -------------------------------------------------------
    describe("Risk Stewards Parameters", () => {
      it("supplyCap has old config", async () => {
        const config = await rsr.getRiskParameterConfig(SUPPLY_CAP_CONFIG.updateType);
        expect(config.riskSteward).to.equal(SUPPLY_CAP_CONFIG.steward);
        expect(config.debounce).to.equal(SUPPLY_CAP_CONFIG.old.debounce);
        expect(config.timelock).to.equal(SUPPLY_CAP_CONFIG.old.timelock);
        expect(config.active).to.be.true;
      });

      it("borrowCap has old config", async () => {
        const config = await rsr.getRiskParameterConfig(BORROW_CAP_CONFIG.updateType);
        expect(config.riskSteward).to.equal(BORROW_CAP_CONFIG.steward);
        expect(config.debounce).to.equal(BORROW_CAP_CONFIG.old.debounce);
        expect(config.timelock).to.equal(BORROW_CAP_CONFIG.old.timelock);
        expect(config.active).to.be.true;
      });

      it("collateralFactors has old config", async () => {
        const config = await rsr.getRiskParameterConfig(COLLATERAL_FACTORS_CONFIG.updateType);
        expect(config.riskSteward).to.equal(COLLATERAL_FACTORS_CONFIG.steward);
        expect(config.debounce).to.equal(COLLATERAL_FACTORS_CONFIG.old.debounce);
        expect(config.timelock).to.equal(COLLATERAL_FACTORS_CONFIG.old.timelock);
        expect(config.active).to.be.true;
        expect(await cfSteward.safeDeltaBps()).to.equal(COLLATERAL_FACTORS_CONFIG.old.safeDeltaBps);
      });

      it("interestRateModel has current config", async () => {
        const config = await rsr.getRiskParameterConfig(IRM_CONFIG.updateType);
        expect(config.riskSteward).to.equal(IRM_CONFIG.steward);
        expect(config.debounce).to.equal(IRM_CONFIG.old.debounce);
        expect(config.timelock).to.equal(IRM_CONFIG.old.timelock);
        expect(config.active).to.be.true;
      });

      it("market cap steward safe delta is 50%", async () => {
        expect(await mcSteward.safeDeltaBps()).to.equal(MARKETCAP_STEWARD_SAFE_DELTA);
      });

      it("Allez Labs is NOT an authorized sender", async () => {
        expect(await riskOracle.authorizedSenders(ALLEZ_LABS)).to.be.false;
      });
    });

    // -------------------------------------------------------
    // VIP-598-D: Flux Flash Loan Aggregator Whitelist
    // -------------------------------------------------------
    describe("Flux Flash Loan Aggregator Whitelist", () => {
      it("FLUX_FLA should NOT be whitelisted for flash loans", async () => {
        expect(await comptroller.authorizedFlashLoan(FLUX_FLA)).to.be.false;
      });
    });
  });

  testVip("VIP-598 [BNB Chain] slisBNB Risk Parameters, March 2026 Prime Rewards, Risk Stewards Update, and Flux Flash Loan Whitelist", await vip598(), {
    callbackAfterExecution: async txResponse => {
      // slisBNB risk parameter events
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI],
        ["NewCollateralFactor", "NewLiquidationThreshold", "NewLiquidationIncentive"],
        [1, 1, 1],
      );
      // Prime rewards speed event
      await expectEvents(txResponse, [PRIME_LIQUIDITY_PROVIDER_ABI], ["TokenDistributionSpeedUpdated"], [1]);
      // Risk steward config events
      await expectEvents(
        txResponse,
        [RSR_ABI, STEWARD_ABI, RISK_ORACLE_ABI],
        ["RiskParameterConfigUpdated", "SafeDeltaBpsUpdated", "AuthorizedSenderAdded"],
        [3, 1, 1],
      );
      // Flux flash loan whitelist event
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["IsAccountFlashLoanWhitelisted"], [1]);
    },
  });

  describe("Post-VIP behavior", () => {
    // -------------------------------------------------------
    // VIP-598-A: slisBNB Core Pool Risk Parameters
    // -------------------------------------------------------
    describe("slisBNB Core Pool Risk Parameters", () => {
      it("vslisBNB should have CF = 80%", async () => {
        const market = await comptroller.markets(vslisBNB);
        expect(market.collateralFactorMantissa).to.equal(NEW_CF);
      });

      it("vslisBNB should have LT = 80%", async () => {
        const market = await comptroller.markets(vslisBNB);
        expect(market.liquidationThresholdMantissa).to.equal(NEW_LT);
      });

      it("vslisBNB should have LI = 110%", async () => {
        const market = await comptroller.markets(vslisBNB);
        expect(market.liquidationIncentiveMantissa).to.equal(NEW_LI);
      });

      it("vslisBNB should remain listed", async () => {
        const market = await comptroller.markets(vslisBNB);
        expect(market.isListed).to.equal(true);
      });

      it("vslisBNB borrow should remain paused", async () => {
        expect(await comptroller.actionPaused(vslisBNB, 2)).to.equal(true);
      });

      it("vslisBNB borrow should remain disallowed", async () => {
        const market = await comptroller.markets(vslisBNB);
        expect(market.isBorrowAllowed).to.equal(false);
      });

      it("BNB Emode vslisBNB Risk Factors should remain unchanged", async () => {
        const BNB_EMODE_ID = 3;
        const market = await comptroller.poolMarkets(BNB_EMODE_ID, vslisBNB);
        expect(market.collateralFactorMantissa).to.equal(parseUnits("0.9", 18));
        expect(market.liquidationThresholdMantissa).to.equal(parseUnits("0.93", 18));
        expect(market.liquidationIncentiveMantissa).to.equal(parseUnits("1.04", 18));
      });

      describe("Collateral functionality", async () => {
        const slisBNB_HOLDER = "0x1adB950d8bB3dA4bE104211D5AB038628e477fE6";
        let slisBNBToken: Contract;
        let vslisBNBContract: Contract;
        let userAddress: string;
        let signer: Signer;

        beforeEach(async () => {
          [signer] = await ethers.getSigners();
          userAddress = await signer.getAddress();
          slisBNBToken = new ethers.Contract(slisBNB, ERC20_ABI, ethers.provider);
          vslisBNBContract = new ethers.Contract(vslisBNB, VTOKEN_ABI, ethers.provider);
        });

        it("user can supply slisBNB and receive positive liquidity", async () => {
          const slisBNBHolder = await initMainnetUser(slisBNB_HOLDER, ethers.utils.parseEther("1"));
          const supplyAmount = parseUnits("0.03", 18);
          await slisBNBToken.connect(slisBNBHolder).transfer(userAddress, supplyAmount);
          await slisBNBToken.connect(signer).approve(vslisBNB, supplyAmount);
          await vslisBNBContract.connect(signer).mint(supplyAmount);

          const [, liquidityBeforeEnter] = await comptroller.getAccountLiquidity(userAddress);
          expect(liquidityBeforeEnter).to.equal(0);

          await comptroller.connect(signer).enterMarkets([vslisBNB]);

          const [, liquidity] = await comptroller.getAccountLiquidity(userAddress);
          expect(liquidity).to.be.gt(0);
        });

        it("borrowing vslisBNB should revert", async () => {
          await expect(vslisBNBContract.connect(signer).borrow(parseUnits("0.01", 18))).to.be.reverted;
        });

        it("user can supply, withdraw, and borrow another asset against slisBNB collateral", async () => {
          const LARGE_HOLDER = "0x1adB950d8bB3dA4bE104211D5AB038628e477fE6";
          const slisBNBHolder = await initMainnetUser(LARGE_HOLDER, ethers.utils.parseEther("1"));

          const supplyAmount = parseUnits("1", 18);
          await slisBNBToken.connect(slisBNBHolder).transfer(userAddress, supplyAmount);
          await slisBNBToken.connect(signer).approve(vslisBNB, supplyAmount);

          const slisBNBBefore = await slisBNBToken.balanceOf(userAddress);
          await vslisBNBContract.connect(signer).mint(supplyAmount);
          expect(await slisBNBToken.balanceOf(userAddress)).to.equal(slisBNBBefore.sub(supplyAmount));

          const vTokenBalance = await vslisBNBContract.balanceOf(userAddress);
          expect(vTokenBalance).to.be.gt(0);

          const redeemAmount = vTokenBalance.div(2);
          await vslisBNBContract.connect(signer).redeem(redeemAmount);
          expect(await vslisBNBContract.balanceOf(userAddress)).to.equal(vTokenBalance.sub(redeemAmount));
          expect(await slisBNBToken.balanceOf(userAddress)).to.be.gt(0);

          await comptroller.connect(signer).enterMarkets([vslisBNB]);
          const [, liquidity] = await comptroller.getAccountLiquidity(userAddress);
          expect(liquidity).to.be.gt(0);

          await setOraclePrice(USDT_ADDRESS, "1");

          const usdtToken = new ethers.Contract(USDT_ADDRESS, ERC20_ABI, ethers.provider);
          const vUSDTContract = new ethers.Contract(vUSDT, VTOKEN_ABI, ethers.provider);

          const usdtBefore = await usdtToken.balanceOf(userAddress);
          const borrowAmount = parseUnits("0.001", 18);
          await vUSDTContract.connect(signer).borrow(borrowAmount);
          expect(await usdtToken.balanceOf(userAddress)).to.equal(usdtBefore.add(borrowAmount));

          const [, liquidityAfterBorrow] = await comptroller.getAccountLiquidity(userAddress);
          expect(liquidityAfterBorrow).to.be.lt(liquidity);
          expect(liquidityAfterBorrow).to.be.gt(0);
        });
      });
    });

    // -------------------------------------------------------
    // VIP-598-B: March 2026 Prime Rewards
    // -------------------------------------------------------
    describe("March 2026 Prime Rewards", () => {
      it("NEW_PRIME_SPEED_FOR_USDT distributes $22,000 over 31 days at 192,000 blocks/day", () => {
        const totalDistributed = NEW_PRIME_SPEED_FOR_USDT.mul(BigNumber.from(192000)).mul(BigNumber.from(31));
        expect(totalDistributed).to.be.closeTo(parseUnits("22000", 18), parseUnits("1", 18));
      });

      it("USDT distribution speed updated to new value", async () => {
        expect(await primeLiquidityProvider.tokenDistributionSpeeds(USDT)).to.equal(NEW_PRIME_SPEED_FOR_USDT);
      });
    });

    // -------------------------------------------------------
    // VIP-598-C: Risk Stewards Parameters
    // -------------------------------------------------------
    describe("Risk Stewards Parameters", () => {
      it("supplyCap has new config", async () => {
        const config = await rsr.getRiskParameterConfig(SUPPLY_CAP_CONFIG.updateType);
        expect(config.riskSteward).to.equal(SUPPLY_CAP_CONFIG.steward);
        expect(config.debounce).to.equal(SUPPLY_CAP_CONFIG.new.debounce);
        expect(config.timelock).to.equal(SUPPLY_CAP_CONFIG.new.timelock);
        expect(config.active).to.be.true;
      });

      it("borrowCap has new config", async () => {
        const config = await rsr.getRiskParameterConfig(BORROW_CAP_CONFIG.updateType);
        expect(config.riskSteward).to.equal(BORROW_CAP_CONFIG.steward);
        expect(config.debounce).to.equal(BORROW_CAP_CONFIG.new.debounce);
        expect(config.timelock).to.equal(BORROW_CAP_CONFIG.new.timelock);
        expect(config.active).to.be.true;
      });

      it("collateralFactors has new config", async () => {
        const config = await rsr.getRiskParameterConfig(COLLATERAL_FACTORS_CONFIG.updateType);
        expect(config.riskSteward).to.equal(COLLATERAL_FACTORS_CONFIG.steward);
        expect(config.debounce).to.equal(COLLATERAL_FACTORS_CONFIG.new.debounce);
        expect(config.timelock).to.equal(COLLATERAL_FACTORS_CONFIG.new.timelock);
        expect(config.active).to.be.true;
        expect(await cfSteward.safeDeltaBps()).to.equal(COLLATERAL_FACTORS_CONFIG.new.safeDeltaBps);
      });

      it("interestRateModel config remains unchanged", async () => {
        const config = await rsr.getRiskParameterConfig(IRM_CONFIG.updateType);
        expect(config.riskSteward).to.equal(IRM_CONFIG.steward);
        expect(config.debounce).to.equal(IRM_CONFIG.old.debounce);
        expect(config.timelock).to.equal(IRM_CONFIG.old.timelock);
        expect(config.active).to.be.true;
      });

      it("market cap steward safe delta remains unchanged", async () => {
        expect(await mcSteward.safeDeltaBps()).to.equal(MARKETCAP_STEWARD_SAFE_DELTA);
      });

      it("Allez Labs is an authorized sender on Risk Oracle", async () => {
        expect(await riskOracle.authorizedSenders(ALLEZ_LABS)).to.be.true;
      });

      describe("Behavioral verification", () => {
        let sender: Signer;
        let exec: Signer;

        async function publishUpdate(updateType: string, market: string, value: string): Promise<BigNumber> {
          const counter = await riskOracle.updateCounter();
          await riskOracle
            .connect(sender)
            .publishRiskParameterUpdate("ref-598-test", value, updateType, market, 0, 0, "0x");
          return counter.add(1);
        }

        before(async () => {
          sender = await initMainnetUser(AUTHORIZED_SENDER, parseUnits("5"));
          exec = await initMainnetUser(WHITELISTED_EXECUTOR, parseUnits("5"));
          // Clear any pre-existing debounce from real-world risk steward activity
          await ethers.provider.send("evm_increaseTime", [OLD_DEBOUNCE + 1]);
          await ethers.provider.send("evm_mine", []);
        });

        describe("Supply Cap — 24h debounce (was 3 days)", () => {
          it("rejects second update within 24h, accepts after 24h", async () => {
            const cap = await comptroller.supplyCaps(vBTC);
            expect(cap).to.be.gt(0);

            const cap1 = cap.mul(120).div(100);
            const id1 = await publishUpdate("supplyCap", vBTC, ethers.utils.defaultAbiCoder.encode(["uint256"], [cap1]));
            await expect(rsr.connect(exec).processUpdate(id1)).to.emit(rsr, "UpdateExecuted").withArgs(id1);
            expect(await comptroller.supplyCaps(vBTC)).to.equal(cap1);

            const cap2 = cap1.mul(110).div(100);
            const id2 = await publishUpdate("supplyCap", vBTC, ethers.utils.defaultAbiCoder.encode(["uint256"], [cap2]));
            await expect(rsr.connect(exec).processUpdate(id2)).to.be.revertedWithCustomError(rsr, "UpdateTooFrequent");

            await ethers.provider.send("evm_increaseTime", [ONE_DAY + 1]);
            await ethers.provider.send("evm_mine", []);

            const cap3 = cap1.mul(110).div(100);
            const id3 = await publishUpdate("supplyCap", vBTC, ethers.utils.defaultAbiCoder.encode(["uint256"], [cap3]));
            await expect(rsr.connect(exec).processUpdate(id3)).to.emit(rsr, "UpdateExecuted").withArgs(id3);
            expect(await comptroller.supplyCaps(vBTC)).to.equal(cap3);
          });
        });

        describe("Borrow Cap — 24h debounce (was 3 days)", () => {
          it("allows second borrow cap update after 24h", async () => {
            const cap = await comptroller.borrowCaps(vETH);
            expect(cap).to.be.gt(0);

            const cap1 = cap.mul(120).div(100);
            const id1 = await publishUpdate("borrowCap", vETH, ethers.utils.defaultAbiCoder.encode(["uint256"], [cap1]));
            await expect(rsr.connect(exec).processUpdate(id1)).to.emit(rsr, "UpdateExecuted").withArgs(id1);
            expect(await comptroller.borrowCaps(vETH)).to.equal(cap1);

            await ethers.provider.send("evm_increaseTime", [ONE_DAY + 1]);
            await ethers.provider.send("evm_mine", []);

            const cap2 = cap1.mul(110).div(100);
            const id2 = await publishUpdate("borrowCap", vETH, ethers.utils.defaultAbiCoder.encode(["uint256"], [cap2]));
            await expect(rsr.connect(exec).processUpdate(id2)).to.emit(rsr, "UpdateExecuted").withArgs(id2);
            expect(await comptroller.borrowCaps(vETH)).to.equal(cap2);
          });
        });

        describe("Allez Labs — can publish, cannot execute timelocked updates", () => {
          it("Allez Labs publishes update, but only whitelisted executor can executeRegisteredUpdate", async () => {
            const allezSender = await initMainnetUser(ALLEZ_LABS, parseUnits("5"));
            const SIX_HOURS = 21600;

            const cap = await comptroller.supplyCaps(vUSDT);
            expect(cap).to.be.gt(0);

            const newCap = cap.mul(3);
            const counter = await riskOracle.updateCounter();
            await riskOracle
              .connect(allezSender)
              .publishRiskParameterUpdate(
                "ref-allez",
                ethers.utils.defaultAbiCoder.encode(["uint256"], [newCap]),
                "supplyCap",
                vUSDT,
                0,
                0,
                "0x",
              );
            const updateId = counter.add(1);

            await expect(rsr.connect(allezSender).processUpdate(updateId)).to.emit(rsr, "UpdateRegistered");

            await ethers.provider.send("evm_increaseTime", [SIX_HOURS + 1]);
            await ethers.provider.send("evm_mine", []);

            await expect(rsr.connect(allezSender).executeRegisteredUpdate(updateId)).to.be.revertedWithCustomError(
              rsr,
              "NotAnExecutor",
            );

            await expect(rsr.connect(exec).executeRegisteredUpdate(updateId))
              .to.emit(rsr, "UpdateExecuted")
              .withArgs(updateId);
            expect(await comptroller.supplyCaps(vUSDT)).to.equal(newCap);
          });
        });

        describe("Collateral Factors — 5% safe delta (was 10%)", () => {
          it("4% change is safe for direct execution (within new 5% delta)", async () => {
            const info = await comptroller.markets(vUSDT);
            const cf = info.collateralFactorMantissa;
            const lt = info.liquidationThresholdMantissa;

            const newCF = cf.mul(96).div(100);
            const newLT = lt.mul(96).div(100);
            const encoded = ethers.utils.defaultAbiCoder.encode(["uint256", "uint256"], [newCF, newLT]);

            const id = await publishUpdate("collateralFactors", vUSDT, encoded);
            const update = await riskOracle.getUpdateById(id);
            expect(await cfSteward.isSafeForDirectExecution(update)).to.be.true;
          });

          it("7% change requires timelock (outside new 5% delta, was within old 10%)", async () => {
            const info = await comptroller.markets(vLINK);
            const cf = info.collateralFactorMantissa;
            const lt = info.liquidationThresholdMantissa;

            const newCF = cf.mul(93).div(100);
            const newLT = lt.mul(93).div(100);
            const encoded = ethers.utils.defaultAbiCoder.encode(["uint256", "uint256"], [newCF, newLT]);

            const id = await publishUpdate("collateralFactors", vLINK, encoded);
            const update = await riskOracle.getUpdateById(id);
            expect(await cfSteward.isSafeForDirectExecution(update)).to.be.false;
          });
        });
      });
    });

    // -------------------------------------------------------
    // VIP-598-D: Flux Flash Loan Aggregator Whitelist
    // -------------------------------------------------------
    describe("Flux Flash Loan Aggregator Whitelist", () => {
      it("FLUX_FLA should be whitelisted for flash loans", async () => {
        expect(await comptroller.authorizedFlashLoan(FLUX_FLA)).to.be.true;
      });
    });
  });
});
