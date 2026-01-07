import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser, setMaxStalePeriod, setMaxStalePeriodInChainlinkOracle } from "src/utils";
import { forking, testVip } from "src/vip-framework";
import { checkRiskParameters } from "src/vip-framework/checks/checkRiskParameters";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkTwoKinksInterestRate } from "src/vip-framework/checks/interestRateModel";

import {
  PROTOCOL_SHARE_RESERVE,
  RATE_MODEL,
  REDUCE_RESERVES_BLOCK_DELTA,
  U,
  UMarketSpec,
  USDT_CHAINLINK_ORACLE,
  convertAmountToVTokens,
  vip795,
} from "../../vips/vip-795/bscmainnet";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import ERC20_ABI from "./abi/ERC20.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import VTOKEN_ABI from "./abi/VToken.json";
import VTREASURY_ABI from "./abi/VTreasury.json";
import CHAINLINK_ORACLE_ABI from "./abi/chainlinkOracle.json";

const provider = ethers.provider;
const { bscmainnet } = NETWORK_ADDRESSES;

forking(74286551, async () => {
  let comptroller: Contract;
  let resilientOracle: Contract;
  let u: Contract;
  let vU: Contract;
  let chainlinkOracle: Contract;
  let usdtChainlinkOracle: Contract;

  before(async () => {
    comptroller = new ethers.Contract(UMarketSpec.vToken.comptroller, COMPTROLLER_ABI, provider);
    u = new ethers.Contract(UMarketSpec.vToken.underlying.address, ERC20_ABI, provider);
    vU = new ethers.Contract(UMarketSpec.vToken.address, VTOKEN_ABI, provider);
    resilientOracle = new ethers.Contract(bscmainnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);
    chainlinkOracle = new ethers.Contract(bscmainnet.CHAINLINK_ORACLE, CHAINLINK_ORACLE_ABI, ethers.provider);
    usdtChainlinkOracle = new ethers.Contract(USDT_CHAINLINK_ORACLE, CHAINLINK_ORACLE_ABI, ethers.provider);
    const impersonatedTimelock = await initMainnetUser(bscmainnet.NORMAL_TIMELOCK, ethers.utils.parseEther("2"));

    await resilientOracle
      .connect(impersonatedTimelock)
      .setTokenConfig([
        U,
        [USDT_CHAINLINK_ORACLE, bscmainnet.CHAINLINK_ORACLE, ethers.constants.AddressZero],
        [true, true, false],
        false,
      ]);
    await usdtChainlinkOracle.connect(impersonatedTimelock).setDirectPrice(U, parseUnits("1", 18));
    await chainlinkOracle.connect(impersonatedTimelock).setDirectPrice(U, parseUnits("1", 18));
  });

  describe("Pre-VIP behavior", async () => {
    it("check u market not listed", async () => {
      const market = await comptroller.markets(UMarketSpec.vToken.underlying.address);
      expect(market.isListed).to.equal(false);
    });
  });

  testVip("VIP-795", await vip795(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI, VTOKEN_ABI, VTREASURY_ABI],
        [
          "MarketListed",
          "NewSupplyCap",
          "NewBorrowCap",
          "NewAccessControlManager",
          "NewProtocolShareReserve",
          "NewReduceReservesBlockDelta",
          "NewReserveFactor",
          "NewCollateralFactor",
        ],
        [1, 1, 1, 1, 1, 1, 1, 1],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await setMaxStalePeriodInChainlinkOracle(
        USDT_CHAINLINK_ORACLE,
        U,
        ethers.constants.AddressZero,
        bscmainnet.NORMAL_TIMELOCK,
        315360000,
      );

      await setMaxStalePeriodInChainlinkOracle(
        bscmainnet.CHAINLINK_ORACLE,
        U,
        ethers.constants.AddressZero,
        bscmainnet.NORMAL_TIMELOCK,
        315360000,
      );

      await setMaxStalePeriod(resilientOracle, u);
    });

    it("check new IRM", async () => {
      expect(await vU.interestRateModel()).to.equal(RATE_MODEL);
    });

    checkTwoKinksInterestRate(RATE_MODEL, "vU", {
      base: UMarketSpec.interestRateModel.baseRatePerYear,
      base2: UMarketSpec.interestRateModel.baseRatePerYear2,
      multiplier: UMarketSpec.interestRateModel.multiplierPerYear,
      jump: UMarketSpec.interestRateModel.jumpMultiplierPerYear,
      kink1: UMarketSpec.interestRateModel.kink,
      kink2: UMarketSpec.interestRateModel.kink2,
      multiplier2: UMarketSpec.interestRateModel.multiplierPerYear2,
    });

    checkVToken(UMarketSpec.vToken.address, {
      name: "Venus United Stables",
      symbol: "vU",
      decimals: 8,
      underlying: UMarketSpec.vToken.underlying.address,
      exchangeRate: UMarketSpec.vToken.exchangeRate,
      comptroller: UMarketSpec.vToken.comptroller,
    });

    checkRiskParameters(UMarketSpec.vToken.address, UMarketSpec.vToken, UMarketSpec.riskParameters);

    it("get correct price from oracle ", async () => {
      const price = await resilientOracle.getUnderlyingPrice(UMarketSpec.vToken.address);
      // Price should be within bound validator range (0.98 to 1.02)
      expect(price).to.be.gte(parseUnits("0.98", 18));
      expect(price).to.be.lte(parseUnits("1.02", 18));
    });

    it("market have correct owner", async () => {
      expect(await vU.admin()).to.equal(bscmainnet.NORMAL_TIMELOCK);
    });

    it("market have correct ACM", async () => {
      expect(await vU.accessControlManager()).to.equal(bscmainnet.ACCESS_CONTROL_MANAGER);
    });

    it("market should have correct protocol share reserve", async () => {
      expect(await vU.protocolShareReserve()).to.equal(PROTOCOL_SHARE_RESERVE);
    });

    it("market should have correct total supply", async () => {
      const vUSupply = await vU.totalSupply();
      expect(vUSupply).to.equal(
        convertAmountToVTokens(UMarketSpec.initialSupply.amount, UMarketSpec.vToken.exchangeRate),
      );
    });

    it("market should have correct reduce reserves block delta", async () => {
      const blockDelta = await vU.reduceReservesBlockDelta();
      expect(blockDelta).to.equal(REDUCE_RESERVES_BLOCK_DELTA);
    });

    it("market should have balance of underlying", async () => {
      const mockuBalance = await u.balanceOf(vU.address);
      expect(mockuBalance).to.equal(UMarketSpec.initialSupply.amount);
    });

    it("should burn vTokens", async () => {
      const vUBalanceBurned = await vU.balanceOf(ethers.constants.AddressZero);
      expect(vUBalanceBurned).to.equal(UMarketSpec.initialSupply.vTokensToBurn);
    });

    it("should not leave any vTokens in the timelock", async () => {
      const vUTimelockBalance = await vU.balanceOf(bscmainnet.NORMAL_TIMELOCK);
      expect(vUTimelockBalance).to.equal(0);
    });
  });
});
