import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { setRedstonePrice } from "src/utils";
import { initMainnetUser } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";
import { checkIsolatedPoolsComptrollers } from "src/vip-framework/checks/checkIsolatedPoolsComptrollers";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import vip498, {
  COMPTROLLER_CORE,
  WEETH_REDSTONE_FEED,
  WSTETH_REDSTONE_FEED,
  weETH,
  weETHMarket,
  wstETH,
  wstETHMarket,
} from "../../vips/vip-498/bscmainnet";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import ERC20_ABI from "./abi/erc20.json";
import VTOKEN_ABI from "./abi/vToken.json";

const { unichainmainnet } = NETWORK_ADDRESSES;

const PSR = "0x0A93fBcd7B53CE6D335cAB6784927082AD75B242";
const USDC = "0x078d782b760474a361dda0af3839290b0ef57ad6";
const WETH = "0x4200000000000000000000000000000000000006";
const WEETH_HOLDER = "0xD791Bd87Cd743e13a8E90eE19d9dF052B36F5FBF";
const WSTETH_HOLDER = "0x7de91A5ae7ABd2e4AD85735954Dd5C356fCB1865";
const ONE_YEAR = 31536000;

const BLOCKS_PER_YEAR = BigNumber.from("31536000"); // equal to seconds in a year as it is timebased deployment

forking(16554222, async () => {
  let comptroller: Contract;

  before(async () => {
    await setRedstonePrice(
      unichainmainnet.REDSTONE_ORACLE,
      USDC,
      ethers.constants.AddressZero,
      unichainmainnet.NORMAL_TIMELOCK,
      ONE_YEAR,
      { tokenDecimals: 6 },
    );

    await setRedstonePrice(
      unichainmainnet.REDSTONE_ORACLE,
      WETH,
      ethers.constants.AddressZero,
      unichainmainnet.NORMAL_TIMELOCK,
    );

    await setRedstonePrice(
      unichainmainnet.REDSTONE_ORACLE,
      weETH.address,
      WEETH_REDSTONE_FEED,
      unichainmainnet.NORMAL_TIMELOCK,
    );

    await setRedstonePrice(
      unichainmainnet.REDSTONE_ORACLE,
      wstETH.address,
      WSTETH_REDSTONE_FEED,
      unichainmainnet.NORMAL_TIMELOCK,
    );

    const weETHHolder = await initMainnetUser(WEETH_HOLDER, parseUnits("10", 18));
    const wstETHHolder = await initMainnetUser(WSTETH_HOLDER, parseUnits("10", 18));

    const weETHToken = new ethers.Contract(weETH.address, ERC20_ABI, ethers.provider);
    const wstETHToken = new ethers.Contract(wstETH.address, ERC20_ABI, ethers.provider);

    await weETHToken.connect(weETHHolder).transfer(unichainmainnet.VTREASURY, weETHMarket.initialSupply.amount);
    await wstETHToken.connect(wstETHHolder).transfer(unichainmainnet.VTREASURY, wstETHMarket.initialSupply.amount);
  });

  describe("Contracts setup", () => {
    checkVToken(weETHMarket.vToken.address, weETHMarket.vToken);
    checkVToken(wstETHMarket.vToken.address, wstETHMarket.vToken);
  });

  testForkedNetworkVipCommands("weETH and wstETH Market", await vip498());

  describe("Post-Execution state", () => {
    let vweETH: Contract;
    let vwstETH: Contract;

    before(async () => {
      vweETH = await ethers.getContractAt(VTOKEN_ABI, weETHMarket.vToken.address);
      vwstETH = await ethers.getContractAt(VTOKEN_ABI, wstETHMarket.vToken.address);
      comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER_CORE);
    });

    describe("PoolRegistry state", () => {
      it("should register weETH vToken in Core pool Comptroller", async () => {
        const poolVTokens = await comptroller.getAllMarkets();
        expect(poolVTokens).to.include(weETHMarket.vToken.address);
      });

      it("should register wstETH vToken in Core pool Comptroller", async () => {
        const poolVTokens = await comptroller.getAllMarkets();
        expect(poolVTokens).to.include(wstETHMarket.vToken.address);
      });
    });

    describe("Ownership", () => {
      it(`should transfer ownership of ${weETHMarket.vToken.address} to Normal Timelock`, async () => {
        expect(await vweETH.owner()).to.equal(unichainmainnet.GUARDIAN);
      });

      it(`should transfer ownership of ${wstETHMarket.vToken.address} to Normal Timelock`, async () => {
        expect(await vwstETH.owner()).to.equal(unichainmainnet.GUARDIAN);
      });
    });

    describe("ProtocolShareReserve", () => {
      it(`should set PSR for ${weETHMarket.vToken.address}`, async () => {
        expect(await vweETH.protocolShareReserve()).to.equal(PSR);
      });

      it(`should set PSR for ${wstETHMarket.vToken.address}`, async () => {
        expect(await vwstETH.protocolShareReserve()).to.equal(PSR);
      });
    });

    describe("Risk parameters", () => {
      let vToken: Contract;
      let comptroller: Contract;

      describe("risk parameters for weETH", () => {
        before(async () => {
          vToken = await ethers.getContractAt(VTOKEN_ABI, weETHMarket.vToken.address);
          comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER_CORE);
        });

        it(`should set reserve factor to 0.4`, async () => {
          expect(await vToken.reserveFactorMantissa()).to.equal(weETHMarket.riskParameters.reserveFactor);
        });

        it(`should set collateral factor to 0.7`, async () => {
          const market = await comptroller.markets(weETHMarket.vToken.address);
          expect(market.collateralFactorMantissa).to.equal(weETHMarket.riskParameters.collateralFactor);
        });

        it(`should set liquidation threshold to 0.75`, async () => {
          const market = await comptroller.markets(weETHMarket.vToken.address);
          expect(market.liquidationThresholdMantissa).to.equal(weETHMarket.riskParameters.liquidationThreshold);
        });

        it(`should set protocol seize share to 0.05`, async () => {
          expect(await vToken.protocolSeizeShareMantissa()).to.equal(parseUnits("0.05", 18));
        });

        it(`should set supply cap to 4000`, async () => {
          expect(await comptroller.supplyCaps(weETHMarket.vToken.address)).to.equal(
            weETHMarket.riskParameters.supplyCap,
          );
        });

        it(`should set borrow cap to 400`, async () => {
          expect(await comptroller.borrowCaps(weETHMarket.vToken.address)).to.equal(
            weETHMarket.riskParameters.borrowCap,
          );
        });
      });

      describe("risk parameters for wstETH", () => {
        before(async () => {
          vToken = await ethers.getContractAt(VTOKEN_ABI, wstETHMarket.vToken.address);
          comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER_CORE);
        });

        it(`should set reserve factor to 0.25`, async () => {
          expect(await vToken.reserveFactorMantissa()).to.equal(wstETHMarket.riskParameters.reserveFactor);
        });

        it(`should set collateral factor to 0.7`, async () => {
          const market = await comptroller.markets(wstETHMarket.vToken.address);
          expect(market.collateralFactorMantissa).to.equal(wstETHMarket.riskParameters.collateralFactor);
        });

        it(`should set liquidation threshold to 0.725`, async () => {
          const market = await comptroller.markets(wstETHMarket.vToken.address);
          expect(market.liquidationThresholdMantissa).to.equal(wstETHMarket.riskParameters.liquidationThreshold);
        });

        it(`should set protocol seize share to 0.05`, async () => {
          expect(await vToken.protocolSeizeShareMantissa()).to.equal(parseUnits("0.05", 18));
        });

        it(`should set supply cap to 14000`, async () => {
          expect(await comptroller.supplyCaps(wstETHMarket.vToken.address)).to.equal(
            wstETHMarket.riskParameters.supplyCap,
          );
        });

        it(`should set borrow cap to 7000`, async () => {
          expect(await comptroller.borrowCaps(wstETHMarket.vToken.address)).to.equal(
            wstETHMarket.riskParameters.borrowCap,
          );
        });
      });
    });

    it("Interest rates for weETH", async () => {
      checkInterestRate(
        weETHMarket.interestRateModel.address,
        "vweETH",
        {
          base: "0",
          multiplier: "0.09",
          jump: "3",
          kink: "0.45",
        },
        BLOCKS_PER_YEAR,
      );
    });
    it("Interest rates for wstETH", async () => {
      checkInterestRate(
        wstETHMarket.interestRateModel.address,
        "vwstETH",
        {
          base: "0",
          multiplier: "0.15",
          jump: "3",
          kink: "0.45",
        },
        BLOCKS_PER_YEAR,
      );
    });
    it("check isolated pools", async () => {
      checkIsolatedPoolsComptrollers();
    });
  });
});
