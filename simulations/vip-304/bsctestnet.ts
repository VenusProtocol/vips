import { TransactionResponse } from "@ethersproject/providers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents, initMainnetUser, setMaxStaleCoreAssets } from "../../src/utils";
import { NORMAL_TIMELOCK, forking, testVip } from "../../src/vip-framework";
import vip304, {RESILIENT_ORACLE, BABYDOGE, BINANCE_ORACLE} from "../../vips/vip-304/bsctestnet";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json"
import { Contract } from "ethers";

forking(40208623, () => {
  const provider = ethers.provider;
  let oracle: Contract

  before(async () => {
    oracle = new ethers.Contract(BINANCE_ORACLE, RESILIENT_ORACLE_ABI, provider)
  });

  describe("Pre-VIP state", () => {
    it("check price", async () => {
      await expect(oracle.getPrice(BABYDOGE)).to.be.reverted
    })
  });

  testVip("Add Meme Pool", vip304(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
    },
  });

  describe("Post-VIP state", () => {
    it("check price", async () => {
      const price = await oracle.getPrice(BABYDOGE);
      expect(price).to.be.eq(parseUnits("1.785007649", 18));
    })
  });
});
