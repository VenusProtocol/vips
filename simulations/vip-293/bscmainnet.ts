import { expect } from "chai";
import { BigNumberish, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents, setMaxStalePeriodInChainlinkOracle } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip293, {
  ANKRBNB_BORROW,
  ANKRBNB_SUPPLY,
  Actions,
  BNBX_BORROW,
  BNBX_SUPPLY,
  BNBx,
  LST_COMPTROLLER,
  RESILIENT_ORACLE,
  SLISBNB_BORROW,
  SLISBNB_SUPPLY,
  STKBNB_BORROW,
  STKBNB_SUPPLY,
  SlisBNB,
  StkBNB,
  WBETH,
  WBETHOracle,
  WBNB_BORROW,
  WBNB_SUPPLY,
  ankrBNB,
  vBNBx_LiquidStakedBNB,
  vWBNB_LiquidStakedBNB,
  vankrBNB_LiquidStakedBNB,
  vslisBNB_LiquidStakedBNB,
  vstkBNB_LiquidStakedBNB,
} from "../../vips/vip-293/bscmainnet";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";
import WBETH_ORACLE_ABI from "./abi/wbethOracle.json";

const NATIVE_TOKEN_ADDR = "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB";
const CHAINLINK_ORACLE = "0x1B2103441A0A108daD8848D8F5d790e4D402921F";
const BNB_FEED = "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const ETH_FEED = "0x9ef1B8c0E4F7dc8bF5719Ea496883DC6401d5b2e";
const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";

type TokenSymbol = "WBNB" | "slisBNB" | "BNBx" | "ankrBNB" | "stkBNB";

interface CapObject {
  vTokenAddress: string;
  oldSupplyCap: BigNumberish;
  oldBorrowCap: BigNumberish;
  newSupplyCap: BigNumberish;
  newBorrowCap: BigNumberish;
}

const caps: { [key in TokenSymbol]: CapObject } = {
  WBNB: {
    vTokenAddress: vWBNB_LiquidStakedBNB,
    oldSupplyCap: parseUnits("24000", 18),
    oldBorrowCap: parseUnits("16000", 18),
    newSupplyCap: WBNB_SUPPLY,
    newBorrowCap: WBNB_BORROW,
  },
  slisBNB: {
    vTokenAddress: vslisBNB_LiquidStakedBNB,
    oldSupplyCap: parseUnits("3000", 18),
    oldBorrowCap: parseUnits("800", 18),
    newSupplyCap: SLISBNB_SUPPLY,
    newBorrowCap: SLISBNB_BORROW,
  },
  BNBx: {
    vTokenAddress: vBNBx_LiquidStakedBNB,
    oldSupplyCap: parseUnits("9600", 18),
    oldBorrowCap: parseUnits("1920", 18),
    newSupplyCap: BNBX_SUPPLY,
    newBorrowCap: BNBX_BORROW,
  },
  ankrBNB: {
    vTokenAddress: vankrBNB_LiquidStakedBNB,
    oldSupplyCap: parseUnits("8000", 18),
    oldBorrowCap: parseUnits("1600", 18),
    newSupplyCap: ANKRBNB_SUPPLY,
    newBorrowCap: ANKRBNB_BORROW,
  },
  stkBNB: {
    vTokenAddress: vstkBNB_LiquidStakedBNB,
    oldSupplyCap: parseUnits("2900", 18),
    oldBorrowCap: parseUnits("580", 18),
    newSupplyCap: STKBNB_SUPPLY,
    newBorrowCap: STKBNB_BORROW,
  },
};

forking(38086764, async () => {
  let resilientOracle: Contract;
  let wbethOracleContract: Contract;
  let stakedBNBComptroller: Contract;

  before(async () => {
    resilientOracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);
    wbethOracleContract = new ethers.Contract(WBETHOracle, WBETH_ORACLE_ABI, ethers.provider);
    stakedBNBComptroller = new ethers.Contract(LST_COMPTROLLER, COMPTROLLER_ABI, ethers.provider);
  });

  describe("Pre-VIP behavior", async () => {
    it("check BNBx price", async () => {
      const price = await resilientOracle.getPrice(BNBx);
      expect(price).to.be.equal(parseUnits("647.08914856", "18"));
    });

    it("check SlisBNB price", async () => {
      const price = await resilientOracle.getPrice(SlisBNB);
      expect(price).to.be.equal(parseUnits("603.53342056", "18"));
    });

    it("check StkBNB price", async () => {
      const price = await resilientOracle.getPrice(StkBNB);
      expect(price).to.be.equal(parseUnits("620.42526659", "18"));
    });

    it("check WBETH price", async () => {
      const price = await wbethOracleContract.getPrice(WBETH);
      expect(price).to.be.equal(parseUnits("3303.129983074985825366", "18"));
    });

    it("check ankrBNB price", async () => {
      const price = await resilientOracle.getPrice(ankrBNB);
      expect(price).to.be.equal(parseUnits("640.92514063", "18"));
    });

    it("mint paused", async () => {
      expect(await stakedBNBComptroller.actionPaused(vslisBNB_LiquidStakedBNB, Actions.MINT)).to.equal(true);
      expect(await stakedBNBComptroller.actionPaused(vstkBNB_LiquidStakedBNB, Actions.MINT)).to.equal(true);
    });

    it("borrow paused", async () => {
      expect(await stakedBNBComptroller.actionPaused(vslisBNB_LiquidStakedBNB, Actions.BORROW)).to.equal(true);
      expect(await stakedBNBComptroller.actionPaused(vstkBNB_LiquidStakedBNB, Actions.BORROW)).to.equal(true);
    });

    it("enter market paused", async () => {
      expect(await stakedBNBComptroller.actionPaused(vslisBNB_LiquidStakedBNB, Actions.ENTER_MARKET)).to.equal(true);
      expect(await stakedBNBComptroller.actionPaused(vstkBNB_LiquidStakedBNB, Actions.ENTER_MARKET)).to.equal(true);
    });

    for (const [underlying, capObject] of Object.entries(caps) as [TokenSymbol, CapObject][]) {
      it(`Verify old ${underlying} supply caps`, async () => {
        const supplyCap = await stakedBNBComptroller.supplyCaps(capObject.vTokenAddress);
        expect(supplyCap).equals(capObject.oldSupplyCap);
      });

      it(`Verify old ${underlying} borrow caps`, async () => {
        const borrowCap = await stakedBNBComptroller.borrowCaps(capObject.vTokenAddress);
        expect(borrowCap).equals(capObject.oldBorrowCap);
      });
    }
  });

  testVip("VIP-293", await vip293(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [RESILIENT_ORACLE_ABI], ["TokenConfigAdded"], [4]);
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["ActionPausedMarket"], [6]);
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewSupplyCap"], [5]);
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewBorrowCap"], [5]);
    },
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await setMaxStalePeriodInChainlinkOracle(CHAINLINK_ORACLE, NATIVE_TOKEN_ADDR, BNB_FEED, NORMAL_TIMELOCK);

      await setMaxStalePeriodInChainlinkOracle(CHAINLINK_ORACLE, ETH, ETH_FEED, NORMAL_TIMELOCK);
    });
    it("check BNBx price", async () => {
      const price = parseUnits("645.808867516154432921", "18");
      expect(await resilientOracle.getPrice(BNBx)).to.be.equal(price);
      expect(await resilientOracle.getUnderlyingPrice(vBNBx_LiquidStakedBNB)).to.be.equal(price);
    });

    it("check SlisBNB price", async () => {
      const price = parseUnits("605.790759108013727641", "18");
      expect(await resilientOracle.getPrice(SlisBNB)).to.be.equal(price);
      expect(await resilientOracle.getUnderlyingPrice(vslisBNB_LiquidStakedBNB)).to.be.equal(price);
    });

    it("check StkBNB price", async () => {
      const price = parseUnits("623.983379139425787596", "18");
      expect(await resilientOracle.getPrice(StkBNB)).to.be.equal(price);
      expect(await resilientOracle.getUnderlyingPrice(vstkBNB_LiquidStakedBNB)).to.be.equal(price);
    });

    it("check WBETH price", async () => {
      const price = await wbethOracleContract.getPrice(WBETH);
      expect(price).to.be.equal(parseUnits("3303.129983074985825366", "18"));
    });

    it("check ankrBNB price", async () => {
      const price = parseUnits("643.268150660710340204", "18");
      expect(await resilientOracle.getPrice(ankrBNB)).to.be.equal(price);
      expect(await resilientOracle.getUnderlyingPrice(vankrBNB_LiquidStakedBNB)).to.be.equal(price);
    });

    it("mint unpaused", async () => {
      expect(await stakedBNBComptroller.actionPaused(vslisBNB_LiquidStakedBNB, Actions.MINT)).to.equal(false);
      expect(await stakedBNBComptroller.actionPaused(vstkBNB_LiquidStakedBNB, Actions.MINT)).to.equal(false);
    });

    it("borrow unpaused", async () => {
      expect(await stakedBNBComptroller.actionPaused(vslisBNB_LiquidStakedBNB, Actions.BORROW)).to.equal(false);
      expect(await stakedBNBComptroller.actionPaused(vstkBNB_LiquidStakedBNB, Actions.BORROW)).to.equal(false);
    });

    it("enter market unpaused", async () => {
      expect(await stakedBNBComptroller.actionPaused(vslisBNB_LiquidStakedBNB, Actions.ENTER_MARKET)).to.equal(false);
      expect(await stakedBNBComptroller.actionPaused(vstkBNB_LiquidStakedBNB, Actions.ENTER_MARKET)).to.equal(false);
    });

    for (const [underlying, capObject] of Object.entries(caps) as [TokenSymbol, CapObject][]) {
      it(`Verify new ${underlying} supply caps`, async () => {
        const supplyCap = await stakedBNBComptroller.supplyCaps(capObject.vTokenAddress);
        expect(supplyCap).equals(capObject.newSupplyCap);
      });

      it(`Verify new ${underlying} borrow caps`, async () => {
        const borrowCap = await stakedBNBComptroller.borrowCaps(capObject.vTokenAddress);
        expect(borrowCap).equals(capObject.newBorrowCap);
      });
    }
  });
});
