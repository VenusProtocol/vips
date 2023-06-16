import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { forking, pretendExecutingVip, testVip } from "../../src/vip-framework";
import { vipDiamondTestnet } from "../../vips/vip-Diamond-comptroller-testnet";
import Comptroller from "./abi/Comptroller.json";
import IERC20Upgradeable from "./abi/IERC20UpgradableAbi.json";
import VBEP20_DELEGATE_ABI from "./abi/VBep20DelegateAbi.json";

const UNITROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
const DIAMOND = "0x52B88fc3F47f607DdcE4048c243050B7576e9cbD";

const Owner = "0xce10739590001705F7FF231611ba4A48B2820327";
const zeroAddr = "0x0000000000000000000000000000000000000000";
const VBUSD = "0x08e0A5575De71037aE36AbfAfb516595fE68e5e4";
const VUSDT = "0xb7526572FFE56AB9D7489838Bf2E18e3323b441A";

const initMainnetUser = async (user: string) => {
  await impersonateAccount(user);
  return ethers.getSigner(user);
};

forking(29886033, async () => {
  let owner: any,
    unitroller: Contract,
    // layout variables
    oracle: any,
    maxAssets: any,
    closeFactorMantissa: any,
    liquidationIncentiveMantissa: any,
    allMarkets: any,
    venusRate: any,
    venusSpeeds: any,
    venusSupplyState: any,
    venusBorrowState: any,
    venusAccrued: any,
    vaiMintRate: any,
    vaiController: any,
    mintedVAIs: any,
    mintVAIGuardianPaused: any,
    repayVAIGuardianPaused: any,
    protocolPaused: any,
    venusVAIVaultRate: any,
    vaiVaultAddress: any,
    releaseStartBlock: any,
    minReleaseAmount: any,
    treasuryGuardian: any,
    treasuryAddress: any,
    treasuryPercent: any,
    liquidatorContract: any,
    comptrollerLens: any,

  const borrowSpeeds: any = {};
  const supplySpeeds: any = {}
  const userBorrowIndexes: any = {};
  const userSupplyIndexes: any = {};
  const markets: any = {};

  let BUSD: ethers.contract;
  let usdtHolder: ethers.Signer;
  let busdHolder: ethers.Signer;
  let vBUSD: ethers.contract;
  let vUSDT: ethers.contract;
  let diamondUnitroller: Contract;

  before(async () => {
    unitroller = new ethers.Contract(UNITROLLER, Comptroller, ethers.provider);

    diamondUnitroller = new ethers.Contract(unitroller.address, Comptroller, ethers.provider);

    await impersonateAccount(Owner);
    owner = await ethers.getSigner(Owner);
    const [signer] = await ethers.getSigners();
    await signer.sendTransaction({
      to: owner.address,
      value: ethers.BigNumber.from("10000000000000000000"),
      data: undefined,
    });

    busdHolder = await initMainnetUser("0xC825AD791A6046991e3706b6342970f6d87e4888");

    usdtHolder = await initMainnetUser("0xa0747a72C329377C2CE4F0F3165197B3a5359EfE");

    [vBUSD, vUSDT] = await Promise.all(
      [VBUSD, VUSDT].map((address: string) => {
        return new ethers.Contract(address, VBEP20_DELEGATE_ABI, ethers.provider);
      }),
    );

    [BUSD] = await Promise.all(
      [vBUSD].map(async (vToken: any) => {
        const underlying = await vToken.underlying();
        return new ethers.Contract(underlying, IERC20Upgradeable, ethers.provider);
      }),
    );
  });

  describe("Verify Storage slots before vip execution", async () => {
    // These tests checks the storage collision of comptroller while updating it via diamond.
    describe("Diamond deployed successfully before vip execution", async () => {
      it("Owner of Diamond unitroller contract should match", async () => {
        const UnitrollerAdmin = await unitroller.admin();
        const pendingAdmin = await unitroller.pendingAdmin();
        expect(UnitrollerAdmin.toLowerCase()).to.equal(Owner.toLowerCase());
        expect(pendingAdmin.toLowerCase()).to.equal(zeroAddr);
      });

      it("Diamond Unitroller Implementation (comptroller) should match the diamond Proxy Address", async () => {
        const comptrollerImplementation = await unitroller.comptrollerImplementation();
        console.log("implementation address", comptrollerImplementation);
        const pendingComptrollerImplementation = await unitroller.pendingComptrollerImplementation();
        expect(comptrollerImplementation.toLowerCase()).to.equal(
          "0xc934A1b15b30E9b515D8A87b5054432B9b965131".toLowerCase(),
        );
        expect(pendingComptrollerImplementation.toLowerCase()).to.equal(zeroAddr);
      });
    });

    describe("Verify storage layout before vip execution", async () => {
      it("verify all the state before and after upgrade", async () => {
        oracle = await unitroller.oracle();

        maxAssets = await unitroller.maxAssets();

        closeFactorMantissa = await unitroller.closeFactorMantissa();

        liquidationIncentiveMantissa = await unitroller.liquidationIncentiveMantissa();

        venusRate = await unitroller.venusRate();

        venusSpeeds = await unitroller.venusSpeeds(BUSD.address);

        venusSupplyState = await unitroller.venusSupplyState(BUSD.address);

        venusBorrowState = await unitroller.venusBorrowState(BUSD.address);

        venusAccrued = await unitroller.venusAccrued(BUSD.address);

        vaiMintRate = await unitroller.vaiMintRate();

        vaiController = await unitroller.vaiController();

        mintedVAIs = await unitroller.mintedVAIs(busdHolder.address);

        mintVAIGuardianPaused = await unitroller.mintVAIGuardianPaused();

        repayVAIGuardianPaused = await unitroller.repayVAIGuardianPaused();

        protocolPaused = await unitroller.protocolPaused();

        venusVAIVaultRate = await unitroller.venusVAIVaultRate();

        vaiVaultAddress = await unitroller.vaiVaultAddress();

        releaseStartBlock = await unitroller.releaseStartBlock();

        minReleaseAmount = await unitroller.minReleaseAmount();

        treasuryGuardian = await unitroller.treasuryGuardian();

        treasuryAddress = await unitroller.treasuryAddress();

        treasuryPercent = await unitroller.treasuryPercent();

        liquidatorContract = await unitroller.liquidatorContract();

        comptrollerLens = await unitroller.comptrollerLens();

        // checking all public mappings
        allMarkets = await unitroller.getAllMarkets();

        for( const marketIndex in allMarkets) {
          const marketAddress = allMarkets[marketIndex].toString()

          borrowSpeeds[marketAddress] = await unitroller.venusBorrowSpeeds(marketAddress)
          supplySpeeds[marketAddress] = await unitroller.venusSupplySpeeds(marketAddress);
          markets[marketAddress] = await unitroller.markets(marketAddress);

          userBorrowIndexes[marketAddress] = await unitroller.venusBorrowerIndex(marketAddress, busdHolder.address);
          userSupplyIndexes[marketAddress] = await unitroller.venusSupplierIndex(marketAddress, busdHolder.address);
        }
      });
    });
  });

  testVip("VIP-Diamond Contract Migration", vipDiamondTestnet());

  describe("Verify Storage slots after VIP execution", async () => {
    // These tests checks the storage collision of comptroller while updating it via diamond.
    describe("Diamond deployed successfully after VIP execution", async () => {
      it("Owner of Diamond unitroller contract should match", async () => {
        const diamondUnitrollerAdmin = await diamondUnitroller.admin();
        const pendingAdmin = await diamondUnitroller.pendingAdmin();
        expect(diamondUnitrollerAdmin.toLowerCase()).to.equal(Owner.toLowerCase());
        expect(pendingAdmin.toLowerCase()).to.equal(zeroAddr);
      });

      it("Diamond Unitroller Implementation (comptroller) should match the diamond Proxy Address", async () => {
        const comptrollerImplementation = await diamondUnitroller.comptrollerImplementation();
        const pendingComptrollerImplementation = await diamondUnitroller.pendingComptrollerImplementation();
        expect(comptrollerImplementation.toLowerCase()).to.equal(DIAMOND.toLowerCase());
        expect(pendingComptrollerImplementation.toLowerCase()).to.equal(zeroAddr);
      });
    });

    describe("Verify storage layout after VIP execution", async () => {
      it("verify all the state before and after upgrade", async () => {
        const oracelUpgrade = await diamondUnitroller.oracle();
        expect(oracle).to.equal(oracelUpgrade);

        const maxAssetsAfterUpgrade = await diamondUnitroller.maxAssets();
        expect(maxAssets).to.equal(maxAssetsAfterUpgrade);

        const closeFactorMantissaAfterUpgrade = await diamondUnitroller.closeFactorMantissa();
        expect(closeFactorMantissa).to.equal(closeFactorMantissaAfterUpgrade);

        const liquidationIncentiveMantissaAfterUpgrade = await diamondUnitroller.liquidationIncentiveMantissa();
        expect(liquidationIncentiveMantissa).to.equal(liquidationIncentiveMantissaAfterUpgrade);

        const venusRateAfterUpgrade = await diamondUnitroller.venusRate();
        expect(venusRate).to.equal(venusRateAfterUpgrade);

        const venusSpeedsAfterUpgrade = await diamondUnitroller.venusSpeeds(BUSD.address);
        expect(venusSpeeds).to.equal(venusSpeedsAfterUpgrade);

        const venusSupplyStateAfterUpgrade = await diamondUnitroller.venusSupplyState(BUSD.address);
        expect(venusSupplyState.index.toString()).to.equal(venusSupplyStateAfterUpgrade.index.toString());

        const venusBorrowStateAfterUpgrade = await diamondUnitroller.venusBorrowState(BUSD.address);
        expect(venusBorrowState.index.toString()).to.equal(venusBorrowStateAfterUpgrade.index.toString());

        const venusAccruedAfterUpgrade = await diamondUnitroller.venusAccrued(BUSD.address);
        expect(venusAccrued).to.equal(venusAccruedAfterUpgrade);

        const vaiMintRateAfterUpgrade = await diamondUnitroller.vaiMintRate();
        expect(vaiMintRate).to.equal(vaiMintRateAfterUpgrade);

        const vaiControllerUpgrade = await diamondUnitroller.vaiController();
        expect(vaiControllerUpgrade).to.equal(vaiController);

        const mintedVAIsUpgrade = await diamondUnitroller.mintedVAIs(busdHolder.address);
        expect(mintedVAIsUpgrade).to.equal(mintedVAIs);

        const mintVAIGuardianPausedUpgrade = await diamondUnitroller.mintVAIGuardianPaused();
        expect(mintVAIGuardianPausedUpgrade).to.equal(mintVAIGuardianPaused);

        const repayVAIGuardianPausedUpgrade = await diamondUnitroller.repayVAIGuardianPaused();
        expect(repayVAIGuardianPausedUpgrade).to.equal(repayVAIGuardianPaused);

        const protocolPausedUpgrade = await diamondUnitroller.protocolPaused();
        expect(protocolPausedUpgrade).to.equal(protocolPaused);

        const venusVAIVaultRateUpgrade = await diamondUnitroller.venusVAIVaultRate();
        expect(venusVAIVaultRateUpgrade).to.equal(venusVAIVaultRate);

        const vaiVaultAddressUpgrade = await diamondUnitroller.vaiVaultAddress();
        expect(vaiVaultAddressUpgrade).to.equal(vaiVaultAddress);

        const releaseStartBlockUpgrade = await diamondUnitroller.releaseStartBlock();
        expect(releaseStartBlockUpgrade).to.equal(releaseStartBlock);

        const minReleaseAmountUpgrade = await diamondUnitroller.minReleaseAmount();
        expect(minReleaseAmountUpgrade).to.equal(minReleaseAmount);

        const treasuryGuardianUpgrade = await diamondUnitroller.treasuryGuardian();
        expect(treasuryGuardian).to.equal(treasuryGuardianUpgrade);

        const treasuryAddressUpgrade = await diamondUnitroller.treasuryAddress();
        expect(treasuryAddress).to.equal(treasuryAddressUpgrade);

        const treasuryPercentUpgrade = await diamondUnitroller.treasuryPercent();
        expect(treasuryPercent).to.equal(treasuryPercentUpgrade);

        const liquidatorContractUpgrade = await diamondUnitroller.liquidatorContract();
        expect(liquidatorContract).to.equal(liquidatorContractUpgrade);

        const comptrollerLensUpgrade = await diamondUnitroller.comptrollerLens();
        expect(comptrollerLens).to.equal(comptrollerLensUpgrade);

        // checking all public mappings
        for( const marketIndex in allMarkets) {
          const marketAddress = allMarkets[marketIndex].toString()

          const marketUpgrade = await diamondUnitroller.markets(marketAddress);
          expect(markets[marketAddress].collateralFactorMantissa).to.equal(marketUpgrade.collateralFactorMantissa);
          expect(markets[marketAddress].isListed).to.equal(marketUpgrade.isListed);
          expect(markets[marketAddress].isVenus).to.equal(marketUpgrade.isVenus);

          const venusBorrowSpeed = await diamondUnitroller.venusBorrowSpeeds(marketAddress);
          const venusSupplySpeed = await diamondUnitroller.venusSupplySpeeds(marketAddress);
          expect(borrowSpeeds[marketAddress]).to.equal(venusBorrowSpeed);
          expect(supplySpeeds[marketAddress]).to.equal(venusSupplySpeed);

          const userBorrowIndex = await diamondUnitroller.venusBorrowerIndex(marketAddress, busdHolder.address);
          const userSupplyIndex= await diamondUnitroller.venusSupplierIndex(marketAddress, busdHolder.address);
          expect(userBorrowIndexes[marketAddress]).to.equal(userBorrowIndex);
          expect(userSupplyIndexes[marketAddress]).to.equal(userSupplyIndex);
        }
      });
    });
  });

  describe("Verify states of diamond Contract", () => {
    describe("Diamond setters", () => {
      it("setting market supply cap", async () => {
        const currentSupplyCap = (await diamondUnitroller.supplyCaps(vBUSD.address)).toString();
        await diamondUnitroller.connect(owner)._setMarketSupplyCaps([vBUSD.address], [parseUnits("100000", 18)]);
        expect(await diamondUnitroller.supplyCaps(vBUSD.address)).to.equals(parseUnits("100000", 18));
        await diamondUnitroller.connect(owner)._setMarketSupplyCaps([vBUSD.address], [parseUnits(currentSupplyCap, 0)]);
        expect(await diamondUnitroller.supplyCaps(vBUSD.address)).to.equals(parseUnits(currentSupplyCap, 0));
      });

      it("setting close factor", async () => {
        const currentCloseFactor = (await diamondUnitroller.closeFactorMantissa()).toString();
        await diamondUnitroller.connect(owner)._setCloseFactor(parseUnits("10000", 18));
        expect(await diamondUnitroller.closeFactorMantissa()).to.equals(parseUnits("10000", 18));
        await diamondUnitroller.connect(owner)._setCloseFactor(parseUnits(currentCloseFactor, 0));
        expect(await diamondUnitroller.closeFactorMantissa()).to.equals(parseUnits(currentCloseFactor, 0));
      });

      it("setting Liquidation Incentive", async () => {
        await diamondUnitroller.connect(owner)._setLiquidationIncentive(parseUnits("13", 17));
        expect(await diamondUnitroller.liquidationIncentiveMantissa()).to.equal(parseUnits("13", 17));

        await diamondUnitroller.connect(owner)._setLiquidationIncentive(parseUnits("11", 17));
        expect(await diamondUnitroller.liquidationIncentiveMantissa()).to.equal(parseUnits("11", 17));
      });

      it("setting Pause Guardian", async () => {
        const currentPauseGuardia = (await diamondUnitroller.pauseGuardian()).toString();

        await diamondUnitroller.connect(owner)._setPauseGuardian(owner.address);
        expect(await diamondUnitroller.pauseGuardian()).to.equal(owner.address);

        await diamondUnitroller.connect(owner)._setPauseGuardian(currentPauseGuardia);
        expect(await diamondUnitroller.pauseGuardian()).to.equal(currentPauseGuardia);
      });

      it("setting market borrow cap", async () => {
        const currentBorrowCap = (await diamondUnitroller.borrowCaps(vUSDT.address)).toString();
        await diamondUnitroller.connect(owner)._setMarketBorrowCaps([vUSDT.address], [parseUnits("10000", 18)]);
        expect(await diamondUnitroller.borrowCaps(vUSDT.address)).to.equal(parseUnits("10000", 18));

        await diamondUnitroller.connect(owner)._setMarketBorrowCaps([vUSDT.address], [currentBorrowCap]);
        expect(await diamondUnitroller.borrowCaps(vUSDT.address)).to.equal(currentBorrowCap);
      });

      it("pausing mint action in vBUSD", async () => {
        expect(await diamondUnitroller.connect(owner)._setActionsPaused([vBUSD.address], [0], true)).to.emit(
          vBUSD,
          "ActionPausedMarket",
        );
        await BUSD.connect(busdHolder).approve(vBUSD.address, 1200);
        await expect(vBUSD.connect(usdtHolder).mint(1000)).to.be.revertedWith("action is paused");

        expect(await diamondUnitroller.connect(owner)._setActionsPaused([vBUSD.address], [0], false)).to.emit(
          vBUSD,
          "ActionPausedMarket",
        );
        expect(await vBUSD.connect(busdHolder).mint(10)).to.be.emit(vBUSD, "Mint");
      });
    });
  });
});

forking(29886033, async () => {
  let owner, unitroller;
  let BUSD: ethers.contract;
  let busdHolder: ethers.Signer;
  let vBUSD: ethers.contract;
  let diamondUnitroller: Contract;

  before(async () => {
    await pretendExecutingVip(vipDiamondTestnet());
    unitroller = new ethers.Contract(UNITROLLER, Comptroller, ethers.provider);

    diamondUnitroller = new ethers.Contract(unitroller.address, Comptroller, ethers.provider);

    await impersonateAccount(Owner);
    owner = await ethers.getSigner(Owner);
    const [signer] = await ethers.getSigners();
    await signer.sendTransaction({
      to: owner.address,
      value: ethers.BigNumber.from("10000000000000000000"),
      data: undefined,
    });

    busdHolder = await initMainnetUser("0xC825AD791A6046991e3706b6342970f6d87e4888");

    [vBUSD] = await Promise.all(
      [VBUSD].map((address: string) => {
        return new ethers.Contract(address, VBEP20_DELEGATE_ABI, ethers.provider);
      }),
    );
    [BUSD] = await Promise.all(
      [vBUSD].map(async (vToken: any) => {
        const underlying = await vToken.underlying();
        return new ethers.Contract(underlying, IERC20Upgradeable, ethers.provider);
      }),
    );
    console.log("last");
  });

  describe("Diamond Hooks", () => {
    it("Diamond Unitroller Implementation (comptroller) should match the diamond Proxy Address", async () => {
      const comptrollerImplementation = await diamondUnitroller.comptrollerImplementation();
      const pendingComptrollerImplementation = await diamondUnitroller.pendingComptrollerImplementation();
      expect(comptrollerImplementation.toLowerCase()).to.equal(DIAMOND.toLowerCase());
      expect(pendingComptrollerImplementation.toLowerCase()).to.equal(zeroAddr);
    });
    it("mint vToken vBUSD", async () => {
      const vBUSDBalance = await BUSD.balanceOf(vBUSD.address);
      const busdHolerBalance = await BUSD.balanceOf(busdHolder.address);

      await BUSD.connect(busdHolder).approve(vBUSD.address, parseUnits("1100", 18));
      expect(await vBUSD.connect(busdHolder).mint(parseUnits("1000", 18))).to.emit(vBUSD, "Mint");

      const newvBUSDBalance = await BUSD.balanceOf(vBUSD.address);
      const newBusdHolerBalance = await BUSD.balanceOf(busdHolder.address);

      expect(newvBUSDBalance).greaterThan(vBUSDBalance);
      expect(newBusdHolerBalance).lessThan(busdHolerBalance);
    });

    it("redeem vToken", async () => {
      const vBUSDUserBal = await vBUSD.connect(busdHolder).balanceOf(busdHolder.address);
      const BUSDBal = await BUSD.connect(busdHolder).balanceOf(busdHolder.address);

      expect(await vBUSD.connect(busdHolder).redeem(1000)).to.emit(vBUSD, "Redeem");

      const newBUSDBal = await BUSD.connect(busdHolder).balanceOf(busdHolder.address);
      const newBUSDUserBal = await vBUSD.connect(busdHolder).balanceOf(busdHolder.address);

      expect(newBUSDUserBal).to.equal(vBUSDUserBal.sub(1000));
      expect(newBUSDBal).greaterThan(BUSDBal);
    });

    it("borrow vToken", async () => {
      const busdUserBal = await BUSD.balanceOf(busdHolder.address);

      expect(await vBUSD.connect(busdHolder).borrow(1000)).to.emit(vBUSD, "Borrow");

      expect((await BUSD.balanceOf(busdHolder.address)).toString()).to.equal(busdUserBal.add(1000));
    });

    it("Repay vToken", async () => {
      const busdUserBal = await BUSD.balanceOf(busdHolder.address);

      expect(await vBUSD.connect(busdHolder).borrow(1000)).to.emit(vBUSD, "Borrow");

      expect((await BUSD.balanceOf(busdHolder.address)).toString()).to.equal(busdUserBal.add(1000));

      expect(await vBUSD.connect(busdHolder).repayBorrow(1000)).to.emit(vBUSD, "RepayBorrow");

      const balanceAfterRepay = await BUSD.balanceOf(busdHolder.address);
      expect(balanceAfterRepay).to.equal(busdUserBal);
    });
  });
});
