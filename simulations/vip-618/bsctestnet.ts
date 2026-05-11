import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testVip } from "src/vip-framework";

import vip618, {
  BUYBACKS,
  DEFAULT_PROXY_ADMIN,
  LEGACY_CONVERTERS,
  NEW_RISK_FUND_V2_IMPL,
  RISK_FUND_V2,
  SHORTFALL,
} from "../../vips/vip-618/bsctestnet";
import DEFAULT_PROXY_ADMIN_ABI from "./abi/DefaultProxyAdmin.json";
import SINGLE_TOKEN_CONVERTER_ABI from "./abi/SingleTokenConverter.json";
import BUYBACK_ABI from "./abi/TokenBuyback.json";

const { bsctestnet } = NETWORK_ADDRESSES;

const FORK_BLOCK = 106811121;

const SHORTFALL_MIN_ABI = ["function auctionsPaused() view returns (bool)"];

forking(FORK_BLOCK, async () => {
  const proxyAdmin = new ethers.Contract(DEFAULT_PROXY_ADMIN, DEFAULT_PROXY_ADMIN_ABI, ethers.provider);
  const shortfall = new ethers.Contract(SHORTFALL, SHORTFALL_MIN_ABI, ethers.provider);

  let shortfallAuctionsPausedBefore: boolean;
  let riskFundV2ImplBefore: string;

  before(async () => {
    shortfallAuctionsPausedBefore = await shortfall.auctionsPaused();
    riskFundV2ImplBefore = await proxyAdmin.getProxyImplementation(RISK_FUND_V2);
  });

  describe("Pre-VIP state", () => {
    it("each buyback proxy's pendingOwner is NormalTimelock", async () => {
      for (const b of BUYBACKS) {
        const buyback = new ethers.Contract(b, BUYBACK_ABI, ethers.provider);
        expect(await buyback.pendingOwner()).to.equal(bsctestnet.NORMAL_TIMELOCK);
      }
    });

    it("RiskFundV2 currently points at the old implementation", async () => {
      expect(riskFundV2ImplBefore).to.not.equal(NEW_RISK_FUND_V2_IMPL);
    });

    it("legacy converters are not yet paused", async () => {
      for (const c of LEGACY_CONVERTERS) {
        const converter = new ethers.Contract(c, SINGLE_TOKEN_CONVERTER_ABI, ethers.provider);
        expect(await converter.conversionPaused()).to.be.false;
      }
    });

    it("captures Shortfall.auctionsPaused() pre-state (informational)", async () => {
      // No assertion on the pre-state: isolated pools are wound down so the flag
      // could be either value depending on prior governance actions.
      expect(typeof shortfallAuctionsPausedBefore).to.equal("boolean");
    });
  });

  testVip("VIP-618 [BNB Chain Testnet] TokenBuyback Migration", await vip618());

  describe("Post-VIP state", () => {
    it("RiskFundV2 proxy upgraded to new implementation", async () => {
      expect(await proxyAdmin.getProxyImplementation(RISK_FUND_V2)).to.equal(NEW_RISK_FUND_V2_IMPL);
    });

    it("NormalTimelock owns each buyback proxy", async () => {
      for (const b of BUYBACKS) {
        const buyback = new ethers.Contract(b, BUYBACK_ABI, ethers.provider);
        expect(await buyback.owner()).to.equal(bsctestnet.NORMAL_TIMELOCK);
      }
    });

    it("each legacy converter is paused", async () => {
      for (const c of LEGACY_CONVERTERS) {
        const converter = new ethers.Contract(c, SINGLE_TOKEN_CONVERTER_ABI, ethers.provider);
        expect(await converter.conversionPaused()).to.be.true;
      }
    });

    it("Shortfall auctions are paused (defense in depth)", async () => {
      expect(await shortfall.auctionsPaused()).to.be.true;
    });
  });
});
