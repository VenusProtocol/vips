import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip470, {
  BNB_CORE_COMPTROLLER,
  BNB_GAMEFI_COMPTROLLER,
  BNB_RACA_GAMEFI,
  BNB_RACA_GAMEFI_SUPPLY_CAP,
  BNB_SOL_CORE,
  BNB_SOL_CORE_SUPPLY_CAP,
  BNB_UNI_CORE,
  BNB_UNI_CORE_BORROW_CAP,
  BNB_UNI_CORE_SUPPLY_CAP,
  BNB_USDT_CORE,
  BNB_USDT_CORE_SUPPLY_CAP,
} from "../../vips/vip-470/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";
import CORE_COMPTROLLER_ABI from "./abi/coreComptroller.json";
import IL_COMPTROLLER_ABI from "./abi/ilComptroller.json";

forking(47749140, async () => {
  const coreComptroller = new ethers.Contract(BNB_CORE_COMPTROLLER, CORE_COMPTROLLER_ABI, ethers.provider);
  const gameFiComptroller = new ethers.Contract(BNB_GAMEFI_COMPTROLLER, IL_COMPTROLLER_ABI, ethers.provider);

  describe("Pre-VIP risk parameters", () => {
    it("UNI should have supply cap of 2M", async () => {
      const supplyCap = await coreComptroller.supplyCaps(BNB_UNI_CORE);
      expect(supplyCap).equals(parseUnits("2000000", 18));
    });

    it(`UNI should have borrow cap of 100K`, async () => {
      const borrowCap = await coreComptroller.borrowCaps(BNB_UNI_CORE);
      expect(borrowCap).equals(parseUnits("100000", 18));
    });

    it(`USDT should have supply cap of 500M`, async () => {
      const supplyCap = await coreComptroller.supplyCaps(BNB_USDT_CORE);
      expect(supplyCap).equals(parseUnits("500000000", 18));
    });

    it(`SOL should have supply cap of 18K`, async () => {
      const supplyCap = await coreComptroller.supplyCaps(BNB_SOL_CORE);
      expect(supplyCap).equals(parseUnits("18000", 18));
    });

    it(`RACA should have supply cap of 1B`, async () => {
      const supplyCap = await gameFiComptroller.supplyCaps(BNB_RACA_GAMEFI);
      expect(supplyCap).equals(parseUnits("1000000000", 18));
    });
  });

  testVip("VIP-470", await vip470(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(
        txResponse,
        [OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["ExecuteRemoteProposal", "StorePayload"],
        [1, 0],
      );
      await expectEvents(txResponse, [CORE_COMPTROLLER_ABI], ["NewSupplyCap", "NewBorrowCap"], [4, 1]);
    },
  });

  describe("Risk parameters", () => {
    it(`UNI should have supply cap of ${BNB_UNI_CORE_SUPPLY_CAP}`, async () => {
      const supplyCap = await coreComptroller.supplyCaps(BNB_UNI_CORE);
      expect(supplyCap).equals(BNB_UNI_CORE_SUPPLY_CAP);
    });

    it(`UNI should have borrow cap of ${BNB_UNI_CORE_BORROW_CAP}`, async () => {
      const borrowCap = await coreComptroller.borrowCaps(BNB_UNI_CORE);
      expect(borrowCap).equals(BNB_UNI_CORE_BORROW_CAP);
    });

    it(`USDT should have supply cap of ${BNB_USDT_CORE_SUPPLY_CAP}`, async () => {
      const supplyCap = await coreComptroller.supplyCaps(BNB_USDT_CORE);
      expect(supplyCap).equals(BNB_USDT_CORE_SUPPLY_CAP);
    });

    it(`SOL should have supply cap of ${BNB_SOL_CORE_SUPPLY_CAP}`, async () => {
      const supplyCap = await coreComptroller.supplyCaps(BNB_SOL_CORE);
      expect(supplyCap).equals(BNB_SOL_CORE_SUPPLY_CAP);
    });

    it(`RACA should have supply cap of ${BNB_RACA_GAMEFI_SUPPLY_CAP}`, async () => {
      const supplyCap = await gameFiComptroller.supplyCaps(BNB_RACA_GAMEFI);
      expect(supplyCap).equals(BNB_RACA_GAMEFI_SUPPLY_CAP);
    });
  });
});
