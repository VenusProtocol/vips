import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip491, {
  RESILIENT_ORACLE,
  BINANCE_ORACLE,
  BOUND_VALIDATOR
} from "../../vips/vip-491/bsctestnet";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";

forking(61919310, async () => {
  const provider = ethers.provider;

  const resilientOracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);

  describe("Pre-VIP behaviour", async () => {
    it("check BTCB price", async () => {
      expect(await resilientOracle.getPrice("0x8ac9B3801D0a8f5055428ae0bF301CA1Da976855")).to.equal(parseUnits("4300000", 6));
    });
  });

  testForkedNetworkVipCommands("vip491", await vip491());

  describe("Post-VIP behaviour", async () => {
    it("check BTCB price", async () => {
      expect(await resilientOracle.getPrice("0x8ac9B3801D0a8f5055428ae0bF301CA1Da976855")).to.equal(parseUnits("4300000", 6));
    });
  });
});
