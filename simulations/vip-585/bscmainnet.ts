import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  BSC_BNB_BURNING_CONVERTER,
  BSC_BTCB_PRIME_CONVERTER,
  BSC_ETH_PRIME_CONVERTER,
  BSC_PSR,
  BSC_RISK_FUND_CONVERTER,
  BSC_USDC_PRIME_CONVERTER,
  BSC_USDT_PRIME_CONVERTER,
  BSC_XVS_VAULT_CONVERTER,
  vip585,
} from "../../vips/vip-585/bscmainnet";
import PSR_ABI from "./abi/ProtocolShareReserve.json";

const { bscmainnet } = NETWORK_ADDRESSES;
const VTREASURY = bscmainnet.VTREASURY;

// Current state before VIP-590 (after VIP-515)
const oldProtocolPercentage = [
  [VTREASURY, 1500],
  [BSC_XVS_VAULT_CONVERTER, 2000],
  [BSC_USDT_PRIME_CONVERTER, 1000],
  [BSC_USDC_PRIME_CONVERTER, 1000],
  [BSC_BTCB_PRIME_CONVERTER, 0],
  [BSC_ETH_PRIME_CONVERTER, 0],
  [BSC_RISK_FUND_CONVERTER, 2000],
  [BSC_BNB_BURNING_CONVERTER, 2500],
];

const oldAdditionalPercentage = [
  [VTREASURY, 3500],
  [BSC_RISK_FUND_CONVERTER, 2000],
  [BSC_XVS_VAULT_CONVERTER, 2000],
  [BSC_BNB_BURNING_CONVERTER, 2500],
];

// New state after VIP-590
const newProtocolPercentage = [
  [VTREASURY, 4000],
  [BSC_XVS_VAULT_CONVERTER, 2000],
  [BSC_USDT_PRIME_CONVERTER, 1000],
  [BSC_USDC_PRIME_CONVERTER, 1000],
  [BSC_BTCB_PRIME_CONVERTER, 0],
  [BSC_ETH_PRIME_CONVERTER, 0],
  [BSC_RISK_FUND_CONVERTER, 2000],
  [BSC_BNB_BURNING_CONVERTER, 0],
];

const newAdditionalPercentage = [
  [VTREASURY, 6000],
  [BSC_XVS_VAULT_CONVERTER, 2000],
  [BSC_RISK_FUND_CONVERTER, 2000],
  [BSC_BNB_BURNING_CONVERTER, 0],
  [BSC_USDT_PRIME_CONVERTER, 0],
  [BSC_USDC_PRIME_CONVERTER, 0],
  [BSC_BTCB_PRIME_CONVERTER, 0],
  [BSC_ETH_PRIME_CONVERTER, 0],
];

forking(76370070, async () => {
  let psr: Contract;

  before(async () => {
    psr = await ethers.getContractAt(PSR_ABI, BSC_PSR);
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

  testVip("VIP-585", await vip585(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [PSR_ABI], ["DistributionConfigUpdated"], [4]);
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
