import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip513, { USDC, USDT } from "../../vips/vip-513/bsctestnet-addendum";
import PRICE_ORACLE_ABI from "./abi/resilientOracle.json";

const { unichainsepolia } = NETWORK_ADDRESSES;

forking(22338935, async () => {
  testForkedNetworkVipCommands("Configure price feed for USDT and USDC on Unichain", await vip513());

  describe("Post-Execution state", () => {
    let oracle: Contract;

    before(async () => {
      oracle = await ethers.getContractAt(PRICE_ORACLE_ABI, unichainsepolia.RESILIENT_ORACLE);
    });

    describe("Prices", () => {
      it("get correct price from oracle for USDT", async () => {
        const price = await oracle.getPrice(USDT);
        expect(price).to.equal(parseUnits("1", 30));
      });

      it("get correct price from oracle for USDC", async () => {
        const price = await oracle.getPrice(USDC);
        expect(price).to.equal(parseUnits("1", 30));
      });
    });
  });
});
