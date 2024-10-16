import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import {
  ACCESS_CONTROL_MANAGER,
  AMOUNT_TO_REFUND,
  COMMUNITY_WALLET,
  COMPTROLLER,
  EXPECTED_CONVERSION_INCENTIVE,
  INITIAL_VTOKENS,
  PROTOCOL_SHARE_RESERVE,
  TWT,
  USDT,
  VTWT,
  converterBaseAssets,
  vip384,
} from "../../vips/vip-384/bsctestnet";
import ERC20_ABI from "./abi/ERC20.json";
import VBEP20_ABI from "./abi/VBep20_ABI.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import PRICE_ORACLE_ABI from "./abi/resilientOracle.json";
import SINGLE_TOKEN_CONVERTER_ABI from "./abi/singleTokenConverter.json";

const BORROW_CAP = parseUnits("1000000", 18);
const SUPPLY_CAP = parseUnits("3000000", 18);
const COLLATERAL_FACTOR = parseUnits("0.5", 18);
const RESERVES_BLOCK_DELTA = 100;
const RESERVE_FACTOR = parseUnits("0.25", 18);
const RATE_MODEL = "0xF1A8B40CA68d08EFfa31a16a83f4fd9b5c174872";

const { bsctestnet } = NETWORK_ADDRESSES;

forking(44785576, async () => {
  let comptroller: Contract;
  let vtwt: Contract;
  let oracle: Contract;
  let usdt: Contract;
  let communityBalanceBefore: any;
  const provider = ethers.provider;

  before(async () => {
    comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);
    vtwt = new ethers.Contract(VTWT, VBEP20_ABI, provider);
    oracle = new ethers.Contract(await comptroller.oracle(), PRICE_ORACLE_ABI, provider);
    usdt = new ethers.Contract(USDT, ERC20_ABI, provider);
    communityBalanceBefore = await usdt.balanceOf(COMMUNITY_WALLET);
  });
  describe("Pre-VIP behaviour", async () => {
    it("should have 25 markets in the core pool", async () => {
      const markets = await comptroller.getAllMarkets();
      expect(markets).to.have.lengthOf(25);
    });
  });

  testVip("VIP-384-testnet Add TWT Market", await vip384(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI, VBEP20_ABI],
        [
          "MarketListed",
          "NewSupplyCap",
          "NewBorrowCap",
          "NewReserveFactor",
          "NewProtocolShareReserve",
          "NewReduceReservesBlockDelta",
          "NewCollateralFactor",
          "Mint",
          "Failure",
        ],
        [1, 1, 1, 1, 1, 1, 1, 1, 0],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    it("should have 26 markets in the core pool", async () => {
      const markets = await comptroller.getAllMarkets();
      expect(markets).to.have.lengthOf(26);
    });
    it("has correct owner", async () => {
      expect(await vtwt.admin()).to.equal(bsctestnet.NORMAL_TIMELOCK);
    });

    it("has correct ACM", async () => {
      expect(await vtwt.accessControlManager()).to.equal(ACCESS_CONTROL_MANAGER);
    });
    it("adds a new TWT market and set collateral factor to 50%", async () => {
      const market = await comptroller.markets(VTWT);
      expect(market.isListed).to.equal(true);
      expect(market.collateralFactorMantissa).to.equal(COLLATERAL_FACTOR);
    });
    it("reserves factor equals 25%", async () => {
      const reserveFactor = await vtwt.reserveFactorMantissa();
      expect(reserveFactor).to.equal(RESERVE_FACTOR);
    });
    it("sets protocol share reserve", async () => {
      expect(await vtwt.protocolShareReserve()).to.equal(PROTOCOL_SHARE_RESERVE);
    });
    it("sets Reduce Reserves Block Delta to 100", async () => {
      expect(await vtwt.reduceReservesBlockDelta()).to.equal(RESERVES_BLOCK_DELTA);
    });
    it("sets the supply cap to 3,000,000 TWT", async () => {
      const newCap = await comptroller.supplyCaps(VTWT);
      expect(newCap).to.equal(SUPPLY_CAP);
    });
    it("sets the borrow cap to 1,000,000 TWT", async () => {
      const newCap = await comptroller.borrowCaps(VTWT);
      expect(newCap).to.equal(BORROW_CAP);
    });
    it("does not leave vTWT balance on the address of the timelock", async () => {
      const timelockBalance = await vtwt.balanceOf(bsctestnet.NORMAL_TIMELOCK);
      expect(timelockBalance).to.equal(0);
    });
    it("moves INITIAL_VTOKENS vTWT to VENUS_TREASURY", async () => {
      const vTokenReceiverBalance = await vtwt.balanceOf(bsctestnet.VTREASURY);
      expect(vTokenReceiverBalance).to.equal(INITIAL_VTOKENS);
    });
    it("get correct price from oracle ", async () => {
      const price = await oracle.getUnderlyingPrice(VTWT);
      expect(price).to.equal(parseUnits("0.8512", 18));
    });
    it("Community wallet balance should be increased by 5,000 USDT", async () => {
      expect(await usdt.balanceOf(COMMUNITY_WALLET)).to.equal(communityBalanceBefore.add(AMOUNT_TO_REFUND));
    });
    await checkInterestRate(RATE_MODEL, "TWT", { base: "0.02", kink: "0.5", multiplier: "0.2", jump: "3" });
    await checkVToken(VTWT, {
      name: "Venus TWT",
      symbol: "vTWT",
      decimals: 8,
      underlying: TWT,
      exchangeRate: parseUnits("1", 28),
      comptroller: COMPTROLLER,
    });
    describe("Converters", () => {
      for (const [converterAddress, baseAsset] of Object.entries(converterBaseAssets)) {
        const converterContract = new ethers.Contract(converterAddress, SINGLE_TOKEN_CONVERTER_ABI, ethers.provider);
        const asset = TWT;
        it(`should set ${EXPECTED_CONVERSION_INCENTIVE} as incentive in converter ${converterAddress}, for asset ${asset}`, async () => {
          const result = await converterContract.conversionConfigurations(baseAsset, asset);
          expect(result.incentive).to.equal(EXPECTED_CONVERSION_INCENTIVE);
        });
      }
    });
  });
});
