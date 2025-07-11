import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip530, { PRICE, USDM } from "../../vips/vip-530/bscmainnet";
import CHAINLINK_ORACLE_ABI from "./abi/ChainlinkOracle.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";

const { zksyncmainnet } = NETWORK_ADDRESSES;

forking(62712692, async () => {
  const resilientOracle = new ethers.Contract(zksyncmainnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);

  describe("Pre-VIP behaviour", async () => {
    it("check USDM price", async () => {
      const usdmPrice = await resilientOracle.getPrice(USDM);
      expect(usdmPrice).to.equals(parseUnits("0.99437123", 18));
    });
  });

  testForkedNetworkVipCommands("VIP 530", await vip530(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [CHAINLINK_ORACLE_ABI], ["PricePosted"], [1]);
    },
  });

  describe("Post-VIP behaviour", async () => {
    it("check WUSDM price", async () => {
      const usdmPrice = await resilientOracle.getPrice(USDM);
      expect(usdmPrice).to.equals(PRICE);
    });
  });
});
