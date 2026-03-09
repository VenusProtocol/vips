import { expect } from "chai";
import { Contract, Signer } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { ALL_MARKETS, CORE_POOL_ID, vip630 } from "../../vips/vip-630/bscmainnet";
import COMPTROLLER_ABI from "../vip-587/abi/Comptroller.json";
import VTOKEN_ABI from "../vip-587/abi/VToken.json";

const { bscmainnet } = NETWORK_ADDRESSES;

const BLOCK_NUMBER = 85550618;

// Map vToken address to underlying info (from vip-587 simulations)
const MARKET_INFO: Record<string, { underlying: string; whale: string; decimals: number }> = {
  // LINK
  "0x650b940a1033B8A1b1873f78730FcFC73ec11f1f": {
    underlying: "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD",
    whale: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
    decimals: 18,
  },
  // UNI
  "0x27FF564707786720C71A2e5c1490A63266683612": {
    underlying: "0xBf5140A22578168FD562DCcF235E5D43A02ce9B1",
    whale: "0x27FF564707786720C71A2e5c1490A63266683612",
    decimals: 18,
  },
  // AAVE
  "0x26DA28954763B92139ED49283625ceCAf52C6f94": {
    underlying: "0xfb6115445Bff7b52FeB98650C87f44907E58f802",
    whale: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
    decimals: 18,
  },
  // DOGE
  "0xec3422Ef92B2fb59e84c8B02Ba73F1fE84Ed8D71": {
    underlying: "0xba2ae424d960c26247dd6c32edc70b295c744c43",
    whale: "0x0000000000000000000000000000000000001004",
    decimals: 8,
  },
  // BCH
  "0x5F0388EBc2B94FA8E123F404b79cCF5f40b29176": {
    underlying: "0x8fF795a6F4D97E7887C79beA79aba5cc76444aDf",
    whale: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
    decimals: 18,
  },
  // TWT
  "0x4d41a36D04D97785bcEA57b057C412b278e6Edcc": {
    underlying: "0x4B0F1812e5Df2A09796481Ff14017e6005508003",
    whale: "0x8808390062EBcA540ff10ee43DB60125bB061621",
    decimals: 18,
  },
  // ADA
  "0x9A0AF7FDb2065Ce470D72664DE73cAE409dA28Ec": {
    underlying: "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47",
    whale: "0x835678a611B28684005a5e2233695fB6cbbB0007",
    decimals: 18,
  },
  // LTC
  "0x57A5297F2cB2c0AaC9D554660acd6D385Ab50c6B": {
    underlying: "0x4338665CBB7B2485A8855A139b75D5e34AB0DB94",
    whale: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
    decimals: 18,
  },
  // FIL
  "0xf91d58b5aE142DAcC749f58A49FCBac340Cb0343": {
    underlying: "0x0D8Ce2A99Bb6e3B7Db580eD848240e4a0F9aE153",
    whale: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
    decimals: 18,
  },
  // TRX
  "0xC5D3466aA484B040eE977073fcF337f2c00071c1": {
    underlying: "0xCE7de646e7208a4Ef112cb6ed5038FA6cC6b12e3",
    whale: "0xCa266910d92a313E5F9eb1AfFC462bcbb7d9c4A9",
    decimals: 6,
  },
  // DOT
  "0x1610bc33319e9398de5f57B33a5b184c806aD217": {
    underlying: "0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402",
    whale: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
    decimals: 18,
  },
  // THE
  "0x86e06EAfa6A1eA631Eab51DE500E3D474933739f": {
    underlying: "0xF4C8E32EaDEC4BFe97E0F595AdD0f4450a863a11",
    whale: "0xfBBF371C9B0B994EebFcC977CEf603F7f31c070D",
    decimals: 18,
  },
};

forking(BLOCK_NUMBER, async () => {
  let comptroller: Contract;

  before(async () => {
    comptroller = new ethers.Contract(bscmainnet.UNITROLLER, COMPTROLLER_ABI, ethers.provider);
  });

  describe("Pre-VIP behavior", async () => {
    for (const market of ALL_MARKETS) {
      it(`${market.symbol} should have non-zero collateral factor in Core Pool`, async () => {
        const data = await comptroller.poolMarkets(CORE_POOL_ID, market.vToken);
        expect(data.collateralFactorMantissa).to.be.gt(0);
      });

      it(`${market.symbol} should have borrowing enabled in Core Pool`, async () => {
        const data = await comptroller.poolMarkets(CORE_POOL_ID, market.vToken);
        expect(data.isBorrowAllowed).to.equal(true);
      });
    }
  });

  testVip("VIP-630", await vip630(), {
    callbackAfterExecution: async txResponse => {
      await expect(txResponse).to.emit(comptroller, "NewCollateralFactor");
      await expect(txResponse).to.emit(comptroller, "BorrowAllowedUpdated");
    },
  });

  describe("Post-VIP behavior", async () => {
    for (const market of ALL_MARKETS) {
      describe(`${market.symbol}`, () => {
        it("should have collateral factor set to 0 in Core Pool", async () => {
          const data = await comptroller.poolMarkets(CORE_POOL_ID, market.vToken);
          expect(data.collateralFactorMantissa).to.equal(0);
        });

        it("should keep liquidation threshold unchanged", async () => {
          const data = await comptroller.poolMarkets(CORE_POOL_ID, market.vToken);
          expect(data.liquidationThresholdMantissa).to.equal(market.liquidationThreshold);
        });

        it("should have borrowing disabled in Core Pool", async () => {
          const data = await comptroller.poolMarkets(CORE_POOL_ID, market.vToken);
          expect(data.isBorrowAllowed).to.equal(false);
        });
      });
    }

    describe("Functional tests: borrow should be blocked", () => {
      let user: Signer;
      let userAddress: string;

      before(async () => {
        userAddress = "0x000000000000000000000000000000000000dEaD";
        user = await initMainnetUser(userAddress, parseUnits("10", 18));
      });

      for (const market of ALL_MARKETS) {
        const info = MARKET_INFO[market.vToken];
        if (!info) continue;

        it(`${market.symbol} should revert when trying to borrow`, async () => {
          const vToken = new ethers.Contract(market.vToken, VTOKEN_ABI, ethers.provider);
          const borrowAmount = parseUnits("1", info.decimals);

          await expect(vToken.connect(user).borrow(borrowAmount)).to.be.revertedWithCustomError(
            comptroller,
            "BorrowNotAllowedInPool",
          );
        });
      }
    });
  });
});
