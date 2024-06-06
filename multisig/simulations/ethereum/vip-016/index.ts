import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import vip016 from "../../../proposals/ethereum/vip-016";
import { XVS, XVS_BRIDGE_DEST, XVS_MINT_LIMIT } from "../../../proposals/ethereum/vip-016";
import XVS_ABI from "./abi/xvs.json";

forking(19609700, async () => {
  let xvs: Contract;

  before(async () => {
    xvs = await ethers.getContractAt(XVS_ABI, XVS);
  });

  describe("Pre-Execution state", () => {
    it("Mint limit = 500000", async () => {
      const cap = await xvs.minterToCap(XVS_BRIDGE_DEST);
      expect(cap).equals(parseUnits("500000", 18));
    });
  });

  describe("Post-Execution state", () => {
    before(async () => {
      await pretendExecutingVip(await vip016());
    });

    it("Should set minting limit in XVS token", async () => {
      const cap = await xvs.minterToCap(XVS_BRIDGE_DEST);
      expect(cap).equals(XVS_MINT_LIMIT);
    });
  });
});
