import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";
import { checkIsolatedPoolsComptrollers } from "src/vip-framework/checks/checkIsolatedPoolsComptrollers";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import vip498, { COMPTROLLER_CORE, weETHMarket, wstETHMarket } from "../../vips/vip-498/bsctestnet";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import VTOKEN_ABI from "./abi/vToken.json";

const { unichainsepolia } = NETWORK_ADDRESSES;

const GUARDIAN = unichainsepolia.GUARDIAN;
const PSR = "0xcCcFc9B37A5575ae270352CC85D55C3C52a646C0";

const BLOCKS_PER_YEAR = BigNumber.from("31536000"); // equal to seconds in a year as it is timebased deployment

forking(20467197, async () => {
  let comptroller: Contract;

  describe("Contracts setup", () => {
    checkVToken(weETHMarket.vToken.address, weETHMarket.vToken);
    checkVToken(wstETHMarket.vToken.address, wstETHMarket.vToken);
  });

  testForkedNetworkVipCommands("add weETH and wstETH market", await vip498());

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
      it(`should transfer ownership of ${weETHMarket.vToken.address} to GUARDIAN`, async () => {
        expect(await vweETH.owner()).to.equal(GUARDIAN);
      });

      it(`should transfer ownership of ${wstETHMarket.vToken.address} to GUARDIAN`, async () => {
        expect(await vwstETH.owner()).to.equal(GUARDIAN);
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
