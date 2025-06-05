import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  BTCB,
  BTCB_PRIME_CONVERTER,
  CONVERTER_NETWORK,
  ETH,
  ETH_PRIME_CONVERTER,
  FDUSD,
  FDUSD_PRIME_CONVERTER,
  PLP,
  PRIME,
  PROTOCOL_SHARE_RESERVE,
  WBNB,
  WBNB_PRIME_CONVERTER,
  vBNB,
  vFDUSD,
  vip509,
} from "../../vips/vip-509/bscmainnet";
import ACM_ABI from "./abi/ACM.json";
import CONVERTER_ABI from "./abi/Converter.json";
import CONVERTER_NETWORK_ABI from "./abi/ConverterNetwork.json";
import PLP_ABI from "./abi/PLP.json";
import PSR_ABI from "./abi/PSR.json";
import PRIME_ABI from "./abi/Prime.json";

const { bscmainnet } = NETWORK_ADDRESSES;

forking(50925525, async () => {
  const provider = ethers.provider;
  let psr: Contract;
  let wbnbPrimeConverter: Contract;
  let fdusdPrimeConverter: Contract;
  let converterNetwork: Contract;
  let prime: Contract;
  let plp: Contract;

  before(async () => {
    psr = new ethers.Contract(PROTOCOL_SHARE_RESERVE, PSR_ABI, provider);
    wbnbPrimeConverter = new ethers.Contract(WBNB_PRIME_CONVERTER, CONVERTER_ABI, provider);
    fdusdPrimeConverter = new ethers.Contract(FDUSD_PRIME_CONVERTER, CONVERTER_ABI, provider);
    converterNetwork = new ethers.Contract(CONVERTER_NETWORK, CONVERTER_NETWORK_ABI, provider);
    prime = new ethers.Contract(PRIME, PRIME_ABI, provider);
    plp = new ethers.Contract(PLP, PLP_ABI, provider);
  });

  describe("Pre-VIP behavior", async () => {
    it("check distribution config", async () => {
      let target = await psr.distributionTargets(5);
      expect(target.schema).to.equal(0);
      expect(target.destination).to.equal(BTCB_PRIME_CONVERTER);
      expect(target.percentage).to.equal(100);

      target = await psr.distributionTargets(6);
      expect(target.schema).to.equal(0);
      expect(target.destination).to.equal(ETH_PRIME_CONVERTER);
      expect(target.percentage).to.equal(200);
    });
  });

  testVip("VIP-508-testnet", await vip509(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [PSR_ABI, CONVERTER_ABI, PLP_ABI, PRIME_ABI, ACM_ABI, CONVERTER_NETWORK_ABI],
        [
          "DistributionConfigAdded",
          "DistributionConfigUpdated",
          "DistributionConfigRemoved",
          "ConverterNetworkAddressUpdated",
          "ConverterAdded",
          "ConversionConfigUpdated",
          "TokenDistributionInitialized",
          "TokenDistributionSpeedUpdated",
          "MarketAdded",
        ],
        [2, 2, 2, 2, 2, 120, 2, 4, 2],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check distribution config", async () => {
      let target = await psr.distributionTargets(5);
      expect(target.schema).to.equal(0);
      expect(target.destination).to.equal(WBNB_PRIME_CONVERTER);
      expect(target.percentage).to.equal(100);

      target = await psr.distributionTargets(6);
      expect(target.schema).to.equal(0);
      expect(target.destination).to.equal(FDUSD_PRIME_CONVERTER);
      expect(target.percentage).to.equal(200);
    });

    it("check owner", async () => {
      let owner = await wbnbPrimeConverter.owner();
      expect(owner).to.equal(bscmainnet.NORMAL_TIMELOCK);

      owner = await fdusdPrimeConverter.owner();
      expect(owner).to.equal(bscmainnet.NORMAL_TIMELOCK);
    });

    it("check converter network", async () => {
      let converterNetwork = await wbnbPrimeConverter.converterNetwork();
      expect(converterNetwork).to.equal(CONVERTER_NETWORK);

      converterNetwork = await fdusdPrimeConverter.converterNetwork();
      expect(converterNetwork).to.equal(CONVERTER_NETWORK);
    });

    it("check single token converter added to converter network", async () => {
      let converter = await converterNetwork.allConverters(6);
      expect(converter).to.equal(WBNB_PRIME_CONVERTER);

      converter = await converterNetwork.allConverters(7);
      expect(converter).to.equal(FDUSD_PRIME_CONVERTER);
    });

    it("check distribution speed", async () => {
      let speed = await plp.tokenDistributionSpeeds(BTCB);
      expect(speed).to.equal(0);

      speed = await plp.tokenDistributionSpeeds(ETH);
      expect(speed).to.equal(0);

      speed = await plp.tokenDistributionSpeeds(WBNB);
      expect(speed).to.equal(100);

      speed = await plp.tokenDistributionSpeeds(FDUSD);
      expect(speed).to.equal(100);
    });

    it("check if market added to prime", async () => {
      let market = await prime.markets(vBNB);
      expect(market.exists).to.equal(true);

      market = await prime.markets(vFDUSD);
      expect(market.exists).to.equal(true);
    });
  });
});
