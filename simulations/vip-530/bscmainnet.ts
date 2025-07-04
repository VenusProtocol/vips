import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, setMaxStalePeriod, setMaxStalePeriodInChainlinkOracle, setRedstonePrice } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip530, { SUSDE, USDE, XSOLVBTC } from "../../vips/vip-530/bscmainnet";
import CAPPED_ORACLE_ABI from "./abi/CappedOracle.json";
import ERC20_ABI from "./abi/ERC20.json";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";

const { bscmainnet } = NETWORK_ADDRESSES;
const REDSTONE_BNB_FEED = "0x8dd2D85C7c28F43F965AE4d9545189C7D022ED0e";
const SolvBTC = "0x4aae823a6a0b376De6A78e74eCC5b079d38cBCf7";
export const xSolvBTC_RedStone_Feed = "0x24c8964338Deb5204B096039147B8e8C3AEa42Cc"; // RedStone Price Feed for SolvBTC.BBN_FUNDAMENTAL

const prices = [
  {
    symbol: "vslisBNB_LiquidStakedBNB",
    address: "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A",
    expectedPrice: parseUnits("681.083739974989224542", 18),
    expectedPriceAfterVIP: parseUnits("681.083739974989224542", 18),
    preVIP: async function () {
      await setRedstonePrice(
        bscmainnet.REDSTONE_ORACLE,
        "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
        REDSTONE_BNB_FEED,
        bscmainnet.NORMAL_TIMELOCK,
      );
    },
    postVIP: async function (resilientOracle: any) {
      const token = new ethers.Contract("0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB", ERC20_ABI, ethers.provider);
      await setMaxStalePeriod(resilientOracle, token);
    },
  },
  {
    symbol: "vBNBx_LiquidStakedBNB",
    address: "0x5E21bF67a6af41c74C1773E4b473ca5ce8fd3791",
    expectedPrice: parseUnits("730.131511274565591262", 18),
    expectedPriceAfterVIP: parseUnits("730.131511274565591262", 18),
  },
  {
    symbol: "vasBNB_LiquidStakedBNB",
    address: "0x4A50a0a1c832190362e1491D5bB464b1bc2Bd288",
    expectedPrice: parseUnits("698.947968343351630205", 18),
    expectedPriceAfterVIP: parseUnits("698.947968343351630205", 18),
  },
  {
    symbol: "vankrBNB_LiquidStakedBNB",
    address: "0xBfe25459BA784e70E2D7a718Be99a1f3521cA17f",
    expectedPrice: parseUnits("725.759879435137336499", 18),
    expectedPriceAfterVIP: parseUnits("725.759879435137336499", 18),
  },
  {
    symbol: "vxSolvBTC",
    address: "0xd804dE60aFD05EE6B89aab5D152258fD461B07D5",
    expectedPrice: parseUnits("108672.815", 18),
    expectedPriceAfterVIP: parseUnits("108672.815", 18),
    preVIP: async function () {
      await setMaxStalePeriodInChainlinkOracle(
        bscmainnet.CHAINLINK_ORACLE,
        SolvBTC,
        "0x264990fbd0A4796A3E3d8E37C4d5F87a3aCa5Ebf", // BTC/USD
        bscmainnet.NORMAL_TIMELOCK,
      );
      await setRedstonePrice(
        bscmainnet.REDSTONE_ORACLE,
        SolvBTC,
        "0xa51738d1937FFc553d5070f43300B385AA2D9F55", // Red stone for BTC/USD
        bscmainnet.NORMAL_TIMELOCK,
      );
      await setRedstonePrice(bscmainnet.REDSTONE_ORACLE, XSOLVBTC, xSolvBTC_RedStone_Feed, bscmainnet.NORMAL_TIMELOCK);
    },
    postVIP: async function (resilientOracle: any) {
      const token = new ethers.Contract(XSOLVBTC, ERC20_ABI, ethers.provider);
      await setMaxStalePeriod(resilientOracle, token);
    },
  },

  {
    symbol: "vsUSDe",
    address: "0x699658323d58eE25c69F1a29d476946ab011bD18",
    expectedPrice: parseUnits("1.1815186800414008", 18),
    expectedPriceAfterVIP: parseUnits("1.1815186800414008", 18),
    preVIP: async function () {
      await setRedstonePrice(
        bscmainnet.REDSTONE_ORACLE,
        SUSDE,
        "0x5ED849a45B4608952161f45483F4B95BCEa7f8f0", // RedStone price feed for sUSDe/USDe
        bscmainnet.NORMAL_TIMELOCK,
      );
      await setMaxStalePeriodInChainlinkOracle(
        bscmainnet.CHAINLINK_ORACLE,
        SUSDE, // sUSDe
        "0x1a269eA1b209DA2c12bDCDab22635C9e6C5028B2", // SUSDE / USDE Exchange Rate
        bscmainnet.NORMAL_TIMELOCK,
      );
      await setRedstonePrice(
        bscmainnet.REDSTONE_ORACLE,
        USDE,
        "0x0d9b42a2a73Ec528759701D0B70Ccf974a327EBb",
        bscmainnet.NORMAL_TIMELOCK,
      ); // RedStone Price Feed for USDe
      await setMaxStalePeriodInChainlinkOracle(
        bscmainnet.CHAINLINK_ORACLE,
        USDE, // USDe
        "0x10402B01cD2E6A9ed6DBe683CbC68f78Ff02f8FC", // USDE / USD  Exchange Rate
        bscmainnet.NORMAL_TIMELOCK,
      );
    },

    postVIP: async function (resilientOracle: any) {
      const token = new ethers.Contract(SUSDE, ERC20_ABI, ethers.provider);
      await setMaxStalePeriod(resilientOracle, token);
    },
  },
];

forking(53432462, async () => {
  const provider = ethers.provider;
  const resilientOracle = new ethers.Contract(bscmainnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);

  describe("Pre-VIP behaviour", async () => {
    for (const price of prices) {
      it(`check ${price.symbol} price`, async () => {
        if (price.preVIP) {
          await price.preVIP();
        }
        expect(await resilientOracle.getUnderlyingPrice(price.address)).to.equal(price.expectedPrice);
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
    for (const price of prices) {
      it(`check ${price.symbol} price`, async () => {
        if (price.postVIP) {
          await price.postVIP(resilientOracle);
        }
        expect(await resilientOracle.getUnderlyingPrice(price.address)).to.equal(price.expectedPriceAfterVIP);
      });
    }
  });
});
