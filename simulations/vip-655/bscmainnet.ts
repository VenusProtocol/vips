import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES, ORACLE_BNB } from "src/networkAddresses";
import {
  initMainnetUser,
  setMaxStalePeriodInBinanceOracle,
  setMaxStalePeriodInChainlinkOracle,
  setRedstonePrice,
} from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip655, {
  ALPACA,
  ALPACA_DIRECT_PRICE,
  BSW,
  BSW_DIRECT_PRICE,
  WIN,
  WIN_DIRECT_PRICE,
} from "../../vips/vip-655/bscmainnet";

const { bscmainnet } = NETWORK_ADDRESSES;
const CHAINLINK_ORACLE = bscmainnet.CHAINLINK_ORACLE;
const RESILIENT_ORACLE = bscmainnet.RESILIENT_ORACLE;

// Deprecated Isolated-Pool markets with dead Chainlink feeds.
const vALPACA_DeFi = "0x02c5Fb0F26761093D297165e902e96D08576D344";
const vBSW_DeFi = "0x8f657dFD3a1354DEB4545765fE6840cc54AFd379";
const vWIN_Tron = "0xb114cfA615c828D88021a41bFc524B800E64a9D5";

// DeFi Isolated Pool + the bad-debt wallet the WIN/ALPACA/BSW heals depend on.
const DEFI_COMPTROLLER = "0x3344417c9360b963ca93A4e8305361AEde340Ab9";
const BAD_DEBT_WALLET = "0x3eb982d680eb56b148fb20347711aac8f2283099";
// The only borrow of BAD_DEBT_WALLET (≈ 4,897 USDT), unrepayable while ALPACA/BSW cannot be priced.
const vUSDT_DeFi = "0x1d8bbde12b6b34140604e18e9f9c6e14dec16854";
const USDT = "0x55d398326f99059ff775485246999027b3197955";
// Binance hot wallet, used only to fund the healer with USDT on the fork.
const USDT_WHALE = "0xF977814e90dA44bFA03b6295A0616a897441aceC";
// TWT — one of the wallet's other entered markets. Its RedStone PIVOT feed has an internal
// timestamp guard (reverts with selector 0x4f319ffe on a time-warped fork) that a stale-period
// bump cannot widen, so its price is pinned directly in before() to keep the anchor valid.
const TWT = "0x4b0f1812e5df2a09796481ff14017e6005508003";

const CHAINLINK_ORACLE_ABI = [
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
  "function healAccount(address)",
];
const VTOKEN_ABI = [
  "function underlying() view returns (address)",
  "function borrowBalanceStored(address) view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function badDebt() view returns (uint256)",
];
const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function symbol() view returns (string)",
  "function approve(address,uint256) returns (bool)",
];

const BLOCK_NUMBER = 115860000;

const vBNB = "0xA07c5b74C9B40447a954e1466938b865b6BBea36";

forking(BLOCK_NUMBER, async () => {
  let chainlinkOracle: Contract;
  let resilientOracle: Contract;
  let comptroller: Contract;
  let vUsdt: Contract;

  before(async () => {
    chainlinkOracle = new ethers.Contract(CHAINLINK_ORACLE, CHAINLINK_ORACLE_ABI, ethers.provider);
    resilientOracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);
    comptroller = new ethers.Contract(DEFI_COMPTROLLER, COMPTROLLER_ABI, ethers.provider);
    vUsdt = new ethers.Contract(vUSDT_DeFi, VTOKEN_ABI, ethers.provider);

    // testVip freezes the fork while mining through voting + timelock, so every live feed backing
    // the bad-debt wallet's OTHER entered markets (TWT, USDT) would go stale and revert the post-VIP
    // liquidity / heal checks for the wrong reason. Bump their stale periods — but NOT the deprecated
    // ALPACA/BSW markets, whose dead feeds are the very thing this VIP fixes with a direct price.
    const markets: string[] = await comptroller.getAssetsIn(BAD_DEBT_WALLET);
    for (const market of markets) {
      if (market.toLowerCase() === vALPACA_DeFi.toLowerCase() || market.toLowerCase() === vBSW_DeFi.toLowerCase()) {
        continue;
      }
      const underlying =
        market.toLowerCase() === vBNB.toLowerCase()
          ? ORACLE_BNB
          : await new ethers.Contract(market, VTOKEN_ABI, ethers.provider).underlying();
      const cfg = await resilientOracle.getTokenConfig(underlying);
      for (let i = 0; i < 3; i++) {
        const leg = cfg.oracles[i];
        if (!cfg.enableFlagsForOracles[i] || leg === ethers.constants.AddressZero) continue;
        try {
          await setMaxStalePeriodInChainlinkOracle(
            leg,
            underlying,
            ethers.constants.AddressZero,
            bscmainnet.NORMAL_TIMELOCK,
          );
        } catch {
          const symbol = await new ethers.Contract(underlying, ERC20_ABI, ethers.provider).symbol();
          await setMaxStalePeriodInBinanceOracle(leg, symbol);
        }
      }
    }

    // TWT's RedStone PIVOT feed guards its own timestamp below the Venus oracle layer, so the
    // stale-period bump above is a no-op for it and it reverts once the fork warps through the
    // governance delay. Pin its RedStone price directly (read pre-warp) so the MAIN (Atlas) price
    // still has a valid anchor to bound-check against.
    await setRedstonePrice(bscmainnet.REDSTONE_ORACLE, TWT, ethers.constants.AddressZero, bscmainnet.NORMAL_TIMELOCK);
  });

  describe("Pre-VIP behavior", () => {
    it("ChainlinkOracle has no direct price for ALPACA, BSW or WIN", async () => {
      expect(await chainlinkOracle.prices(ALPACA)).to.equal(0);
      expect(await chainlinkOracle.prices(BSW)).to.equal(0);
      expect(await chainlinkOracle.prices(WIN)).to.equal(0);
    });

    it("getUnderlyingPrice reverts for vALPACA, vBSW and vWIN (dead Chainlink feeds)", async () => {
      await expect(resilientOracle.getUnderlyingPrice(vALPACA_DeFi)).to.be.reverted;
      await expect(resilientOracle.getUnderlyingPrice(vBSW_DeFi)).to.be.reverted;
      await expect(resilientOracle.getUnderlyingPrice(vWIN_Tron)).to.be.reverted;
    });

    it("the DeFi bad-debt wallet's liquidity cannot be computed (blocks the heal)", async () => {
      await expect(comptroller.getAccountLiquidity(BAD_DEBT_WALLET)).to.be.reverted;
    });

    it("healAccount reverts for the DeFi bad-debt wallet", async () => {
      const [signer] = await ethers.getSigners();
      await expect(comptroller.connect(signer).callStatic.healAccount(BAD_DEBT_WALLET)).to.be.reverted;
    });
  });

  testVip("VIP-655 Set direct prices on ALPACA, BSW and WIN", await vip655(), {
    callbackAfterExecution: async txResponse => {
      await expect(txResponse).to.emit(chainlinkOracle, "PricePosted").withArgs(ALPACA, anyValue, ALPACA_DIRECT_PRICE);
      await expect(txResponse).to.emit(chainlinkOracle, "PricePosted").withArgs(BSW, anyValue, BSW_DIRECT_PRICE);
      await expect(txResponse).to.emit(chainlinkOracle, "PricePosted").withArgs(WIN, anyValue, WIN_DIRECT_PRICE);
    },
  });

  describe("Post-VIP behavior", () => {
    it("ChainlinkOracle stores the new direct prices", async () => {
      expect(await chainlinkOracle.prices(ALPACA)).to.equal(ALPACA_DIRECT_PRICE);
      expect(await chainlinkOracle.prices(BSW)).to.equal(BSW_DIRECT_PRICE);
      expect(await chainlinkOracle.prices(WIN)).to.equal(WIN_DIRECT_PRICE);
    });

    it("getUnderlyingPrice returns the direct prices (all underlyings are 18 decimals)", async () => {
      expect(await resilientOracle.getUnderlyingPrice(vALPACA_DeFi)).to.equal(ALPACA_DIRECT_PRICE);
      expect(await resilientOracle.getUnderlyingPrice(vBSW_DeFi)).to.equal(BSW_DIRECT_PRICE);
      expect(await resilientOracle.getUnderlyingPrice(vWIN_Tron)).to.equal(WIN_DIRECT_PRICE);
    });

    it("the DeFi bad-debt wallet's liquidity can be computed again", async () => {
      const [err, , shortfall] = await comptroller.getAccountLiquidity(BAD_DEBT_WALLET);
      expect(err).to.equal(0);
      // CFs/LTs are 0 on these deprecated markets, so the worthless collateral leaves a shortfall.
      expect(shortfall).to.be.gt(0);
    });

    it("the DeFi bad-debt wallet can now be healed end-to-end", async () => {
      const usdt = new ethers.Contract(USDT, ERC20_ABI, ethers.provider);

      // The heal forgives (almost) the entire borrow as bad debt because the LT-weighted collateral is
      // ~0; fund + approve the healer generously so the test is robust to the exact repayment amount.
      const healer = await initMainnetUser(USDT_WHALE, parseUnits("1", 18));
      await usdt.connect(healer).approve(vUSDT_DeFi, ethers.constants.MaxUint256);

      const borrowBefore: BigNumber = await vUsdt.borrowBalanceStored(BAD_DEBT_WALLET);
      const badDebtBefore: BigNumber = await vUsdt.badDebt();
      expect(borrowBefore).to.be.gt(0);

      await comptroller.connect(healer).healAccount(BAD_DEBT_WALLET);

      // The unrepayable borrow is cleared off the wallet and recorded as market bad debt.
      expect(await vUsdt.borrowBalanceStored(BAD_DEBT_WALLET)).to.equal(0);
      expect(await vUsdt.badDebt()).to.be.gt(badDebtBefore);
      // The worthless ALPACA collateral was seized off the wallet.
      const vAlpaca = new ethers.Contract(vALPACA_DeFi, VTOKEN_ABI, ethers.provider);
      expect(await vAlpaca.balanceOf(BAD_DEBT_WALLET)).to.equal(0);
    });
  });
});
