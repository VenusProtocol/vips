import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip536, {
  NEW_SINGLE_TOKEN_CONVERTER_IMP_ARBITRUM,
  SINGLE_TOKEN_CONVERTER_BEACON_ARBITRUM,
} from "../../vips/vip-536/bscmainnet";
import {
  ARBITRUM_CONVERSION_INCENTIVE,
  ConversionAccessibility,
  TREASURY_CONVERTER,
  TREASURY_CONVERTER_ARBITRUM,
} from "../../vips/vip-536/configuration";
import ACCESS_CONTROLL_MANAGER_ABI from "./abi/AccessControlManager.json";
import BEACON_ABI from "./abi/Beacon.json";
import PSR_ABI from "./abi/ProtocolShareReserve.json";
import CONVERTER_ABI from "./abi/singletokenconverter.json";

const { arbitrumone } = NETWORK_ADDRESSES;

const OLD_SINGLE_TOKEN_CONVERTER_IMP_ARBITRUM = "0x07801d54906Be49517DfDEd26c89A81fb94e504B";

forking(362442798, async () => {
  const provider = ethers.provider;
  let beacon: Contract;
  let treasuryConverter: Contract;
  let acm: Contract;

  before(async () => {
    beacon = new ethers.Contract(SINGLE_TOKEN_CONVERTER_BEACON_ARBITRUM, BEACON_ABI, provider);
    treasuryConverter = new ethers.Contract(TREASURY_CONVERTER_ARBITRUM, CONVERTER_ABI, provider);
    acm = new ethers.Contract(arbitrumone.ACCESS_CONTROL_MANAGER, ACCESS_CONTROLL_MANAGER_ABI, provider);
  });

  describe("Pre-VIP behavior", () => {
    it("SingleTokenConverter should have old implementation", async () => {
      expect(await beacon.implementation()).to.equal(OLD_SINGLE_TOKEN_CONVERTER_IMP_ARBITRUM);
    });

    describe("TreasuryConverter", () => {
      it("should have a correct pending owner", async () => {
        expect(await treasuryConverter.pendingOwner()).to.equal(arbitrumone.NORMAL_TIMELOCK);
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
          "DistributionConfigRemoved",
        ],
        [1, 1, TREASURY_CONVERTER.arbitrumone.tokensOut.length, 4, 2],
      );
    },
  });

  describe("Post-VIP behavior", () => {
    it("SingleTokenConverter should have new implementation", async () => {
      expect(await beacon.implementation()).to.equal(NEW_SINGLE_TOKEN_CONVERTER_IMP_ARBITRUM);
    });
    describe("TreasuryConverter", () => {
      it("should not be paused", async () => {
        expect(await treasuryConverter.conversionPaused()).to.be.false;
      });

      it("should have Treasury as destination for conversion", async () => {
        expect(await treasuryConverter.destinationAddress()).to.equal(arbitrumone.VTREASURY);
      });

      it("should have correct owner", async () => {
        expect(await treasuryConverter.owner()).to.equal(arbitrumone.NORMAL_TIMELOCK);
      });

      it("should have correct converters network address", async () => {
        expect(await treasuryConverter.converterNetwork()).to.equal(TREASURY_CONVERTER.arbitrumone.converterNetwork);
      });

      it("should have correct conversion configuration", async () => {
        const { tokenIn, whitelistedTokens: tokenOuts } = TREASURY_CONVERTER.arbitrumone;

        for (const tokenOut of tokenOuts) {
          const config = await treasuryConverter.conversionConfigurations(tokenIn, tokenOut);

          expect(config.incentive).to.equal(ARBITRUM_CONVERSION_INCENTIVE);
          expect(config.conversionAccess).to.equal(ConversionAccessibility.ALL);
        }
      });

      it("guardian should have all permissions to call TreasuryConverter", async () => {
        const pauseConversionRole = ethers.utils.solidityPack(
          ["address", "string"],
          [TREASURY_CONVERTER_ARBITRUM, "pauseConversion()"],
        );
        const pauseConversionRoleHash = ethers.utils.keccak256(pauseConversionRole);
        expect(await acm.hasRole(pauseConversionRoleHash, arbitrumone.GUARDIAN)).to.be.true;

        const resumeConversionRole = ethers.utils.solidityPack(
          ["address", "string"],
          [TREASURY_CONVERTER_ARBITRUM, "resumeConversion()"],
        );
        const resumeConversionRoleHash = ethers.utils.keccak256(resumeConversionRole);
        expect(await acm.hasRole(resumeConversionRoleHash, arbitrumone.GUARDIAN)).to.be.true;

        const setMinAmountToConvertRole = ethers.utils.solidityPack(
          ["address", "string"],
          [TREASURY_CONVERTER_ARBITRUM, "setMinAmountToConvert(uint256)"],
        );
        const setMinAmountToConvertRoleHash = ethers.utils.keccak256(setMinAmountToConvertRole);
        expect(await acm.hasRole(setMinAmountToConvertRoleHash, arbitrumone.GUARDIAN)).to.be.true;

        const setConversionConfigRole = ethers.utils.solidityPack(
          ["address", "string"],
          [TREASURY_CONVERTER_ARBITRUM, "setConversionConfig(address,address,ConversionConfig)"],
        );
        const setConversionConfigRoleHash = ethers.utils.keccak256(setConversionConfigRole);
        expect(await acm.hasRole(setConversionConfigRoleHash, arbitrumone.GUARDIAN)).to.be.true;
      });

      it("Regular timelock should have true permissions to call TreasuryConverter", async () => {
        const pauseConversionRole = ethers.utils.solidityPack(
          ["address", "string"],
          [TREASURY_CONVERTER_ARBITRUM, "pauseConversion()"],
        );
        const pauseConversionRoleHash = ethers.utils.keccak256(pauseConversionRole);
        expect(await acm.hasRole(pauseConversionRoleHash, arbitrumone.NORMAL_TIMELOCK)).to.be.true;

        const resumeConversionRole = ethers.utils.solidityPack(
          ["address", "string"],
          [TREASURY_CONVERTER_ARBITRUM, "resumeConversion()"],
        );
        const resumeConversionRoleHash = ethers.utils.keccak256(resumeConversionRole);
        expect(await acm.hasRole(resumeConversionRoleHash, arbitrumone.NORMAL_TIMELOCK)).to.be.true;

        const setMinAmountToConvertRole = ethers.utils.solidityPack(
          ["address", "string"],
          [TREASURY_CONVERTER_ARBITRUM, "setMinAmountToConvert(uint256)"],
        );
        const setMinAmountToConvertRoleHash = ethers.utils.keccak256(setMinAmountToConvertRole);
        expect(await acm.hasRole(setMinAmountToConvertRoleHash, arbitrumone.NORMAL_TIMELOCK)).to.be.true;

        const setConversionConfigRole = ethers.utils.solidityPack(
          ["address", "string"],
          [TREASURY_CONVERTER_ARBITRUM, "setConversionConfig(address,address,ConversionConfig)"],
        );
        const setConversionConfigRoleHash = ethers.utils.keccak256(setConversionConfigRole);
        expect(await acm.hasRole(setConversionConfigRoleHash, arbitrumone.NORMAL_TIMELOCK)).to.be.true;
      });

      it("Fast Track timelock should have true permissions to call TreasuryConverter", async () => {
        const pauseConversionRole = ethers.utils.solidityPack(
          ["address", "string"],
          [TREASURY_CONVERTER_ARBITRUM, "pauseConversion()"],
        );
        const pauseConversionRoleHash = ethers.utils.keccak256(pauseConversionRole);
        expect(await acm.hasRole(pauseConversionRoleHash, arbitrumone.FAST_TRACK_TIMELOCK)).to.be.true;

        const resumeConversionRole = ethers.utils.solidityPack(
          ["address", "string"],
          [TREASURY_CONVERTER_ARBITRUM, "resumeConversion()"],
        );
        const resumeConversionRoleHash = ethers.utils.keccak256(resumeConversionRole);
        expect(await acm.hasRole(resumeConversionRoleHash, arbitrumone.FAST_TRACK_TIMELOCK)).to.be.true;

        const setMinAmountToConvertRole = ethers.utils.solidityPack(
          ["address", "string"],
          [TREASURY_CONVERTER_ARBITRUM, "setMinAmountToConvert(uint256)"],
        );
        const setMinAmountToConvertRoleHash = ethers.utils.keccak256(setMinAmountToConvertRole);
        expect(await acm.hasRole(setMinAmountToConvertRoleHash, arbitrumone.FAST_TRACK_TIMELOCK)).to.be.true;

        const setConversionConfigRole = ethers.utils.solidityPack(
          ["address", "string"],
          [TREASURY_CONVERTER_ARBITRUM, "setConversionConfig(address,address,ConversionConfig)"],
        );
        const setConversionConfigRoleHash = ethers.utils.keccak256(setConversionConfigRole);
        expect(await acm.hasRole(setConversionConfigRoleHash, arbitrumone.FAST_TRACK_TIMELOCK)).to.be.true;
      });

      it("Critical timelock should have true permissions to call TreasuryConverter", async () => {
        const pauseConversionRole = ethers.utils.solidityPack(
          ["address", "string"],
          [TREASURY_CONVERTER_ARBITRUM, "pauseConversion()"],
        );
        const pauseConversionRoleHash = ethers.utils.keccak256(pauseConversionRole);
        expect(await acm.hasRole(pauseConversionRoleHash, arbitrumone.CRITICAL_TIMELOCK)).to.be.true;

        const resumeConversionRole = ethers.utils.solidityPack(
          ["address", "string"],
          [TREASURY_CONVERTER_ARBITRUM, "resumeConversion()"],
        );
        const resumeConversionRoleHash = ethers.utils.keccak256(resumeConversionRole);
        expect(await acm.hasRole(resumeConversionRoleHash, arbitrumone.CRITICAL_TIMELOCK)).to.be.true;

        const setMinAmountToConvertRole = ethers.utils.solidityPack(
          ["address", "string"],
          [TREASURY_CONVERTER_ARBITRUM, "setMinAmountToConvert(uint256)"],
        );
        const setMinAmountToConvertRoleHash = ethers.utils.keccak256(setMinAmountToConvertRole);
        expect(await acm.hasRole(setMinAmountToConvertRoleHash, arbitrumone.CRITICAL_TIMELOCK)).to.be.true;

        const setConversionConfigRole = ethers.utils.solidityPack(
          ["address", "string"],
          [TREASURY_CONVERTER_ARBITRUM, "setConversionConfig(address,address,ConversionConfig)"],
        );
        const setConversionConfigRoleHash = ethers.utils.keccak256(setConversionConfigRole);
        expect(await acm.hasRole(setConversionConfigRoleHash, arbitrumone.CRITICAL_TIMELOCK)).to.be.true;
      });
    });
  });
});
