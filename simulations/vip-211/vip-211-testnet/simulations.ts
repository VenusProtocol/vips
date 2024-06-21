import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { vip211 } from "../../../vips/vip-211/vip-211-testnet";
import BOUND_VALIDATOR_ABI from "./abi/boundValidator.json";
import PROXY_ADMIN_ABI from "./abi/proxyAdmin.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";

const RESILIENT_ORACLE_PROXY = "0x3cD69251D04A28d887Ac14cbe2E14c52F3D57823";
const NEW_RESILIENT_ORACLE_IMPLEMENTATION = "0x35cC3b99985F9d970aEcc9BD83d5Ac78a074a896";
const OLD_RESILIENT_ORACLE_IMPLEMENTATION = "0xF53cFE89b4c3eFCbdd9aF712e94017454d43c181";
const DEFAULT_PROXY_ADMIN = "0xef480a5654b231ff7d80A0681F938f3Db71a6Ca6";
const BOUND_VALIDATOR_PROXY = "0x2842140e4Ad3a92e9af30e27e290300dd785076d";
const ACM = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";
const VBNB_ADDRESS = "0x2E7222e51c0f6e98610A1543Aa3836E092CDe62c";
const VAI_ADDRESS = "0x5fFbE5302BadED40941A403228E6AD03f93752d9";
const TRX = "0x7D21841DC10BA1C5797951EFc62fADBBDD06704B";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const CHAINLINK_ORACLE = "0xCeA29f1266e880A1482c06eD656cD08C148BaA32";

forking(34311500, async () => {
  const provider = ethers.provider;
  let resilientOracle: Contract;
  let defaultProxyAdmin: Contract;
  let boundValidator: Contract;

  before(async () => {
    await impersonateAccount(NORMAL_TIMELOCK);
    const timelock = await ethers.getSigner(NORMAL_TIMELOCK);

    resilientOracle = new ethers.Contract(RESILIENT_ORACLE_PROXY, RESILIENT_ORACLE_ABI, timelock);
    boundValidator = new ethers.Contract(BOUND_VALIDATOR_PROXY, BOUND_VALIDATOR_ABI, timelock);
    defaultProxyAdmin = new ethers.Contract(DEFAULT_PROXY_ADMIN, PROXY_ADMIN_ABI, provider);
  });

  describe("Pre-VIP behavior", () => {
    it("ResilientOracle proxy should have old implementation", async () => {
      const implementation = await defaultProxyAdmin.getProxyImplementation(RESILIENT_ORACLE_PROXY);
      expect(implementation).to.equal(OLD_RESILIENT_ORACLE_IMPLEMENTATION);
    });
  });

  testVip("vip211Testnet", await vip211(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [RESILIENT_ORACLE_ABI], ["Upgraded"], [1]);
    },
  });

  describe("Post-VIP behavior", () => {
    it("ResilientOracle proxy should have new implementation", async () => {
      const implementation = await defaultProxyAdmin.getProxyImplementation(RESILIENT_ORACLE_PROXY);
      expect(implementation).to.equal(NEW_RESILIENT_ORACLE_IMPLEMENTATION);
    });

    it("ResilientOracle should point to correct dependencies", async () => {
      expect(await resilientOracle.boundValidator()).to.equal(BOUND_VALIDATOR_PROXY);
      expect(await resilientOracle.vBnb()).to.equal(VBNB_ADDRESS);
      expect(await resilientOracle.vai()).to.equal(VAI_ADDRESS);
      expect(await resilientOracle.accessControlManager()).to.equal(ACM);
    });

    it("Should return a valid price", async () => {
      expect(await resilientOracle.getPrice(TRX)).to.not.equal(0);
      expect(await resilientOracle.getUnderlyingPrice(VBNB_ADDRESS)).to.not.equal(0);
    });

    describe("BoundValidator behavior", () => {
      before(async () => {
        await resilientOracle.setOracle(TRX, CHAINLINK_ORACLE, 1); // Set Chainlink as the Pivot oracle for TRX
        await resilientOracle.enableOracle(TRX, 1, true); // Enable the Pivot Oracle for TRX
      });

      it("Inside the limits", async () => {
        await boundValidator.setValidateConfig({
          asset: TRX,
          upperBoundRatio: parseUnits("1.1", 18),
          lowerBoundRatio: parseUnits("0.9", 18),
        });

        expect(await resilientOracle.getPrice(TRX)).to.not.equal(0);
      });

      it("Outside the limits", async () => {
        await boundValidator.setValidateConfig({
          asset: TRX,
          upperBoundRatio: parseUnits("2", 18),
          lowerBoundRatio: parseUnits("1.1", 18),
        });

        await expect(resilientOracle.getPrice(TRX)).to.be.reverted;
      });
    });
  });
});
