import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  BTCB_PRIME_CONVERTER,
  BURNING_CONVERTER,
  CONVERTER_NETWORK,
  ETH_PRIME_CONVERTER,
  PSR,
  RISK_FUND_CONVERTER,
  USDC_PRIME_CONVERTER,
  USDT_PRIME_CONVERTER,
  VTREASURY,
  XVS_VAULT_CONVERTER,
  vip600,
} from "../../vips/vip-600/bsctestnet";
import CONVERTER_NETWORK_ABI from "./abi/ConverterNetwork.json";
import PSR_ABI from "./abi/ProtocolShareReserve.json";
import CONVERTER_ABI from "./abi/singletokenconverter.json";

const oldMarketPercentage = [
  [RISK_FUND_CONVERTER, 4000],
  [VTREASURY, 4000],
  [XVS_VAULT_CONVERTER, 1000],
  [USDT_PRIME_CONVERTER, 420],
  [BTCB_PRIME_CONVERTER, 177],
  [ETH_PRIME_CONVERTER, 211],
  [USDC_PRIME_CONVERTER, 192],
];

// This percentage is being matched to the mainnet
const newMarketPercentage = [
  [RISK_FUND_CONVERTER, 2000],
  [VTREASURY, 1500],
  [XVS_VAULT_CONVERTER, 2000],
  [USDT_PRIME_CONVERTER, 1100],
  [BTCB_PRIME_CONVERTER, 100],
  [ETH_PRIME_CONVERTER, 200],
  [USDC_PRIME_CONVERTER, 600],
  [BURNING_CONVERTER, 2500],
];

const oldLiquidityPercentage = [
  [RISK_FUND_CONVERTER, 5000],
  [VTREASURY, 4000],
  [XVS_VAULT_CONVERTER, 1000],
];

// This percentage is being matched to the mainnet
const newLiquidityPercentage = [
  [RISK_FUND_CONVERTER, 2000],
  [VTREASURY, 3500],
  [XVS_VAULT_CONVERTER, 2000],
  [BURNING_CONVERTER, 2500],
];

forking(54173556, async () => {
  let psr: Contract;
  let converterNetwork: Contract;
  let burningConverter: Contract;

  before(async () => {
    psr = await ethers.getContractAt(PSR_ABI, PSR);
    converterNetwork = await ethers.getContractAt(CONVERTER_NETWORK_ABI, CONVERTER_NETWORK);
    burningConverter = await ethers.getContractAt(CONVERTER_ABI, BURNING_CONVERTER);
  });

  describe("Pre-VIP behaviour", async () => {
    it("check ProtocolShareReserve distribution configs", async () => {
      expect(await psr.totalDistributions()).to.equal(10);
      for (const [target, percent] of oldMarketPercentage) {
        expect(await psr.getPercentageDistribution(target, 0)).to.equal(percent);
      }
      for (const [target, percent] of oldLiquidityPercentage) {
        expect(await psr.getPercentageDistribution(target, 1)).to.equal(percent);
      }
    });
    it("Burning converter is not set", async () => {
      const allConverters = await converterNetwork.getAllConverters();
      expect(allConverters.length).equals(6);
      expect(allConverters).not.includes(BURNING_CONVERTER);
    });
  });

  testVip("VIP-600", await vip600(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [PSR_ABI, CONVERTER_ABI],
        ["DistributionConfigUpdated", "DistributionConfigAdded", "ConversionConfigUpdated"],
        [10, 2, 54],
      );
      await expectEvents(txResponse, [CONVERTER_NETWORK_ABI], ["ConverterAdded"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check ProtocolShareReserve distribution configs", async () => {
      expect(await psr.totalDistributions()).to.equal(12);
      for (const [target, percent] of newMarketPercentage) {
        expect(await psr.getPercentageDistribution(target, 0)).to.equal(percent);
      }
      for (const [target, percent] of newLiquidityPercentage) {
        expect(await psr.getPercentageDistribution(target, 1)).to.equal(percent);
      }
    });
    it("Burning converter is set", async () => {
      const allConverters = await converterNetwork.getAllConverters();
      expect(allConverters.length).equals(7);
      expect(allConverters).includes(BURNING_CONVERTER);
    });

    it("check distribution config", async () => {
      const index = await psr.totalDistributions();
      let target = await psr.distributionTargets(index.sub(1).toString());
      expect(target.schema).to.equal(1);
      expect(target.destination).to.equal(BURNING_CONVERTER);
      expect(target.percentage).to.equal(2500);

      target = await psr.distributionTargets(10);
      expect(target.schema).to.equal(0);
      expect(target.destination).to.equal(BURNING_CONVERTER);
      expect(target.percentage).to.equal(2500);
    });

    it("check owner", async () => {
      const owner = await burningConverter.owner();
      expect(owner).to.equal(NETWORK_ADDRESSES.bsctestnet.NORMAL_TIMELOCK);
    });

    it("check converter network", async () => {
      const converterNetwork = await burningConverter.converterNetwork();
      expect(converterNetwork).to.equal(CONVERTER_NETWORK);
    });
    it("check single token converter added to converter network", async () => {
      const allConverters = await converterNetwork.getAllConverters();
      const converter = await converterNetwork.allConverters(allConverters.length - 1);
      expect(converter).to.equal(BURNING_CONVERTER);
    });
    it("check destination address", async () => {
      expect(await burningConverter.destinationAddress()).equals("0x0000000000000000000000000000000000000001");
    });
  });
});
