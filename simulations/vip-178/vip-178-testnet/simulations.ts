import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { checkVToken } from "../../../src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "../../../src/vip-framework/checks/interestRateModel";
import {
  RewardsDistributorConfig,
  checkRewardsDistributor,
  checkRewardsDistributorPool,
} from "../../../src/vip-framework/checks/rewardsDistributor";
import { vip178Testnet } from "../../../vips/vip-178/vip-178-testnet";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import ERC20_ABI from "./abi/erc20.json";
import POOL_REGISTRY_ABI from "./abi/poolRegistry.json";
import REWARD_DISTRIBUTOR_ABI from "./abi/rewardsDistributor.json";
import VTOKEN_ABI from "./abi/vToken.json";

const agEUR = "0x63061de4A25f24279AAab80400040684F92Ee319";
const POOL_REGISTRY = "0xC85491616Fa949E048F3aAc39fbf5b0703800667";
const vTOKEN_RECEIVER_agEUR = "0xc444949e0054a23c44fc45789738bdf64aed2391";
const VagEUR_Stablecoins = "0x4E1D35166776825402d50AfE4286c500027211D1";
const STABLECOIN_COMPTROLLER = "0x10b57706AD2345e590c2eA4DC02faef0d9f5b08B";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const REWARD_DISTRIBUTOR = "0x78d32FC46e5025c29e3BA03Fcf2840323351F26a";
const ANGLE = "0xD1Bc731d188ACc3f52a6226B328a89056B0Ec71a";
const PROTOCOL_SHARE_RESERVE = "0xc987a03ab6C2A5891Fc0919f021cc693B5E55278";
const SHORTFALL = "0x503574a82fE2A9f968d355C8AAc1Ba0481859369";

forking(33737831, () => {
  let poolRegistry: Contract;
  let comptroller: Contract;
  let vagEUR: Contract;

  before(async () => {
    poolRegistry = await ethers.getContractAt(POOL_REGISTRY_ABI, POOL_REGISTRY);
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, STABLECOIN_COMPTROLLER);
    vagEUR = await ethers.getContractAt(VTOKEN_ABI, VagEUR_Stablecoins);
  });

  describe("Contracts setup", () => {
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
        [COMPTROLLER_ABI, POOL_REGISTRY_ABI, ERC20_ABI, REWARD_DISTRIBUTOR_ABI],
        [
          "Approval",
          "MarketAdded",
          "NewRewardsDistributor",
          "RewardTokenSupplySpeedUpdated",
          "RewardTokenBorrowSpeedUpdated",
          "OwnershipTransferred",
        ],
        [6, 1, 1, 0, 1, 3],
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
      it(`should mint 9,000 vagEUR to ${vTOKEN_RECEIVER_agEUR}`, async () => {
        expect(await vagEUR.balanceOf(vTOKEN_RECEIVER_agEUR)).to.equal(parseUnits("9000", 8));
      });
    });

    describe("Market and risk parameters", () => {
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

    describe("Reward Distributor", () => {
      const agEURRewardsDistributorConfig: RewardsDistributorConfig = {
        pool: STABLECOIN_COMPTROLLER,
        address: REWARD_DISTRIBUTOR,
        token: ANGLE,
        vToken: VagEUR_Stablecoins,
        borrowSpeed: parseUnits("17650", 18).div(201600),
        supplySpeed: 0,
        totalRewardsToDistribute: parseUnits("17650", 18),
      };
      checkRewardsDistributor("RewardsDistributor_agEUR_Stablecoins", agEURRewardsDistributorConfig);
      checkRewardsDistributorPool(STABLECOIN_COMPTROLLER, 3);
    });
    describe("VToken", () => {
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

        it("should be possible to enable agEUR as collateral", async () => {
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

        describe("Risk Management", () => {
          it("should set correct address of protocol share reserve", async () => {
            expect(await vagEUR.protocolShareReserve()).equals(PROTOCOL_SHARE_RESERVE);
          });

          it("should set correct address of shortfall", async () => {
            expect(await vagEUR.shortfall()).equals(SHORTFALL);
          });
        });
      });
    });
  });
});
