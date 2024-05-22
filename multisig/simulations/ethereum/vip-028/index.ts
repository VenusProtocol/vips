import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { forking, pretendExecutingVip } from "../../../../src/vip-framework/index";
import vip028, {
  CORE_COMPTROLLER_ADDRESS,
  CRV_ADDRESS,
  CRV_BORROW_CAP,
  CRV_COMPTROLLER_ADDRESS,
  CRV_SUPPLY_CAP,
  DAI_ADDRESS,
  DAI_BORROW_CAP,
  DAI_SUPPLY_CAP,
  ETH_COMPTROLLER_ADDRESS,
  ETH_weETH_ADDRESS,
  ETH_weETH_BORROW_CAP,
  ETH_weETH_SUPPLY_CAP,
  ETH_wstETH_ADDRESS,
  ETH_wstETH_BORROW_CAP,
  FRAX_ADDRESS,
  FRAX_BORROW_CAP,
  FRAX_SUPPLY_CAP,
  crvUSD_ADDRESS,
  crvUSD_BORROW_CAP,
  crvUSD_SUPPLY_CAP,
} from "../../../proposals/ethereum/vip-028";
import COMPTROLLER_ABI from "./abi/comptroller.json";

forking(19884052, () => {
  let coreComptroller: Contract;
  let crvComptroller: Contract;
  let ethComptroller: Contract;

  before(async () => {
    coreComptroller = await ethers.getContractAt(COMPTROLLER_ABI, CORE_COMPTROLLER_ADDRESS);
    crvComptroller = await ethers.getContractAt(COMPTROLLER_ABI, CRV_COMPTROLLER_ADDRESS);
    ethComptroller = await ethers.getContractAt(COMPTROLLER_ABI, ETH_COMPTROLLER_ADDRESS);
  });

  describe("Pre-VIP behavior", () => {
    it("check supply cap", async () => {
      const daiSupplyCap = await coreComptroller.supplyCaps(DAI_ADDRESS);
      expect(daiSupplyCap).to.equal(parseUnits("50000000", 18));

      const fraxSupplyCap = await coreComptroller.supplyCaps(FRAX_ADDRESS);
      expect(fraxSupplyCap).to.equal(parseUnits("10000000", 18));

      const crvUSDSupplyCap = await coreComptroller.supplyCaps(crvUSD_ADDRESS);
      expect(crvUSDSupplyCap).to.equal(parseUnits("50000000", 18));

      const crvSupplyCap = await crvComptroller.supplyCaps(CRV_ADDRESS);
      expect(crvSupplyCap).to.equal(parseUnits("6000000", 18));

      const ethSupplyCap = await ethComptroller.supplyCaps(ETH_weETH_ADDRESS);
      expect(ethSupplyCap).to.equal(parseUnits("7500", 18));
    });

    it("check borrow cap", async () => {
      const daiBorrowCap = await coreComptroller.borrowCaps(DAI_ADDRESS);
      expect(daiBorrowCap).to.equal(parseUnits("45000000", 18));

      const fraxBorrowCap = await coreComptroller.borrowCaps(FRAX_ADDRESS);
      expect(fraxBorrowCap).to.equal(parseUnits("8000000", 18));

      const crvUSDBorrowCap = await coreComptroller.borrowCaps(crvUSD_ADDRESS);
      expect(crvUSDBorrowCap).to.equal(parseUnits("45000000", 18));

      const crvBorrowCap = await crvComptroller.borrowCaps(CRV_ADDRESS);
      expect(crvBorrowCap).to.equal(parseUnits("3000000", 18));

      const ethBorrowCap = await ethComptroller.borrowCaps(ETH_weETH_ADDRESS);
      expect(ethBorrowCap).to.equal(parseUnits("1500", 18));

      const wstETHBorrowCap = await ethComptroller.borrowCaps(ETH_wstETH_ADDRESS);
      expect(wstETHBorrowCap).to.equal(parseUnits("2000", 18));
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(vip028());
    });

    it("check supply cap", async () => {
      const daiSupplyCap = await coreComptroller.supplyCaps(DAI_ADDRESS);
      expect(daiSupplyCap).to.equal(DAI_SUPPLY_CAP);

      const fraxSupplyCap = await coreComptroller.supplyCaps(FRAX_ADDRESS);
      expect(fraxSupplyCap).to.equal(FRAX_SUPPLY_CAP);

      const crvUSDSupplyCap = await coreComptroller.supplyCaps(crvUSD_ADDRESS);
      expect(crvUSDSupplyCap).to.equal(crvUSD_SUPPLY_CAP);

      const crvSupplyCap = await crvComptroller.supplyCaps(CRV_ADDRESS);
      expect(crvSupplyCap).to.equal(CRV_SUPPLY_CAP);

      const ethSupplyCap = await ethComptroller.supplyCaps(ETH_weETH_ADDRESS);
      expect(ethSupplyCap).to.equal(ETH_weETH_SUPPLY_CAP);
    });

    it("check borrow cap", async () => {
      const daiBorrowCap = await coreComptroller.borrowCaps(DAI_ADDRESS);
      expect(daiBorrowCap).to.equal(DAI_BORROW_CAP);

      const fraxBorrowCap = await coreComptroller.borrowCaps(FRAX_ADDRESS);
      expect(fraxBorrowCap).to.equal(FRAX_BORROW_CAP);

      const crvUSDBorrowCap = await coreComptroller.borrowCaps(crvUSD_ADDRESS);
      expect(crvUSDBorrowCap).to.equal(crvUSD_BORROW_CAP);

      const crvBorrowCap = await crvComptroller.borrowCaps(CRV_ADDRESS);
      expect(crvBorrowCap).to.equal(CRV_BORROW_CAP);

      const ethBorrowCap = await ethComptroller.borrowCaps(ETH_weETH_ADDRESS);
      expect(ethBorrowCap).to.equal(ETH_weETH_BORROW_CAP);

      const wstETHBorrowCap = await ethComptroller.borrowCaps(ETH_wstETH_ADDRESS);
      expect(wstETHBorrowCap).to.equal(ETH_wstETH_BORROW_CAP);
    });
  });
});
