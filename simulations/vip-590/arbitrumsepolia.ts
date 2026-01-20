import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import {
  ARB_SEPOLIA_PSR,
  ARB_SEPOLIA_USDC_PRIME_CONVERTER,
  ARB_SEPOLIA_USDT_PRIME_CONVERTER,
  ARB_SEPOLIA_WBTC_PRIME_CONVERTER,
  ARB_SEPOLIA_WETH_PRIME_CONVERTER,
  ARB_SEPOLIA_XVS_VAULT_CONVERTER,
  vip590,
} from "../../vips/vip-590/bsctestnet";
import PSR_ABI from "./abi/ProtocolShareReserve.json";

const { arbitrumsepolia } = NETWORK_ADDRESSES;
const VTREASURY = arbitrumsepolia.VTREASURY;

const oldProtocolPercentage = [
  [ARB_SEPOLIA_USDC_PRIME_CONVERTER, 500],
  [ARB_SEPOLIA_USDT_PRIME_CONVERTER, 500],
  [ARB_SEPOLIA_WBTC_PRIME_CONVERTER, 300],
  [ARB_SEPOLIA_WETH_PRIME_CONVERTER, 700],
  [ARB_SEPOLIA_XVS_VAULT_CONVERTER, 2000],
  [VTREASURY, 6000],
];

const oldAdditionalPercentage = [
  [ARB_SEPOLIA_USDC_PRIME_CONVERTER, 0],
  [ARB_SEPOLIA_USDT_PRIME_CONVERTER, 0],
  [ARB_SEPOLIA_WBTC_PRIME_CONVERTER, 0],
  [ARB_SEPOLIA_WETH_PRIME_CONVERTER, 0],
  [ARB_SEPOLIA_XVS_VAULT_CONVERTER, 2000],
  [VTREASURY, 8000],
];

const newProtocolPercentage = [
  [ARB_SEPOLIA_USDC_PRIME_CONVERTER, 0],
  [ARB_SEPOLIA_USDT_PRIME_CONVERTER, 0],
  [ARB_SEPOLIA_WBTC_PRIME_CONVERTER, 0],
  [ARB_SEPOLIA_WETH_PRIME_CONVERTER, 0],
  [ARB_SEPOLIA_XVS_VAULT_CONVERTER, 0],
  [VTREASURY, 10000],
];

const newAdditionalPercentage = [
  [ARB_SEPOLIA_USDC_PRIME_CONVERTER, 0],
  [ARB_SEPOLIA_USDT_PRIME_CONVERTER, 0],
  [ARB_SEPOLIA_WBTC_PRIME_CONVERTER, 0],
  [ARB_SEPOLIA_WETH_PRIME_CONVERTER, 0],
  [ARB_SEPOLIA_XVS_VAULT_CONVERTER, 0],
  [VTREASURY, 10000],
];

forking(235177341, async () => {
  let psr: Contract;

  before(async () => {
    psr = await ethers.getContractAt(PSR_ABI, ARB_SEPOLIA_PSR);
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
