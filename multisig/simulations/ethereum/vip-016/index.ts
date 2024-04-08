import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import vip016 from "../../../proposals/ethereum/vip-016";
import { XVS, XVS_BRIDGE_DEST, XVS_MINT_LIMIT } from "../../../proposals/ethereum/vip-016";
import XVS_ABI from "./abi/xvs.json";

forking(19609670, () => {
  let xvs: Contract;

  before(async () => {
    xvs = await ethers.getContractAt(XVS_ABI, XVS);
  });

  describe("Pre-Execution state", () => {
    it("Mint limit = 0", async () => {
      const cap = await xvs.minterToCap(XVS_BRIDGE_DEST);
      expect(cap).equals(0);
    });
  });

  describe("Post-Execution state", () => {
    before(async () => {
      await pretendExecutingVip(vip016());
    });

    it("Should set minting limit in XVS token", async () => {
      const cap = await xvs.minterToCap(XVS_BRIDGE_DEST);
      expect(cap).equals(XVS_MINT_LIMIT);
    });
  });
});
