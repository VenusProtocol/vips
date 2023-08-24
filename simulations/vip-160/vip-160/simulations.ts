import { TransactionResponse } from "@ethersproject/providers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumberish } from "ethers";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents, initMainnetUser, setMaxStalePeriodInBinanceOracle } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { vip160 } from "../../../vips/vip-160/vip-160";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import ERC20_ABI from "./abi/erc20.json";
import POOL_REGISTRY_ABI from "./abi/poolRegistry.json";
import RATE_MODEL_ABI from "./abi/rateModel.json";
import REWARD_DISTRIBUTOR_ABI from "./abi/rewardsDistributor.json";
import TREASURY_ABI from "./abi/treasury.json";
import VTOKEN_ABI from "./abi/vToken.json";

const USDD = "0xd17479997F34dd9156Deef8F95A52D81D265be9c";
const vUSDD_DeFi = "0xA615467caE6B9E0bb98BC04B4411d9296fd1dFa0";
const COMPTROLLER_DeFi = "0x3344417c9360b963ca93A4e8305361AEde340Ab9";
const BINANCE_ORACLE = "0x594810b741d136f1960141C0d8Fb4a91bE78A820";

const THE = "0xF4C8E32EaDEC4BFe97E0F595AdD0f4450a863a11";
const TWT = "0x4b0f1812e5df2a09796481ff14017e6005508003";
const POOL_REGISTRY = "0x9F7b01A536aFA00EF10310A162877fd792cD0666";
const VTOKEN_RECEIVER_TWT = "0x1c6C2498854662FDeadbC4F14eA2f30ca305104b";
const VTOKEN_RECEIVER_THE = "0x1c6C2498854662FDeadbC4F14eA2f30ca305104b";
const VTHE_DeFi = "";
const VTWT_DeFi = "";
const REWARD_DISTRIBUTOR = "";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const USDT = "0x55d398326f99059ff775485246999027b3197955";
const COMMUNITY_WALLET = "0xc444949e0054A23c44Fc45789738bdF64aed2391";

forking(30066043, () => {
  let poolRegistry: Contract;
  let comptroller: Contract;
  let vTHE: Contract;
  let vTWT: Contract;
  let usdt: Contract;
  let rewardsDistributor: Contract;
  let communityWalletBalanceBefore: BigNumberish;

  before(async () => {
    poolRegistry = await ethers.getContractAt(POOL_REGISTRY_ABI, POOL_REGISTRY);
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER_DeFi);
    vTHE = await ethers.getContractAt(VTOKEN_ABI, VTHE_DeFi);
    vTWT = await ethers.getContractAt(VTOKEN_ABI, VTHE_DeFi);
    usdt = await ethers.getContractAt(ERC20_ABI, USDT);
    rewardsDistributor = await ethers.getContractAt(REWARD_DISTRIBUTOR_ABI, REWARD_DISTRIBUTOR);
    await setMaxStalePeriodInBinanceOracle(BINANCE_ORACLE, "THE");
    await setMaxStalePeriodInBinanceOracle(BINANCE_ORACLE, "TWT");
    await setMaxStalePeriodInBinanceOracle(BINANCE_ORACLE, "USDD");
    communityWalletBalanceBefore = await usdt.balanceOf(COMMUNITY_WALLET);
  });

  describe("Contracts setup", () => {
    const checkVToken = (
      vTokenAddress: string,
      {
        name,
        symbol,
        decimals,
        underlying,
        exchangeRate,
      }: {
        name: string;
        symbol: string;
        decimals: BigNumberish;
        underlying: string;
        exchangeRate: BigNumberish;
      },
    ) => {
      describe(symbol, () => {
        let vToken: Contract;

        before(async () => {
          vToken = await ethers.getContractAt(VTOKEN_ABI, vTokenAddress);
        });

        it(`should have name = "${name}"`, async () => {
          expect(await vToken.name()).to.equal(name);
        });

        it(`should have symbol = "${symbol}"`, async () => {
          expect(await vToken.symbol()).to.equal(symbol);
        });

        it(`should have ${decimals.toString()} decimals`, async () => {
          expect(await vToken.decimals()).to.equal(decimals);
        });

        it(`should have underlying = "${underlying}"`, async () => {
          expect(await vToken.underlying()).to.equal(underlying);
        });

        it(`should have initial exchange rate of ${exchangeRate.toString()}`, async () => {
          expect(await vToken.exchangeRateStored()).to.equal(exchangeRate);
        });

        it("should have the correct Comptroller", async () => {
          expect(await vToken.exchangeRateStored()).to.equal(exchangeRate);
        });
      });
    };

    checkVToken(VTHE_DeFi, {
      name: "Venus THE (DeFi)",
      symbol: "vTHE_DeFi",
      decimals: 8,
      underlying: THE,
      exchangeRate: parseUnits("1", 28),
    });
    checkVToken(VTHE_DeFi, {
      name: "Venus TWT (DeFi)",
      symbol: "vTWT_DeFi",
      decimals: 8,
      underlying: TWT,
      exchangeRate: parseUnits("1", 28),
    });
  });

  testVip("VIP-160 Add Markets", vip160(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI, POOL_REGISTRY_ABI, REWARD_DISTRIBUTOR_ABI, ERC20_ABI, TREASURY_ABI],
        [
          "WithdrawTreasuryBEP20",
          "Approval",
          "MarketAdded",
          "NewRewardsDistributor",
          "RewardTokenSupplySpeedUpdated",
          "RewardTokenBorrowSpeedUpdated",
          "OwnershipTransferred",
        ],
        [2, 6, 1, 1, 1, 1, 4],
      );
    },
  });

  describe("Post-VIP state", () => {
    describe("Balance Checks", () => {
      it("should transfer funds to community wallet from treasury", async () => {
        const communityWalletBalanceAfter = await usdt.balanceOf(COMMUNITY_WALLET);
        const differenceInBalance = communityWalletBalanceAfter.sub(communityWalletBalanceBefore);
        expect(differenceInBalance).equals(parseUnits("6000", 18));
      });
    });
    describe("PoolRegistry state", () => {
      it("should register pool's vTokens in Comptroller", async () => {
        const vTokens = await comptroller.getAllMarkets();
        expect(vTokens).to.have.lengthOf(9);
        expect(vTokens).to.include(VTHE_DeFi);
        expect(vTokens).to.include(VTWT_DeFi);
      });

      it("should register vTHE_DeFi in PoolRegistry", async () => {
        let vToken = await poolRegistry.getVTokenForAsset(COMPTROLLER_DeFi, THE);
        expect(vToken).to.equal(VTHE_DeFi);

        vToken = await poolRegistry.getVTokenForAsset(COMPTROLLER_DeFi, THE);
        expect(vToken).to.equal(VTWT_DeFi);
      });
    });

    describe("Ownership", () => {
      it("should transfer ownership of vTHE_DeFi to Timelock", async () => {
        expect(await vTHE.owner()).to.equal(NORMAL_TIMELOCK);
        expect(await vTWT.owner()).to.equal(NORMAL_TIMELOCK);
      });
    });

    describe("Initial supply", () => {
      it(`should mint 5882350000000 vTHE to ${VTOKEN_RECEIVER_THE}`, async () => {
        expect(await vTHE.balanceOf(VTOKEN_RECEIVER_THE)).to.equal(parseUnits("58823.5", 8));
      });

      it(`should mint 5882350000000 vTWT to ${VTOKEN_RECEIVER_TWT}`, async () => {
        expect(await vTWT.balanceOf(VTOKEN_RECEIVER_TWT)).to.equal(parseUnits("58823.5", 8));
      });
    });

    describe("Market and risk parameters", () => {
      const checkInterestRate = (
        vTokenAddress: string,
        symbol: string,
        {
          base,
          multiplier,
          jump,
          kink,
        }: {
          base: string;
          multiplier: string;
          jump: string;
          kink: string;
        },
      ) => {
        describe(`${symbol} interest rate model`, () => {
          const BLOCKS_PER_YEAR = 10512000;
          let rateModel: Contract;

          before(async () => {
            const vToken = await ethers.getContractAt(VTOKEN_ABI, vTokenAddress);
            rateModel = await ethers.getContractAt(RATE_MODEL_ABI, await vToken.interestRateModel());
          });

          it(`should have base = ${base}`, async () => {
            const basePerBlock = parseUnits(base, 18).div(BLOCKS_PER_YEAR);
            expect(await rateModel.baseRatePerBlock()).to.equal(basePerBlock);
          });

          it(`should have jump = ${jump}`, async () => {
            const jumpPerBlock = parseUnits(jump, 18).div(BLOCKS_PER_YEAR);
            expect(await rateModel.jumpMultiplierPerBlock()).to.equal(jumpPerBlock);
          });

          it(`should have multiplier = ${multiplier}`, async () => {
            const multiplierPerBlock = parseUnits(multiplier, 18).div(BLOCKS_PER_YEAR);
            expect(await rateModel.multiplierPerBlock()).to.equal(multiplierPerBlock);
          });

          it(`should have kink = ${kink}`, async () => {
            expect(await rateModel.kink()).to.equal(parseUnits(kink, 18));
          });
        });
      };

      describe("Interest rate models", () => {
        checkInterestRate(VTHE_DeFi, "vTHE_DeFi", {
          base: "0.02",
          multiplier: "0.2",
          jump: "3",
          kink: "0.5",
        });

        checkInterestRate(VTHE_DeFi, "vTHE_DeFi", {
          base: "0.02",
          multiplier: "0.2",
          jump: "3",
          kink: "0.5",
        });

        describe("RF, CF, LT, Protocol seize share", () => {
          it("should set vTHE_DeFi reserve factor to 0.25", async () => {
            expect(await vTHE.reserveFactorMantissa()).to.equal(parseUnits("0.25", 18));
          });

          it("should set vTHE_DeFi collateral factor to 20%", async () => {
            const market = await comptroller.markets(VTHE_DeFi);
            expect(market.collateralFactorMantissa).to.equal(0);
          });

          it("should set vTHE_DeFi liquidation threshold to 30%", async () => {
            const market = await comptroller.markets(VTWT_DeFi);
            expect(market.liquidationThresholdMantissa).to.equal(0);
          });

          it("should set vTHE_DeFi protocolSeizeShareMantissa to 5%", async () => {
            const protocolSeizeShare = await vTHE.protocolSeizeShareMantissa();
            expect(protocolSeizeShare).to.equal(parseUnits("0.05", 18));
          });

          it("should set vTWT_DeFi reserve factor to 0.25", async () => {
            expect(await vTHE.reserveFactorMantissa()).to.equal(parseUnits("0.25", 18));
          });

          it("should set vTWT_DeFi collateral factor to 50%", async () => {
            const market = await comptroller.markets(VTWT_DeFi);
            expect(market.collateralFactorMantissa).to.equal(parseUnits("0.5", 18));
          });

          it("should set vTWT_DeFi liquidation threshold to 60%", async () => {
            const market = await comptroller.markets(VTWT_DeFi);
            expect(market.liquidationThresholdMantissa).to.equal(parseUnits("0.6", 18));
          });

          it("should set vTWT_DeFi protocolSeizeShareMantissa to 5%", async () => {
            const protocolSeizeShare = await vTHE.protocolSeizeShareMantissa();
            expect(protocolSeizeShare).to.equal(parseUnits("0.05", 18));
          });
        });

        describe("Caps", () => {
          it("should set vTHE_DeFi supply cap to 1,400,000", async () => {
            expect(await comptroller.supplyCaps(VTHE_DeFi)).to.equal(parseUnits("1400000", 18));
          });

          it("should set vTHE_DeFi borrow cap to 2,600,000", async () => {
            expect(await comptroller.borrowCaps(VTHE_DeFi)).to.equal(parseUnits("2600000", 18));
          });

          it("should set vTWT_DeFi supply cap to 1,000,000", async () => {
            expect(await comptroller.supplyCaps(VTWT_DeFi)).to.equal(parseUnits("1000000", 18));
          });

          it("should set vTWT_DeFi borrow cap to 500,000", async () => {
            expect(await comptroller.borrowCaps(VTWT_DeFi)).to.equal(parseUnits("500000", 18));
          });
        });

        describe("Reward Distributor", () => {
          it("should be added to DeFi pool", async () => {
            expect(await comptroller.getRewardDistributors()).to.include(REWARD_DISTRIBUTOR);
          });

          it("should have 2 rewards distributor in DeFi pool", async () => {
            expect(await comptroller.getRewardDistributors()).to.have.lengthOf(3);
          });

          it("should have rewardToken THE", async () => {
            expect(await rewardsDistributor.rewardToken()).to.equal(THE);
          });

          it(`should have owner = Normal Timelock`, async () => {
            expect(await rewardsDistributor.owner()).to.equal(NORMAL_TIMELOCK);
          });

          it("should have borrowSpeed  = 68082754629629629", async () => {
            expect(await rewardsDistributor.rewardTokenBorrowSpeeds(VTHE_DeFi)).to.equal("68082754629629629");
          });

          it("should have supplySpeed = 68082754629629629", async () => {
            expect(await rewardsDistributor.rewardTokenSupplySpeeds(VTHE_DeFi)).to.equal("68082754629629629");
          });

          it("should have balance = 58823.5 THE", async () => {
            const token = await ethers.getContractAt(ERC20_ABI, THE);
            expect(await token.balanceOf(rewardsDistributor.address)).to.equal(parseUnits("58823.5", 18));
          });
        });
      });
    });

    describe("Basic supply/borrow/repay/redeem scenario", () => {
      let the: Contract;
      let twt: Contract;
      let usdd: Contract;
      let vUSDD: Contract;
      let user: SignerWithAddress;

      before(async () => {
        [user] = await ethers.getSigners();
        the = await ethers.getContractAt(ERC20_ABI, THE);
        twt = await ethers.getContractAt(ERC20_ABI, TWT);
        const USDD_HOLDER = "0xf8ba3ec49212ca45325a2335a8ab1279770df6c0";
        const THE_HOLDER = "0xfBBF371C9B0B994EebFcC977CEf603F7f31c070D";
        const TWT_HOLDER = "0xD1B189422012e023edEEc0eAA1270AF78B0a4d71";
        usdd = await ethers.getContractAt(ERC20_ABI, USDD);
        vUSDD = await ethers.getContractAt(VTOKEN_ABI, vUSDD_DeFi);
        const usddHolder = await initMainnetUser(USDD_HOLDER, parseUnits("1", 18));
        const THEHolder = await initMainnetUser(THE_HOLDER, parseUnits("1", 18));
        const TWTHolder = await initMainnetUser(TWT_HOLDER, parseUnits("1", 18));
        await usdd.connect(usddHolder).transfer(user.address, parseUnits("100", 18));
        await the.connect(THEHolder).transfer(user.address, parseUnits("100", 18));
        await twt.connect(TWTHolder).transfer(user.address, parseUnits("100", 18));
      });

      it("should be possible to supply", async () => {
        await the.connect(user).approve(vTHE.address, parseUnits("100", 18));
        await vTHE.connect(user).mint(parseUnits("100", 18));
        expect(await vTHE.balanceOf(user.address)).to.equal(parseUnits("100", 8));

        await twt.connect(user).approve(vTHE.address, parseUnits("100", 18));
        await vTHE.connect(user).mint(parseUnits("100", 18));
        expect(await vTHE.balanceOf(user.address)).to.equal(parseUnits("100", 8));
      });

      it("should be possible to enable as collateral", async () => {
        await comptroller.connect(user).enterMarkets([VTHE_DeFi, VTWT_DeFi]);
        expect(await comptroller.getAssetsIn(user.address)).to.deep.equal([VTHE_DeFi, VTWT_DeFi]);
      });

      it("should be possible to borrow", async () => {
        // THE
        await usdd.connect(user).approve(vUSDD.address, parseUnits("100", 18));
        await vUSDD.connect(user).mint(parseUnits("100", 18));
        expect(await vUSDD.balanceOf(user.address)).to.equal(parseUnits("100", 8));
        await comptroller.connect(user).enterMarkets([vUSDD.address]);

        await vTHE.connect(user).borrow(1000000);
        expect(await vTHE.borrowBalanceStored(user.address)).to.equal(1000000);
        expect(await the.balanceOf(user.address)).to.equal(1000000);
        // TWT
        await usdd.connect(user).approve(vUSDD.address, parseUnits("100", 18));
        await vUSDD.connect(user).mint(parseUnits("100", 18));
        expect(await vUSDD.balanceOf(user.address)).to.equal(parseUnits("100", 8));
        await comptroller.connect(user).enterMarkets([vUSDD.address]);

        await vTWT.connect(user).borrow(1000000);
        expect(await vTWT.borrowBalanceStored(user.address)).to.equal(1000000);
        expect(await twt.balanceOf(user.address)).to.equal(1000000);
      });

      it("should be possible to repay", async () => {
        // THE
        await the.approve(vTHE.address, 1000000);
        await vTHE.repayBorrow(1000000);
        expect(await vTHE.borrowBalanceStored(user.address)).to.be.lessThan(parseUnits("0.01", 18));
        expect(await the.balanceOf(user.address)).to.equal(0);
        // TWT
        await twt.approve(vTHE.address, 1000000);
        await vTWT.repayBorrow(1000000);
        expect(await vTHE.borrowBalanceStored(user.address)).to.be.lessThan(parseUnits("0.01", 18));
        expect(await twt.balanceOf(user.address)).to.equal(0);
      });

      it("should be possible to redeem a part of ankr", async () => {
        // THE
        await vTHE.redeemUnderlying(parseUnits("30", 18));
        expect(await the.balanceOf(user.address)).to.equal(parseUnits("30", 18));
        expect(await vTHE.balanceOf(user.address)).to.equal(parseUnits("70", 8));
        //TWT
        await vTWT.redeemUnderlying(parseUnits("30", 18));
        expect(await twt.balanceOf(user.address)).to.equal(parseUnits("30", 18));
        expect(await vTWT.balanceOf(user.address)).to.equal(parseUnits("70", 8));
      });
    });
  });
});
