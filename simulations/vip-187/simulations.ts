import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { vip187 } from "../../vips/vip-187";
import COMPTROLLER_ABI from "./abi/COMPTROLLER_ABI.json";
import VAI_CONTROLLER_ABI from "./abi/VAI_CONTROLLER_ABI.json";

const VAIController = "0x004065D34C6b18cE4370ced1CeBDE94865DbFAFE";
const UNITROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
forking(32681348, () => {
  let comptroller: ethers.Contract;
  let vaiController: ethers.Contract;

  const provider = ethers.provider;

  before(async () => {
    comptroller = new ethers.Contract(UNITROLLER, COMPTROLLER_ABI, provider);
    vaiController = new ethers.Contract(VAIController, VAI_CONTROLLER_ABI, provider);
  });

  testVip("VIP-187 Risk Parameters Update", vip187(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI, VAI_CONTROLLER_ABI],
        ["NewVAIMintCap", "NewVAIMintRate", "Failure"],
        [1, 1, 0],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Check updated VAI mint cap", async () => {
      const newCap = await vaiController.mintCap();
      expect(newCap).to.equal("10000000000000000000000000");
    });

    it("Check updated VAI mint rate", async () => {
      const newRate = await comptroller.vaiMintRate();
      expect(newRate).to.equal(parseUnits("1", 18));
    });
  });
});
