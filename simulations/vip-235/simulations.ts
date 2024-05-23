import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents, setMaxStalePeriodInChainlinkOracle } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { vip235 } from "../../vips/vip-235";
import COMPTROLLER_ABI from "./abi/ComptrollerAbi.json";

const Comptroller = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const vBNB = "0xA07c5b74C9B40447a954e1466938b865b6BBea36";
const BNB = "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB";
const ChainlinkOracle = "0x1B2103441A0A108daD8848D8F5d790e4D402921F";
const vFDUSD = "0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba";
const OracleAdmin = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const NewCollateralFactor = parseUnits("0.78", 18);

forking(35091610, () => {
  let comptroller: Contract;
  before(async () => {
    comptroller = new ethers.Contract(Comptroller, COMPTROLLER_ABI, ethers.provider);
    await setMaxStalePeriodInChainlinkOracle(ChainlinkOracle, BNB, ethers.constants.AddressZero, OracleAdmin);
  });
  describe("Pre-VIP behaviour", async () => {
    it("collateral factor should be 75%", async () => {
      const market = await comptroller.markets(vBNB);
      expect(market.collateralFactorMantissa).to.equal(parseUnits("0.75", 18));
    });
    it("supply cap should be 5,500,000 FDUSD", async () => {
      const oldCap = await comptroller.supplyCaps(vFDUSD);
      expect(oldCap).to.equal(parseUnits("5500000", 18));
    });

    it("borrow cap should be 4,400,000 FDUSD", async () => {
      const oldCap = await comptroller.borrowCaps(vFDUSD);
      expect(oldCap).to.equal(parseUnits("4400000", 18));
    });
  });

  testVip("VIP-235 Update Risk Parameters", vip235(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI],
        ["NewCollateralFactor", "NewSupplyCap", "NewBorrowCap", "Failure"],
        [1, 1, 1, 0],
      );
    },
  });
  describe("Post-VIP behavior", async () => {
    it("set collateral factor to 78%", async () => {
      const market = await comptroller.markets(vBNB);
      expect(market.collateralFactorMantissa).to.equal(NewCollateralFactor);
    });
    it("sets the supply cap to 10,000,000 FDUSD", async () => {
      const newCap = await comptroller.supplyCaps(vFDUSD);
      expect(newCap).to.equal(parseUnits("10000000", 18));
    });

    it("sets the borrow cap to 8,000,000 FDUSD", async () => {
      const newCap = await comptroller.borrowCaps(vFDUSD);
      expect(newCap).to.equal(parseUnits("8000000", 18));
    });
  });
});
