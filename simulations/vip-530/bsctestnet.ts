import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, setMaxStalePeriodInChainlinkOracle } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip530, {
  BNBx,
  PTsUSDE26JUN2025,
  ankrBNB,
  asBNB,
  sUSDe,
  slisBNB,
  xSolvBTC,
} from "../../vips/vip-530/bsctestnet";
import CAPPED_ORACLE_ABI from "./abi/CappedOracle.json";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";

const { bsctestnet } = NETWORK_ADDRESSES;

const prices = [
  {
    symbol: "PT-sUSDE-26JUN2025",
    address: PTsUSDE26JUN2025,
    expectedPrice: parseUnits("0.935", 18),
  },
  {
    symbol: "sUSDe",
    address: sUSDe,
    expectedPrice: parseUnits("1.1", 18),
  },
  {
    symbol: "xSolvBTC",
    address: xSolvBTC,
    expectedPrice: parseUnits("60000", 18),
  },
  {
    symbol: "asBNB",
    address: asBNB,
    expectedPrice: parseUnits("2744.765828835394211237", 18),
  },
  {
    symbol: "BNBx",
    address: BNBx,
    expectedPrice: parseUnits("1216.224444981214530978", 18),
  },
  {
    symbol: "slisBNB",
    address: slisBNB,
    expectedPrice: parseUnits("2744.765828835394211237", 18),
  },
  {
    symbol: "ankrBNB",
    address: ankrBNB,
    expectedPrice: parseUnits("707.417383950833641691", 18),
  },
];

forking(56589695, async () => {
  const provider = ethers.provider;

  await impersonateAccount(bsctestnet.NORMAL_TIMELOCK);
  await setBalance(bsctestnet.NORMAL_TIMELOCK, ethers.utils.parseEther("1000000"));
  const resilientOracle = new ethers.Contract(bsctestnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);

  describe("Pre-VIP behaviour", async () => {
    for (const price of prices) {
      it(`check ${price.symbol} price`, async () => {
        expect(await resilientOracle.getPrice(price.address)).to.equal(price.expectedPrice);
      });
    }
  });

  testVip("VIP-530", await vip530(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["ExecuteRemoteProposal", "StorePayload"],
        [1, 0],
      );

      await expectEvents(
        txResponse,
        [CAPPED_ORACLE_ABI],
        ["SnapshotUpdated", "GrowthRateUpdated", "SnapshotGapUpdated"],
        [8, 8, 8],
      );
    },
  });

  describe("Post-VIP behaviour", async () => {
    before(async () => {
      await setMaxStalePeriodInChainlinkOracle(
        bsctestnet.CHAINLINK_ORACLE,
        "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
        "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526",
        bsctestnet.NORMAL_TIMELOCK,
      );
    });

    for (const price of prices) {
      it(`check ${price.symbol} price`, async () => {
        expect(await resilientOracle.getPrice(price.address)).to.equal(price.expectedPrice);
      });
    }
  });
});
