import { expect } from "chai";
import { BigNumber, Contract, Signer } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents, initMainnetUser } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { VAIControllerVIP } from "../../../vips/vip-vai-controller/vip-testnet/bsctestnet";
import {
  BASE_RATE,
  COMPTROLLER,
  COMPTROLLER_BEACON,
  COMPTROLLER_NEW_IMPLEMENTATION,
  FLOAT_RATE,
  INITIAL_VAI_MINT_RATE,
  NORMAL_TIMELOCK,
  PRIME_TOKEN,
  TREASURY,
  TREASURY_GUARDIAN,
  TREASURY_PERCENT,
  VAI,
  VAI_CONTROLLER,
  VAI_MINT_CAP,
} from "../../../vips/vip-vai-controller/vip-testnet/bsctestnet";
import COMPTROLLER_BEACON_ABI from "../abi/BeaconProxy.json";
import COMPTROLLER_ABI from "../abi/Comptroller.json";
import ERC20_ABI from "../abi/ERC20.json";
import VAI_CONTROLLER_ABI from "../abi/VAIController.json";
import VAI_TOKEN_ABI from "../abi/VAIToken.json";
import VTOKEN_ABI from "../abi/VToken.json";

const USDT = "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c";
const VUSDT = "0x3338988d0beb4419Acb8fE624218754053362D06";

const COMPTROLLER_OLD_IMPLEMENTATION = "0x329Bc34E6A46243d21955A4369cD66bdD52E6C22";

const USER_1 = "0x0f11fb73A8791950cBADD00e13B6d6B73d36c844";
const USER_2 = "0x5fFbE5302BadED40941A403228E6AD03f93752d9";

forking(35259895, () => {
  let user1: Signer;
  let user2: Signer;
  let vai: Contract;
  let usdt: Contract;
  let vusdt: Contract;
  let comptrollerBeacon: Contract;
  let comptroller: Contract;
  let vaiController: Contract;

  let accessControlManager: string;
  let closeFactorMantissa: BigNumber;
  let allMarkets: string[];
  let rewardsDistributors: string[];
  let marketListed: boolean;
  let liquidationIncentiveMantissa: BigNumber;
  let maxLoopsLimit: BigNumber;
  let minLiquidatableCollateral: BigNumber;
  let oracle: string;
  let owner: string;
  let poolRegistry: string;
  let prime: string;

  before(async () => {
    user1 = await initMainnetUser(USER_1, parseUnits("2"));
    user2 = await initMainnetUser(USER_2, parseUnits("2"));

    usdt = new ethers.Contract(USDT, ERC20_ABI, ethers.provider);
    vusdt = new ethers.Contract(VUSDT, VTOKEN_ABI, ethers.provider);
    comptrollerBeacon = new ethers.Contract(COMPTROLLER_BEACON, COMPTROLLER_BEACON_ABI, ethers.provider);
    comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, ethers.provider);
    vai = new ethers.Contract(VAI, VAI_TOKEN_ABI, ethers.provider);
    vaiController = new ethers.Contract(VAI_CONTROLLER, VAI_CONTROLLER_ABI, ethers.provider);

    accessControlManager = await comptroller.accessControlManager();
    closeFactorMantissa = await comptroller.closeFactorMantissa();
    allMarkets = await comptroller.getAllMarkets();
    rewardsDistributors = await comptroller.getRewardsDistributors();
    marketListed = await comptroller.isMarketListed(VUSDT);
    liquidationIncentiveMantissa = await comptroller.liquidationIncentiveMantissa();
    maxLoopsLimit = await comptroller.maxLoopsLimit();
    minLiquidatableCollateral = await comptroller.minLiquidatableCollateral();
    oracle = await comptroller.oracle();
    owner = await comptroller.owner();
    poolRegistry = await comptroller.poolRegistry();
    prime = await comptroller.prime();
  });

  describe("Pre-VIP behaviour", async () => {
    it("comptroller should have old implementations", async () => {
      expect(await comptrollerBeacon.implementation()).to.equal(COMPTROLLER_OLD_IMPLEMENTATION);
    });
  });

  testVip("VIP-243 Payments for auditors", VAIControllerVIP(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [], [""], [2]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("comptroller should have new implementations", async () => {
      expect(await comptrollerBeacon.implementation()).to.equal(COMPTROLLER_NEW_IMPLEMENTATION);
    });

    it("storage layout of comptroller should be consistent", async () => {
      expect(await comptroller.accessControlManager()).to.equal(accessControlManager);
      expect(await comptroller.closeFactorMantissa()).to.equal(closeFactorMantissa);
      expect(await comptroller.getAllMarkets()).to.equal(allMarkets);
      expect(await comptroller.getRewardsDistributors()).to.equal(rewardsDistributors);
      expect(await comptroller.isMarketListed(VUSDT)).to.equal(marketListed);
      expect(await comptroller.liquidationIncentiveMantissa()).to.equal(liquidationIncentiveMantissa);
      expect(await comptroller.maxLoopsLimit()).to.equal(maxLoopsLimit);
      expect(await comptroller.minLiquidatableCollateral()).to.equal(minLiquidatableCollateral);
      expect(await comptroller.oracle()).to.equal(oracle);
      expect(await comptroller.owner()).to.equal(owner);
      expect(await comptroller.poolRegistry()).to.equal(poolRegistry);
      expect(await comptroller.prime()).to.equal(prime);
    });

    it("should validate the comptroller VAI controller address", async () => {
      expect(await comptroller.VAIController()).to.equal(VAI_CONTROLLER);
    });

    it("owner of VAIController should be timelock", async () => {
      expect(await vaiController.owner()).to.equal(NORMAL_TIMELOCK);
    });

    it("VAIController should have correct prime address", async () => {
      expect(await vaiController.prime()).to.equal(PRIME_TOKEN);
    });

    it("VAIController should have correct comptroller address", async () => {
      expect(await vaiController.comptroller()).to.equal(COMPTROLLER);
    });

    it("VAIController should have correct VAI token address", async () => {
      expect(await vaiController.VAI()).to.equal(VAI);
    });

    it("VAIController should have correct VAIMintRate", async () => {
      expect(await vaiController.VAIMintRate()).to.equal(INITIAL_VAI_MINT_RATE);
    });

    it("VAIController should have correct mint cap", async () => {
      expect(await vaiController.mintCap()).to.equal(VAI_MINT_CAP);
    });

    it("VAIController should have correct receiver address", async () => {
      expect(await vaiController.receiver()).to.equal(TREASURY);
    });

    it("VAIController should have correct base rate", async () => {
      expect(await vaiController.baseRateMantissa()).to.equal(BASE_RATE);
    });

    it("VAIController should have correct float rate", async () => {
      expect(await vaiController.floatRateMantissa()).to.equal(FLOAT_RATE);
    });

    it("VAIController should have correct treasury data", async () => {
      expect(await vaiController.treasuryAddress()).to.equal(TREASURY);
      expect(await vaiController.treasuryGuardian()).to.equal(TREASURY_GUARDIAN);
      expect(await vaiController.treasuryPercent()).to.equal(TREASURY_PERCENT);
    });

    it("VAI token should rely on this new VAIController", async () => {
      expect(await vai.wards(VAI_CONTROLLER)).to.equal(1);
    });

    describe("generic vai controller tests", () => {
      describe("Mint VAI Tokens", async () => {
        before("User Enters a market", async () => {
          await comptroller.connect(user1).enterMarkets([vusdt.address]);
          await usdt.connect(user1).approve(vusdt.address, parseUnits("200", 18));
          await vusdt.connect(user1).mint(parseUnits("200", 18));
        });

        it("Checks for minting of VAI tokens", async () => {
          await vaiController.connect(user1).mintVAI(parseUnits("100", 18));
          expect(await vai.balanceOf(await user1.getAddress())).to.eq(parseUnits("100", 18));
          expect(await vaiController.mintedVAIs(await user1.getAddress())).to.eq(parseUnits("100", 18));
        });
      });

      describe("repayVAI", async () => {
        beforeEach("mintVAI", async () => {
          // User mints VAI
          await comptroller.connect(user1).enterMarkets([vusdt.address]);
          await usdt.connect(user1).approve(vusdt.address, parseUnits("100", 18));
          await vusdt.connect(user1).mint(parseUnits("100", 18));

          await vaiController.connect(user1).mintVAI(parseUnits("100", 18));
          expect(await vai.balanceOf(await user1.getAddress())).to.eq(parseUnits("100", 18));
          await vai.connect(user1).approve(vaiController.address, ethers.constants.MaxUint256);
        });

        it("Checks for successful repay", async () => {
          await vaiController.connect(user1).repayVAI(parseUnits("100", 18));
          expect(await vai.balanceOf(await user1.getAddress())).to.eq(0);
          expect(await vaiController.mintedVAIs(await user1.getAddress())).to.eq(0);
        });
      });

      describe("liquidateVAI", async () => {
        beforeEach("user1 borrow", async () => {
          // User mints VAI
          await comptroller.connect(user1).enterMarkets([vusdt.address]);
          await usdt.connect(user1).approve(vusdt.address, parseUnits("100", 18));
          await vusdt.connect(user1).mint(parseUnits("100", 18));

          await comptroller.connect(user2).enterMarkets([vusdt.address]);
          await usdt.connect(user2).approve(vusdt.address, parseUnits("200", 18));
          await vusdt.connect(user2).mint(parseUnits("200", 18));

          await vaiController.connect(user1).mintVAI(parseUnits("100", 18));
          await vaiController.connect(user2).mintVAI(parseUnits("200", 18));
        });

        it("Checks for successful liquidation of user1 VAI borrows", async () => {
          await vai.connect(user2).approve(vaiController.address, parseUnits("100", 18));

          const user2VaiBalancePrevious = await vai.balanceOf(await user2.getAddress());
          await vaiController
            .connect(user2)
            .liquidateVAI(await user1.getAddress(), parseUnits("100", 18), vusdt.address);
          const user2VaiBalanceCurrent = await vai.balanceOf(await user2.getAddress());

          expect(user2VaiBalanceCurrent).to.eq(user2VaiBalancePrevious.sub(parseUnits("100", 18)));
        });
      });
    });
  });
});
