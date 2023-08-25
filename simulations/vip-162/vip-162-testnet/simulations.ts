import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumberish } from "ethers";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents, initMainnetUser } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { vip162Testnet } from "../../../vips/vip-162/vip-162-testnet";
import BINANCE_ORACLE_ABI from "./abi/binanceOracle.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import ERC20_ABI from "./abi/erc20.json";
import POOL_REGISTRY_ABI from "./abi/poolRegistry.json";
import RATE_MODEL_ABI from "./abi/rateModel.json";
import VTOKEN_ABI from "./abi/vToken.json";

const TWT = "0xb99C6B26Fdf3678c6e2aff8466E3625a0e7182f8";
const POOL_REGISTRY = "0xC85491616Fa949E048F3aAc39fbf5b0703800667";
const VTOKEN_RECEIVER_TWT = "0x8b293600C50D6fbdc6Ed4251cc75ECe29880276f";
const VTWT_DeFi = "0x4C94e67d239aD585275Fdd3246Ab82c8a2668564";
const DEFI_COMPTROLLER = "0x23a73971A6B9f6580c048B9CB188869B2A2aA2aD";
const BINANCE_ORACLE = "0xCeA29f1266e880A1482c06eD656cD08C148BaA32";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const USDD = "0x2E2466e22FcbE0732Be385ee2FBb9C59a1098382";
const vUSDD_DeFi = "0xa109DE0abaeefC521Ec29D89eA42E64F37A6882E";

forking(32725445, () => {
  let poolRegistry: Contract;
  let comptroller: Contract;
  let vTWT: Contract;
  let binanceOracle: Contract;

  before(async () => {
    poolRegistry = await ethers.getContractAt(POOL_REGISTRY_ABI, POOL_REGISTRY);
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, DEFI_COMPTROLLER);
    vTWT = await ethers.getContractAt(VTOKEN_ABI, VTWT_DeFi);
    binanceOracle = await ethers.getContractAt(BINANCE_ORACLE_ABI, BINANCE_ORACLE);
    const signer = await initMainnetUser(NORMAL_TIMELOCK, ethers.utils.parseEther("2"));
    await binanceOracle.connect(signer).setDirectPrice(USDD, "10000000000");
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

    checkVToken(VTWT_DeFi, {
      name: "Venus TWT (DeFi)",
      symbol: "vTWT_DeFi",
      decimals: 8,
      underlying: TWT,
      exchangeRate: parseUnits("1", 28),
    });
  });

  testVip("VIP-162Testnet Add TWT Market", vip162Testnet(), {
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
        expect(vTokens).to.have.lengthOf(7);
        expect(vTokens).to.include(VTWT_DeFi);
      });

      it("should register in PoolRegistry", async () => {
        const vToken = await poolRegistry.getVTokenForAsset(DEFI_COMPTROLLER, TWT);
        expect(vToken).to.equal(VTWT_DeFi);
      });
    });

    describe("Ownership", () => {
      it("should transfer ownership to Timelock", async () => {
        expect(await vTWT.owner()).to.equal(NORMAL_TIMELOCK);
      });
    });

    describe("Initial supply", () => {
      it(`should mint 1000000000000 vTWT to ${VTOKEN_RECEIVER_TWT}`, async () => {
        expect(await vTWT.balanceOf(VTOKEN_RECEIVER_TWT)).to.equal(parseUnits("10000", 8));
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
        checkInterestRate(VTWT_DeFi, "vTWT_DeFi", {
          base: "0.02",
          multiplier: "0.2",
          jump: "3",
          kink: "0.5",
        });

        describe("RF, CF, LT, Protocol seize share", () => {
          it("should set vTWT_DeFi reserve factor to 0.25", async () => {
            expect(await vTWT.reserveFactorMantissa()).to.equal(parseUnits("0.25", 18));
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
            const protocolSeizeShare = await vTWT.protocolSeizeShareMantissa();
            expect(protocolSeizeShare).to.equal(parseUnits("0.05", 18));
          });
        });

        describe("Caps", () => {
          it("should set vTWT_DeFi supply cap to 1,000,000", async () => {
            expect(await comptroller.supplyCaps(VTWT_DeFi)).to.equal(parseUnits("1000000", 18));
          });

          it("should set vTWT_DeFi borrow cap to 500,000", async () => {
            expect(await comptroller.borrowCaps(VTWT_DeFi)).to.equal(parseUnits("500000", 18));
          });
        });
      });
    });

    describe("Basic supply/borrow/repay/redeem scenario", () => {
      let twt: Contract;
      let usdd: Contract;
      let vUSDD: Contract;
      let user: SignerWithAddress;

      before(async () => {
        [user] = await ethers.getSigners();
        twt = await ethers.getContractAt(ERC20_ABI, TWT);
        usdd = await ethers.getContractAt(ERC20_ABI, USDD);
        vUSDD = await ethers.getContractAt(VTOKEN_ABI, vUSDD_DeFi);
        await twt.faucet(parseUnits("100", 18));
      });

      it("should be possible to supply", async () => {
        await twt.approve(vTWT.address, parseUnits("100", 18));
        await vTWT.mint(parseUnits("100", 18));
        expect(await vTWT.balanceOf(user.address)).to.equal(parseUnits("100", 8));
      });

      it("should be possible to enable the as collateral", async () => {
        await comptroller.connect(user).enterMarkets([VTWT_DeFi]);
        expect(await comptroller.getAssetsIn(user.address)).to.deep.equal([VTWT_DeFi]);
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
        await vTWT.redeemUnderlying(parseUnits("30", 18));
        expect(await twt.balanceOf(user.address)).to.equal(parseUnits("30", 18));
        expect(await vTWT.balanceOf(user.address)).to.equal(parseUnits("70", 8));
      });
    });
  });
});
