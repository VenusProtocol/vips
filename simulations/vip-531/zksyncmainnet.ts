import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip531, { PRICE, USDM } from "../../vips/vip-531/bscmainnet";
import CHAINLINK_ORACLE_ABI from "./abi/ChainlinkOracle.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";

export const WUSDM = "0xA900cbE7739c96D2B153a273953620A701d5442b";

const { zksyncmainnet } = NETWORK_ADDRESSES;

forking(62712692, async () => {
  const resilientOracle = new ethers.Contract(zksyncmainnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);

  describe("Pre-VIP behaviour", async () => {
    it("check USDM price", async () => {
      const usdmPrice = await resilientOracle.getPrice(USDM);
      expect(usdmPrice).to.equals(parseUnits("0.99437123", 18));
    });

    it("check WUSDM price", async () => {
      const wusdmPrice = await resilientOracle.getPrice(WUSDM);
      expect(wusdmPrice).to.equals(parseUnits("1.075584178051336423", 18));
    });
  });

  testForkedNetworkVipCommands("VIP 531", await vip531(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [CHAINLINK_ORACLE_ABI], ["PricePosted"], [1]);
    },
  });

  describe("Post-VIP behaviour", async () => {
    it("check USDM price", async () => {
      const usdmPrice = await resilientOracle.getPrice(USDM);
      expect(usdmPrice).to.equals(PRICE);
    });

    it("check WUSDM price", async () => {
      const wusdmPrice = await resilientOracle.getPrice(WUSDM);
      expect(wusdmPrice).to.equals(parseUnits("1.081672664696198444", 18));
    });
  });
});
