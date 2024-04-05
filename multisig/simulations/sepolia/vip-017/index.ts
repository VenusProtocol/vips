import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { forking, pretendExecutingVip } from "../../../../src/vip-framework/index";
import { vip017, weETH } from "../../../proposals/sepolia/vip-017";
import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import { parseUnits } from "ethers/lib/utils";

const { sepolia } = NETWORK_ADDRESSES;

forking(5632868, () => {
  let resilientOracle: Contract;
 
  before(async () => {
    resilientOracle = await ethers.getContractAt(RESILIENT_ORACLE_ABI, sepolia.RESILIENT_ORACLE);
  });

  describe("Pre-VIP behavior", () => {
    it("check price", async () => {
      await expect(resilientOracle.getPrice(weETH)).to.be.reverted
    })
  })

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(vip017());
    })

    it("check price", async () => {
      expect(await resilientOracle.getPrice(weETH)).to.be.equal(parseUnits("3401.021208950110740265", 18))
    })
  })
});
