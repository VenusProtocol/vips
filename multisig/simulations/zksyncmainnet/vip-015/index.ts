import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import vip015, { USDC, VUSDC_CORE } from "../../../proposals/zksyncmainnet/vip-015";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import ERC20_ABI from "./abi/erc20.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";
import VTOKEN_ABI from "./abi/vToken.json";

const { zksyncmainnet } = NETWORK_ADDRESSES;

const COMPTROLLER_CORE = "0xddE4D098D9995B659724ae6d5E3FB9681Ac941B1";
const PSR = "0xA1193e941BDf34E858f7F276221B4886EfdD040b";

const BLOCKS_PER_YEAR = BigNumber.from("31536000"); // equal to seconds in a year as it is timebased deployment

forking(48211836, async () => {
  describe("Post-Execution state", () => {
    let allMarkets: any;
    let vToken: Contract;
    let comptroller: Contract;

    before(async () => {
      comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER_CORE);
      vToken = await ethers.getContractAt(VTOKEN_ABI, VUSDC_CORE);

      allMarkets = await comptroller.getAllMarkets();
      await pretendExecutingVip(await vip015());
    });

    it("check price", async () => {
      const resilientOracle = await ethers.getContractAt(RESILIENT_ORACLE_ABI, zksyncmainnet.RESILIENT_ORACLE);
      expect(await resilientOracle.getPrice(USDC)).to.be.equal(parseUnits("1.00000191", 30));
      expect(await resilientOracle.getUnderlyingPrice(VUSDC_CORE)).to.be.equal(parseUnits("1.00000191", 30));
    });

    it("should register Core pool vTokens in Core pool Comptroller", async () => {
      const poolVTokens = await comptroller.getAllMarkets();
      expect(poolVTokens).to.have.lengthOf(BigNumber.from(allMarkets.length).add(1));
      expect(poolVTokens).to.include(VUSDC_CORE);
    });

    it(`should set PSR`, async () => {
      expect(await vToken.protocolShareReserve()).to.equal(PSR);
    });

    it(`should mint initial supply of VUSDC to VTreasury`, async () => {
      // Since we're distributing 1:1, decimals should be accounted for in the exchange rate
      const expectedSupply = parseUnits("4998.378502", 8);
      expect(await vToken.balanceOf(zksyncmainnet.VTREASURY)).to.equal(expectedSupply);
    });

    describe("Risk parameters", () => {
      describe(`risk parameters`, () => {
        let underlyingDecimals: number;

        before(async () => {
          const underlying = await ethers.getContractAt(ERC20_ABI, USDC);
          underlyingDecimals = await underlying.decimals();
        });

        it(`should set VUSDC reserve factor to 10%`, async () => {
          expect(await vToken.reserveFactorMantissa()).to.equal(parseUnits("0.1", 18));
        });

        it(`should set VUSDC collateral factor to 72%`, async () => {
          const market = await comptroller.markets(VUSDC_CORE);
          expect(market.collateralFactorMantissa).to.equal(parseUnits("0.72", 18));
        });

        it(`should set VUSDC liquidation threshold to 75%`, async () => {
          const market = await comptroller.markets(VUSDC_CORE);
          expect(market.liquidationThresholdMantissa).to.equal(parseUnits("0.75", 18));
        });

        it(`should set VUSDC protocol seize share to 0.05`, async () => {
          expect(await vToken.protocolSeizeShareMantissa()).to.equal(parseUnits("0.05", 18));
        });

        it(`should set VUSDC supply cap to 1250000`, async () => {
          expect(await comptroller.supplyCaps(VUSDC_CORE)).to.equal(parseUnits("1250000", underlyingDecimals));
        });

        it(`should set VUSDC borrow cap to 1000000`, async () => {
          expect(await comptroller.borrowCaps(VUSDC_CORE)).to.equal(parseUnits("1000000", underlyingDecimals));
        });
      });

      it("Interest rates", async () => {
        checkInterestRate(
          "0x6e0f830e7fc78a296B0EbD5694573C2D9f0994B1", // IRM
          "VUSDC_CORE",
          {
            base: "0",
            multiplier: "0.0875",
            jump: "0.8",
            kink: "0.8",
          },
          BLOCKS_PER_YEAR,
        );
      });
      it("check vtoken", async () => {
        checkVToken(VUSDC_CORE, {
          name: "Venus USDC (Core)",
          symbol: "vUSDC_Core",
          decimals: 8,
          underlying: USDC,
          exchangeRate: parseUnits("1", 16),
          comptroller: COMPTROLLER_CORE,
        });
      });
    });
  });
});
