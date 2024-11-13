import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import vip396, {
  BORROW_CAP,
  BSC_VETH_LST_IRM,
  BSC_vETH_CORE,
  BSC_vETH_CORE_IRM,
  BSC_vETH_LST,
  COMPTROLLER,
  SUPPLY_CAP,
  vFDUSD,
} from "../../vips/vip-396/bscmainnet";
import COMPTROLLER_ABI from "./abi/CoreComptroller.json";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";
import VTOKEN_CORE_POOL_ABI from "./abi/VTokenCorePool.json";

forking(43743361, async () => {
  const provider = ethers.provider;

  const vETHCore = new ethers.Contract(BSC_vETH_CORE, VTOKEN_CORE_POOL_ABI, provider);
  const vETHLST = new ethers.Contract(BSC_vETH_LST, VTOKEN_CORE_POOL_ABI, provider);
  const comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);

  describe("Pre-VIP behavior", async () => {
    it("check supply and borrow cap", async () => {
      const supplyCap = await comptroller.supplyCaps(vFDUSD);
      const borrowCap = await comptroller.borrowCaps(vFDUSD);

      expect(supplyCap).to.eq(parseUnits("45000000", 18));
      expect(borrowCap).to.eq(parseUnits("40000000", 18));
    });
  });

  testVip("VIP-396", await vip396(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["ExecuteRemoteProposal", "StorePayload"],
        [3, 0],
      );

      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewBorrowCap", "NewSupplyCap"], [1, 1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("has the new interest rate model addresses", async () => {
      expect(await vETHCore.interestRateModel()).to.equal(BSC_vETH_CORE_IRM);
      expect(await vETHLST.interestRateModel()).to.equal(BSC_VETH_LST_IRM);
    });

    describe("new interest rate model parameters", async () => {
      checkInterestRate(BSC_vETH_CORE_IRM, "vETH (Core)", {
        base: "0",
        multiplier: "0.03",
        jump: "4.5",
        kink: "0.9",
      });

      checkInterestRate(BSC_VETH_LST_IRM, "vETH (LST)", {
        base: "0",
        multiplier: "0.03",
        jump: "4.5",
        kink: "0.9",
      });
    });

    it("check supply and borrow cap", async () => {
      const supplyCap = await comptroller.supplyCaps(vFDUSD);
      const borrowCap = await comptroller.borrowCaps(vFDUSD);

      expect(supplyCap).to.eq(SUPPLY_CAP);
      expect(borrowCap).to.eq(BORROW_CAP);
    });
  });
});
