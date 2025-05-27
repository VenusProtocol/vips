import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, setMaxStalePeriodInChainlinkOracle } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import {
  WUSDM,
  WUSDM_AMOUNT,
  WUSDM_LIQUIDATOR,
  ZKSYNCMAINNET_COMPTROLLER_BEACON,
  ZKSYNC_COMPTROLLER_IMPL,
  vip502,
} from "../../vips/vip-502/bscmainnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";
import COMPTROLLER_BEACON_ABI from "./abi/Beacon.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import VTOKEN_ABI from "./abi/vToken.json";
import ERC20_ABI from "./abi/wusdm.json";

const ORIGINAL_MIN_LIQUIDATABLE_COLLATERAL = parseUnits("100", 18);
const ORIGINAL_LT = parseUnits("0.78", 18);
const ORIGINAL_PROTOCOL_SEIZE_SHARE = parseUnits("0.05", 18);
const ORIGINAL_CLOSE_FACTOR = parseUnits("0.5", 18);

const COMPTROLLER = "0xddE4D098D9995B659724ae6d5E3FB9681Ac941B1";
const VWUSDM = "0x183dE3C349fCf546aAe925E1c7F364EA6FB4033c";
const VWETH = "0x1Fa916C27c7C2c4602124A14C77Dbb40a5FF1BE8";
const VUSDCE = "0x1aF23bD57c62A99C59aD48236553D0Dd11e49D2D";
const VUSDT = "0x69cDA960E3b20DFD480866fFfd377Ebe40bd0A46";
const USDM = "0x7715c206A14Ac93Cb1A6c0316A6E5f8aD7c9Dc31";

const A1 = "0x68c8020A052d5061760e2AbF5726D59D4ebe3506";
const A2 = "0x4C0e4B3e6c5756fb31886a0A01079701ffEC0561";
const A3 = "0x924EDEd3D010b3F20009b872183eec48D0111265";
const A4 = "0x2B379d8c90e02016658aD00ba2566F55E814C369";
const A5 = "0xfffAB9120d9Df39EEa07063F6465a0aA45a80C52";

forking(60447320, async () => {
  let vwUSDM: Contract;
  let vWETH: Contract;
  let vUSDCe: Contract;
  let vUSDT: Contract;
  let comptroller: Contract;
  let beacon: Contract;
  let wusdm: Contract;
  let treasuryBalanceBefore: BigNumber;

  before(async () => {
    vwUSDM = await ethers.getContractAt(VTOKEN_ABI, VWUSDM);
    vWETH = await ethers.getContractAt(VTOKEN_ABI, VWETH);
    vUSDCe = await ethers.getContractAt(VTOKEN_ABI, VUSDCE);
    vUSDT = await ethers.getContractAt(VTOKEN_ABI, VUSDT);
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER);
    beacon = await ethers.getContractAt(COMPTROLLER_BEACON_ABI, ZKSYNCMAINNET_COMPTROLLER_BEACON);
    wusdm = await ethers.getContractAt(ERC20_ABI, WUSDM);
    await setMaxStalePeriodInChainlinkOracle(
      NETWORK_ADDRESSES.zksyncmainnet.CHAINLINK_ORACLE,
      USDM,
      ethers.constants.AddressZero,
      NETWORK_ADDRESSES.zksyncmainnet.NORMAL_TIMELOCK,
    );
    await setMaxStalePeriodInChainlinkOracle(
      NETWORK_ADDRESSES.zksyncmainnet.CHAINLINK_ORACLE,
      await vUSDCe.underlying(),
      ethers.constants.AddressZero,
      NETWORK_ADDRESSES.zksyncmainnet.NORMAL_TIMELOCK,
    );
    await setMaxStalePeriodInChainlinkOracle(
      NETWORK_ADDRESSES.zksyncmainnet.CHAINLINK_ORACLE,
      await vUSDT.underlying(),
      ethers.constants.AddressZero,
      NETWORK_ADDRESSES.zksyncmainnet.NORMAL_TIMELOCK,
    );
    await setMaxStalePeriodInChainlinkOracle(
      NETWORK_ADDRESSES.zksyncmainnet.CHAINLINK_ORACLE,
      await vWETH.underlying(),
      ethers.constants.AddressZero,
      NETWORK_ADDRESSES.zksyncmainnet.NORMAL_TIMELOCK,
    );
  });

  describe("Pre-VIP behaviour", async () => {
    describe("Previous states", () => {
      it("MINT, BORROW & ENTER_MARKET actions should be paused on wusdm market on ZKsync mainnet", async () => {
        expect(await comptroller.actionPaused(VWUSDM, 0)).to.equal(true);
        expect(await comptroller.actionPaused(VWUSDM, 2)).to.equal(true);
        expect(await comptroller.actionPaused(VWUSDM, 7)).to.equal(true);
      });

      it("Treasury should have wusdm worth $400k", async () => {
        treasuryBalanceBefore = await wusdm.balanceOf(NETWORK_ADDRESSES.zksyncmainnet.VTREASURY);
        expect(treasuryBalanceBefore).equals(WUSDM_AMOUNT);
      });
    });
    describe(A1, () => {
      it(`should have 839534.538215709374271750 wUSDM of debt in ${A1}`, async () => {
        expect(await vwUSDM.callStatic.borrowBalanceCurrent(A1)).to.equal(parseUnits("839534.538215709374271750", 18));
      });

      it(`should have 287 wei of vWETH collateral in ${A1}`, async () => {
        expect(await vWETH.balanceOf(A1)).to.equal(287);
      });
    });

    describe(A2, () => {
      it(`should have 159.448652644734227500 WETH debt in ${A2}`, async () => {
        expect(await vWETH.callStatic.borrowBalanceCurrent(A2)).to.equal(parseUnits("159.448652644734227500", 18));
      });

      it(`should have 276009.71020155 vwUSDM of collateral in ${A2}`, async () => {
        expect(await vwUSDM.balanceOf(A2)).to.equal(parseUnits("276009.71020155", 8));
      });

      it("should have liquidity 0 and 174873.449922345917567694 shortfall", async () => {
        const liquidity = (await comptroller.getAccountLiquidity(A2))[1];
        const shortfall = (await comptroller.getAccountLiquidity(A2))[2];
        expect(liquidity).to.equals(0);
        expect(shortfall).to.equals(parseUnits("174873.449922345917567694", 18));
      });
    });

    describe(A3, () => {
      it(`should have 19454.409629 USDC.e debt in ${A3}`, async () => {
        expect(await vUSDCe.callStatic.borrowBalanceCurrent(A3)).to.equal(parseUnits("19454.409629", 6));
      });

      it(`should have 55443.555908 USDT debt in ${A3}`, async () => {
        expect(await vUSDT.callStatic.borrowBalanceCurrent(A3)).to.equal(parseUnits("55443.555908", 6));
      });

      it(`should have 49294.12019494 vwUSDM collateral in ${A3}`, async () => {
        expect(await vwUSDM.balanceOf(A3)).to.equals(parseUnits("49294.12019494", 8));
      });

      it("should have liquidity of 0 and 33255.622452841803340737 shortfall", async () => {
        const liquidity = (await comptroller.getAccountLiquidity(A3))[1];
        const shortfall = (await comptroller.getAccountLiquidity(A3))[2];
        expect(liquidity).to.equals(0);
        expect(shortfall).to.equals(parseUnits("33255.622452841803340737", 18));
      });
    });

    describe(A4, () => {
      it(`should have 35191.516910 USDC.e debt in ${A4}`, async () => {
        expect(await vUSDCe.callStatic.borrowBalanceCurrent(A4)).to.equal(parseUnits("35191.516910", 6));
      });

      it(`should have 21705.613188 USDT debt in ${A4}`, async () => {
        expect(await vUSDT.callStatic.borrowBalanceCurrent(A4)).to.equal(parseUnits("21705.613188", 6));
      });

      it(`should have 35282.79214003 vwUSDM collateral in ${A4}`, async () => {
        expect(await vwUSDM.balanceOf(A4)).to.equals(parseUnits("35282.79214003", 8));
      });

      it("should have liquidity of 0 and 27089.452755460905596595 shortfall", async () => {
        const liquidity = (await comptroller.getAccountLiquidity(A4))[1];
        const shortfall = (await comptroller.getAccountLiquidity(A4))[2];
        expect(liquidity).to.equals(0);
        expect(shortfall).to.equals(parseUnits("27089.452755460905596595", 18));
      });
    });

    describe(A5, () => {
      it(`should have 2529.620124 USDC.e debt in ${A5}`, async () => {
        expect(await vUSDCe.callStatic.borrowBalanceCurrent(A5)).to.equal(parseUnits("2529.620124", 6));
      });

      it(`should have 8394.987563 USDT debt in ${A5}`, async () => {
        expect(await vUSDT.callStatic.borrowBalanceCurrent(A5)).to.equal(parseUnits("8394.987563", 6));
      });

      it(`should have 0.15966710 vwUSDM collateral in ${A5}`, async () => {
        expect(await vwUSDM.balanceOf(A5)).to.equals(parseUnits("0.15966710", 8));
      });

      it("should have liquidity of 0 and 10925.018166774018463940 shortfall", async () => {
        const liquidity = (await comptroller.getAccountLiquidity(A5))[1];
        const shortfall = (await comptroller.getAccountLiquidity(A5))[2];
        expect(liquidity).to.equals(0);
        expect(shortfall).to.equals(parseUnits("10925.018166774018463940", 18));
      });
    });
  });

  testForkedNetworkVipCommands("vip502 WUSDM Liquidator", await vip502(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionGranted", "PermissionRevoked"], [5, 5]);
      await expectEvents(
        txResponse,
        [VTOKEN_ABI],
        ["NewProtocolSeizeShare", "Mint", "Borrow", "RepayBorrow"],
        [8, 1, 3, 10],
      );
    },
  });

  describe("Post-VIP behaviour", async () => {
    describe(A1, () => {
      it(`keeps 841972.581643864776333060 wUSDM of debt in ${A1}`, async () => {
        expect(await vwUSDM.callStatic.borrowBalanceCurrent(A1)).to.equal(parseUnits("841972.581643864776333060", 18));
      });

      it(`keeps 287 wei of vWETH collateral in ${A1}`, async () => {
        expect(await vWETH.balanceOf(A1)).to.equal(287);
      });
    });

    describe(A2, () => {
      it(`leaves 53.265110392384148570 WETH debt in ${A2}`, async () => {
        expect(await vWETH.callStatic.borrowBalanceCurrent(A2)).to.equal(parseUnits("53.265110392384148570", 18));
      });

      it(`leaves 0.0000000002 vwUSDM of collateral in ${A2}`, async () => {
        expect(await vwUSDM.balanceOf(A2)).to.equal(2);
      });

      it("should have liquidity 0 and 136315.548386706514545234 shortfall", async () => {
        const liquidity = (await comptroller.getAccountLiquidity(A2))[1];
        const shortfall = (await comptroller.getAccountLiquidity(A2))[2];
        expect(liquidity).to.equals("0");
        expect(shortfall).to.equals(parseUnits("136315.548386706514545234", 18));
      });
    });

    describe(A3, () => {
      it(`leaves 1 wei of USDC.e debt in ${A3}`, async () => {
        expect(await vUSDCe.callStatic.borrowBalanceCurrent(A3)).to.equal(1);
      });

      it(`leaves 1 wei of USDT debt in ${A3}`, async () => {
        expect(await vUSDT.callStatic.borrowBalanceCurrent(A3)).to.equal(1);
      });

      it(`leaves less than 100 wei of vwUSDM collateral in ${A3}`, async () => {
        expect(await vwUSDM.balanceOf(A3)).to.be.lt(100);
      });

      it("should have liquidity of 0 and 0.000001890260159346 shortfall", async () => {
        const liquidity = (await comptroller.getAccountLiquidity(A3))[1];
        const shortfall = (await comptroller.getAccountLiquidity(A3))[2];
        expect(liquidity).to.equals(0);
        expect(shortfall).to.equals(parseUnits("0.000001890260159346", 18));
      });
    });

    describe(A4, () => {
      it(`leaves 1 wei of USDC.e debt in ${A4}`, async () => {
        expect(await vUSDCe.callStatic.borrowBalanceCurrent(A4)).to.equal(1);
      });

      it(`leaves 1 wei of USDT debt in ${A4}`, async () => {
        expect(await vUSDT.callStatic.borrowBalanceCurrent(A4)).to.equal(1);
      });

      it(`leaves less than 100 wei of vwUSDM collateral in ${A4}`, async () => {
        expect(await vwUSDM.balanceOf(A4)).to.be.lt(100);
      });

      it("should have liquidity of 0 and 0.000001172141970450 shortfall", async () => {
        const liquidity = (await comptroller.getAccountLiquidity(A4))[1];
        const shortfall = (await comptroller.getAccountLiquidity(A4))[2];
        expect(liquidity).to.equals(0);
        expect(shortfall).to.equals(parseUnits("0.000001172141970450", 18));
      });
    });

    describe(A5, () => {
      it(`leaves 1 wei of USDC.e debt in ${A5}`, async () => {
        expect(await vUSDCe.callStatic.borrowBalanceCurrent(A5)).to.equal(1);
      });

      it(`leaves 1 wei of USDT debt in ${A5}`, async () => {
        expect(await vUSDT.callStatic.borrowBalanceCurrent(A5)).to.equal(1);
      });

      it(`leaves less than 100 wei of vwUSDM collateral in ${A5}`, async () => {
        expect(await vwUSDM.balanceOf(A5)).to.be.lt(100);
      });

      it("should have liquidity of 0 and 0.000001467837695289 shortfall", async () => {
        const liquidity = (await comptroller.getAccountLiquidity(A5))[1];
        const shortfall = (await comptroller.getAccountLiquidity(A5))[2];
        expect(liquidity).to.equals(0);
        expect(shortfall).to.equals(parseUnits("0.000001467837695289", 18));
      });
    });

    describe("WUSDM Liquidator", () => {
      it(`leaves 106.196819657296471558 WETH debt in ${WUSDM_LIQUIDATOR}`, async () => {
        expect(await vWETH.callStatic.borrowBalanceCurrent(WUSDM_LIQUIDATOR)).to.equal(
          parseUnits("106.196819657296471558", 18),
        );
      });

      it(`leaves 57205.816519 USDC.e debt in ${WUSDM_LIQUIDATOR}`, async () => {
        expect(await vUSDCe.callStatic.borrowBalanceCurrent(WUSDM_LIQUIDATOR)).to.equal(parseUnits("57205.816519", 6));
      });

      it(`leaves 85590.182012 USDT debt in ${WUSDM_LIQUIDATOR}`, async () => {
        expect(await vUSDT.callStatic.borrowBalanceCurrent(WUSDM_LIQUIDATOR)).to.equal(parseUnits("85590.182012", 6));
      });

      it(`leaves 729823.27972943 vwUSDM collateral in ${WUSDM_LIQUIDATOR}`, async () => {
        expect(await vwUSDM.balanceOf(WUSDM_LIQUIDATOR)).equals(parseUnits("729823.27972943", 8));
      });

      it("should have liquidity of 202005.651814161727837360 and 0 shortfall", async () => {
        const liquidity = (await comptroller.getAccountLiquidity(WUSDM_LIQUIDATOR))[1];
        const shortfall = (await comptroller.getAccountLiquidity(WUSDM_LIQUIDATOR))[2];
        expect(liquidity).to.equals(parseUnits("202005.651814161727837360", 18));
        expect(shortfall).to.equals(0);
      });
    });

    describe("Restores the parameters correctly", () => {
      it(`sets protocol seize share to ${formatUnits(ORIGINAL_PROTOCOL_SEIZE_SHARE, 18)}`, async () => {
        for (const vToken of [vwUSDM, vWETH, vUSDCe, vUSDT]) {
          expect(await vToken.protocolSeizeShareMantissa()).to.equal(ORIGINAL_PROTOCOL_SEIZE_SHARE);
        }
      });

      it(`sets the close factor to ${formatUnits(ORIGINAL_CLOSE_FACTOR, 18)}`, async () => {
        expect(await comptroller.closeFactorMantissa()).to.equal(ORIGINAL_CLOSE_FACTOR);
      });

      it(`sets min liquidatable collateral to ${formatUnits(ORIGINAL_MIN_LIQUIDATABLE_COLLATERAL, 18)}`, async () => {
        expect(await comptroller.minLiquidatableCollateral()).to.equal(ORIGINAL_MIN_LIQUIDATABLE_COLLATERAL);
      });

      it("keeps supply, borrow and enter market actions paused for vWUSDM", async () => {
        expect(await comptroller.actionPaused(VWUSDM, 0)).to.equal(true);
        expect(await comptroller.actionPaused(VWUSDM, 2)).to.equal(true);
        expect(await comptroller.actionPaused(VWUSDM, 7)).to.equal(true);
      });

      it(`keeps CF 0 and LT ${formatUnits(ORIGINAL_LT)} for vwUSDM`, async () => {
        const marketInfo = await comptroller.markets(VWUSDM);
        expect(marketInfo.collateralFactorMantissa).to.equal(0);
        expect(marketInfo.liquidationThresholdMantissa).to.equal(ORIGINAL_LT);
      });
      it("Comptroller points to correct implementation", async () => {
        expect(await beacon.implementation()).equals(ZKSYNC_COMPTROLLER_IMPL);
      });
    });

    describe("Treasury", () => {
      it("Treasury balance should be deducted by 400k wusdm", async () => {
        const treasuryBalanceNow = await wusdm.balanceOf(NETWORK_ADDRESSES.zksyncmainnet.VTREASURY);
        expect(treasuryBalanceNow).equals(0);
      });
    });
  });
});
