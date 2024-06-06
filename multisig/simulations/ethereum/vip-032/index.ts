import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import vip032, {
  LIQUID_STAKED_ETH_COMPTROLLER,
  vweETH,
  vweETH_BORROW_CAP,
  vweETH_SUPPLY_CAP,
  vwstETH,
  vwstETH_BORROW_CAP,
} from "../../../proposals/ethereum/vip-032";
import COMPTROLLER_ABI from "./abi/ILComprollerAbi.json";

forking(19962658, async () => {
  let comptroller: Contract;

  before(async () => {
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, LIQUID_STAKED_ETH_COMPTROLLER);
  });

  describe("Pre-VIP behavior", () => {
    it("old vweETH supply cap", async () => {
      const cap = await comptroller.supplyCaps(vweETH);
      expect(cap).to.equal(parseUnits("15000", 18));
    });

    it("old vweETH borrow cap", async () => {
      const cap = await comptroller.borrowCaps(vweETH);
      expect(cap).to.equal(parseUnits("7500", 18));
    });

    it("old vstETH supply cap", async () => {
      const cap = await comptroller.supplyCaps(vwstETH);
      expect(cap).to.equal(parseUnits("20000", 18));
    });

    it("old vstETH borrow cap", async () => {
      const cap = await comptroller.borrowCaps(vwstETH);
      expect(cap).to.equal(parseUnits("4000", 18));
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip032());
    });

    it("new vweETH supply cap", async () => {
      const cap = await comptroller.supplyCaps(vweETH);
      expect(cap).to.equal(vweETH_SUPPLY_CAP);
    });

    it("new vweETH borrow cap", async () => {
      const cap = await comptroller.borrowCaps(vweETH);
      expect(cap).to.equal(vweETH_BORROW_CAP);
    });

    it("new vstETH supply cap", async () => {
      const cap = await comptroller.supplyCaps(vwstETH);
      expect(cap).to.equal(parseUnits("20000", 18));
    });

    it("new vstETH borrow cap", async () => {
      const cap = await comptroller.borrowCaps(vwstETH);
      expect(cap).to.equal(vwstETH_BORROW_CAP);
    });
  });
});
