import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testVip } from "src/vip-framework";

import vip592, { NEW_SUPPLY_CAP, vTUSD } from "../../vips/vip-592/bsctestnet";
import COMPTROLLER_ABI from "./abi/comptroller.json";

const { bsctestnet } = NETWORK_ADDRESSES;

const BLOCK_NUMBER = 91210770;

forking(BLOCK_NUMBER, async () => {
  let comptroller: Contract;

  before(async () => {
    comptroller = new ethers.Contract(bsctestnet.UNITROLLER, COMPTROLLER_ABI, ethers.provider);
  });

  describe("Pre-VIP behavior", async () => {
    it("has the old supply cap for vTUSD", async () => {
      const supplyCap = await comptroller.supplyCaps(vTUSD);
      expect(supplyCap).to.be.equal(parseUnits("1000000", 18));
    });
  });

  testVip("VIP-592 Increase TUSD supply cap", await vip592());

  describe("Post-VIP behavior", async () => {
    it("has the new supply cap for vTUSD", async () => {
      const supplyCap = await comptroller.supplyCaps(vTUSD);
      expect(supplyCap).to.be.equal(NEW_SUPPLY_CAP);
    });
  });
});
