import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents, setMaxStalePeriodInChainlinkOracle } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { vip187 } from "../../../vips/vip-187/vip-187";
import BOUND_VALIDATOR_ABI from "./abi/boundValidator.json";
import PROXY_ADMIN_ABI from "./abi/proxyAdmin.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";

const RESILIENT_ORACLE_PROXY = "0x6592b5DE802159F3E74B2486b091D11a8256ab8A";
const NEW_RESILIENT_ORACLE_IMPLEMENTATION = "0xB5d7A073d77102ad56B7482b18E7204c1a71C8B9";
const OLD_RESILIENT_ORACLE_IMPLEMENTATION = "0x95F9D968867E4fe89A1F768Ce853dB38d70eeC2B";
const DEFAULT_PROXY_ADMIN = "0x1BB765b741A5f3C2A338369DAb539385534E3343";
const BOUND_VALIDATOR_PROXY = "0x6E332fF0bB52475304494E4AE5063c1051c7d735";
const ACM = "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555";
const VBNB_ADDRESS = "0xA07c5b74C9B40447a954e1466938b865b6BBea36";
const VBNB_UNDERLYING = "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB";
const BNB_PRICE_FEED = "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE";
const VAI_ADDRESS = "0x4BD17003473389A42DAF6a0a729f6Fdb328BbBd7";
const TRX = "0xCE7de646e7208a4Ef112cb6ed5038FA6cC6b12e3";
const TRX_PRICE_FEED = "0xF4C5e535756D11994fCBB12Ba8adD0192D9b88be";
const CHAINLINK_ORACLE = "0x1B2103441A0A108daD8848D8F5d790e4D402921F";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";

forking(32739800, () => {
  const provider = ethers.provider;
  let resilientOracle: ethers.Contract;
  let defaultProxyAdmin: ethers.Contract;
  let boundValidator: ethers.Contract;

  before(async () => {
    await impersonateAccount(NORMAL_TIMELOCK);
    const timelock = await ethers.getSigner(NORMAL_TIMELOCK);

    resilientOracle = new ethers.Contract(RESILIENT_ORACLE_PROXY, RESILIENT_ORACLE_ABI, timelock);
    boundValidator = new ethers.Contract(BOUND_VALIDATOR_PROXY, BOUND_VALIDATOR_ABI, timelock);
    defaultProxyAdmin = new ethers.Contract(DEFAULT_PROXY_ADMIN, PROXY_ADMIN_ABI, provider);
    await setMaxStalePeriodInChainlinkOracle(CHAINLINK_ORACLE, TRX, TRX_PRICE_FEED, NORMAL_TIMELOCK);
    await setMaxStalePeriodInChainlinkOracle(CHAINLINK_ORACLE, VBNB_UNDERLYING, BNB_PRICE_FEED, NORMAL_TIMELOCK);
  });

  describe("Pre-VIP behavior", () => {
    it("ResilientOracle proxy should have old implementation", async () => {
      const implementation = await defaultProxyAdmin.getProxyImplementation(RESILIENT_ORACLE_PROXY);
      expect(implementation).to.equal(OLD_RESILIENT_ORACLE_IMPLEMENTATION);
    });
  });

  testVip("vip187Testnet", vip187(), {
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
