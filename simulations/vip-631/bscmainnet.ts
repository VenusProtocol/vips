import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES, ORACLE_BNB } from "src/networkAddresses";
import { setMaxStalePeriodInBinanceOracle, setMaxStalePeriodInChainlinkOracle } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip631, { SXP, SXP_DIRECT_PRICE } from "../../vips/vip-631/bscmainnet";

const { bscmainnet } = NETWORK_ADDRESSES;
const CHAINLINK_ORACLE = bscmainnet.CHAINLINK_ORACLE;

// The deprecated SXP market whose dead Chainlink feed bricks full-account
// liquidity checks for every account that has it in its entered markets.
const vSXP = "0x2fF3d0F6990a40261c66E1ff2017aCBc282EB6d0";
// Affected account from the support report, used to verify the fix end-to-end
const USER = "0x299cBFae709f280b856C7e0ea619AC608a4d9845";
// vUSDC core market — the borrow that was reverting for the user
const vUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
const vBNB = "0xA07c5b74C9B40447a954e1466938b865b6BBea36";
const BORROW_AMOUNT = parseUnits("7500", 18);

const CHAINLINK_ORACLE_ABI = [
  "function getPrice(address asset) view returns (uint256)",
  "function prices(address asset) view returns (uint256)",
  "event PricePosted(address indexed asset, uint256 previousPriceMantissa, uint256 newPriceMantissa)",
];
const RESILIENT_ORACLE_ABI = [
  "function getUnderlyingPrice(address) view returns (uint256)",
  "function getTokenConfig(address) view returns (tuple(address asset, address[3] oracles, bool[3] enableFlagsForOracles))",
];
const COMPTROLLER_ABI = [
  "function getAssetsIn(address) view returns (address[])",
  "function getAccountLiquidity(address) view returns (uint256,uint256,uint256)",
  "function checkMembership(address,address) view returns (bool)",
  "function exitMarket(address) returns (uint256)",
];
const VTOKEN_ABI = [
  "function borrow(uint256) returns (uint256)",
  "function underlying() view returns (address)",
];
const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function symbol() view returns (string)",
];

const BLOCK_NUMBER = 103745245;

forking(BLOCK_NUMBER, async () => {
  let oracle: Contract;
  let resilientOracle: Contract;
  let comptroller: Contract;
  let vUsdc: Contract;
  let usdc: Contract;

  before(async () => {
    oracle = new ethers.Contract(CHAINLINK_ORACLE, CHAINLINK_ORACLE_ABI, ethers.provider);
    resilientOracle = new ethers.Contract(bscmainnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);
    comptroller = new ethers.Contract(bscmainnet.UNITROLLER, COMPTROLLER_ABI, ethers.provider);
    vUsdc = new ethers.Contract(vUSDC, VTOKEN_ABI, ethers.provider);
    usdc = new ethers.Contract(await vUsdc.underlying(), ERC20_ABI, ethers.provider);

    await impersonateAccount(USER);
    await setBalance(USER, parseUnits("1", 18));

    // The fork is frozen in time while testVip mines through voting + timelock,
    // so every live feed in the user's entered markets would go stale and produce
    // false "invalid resilient oracle price" reverts in the post-VIP user checks.
    // Bump stale periods on every enabled leg (main/pivot/fallback) of every
    // entered asset — EXCEPT SXP, whose dead feed is the very thing the VIP fixes.
    const markets: string[] = await comptroller.getAssetsIn(USER);
    for (const market of markets) {
      if (market.toLowerCase() === vSXP.toLowerCase()) continue;
      const underlying =
        market.toLowerCase() === vBNB.toLowerCase()
          ? ORACLE_BNB
          : await new ethers.Contract(market, VTOKEN_ABI, ethers.provider).underlying();
      const cfg = await resilientOracle.getTokenConfig(underlying);
      for (let i = 0; i < 3; i++) {
        const leg = cfg.oracles[i];
        if (!cfg.enableFlagsForOracles[i] || leg === ethers.constants.AddressZero) continue;
        try {
          // Chainlink-interface oracles (Chainlink, RedStone, ...)
          await setMaxStalePeriodInChainlinkOracle(
            leg,
            underlying,
            ethers.constants.AddressZero,
            bscmainnet.NORMAL_TIMELOCK,
          );
        } catch {
          // Binance oracle keys by symbol instead
          const symbol =
            underlying.toLowerCase() === ORACLE_BNB.toLowerCase()
              ? "BNB"
              : await new ethers.Contract(underlying, ERC20_ABI, ethers.provider).symbol();
          await setMaxStalePeriodInBinanceOracle(leg, symbol);
        }
      }
    }
  });

  describe("Pre-VIP behavior", () => {
    it("SXP direct price is not yet 0.00046", async () => {
      expect(await oracle.prices(SXP)).to.not.equal(SXP_DIRECT_PRICE);
    });

    it("ResilientOracle.getUnderlyingPrice(vSXP) reverts (retired Chainlink feed)", async () => {
      await expect(resilientOracle.getUnderlyingPrice(vSXP)).to.be.revertedWith("invalid resilient oracle price");
    });

    it("the affected user's borrow reverts on the same oracle error", async () => {
      const signer = await ethers.getSigner(USER);
      await expect(vUsdc.connect(signer).callStatic.borrow(BORROW_AMOUNT)).to.be.revertedWith(
        "invalid resilient oracle price",
      );
    });

    it("the affected user cannot even exit the SXP market", async () => {
      const signer = await ethers.getSigner(USER);
      await expect(comptroller.connect(signer).callStatic.exitMarket(vSXP)).to.be.revertedWith(
        "invalid resilient oracle price",
      );
    });
  });

  testVip("VIP-631 Set SXP direct price", await vip631(), {
    callbackAfterExecution: async txResponse => {
      await expect(txResponse).to.emit(oracle, "PricePosted").withArgs(SXP, anyValue, SXP_DIRECT_PRICE);
    },
  });

  describe("Post-VIP behavior", () => {
    it("SXP direct price is set to 0.00046", async () => {
      expect(await oracle.prices(SXP)).to.equal(SXP_DIRECT_PRICE);
    });

    it("getUnderlyingPrice(vSXP) returns the direct price (SXP has 18 decimals)", async () => {
      expect(await resilientOracle.getUnderlyingPrice(vSXP)).to.equal(SXP_DIRECT_PRICE);
    });

    it("every market the affected user has entered can be priced again", async () => {
      const markets: string[] = await comptroller.getAssetsIn(USER);
      for (const market of markets) {
        expect(await resilientOracle.getUnderlyingPrice(market)).to.be.gt(0);
      }
    });

    it("the affected user has positive liquidity and no shortfall", async () => {
      const [err, liquidity, shortfall] = await comptroller.getAccountLiquidity(USER);
      expect(err).to.equal(0);
      expect(shortfall).to.equal(0);
      expect(liquidity).to.be.gt(0);
    });

    it("the affected user can borrow again and actually receives the funds", async () => {
      const signer = await ethers.getSigner(USER);
      const before: BigNumber = await usdc.balanceOf(USER);
      const tx = await vUsdc.connect(signer).borrow(BORROW_AMOUNT);
      await tx.wait();
      const after: BigNumber = await usdc.balanceOf(USER);
      expect(after.sub(before)).to.equal(BORROW_AMOUNT);
    });

    it("the affected user can exit the SXP market (clears the stale membership)", async () => {
      const signer = await ethers.getSigner(USER);
      const tx = await comptroller.connect(signer).exitMarket(vSXP);
      await tx.wait();
      expect(await comptroller.checkMembership(USER, vSXP)).to.equal(false);
    });
  });
});
