import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import vip012, { MOCK_USDC, VUSDC_CORE } from "../../../proposals/zksyncsepolia/vip-012";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import ERC20_ABI from "./abi/erc20.json";
import VTOKEN_ABI from "./abi/vToken.json";

const { zksyncsepolia } = NETWORK_ADDRESSES;

const COMPTROLLER_CORE = "0xC527DE08E43aeFD759F7c0e6aE85433923064669";
const PSR = "0x5722B43BD91fAaDC4E7f384F4d6Fb32456Ec5ffB";

const BLOCKS_PER_YEAR = BigNumber.from("31536000"); // equal to seconds in a year as it is timebased deployment

forking(4120238, async () => {
  describe("Post-Execution state", () => {
    let allMarkets: any;
    let vToken: Contract;
    let comptroller: Contract;

    before(async () => {
      comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER_CORE);
      vToken = await ethers.getContractAt(VTOKEN_ABI, VUSDC_CORE);

      allMarkets = await comptroller.getAllMarkets();
      await pretendExecutingVip(await vip012());
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
      const expectedSupply = parseUnits("5000", 8);
      expect(await vToken.balanceOf(zksyncsepolia.VTREASURY)).to.equal(expectedSupply);
    });

    describe("Risk parameters", () => {
      describe(`risk parameters`, () => {
        let underlyingDecimals: number;

        before(async () => {
          const underlying = await ethers.getContractAt(ERC20_ABI, MOCK_USDC);
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
          "0x782D1BA04d28dbbf1Ff664B62993f69cd6225466", // IRM
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
          underlying: MOCK_USDC,
          exchangeRate: parseUnits("1", 16),
          comptroller: COMPTROLLER_CORE,
        });
      });
    });
  });
});
