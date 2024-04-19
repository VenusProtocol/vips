import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents, setMaxStalePeriodInChainlinkOracle } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip289, {
  BNBx,
  RESILIENT_ORACLE,
  SlisBNB,
  StkBNB,
  WBETH,
  WBETHOracle,
  ankrBNB,
} from "../../vips/vip-289/bscmainnet";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";
import WBETH_ORACLE_ABI from "./abi/wbethOracle.json";

const vankrBNB = "0x53728FD51060a85ac41974C6C3Eb1DaE42776723";
const vBNBx = "0x5E21bF67a6af41c74C1773E4b473ca5ce8fd3791";
const vstkBNB = "0xcc5D9e502574cda17215E70bC0B4546663785227";
const vslisBNB = "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A";
const NATIVE_TOKEN_ADDR = "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB";
const CHAINLINK_ORACLE = "0x1B2103441A0A108daD8848D8F5d790e4D402921F";
const BNB_FEED = "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const ETH_FEED = "0x9ef1B8c0E4F7dc8bF5719Ea496883DC6401d5b2e";
const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";

forking(37991548, () => {
  let resilientOracle: Contract;
  let wbethOracleContract: Contract;

  before(async () => {
    resilientOracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);
    wbethOracleContract = new ethers.Contract(WBETHOracle, WBETH_ORACLE_ABI, ethers.provider);
  });

  describe("Pre-VIP behavior", async () => {
    it("check BNBx price", async () => {
      const price = await resilientOracle.getPrice(BNBx);
      expect(price).to.be.equal(parseUnits("604.34915467", "18"));
    });

    it("check SlisBNB price", async () => {
      const price = await resilientOracle.getPrice(SlisBNB);
      expect(price).to.be.equal(parseUnits("562.93032605", "18"));
    });

    it("check StkBNB price", async () => {
      const price = await resilientOracle.getPrice(StkBNB);
      expect(price).to.be.equal(parseUnits("579.89308933", "18"));
    });

    it("check WBETH price", async () => {
      const price = await wbethOracleContract.getPrice(WBETH);
      expect(price).to.be.equal(parseUnits("3197.94495589512767", "18"));
    });

    it("check ankrBNB price", async () => {
      const price = await resilientOracle.getPrice(ankrBNB);
      expect(price).to.be.equal(parseUnits("598.9378593", "18"));
    });
  });

  testVip("VIP-289", vip289(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [RESILIENT_ORACLE_ABI], ["TokenConfigAdded"], [4]);
    },
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await setMaxStalePeriodInChainlinkOracle(CHAINLINK_ORACLE, NATIVE_TOKEN_ADDR, BNB_FEED, NORMAL_TIMELOCK);

      await setMaxStalePeriodInChainlinkOracle(CHAINLINK_ORACLE, ETH, ETH_FEED, NORMAL_TIMELOCK);
    });
    it("check BNBx price", async () => {
      const price = parseUnits("603.254726719532584917", "18");
      expect(await resilientOracle.getPrice(BNBx)).to.be.equal(price);
      expect(await resilientOracle.getUnderlyingPrice(vBNBx)).to.be.equal(price);
    });

    it("check SlisBNB price", async () => {
      const price = parseUnits("565.791947184022163579", "18");
      expect(await resilientOracle.getPrice(SlisBNB)).to.be.equal(price);
      expect(await resilientOracle.getUnderlyingPrice(vslisBNB)).to.be.equal(price);
    });

    it("check StkBNB price", async () => {
      const price = parseUnits("581.47544522170253081", "18");
      expect(await resilientOracle.getPrice(StkBNB)).to.be.equal(price);
      expect(await resilientOracle.getUnderlyingPrice(vstkBNB)).to.be.equal(price);
    });

    it("check WBETH price", async () => {
      const price = await wbethOracleContract.getPrice(WBETH);
      expect(price).to.be.equal(parseUnits("3197.94495589512767", "18"));
    });

    it("check ankrBNB price", async () => {
      const price = parseUnits("600.626009762391317954", "18");
      expect(await resilientOracle.getPrice(ankrBNB)).to.be.equal(price);
      expect(await resilientOracle.getUnderlyingPrice(vankrBNB)).to.be.equal(price);
    });
  });
});
