import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents, setMaxStalePeriodInChainlinkOracle } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { vip205 } from "../../../vips/vip-205/vip-205";
import BOUND_VALIDATOR_ABI from "./abi/boundValidator.json";
import CHAINLINK_ORACLE_ABI from "./abi/chainlinkOracle.json";
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
const TRX_OLD = "0x85EAC5Ac2F758618dFa09bDbe0cf174e7d574D5B";
const CHAINLINK_TRX_FEED = "0xF4C5e535756D11994fCBB12Ba8adD0192D9b88be";
const REDSTONE_TRX_FEED = "0xa17362dd9ad6d0af646d7c8f8578fddbfc90b916";
const CHAINLINK_ORACLE = "0x1B2103441A0A108daD8848D8F5d790e4D402921F";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const REDSTONE_ORACLE = "0x8455EFA4D7Ff63b8BFD96AdD889483Ea7d39B70a";

const PRICE_LOWER_BOUND = parseUnits("0.99", 18);
const PRICE_UPPER_BOUND = parseUnits("1.01", 18);

forking(33486800, () => {
  const provider = ethers.provider;
  let resilientOracle: ethers.Contract;
  let redStoneOracle: ethers.Contract;
  let defaultProxyAdmin: ethers.Contract;
  let boundValidator: ethers.Contract;
  let preTRXPrice: BigNumber;
  let preTRX_OLDPrice: BigNumber;
  let preBNBPrice: BigNumber;

  before(async () => {
    await impersonateAccount(NORMAL_TIMELOCK);
    const timelock = await ethers.getSigner(NORMAL_TIMELOCK);

    resilientOracle = new ethers.Contract(RESILIENT_ORACLE_PROXY, RESILIENT_ORACLE_ABI, timelock);
    redStoneOracle = new ethers.Contract(REDSTONE_ORACLE, CHAINLINK_ORACLE_ABI, provider);
    boundValidator = new ethers.Contract(BOUND_VALIDATOR_PROXY, BOUND_VALIDATOR_ABI, timelock);
    defaultProxyAdmin = new ethers.Contract(DEFAULT_PROXY_ADMIN, PROXY_ADMIN_ABI, provider);
    await setMaxStalePeriodInChainlinkOracle(CHAINLINK_ORACLE, TRX, REDSTONE_TRX_FEED, NORMAL_TIMELOCK);
    await setMaxStalePeriodInChainlinkOracle(CHAINLINK_ORACLE, TRX_OLD, REDSTONE_TRX_FEED, NORMAL_TIMELOCK);
    await setMaxStalePeriodInChainlinkOracle(CHAINLINK_ORACLE, VBNB_UNDERLYING, BNB_PRICE_FEED, NORMAL_TIMELOCK);
  });

  describe("Pre-VIP behavior", () => {
    it("ResilientOracle proxy should have old implementation", async () => {
      const implementation = await defaultProxyAdmin.getProxyImplementation(RESILIENT_ORACLE_PROXY);
      expect(implementation).to.equal(OLD_RESILIENT_ORACLE_IMPLEMENTATION);
    });
    it("Validate pivot oracle is not set for TRX_OLD", async () => {
      const tokenConfig = await resilientOracle.getTokenConfig(TRX_OLD);
      expect(tokenConfig.oracles[1]).to.equal(ethers.constants.AddressZero);
      expect(tokenConfig.enableFlagsForOracles[1]).to.equal(false);
    });
    it("Validate pivot oracle is not set for TRX", async () => {
      const tokenConfig = await resilientOracle.getTokenConfig(TRX);
      expect(tokenConfig.oracles[1]).to.equal(ethers.constants.AddressZero);
      expect(tokenConfig.enableFlagsForOracles[1]).to.equal(false);
    });
    it("Pending owner of RedStone oracle is Normal Timelock ", async () => {
      const pendingOwner = await redStoneOracle.pendingOwner();
      expect(pendingOwner).to.equal(NORMAL_TIMELOCK);
    });

    describe("Prices", () => {
      it("ResilientOracle should return a valid price for TRX", async () => {
        preTRXPrice = await resilientOracle.getPrice(TRX);
        expect(preTRXPrice).to.not.equal(0);
      });

      it("ResilientOracle should return a valid price for TRX_OLD", async () => {
        preTRX_OLDPrice = await resilientOracle.getPrice(TRX_OLD);
        expect(preTRX_OLDPrice).to.not.equal(0);
      });

      it("ResilientOracle should return a valid price for BNB", async () => {
        preBNBPrice = await resilientOracle.getUnderlyingPrice(VBNB_ADDRESS);
        expect(preBNBPrice).to.not.equal(0);
      });
    });
  });

  testVip("vip205", vip205(24 * 60 * 60 * 365), {
    proposer: "0xc444949e0054a23c44fc45789738bdf64aed2391",
    supporter: "0x55A9f5374Af30E3045FB491f1da3C2E8a74d168D",
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [RESILIENT_ORACLE_ABI], ["Upgraded"], [1]);
      await expectEvents(txResponse, [CHAINLINK_ORACLE_ABI], ["TokenConfigAdded"], [2]);
      await expectEvents(txResponse, [BOUND_VALIDATOR_ABI], ["ValidateConfigAdded"], [2]);
      await expectEvents(txResponse, [RESILIENT_ORACLE_ABI], ["OracleSet"], [2]);
      await expectEvents(txResponse, [RESILIENT_ORACLE_ABI], ["OracleEnabled"], [2]);
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

    it("Owner of RedStone oracle is Normal Timelock ", async () => {
      const owner = await redStoneOracle.owner();
      expect(owner).to.equal(NORMAL_TIMELOCK);
    });
    it("Validate pivot oracle is set for TRX_OLD", async () => {
      const tokenConfig = await resilientOracle.getTokenConfig(TRX_OLD);
      expect(tokenConfig.oracles[1]).to.equal(REDSTONE_ORACLE);
      expect(tokenConfig.enableFlagsForOracles[1]).to.equal(true);
    });
    it("Validate pivot oracle is set for TRX", async () => {
      const tokenConfig = await resilientOracle.getTokenConfig(TRX);
      expect(tokenConfig.oracles[1]).to.equal(REDSTONE_ORACLE);
      expect(tokenConfig.enableFlagsForOracles[1]).to.equal(true);
    });
    it("Validate upper and lower bounds for TRX", async () => {
      const validateConfig = await boundValidator.validateConfigs(TRX);
      expect(validateConfig.upperBoundRatio).to.equal(PRICE_UPPER_BOUND);
      expect(validateConfig.lowerBoundRatio).to.equal(PRICE_LOWER_BOUND);
    });
    it("Validate upper and lower bounds for TRX_OLD", async () => {
      const validateConfig = await boundValidator.validateConfigs(TRX_OLD);
      expect(validateConfig.upperBoundRatio).to.equal(PRICE_UPPER_BOUND);
      expect(validateConfig.lowerBoundRatio).to.equal(PRICE_LOWER_BOUND);
    });

    describe("Prices", () => {
      it("ResilientOracle should return a valid price for BNB", async () => {
        expect(await resilientOracle.getUnderlyingPrice(VBNB_ADDRESS)).to.equal(preBNBPrice);
      });
      
      it("ResilientOracle should return a valid price for TRX", async () => {
        expect(await resilientOracle.getPrice(TRX)).to.equal(preTRXPrice);
      });

      it("ResilientOracle should return a valid price for TRX_OLD", async () => {
        expect(await resilientOracle.getPrice(TRX_OLD)).to.equal(preTRX_OLDPrice);
      });

      it("RedStone should return a valid price for TRX", async () => {
        expect(await redStoneOracle.getPrice(TRX)).to.not.equal(0);
      });

      it("RedStone should return a valid price for TRX_OLD", async () => {
        expect(await redStoneOracle.getPrice(TRX_OLD)).to.not.equal(0);
      });
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
