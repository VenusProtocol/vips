import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import {
  ETHEREUM_PSR,
  ETHEREUM_USDC_PRIME_CONVERTER,
  ETHEREUM_USDT_PRIME_CONVERTER,
  ETHEREUM_WBTC_PRIME_CONVERTER,
  ETHEREUM_WETH_PRIME_CONVERTER,
  ETHEREUM_XVS_VAULT_CONVERTER,
  vip590,
} from "../../vips/vip-590/bscmainnet";
import PSR_ABI from "./abi/ProtocolShareReserve.json";

const { ethereum } = NETWORK_ADDRESSES;
const VTREASURY = ethereum.VTREASURY;

const oldProtocolPercentage = [
  [ETHEREUM_USDC_PRIME_CONVERTER, 120],
  [ETHEREUM_USDT_PRIME_CONVERTER, 120],
  [ETHEREUM_WBTC_PRIME_CONVERTER, 60],
  [ETHEREUM_WETH_PRIME_CONVERTER, 1700],
  [ETHEREUM_XVS_VAULT_CONVERTER, 2000],
  [VTREASURY, 6000],
];

const oldAdditionalPercentage = [
  [ETHEREUM_USDC_PRIME_CONVERTER, 0],
  [ETHEREUM_USDT_PRIME_CONVERTER, 0],
  [ETHEREUM_WBTC_PRIME_CONVERTER, 0],
  [ETHEREUM_WETH_PRIME_CONVERTER, 0],
  [ETHEREUM_XVS_VAULT_CONVERTER, 2000],
  [VTREASURY, 8000],
];

const newProtocolPercentage = [
  [ETHEREUM_USDC_PRIME_CONVERTER, 0],
  [ETHEREUM_USDT_PRIME_CONVERTER, 0],
  [ETHEREUM_WBTC_PRIME_CONVERTER, 0],
  [ETHEREUM_WETH_PRIME_CONVERTER, 0],
  [ETHEREUM_XVS_VAULT_CONVERTER, 0],
  [VTREASURY, 10000],
];

const newAdditionalPercentage = [
  [ETHEREUM_USDC_PRIME_CONVERTER, 0],
  [ETHEREUM_USDT_PRIME_CONVERTER, 0],
  [ETHEREUM_WBTC_PRIME_CONVERTER, 0],
  [ETHEREUM_WETH_PRIME_CONVERTER, 0],
  [ETHEREUM_XVS_VAULT_CONVERTER, 0],
  [VTREASURY, 10000],
];

forking(24275926, async () => {
  let psr: Contract;

  before(async () => {
    psr = await ethers.getContractAt(PSR_ABI, ETHEREUM_PSR);
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
