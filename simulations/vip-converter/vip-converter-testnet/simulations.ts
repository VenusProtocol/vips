import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { vipConverter } from "../../../vips/vip-converter/vip-converter-testnet/vip-converter-testnet";
import PROTOCOL_SHARE_RESERVE_ABI from "./abi/ProtocolShareReserve.json";
import RISK_FUND_CONVERTER_ABI from "./abi/RiskFundConverter.json";
import RISK_FUND_ABI from "./abi/RiskFundV2.json";

const RISK_FUND_CONVERTER_PROXY = "0x93520Fa75b569eB67232Bd43d3655E85E75F6C2A";
const RISK_FUND_PROXY = "0xa8433F284795aE7f8652127af47482578b58673d";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const ACM = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";
const AddressZero = "0x0000000000000000000000000000000000000000";
const MAX_LOOP_LIMIT = 5;

forking(32752213, () => {
  const provider = ethers.provider;
  let RiskFundConverter: Contract;
  let RiskFund: Contract;
  let convertibleBaseAsset: number;

  before(async () => {
    RiskFundConverter = new ethers.Contract(RISK_FUND_CONVERTER_PROXY, RISK_FUND_CONVERTER_ABI, provider);
    RiskFund = new ethers.Contract(RISK_FUND_PROXY, RISK_FUND_ABI, provider);
  });

  describe("Pre-VIP behavior", async () => {
    before(async () => {
      convertibleBaseAsset = await RiskFund.convertibleBaseAsset();
    });

    it("risk fund should have set riskFund Converter as zero address", async () => {
      expect(await RiskFund.riskFundConverter()).to.equal(AddressZero);
    });

    it("risk fund converter should have set riskFund as destination address", async () => {
      expect(await RiskFundConverter.destinationAddress()).to.equal(RISK_FUND_PROXY);
    });
  });

  testVip("VIP-converter", vipConverter(), {
    callbackAfterExecution: async (txResponse: any) => {
      await expectEvents(txResponse, [PROTOCOL_SHARE_RESERVE_ABI], ["RiskFundConverterUpdated"], [2]);
      await expectEvents(txResponse, [PROTOCOL_SHARE_RESERVE_ABI], ["OwnershipTransferred"], [3]);
      await expectEvents(txResponse, [RISK_FUND_CONVERTER_ABI], ["DestinationAddressUpdated"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check for state variables in riskfund new implementation", async () => {
      expect(await RiskFund.convertibleBaseAsset()).to.equal(convertibleBaseAsset);
      expect(await RiskFund.riskFundConverter()).to.equal(RISK_FUND_CONVERTER_PROXY);
      expect(await RiskFund.accessControlManager()).to.equal(ACM);
      expect(await RiskFund.maxLoopsLimit()).to.equal(MAX_LOOP_LIMIT);
    });

    it("risk fund converter should have riskFund as destination address", async () => {
      expect(await RiskFundConverter.destinationAddress()).to.equal(RISK_FUND_PROXY);
    });

    it("risk fund converter should have timelock as owner", async () => {
      expect(await RiskFundConverter.owner()).to.equal(NORMAL_TIMELOCK);
    });
  });
});
