import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip530, { BORROW_CAP, MATIC, SUPPLY_CAP, vMATIC } from "../../vips/vip-530/bscmainnet";
import COMPTROLLER_ABI from "./abi/CoreComptroller.json";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";

const { bscmainnet } = NETWORK_ADDRESSES;

forking(53622111, async () => {
  const comptroller = new ethers.Contract(bscmainnet.UNITROLLER, COMPTROLLER_ABI, ethers.provider);

  const resilientOracle = new ethers.Contract(bscmainnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);

  describe("Pre-VIP behaviour", async () => {
    it("check supply cap", async () => {
      const supplyCap = await comptroller.supplyCaps(vMATIC);
      expect(supplyCap).to.equals(parseUnits("5500000", 18));
    });

    it("check borrow cap", async () => {
      const borrowCap = await comptroller.borrowCaps(vMATIC);
      expect(borrowCap).to.equals(parseUnits("250000", 18));
    });

    it("check MATIC price", async () => {
      const maticPrice = await resilientOracle.getPrice(MATIC);
      expect(maticPrice).to.equals(parseUnits("0.2273", 18));
    });
  });

  testVip("vip-530", await vip530(365 * 24 * 60 * 60), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(
        txResponse,
        [OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["ExecuteRemoteProposal", "StorePayload"],
        [1, 0],
      );
    },
  });

  describe("Post-VIP behaviour", async () => {
    it("check supply cap", async () => {
      const supplyCap = await comptroller.supplyCaps(vMATIC);
      expect(supplyCap).to.equals(SUPPLY_CAP);
    });

    it("check borrow cap", async () => {
      const borrowCap = await comptroller.borrowCaps(vMATIC);
      expect(borrowCap).to.equals(BORROW_CAP);
    });

    it("check MATIC price", async () => {
      const maticPrice = await resilientOracle.getPrice(MATIC);
      expect(maticPrice).to.equals(parseUnits("0.22702797", 18));
    });
  });
});
