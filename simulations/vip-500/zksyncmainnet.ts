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
  vip500,
} from "../../vips/vip-500/bscmainnet";
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

forking(59796423, async () => {
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
      it(`keeps 821453073191923071875035 wUSDM of debt in ${A1}`, async () => {
        expect(await vwUSDM.callStatic.borrowBalanceCurrent(A1)).to.equal(parseUnits("821453.073191923071875035", 18));
      });

      it(`keeps 287 wei of vWETH collateral in ${A1}`, async () => {
        expect(await vWETH.balanceOf(A1)).to.equal(287);
      });
    });

    describe(A2, () => {
      it(`have 159332061792005959391 WETH debt in ${A2}`, async () => {
        expect(await vWETH.callStatic.borrowBalanceCurrent(A2)).to.equal(parseUnits("159.332061792005959391", 18));
      });

      it(`have 276009.71020155 vwUSDM of collateral in ${A2}`, async () => {
        expect(await vwUSDM.balanceOf(A2)).to.equal(parseUnits("276009.71020155", 8));
      });
      it("Should have liquidity 0 and 50763221042535155079984 shortfall", async () => {
        const liquidity = (await comptroller.getAccountLiquidity(A2))[1];
        const shortfall = (await comptroller.getAccountLiquidity(A2))[2];
        expect(liquidity).to.equals(0);
        expect(shortfall).to.equals("50763221042535155079984");
      });
    });

    describe(A3, () => {
      it(`have 19381501170 of USDC.e debt in ${A3}`, async () => {
        expect(await vUSDCe.callStatic.borrowBalanceCurrent(A3)).to.equal(parseUnits("19381.501170", 6));
      });

      it(`have 55230683244 of USDT debt in ${A3}`, async () => {
        expect(await vUSDT.callStatic.borrowBalanceCurrent(A3)).to.equal(parseUnits("55230.683244", 6));
      });

      it(`have 4929412019494 of vwUSDM collateral in ${A3}`, async () => {
        expect(await vwUSDM.balanceOf(A3)).to.equals(parseUnits("49294.12019494", 8));
      });
      it("Should have liquidity of 0 and 33047936970212011346903 shortfall", async () => {
        const liquidity = (await comptroller.getAccountLiquidity(A3))[1];
        const shortfall = (await comptroller.getAccountLiquidity(A3))[2];
        expect(liquidity).to.equals(0);
        expect(shortfall).to.equals("33047936970212011346903");
      });
    });

    describe(A4, () => {
      it(`have 35059631167 of USDC.e debt in ${A4}`, async () => {
        expect(await vUSDCe.callStatic.borrowBalanceCurrent(A4)).to.equal(parseUnits("35059.631167", 6));
      });

      it(`have 21622275610 of USDT debt in ${A4}`, async () => {
        expect(await vUSDT.callStatic.borrowBalanceCurrent(A4)).to.equal(parseUnits("21622.275610", 6));
      });

      it(`have 3528279214003 of vwUSDM collateral in ${A4}`, async () => {
        expect(await vwUSDM.balanceOf(A4)).to.equals(parseUnits("35282.79214003", 8));
      });
      it("Should have liquidity of 0 and 26928032011371100330671 shortfall", async () => {
        const liquidity = (await comptroller.getAccountLiquidity(A4))[1];
        const shortfall = (await comptroller.getAccountLiquidity(A4))[2];
        expect(liquidity).to.equals(0);
        expect(shortfall).to.equals("26928032011371100330671");
      });
    });

    describe(A5, () => {
      it(`have 2520139975 of USDC.e debt in ${A5}`, async () => {
        expect(await vUSDCe.callStatic.borrowBalanceCurrent(A5)).to.equal(parseUnits("2520.139975", 6));
      });

      it(`have 8362755443 of USDT debt in ${A5}`, async () => {
        expect(await vUSDT.callStatic.borrowBalanceCurrent(A5)).to.equal(parseUnits("8362.755443", 6));
      });

      it(`have 15966710 of vwUSDM collateral in ${A5}`, async () => {
        expect(await vwUSDM.balanceOf(A5)).to.equals(parseUnits("0.15966710", 8));
      });
      it("Should have liquidity of 0 and 10884404074006198503076 shortfall", async () => {
        const liquidity = (await comptroller.getAccountLiquidity(A5))[1];
        const shortfall = (await comptroller.getAccountLiquidity(A5))[2];
        expect(liquidity).to.equals(0);
        expect(shortfall).to.equals("10884404074006198503076");
      });
    });
  });

  testForkedNetworkVipCommands("vip500 WUSDM Liquidator", await vip500(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionGranted", "PermissionRevoked"], [5, 5]);
      await expectEvents(
        txResponse,
        [VTOKEN_ABI],
        ["NewProtocolSeizeShare", "Mint", "Borrow", "RepayBorrow"],
        [8, 1, 3, 11],
      );
    },
  });

  describe("Post-VIP behaviour", async () => {
    describe(A1, () => {
      it(`keeps 823891.116497470853499569 wUSDM of debt in ${A1}`, async () => {
        expect(await vwUSDM.callStatic.borrowBalanceCurrent(A1)).to.equal(parseUnits("823891.116497470853499569", 18));
      });

      it(`keeps 287 wei of vWETH collateral in ${A1}`, async () => {
        expect(await vWETH.balanceOf(A1)).to.equal(287);
      });
    });

    describe(A2, () => {
      it(`leaves 1 wei of WETH debt in ${A2}`, async () => {
        expect(await vWETH.callStatic.borrowBalanceCurrent(A2)).to.equal(1);
      });

      it(`leaves 0.0000000002 vwUSDM of collateral in ${A2}`, async () => {
        expect(await vwUSDM.balanceOf(A2)).to.equal(2);
      });
      it("Should have liquidity 16868163938 and 0 shortfall", async () => {
        const liquidity = (await comptroller.getAccountLiquidity(A2))[1];
        const shortfall = (await comptroller.getAccountLiquidity(A2))[2];
        expect(liquidity).to.equals("16868163938");
        expect(shortfall).to.equals("0");
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
      it("Should have liquidity of 0 and 1848406508543 shortfall", async () => {
        const liquidity = (await comptroller.getAccountLiquidity(A3))[1];
        const shortfall = (await comptroller.getAccountLiquidity(A3))[2];
        expect(liquidity).to.equals(0);
        expect(shortfall).to.equals("1848406508543");
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
      it("Should have liquidity of 0 and 1519477277052 shortfall", async () => {
        const liquidity = (await comptroller.getAccountLiquidity(A4))[1];
        const shortfall = (await comptroller.getAccountLiquidity(A4))[2];
        expect(liquidity).to.equals(0);
        expect(shortfall).to.equals("1519477277052");
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
      it("Should have liquidity of 0 and 1764065679956 shortfall", async () => {
        const liquidity = (await comptroller.getAccountLiquidity(A5))[1];
        const shortfall = (await comptroller.getAccountLiquidity(A5))[2];
        expect(liquidity).to.equals(0);
        expect(shortfall).to.equals("1764065679956");
      });
    });

    describe("WUSDM Liquidator", () => {
      it(`leaves 159347103634874789742 wei of WETH debt in ${WUSDM_LIQUIDATOR}`, async () => {
        expect(await vWETH.callStatic.borrowBalanceCurrent(WUSDM_LIQUIDATOR)).to.equal(
          parseUnits("159.347103634874789742", 18),
        );
      });
      it(`leaves 56987365052 wei of USDC.e debt in ${WUSDM_LIQUIDATOR}`, async () => {
        expect(await vUSDCe.callStatic.borrowBalanceCurrent(WUSDM_LIQUIDATOR)).to.equal(parseUnits("56987.365052", 6));
      });
      it(`leaves 85259737852 wei of USDT debt in ${WUSDM_LIQUIDATOR}`, async () => {
        expect(await vUSDT.callStatic.borrowBalanceCurrent(WUSDM_LIQUIDATOR)).to.equal(parseUnits("85259.737852", 6));
      });
      it(`leaves less than 72982327973014 wei of vwUSDM collateral in ${WUSDM_LIQUIDATOR}`, async () => {
        expect(await vwUSDM.balanceOf(WUSDM_LIQUIDATOR)).equals("72982327973014");
      });
      it("Should have liquidity of 189693973657450104902580 and 0 shortfall", async () => {
        const liquidity = (await comptroller.getAccountLiquidity(WUSDM_LIQUIDATOR))[1];
        const shortfall = (await comptroller.getAccountLiquidity(WUSDM_LIQUIDATOR))[2];
        expect(liquidity).to.equals("189693973657450104902580");
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
