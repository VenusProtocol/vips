import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip009 from "../../../proposals/ethereum/vip-009";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";
import WSTETH_ABI from "./abi/wstETH.json";

const WSTETH_ADDRESS = "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0";
const RESILIENT_ORACLE = "0xd2ce3fb018805ef92b8C5976cb31F84b4E295F94";
const WETH_ADDRESS = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const WETH_USD_PRICE_DENOMINATOR = parseUnits("1", 18);

forking(19076168, async () => {
  const provider = ethers.provider;
  let resilientOracle: Contract;
  let wstETH: Contract;

  describe("Pre-VIP behavior", async () => {
    before(async () => {
      resilientOracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
      wstETH = new ethers.Contract(WSTETH_ADDRESS, WSTETH_ABI, provider);
    });
    it("should revert for unconfigured wstETH price request", async () => {
      await expect(resilientOracle.getPrice(WSTETH_ADDRESS)).to.be.revertedWith("invalid resilient oracle price");
    });
  });
  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip009());
    });
    it("should return correct wstETH price", async () => {
      const WETH_USD_PRICE = await resilientOracle.getPrice(WETH_ADDRESS);
      const STETH_AMOUNT_FOR_ONE_WSTETH = await wstETH.stEthPerToken();
      const expectedPrice = WETH_USD_PRICE.mul(STETH_AMOUNT_FOR_ONE_WSTETH).div(WETH_USD_PRICE_DENOMINATOR);
      expect(await resilientOracle.getPrice(WSTETH_ADDRESS)).to.equal(expectedPrice);
    });
  });
});
