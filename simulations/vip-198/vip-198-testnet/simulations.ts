import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";
import {
  RewardsDistributorConfig,
  checkRewardsDistributor,
  checkRewardsDistributorPool,
} from "src/vip-framework/checks/rewardsDistributor";

import { vip198 } from "../../../vips/vip-198/vip-198-testnet";
import ORACLE_ABI from "./abi/binanceOracle.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import ERC20_ABI from "./abi/erc20.json";
import POOL_REGISTRY_ABI from "./abi/poolRegistry.json";
import VTOKEN_ABI from "./abi/vToken.json";

const USDD = "0x2E2466e22FcbE0732Be385ee2FBb9C59a1098382";
const vUSDD_DeFi = "0xa109DE0abaeefC521Ec29D89eA42E64F37A6882E";
const PLANET = "0x52b4E1A2ba407813F829B4b3943A1e57768669A9";
const USDT = "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c";
const POOL_REGISTRY = "0xC85491616Fa949E048F3aAc39fbf5b0703800667";
const VTOKEN_RECEIVER = "0x0554d6079eBc222AD12405E52b264Bdb5B65D1cf";
const VPLANET_DEFI = "0xe237aA131E7B004aC88CB808Fa56AF3dc4C408f1";
const REWARD_DISTRIBUTOR = "0x9372F0d88988B2cC0a2bf8700a5B3f04B0b81b8C";
const CHAINLINK_ORACLE = "0xCeA29f1266e880A1482c06eD656cD08C148BaA32";
const COMPTROLLER = "0x23a73971A6B9f6580c048B9CB188869B2A2aA2aD";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const PLANET_RATE_MODEL = "0xb7C5A751CCa00b11AF3CA4A35e9e992f0f9c9c9c";
const PSR = "0x25c7c7D6Bf710949fD7f03364E9BA19a1b3c10E3";

forking(34765100, async () => {
  let poolRegistry: Contract;
  let comptroller: Contract;
  let vPLANET_DeFi: Contract;
  let oracle: Contract;

  before(async () => {
    poolRegistry = await ethers.getContractAt(POOL_REGISTRY_ABI, POOL_REGISTRY);
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER);
    vPLANET_DeFi = await ethers.getContractAt(VTOKEN_ABI, VPLANET_DEFI);
    oracle = await ethers.getContractAt(ORACLE_ABI, CHAINLINK_ORACLE);
    const impersonatedTimelock = await initMainnetUser(NORMAL_TIMELOCK, ethers.utils.parseEther("2"));
    await oracle.connect(impersonatedTimelock).setDirectPrice(USDD, "10000000000");
  });

  describe("Contracts setup", async () => {
    await checkVToken(VPLANET_DEFI, {
      name: "Venus PLANET (DeFi)",
      symbol: "vPLANET_DeFi",
      decimals: 8,
      underlying: PLANET,
      exchangeRate: parseUnits("1", 28),
      comptroller: COMPTROLLER,
    });
  });

  testVip("VIP-198 Add PLANET Market to DeFi Pool", await vip198());

  describe("Post-VIP state", () => {
    describe("PoolRegistry state", () => {
      it("should register pool's vTokens in Comptroller", async () => {
        const vTokens = await comptroller.getAllMarkets();
        expect(vTokens).to.have.lengthOf(8);
        expect(vTokens).to.include(VPLANET_DEFI);
      });

      it("should register vPLANET_DeFi in PoolRegistry", async () => {
        const vToken = await poolRegistry.getVTokenForAsset(COMPTROLLER, PLANET);
        expect(vToken).to.equal(VPLANET_DEFI);
      });
    });

    describe("Ownership", () => {
      it("should transfer ownership of vPLANET_DeFi to Timelock", async () => {
        expect(await vPLANET_DeFi.owner()).to.equal(NORMAL_TIMELOCK);
      });
    });

    describe("Initial supply", () => {
      it(`should mint 17,498,300,000,000,000 vPLANET_DeFi to ${VTOKEN_RECEIVER}`, async () => {
        expect(await vPLANET_DeFi.balanceOf(VTOKEN_RECEIVER)).to.equal(parseUnits("174983000", 8));
      });
    });

    describe("Reserves Parameters", () => {
      it("should set vPLANET_DeFi Protocol Share Reserve address correctly", async () => {
        expect(await vPLANET_DeFi.protocolShareReserve()).equals(PSR);
      });

      it("should set vPLANET_DeFi reduce reserves block delta correctly", async () => {
        expect(await vPLANET_DeFi.reduceReservesBlockDelta()).equals(100);
      });
    });

    describe("Market, Risk Parameters and Rewards", () => {
      describe("Interest rate models", () => {
        checkInterestRate(PLANET_RATE_MODEL, "vPLANET_DeFi", {
          base: "0.02",
          multiplier: "0.2",
          jump: "3",
          kink: "0.45",
        });

        describe("RF, CF, LT, Protocol seize share", () => {
          it("should set vPLANET_DeFi reserve factor to 0.25", async () => {
            expect(await vPLANET_DeFi.reserveFactorMantissa()).to.equal(parseUnits("0.25", 18));
          });

          it("should set vPLANET_DeFi collateral factor to 20%", async () => {
            const market = await comptroller.markets(VPLANET_DEFI);
            expect(market.collateralFactorMantissa).to.equal(parseUnits("0.2", 18));
          });

          it("should set vPLANET_DeFi liquidation threshold to 30%", async () => {
            const market = await comptroller.markets(VPLANET_DEFI);
            expect(market.liquidationThresholdMantissa).to.equal(parseUnits("0.3", 18));
          });

          it("should set vPLANET_DeFi protocolSeizeShareMantissa to 5%", async () => {
            const protocolSeizeShare = await vPLANET_DeFi.protocolSeizeShareMantissa();
            expect(protocolSeizeShare).to.equal(parseUnits("0.05", 18));
          });
        });

        describe("Caps", () => {
          it("should set vPLANET_DeFi supply cap to 1,000,000,000", async () => {
            expect(await comptroller.supplyCaps(VPLANET_DEFI)).to.equal(parseUnits("1000000000", 18));
          });

          it("should set vPLANET_DeFi borrow cap to 500,000,000", async () => {
            expect(await comptroller.borrowCaps(VPLANET_DEFI)).to.equal(parseUnits("500000000", 18));
          });
        });

        describe("Reward Distributor", () => {
          const planetRewardsDistributorConfig: RewardsDistributorConfig = {
            pool: COMPTROLLER,
            address: REWARD_DISTRIBUTOR,
            token: USDT,
            vToken: VPLANET_DEFI,
            borrowSpeed: parseUnits("1500", 6).div(806400),
            supplySpeed: parseUnits("1500", 6).div(806400),
            totalRewardsToDistribute: parseUnits("3000", 6),
          };
          checkRewardsDistributor("RewardsDistributor_PLANET_DeFi", planetRewardsDistributorConfig);
          checkRewardsDistributorPool(COMPTROLLER, 3);
        });
      });
    });

    describe("Basic supply/borrow/repay/redeem scenario", () => {
      let planet: Contract;
      let usdd: Contract;
      let vUSDD: Contract;
      let user: SignerWithAddress;

      before(async () => {
        [user] = await ethers.getSigners();
        planet = await ethers.getContractAt(ERC20_ABI, PLANET);
        usdd = await ethers.getContractAt(ERC20_ABI, USDD);
        vUSDD = await ethers.getContractAt(VTOKEN_ABI, vUSDD_DeFi);
        await planet.faucet(parseUnits("100", 18));
      });

      it("should be possible to supply PLANET", async () => {
        await planet.approve(vPLANET_DeFi.address, parseUnits("100", 18));
        await vPLANET_DeFi.mint(parseUnits("100", 18));
        expect(await vPLANET_DeFi.balanceOf(user.address)).to.equal(parseUnits("100", 8));
      });

      it("should be possible to enable PLANET as collateral", async () => {
        await comptroller.connect(user).enterMarkets([VPLANET_DEFI]);
        expect(await comptroller.getAssetsIn(user.address)).to.deep.equal([VPLANET_DEFI]);
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

      it("should be possible to redeem a part of PLANET", async () => {
        await vPLANET_DeFi.redeemUnderlying(parseUnits("30", 18));
        expect(await planet.balanceOf(user.address)).to.equal(parseUnits("30", 18));
        expect(await vPLANET_DeFi.balanceOf(user.address)).to.equal(parseUnits("70", 8));
      });
    });
  });
});
