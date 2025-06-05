import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { forking, testVip } from "src/vip-framework";

import {
  vip509,
  WBNB_PRIME_CONVERTER,
  FDUSD_PRIME_CONVERTER,
  CONVERTER_NETWORK,
  PROTOCOL_SHARE_RESERVE
} from "../../vips/vip-509/bsctestnet";
import PSR_ABI from "./abi/PSR.json";
import CONVERTER_ABI from "./abi/Converter.json";
import PLP_ABI from "./abi/PLP.json";
import PRIME_ABI from "./abi/Prime.json";
import ACM_ABI from "./abi/ACM.json";
import CONVERTER_NETWORK_ABI from "./abi/ConverterNetwork.json";
import { expectEvents } from "src/utils";

forking(53622696, async () => {
  const provider = ethers.provider;

  before(async () => {
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
          "PermissionGranted",
          "ConverterNetworkAddressUpdated",
          "ConverterAdded",
          "ConversionConfigUpdated",
          "TokenDistributionInitialized",
          "TokenDistributionSpeedUpdated",
          "MarketAdded"
        ],
        [2, 2, 2, 28, 2, 2, 108, 2, 4, 2],
      );
    },
  });

});
