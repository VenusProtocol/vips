import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumberish } from "ethers";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { vip146 } from "../../../vips/vip-146/vip-146-testnet";
import ORACLE_ABI from "./abi/binanceOracle.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import ERC20_ABI from "./abi/erc20.json";
import POOL_REGISTRY_ABI from "./abi/poolRegistry.json";
import RATE_MODEL_ABI from "./abi/rateModel.json";
import REWARD_DISTRIBUTOR_ABI from "./abi/rewardsDistributor.json";
import VTOKEN_ABI from "./abi/vToken.json";

const ankrBNB = "0x167F1F9EF531b3576201aa3146b13c57dbEda514";
const USDD = "0x2E2466e22FcbE0732Be385ee2FBb9C59a1098382";
const POOL_REGISTRY = "0xC85491616Fa949E048F3aAc39fbf5b0703800667";
const VTOKEN_RECEIVER = "0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706";
const vankrBNB_DeFi = "0xe507B30C41E9e375BCe05197c1e09fc9ee40c0f6";
const vUSDD_DeFi = "0xa109DE0abaeefC521Ec29D89eA42E64F37A6882E";
const COMPTROLLER_DeFi = "0x23a73971A6B9f6580c048B9CB188869B2A2aA2aD";
const BINANCE_ORACLE = "0xCeA29f1266e880A1482c06eD656cD08C148BaA32";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const REWARD_DISTRIBUTOR = "0x4be90041D1e082EfE3613099aA3b987D9045d718";
const ANKR = "0xe4a90EB942CF2DA7238e8F6cC9EF510c49FC8B4B";

forking(31655347, async () => {
  let poolRegistry: Contract;
  let comptroller: Contract;
  let vankrBNB: Contract;
  let oracle: Contract;
  let rewardsDistributor: Contract;

  before(async () => {
    poolRegistry = await ethers.getContractAt(POOL_REGISTRY_ABI, POOL_REGISTRY);
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER_DeFi);
    vankrBNB = await ethers.getContractAt(VTOKEN_ABI, vankrBNB_DeFi);
    oracle = await ethers.getContractAt(ORACLE_ABI, BINANCE_ORACLE);
    rewardsDistributor = await ethers.getContractAt(REWARD_DISTRIBUTOR_ABI, REWARD_DISTRIBUTOR);
    const siger = await initMainnetUser(NORMAL_TIMELOCK, ethers.utils.parseEther("2"));
    await oracle.connect(siger).setDirectPrice(USDD, "10000000000");
    await oracle.connect(siger).setDirectPrice(ankrBNB, "10000000000");
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

    await checkVToken(vankrBNB_DeFi, {
      name: "Venus ankrBNB (DeFi)",
      symbol: "vankrBNB_DeFi",
      decimals: 8,
      underlying: ankrBNB,
      exchangeRate: parseUnits("1", 28),
    });
  });

  testVip("VIP-146 Add Market", await vip146());

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
      it("should transfer ownership of vUSDD_Stablecoins to Timelock", async () => {
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
        usdd = await ethers.getContractAt(ERC20_ABI, USDD);
        vUSDD = await ethers.getContractAt(VTOKEN_ABI, vUSDD_DeFi);
        await ankrBnb.faucet(parseUnits("100", 18));
      });

      it("should be possible to supply ankrBNB", async () => {
        await ankrBnb.approve(vankrBNB.address, parseUnits("100", 18));
        await vankrBNB.mint(parseUnits("100", 18));
        expect(await vankrBNB.balanceOf(user.address)).to.equal(parseUnits("100", 8));
      });

      it("should be possible to enable ankrBNB as collateral", async () => {
        await comptroller.connect(user).enterMarkets([vankrBNB_DeFi]);
        expect(await comptroller.getAssetsIn(user.address)).to.deep.equal([vankrBNB_DeFi]);
      });

      it("should be possible to borrow USDD", async () => {
        await vUSDD.connect(user).borrow(1000000);
        expect(await vUSDD.borrowBalanceStored(user.address)).to.equal(1000000);
        expect(await usdd.balanceOf(user.address)).to.equal(1000000);
      });

      it("should be possible to repay USDD", async () => {
        await usdd.approve(vUSDD.address, 1000000);
        await vUSDD.repayBorrow(1000000);
        expect(await vUSDD.borrowBalanceStored(user.address)).to.be.lessThan(parseUnits("0.01", 18));
        expect(await usdd.balanceOf(user.address)).to.equal(0);
      });

      it("should be possible to redeem a part of ankr", async () => {
        await vankrBNB.redeemUnderlying(parseUnits("30", 18));
        expect(await ankrBnb.balanceOf(user.address)).to.equal(parseUnits("30", 18));
        expect(await vankrBNB.balanceOf(user.address)).to.equal(parseUnits("70", 8));
      });
    });
  });
});
