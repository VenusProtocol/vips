import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testVip } from "src/vip-framework";

import vip631, { SXP, SXP_DIRECT_PRICE } from "../../vips/vip-631/bscmainnet";

const { bscmainnet } = NETWORK_ADDRESSES;
const CHAINLINK_ORACLE = bscmainnet.CHAINLINK_ORACLE;

const CHAINLINK_ORACLE_ABI = [
  "function getPrice(address asset) view returns (uint256)",
  "function prices(address asset) view returns (uint256)",
  "event PricePosted(address indexed asset, uint256 previousPriceMantissa, uint256 newPriceMantissa)",
];

const BLOCK_NUMBER = 103745245;

forking(BLOCK_NUMBER, async () => {
  let oracle: Contract;

  before(async () => {
    oracle = new ethers.Contract(CHAINLINK_ORACLE, CHAINLINK_ORACLE_ABI, ethers.provider);
  });

  describe("Pre-VIP behavior", () => {
    it("SXP direct price is not yet 0.00046", async () => {
      expect(await oracle.prices(SXP)).to.not.equal(SXP_DIRECT_PRICE);
    });
  });

  testVip("VIP-631 Set SXP direct price", await vip631(), {
    callbackAfterExecution: async txResponse => {
      await expect(txResponse).to.emit(oracle, "PricePosted").withArgs(SXP, anyValue, SXP_DIRECT_PRICE);
    },
  });

  describe("Post-VIP behavior", () => {
    it("SXP direct price is set to 0.00046", async () => {
      expect(await oracle.prices(SXP)).to.equal(SXP_DIRECT_PRICE);
    });
  });
});
