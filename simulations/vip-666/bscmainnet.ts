import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES, ZERO_ADDRESS } from "src/networkAddresses";
import { expectEvents, setMaxStalePeriodInChainlinkOracle, setRedstonePrice } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  BOUND_VALIDATOR,
  EXISTING_USDE_FALLBACK_ORACLE,
  EXISTING_USDE_MAIN_ORACLE,
  MAX_STALE_PERIOD,
  PRICE_LOWER_BOUND,
  PRICE_UPPER_BOUND,
  USDT_CHAINLINK_ORACLE,
  USDe,
  sUSDe,
  vPT_USDe_30Oct2025,
  vUSDe,
  vip666,
  vsUSDe,
} from "../../vips/vip-666/vip-666";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/accessControlManager.json";
import BOUND_VALIDATOR_ABI from "./abi/boundValidator.json";
import CHAINLINK_ORACLE_ABI from "./abi/chainlinkOracle.json";
import UNITROLLER_ABI from "./abi/comptroller.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";

forking(64569840, async () => {
  let accessControlManager: Contract;
  let resilientOracle: Contract;
  let usdtChainlinkOracle: Contract;
  let boundValidator: Contract;
  let existingUSDeMainOracle: Contract;
  let unitroller: Contract;

  before(async () => {
    await impersonateAccount(NETWORK_ADDRESSES.bscmainnet.NORMAL_TIMELOCK);
    const timelock = await ethers.getSigner(NETWORK_ADDRESSES.bscmainnet.NORMAL_TIMELOCK);

    accessControlManager = new ethers.Contract(
      NETWORK_ADDRESSES.bscmainnet.ACCESS_CONTROL_MANAGER,
      ACCESS_CONTROL_MANAGER_ABI,
      timelock,
    );
    resilientOracle = new ethers.Contract(
      NETWORK_ADDRESSES.bscmainnet.RESILIENT_ORACLE,
      RESILIENT_ORACLE_ABI,
      timelock,
    );
    usdtChainlinkOracle = new ethers.Contract(USDT_CHAINLINK_ORACLE, CHAINLINK_ORACLE_ABI, timelock);
    boundValidator = new ethers.Contract(BOUND_VALIDATOR, BOUND_VALIDATOR_ABI, timelock);
    existingUSDeMainOracle = new ethers.Contract(EXISTING_USDE_MAIN_ORACLE, CHAINLINK_ORACLE_ABI, timelock);
    unitroller = new ethers.Contract(NETWORK_ADDRESSES.bscmainnet.UNITROLLER, UNITROLLER_ABI, timelock);

    // Call function with default feed = AddressZero (so it fetches from oracle.tokenConfigs)
    await setRedstonePrice(
      NETWORK_ADDRESSES.bscmainnet.REDSTONE_ORACLE,
      USDe,
      ethers.constants.AddressZero,
      NETWORK_ADDRESSES.bscmainnet.NORMAL_TIMELOCK,
    );

    await setMaxStalePeriodInChainlinkOracle(
      NETWORK_ADDRESSES.bscmainnet.CHAINLINK_ORACLE,
      sUSDe,
      ethers.constants.AddressZero,
      NETWORK_ADDRESSES.bscmainnet.NORMAL_TIMELOCK,
      315360000,
    );

    await setMaxStalePeriodInChainlinkOracle(
      NETWORK_ADDRESSES.bscmainnet.REDSTONE_ORACLE,
      sUSDe,
      ethers.constants.AddressZero,
      NETWORK_ADDRESSES.bscmainnet.NORMAL_TIMELOCK,
      315360000,
    );
  });

  describe("Pre-VIP behavior", () => {
    it("USDT Chainlink Oracle shouldn't have permission set before the VIP", async () => {
      expect(
        await accessControlManager.hasRole(
          ethers.utils.keccak256(
            ethers.utils.solidityPack(
              ["address", "string"],
              [USDT_CHAINLINK_ORACLE, "setDirectPrice(address,uint256)"],
            ),
          ),
          NETWORK_ADDRESSES.bscmainnet.NORMAL_TIMELOCK,
        ),
      ).to.equal(false);

      expect(
        await accessControlManager.hasRole(
          ethers.utils.keccak256(
            ethers.utils.solidityPack(
              ["address", "string"],
              [USDT_CHAINLINK_ORACLE, "setDirectPrice(address,uint256)"],
            ),
          ),
          NETWORK_ADDRESSES.bscmainnet.FAST_TRACK_TIMELOCK,
        ),
      ).to.equal(false);

      expect(
        await accessControlManager.hasRole(
          ethers.utils.keccak256(
            ethers.utils.solidityPack(
              ["address", "string"],
              [USDT_CHAINLINK_ORACLE, "setDirectPrice(address,uint256)"],
            ),
          ),
          NETWORK_ADDRESSES.bscmainnet.CRITICAL_TIMELOCK,
        ),
      ).to.equal(false);

      expect(
        await accessControlManager.hasRole(
          ethers.utils.keccak256(
            ethers.utils.solidityPack(["address", "string"], [USDT_CHAINLINK_ORACLE, "setTokenConfig(TokenConfig)"]),
          ),
          NETWORK_ADDRESSES.bscmainnet.NORMAL_TIMELOCK,
        ),
      ).to.equal(false);

      expect(
        await accessControlManager.hasRole(
          ethers.utils.keccak256(
            ethers.utils.solidityPack(["address", "string"], [USDT_CHAINLINK_ORACLE, "setTokenConfig(TokenConfig)"]),
          ),
          NETWORK_ADDRESSES.bscmainnet.FAST_TRACK_TIMELOCK,
        ),
      ).to.equal(false);

      expect(
        await accessControlManager.hasRole(
          ethers.utils.keccak256(
            ethers.utils.solidityPack(["address", "string"], [USDT_CHAINLINK_ORACLE, "setTokenConfig(TokenConfig)"]),
          ),
          NETWORK_ADDRESSES.bscmainnet.CRITICAL_TIMELOCK,
        ),
      ).to.equal(false);
    });

    it("USDT Chainlink Oracle should have correct pending owner and empty config", async () => {
      expect(await usdtChainlinkOracle.pendingOwner()).to.equal(NETWORK_ADDRESSES.bscmainnet.NORMAL_TIMELOCK);
      const tokenConfigs = await usdtChainlinkOracle.tokenConfigs(USDe);
      expect(tokenConfigs[0]).to.equal(ZERO_ADDRESS);
      expect(tokenConfigs[1]).to.equal(ZERO_ADDRESS);
      expect(tokenConfigs[2]).to.equal(0n);
    });

    it("Check the before state of the ResilientOracle for USDe", async () => {
      // existing validate config check
      const validateConfigs = await boundValidator.validateConfigs(USDe);
      expect(validateConfigs[0]).to.equal(USDe);
      expect(validateConfigs[1]).to.equal(parseUnits("1.01", 18));
      expect(validateConfigs[2]).to.equal(parseUnits("0.99", 18));

      // token config check
      const tokenConfigs = await resilientOracle.getTokenConfig(USDe);
      expect(tokenConfigs[0]).to.equal(USDe);
      expect(tokenConfigs[1]).to.have.same.members([
        EXISTING_USDE_MAIN_ORACLE,
        EXISTING_USDE_FALLBACK_ORACLE,
        EXISTING_USDE_FALLBACK_ORACLE,
      ]);
      expect(tokenConfigs[2]).to.have.same.members([true, true, true]);
      expect(tokenConfigs[3]).to.equal(false);
    });

    it("Check the before state of risk params for sUSDe, USDe, PT_USDe", async () => {
      let info = await unitroller.poolMarkets(1, vsUSDe);
      expect(info.collateralFactorMantissa).to.equal(parseUnits("0.89", 18));
      expect(info.liquidationThresholdMantissa).to.equal(parseUnits("0.91", 18));

      info = await unitroller.poolMarkets(1, vUSDe);
      expect(info.collateralFactorMantissa).to.equal(parseUnits("0.90", 18));
      expect(info.liquidationThresholdMantissa).to.equal(parseUnits("0.92", 18));

      info = await unitroller.poolMarkets(1, vPT_USDe_30Oct2025);
      expect(info.collateralFactorMantissa).to.equal(parseUnits("0.90", 18));
      expect(info.liquidationThresholdMantissa).to.equal(parseUnits("0.92", 18));
    });
  });

  testVip("vip666Testnet", await vip666(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["RoleGranted"], [6]);
      await expectEvents(txResponse, [CHAINLINK_ORACLE_ABI], ["OwnershipTransferred"], [1]);
      await expectEvents(txResponse, [CHAINLINK_ORACLE_ABI], ["TokenConfigAdded"], [1]);
      await expectEvents(txResponse, [BOUND_VALIDATOR_ABI], ["ValidateConfigAdded"], [1]);
      await expectEvents(txResponse, [RESILIENT_ORACLE_ABI], ["OracleSet"], [3]);

      await expectEvents(txResponse, [UNITROLLER_ABI], ["NewCollateralFactor"], [2]);
      await expectEvents(txResponse, [UNITROLLER_ABI], ["NewLiquidationThreshold"], [3]);
    },
  });

  describe("Post-VIP behavior", () => {
    it("USDT Chainlink Oracle shouldn already have permission set properly", async () => {
      expect(
        await accessControlManager.hasRole(
          ethers.utils.keccak256(
            ethers.utils.solidityPack(
              ["address", "string"],
              [USDT_CHAINLINK_ORACLE, "setDirectPrice(address,uint256)"],
            ),
          ),
          NETWORK_ADDRESSES.bscmainnet.NORMAL_TIMELOCK,
        ),
      ).to.equal(true);

      expect(
        await accessControlManager.hasRole(
          ethers.utils.keccak256(
            ethers.utils.solidityPack(
              ["address", "string"],
              [USDT_CHAINLINK_ORACLE, "setDirectPrice(address,uint256)"],
            ),
          ),
          NETWORK_ADDRESSES.bscmainnet.FAST_TRACK_TIMELOCK,
        ),
      ).to.equal(true);

      expect(
        await accessControlManager.hasRole(
          ethers.utils.keccak256(
            ethers.utils.solidityPack(
              ["address", "string"],
              [USDT_CHAINLINK_ORACLE, "setDirectPrice(address,uint256)"],
            ),
          ),
          NETWORK_ADDRESSES.bscmainnet.CRITICAL_TIMELOCK,
        ),
      ).to.equal(true);

      expect(
        await accessControlManager.hasRole(
          ethers.utils.keccak256(
            ethers.utils.solidityPack(["address", "string"], [USDT_CHAINLINK_ORACLE, "setTokenConfig(TokenConfig)"]),
          ),
          NETWORK_ADDRESSES.bscmainnet.NORMAL_TIMELOCK,
        ),
      ).to.equal(true);

      expect(
        await accessControlManager.hasRole(
          ethers.utils.keccak256(
            ethers.utils.solidityPack(["address", "string"], [USDT_CHAINLINK_ORACLE, "setTokenConfig(TokenConfig)"]),
          ),
          NETWORK_ADDRESSES.bscmainnet.FAST_TRACK_TIMELOCK,
        ),
      ).to.equal(true);

      expect(
        await accessControlManager.hasRole(
          ethers.utils.keccak256(
            ethers.utils.solidityPack(["address", "string"], [USDT_CHAINLINK_ORACLE, "setTokenConfig(TokenConfig)"]),
          ),
          NETWORK_ADDRESSES.bscmainnet.CRITICAL_TIMELOCK,
        ),
      ).to.equal(true);
    });

    it("Check the updated owner and tokenConfig", async () => {
      expect(await usdtChainlinkOracle.owner()).to.equal(NETWORK_ADDRESSES.bscmainnet.NORMAL_TIMELOCK);
      const tokenConfigs = await usdtChainlinkOracle.tokenConfigs(USDe);
      expect(tokenConfigs[0]).to.equal(USDe);
      expect(tokenConfigs[1]).to.equal(NETWORK_ADDRESSES.bscmainnet.USDT_CHAINLINK_FEED);
      expect(tokenConfigs[2]).to.equal(MAX_STALE_PERIOD);
    });

    it("Check the after state of the ResilientOracle for USDe", async () => {
      // existing validate config check
      const validateConfigs = await boundValidator.validateConfigs(USDe);
      expect(validateConfigs[0]).to.equal(USDe);
      expect(validateConfigs[1]).to.equal(PRICE_UPPER_BOUND);
      expect(validateConfigs[2]).to.equal(PRICE_LOWER_BOUND);

      // token config check
      const tokenConfigs = await resilientOracle.getTokenConfig(USDe);
      expect(tokenConfigs[0]).to.equal(USDe);
      expect(tokenConfigs[1]).to.have.same.members([
        USDT_CHAINLINK_ORACLE,
        EXISTING_USDE_MAIN_ORACLE,
        EXISTING_USDE_MAIN_ORACLE,
      ]);
      expect(tokenConfigs[2]).to.have.same.members([true, true, true]);
      expect(tokenConfigs[3]).to.equal(false);
    });

    describe("BoundValidator behavior", () => {
      it("Inside the limits", async () => {
        expect(await resilientOracle.getPrice(USDe)).to.not.equal(0);
        await usdtChainlinkOracle.setDirectPrice(USDe, parseUnits("1.05", 18));
        expect(await resilientOracle.getPrice(USDe)).to.equal(parseUnits("1.05", 18));
      });

      it("Outside the limits", async () => {
        // fallback to existing main oracle
        await usdtChainlinkOracle.setDirectPrice(USDe, parseUnits("1.07", 18));
        expect(await resilientOracle.getPrice(USDe)).to.be.equal(await existingUSDeMainOracle.getPrice(USDe));

        usdtChainlinkOracle.setDirectPrice(USDe, parseUnits("0.9", 18));
        expect(await resilientOracle.getPrice(USDe)).to.be.equal(await existingUSDeMainOracle.getPrice(USDe));
      });
    });

    it("Check the updated owner and tokenConfig", async () => {
      expect(await usdtChainlinkOracle.owner()).to.equal(NETWORK_ADDRESSES.bscmainnet.NORMAL_TIMELOCK);
      const tokenConfigs = await usdtChainlinkOracle.tokenConfigs(USDe);
      expect(tokenConfigs[0]).to.equal(USDe);
      expect(tokenConfigs[1]).to.equal(NETWORK_ADDRESSES.bscmainnet.USDT_CHAINLINK_FEED);
      expect(tokenConfigs[2]).to.equal(MAX_STALE_PERIOD);
    });

    it("Check the after state of the ResilientOracle for USDe", async () => {
      // existing validate config check
      const validateConfigs = await boundValidator.validateConfigs(USDe);
      expect(validateConfigs[0]).to.equal(USDe);
      expect(validateConfigs[1]).to.equal(PRICE_UPPER_BOUND);
      expect(validateConfigs[2]).to.equal(PRICE_LOWER_BOUND);

      // token config check
      const tokenConfigs = await resilientOracle.getTokenConfig(USDe);
      expect(tokenConfigs[0]).to.equal(USDe);
      expect(tokenConfigs[1]).to.have.same.members([
        USDT_CHAINLINK_ORACLE,
        EXISTING_USDE_MAIN_ORACLE,
        EXISTING_USDE_MAIN_ORACLE,
      ]);
      expect(tokenConfigs[2]).to.have.same.members([true, true, true]);
      expect(tokenConfigs[3]).to.equal(false);
    });

    it("ResilientOracle should return a valid price for USDe", async () => {
      await setMaxStalePeriodInChainlinkOracle(
        USDT_CHAINLINK_ORACLE,
        USDe,
        ethers.constants.AddressZero,
        NETWORK_ADDRESSES.bscmainnet.NORMAL_TIMELOCK,
        315360000,
      );
      expect(await usdtChainlinkOracle.getPrice(USDe)).to.closeTo(parseUnits("1", 18), parseUnits("0.001", 18));
    });

    describe("BoundValidator behavior", () => {
      it("Inside the limits", async () => {
        expect(await resilientOracle.getPrice(USDe)).to.not.equal(0);
        await usdtChainlinkOracle.setDirectPrice(USDe, parseUnits("1.05", 18));
        expect(await resilientOracle.getPrice(USDe)).to.equal(parseUnits("1.05", 18));
      });

      it("Outside the limits", async () => {
        // fallback to existing main oracle
        await usdtChainlinkOracle.setDirectPrice(USDe, parseUnits("1.07", 18));
        expect(await resilientOracle.getPrice(USDe)).to.be.equal(await existingUSDeMainOracle.getPrice(USDe));

        usdtChainlinkOracle.setDirectPrice(USDe, parseUnits("0.9", 18));
        expect(await resilientOracle.getPrice(USDe)).to.be.equal(await existingUSDeMainOracle.getPrice(USDe));
      });
    });

    it("Check the after state of the Unitroller for vsUSDe, vUSDe, vPT_USDe", async () => {
      let info = await unitroller.poolMarkets(1, vsUSDe);
      expect(info.collateralFactorMantissa).to.equal(parseUnits("0.895", 18));
      expect(info.liquidationThresholdMantissa).to.equal(parseUnits("0.915", 18));

      info = await unitroller.poolMarkets(1, vUSDe);
      expect(info.collateralFactorMantissa).to.equal(parseUnits("0.90", 18));
      expect(info.liquidationThresholdMantissa).to.equal(parseUnits("0.925", 18));

      info = await unitroller.poolMarkets(1, vPT_USDe_30Oct2025);
      expect(info.collateralFactorMantissa).to.equal(parseUnits("0.905", 18));
      expect(info.liquidationThresholdMantissa).to.equal(parseUnits("0.925", 18));
    });
  });
});
