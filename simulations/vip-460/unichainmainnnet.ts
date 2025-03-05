import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";
import { checkIsolatedPoolsComptrollers } from "src/vip-framework/checks/checkIsolatedPoolsComptrollers";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import vip010 from "../../multisig/proposals/unichainmainnet/vip-010";
import vip460, { UNI_COMPTROLLER_CORE, newMarkets } from "../../vips/vip-460/bscmainnet";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import TREASURY_ABI from "./abi/treasury.json";
import VTOKEN_ABI from "./abi/vToken.json";

const { unichainmainnet } = NETWORK_ADDRESSES;

const PSR = "0x0A93fBcd7B53CE6D335cAB6784927082AD75B242";

const BLOCKS_PER_YEAR = BigNumber.from("31536000"); // equal to seconds in a year as it is timebased deployment

forking(10406586, async () => {
  let comptroller: Contract;

  describe("Contracts setup", () => {
    checkVToken(newMarkets["UNI"].vToken.address, newMarkets["UNI"].vToken);
  });

  await pretendExecutingVip(await vip010());
  testForkedNetworkVipCommands("UNI market", await vip460());

  describe("Post-Execution state", () => {
    let interestRateModelAddresses: string;
    let vToken: Contract;
    let treasury: Contract;

    before(async () => {
      vToken = await ethers.getContractAt(VTOKEN_ABI, newMarkets["UNI"].vToken.address);
      interestRateModelAddresses = await vToken.interestRateModel();
      treasury = await ethers.getContractAt(TREASURY_ABI, unichainmainnet.VTREASURY);
    });

    describe("PoolRegistry state", () => {
      it("should register UNI vToken in Core pool Comptroller", async () => {
        comptroller = await ethers.getContractAt(COMPTROLLER_ABI, UNI_COMPTROLLER_CORE);
        const poolVTokens = await comptroller.getAllMarkets();
        expect(poolVTokens).to.include(newMarkets["UNI"].vToken.address);
      });
    });

    describe("Ownership", () => {
      it(`should transfer ownership of Treasury to NT`, async () => {
        expect(await treasury.owner()).to.equal(unichainmainnet.NORMAL_TIMELOCK);
      });
    });

    describe("ProtocolShareReserve", () => {
      it(`should set PSR for ${newMarkets["UNI"].vToken.address}`, async () => {
        const vToken = await ethers.getContractAt(VTOKEN_ABI, newMarkets["UNI"].vToken.address);
        expect(await vToken.protocolShareReserve()).to.equal(PSR);
      });
    });

    describe("Initial supply", () => {
      it(`should mint initial supply of ${newMarkets["UNI"].vToken.address} to ${unichainmainnet.VTREASURY}`, async () => {
        const expectedSupply = parseUnits("528.46342798", 8);
        const vToken = await ethers.getContractAt(VTOKEN_ABI, newMarkets["UNI"].vToken.address);

        expect(await vToken.balanceOf(unichainmainnet.VTREASURY)).to.equal(expectedSupply);
      });
    });

    describe("Risk parameters", () => {
      describe(`risk parameters`, () => {
        let vToken: Contract;
        let comptroller: Contract;

        before(async () => {
          vToken = await ethers.getContractAt(VTOKEN_ABI, newMarkets["UNI"].vToken.address);
          comptroller = await ethers.getContractAt(COMPTROLLER_ABI, UNI_COMPTROLLER_CORE);
        });

        it(`should set reserve factor to 0.25`, async () => {
          expect(await vToken.reserveFactorMantissa()).to.equal(parseUnits("0.25", 18));
        });

        it(`should set collateral factor to 0`, async () => {
          const market = await comptroller.markets(newMarkets["UNI"].vToken.address);
          expect(market.collateralFactorMantissa).to.equal(0);
        });

        it(`should set liquidation threshold to 0`, async () => {
          const market = await comptroller.markets(newMarkets["UNI"].vToken.address);
          expect(market.liquidationThresholdMantissa).to.equal(0);
        });

        it(`should set protocol seize share to 0.05`, async () => {
          expect(await vToken.protocolSeizeShareMantissa()).to.equal(parseUnits("0.05", 18));
        });

        it(`should set supply cap to 20000`, async () => {
          expect(await comptroller.supplyCaps(newMarkets["UNI"].vToken.address)).to.equal(parseUnits("20000", 18));
        });

        it(`should set borrow cap to 0`, async () => {
          expect(await comptroller.borrowCaps(newMarkets["UNI"].vToken.address)).to.equal(0);
        });
        it("Borrow action should be paused", async () => {
          expect(await comptroller.actionPaused(newMarkets["UNI"].vToken.address, 2)).to.be.true;
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
