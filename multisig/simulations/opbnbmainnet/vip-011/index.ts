import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";

import { checkInterestRate } from "../../../../src/vip-framework/checks/interestRateModel";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework/index";
import vip011 from "../../../proposals/opbnbmainnet/vip-011";
import VTOKEN_ABI from "./abi/vToken.json";

const VToken_vWBNB_Core_IRM = "0x0b7cdC617bFE8e63D7861AbC1139811b61DbC869";
const VToken_vWBNB_Core_IRM_Old = "0x05D0567aa5dDB9179D353871CDc93ece31927026";
const VToken_vWBNB_Core = "0x53d11cB8A0e5320Cd7229C3acc80d1A0707F2672";
const BLOCKS_PER_YEAR = BigNumber.from("31536000");

forking(17345636, async () => {
  let vWBNB: Contract;
  const provider = ethers.provider;
  describe("Pre tx checks", () => {
    before(async () => {
      vWBNB = new ethers.Contract(VToken_vWBNB_Core, VTOKEN_ABI, provider);
    });

    it("Validate old IRM address", async () => {
      const currIRM = await vWBNB.interestRateModel();
      expect(currIRM).equals(VToken_vWBNB_Core_IRM_Old);
    });

    it("IRM parameters checks", async () => {
      checkInterestRate(
        VToken_vWBNB_Core_IRM_Old,
        "vWBNB_Core",
        {
          base: "0",
          multiplier: "0.15",
          jump: "300",
          kink: "0.6",
        },
        BLOCKS_PER_YEAR,
      );
    });
  });

  describe("Post tx checks", () => {
    before(async () => {
      await pretendExecutingVip(await vip011());
    });
    it("Validate new IRM address", async () => {
      const currIRM = await vWBNB.interestRateModel();
      expect(currIRM).equals(VToken_vWBNB_Core_IRM);
    });

    it("IRM parameters checks", async () => {
      checkInterestRate(
        VToken_vWBNB_Core_IRM,
        "vWBNB_Core",
        {
          base: "0",
          multiplier: "0.15",
          jump: "3",
          kink: "0.6",
        },
        BLOCKS_PER_YEAR,
      );
    });
  });
});
