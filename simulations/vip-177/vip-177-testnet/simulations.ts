import { TransactionResponse } from "@ethersproject/providers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumberish } from "ethers";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { vip177Testnet } from "../../../vips/vip-177/vip-177-testnet";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import ERC20_ABI from "./abi/erc20.json";
import POOL_REGISTRY_ABI from "./abi/poolRegistry.json";
import RATE_MODEL_ABI from "./abi/rateModel.json";
import REWARD_DISTRIBUTOR_ABI from "./abi/rewardsDistributor.json";
import VTOKEN_ABI from "./abi/vToken.json";

const SnBNB = "0xd2aF6A916Bc77764dc63742BC30f71AF4cF423F4";
const POOL_REGISTRY = "0xC85491616Fa949E048F3aAc39fbf5b0703800667";
const vTOKEN_RECEIVER_SnBNB = "0xDC2D855A95Ee70d7282BebD35c96f905CDE31f55";
const vSnBNB_LiquidStakedBNB = "0xeffE7874C345aE877c1D893cd5160DDD359b24dA";
const REWARD_DISTRIBUTOR_SnBNB = "0xc1Ea6292C49D6B6E952baAC6673dE64701bB88cB";
const Liquid_Staked_BNB_Comptroller = "0x596B11acAACF03217287939f88d63b51d3771704";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const HAY = "0xe73774DfCD551BF75650772dC2cC56a2B6323453";

forking(33682900, async () => {
  let poolRegistry: Contract;
  let comptroller: Contract;
  let vSnBNB: Contract;
  let rewardsDistributor: Contract;

  before(async () => {
    poolRegistry = await ethers.getContractAt(POOL_REGISTRY_ABI, POOL_REGISTRY);
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, Liquid_Staked_BNB_Comptroller);
    vSnBNB = await ethers.getContractAt(VTOKEN_ABI, vSnBNB_LiquidStakedBNB);
    rewardsDistributor = await ethers.getContractAt(REWARD_DISTRIBUTOR_ABI, REWARD_DISTRIBUTOR_SnBNB);
  });

  describe("Contracts setup", async () => {
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

    await checkVToken(vSnBNB_LiquidStakedBNB, {
      name: "Venus SnBNB (Liquid Staked BNB)",
      symbol: "vSnBNB_LiquidStakedBNB",
      decimals: 8,
      underlying: SnBNB,
      exchangeRate: parseUnits("1", 28),
    });
  });

  testVip("VIP-177Testnet Add SnBnb Market", await vip177Testnet(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI, POOL_REGISTRY_ABI, REWARD_DISTRIBUTOR_ABI, ERC20_ABI],
        [
          "Approval",
          "MarketAdded",
          "NewRewardsDistributor",
          "RewardTokenSupplySpeedUpdated",
          "RewardTokenBorrowSpeedUpdated",
          "OwnershipTransferred",
        ],
        [6, 1, 1, 1, 1, 3],
      );
    },
  });

  describe("Post-VIP state", () => {
    describe("PoolRegistry state", () => {
      it("should register pool's vTokens in Comptroller", async () => {
        const vTokens = await comptroller.getAllMarkets();
        expect(vTokens).to.have.lengthOf(7);
        expect(vTokens).to.include(vSnBNB_LiquidStakedBNB);
      });

      it("should register in PoolRegistry", async () => {
        const vToken = await poolRegistry.getVTokenForAsset(Liquid_Staked_BNB_Comptroller, SnBNB);
        expect(vToken).to.equal(vSnBNB_LiquidStakedBNB);
      });
    });

    describe("Ownership", () => {
      it("should transfer ownership to Timelock", async () => {
        expect(await vSnBNB.owner()).to.equal(NORMAL_TIMELOCK);
      });
    });

    describe("Initial supply", () => {
      it(`should mint 4,700,000,000 vSnBNB to ${vTOKEN_RECEIVER_SnBNB}`, async () => {
        expect(await vSnBNB.balanceOf(vTOKEN_RECEIVER_SnBNB)).to.equal(parseUnits("47", 8));
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
        checkInterestRate(vSnBNB_LiquidStakedBNB, "vSnBNB_LiquidStakedBNB", {
          base: "0.02",
          multiplier: "0.2",
          jump: "3",
          kink: "0.5",
        });

        describe("RF, CF, LT, Protocol seize share", () => {
          it("should set Liquid_Staked_BNB_Comptroller reserve factor to 25%", async () => {
            expect(await vSnBNB.reserveFactorMantissa()).to.equal(parseUnits("0.25", 18));
          });

          it("should set Liquid_Staked_BNB_Comptroller collateral factor to 87%", async () => {
            const market = await comptroller.markets(vSnBNB_LiquidStakedBNB);
            expect(market.collateralFactorMantissa).to.equal(parseUnits("0.87", 18));
          });

          it("should set Liquid_Staked_BNB_Comptroller liquidation threshold to 90%", async () => {
            const market = await comptroller.markets(vSnBNB_LiquidStakedBNB);
            expect(market.liquidationThresholdMantissa).to.equal(parseUnits("0.9", 18));
          });

          it("should set Liquid_Staked_BNB_Comptroller protocolSeizeShareMantissa to 5%", async () => {
            const protocolSeizeShare = await vSnBNB.protocolSeizeShareMantissa();
            expect(protocolSeizeShare).to.equal(parseUnits("0.05", 18));
          });
        });

        describe("Caps", () => {
          it("should set vSnBNB_LiquidStakedBNB borrow cap to 100", async () => {
            expect(await comptroller.borrowCaps(vSnBNB_LiquidStakedBNB)).to.equal(parseUnits("100", 18));
          });

          it("should set vSnBNB_LiquidStakedBNB supply cap to 1,000", async () => {
            expect(await comptroller.supplyCaps(vSnBNB_LiquidStakedBNB)).to.equal(parseUnits("1000", 18));
          });
        });

        describe("Reward Distributor", () => {
          it("should be added to Liquid Staked BNB Pool", async () => {
            expect(await comptroller.getRewardDistributors()).to.include(REWARD_DISTRIBUTOR_SnBNB);
          });

          it("should have 5 rewards distributor in Liquid Staked BNB Pool", async () => {
            expect(await comptroller.getRewardDistributors()).to.have.lengthOf(5);
          });

          it("should have rewardToken HAY", async () => {
            expect(await rewardsDistributor.rewardToken()).to.equal(HAY);
          });

          it(`should have owner = Normal Timelock`, async () => {
            expect(await rewardsDistributor.owner()).to.equal(NORMAL_TIMELOCK);
          });

          it("should have borrowSpeed  = 930,059,523,809,523", async () => {
            expect(await rewardsDistributor.rewardTokenBorrowSpeeds(vSnBNB_LiquidStakedBNB)).to.equal(
              "930059523809523",
            );
          });

          it("should have supplySpeed = 930,059,523,809,523", async () => {
            expect(await rewardsDistributor.rewardTokenSupplySpeeds(vSnBNB_LiquidStakedBNB)).to.equal(
              "930059523809523",
            );
          });

          it("should have balance = 3,000 HAY", async () => {
            const token = await ethers.getContractAt(ERC20_ABI, HAY);
            expect(await token.balanceOf(rewardsDistributor.address)).to.equal(parseUnits("3000", 18));
          });
        });
      });
    });

    describe("Basic supply/borrow/repay/redeem scenario", () => {
      let snBnb: Contract;
      let vSnBNB: Contract;
      let user: SignerWithAddress;

      before(async () => {
        [user] = await ethers.getSigners();
        snBnb = await ethers.getContractAt(ERC20_ABI, SnBNB);
        vSnBNB = await ethers.getContractAt(VTOKEN_ABI, vSnBNB_LiquidStakedBNB);
        await snBnb.faucet(parseUnits("100", 18));
      });

      it("should be possible to supply", async () => {
        await snBnb.approve(vSnBNB.address, parseUnits("100", 18));
        await vSnBNB.mint(parseUnits("100", 18));
        expect(await vSnBNB.balanceOf(user.address)).to.equal(parseUnits("100", 8));
      });

      it("should be possible to enable the as collateral", async () => {
        await comptroller.connect(user).enterMarkets([vSnBNB_LiquidStakedBNB]);
        expect(await comptroller.getAssetsIn(user.address)).to.deep.equal([vSnBNB_LiquidStakedBNB]);
      });

      it("should be possible to borrow SnBNB", async () => {
        await vSnBNB.connect(user).borrow(1000000);
        expect(await vSnBNB.borrowBalanceStored(user.address)).to.equal(1000000);
        expect(await snBnb.balanceOf(user.address)).to.equal(1000000);
      });

      it("should be possible to repay SnBNB", async () => {
        await snBnb.approve(vSnBNB.address, 1000000);
        await vSnBNB.repayBorrow(1000000);
        expect(await vSnBNB.borrowBalanceStored(user.address)).to.be.lessThan(parseUnits("0.01", 18));
        expect(await snBnb.balanceOf(user.address)).to.equal(0);
      });

      it("should be possible to redeem a part of total", async () => {
        await vSnBNB.redeemUnderlying(parseUnits("30", 18));
        expect(await snBnb.balanceOf(user.address)).to.equal(parseUnits("30", 18));
        expect(await vSnBNB.balanceOf(user.address)).to.equal(parseUnits("70", 8));
      });
    });
  });
});
