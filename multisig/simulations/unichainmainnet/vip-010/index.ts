import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";
import { checkIsolatedPoolsComptrollers } from "src/vip-framework/checks/checkIsolatedPoolsComptrollers";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import vip010, { COMPTROLLER_CORE, UNI, VUNI_CORE } from "../../../proposals/unichainmainnet/vip-010";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import VTOKEN_ABI from "./abi/vToken.json";

const { unichainmainnet } = NETWORK_ADDRESSES;

const GUARDIAN = unichainmainnet.GUARDIAN;
const PSR = "0x0A93fBcd7B53CE6D335cAB6784927082AD75B242";

const BLOCKS_PER_YEAR = BigNumber.from("31536000"); // equal to seconds in a year as it is timebased deployment

forking(9385933, async () => {
  let comptroller: Contract;

  describe("Contracts setup", () => {
    checkVToken(VUNI_CORE, {
      name: "Venus UNI (Core)",
      symbol: "vUNI_Core",
      decimals: 8,
      underlying: UNI,
      exchangeRate: parseUnits("1", 28),
      comptroller: COMPTROLLER_CORE,
    });
  });

  describe("Post-Execution state", () => {
    let interestRateModelAddresses: string;
    let vToken: Contract;

    before(async () => {
      vToken = await ethers.getContractAt(VTOKEN_ABI, VUNI_CORE);
      interestRateModelAddresses = await vToken.interestRateModel();
      await pretendExecutingVip(await vip010());
    });

    describe("PoolRegistry state", () => {
      it("should register UNI vToken in Core pool Comptroller", async () => {
        comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER_CORE);
        const poolVTokens = await comptroller.getAllMarkets();
        expect(poolVTokens).to.include(VUNI_CORE);
      });
    });

    describe("Ownership", () => {
      it(`should transfer ownership of ${VUNI_CORE} to GUARDIAN`, async () => {
        expect(await vToken.owner()).to.equal(GUARDIAN);
      });
    });

    describe("ProtocolShareReserve", () => {
      it(`should set PSR for ${VUNI_CORE}`, async () => {
        const vToken = await ethers.getContractAt(VTOKEN_ABI, VUNI_CORE);
        expect(await vToken.protocolShareReserve()).to.equal(PSR);
      });
    });

    describe("Initial supply", () => {
      it(`should mint initial supply of ${VUNI_CORE} to ${unichainmainnet.VTREASURY}`, async () => {
        const expectedSupply = parseUnits("528.46342798", 8);
        const vToken = await ethers.getContractAt(VTOKEN_ABI, VUNI_CORE);

        expect(await vToken.balanceOf(unichainmainnet.VTREASURY)).to.equal(expectedSupply);
      });
    });

    describe("Risk parameters", () => {
      describe(`risk parameters`, () => {
        let vToken: Contract;
        let comptroller: Contract;

        before(async () => {
          vToken = await ethers.getContractAt(VTOKEN_ABI, VUNI_CORE);
          comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER_CORE);
        });

        it(`should set reserve factor to 0.25`, async () => {
          expect(await vToken.reserveFactorMantissa()).to.equal(parseUnits("0.25", 18));
        });

        it(`should set collateral factor to 0`, async () => {
          const market = await comptroller.markets(VUNI_CORE);
          expect(market.collateralFactorMantissa).to.equal(0);
        });

        it(`should set liquidation threshold to 0`, async () => {
          const market = await comptroller.markets(VUNI_CORE);
          expect(market.liquidationThresholdMantissa).to.equal(0);
        });

        it(`should set protocol seize share to 0.05`, async () => {
          expect(await vToken.protocolSeizeShareMantissa()).to.equal(parseUnits("0.05", 18));
        });

        it(`should set supply cap to 2000`, async () => {
          expect(await comptroller.supplyCaps(VUNI_CORE)).to.equal(parseUnits("20000", 18));
        });

        it(`should set borrow cap to 0`, async () => {
          expect(await comptroller.borrowCaps(VUNI_CORE)).to.equal(0);
        });
      });
    });

    it("Interest rates", async () => {
      checkInterestRate(
        interestRateModelAddresses,
        "VUNI",
        {
          base: "0",
          multiplier: "0.15",
          jump: "3",
          kink: "0.3",
        },
        BLOCKS_PER_YEAR,
      );
    });
    it("check isolated pools", async () => {
      checkIsolatedPoolsComptrollers();
    });
  });
});
