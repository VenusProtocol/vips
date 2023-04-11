import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents, setMaxStalePeriodInOracle } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { vip106 } from "../../vips/vip-106";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import CHAINLINK_ORACLE_ABI from "./abi/chainlinkOracle.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";
import PRICE_ORACLE_ABI from "./abi/priceOracle.json";

const COMPTROLLER = "0xfd36e2c2a6789db23113685031d7f16329158384";
const CHAINLINK_ORACLE = "0x672Ba3b2f5d9c36F36309BA913D708C4a5a25eb0";
const RESILIENT_ORACLE = "0xe40C7548bFB764C48f9A037753A9F08c5B3Fde15";
const PRICE_ORACLE = "0x7FabdD617200C9CB4dcf3dd2C41273e60552068A";

const vUSDC = "0xeca88125a5adbe82614ffc12d0db554e2e2867c8";

forking(27116217, () => {
  let comptroller: ethers.Contract;
  let chainlinkOracle: ethers.Contract;
  let resilientOracle: ethers.Contract;
  let priceOracle: ethers.Contract;
  const provider = ethers.provider;

  before(async () => {
    comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);
    chainlinkOracle = new ethers.Contract(CHAINLINK_ORACLE, CHAINLINK_ORACLE_ABI, provider);
    resilientOracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
    priceOracle = new ethers.Contract(PRICE_ORACLE, PRICE_ORACLE_ABI, provider)
    await setMaxStalePeriodInOracle(COMPTROLLER);
  });

  describe("Pre-VIP behavior", async () => {
    it("valid USDC price", async () => {
      const price = (await priceOracle.getUnderlyingPrice(vUSDC));
      expect(price).to.equal(parseUnits("0.999769", 18));
    });
  });

  testVip("VIP-106 Change Oracle and Configure Resilient Oracle", vip106());

  describe("Post-VIP behavior", async () => {
    it("valid USDC price", async () => {
      const price = (await priceOracle.getUnderlyingPrice(vUSDC));
      expect(price).to.equal(parseUnits("0.999769", 18));
    });
  })
});
