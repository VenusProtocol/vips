import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import vip001, { NEW_XVS, OLD_XVS } from "../../../proposals/arbitrumsepolia/vip-001/addendum-1";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";

const { arbitrumsepolia } = NETWORK_ADDRESSES;
const RESILIENT_ORACLE = arbitrumsepolia.RESILIENT_ORACLE;

forking(36647115, () => {
  const provider = ethers.provider;
  let resilientOracle: Contract;

  describe("Pre-VIP behavior", () => {
    before(async () => {
      resilientOracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
    });

    it("Should revert on new XVS price fetch", async () => {
      await expect(resilientOracle.getPrice(NEW_XVS)).to.be.revertedWith("invalid resilient oracle price");
    });

    it("Should give old XVS price", async () => {
      expect(await resilientOracle.getPrice(OLD_XVS)).to.be.equal(parseUnits("10", 18));
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(vip001());
    });

    it("Should revert on old XVS price fetch", async () => {
      await expect(resilientOracle.getPrice(OLD_XVS)).to.be.revertedWith("invalid resilient oracle price");
    });

    it("Should return price of XVS", async () => {
      expect(await resilientOracle.getPrice(NEW_XVS)).to.be.equal(parseUnits("10", 18));
    });
  });
});
