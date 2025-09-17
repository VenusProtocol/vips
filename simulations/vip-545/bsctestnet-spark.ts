import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, setMaxStalePeriodInChainlinkOracle } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { POOL_SPECS, UNITROLLER, vip545 } from "../../vips/vip-545/bsctestnet-spark";
import { vip545 as stablecoinVip } from "../../vips/vip-545/bsctestnet-stablecoins";
import COMPTROLLER_ABI from "./abi/Comptroller.json";

const BTCB = "0xA808e341e8e723DC6BA0Bb5204Bafc2330d7B8e4";
const USDC = "0x16227D60f7a0e586C66B005219dfc887D13C9531";
const USDT = "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c";
const assets = [BTCB, USDC, USDT];

forking(65570708, async () => {
  let comptroller: Contract;

  before(async () => {
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, UNITROLLER);
    for (const asset of assets) {
      await setMaxStalePeriodInChainlinkOracle(
        NETWORK_ADDRESSES.bsctestnet.CHAINLINK_ORACLE,
        asset,
        ethers.constants.AddressZero,
        NETWORK_ADDRESSES.bsctestnet.NORMAL_TIMELOCK,
        315360000,
      );
    }
  });

  describe("Pre-VIP state", async () => {
    it("check the new poolId does not exist", async () => {
      expect(await comptroller.lastPoolId()).to.be.lessThan(POOL_SPECS.id);
    });
  });

  // first execute stablecoins VIP to match the the lastPoolId, or change the poolID to 1 in VIP commands
  testVip("stablecoins-vip", await stablecoinVip(), {});

  testVip("VIP-545", await vip545(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI],
        [
          "PoolCreated",
          "NewCollateralFactor",
          "NewLiquidationThreshold",
          "NewLiquidationIncentive",
          "PoolMarketInitialized",
        ],
        [1, 1, 1, 3, 3],
      );
    },
  });

  describe("Post-VIP state", async () => {
    it("should update lastPoolId to the new pool", async () => {
      expect(await comptroller.lastPoolId()).to.equals(POOL_SPECS.id);
    });

    it("should set the newly created pool as active with correct label", async () => {
      const newPool = await comptroller.pools(POOL_SPECS.id);
      expect(newPool.label).to.equals(POOL_SPECS.label);
      expect(newPool.isActive).to.equals(true);
    });

    it("should set the correct risk parameters to all pool markets", async () => {
      for (const market of POOL_SPECS.marketsConfig) {
        const marketData = await comptroller.poolMarkets(POOL_SPECS.id, market.address);
        expect(marketData.marketPoolId).to.be.equal(POOL_SPECS.id);
        expect(marketData.isListed).to.be.equal(true);
        expect(marketData.collateralFactorMantissa).to.be.equal(market.collateralFactor);
        expect(marketData.liquidationThresholdMantissa).to.be.equal(market.liquidationThreshold);
        expect(marketData.liquidationIncentiveMantissa).to.be.equal(market.liquidationIncentive);
        expect(marketData.isBorrowAllowed).to.be.equal(market.borrowAllowed);
      }
    });
  });
});
