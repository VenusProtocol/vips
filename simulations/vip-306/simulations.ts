import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip306, {
  CORE_COMPTROLLER_ADDRESS,
  CORE_TUSD_ADDRESS,
  CORE_TUSD_BORROW_CAP,
  CORE_TUSD_SUPPLY_CAP,
  CORE_UNI_ADDRESS,
  CORE_UNI_SUPPLY_CAP,
  DEFI_ALPACA_ADDRESS,
  DEFI_ALPACA_BORROW_CAP,
  DEFI_ANKR_ADDRESS,
  DEFI_ANKR_BORROW_CAP,
  DEFI_ANKR_SUPPLY_CAP,
  DEFI_BSW_ADDRESS,
  DEFI_BSW_BORROW_CAP,
  DEFI_BSW_SUPPLY_CAP,
  DEFI_COMPTROLLER_ADDRESS,
  DEFI_PLANET_ADDRESS,
  DEFI_PLANET_BORROW_CAP,
  DEFI_PLANET_SUPPLY_CAP,
  DEFI_TWT_ADDRESS,
  DEFI_TWT_BORROW_CAP,
  DEFI_USDD_ADDRESS,
  DEFI_USDD_BORROW_CAP,
  DEFI_USDD_SUPPLY_CAP,
  DEFI_ankrBNB_ADDRESS,
  DEFI_ankrBNB_BORROW_CAP,
  DEFI_ankrBNB_SUPPLY_CAP,
  GAMEFI_COMPTROLLER_ADDRESS,
  GAMEFI_FLOKI_ADDRESS,
  GAMEFI_FLOKI_BORROW_CAP,
  GAMEFI_RACA_ADDRESS,
  GAMEFI_RACA_BORROW_CAP,
  GAMEFI_RACA_SUPPLY_CAP,
  GAMEFI_USDD_ADDRESS,
  GAMEFI_USDD_BORROW_CAP,
  GAMEFI_USDD_SUPPLY_CAP,
  GAMEFI_USDT_ADDRESS,
  GAMEFI_USDT_BORROW_CAP,
  GAMEFI_USDT_SUPPLY_CAP,
  STABLE_COMPTROLLER_ADDRESS,
  STABLE_USDD_ADDRESS,
  STABLE_USDD_BORROW_CAP,
  STABLE_USDD_SUPPLY_CAP,
  STABLE_USDT_ADDRESS,
  STABLE_USDT_BORROW_CAP,
  STABLE_USDT_SUPPLY_CAP,
  STABLE_lisUSD_ADDRESS,
  STABLE_lisUSD_BORROW_CAP,
  STABLE_lisUSD_SUPPLY_CAP,
  TRON_BTT_ADDRESS,
  TRON_BTT_BORROW_CAP,
  TRON_BTT_SUPPLY_CAP,
  TRON_COMPTROLLER_ADDRESS,
  TRON_TRX_ADDRESS,
  TRON_TRX_BORROW_CAP,
  TRON_TRX_SUPPLY_CAP,
  TRON_USDD_ADDRESS,
  TRON_USDD_BORROW_CAP,
  TRON_USDD_SUPPLY_CAP,
  TRON_USDT_ADDRESS,
  TRON_USDT_BORROW_CAP,
  TRON_USDT_SUPPLY_CAP,
  TRON_WIN_ADDRESS,
  TRON_WIN_BORROW_CAP,
  TRON_WIN_SUPPLY_CAP,
} from "../../vips/vip-306/bscmainnet";
import CORE_COMPTROLLER_ABI from "./abi/Comptroller.json";
import IL_COMPTROLLER_ABI from "./abi/ILComptroller.json";

forking(38778780, async () => {
  const provider = ethers.provider;
  let coreComptroller: Contract;
  let gameFiComptroller: Contract;
  let deFiComptroller: Contract;
  let tronComptroller: Contract;
  let stableComptroller: Contract;

  before(async () => {
    coreComptroller = new ethers.Contract(CORE_COMPTROLLER_ADDRESS, CORE_COMPTROLLER_ABI, provider);
    gameFiComptroller = new ethers.Contract(GAMEFI_COMPTROLLER_ADDRESS, IL_COMPTROLLER_ABI, provider);
    deFiComptroller = new ethers.Contract(DEFI_COMPTROLLER_ADDRESS, IL_COMPTROLLER_ABI, provider);
    tronComptroller = new ethers.Contract(TRON_COMPTROLLER_ADDRESS, IL_COMPTROLLER_ABI, provider);
    stableComptroller = new ethers.Contract(STABLE_COMPTROLLER_ADDRESS, IL_COMPTROLLER_ABI, provider);
  });

  describe("Pre-VIP behavior", async () => {
    it("has correct supply caps", async () => {
      const uniSupplyCap = await coreComptroller.supplyCaps(CORE_UNI_ADDRESS);
      expect(uniSupplyCap).to.equal(parseUnits("500000", 18));

      const tusdSupplyCap = await coreComptroller.supplyCaps(CORE_TUSD_ADDRESS);
      expect(tusdSupplyCap).to.equal(parseUnits("1500000", 18));

      const usddSupplyCap = await stableComptroller.supplyCaps(STABLE_USDD_ADDRESS);
      expect(usddSupplyCap).to.equal(parseUnits("240000", 18));

      const lisUsdSupplyCap = await stableComptroller.supplyCaps(STABLE_lisUSD_ADDRESS);
      expect(lisUsdSupplyCap).to.equal(parseUnits("1000000", 18));

      const usdtSupplyCap = await stableComptroller.supplyCaps(STABLE_USDT_ADDRESS);
      expect(usdtSupplyCap).to.equal(parseUnits("960000", 18));

      const tronUsddSupplyCap = await tronComptroller.supplyCaps(TRON_USDD_ADDRESS);
      expect(tronUsddSupplyCap).to.equal(parseUnits("2700000", 18));

      const tronUsdtSupplyCap = await tronComptroller.supplyCaps(TRON_USDT_ADDRESS);
      expect(tronUsdtSupplyCap).to.equal(parseUnits("1380000", 18));

      const bttSupplyCap = await tronComptroller.supplyCaps(TRON_BTT_ADDRESS);
      expect(bttSupplyCap).to.equal(parseUnits("1130000000000", 18));

      const trxSupplyCap = await tronComptroller.supplyCaps(TRON_TRX_ADDRESS);
      expect(trxSupplyCap).to.equal(parseUnits("6300000", 6));

      const winSupplyCap = await tronComptroller.supplyCaps(TRON_WIN_ADDRESS);
      expect(winSupplyCap).to.equal(parseUnits("2300000000", 18));

      const gameFiusdtSupplyCap = await gameFiComptroller.supplyCaps(GAMEFI_USDT_ADDRESS);
      expect(gameFiusdtSupplyCap).to.equal(parseUnits("3000000", 18));

      const gameFiUsddSupplyCap = await gameFiComptroller.supplyCaps(GAMEFI_USDD_ADDRESS);
      expect(gameFiUsddSupplyCap).to.equal(parseUnits("450000", 18));

      const racaSupplyCap = await gameFiComptroller.supplyCaps(GAMEFI_RACA_ADDRESS);
      expect(racaSupplyCap).to.equal(parseUnits("4200000000", 18));

      const ankrBnbSupplyCap = await deFiComptroller.supplyCaps(DEFI_ankrBNB_ADDRESS);
      expect(ankrBnbSupplyCap).to.equal(parseUnits("10000", 18));

      const defiSupplyCap = await deFiComptroller.supplyCaps(DEFI_USDD_ADDRESS);
      expect(defiSupplyCap).to.equal(parseUnits("450000", 18));

      const bswSupplyCap = await deFiComptroller.supplyCaps(DEFI_BSW_ADDRESS);
      expect(bswSupplyCap).to.equal(parseUnits("11600000", 18));

      const planetSupplyCap = await deFiComptroller.supplyCaps(DEFI_PLANET_ADDRESS);
      expect(planetSupplyCap).to.equal(parseUnits("4000000000", 18));

      const ankrSupplyCap = await deFiComptroller.supplyCaps(DEFI_ANKR_ADDRESS);
      expect(ankrSupplyCap).to.equal(parseUnits("17700000", 18));
    });

    it("has correct borrow caps", async () => {
      const tusdBorrowCap = await coreComptroller.borrowCaps(CORE_TUSD_ADDRESS);
      expect(tusdBorrowCap).to.equal(parseUnits("1200000", 18));

      const usddBorrowCap = await stableComptroller.borrowCaps(STABLE_USDD_ADDRESS);
      expect(usddBorrowCap).to.equal(parseUnits("160000", 18));

      const lisUsdBorrowCap = await stableComptroller.borrowCaps(STABLE_lisUSD_ADDRESS);
      expect(lisUsdBorrowCap).to.equal(parseUnits("250000", 18));

      const usdtBorrowCap = await stableComptroller.borrowCaps(STABLE_USDT_ADDRESS);
      expect(usdtBorrowCap).to.equal(parseUnits("640000", 18));

      const tronUsddBorrowCap = await tronComptroller.borrowCaps(TRON_USDD_ADDRESS);
      expect(tronUsddBorrowCap).to.equal(parseUnits("1800000", 18));

      const tronUsdtBorrowCap = await tronComptroller.borrowCaps(TRON_USDT_ADDRESS);
      expect(tronUsdtBorrowCap).to.equal(parseUnits("920000", 18));

      const bttBorrowCap = await tronComptroller.borrowCaps(TRON_BTT_ADDRESS);
      expect(bttBorrowCap).to.equal(parseUnits("565000000000", 18));

      const trxBorrowCap = await tronComptroller.borrowCaps(TRON_TRX_ADDRESS);
      expect(trxBorrowCap).to.equal(parseUnits("3150000", 6));

      const winBorrowCap = await tronComptroller.borrowCaps(TRON_WIN_ADDRESS);
      expect(winBorrowCap).to.equal(parseUnits("1150000000", 18));

      const gamefiUsdtBorrowCap = await gameFiComptroller.borrowCaps(GAMEFI_USDT_ADDRESS);
      expect(gamefiUsdtBorrowCap).to.equal(parseUnits("2800000", 18));

      const gameFiUsddBorrowCap = await gameFiComptroller.borrowCaps(GAMEFI_USDD_ADDRESS);
      expect(gameFiUsddBorrowCap).to.equal(parseUnits("300000", 18));

      const racaBorrowCap = await gameFiComptroller.borrowCaps(GAMEFI_RACA_ADDRESS);
      expect(racaBorrowCap).to.equal(parseUnits("2100000000", 18));

      const flokiBorrowCap = await gameFiComptroller.borrowCaps(GAMEFI_FLOKI_ADDRESS);
      expect(flokiBorrowCap).to.equal(parseUnits("22000000000", 9));

      const ankrBnbBorrowCap = await deFiComptroller.borrowCaps(DEFI_ankrBNB_ADDRESS);
      expect(ankrBnbBorrowCap).to.equal(parseUnits("4000", 18));

      const deFiUsddBorrowCap = await deFiComptroller.borrowCaps(DEFI_USDD_ADDRESS);
      expect(deFiUsddBorrowCap).to.equal(parseUnits("300000", 18));

      const bswBorrowCap = await deFiComptroller.borrowCaps(DEFI_BSW_ADDRESS);
      expect(bswBorrowCap).to.equal(parseUnits("5800000", 18));

      const twtBorrowCap = await deFiComptroller.borrowCaps(DEFI_TWT_ADDRESS);
      expect(twtBorrowCap).to.equal(parseUnits("500000", 18));

      const alpacaBorrowCap = await deFiComptroller.borrowCaps(DEFI_ALPACA_ADDRESS);
      expect(alpacaBorrowCap).to.equal(parseUnits("750000", 18));

      const planetBorrowCap = await deFiComptroller.borrowCaps(DEFI_PLANET_ADDRESS);
      expect(planetBorrowCap).to.equal(parseUnits("1500000000", 18));

      const ankrBorrowCap = await deFiComptroller.borrowCaps(DEFI_ANKR_ADDRESS);
      expect(ankrBorrowCap).to.equal(parseUnits("8850000", 18));
    });
  });

  testVip("Update Caps", await vip306(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [CORE_COMPTROLLER_ABI], ["NewSupplyCap", "NewBorrowCap"], [18, 20]);
    },
  });

  describe("Post-VIP state", () => {
    it("has correct supply caps", async () => {
      const uniSupplyCap = await coreComptroller.supplyCaps(CORE_UNI_ADDRESS);
      expect(uniSupplyCap).to.equal(CORE_UNI_SUPPLY_CAP);

      const tusdSupplyCap = await coreComptroller.supplyCaps(CORE_TUSD_ADDRESS);
      expect(tusdSupplyCap).to.equal(CORE_TUSD_SUPPLY_CAP);

      const usddSupplyCap = await stableComptroller.supplyCaps(STABLE_USDD_ADDRESS);
      expect(usddSupplyCap).to.equal(STABLE_USDD_SUPPLY_CAP);

      const lisUsdSupplyCap = await stableComptroller.supplyCaps(STABLE_lisUSD_ADDRESS);
      expect(lisUsdSupplyCap).to.equal(STABLE_lisUSD_SUPPLY_CAP);

      const usdtSupplyCap = await stableComptroller.supplyCaps(STABLE_USDT_ADDRESS);
      expect(usdtSupplyCap).to.equal(STABLE_USDT_SUPPLY_CAP);

      const tronUsddSupplyCap = await tronComptroller.supplyCaps(TRON_USDD_ADDRESS);
      expect(tronUsddSupplyCap).to.equal(TRON_USDD_SUPPLY_CAP);

      const tronUsdtSupplyCap = await tronComptroller.supplyCaps(TRON_USDT_ADDRESS);
      expect(tronUsdtSupplyCap).to.equal(TRON_USDT_SUPPLY_CAP);

      const bttSupplyCap = await tronComptroller.supplyCaps(TRON_BTT_ADDRESS);
      expect(bttSupplyCap).to.equal(TRON_BTT_SUPPLY_CAP);

      const trxSupplyCap = await tronComptroller.supplyCaps(TRON_TRX_ADDRESS);
      expect(trxSupplyCap).to.equal(TRON_TRX_SUPPLY_CAP);

      const winSupplyCap = await tronComptroller.supplyCaps(TRON_WIN_ADDRESS);
      expect(winSupplyCap).to.equal(TRON_WIN_SUPPLY_CAP);

      const gaemFiusdtSupplyCap = await gameFiComptroller.supplyCaps(GAMEFI_USDT_ADDRESS);
      expect(gaemFiusdtSupplyCap).to.equal(GAMEFI_USDT_SUPPLY_CAP);

      const gameFiUsddSupplyCap = await gameFiComptroller.supplyCaps(GAMEFI_USDD_ADDRESS);
      expect(gameFiUsddSupplyCap).to.equal(GAMEFI_USDD_SUPPLY_CAP);

      const racaSupplyCap = await gameFiComptroller.supplyCaps(GAMEFI_RACA_ADDRESS);
      expect(racaSupplyCap).to.equal(GAMEFI_RACA_SUPPLY_CAP);

      const ankrBnbSupplyCap = await deFiComptroller.supplyCaps(DEFI_ankrBNB_ADDRESS);
      expect(ankrBnbSupplyCap).to.equal(DEFI_ankrBNB_SUPPLY_CAP);

      const defiSupplyCap = await deFiComptroller.supplyCaps(DEFI_USDD_ADDRESS);
      expect(defiSupplyCap).to.equal(DEFI_USDD_SUPPLY_CAP);

      const bswSupplyCap = await deFiComptroller.supplyCaps(DEFI_BSW_ADDRESS);
      expect(bswSupplyCap).to.equal(DEFI_BSW_SUPPLY_CAP);

      const planetSupplyCap = await deFiComptroller.supplyCaps(DEFI_PLANET_ADDRESS);
      expect(planetSupplyCap).to.equal(DEFI_PLANET_SUPPLY_CAP);

      const ankrSupplyCap = await deFiComptroller.supplyCaps(DEFI_ANKR_ADDRESS);
      expect(ankrSupplyCap).to.equal(DEFI_ANKR_SUPPLY_CAP);
    });

    it("has correct borrow caps", async () => {
      const tusdBorrowCap = await coreComptroller.borrowCaps(CORE_TUSD_ADDRESS);
      expect(tusdBorrowCap).to.equal(CORE_TUSD_BORROW_CAP);

      const usddBorrowCap = await stableComptroller.borrowCaps(STABLE_USDD_ADDRESS);
      expect(usddBorrowCap).to.equal(STABLE_USDD_BORROW_CAP);

      const lisUsdBorrowCap = await stableComptroller.borrowCaps(STABLE_lisUSD_ADDRESS);
      expect(lisUsdBorrowCap).to.equal(STABLE_lisUSD_BORROW_CAP);

      const usdtBorrowCap = await stableComptroller.borrowCaps(STABLE_USDT_ADDRESS);
      expect(usdtBorrowCap).to.equal(STABLE_USDT_BORROW_CAP);

      const tronUsddBorrowCap = await tronComptroller.borrowCaps(TRON_USDD_ADDRESS);
      expect(tronUsddBorrowCap).to.equal(TRON_USDD_BORROW_CAP);

      const tronUsdtBorrowCap = await tronComptroller.borrowCaps(TRON_USDT_ADDRESS);
      expect(tronUsdtBorrowCap).to.equal(TRON_USDT_BORROW_CAP);

      const bttBorrowCap = await tronComptroller.borrowCaps(TRON_BTT_ADDRESS);
      expect(bttBorrowCap).to.equal(TRON_BTT_BORROW_CAP);

      const trxBorrowCap = await tronComptroller.borrowCaps(TRON_TRX_ADDRESS);
      expect(trxBorrowCap).to.equal(TRON_TRX_BORROW_CAP);

      const winBorrowCap = await tronComptroller.borrowCaps(TRON_WIN_ADDRESS);
      expect(winBorrowCap).to.equal(TRON_WIN_BORROW_CAP);

      const gamefiUsdtBorrowCap = await gameFiComptroller.borrowCaps(GAMEFI_USDT_ADDRESS);
      expect(gamefiUsdtBorrowCap).to.equal(GAMEFI_USDT_BORROW_CAP);

      const gameFiUsddBorrowCap = await gameFiComptroller.borrowCaps(GAMEFI_USDD_ADDRESS);
      expect(gameFiUsddBorrowCap).to.equal(GAMEFI_USDD_BORROW_CAP);

      const racaBorrowCap = await gameFiComptroller.borrowCaps(GAMEFI_RACA_ADDRESS);
      expect(racaBorrowCap).to.equal(GAMEFI_RACA_BORROW_CAP);

      const flokiBorrowCap = await gameFiComptroller.borrowCaps(GAMEFI_FLOKI_ADDRESS);
      expect(flokiBorrowCap).to.equal(GAMEFI_FLOKI_BORROW_CAP);

      const ankrBnbBorrowCap = await deFiComptroller.borrowCaps(DEFI_ankrBNB_ADDRESS);
      expect(ankrBnbBorrowCap).to.equal(DEFI_ankrBNB_BORROW_CAP);

      const deFiUsddBorrowCap = await deFiComptroller.borrowCaps(DEFI_USDD_ADDRESS);
      expect(deFiUsddBorrowCap).to.equal(DEFI_USDD_BORROW_CAP);

      const bswBorrowCap = await deFiComptroller.borrowCaps(DEFI_BSW_ADDRESS);
      expect(bswBorrowCap).to.equal(DEFI_BSW_BORROW_CAP);

      const twtBorrowCap = await deFiComptroller.borrowCaps(DEFI_TWT_ADDRESS);
      expect(twtBorrowCap).to.equal(DEFI_TWT_BORROW_CAP);

      const alpacaBorrowCap = await deFiComptroller.borrowCaps(DEFI_ALPACA_ADDRESS);
      expect(alpacaBorrowCap).to.equal(DEFI_ALPACA_BORROW_CAP);

      const planetBorrowCap = await deFiComptroller.borrowCaps(DEFI_PLANET_ADDRESS);
      expect(planetBorrowCap).to.equal(DEFI_PLANET_BORROW_CAP);

      const ankrBorrowCap = await deFiComptroller.borrowCaps(DEFI_ANKR_ADDRESS);
      expect(ankrBorrowCap).to.equal(DEFI_ANKR_BORROW_CAP);
    });
  });
});
