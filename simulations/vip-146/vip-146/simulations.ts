import { TransactionResponse } from "@ethersproject/providers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumberish } from "ethers";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents, initMainnetUser, setMaxStalePeriodInBinanceOracle } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { vip146 } from "../../../vips/vip-146/vip-146";
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

const ankrBNB = "0x52F24a5e03aee338Da5fd9Df68D2b6FAe1178827";
const ANKR = "0xf307910A4c7bbc79691fD374889b36d8531B08e3";
const POOL_REGISTRY = "0x9F7b01A536aFA00EF10310A162877fd792cD0666";
const VTOKEN_RECEIVER = "0xAE1c38847Fb90A13a2a1D7E5552cCD80c62C6508";
const vankrBNB_DeFi = "0x53728FD51060a85ac41974C6C3Eb1DaE42776723";
const REWARD_DISTRIBUTOR = "0x14d9A428D0f35f81A30ca8D8b2F3974D3CccB98B";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";

forking(30066043, () => {
  let poolRegistry: Contract;
  let comptroller: Contract;
  let vankrBNB: Contract;
  let rewardsDistributor: Contract;

  before(async () => {
    poolRegistry = await ethers.getContractAt(POOL_REGISTRY_ABI, POOL_REGISTRY);
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER_DeFi);
    vankrBNB = await ethers.getContractAt(VTOKEN_ABI, vankrBNB_DeFi);
    rewardsDistributor = await ethers.getContractAt(REWARD_DISTRIBUTOR_ABI, REWARD_DISTRIBUTOR);
    await setMaxStalePeriodInBinanceOracle(BINANCE_ORACLE, "ankrBNB");
    await setMaxStalePeriodInBinanceOracle(BINANCE_ORACLE, "USDD");
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

    checkVToken(vankrBNB_DeFi, {
      name: "Venus ankrBNB (DeFi)",
      symbol: "vankrBNB_DeFi",
      decimals: 8,
      underlying: ankrBNB,
      exchangeRate: parseUnits("1", 28),
    });
  });

  testVip("VIP-146 Add Market", vip146(), {
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
    describe("PoolRegistry state", () => {
      it("should register pool's vTokens in Comptroller", async () => {
        const vTokens = await comptroller.getAllMarkets();
        expect(vTokens).to.have.lengthOf(7);
        expect(vTokens).to.include(vankrBNB_DeFi);
      });

      it("should register vankrBNB_DeFi in PoolRegistry", async () => {
        const vToken = await poolRegistry.getVTokenForAsset(COMPTROLLER_DeFi, ankrBNB);
        expect(vToken).to.equal(vankrBNB_DeFi);
      });
    });

    describe("Ownership", () => {
      it("should transfer ownership of vankrBNB_DeFi to Timelock", async () => {
        expect(await vankrBNB.owner()).to.equal(NORMAL_TIMELOCK);
      });
    });

    describe("Initial supply", () => {
      it(`should mint 3900000000 vankrBNB to ${VTOKEN_RECEIVER}`, async () => {
        expect(await vankrBNB.balanceOf(VTOKEN_RECEIVER)).to.equal(parseUnits("39", 8));
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
        checkInterestRate(vankrBNB_DeFi, "vankrBNB_DeFi", {
          base: "0.035",
          multiplier: "0.1",
          jump: "3",
          kink: "0.8",
        });

        describe("RF, CF, LT, Protocol seize share", () => {
          it("should set vankrBNB_DeFi reserve factor to 0.25", async () => {
            expect(await vankrBNB.reserveFactorMantissa()).to.equal(parseUnits("0.25", 18));
          });

          it("should set vankrBNB_DeFi collateral factor to 0", async () => {
            const market = await comptroller.markets(vankrBNB_DeFi);
            expect(market.collateralFactorMantissa).to.equal(0);
          });

          it("should set vankrBNB_DeFi liquidation threshold to 0", async () => {
            const market = await comptroller.markets(vankrBNB_DeFi);
            expect(market.liquidationThresholdMantissa).to.equal(0);
          });

          it("should set vankrBNB_DeFi protocolSeizeShareMantissa to 5%", async () => {
            const protocolSeizeShare = await vankrBNB.protocolSeizeShareMantissa();
            expect(protocolSeizeShare).to.equal(parseUnits("0.05", 18));
          });
        });

        describe("Caps", () => {
          it("should set vankrBNB_DeFi supply cap to 500,000", async () => {
            expect(await comptroller.supplyCaps(vankrBNB_DeFi)).to.equal(parseUnits("5000", 18));
          });

          it("should set vankrBNB_DeFi borrow cap to 200,000", async () => {
            expect(await comptroller.borrowCaps(vankrBNB_DeFi)).to.equal(parseUnits("4000", 18));
          });
        });

        describe("Reward Distributor", () => {
          it("should be added to DeFi pool", async () => {
            expect(await comptroller.getRewardDistributors()).to.include(REWARD_DISTRIBUTOR);
          });

          it("should have 2 rewards distributor in DeFi pool", async () => {
            expect(await comptroller.getRewardDistributors()).to.have.lengthOf(2);
          });

          it("should have rewardToken ANKR", async () => {
            expect(await rewardsDistributor.rewardToken()).to.equal(ANKR);
          });

          it(`should have owner = Normal Timelock`, async () => {
            expect(await rewardsDistributor.owner()).to.equal(NORMAL_TIMELOCK);
          });

          it("should have borrowSpeed  = 289351851851851851", async () => {
            expect(await rewardsDistributor.rewardTokenBorrowSpeeds(vankrBNB_DeFi)).to.equal("289351851851851851");
          });

          it("should have supplySpeed = 289351851851851851", async () => {
            expect(await rewardsDistributor.rewardTokenSupplySpeeds(vankrBNB_DeFi)).to.equal("289351851851851851");
          });

          it("should have balance = 500,000 ANKR", async () => {
            const token = await ethers.getContractAt(ERC20_ABI, ANKR);
            expect(await token.balanceOf(rewardsDistributor.address)).to.equal(parseUnits("500000", 18));
          });
        });
      });
    });

    describe("Basic supply/borrow/repay/redeem scenario", () => {
      let ankrBnb: Contract;
      let usdd: Contract;
      let vUSDD: Contract;
      let user: SignerWithAddress;

      before(async () => {
        [user] = await ethers.getSigners();
        ankrBnb = await ethers.getContractAt(ERC20_ABI, ankrBNB);
        const USDD_HOLDER = "0xf8ba3ec49212ca45325a2335a8ab1279770df6c0";
        const ankrBNB_HOLDER = "0x2f6c6e00e517944ee5efe310cd0b98a3fc61cb98";
        usdd = await ethers.getContractAt(ERC20_ABI, USDD);
        vUSDD = await ethers.getContractAt(VTOKEN_ABI, vUSDD_DeFi);
        const usddHolder = await initMainnetUser(USDD_HOLDER, parseUnits("1", 18));
        const ankrBNBHolder = await initMainnetUser(ankrBNB_HOLDER, parseUnits("1", 18));
        await usdd.connect(usddHolder).transfer(user.address, parseUnits("100", 18));
        await ankrBnb.connect(ankrBNBHolder).transfer(user.address, parseUnits("100", 18));
      });

      it("should be possible to supply ankrBNB", async () => {
        await ankrBnb.connect(user).approve(vankrBNB.address, parseUnits("100", 18));
        await vankrBNB.connect(user).mint(parseUnits("100", 18));
        expect(await vankrBNB.balanceOf(user.address)).to.equal(parseUnits("100", 8));
      });

      it("should be possible to enable ankrBNB as collateral", async () => {
        await comptroller.connect(user).enterMarkets([vankrBNB_DeFi]);
        expect(await comptroller.getAssetsIn(user.address)).to.deep.equal([vankrBNB_DeFi]);
      });

      it("should be possible to borrow ankrBNB", async () => {
        await usdd.connect(user).approve(vUSDD.address, parseUnits("100", 18));
        await vUSDD.connect(user).mint(parseUnits("100", 18));
        expect(await vUSDD.balanceOf(user.address)).to.equal(parseUnits("100", 8));
        await comptroller.connect(user).enterMarkets([vUSDD.address]);

        await vankrBNB.connect(user).borrow(1000000);
        expect(await vankrBNB.borrowBalanceStored(user.address)).to.equal(1000000);
        expect(await ankrBnb.balanceOf(user.address)).to.equal(1000000);
      });

      it("should be possible to repay ankrBNB", async () => {
        await ankrBnb.approve(vankrBNB.address, 1000000);
        await vankrBNB.repayBorrow(1000000);
        expect(await vankrBNB.borrowBalanceStored(user.address)).to.be.lessThan(parseUnits("0.01", 18));
        expect(await ankrBnb.balanceOf(user.address)).to.equal(0);
      });

      it("should be possible to redeem a part of ankr", async () => {
        await vankrBNB.redeemUnderlying(parseUnits("30", 18));
        expect(await ankrBnb.balanceOf(user.address)).to.equal(parseUnits("30", 18));
        expect(await vankrBNB.balanceOf(user.address)).to.equal(parseUnits("70", 8));
      });
    });
  });
});
