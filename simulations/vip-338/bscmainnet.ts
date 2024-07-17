import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip338, { BTC, ETH, PLP, USDC, USDT } from "../../vips/vip-338/bscmainnet";
import PLP_ABI from "./abi/PrimeLiquidityProvider.json";

forking(40397206, () => {
  let plp: Contract;

  before(async () => {
    plp = await ethers.getContractAt(PLP_ABI, PLP);
  });

  testVip("VIP-338 Prime Adjustment", vip338(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [PLP_ABI], ["TokenDistributionSpeedUpdated"], [4]);
    },
  });

  describe("Post-Execution", () => {
    it("should update the distribution speeds in plp", async () => {
      expect(await plp.tokenDistributionSpeeds(BTC)).to.be.equal("308219178082");
      expect(await plp.tokenDistributionSpeeds(ETH)).to.be.equal("17473363774733");
      expect(await plp.tokenDistributionSpeeds(USDC)).to.be.equal("119863013698630136");
      expect(await plp.tokenDistributionSpeeds(USDT)).to.be.equal("154109589041095890");
    });
  });
});
