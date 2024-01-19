import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import { vip009 } from "../../../proposals/vip-009/vip-009-sepolia";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";
import WSTETH_ABI from "./abi/wstETH.json";

const { sepolia } = NETWORK_ADDRESSES;

const RESILIENT_ORACLE = sepolia.RESILIENT_ORACLE;
const WETH_ADDRESS = "0x700868CAbb60e90d77B6588ce072d9859ec8E281";
const WSTETH_ADDRESS = "0x9b87ea90fdb55e1a0f17fbeddcf7eb0ac4d50493";
const WETH_USD_PRICE_DENOMINATOR = parseUnits("1", 18);

forking(5113339, () => {
  const provider = ethers.provider;
  let resilientOracle: ethers.Contract;
  let wstETH: ethers.Contract;

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
      await pretendExecutingVip(vip009());
    });
    it("should return correct wstETH price", async () => {
      const WETH_USD_PRICE = await resilientOracle.getPrice(WETH_ADDRESS);
      const STETH_AMOUNT_FOR_ONE_WSTETH = await wstETH.stEthPerToken();
      const expectedPrice = WETH_USD_PRICE.mul(STETH_AMOUNT_FOR_ONE_WSTETH).div(WETH_USD_PRICE_DENOMINATOR);
      expect(await resilientOracle.getPrice(WSTETH_ADDRESS)).to.equal(expectedPrice);
    });
  });
});
