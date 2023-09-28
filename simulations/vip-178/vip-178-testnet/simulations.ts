import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumberish } from "ethers";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { vip178Testnet } from "../../../vips/vip-178/vip-178-testnet";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import ERC20_ABI from "./abi/erc20.json";
import POOL_REGISTRY_ABI from "./abi/poolRegistry.json";
import RATE_MODEL_ABI from "./abi/rateModel.json";
import VTOKEN_ABI from "./abi/vToken.json";

const agEUR = "0x63061de4A25f24279AAab80400040684F92Ee319";
const POOL_REGISTRY = "0xC85491616Fa949E048F3aAc39fbf5b0703800667";
const vTOKEN_RECEIVER_agEUR = "0xDC2D855A95Ee70d7282BebD35c96f905CDE31f55";
const VagEUR_Stablecoins = "0xa0571e758a00C586DbD53fb431d0f48eff9d0F15";
const STABLECOIN_COMPTROLLER = "0x10b57706AD2345e590c2eA4DC02faef0d9f5b08B";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";

forking(33728751, () => {
  let poolRegistry: Contract;
  let comptroller: Contract;
  let vagEUR: Contract;

  before(async () => {
    poolRegistry = await ethers.getContractAt(POOL_REGISTRY_ABI, POOL_REGISTRY);
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, STABLECOIN_COMPTROLLER);
    vagEUR = await ethers.getContractAt(VTOKEN_ABI, VagEUR_Stablecoins);
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

    checkVToken(VagEUR_Stablecoins, {
      name: "Venus agEUR (Stablecoins)",
      symbol: "vagEUR_Stablecoins",
      decimals: 8,
      underlying: agEUR,
      exchangeRate: parseUnits("1", 28),
    });
  });

  testVip("VIP-178Testnet Add agEUR Market", vip178Testnet(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI, POOL_REGISTRY_ABI, ERC20_ABI],
        ["Approval", "MarketAdded"],
        [6, 1],
      );
    },
  });

  describe("Post-VIP state", () => {
    describe("PoolRegistry state", () => {
      it("should register pool's vTokens in Comptroller", async () => {
        const vTokens = await comptroller.getAllMarkets();
        expect(vTokens).to.have.lengthOf(4);
        expect(vTokens).to.include(VagEUR_Stablecoins);
      });

      it("should register in PoolRegistry", async () => {
        const vToken = await poolRegistry.getVTokenForAsset(STABLECOIN_COMPTROLLER, agEUR);
        expect(vToken).to.equal(VagEUR_Stablecoins);
      });
    });

    describe("Ownership", () => {
      it("should transfer ownership to Timelock", async () => {
        expect(await vagEUR.owner()).to.equal(NORMAL_TIMELOCK);
      });
    });

    describe("Initial supply", () => {
      it(`should mint 10,000 vagEUR to ${vTOKEN_RECEIVER_agEUR}`, async () => {
        expect(await vagEUR.balanceOf(vTOKEN_RECEIVER_agEUR)).to.equal(parseUnits("10000", 8));
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
        checkInterestRate(VagEUR_Stablecoins, "VagEUR_Stablecoins", {
          base: "0.02",
          multiplier: "0.1",
          jump: "2.5",
          kink: "0.5",
        });

        describe("RF, CF, LT, Protocol seize share", () => {
          it("should set VagEUR_Stablecoins reserve factor to 10%", async () => {
            expect(await vagEUR.reserveFactorMantissa()).to.equal(parseUnits("0.10", 18));
          });

          it("should set VagEUR_Stablecoins collateral factor to 75%", async () => {
            const market = await comptroller.markets(VagEUR_Stablecoins);
            expect(market.collateralFactorMantissa).to.equal(parseUnits("0.75", 18));
          });

          it("should set VagEUR_Stablecoins liquidation threshold to 80%", async () => {
            const market = await comptroller.markets(VagEUR_Stablecoins);
            expect(market.liquidationThresholdMantissa).to.equal(parseUnits("0.80", 18));
          });

          it("should set VagEUR_Stablecoins protocolSeizeShareMantissa to 5%", async () => {
            const protocolSeizeShare = await vagEUR.protocolSeizeShareMantissa();
            expect(protocolSeizeShare).to.equal(parseUnits("0.05", 18));
          });
        });

        describe("Caps", () => {
          it("should set VagEUR_Stablecoins borrow cap to 50,000", async () => {
            expect(await comptroller.borrowCaps(VagEUR_Stablecoins)).to.equal(parseUnits("50000", 18));
          });

          it("should set VagEUR_Stablecoins supply cap to 1,00,000", async () => {
            expect(await comptroller.supplyCaps(VagEUR_Stablecoins)).to.equal(parseUnits("100000", 18));
          });
        });
      });
    });

    describe("Basic supply/borrow/repay/redeem scenario", () => {
      let agEURUnderlying: Contract;
      let vagEUR: Contract;
      let user: SignerWithAddress;

      before(async () => {
        [user] = await ethers.getSigners();
        agEURUnderlying = await ethers.getContractAt(ERC20_ABI, agEUR);
        vagEUR = await ethers.getContractAt(VTOKEN_ABI, VagEUR_Stablecoins);
        await agEURUnderlying.faucet(parseUnits("100", 18));
      });

      it("should be possible to supply", async () => {
        await agEURUnderlying.approve(vagEUR.address, parseUnits("100", 18));
        await vagEUR.mint(parseUnits("100", 18));
        expect(await vagEUR.balanceOf(user.address)).to.equal(parseUnits("100", 8));
      });

      it("should be possible to enable the as collateral", async () => {
        await comptroller.connect(user).enterMarkets([VagEUR_Stablecoins]);
        expect(await comptroller.getAssetsIn(user.address)).to.deep.equal([VagEUR_Stablecoins]);
      });

      it("should be possible to borrow agEUR", async () => {
        await vagEUR.connect(user).borrow(1000000);
        expect(await vagEUR.borrowBalanceStored(user.address)).to.equal(1000000);
        expect(await agEURUnderlying.balanceOf(user.address)).to.equal(1000000);
      });

      it("should be possible to repay agEUR", async () => {
        await agEURUnderlying.approve(vagEUR.address, 1000000);
        await vagEUR.repayBorrow(1000000);
        expect(await vagEUR.borrowBalanceStored(user.address)).to.be.lessThan(parseUnits("0.01", 18));
        expect(await agEURUnderlying.balanceOf(user.address)).to.equal(0);
      });

      it("should be possible to redeem a part of total", async () => {
        await vagEUR.redeemUnderlying(parseUnits("30", 18));
        expect(await agEURUnderlying.balanceOf(user.address)).to.equal(parseUnits("30", 18));
        expect(await vagEUR.balanceOf(user.address)).to.equal(parseUnits("70", 8));
      });
    });
  });
});
