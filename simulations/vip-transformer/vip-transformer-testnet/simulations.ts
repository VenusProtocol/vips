import { expect } from "chai";
import { ethers } from "hardhat";

import { expectEvents } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { vipTransformer } from "../../../vips/vip-transformer/vip-transformer-testnet";
import PROTOCOL_SHARE_RESERVE_ABI from "./abi/ProtocolShareReserve.json";
import RISK_FUND_ABI from "./abi/RiskFundV2.json";

const PROTOCOL_SHARE_RESERVE_PROXY = "0x4eDB103c9Fe0863C62559Ccc3301dd3003A7dec2";
const RISK_FUND_PROXY = "0x27481F538C36eb366FAB4752a8dd5a03ed04a3cF";
const RISKFUND_TRANSFORMER = "0x8CC7ecFa3AF1D78dD2ceE2239E2b58aA206f8952";
const CONVERTIBLE_BASE_ASSET_USD = "0x55d398326f99059fF775485246999027B3197955";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const ACM = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";
const AddressZero = "0x0000000000000000000000000000000000000000";

forking(31887727, () => {
  const provider = ethers.provider;
  let ProtocolShareReserve: ethers.Contract;
  let RiskFund: ethers.Contract;

  before(async () => {
    ProtocolShareReserve = new ethers.Contract(PROTOCOL_SHARE_RESERVE_PROXY, PROTOCOL_SHARE_RESERVE_ABI, provider);
    RiskFund = new ethers.Contract(RISK_FUND_PROXY, RISK_FUND_ABI, provider);
  });

  describe("Pre-VIP behavior", async () => {
    it("should have riskfund set as transformer instead of RiskFund transformer", async () => {
      expect(await ProtocolShareReserve.riskFundTransformer()).to.equal(RISK_FUND_PROXY);
    });

    it("risk fund should have set riskFund Transformer as zero address", async () => {
      expect(await RiskFund.riskFundTransformer()).to.equal(AddressZero);
    });
  });

  testVip("VIP-transformer", vipTransformer(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [PROTOCOL_SHARE_RESERVE_ABI], ["RiskFundTransformerUpdated"], [2]);
      await expectEvents(txResponse, [PROTOCOL_SHARE_RESERVE_ABI], ["OwnershipTransferred"], [2]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("should have updated the riskfund contract to RiskFund transformer", async () => {
      expect(await ProtocolShareReserve.riskFundTransformer()).to.equal(RISKFUND_TRANSFORMER);
      expect(await ProtocolShareReserve.owner()).to.equal(NORMAL_TIMELOCK);
    });

    it("check for state variables in riskfund new implementation", async () => {
      expect(await RiskFund.convertibleBaseAsset()).to.equal(CONVERTIBLE_BASE_ASSET_USD);
      expect(await RiskFund.accessControlManager()).to.equal(ACM);
      expect(await RiskFund.maxLoopsLimit()).to.equal(5);
      expect(await RiskFund.riskFundTransformer()).to.equal(RISKFUND_TRANSFORMER);
    });
  });
});
