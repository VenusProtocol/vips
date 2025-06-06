import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NORMAL_TIMELOCK, forking, testForkedNetworkVipCommands } from "src/vip-framework";
import { checkIsolatedPoolsComptrollers } from "src/vip-framework/checks/checkIsolatedPoolsComptrollers";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate, checkTwoKinksInterestRateIL } from "src/vip-framework/checks/interestRateModel";

import vip512, { COMPTROLLER_CORE, USDTOMarket, WBTCMarket } from "../../vips/vip-512/bsctestnet";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import VTOKEN_ABI from "./abi/vToken.json";

const VWBTC_IRM = "0x15d00fe9605D69c818Fe78627FF9367DcC9E363B";
const VUSDTO_IRM = "0x208DedbBc74525764DE7521C12B53CcEd0FCcA4B";
const PSR = "0xcCcFc9B37A5575ae270352CC85D55C3C52a646C0";
const BLOCKS_PER_YEAR = BigNumber.from("31536000"); // equal to seconds in a year as it is timebased deployment

forking(22338935, async () => {
  let comptroller: Contract;

  describe("Contracts setup", () => {
    checkVToken(WBTCMarket.vToken.address, WBTCMarket.vToken);
    checkVToken(USDTOMarket.vToken.address, USDTOMarket.vToken);
  });

  testForkedNetworkVipCommands("add WBTC and USDTO market", await vip512());

  describe("Post-Execution state", () => {
    let vWBTC: Contract;
    let vUSDTO: Contract;

    before(async () => {
      vWBTC = await ethers.getContractAt(VTOKEN_ABI, WBTCMarket.vToken.address);
      vUSDTO = await ethers.getContractAt(VTOKEN_ABI, USDTOMarket.vToken.address);
      comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER_CORE);
    });

    describe("PoolRegistry state", () => {
      it("should register WBTC vToken in Core pool Comptroller", async () => {
        const poolVTokens = await comptroller.getAllMarkets();
        expect(poolVTokens).to.include(WBTCMarket.vToken.address);
      });

      it("should register USDTO vToken in Core pool Comptroller", async () => {
        const poolVTokens = await comptroller.getAllMarkets();
        expect(poolVTokens).to.include(USDTOMarket.vToken.address);
      });
    });

    describe("Ownership", () => {
      it(`should transfer ownership of ${WBTCMarket.vToken.address} to NORMAL_TIMELOCK`, async () => {
        expect(await vWBTC.owner()).to.equal(NORMAL_TIMELOCK);
      });

      it(`should transfer ownership of ${USDTOMarket.vToken.address} to NORMAL_TIMELOCK`, async () => {
        expect(await vUSDTO.owner()).to.equal(NORMAL_TIMELOCK);
      });
    });

    describe("ProtocolShareReserve", () => {
      it(`should set PSR for ${WBTCMarket.vToken.address}`, async () => {
        expect(await vWBTC.protocolShareReserve()).to.equal(PSR);
      });

      it(`should set PSR for ${USDTOMarket.vToken.address}`, async () => {
        expect(await vUSDTO.protocolShareReserve()).to.equal(PSR);
      });
    });

    describe("Risk parameters", () => {
      let vToken: Contract;
      let comptroller: Contract;

      describe("risk parameters for WBTC", () => {
        before(async () => {
          vToken = await ethers.getContractAt(VTOKEN_ABI, WBTCMarket.vToken.address);
          comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER_CORE);
        });

        it(`should set reserve factor to 0.2`, async () => {
          expect(await vToken.reserveFactorMantissa()).to.equal(WBTCMarket.riskParameters.reserveFactor);
        });

        it(`should set collateral factor to 0.77`, async () => {
          const market = await comptroller.markets(WBTCMarket.vToken.address);
          expect(market.collateralFactorMantissa).to.equal(WBTCMarket.riskParameters.collateralFactor);
        });

        it(`should set liquidation threshold to 0.8`, async () => {
          const market = await comptroller.markets(WBTCMarket.vToken.address);
          expect(market.liquidationThresholdMantissa).to.equal(WBTCMarket.riskParameters.liquidationThreshold);
        });

        it(`should set protocol seize share to 0.05`, async () => {
          expect(await vToken.protocolSeizeShareMantissa()).to.equal(parseUnits("0.05", 18));
        });

        it(`should set supply cap to 400`, async () => {
          expect(await comptroller.supplyCaps(WBTCMarket.vToken.address)).to.equal(WBTCMarket.riskParameters.supplyCap);
        });

        it(`should set borrow cap to 40`, async () => {
          expect(await comptroller.borrowCaps(WBTCMarket.vToken.address)).to.equal(WBTCMarket.riskParameters.borrowCap);
        });
      });

      describe("risk parameters for USDTO", () => {
        before(async () => {
          vToken = await ethers.getContractAt(VTOKEN_ABI, USDTOMarket.vToken.address);
          comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER_CORE);
        });

        it(`should set reserve factor to 0.1`, async () => {
          expect(await vToken.reserveFactorMantissa()).to.equal(USDTOMarket.riskParameters.reserveFactor);
        });

        it(`should set collateral factor to 0.77`, async () => {
          const market = await comptroller.markets(USDTOMarket.vToken.address);
          expect(market.collateralFactorMantissa).to.equal(USDTOMarket.riskParameters.collateralFactor);
        });

        it(`should set liquidation threshold to 0.8`, async () => {
          const market = await comptroller.markets(USDTOMarket.vToken.address);
          expect(market.liquidationThresholdMantissa).to.equal(USDTOMarket.riskParameters.liquidationThreshold);
        });

        it(`should set protocol seize share to 0.05`, async () => {
          expect(await vToken.protocolSeizeShareMantissa()).to.equal(parseUnits("0.05", 18));
        });

        it(`should set supply cap to 50000000`, async () => {
          expect(await comptroller.supplyCaps(USDTOMarket.vToken.address)).to.equal(
            USDTOMarket.riskParameters.supplyCap,
          );
        });

        it(`should set borrow cap to 45000000`, async () => {
          expect(await comptroller.borrowCaps(USDTOMarket.vToken.address)).to.equal(
            USDTOMarket.riskParameters.borrowCap,
          );
        });
      });
    });

    it("Interest rates for WBTC", async () => {
      checkInterestRate(
        VWBTC_IRM,
        "vWBTC",
        {
          base: "0",
          multiplier: "0.09",
          jump: "2",
          kink: "0.45",
        },
        BLOCKS_PER_YEAR,
      );
    });

    it("Interest rates for USDTO", async () => {
      checkTwoKinksInterestRateIL(
        VUSDTO_IRM,
        "vUSDTO",
        {
          base: "0",
          multiplier: "0.1",
          kink1: "0.8",
          multiplier2: "0.7",
          base2: "0",
          kink2: "0.9",
          jump: "0.8",
        },
        BLOCKS_PER_YEAR,
      );
    });

    it("check isolated pools", async () => {
      checkIsolatedPoolsComptrollers();
    });
  });
});
