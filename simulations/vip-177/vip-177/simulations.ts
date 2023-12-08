import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumberish } from "ethers";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents, initMainnetUser } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { vip177 } from "../../../vips/vip-177/vip-177";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import ERC20_ABI from "./abi/erc20.json";
import POOL_REGISTRY_ABI from "./abi/poolRegistry.json";
import RATE_MODEL_ABI from "./abi/rateModel.json";
import REWARD_DISTRIBUTOR_ABI from "./abi/rewardsDistributor.json";
import VTOKEN_ABI from "./abi/vToken.json";

const SnBNB = "0xB0b84D294e0C75A6abe60171b70edEb2EFd14A1B";
const POOL_REGISTRY = "0x9F7b01A536aFA00EF10310A162877fd792cD0666";
const VTOKEN_RECEIVER_SnBNB = "0xDC2D855A95Ee70d7282BebD35c96f905CDE31f55";
const vSnBNB_LiquidStakedBNB = "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A";
const REWARD_DISTRIBUTOR_SnBNB = "0x888E317606b4c590BBAD88653863e8B345702633";
const Liquid_Staked_BNB_Comptroller = "0xd933909A4a2b7A4638903028f44D1d38ce27c352";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const HAY = "0x0782b6d8c4551B9760e74c0545a9bCD90bdc41E5";
const SHORTFALL = "0xf37530A8a810Fcb501AA0Ecd0B0699388F0F2209";
const PROTOCOL_SHARE_RESERVE = "0xfB5bE09a1FA6CFDA075aB1E69FE83ce8324682e4";

forking(32084538, () => {
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

    checkVToken(vSnBNB_LiquidStakedBNB, {
      name: "Venus SnBNB (Liquid Staked BNB)",
      symbol: "vSnBNB_LiquidStakedBNB",
      decimals: 8,
      underlying: SnBNB,
      exchangeRate: parseUnits("1", 28),
    });
  });

  testVip("VIP-177 Add SnBnb Market", vip177(24 * 60 * 60 * 3), {
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
        expect(vTokens).to.have.lengthOf(5);
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
      it(`should mint 4,700,000,000 vSnBNB to ${VTOKEN_RECEIVER_SnBNB}`, async () => {
        expect(await vSnBNB.balanceOf(VTOKEN_RECEIVER_SnBNB)).to.equal(parseUnits("47", 8));
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

    describe("ProtocolShareReserve and Shortfall", () => {
      before(async () => {
        vSnBNB = await ethers.getContractAt(VTOKEN_ABI, vSnBNB_LiquidStakedBNB);
      });

      it("sets ProtocolShareReserve address", async () => {
        expect(await vSnBNB.protocolShareReserve()).to.equal(PROTOCOL_SHARE_RESERVE);
      });

      it("sets Shortfall contract address", async () => {
        expect(await vSnBNB.shortfall()).to.equal(SHORTFALL);
      });
    });

    describe("Basic supply/borrow/repay/redeem scenario", () => {
      let snBnb: Contract;
      let vSnBNB: Contract;
      let user: SignerWithAddress;

      before(async () => {
        [user] = await ethers.getSigners();
        const SnBNB_HOLDER = "0xbdAC55A3559549Ac78858e1409133E56Bf04D0e8";
        snBnb = await ethers.getContractAt(ERC20_ABI, SnBNB);
        vSnBNB = await ethers.getContractAt(VTOKEN_ABI, vSnBNB_LiquidStakedBNB);
        const snbnb_holder = await initMainnetUser(SnBNB_HOLDER, parseUnits("1", 18));
        await snBnb.connect(snbnb_holder).transfer(user.address, parseUnits(".00005", 18));
      });

      it("should be possible to supply", async () => {
        await snBnb.approve(vSnBNB.address, parseUnits(".00005", 18));
        await vSnBNB.mint(parseUnits(".00005", 18));
        expect(await vSnBNB.balanceOf(user.address)).to.equal(parseUnits(".00005", 8));
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
        await vSnBNB.redeemUnderlying(parseUnits(".00001", 18));
        expect(await snBnb.balanceOf(user.address)).to.equal(parseUnits(".00001", 18));
        expect(await vSnBNB.balanceOf(user.address)).to.equal(parseUnits(".00004", 8));
      });
    });
  });
});
