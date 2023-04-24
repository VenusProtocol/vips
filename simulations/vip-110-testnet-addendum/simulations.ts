import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { vip110TestnetAddendum } from "../../vips/vip-110-testnet-addendum";
import CHAINLINK_ORACLE_ABI from "./abi/chainlinkOracle.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import PRICE_ORACLE_ABI from "./abi/priceOracle.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";

const COMPTROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
const PRICE_ORACLE = "0xaac0ecd822c5da82d0bdab17972fc26dcbbaf5e4";

interface vTokenConfig {
  name: string;
  address: string;
  price: string;
}

const vTokens: vTokenConfig[] = [
  {
    name: "vTUSD",
    address: "0x3a00d9b02781f47d033bad62edc55fbf8d083fb0",
    price: "1",
  },
];

forking(29212565, () => {
  const provider = ethers.provider;

  describe("Pre-VIP behavior", async () => {
    let priceOracle: ethers.Contract;

    before(async () => {
      priceOracle = new ethers.Contract(PRICE_ORACLE, PRICE_ORACLE_ABI, provider);
    });

    it("validate vToken prices", async () => {
      for (let i = 0; i < vTokens.length; i++) {
        const vToken = vTokens[i];
        const price = await priceOracle.getUnderlyingPrice(vToken.address);
        expect(price).to.be.equal(parseUnits(vToken.price, 18));
      }
    });
  });

  testVip("VIP-110-Addendum Set Feed for TUSD", vip110TestnetAddendum(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [CHAINLINK_ORACLE_ABI], ["PricePosted"], [1]);
      await expectEvents(txResponse, [RESILIENT_ORACLE_ABI], ["TokenConfigAdded"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    let resilientOracle: ethers.Contract;
    let comptroller: ethers.Contract;

    before(async () => {
      comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);
      resilientOracle = new ethers.Contract(await comptroller.oracle(), RESILIENT_ORACLE_ABI, provider);
    });

    it("validate vToken prices", async () => {
      for (let i = 0; i < vTokens.length; i++) {
        const vToken = vTokens[i];
        const price = await resilientOracle.getUnderlyingPrice(vToken.address);
        expect(price).to.be.equal(parseUnits(vToken.price, 18));
      }
    });
  });
});
