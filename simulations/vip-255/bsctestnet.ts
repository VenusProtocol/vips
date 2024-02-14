import { TransactionResponse } from "@ethersproject/providers";
import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { vip255, ResilientOracle, stkBNB, BNBx, slisBNB, StkBNBOracle } from "../../vips/vip-255/bsctestnet";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";
import { parseUnits } from "ethers/lib/utils";


forking(37729228, () => {
  const provider = ethers.provider;
  let resilientOracle: ethers.Contract;

  before(async () => {
    resilientOracle = new ethers.Contract(ResilientOracle, RESILIENT_ORACLE_ABI, provider);
  });

  describe("Pre-VIP behavior", () => {
    it("Verify stkBNB Price", async () => {
      const price = await resilientOracle.getPrice(stkBNB);
      expect(price).equals(parseUnits("328.36", 18));
    });

    it("Verify BNBx Price", async () => {
      const price = await resilientOracle.getPrice(BNBx);
      expect(price).equals(parseUnits("342.50005266", 18));
    });

    it("Verify slisBNB Price", async () => {
      const price = await resilientOracle.getPrice(slisBNB);
      expect(price).equals(parseUnits("217", 18));
    });
  });

  testVip("VIP-255 LST Oracles Configuration", vip255(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [RESILIENT_ORACLE_ABI], ["TokenConfigAdded"], [3]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Verify stkBNB Price", async () => {
      const price = await resilientOracle.getPrice(stkBNB);
      expect(price).equals(parseUnits("331.443874229828478303", 18));
    });

    it("Verify BNBx Price", async () => {
      const price = await resilientOracle.getPrice(BNBx);
      expect(price).equals(parseUnits("609.684169646877444943", 18));
    });

    it("Verify slisBNB Price", async () => {
      const price = await resilientOracle.getPrice(slisBNB);
      expect(price).equals(parseUnits("1375.930472483208609621", 18));
    });
  });
});
