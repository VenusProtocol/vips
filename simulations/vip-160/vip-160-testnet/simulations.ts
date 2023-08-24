import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumberish } from "ethers";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents, initMainnetUser } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { vip160Testnet } from "../../../vips/vip-160/vip-160-testnet";
import BINANCE_ORACLE_ABI from "./abi/binanceOracle.json";
import RESILIENT_ORACLE_ABI from "./abi/binanceOracle.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import ERC20_ABI from "./abi/erc20.json";
import POOL_REGISTRY_ABI from "./abi/poolRegistry.json";
import RATE_MODEL_ABI from "./abi/rateModel.json";
import REWARD_DISTRIBUTOR_ABI from "./abi/rewardsDistributor.json";
import VTOKEN_ABI from "./abi/vToken.json";

const THE = "0xB1cbD28Cb101c87b5F94a14A8EF081EA7F985593";
const TWT = "0xb99C6B26Fdf3678c6e2aff8466E3625a0e7182f8";
const POOL_REGISTRY = "0xC85491616Fa949E048F3aAc39fbf5b0703800667";
const VTOKEN_RECEIVER_TWT = "0x1c6C2498854662FDeadbC4F14eA2f30ca305104b";
const VTOKEN_RECEIVER_THE = "0x1c6C2498854662FDeadbC4F14eA2f30ca305104b";
const VTHE_DeFi = "0x5Ec06c9dD9654d42B69A8EdBBa99b1e8Afa0D4C0";
const VTWT_DeFi = "0x4C94e67d239aD585275Fdd3246Ab82c8a2668564";
const REWARD_DISTRIBUTOR = "0x5cBf86e076b3F36a85dD73A730a3567FdCA0D21E";
const DEFI_COMPTROLLER = "0x23a73971A6B9f6580c048B9CB188869B2A2aA2aD";
const BINANCE_ORACLE = "0xCeA29f1266e880A1482c06eD656cD08C148BaA32";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const RESILIENT_ORACLE = "0x3cD69251D04A28d887Ac14cbe2E14c52F3D57823";
const USDD = "0x2E2466e22FcbE0732Be385ee2FBb9C59a1098382";
const vUSDD_DeFi = "0xa109DE0abaeefC521Ec29D89eA42E64F37A6882E";

forking(32725445, () => {
  let poolRegistry: Contract;
  let comptroller: Contract;
  let vTHE: Contract;
  let vTWT: Contract;
  let binanceOracle: Contract;
  let rewardsDistributor: Contract;

  before(async () => {
    poolRegistry = await ethers.getContractAt(POOL_REGISTRY_ABI, POOL_REGISTRY);
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, DEFI_COMPTROLLER);
    vTHE = await ethers.getContractAt(VTOKEN_ABI, VTHE_DeFi);
    vTWT = await ethers.getContractAt(VTOKEN_ABI, VTWT_DeFi);
    binanceOracle = await ethers.getContractAt(BINANCE_ORACLE_ABI, BINANCE_ORACLE);
    rewardsDistributor = await ethers.getContractAt(REWARD_DISTRIBUTOR_ABI, REWARD_DISTRIBUTOR);
    const siger = await initMainnetUser(NORMAL_TIMELOCK, ethers.utils.parseEther("2"));
    await binanceOracle.connect(siger).setDirectPrice(USDD, "10000000000");
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

    checkVToken(VTWT_DeFi, {
      name: "Venus TWT (DeFi)",
      symbol: "vTWT_DeFi",
      decimals: 8,
      underlying: TWT,
      exchangeRate: parseUnits("1", 28),
    });
  });

  testVip("VIP-160Testnet Add THE and TWT Market", vip160Testnet(), {
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
        [12, 2, 1, 1, 1, 3],
      );
    },
  });

  describe("Post-VIP state", () => {
    describe("PoolRegistry state", () => {
      it("should register pool's vTokens in Comptroller", async () => {
        const vTokens = await comptroller.getAllMarkets();
        expect(vTokens).to.have.lengthOf(8);
        expect(vTokens).to.include(VTHE_DeFi);
        expect(vTokens).to.include(VTWT_DeFi);
      });

      it("should register in PoolRegistry", async () => {
        let vToken = await poolRegistry.getVTokenForAsset(DEFI_COMPTROLLER, THE);
        expect(vToken).to.equal(VTHE_DeFi);

        vToken = await poolRegistry.getVTokenForAsset(DEFI_COMPTROLLER, TWT);
        expect(vToken).to.equal(VTWT_DeFi);
      });
    });

    describe("Ownership", () => {
      it("should transfer ownership to Timelock", async () => {
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

        checkInterestRate(VTWT_DeFi, "vTWT_DeFi", {
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
            expect(market.collateralFactorMantissa).to.equal(parseUnits("0.2", 18));
          });

          it("should set vTHE_DeFi liquidation threshold to 30%", async () => {
            const market = await comptroller.markets(VTHE_DeFi);
            expect(market.liquidationThresholdMantissa).to.equal(parseUnits("0.3", 18));
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
        usdd = await ethers.getContractAt(ERC20_ABI, USDD);
        vUSDD = await ethers.getContractAt(VTOKEN_ABI, vUSDD_DeFi);
        await the.faucet(parseUnits("100", 18));
        await twt.faucet(parseUnits("100", 18));
      });

      it("should be possible to supply", async () => {
        await the.approve(vTHE.address, parseUnits("100", 18));
        await vTHE.mint(parseUnits("100", 18));
        expect(await vTHE.balanceOf(user.address)).to.equal(parseUnits("100", 8));

        await twt.approve(vTWT.address, parseUnits("100", 18));
        await vTWT.mint(parseUnits("100", 18));
        expect(await vTWT.balanceOf(user.address)).to.equal(parseUnits("100", 8));
      });

      it("should be possible to enable the as collateral", async () => {
        await comptroller.connect(user).enterMarkets([VTHE_DeFi, VTWT_DeFi]);
        expect(await comptroller.getAssetsIn(user.address)).to.deep.equal([VTHE_DeFi, VTWT_DeFi]);
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

      it("should be possible to redeem a part of total", async () => {
        await vTHE.redeemUnderlying(parseUnits("30", 18));
        expect(await the.balanceOf(user.address)).to.equal(parseUnits("30", 18));
        expect(await vTHE.balanceOf(user.address)).to.equal(parseUnits("70", 8));

        await vTWT.redeemUnderlying(parseUnits("30", 18));
        expect(await twt.balanceOf(user.address)).to.equal(parseUnits("30", 18));
        expect(await vTWT.balanceOf(user.address)).to.equal(parseUnits("70", 8));
      });
    });
  });
});
