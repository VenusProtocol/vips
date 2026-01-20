import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import {
  SEPOLIA_PSR,
  SEPOLIA_USDC_PRIME_CONVERTER,
  SEPOLIA_USDT_PRIME_CONVERTER,
  SEPOLIA_WBTC_PRIME_CONVERTER,
  SEPOLIA_WETH_PRIME_CONVERTER,
  SEPOLIA_XVS_VAULT_CONVERTER,
  vip590,
} from "../../vips/vip-590/bsctestnet";
import PSR_ABI from "./abi/ProtocolShareReserve.json";

const { sepolia } = NETWORK_ADDRESSES;
const VTREASURY = sepolia.VTREASURY;

const oldProtocolPercentage = [
  [SEPOLIA_USDC_PRIME_CONVERTER, 200],
  [SEPOLIA_USDT_PRIME_CONVERTER, 200],
  [SEPOLIA_WBTC_PRIME_CONVERTER, 100],
  [SEPOLIA_WETH_PRIME_CONVERTER, 1500],
  [SEPOLIA_XVS_VAULT_CONVERTER, 2000],
  [VTREASURY, 6000],
];

const oldAdditionalPercentage = [
  [SEPOLIA_USDC_PRIME_CONVERTER, 0],
  [SEPOLIA_USDT_PRIME_CONVERTER, 0],
  [SEPOLIA_WBTC_PRIME_CONVERTER, 0],
  [SEPOLIA_WETH_PRIME_CONVERTER, 0],
  [SEPOLIA_XVS_VAULT_CONVERTER, 2000],
  [VTREASURY, 8000],
];

const newProtocolPercentage = [
  [SEPOLIA_USDC_PRIME_CONVERTER, 0],
  [SEPOLIA_USDT_PRIME_CONVERTER, 0],
  [SEPOLIA_WBTC_PRIME_CONVERTER, 0],
  [SEPOLIA_WETH_PRIME_CONVERTER, 0],
  [VTREASURY, 10000],
];

const newAdditionalPercentage = [
  [SEPOLIA_USDC_PRIME_CONVERTER, 0],
  [SEPOLIA_USDT_PRIME_CONVERTER, 0],
  [SEPOLIA_WBTC_PRIME_CONVERTER, 0],
  [SEPOLIA_WETH_PRIME_CONVERTER, 0],
  [VTREASURY, 10000],
];

forking(10084609, async () => {
  let psr: Contract;

  before(async () => {
    psr = await ethers.getContractAt(PSR_ABI, SEPOLIA_PSR);
  });

  describe("Pre-VIP behaviour", async () => {
    it("check ProtocolShareReserve distribution configs before VIP-590", async () => {
      for (const [target, percent] of oldProtocolPercentage) {
        expect(await psr.getPercentageDistribution(target, 0)).to.equal(percent);
      }
      for (const [target, percent] of oldAdditionalPercentage) {
        expect(await psr.getPercentageDistribution(target, 1)).to.equal(percent);
      }
    });
  });

  testForkedNetworkVipCommands("VIP-590", await vip590(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [PSR_ABI], ["DistributionConfigUpdated"], [8]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check ProtocolShareReserve distribution configs after VIP-590", async () => {
      for (const [target, percent] of newProtocolPercentage) {
        expect(await psr.getPercentageDistribution(target, 0)).to.equal(percent);
      }
      for (const [target, percent] of newAdditionalPercentage) {
        expect(await psr.getPercentageDistribution(target, 1)).to.equal(percent);
      }
    });
  });
});
