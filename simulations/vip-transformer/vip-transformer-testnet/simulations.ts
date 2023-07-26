import { expect } from "chai";
import { ethers } from "hardhat";

import { expectEvents } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { vipTransformer } from "../../../vips/vip-transformer/vip-transformer-testnet";
import PROTOCOL_SHARE_RESERVE_ABI from "./abi/ProtocolShareReserve.json";
import RISK_FUND_TRANSFORMER_ABI from "./abi/RiskFundTransformer.json";
import RISK_FUND_ABI from "./abi/RiskFundV2.json";

const PROTOCOL_SHARE_RESERVE_PROXY = "0x4eDB103c9Fe0863C62559Ccc3301dd3003A7dec2";
const RISK_FUND_TRANSFORMER_PROXY = "0x8CC7ecFa3AF1D78dD2ceE2239E2b58aA206f8952";
const RISK_FUND_PROXY = "0x27481F538C36eb366FAB4752a8dd5a03ed04a3cF";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const ACM = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";
const AddressZero = "0x0000000000000000000000000000000000000000";
const MAX_LOOP_LIMIT = 5;

forking(31889920, () => {
  const provider = ethers.provider;
  let ProtocolShareReserve: ethers.Contract;
  let RiskFundTransformer: ethers.Contract;
  let RiskFund: ethers.Contract;
  let convertibleBaseAsset: number;

  before(async () => {
    ProtocolShareReserve = new ethers.Contract(PROTOCOL_SHARE_RESERVE_PROXY, PROTOCOL_SHARE_RESERVE_ABI, provider);
    RiskFundTransformer = new ethers.Contract(RISK_FUND_TRANSFORMER_PROXY, RISK_FUND_TRANSFORMER_ABI, provider);
    RiskFund = new ethers.Contract(RISK_FUND_PROXY, RISK_FUND_ABI, provider);
  });

  describe("Pre-VIP behavior", async () => {
    before(async () => {
      convertibleBaseAsset = await RiskFund.convertibleBaseAsset();
    });

    it("should have riskfund set as transformer instead of RiskFund transformer in protocol share reserve", async () => {
      expect(await ProtocolShareReserve.riskFundTransformer()).to.equal(RISK_FUND_PROXY);
    });

    it("owner in protocol share reserve should not equal timelock", async () => {
      expect(await ProtocolShareReserve.owner()).to.not.equal(NORMAL_TIMELOCK);
    });

    it("risk fund should have set riskFund Transformer as zero address", async () => {
      expect(await RiskFund.riskFundTransformer()).to.equal(AddressZero);
    });

    it("risk fund transformer should have set riskFund as destination address", async () => {
      expect(await RiskFundTransformer.destinationAddress()).to.equal(RISK_FUND_PROXY);
    });
  });

  testVip("VIP-transformer", vipTransformer(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [PROTOCOL_SHARE_RESERVE_ABI], ["RiskFundTransformerUpdated"], [2]);
      await expectEvents(txResponse, [PROTOCOL_SHARE_RESERVE_ABI], ["OwnershipTransferred"], [3]);
      await expectEvents(txResponse, [RISK_FUND_TRANSFORMER_ABI], ["DestinationAddressUpdated"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("should have updated the riskfund contract to RiskFund transformer in protocol share reserve", async () => {
      expect(await ProtocolShareReserve.riskFundTransformer()).to.equal(RISK_FUND_TRANSFORMER_PROXY);
    });

    it("protocol share reserve should have timelock as owner", async () => {
      expect(await ProtocolShareReserve.owner()).to.equal(NORMAL_TIMELOCK);
    });

    it("check for state variables in riskfund new implementation", async () => {
      expect(await RiskFund.convertibleBaseAsset()).to.equal(convertibleBaseAsset);
      expect(await RiskFund.riskFundTransformer()).to.equal(RISK_FUND_TRANSFORMER_PROXY);
      expect(await RiskFund.accessControlManager()).to.equal(ACM);
      expect(await RiskFund.maxLoopsLimit()).to.equal(MAX_LOOP_LIMIT);
    });

    it("risk fund transformer should have riskFund as destination address", async () => {
      expect(await RiskFundTransformer.destinationAddress()).to.equal(RISK_FUND_PROXY);
    });

    it("risk fund transformer should have timelock as owner", async () => {
      expect(await RiskFundTransformer.owner()).to.equal(NORMAL_TIMELOCK);
    });
  });
});
