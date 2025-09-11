import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, setMaxStalePeriodInChainlinkOracle } from "src/utils";
import { forking, testVip } from "src/vip-framework";
import { checkRiskParameters } from "src/vip-framework/checks/checkRiskParameters";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkTwoKinksInterestRate } from "src/vip-framework/checks/interestRateModel";

import {
  PROTOCOL_SHARE_RESERVE,
  RATE_MODEL,
  WBNBMarketSpec,
  convertAmountToVTokens,
  vip545,
} from "../../vips/vip-545/bsctestnet";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import VTOKEN_ABI from "./abi/VToken.json";
import VTREASURY_ABI from "./abi/VTreasury.json";
import WBNB_ABI from "./abi/WBNB.json";

const { bsctestnet } = NETWORK_ADDRESSES;
const CHAINLINK_WBNB_FEED = "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526";

forking(64997181, async () => {
  let comptroller: Contract;
  let resilientOracle: Contract;
  let wbnb: Contract;
  let vWBNB: Contract;

  before(async () => {
    const provider = ethers.provider;
    comptroller = new ethers.Contract(WBNBMarketSpec.vToken.comptroller, COMPTROLLER_ABI, provider);
    wbnb = new ethers.Contract(WBNBMarketSpec.vToken.underlying.address, WBNB_ABI, provider);
    vWBNB = new ethers.Contract(WBNBMarketSpec.vToken.address, VTOKEN_ABI, provider);
    resilientOracle = new ethers.Contract(bsctestnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);
    await setMaxStalePeriodInChainlinkOracle(
      NETWORK_ADDRESSES.bsctestnet.CHAINLINK_ORACLE,
      WBNBMarketSpec.vToken.underlying.address,
      CHAINLINK_WBNB_FEED,
      NETWORK_ADDRESSES.bsctestnet.NORMAL_TIMELOCK,
      315360000,
    );
  });

  describe("Pre-VIP behavior", async () => {
    it("check WBNB market not listed", async () => {
      const market = await comptroller.markets(WBNBMarketSpec.vToken.underlying.address);
      expect(market.isListed).to.equal(false);
    });
  });

  testVip("VIP-545", await vip545(), {
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
          "WithdrawTreasuryBEP20",
        ],
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check new IRM", async () => {
      expect(await vWBNB.interestRateModel()).to.equal(RATE_MODEL);
    });

    checkTwoKinksInterestRate(RATE_MODEL, "vWBNB", {
      base: WBNBMarketSpec.interestRateModel.baseRatePerYear,
      base2: WBNBMarketSpec.interestRateModel.baseRatePerYear2,
      multiplier: WBNBMarketSpec.interestRateModel.multiplierPerYear,
      jump: WBNBMarketSpec.interestRateModel.jumpMultiplierPerYear,
      kink1: WBNBMarketSpec.interestRateModel.kink,
      kink2: WBNBMarketSpec.interestRateModel.kink2,
      multiplier2: WBNBMarketSpec.interestRateModel.multiplierPerYear2,
    });

    checkVToken(WBNBMarketSpec.vToken.address, {
      name: "Venus WBNB",
      symbol: "vWBNB",
      decimals: 8,
      underlying: WBNBMarketSpec.vToken.underlying.address,
      exchangeRate: WBNBMarketSpec.vToken.exchangeRate,
      comptroller: WBNBMarketSpec.vToken.comptroller,
    });

    checkRiskParameters(WBNBMarketSpec.vToken.address, WBNBMarketSpec.vToken, WBNBMarketSpec.riskParameters);

    it("check price WBNB", async () => {
      const expectedPrice = "900848177960000000000";
      expect(await resilientOracle.getPrice(WBNBMarketSpec.vToken.underlying.address)).to.equal(expectedPrice);
      expect(await resilientOracle.getUnderlyingPrice(WBNBMarketSpec.vToken.address)).to.equal(expectedPrice);
    });

    it("markets have correct owner", async () => {
      expect(await vWBNB.admin()).to.equal(bsctestnet.NORMAL_TIMELOCK);
    });

    it("markets have correct ACM", async () => {
      expect(await vWBNB.accessControlManager()).to.equal(bsctestnet.ACCESS_CONTROL_MANAGER);
    });

    it("markets should have correct protocol share reserve", async () => {
      expect(await vWBNB.protocolShareReserve()).to.equal(PROTOCOL_SHARE_RESERVE);
    });

    it("markets should have correct total supply", async () => {
      const vWBNBSupply = await vWBNB.totalSupply();

      expect(vWBNBSupply).to.equal(
        convertAmountToVTokens(WBNBMarketSpec.initialSupply.amount, WBNBMarketSpec.vToken.exchangeRate),
      );
    });

    it("markets should have balance of underlying", async () => {
      const wbnbBalance = await wbnb.balanceOf(vWBNB.address);

      expect(wbnbBalance).to.equal(WBNBMarketSpec.initialSupply.amount);
    });

    it("should burn vTokens (on testnet transfer to VTreasury) and transfer vTokens to receiver", async () => {
      const vWBNBReceiverBalance = await vWBNB.balanceOf(WBNBMarketSpec.initialSupply.vTokenReceiver);

      expect(vWBNBReceiverBalance).to.equal(
        convertAmountToVTokens(WBNBMarketSpec.initialSupply.amount, WBNBMarketSpec.vToken.exchangeRate),
      );
    });

    it("should not leave any vTokens in the timelock", async () => {
      const vWBNBTimelockBalance = await vWBNB.balanceOf(bsctestnet.NORMAL_TIMELOCK);

      expect(vWBNBTimelockBalance).to.equal(0);
    });
  });
});
