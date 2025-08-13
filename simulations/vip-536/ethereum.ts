import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip536, {
  NEW_SINGLE_TOKEN_CONVERTER_IMP_ETHEREUM,
  SINGLE_TOKEN_CONVERTER_BEACON_ETHEREUM,
} from "../../vips/vip-536/bscmainnet";
import {
  ConversionAccessibility,
  ETHEREUM_CONVERSION_INCENTIVE,
  TREASURY_CONVERTER,
  TREASURY_CONVERTER_ETHEREUM,
} from "../../vips/vip-536/configuration";
import ACCESS_CONTROLL_MANAGER_ABI from "./abi/AccessControlManager.json";
import BEACON_ABI from "./abi/Beacon.json";
import PSR_ABI from "./abi/ProtocolShareReserve.json";
import CONVERTER_ABI from "./abi/singletokenconverter.json";

const { ethereum } = NETWORK_ADDRESSES;

const OLD_SINGLE_TOKEN_CONVERTER_IMP_ETHEREUM = "0x95de59aD391589603DF33F81B53C4d894D8e5545";

forking(23017363, async () => {
  const provider = ethers.provider;
  let beacon: Contract;
  let treasuryConverter: Contract;
  let acm: Contract;

  before(async () => {
    beacon = new ethers.Contract(SINGLE_TOKEN_CONVERTER_BEACON_ETHEREUM, BEACON_ABI, provider);
    treasuryConverter = new ethers.Contract(TREASURY_CONVERTER_ETHEREUM, CONVERTER_ABI, provider);
    acm = new ethers.Contract(ethereum.ACCESS_CONTROL_MANAGER, ACCESS_CONTROLL_MANAGER_ABI, provider);
  });

  describe("Pre-VIP behavior", () => {
    it("SingleTokenConverter should have old implementation", async () => {
      expect(await beacon.implementation()).to.equal(OLD_SINGLE_TOKEN_CONVERTER_IMP_ETHEREUM);
    });

    describe("TreasuryConverter", () => {
      it("should have a correct pending owner", async () => {
        expect(await treasuryConverter.pendingOwner()).to.equal(ethereum.NORMAL_TIMELOCK);
      });
    });
  });

  testForkedNetworkVipCommands("VIP-536", await vip536(), {
    callbackAfterExecution: async (txResponse: any) => {
      await expectEvents(
        txResponse,
        [BEACON_ABI, CONVERTER_ABI, PSR_ABI],
        [
          "Upgraded",
          "ConverterNetworkAddressUpdated",
          "ConversionConfigUpdated",
          "DistributionConfigAdded",
          "DistributionConfigUpdated",
          "DistributionConfigRemoved",
        ],
        [1, 1, TREASURY_CONVERTER.ethereum.tokensOut.length, 2, 2, 2],
      );
    },
  });

  describe("Post-VIP behavior", () => {
    it("RiskFundConverter and SingleTokenConverter should have new implementation", async () => {
      expect(await beacon.implementation()).to.equal(NEW_SINGLE_TOKEN_CONVERTER_IMP_ETHEREUM);
    });
    describe("TreasuryConverter", () => {
      it("should not be paused", async () => {
        expect(await treasuryConverter.conversionPaused()).to.be.false;
      });

      it("should have Treasury as destination for conversion", async () => {
        expect(await treasuryConverter.destinationAddress()).to.equal(ethereum.VTREASURY);
      });

      it("should have correct owner", async () => {
        expect(await treasuryConverter.owner()).to.equal(ethereum.NORMAL_TIMELOCK);
      });

      it("should have correct converters network address", async () => {
        expect(await treasuryConverter.converterNetwork()).to.equal(TREASURY_CONVERTER.ethereum.converterNetwork);
      });

      it("should have correct conversion configuration", async () => {
        const { tokenIn, whitelistedTokens: tokenOuts } = TREASURY_CONVERTER.ethereum;

        for (const tokenOut of tokenOuts) {
          const config = await treasuryConverter.conversionConfigurations(tokenIn, tokenOut);

          expect(config.incentive).to.equal(ETHEREUM_CONVERSION_INCENTIVE);
          expect(config.conversionAccess).to.equal(ConversionAccessibility.ALL);
        }
      });

      it("guardian should have all permissions to call TreasuryConverter", async () => {
        const pauseConversionRole = ethers.utils.solidityPack(
          ["address", "string"],
          [TREASURY_CONVERTER_ETHEREUM, "pauseConversion()"],
        );
        const pauseConversionRoleHash = ethers.utils.keccak256(pauseConversionRole);
        expect(await acm.hasRole(pauseConversionRoleHash, ethereum.GUARDIAN)).to.be.true;

        const resumeConversionRole = ethers.utils.solidityPack(
          ["address", "string"],
          [TREASURY_CONVERTER_ETHEREUM, "resumeConversion()"],
        );
        const resumeConversionRoleHash = ethers.utils.keccak256(resumeConversionRole);
        expect(await acm.hasRole(resumeConversionRoleHash, ethereum.GUARDIAN)).to.be.true;

        const setMinAmountToConvertRole = ethers.utils.solidityPack(
          ["address", "string"],
          [TREASURY_CONVERTER_ETHEREUM, "setMinAmountToConvert(uint256)"],
        );
        const setMinAmountToConvertRoleHash = ethers.utils.keccak256(setMinAmountToConvertRole);
        expect(await acm.hasRole(setMinAmountToConvertRoleHash, ethereum.GUARDIAN)).to.be.true;

        const setConversionConfigRole = ethers.utils.solidityPack(
          ["address", "string"],
          [TREASURY_CONVERTER_ETHEREUM, "setConversionConfig(address,address,ConversionConfig)"],
        );
        const setConversionConfigRoleHash = ethers.utils.keccak256(setConversionConfigRole);
        expect(await acm.hasRole(setConversionConfigRoleHash, ethereum.GUARDIAN)).to.be.true;
      });

      it("Regular timelock should have true permissions to call TreasuryConverter", async () => {
        const pauseConversionRole = ethers.utils.solidityPack(
          ["address", "string"],
          [TREASURY_CONVERTER_ETHEREUM, "pauseConversion()"],
        );
        const pauseConversionRoleHash = ethers.utils.keccak256(pauseConversionRole);
        expect(await acm.hasRole(pauseConversionRoleHash, ethereum.NORMAL_TIMELOCK)).to.be.true;

        const resumeConversionRole = ethers.utils.solidityPack(
          ["address", "string"],
          [TREASURY_CONVERTER_ETHEREUM, "resumeConversion()"],
        );
        const resumeConversionRoleHash = ethers.utils.keccak256(resumeConversionRole);
        expect(await acm.hasRole(resumeConversionRoleHash, ethereum.NORMAL_TIMELOCK)).to.be.true;

        const setMinAmountToConvertRole = ethers.utils.solidityPack(
          ["address", "string"],
          [TREASURY_CONVERTER_ETHEREUM, "setMinAmountToConvert(uint256)"],
        );
        const setMinAmountToConvertRoleHash = ethers.utils.keccak256(setMinAmountToConvertRole);
        expect(await acm.hasRole(setMinAmountToConvertRoleHash, ethereum.NORMAL_TIMELOCK)).to.be.true;

        const setConversionConfigRole = ethers.utils.solidityPack(
          ["address", "string"],
          [TREASURY_CONVERTER_ETHEREUM, "setConversionConfig(address,address,ConversionConfig)"],
        );
        const setConversionConfigRoleHash = ethers.utils.keccak256(setConversionConfigRole);
        expect(await acm.hasRole(setConversionConfigRoleHash, ethereum.NORMAL_TIMELOCK)).to.be.true;
      });

      it("Fast Track timelock should have true permissions to call TreasuryConverter", async () => {
        const pauseConversionRole = ethers.utils.solidityPack(
          ["address", "string"],
          [TREASURY_CONVERTER_ETHEREUM, "pauseConversion()"],
        );
        const pauseConversionRoleHash = ethers.utils.keccak256(pauseConversionRole);
        expect(await acm.hasRole(pauseConversionRoleHash, ethereum.FAST_TRACK_TIMELOCK)).to.be.true;

        const resumeConversionRole = ethers.utils.solidityPack(
          ["address", "string"],
          [TREASURY_CONVERTER_ETHEREUM, "resumeConversion()"],
        );
        const resumeConversionRoleHash = ethers.utils.keccak256(resumeConversionRole);
        expect(await acm.hasRole(resumeConversionRoleHash, ethereum.FAST_TRACK_TIMELOCK)).to.be.true;

        const setMinAmountToConvertRole = ethers.utils.solidityPack(
          ["address", "string"],
          [TREASURY_CONVERTER_ETHEREUM, "setMinAmountToConvert(uint256)"],
        );
        const setMinAmountToConvertRoleHash = ethers.utils.keccak256(setMinAmountToConvertRole);
        expect(await acm.hasRole(setMinAmountToConvertRoleHash, ethereum.FAST_TRACK_TIMELOCK)).to.be.true;

        const setConversionConfigRole = ethers.utils.solidityPack(
          ["address", "string"],
          [TREASURY_CONVERTER_ETHEREUM, "setConversionConfig(address,address,ConversionConfig)"],
        );
        const setConversionConfigRoleHash = ethers.utils.keccak256(setConversionConfigRole);
        expect(await acm.hasRole(setConversionConfigRoleHash, ethereum.FAST_TRACK_TIMELOCK)).to.be.true;
      });

      it("Critical timelock should have true permissions to call TreasuryConverter", async () => {
        const pauseConversionRole = ethers.utils.solidityPack(
          ["address", "string"],
          [TREASURY_CONVERTER_ETHEREUM, "pauseConversion()"],
        );
        const pauseConversionRoleHash = ethers.utils.keccak256(pauseConversionRole);
        expect(await acm.hasRole(pauseConversionRoleHash, ethereum.CRITICAL_TIMELOCK)).to.be.true;

        const resumeConversionRole = ethers.utils.solidityPack(
          ["address", "string"],
          [TREASURY_CONVERTER_ETHEREUM, "resumeConversion()"],
        );
        const resumeConversionRoleHash = ethers.utils.keccak256(resumeConversionRole);
        expect(await acm.hasRole(resumeConversionRoleHash, ethereum.CRITICAL_TIMELOCK)).to.be.true;

        const setMinAmountToConvertRole = ethers.utils.solidityPack(
          ["address", "string"],
          [TREASURY_CONVERTER_ETHEREUM, "setMinAmountToConvert(uint256)"],
        );
        const setMinAmountToConvertRoleHash = ethers.utils.keccak256(setMinAmountToConvertRole);
        expect(await acm.hasRole(setMinAmountToConvertRoleHash, ethereum.CRITICAL_TIMELOCK)).to.be.true;

        const setConversionConfigRole = ethers.utils.solidityPack(
          ["address", "string"],
          [TREASURY_CONVERTER_ETHEREUM, "setConversionConfig(address,address,ConversionConfig)"],
        );
        const setConversionConfigRoleHash = ethers.utils.keccak256(setConversionConfigRole);
        expect(await acm.hasRole(setConversionConfigRoleHash, ethereum.CRITICAL_TIMELOCK)).to.be.true;
      });
    });
  });
});
