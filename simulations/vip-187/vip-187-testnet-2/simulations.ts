import { expect } from "chai";
import { ethers } from "hardhat";

import { expectEvents } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { DEST_CHAIN_ID, MIN_DST_GAS, vip187Testnet2 } from "../../../vips/vip-187/vip-187-testnet-2";
import XVSProxyOFTSrc_ABI from "./abi/XVSProxyOFTSrc.json";

const XVSProxyOFTSrc = "0x963cAbDC5bb51C1479ec94Df44DE2EC1a49439E3";

forking(35514503, () => {
  const provider = ethers.provider;
  let bridge: ethers.Contract;

  beforeEach(async () => {
    bridge = new ethers.Contract(XVSProxyOFTSrc, XVSProxyOFTSrc_ABI, provider);
  });

  testVip("vip187Testnet2", vip187Testnet2(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [XVSProxyOFTSrc_ABI], ["SetMinDstGas", "Failure"], [1, 0]);
    },
  });

  describe("Post-VIP behavior", () => {
    it("Should change min dest gas", async () => {
      const gas = await bridge.minDstGasLookup(DEST_CHAIN_ID, 0);
      expect(gas).equals(MIN_DST_GAS);
    });
  });
});
