import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { setRedstonePrice } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";
import { checkIsolatedPoolsComptrollers } from "src/vip-framework/checks/checkIsolatedPoolsComptrollers";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import vip505, {
  COMPTROLLER_CORE_ETH,
  tBTC_ETH,
  tBTCMarketSpec,
} from "../../vips/vip-505/bsctestnet";
import COMPTROLLER_ABI from "./abi/ilComptroller.json";
import PRICE_ORACLE_ABI from "./abi/resilientOracle.json";
import VTOKEN_ABI from "./abi/vToken.json";

const { sepolia } = NETWORK_ADDRESSES;
const PSR = "0xbea70755cc3555708ca11219adB0db4C80F6721B";

const BLOCKS_PER_YEAR = BigNumber.from("2628000");

forking(8461619, async () => {
  let comptroller: Contract;
  let oracle: Contract;

  describe("Contracts setup", () => {
    checkVToken(tBTCMarketSpec.vToken.address, tBTCMarketSpec.vToken);
  });

  testForkedNetworkVipCommands("tBTC Market", await vip505());

  describe("Post-Execution state", () => {
    let vtBTC: Contract;

    before(async () => {
      vtBTC = await ethers.getContractAt(VTOKEN_ABI, tBTCMarketSpec.vToken.address);
      comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER_CORE_ETH);
      oracle = await ethers.getContractAt(PRICE_ORACLE_ABI, await comptroller.oracle());
    });

    describe("Prices", () => {
      it("get correct price from oracle for tBTC", async () => {
        const price = await oracle.getPrice(tBTCMarketSpec.vToken.underlying);
        expect(price).to.equal(parseUnits("103921.65", 18));
      });
    });

    describe("PoolRegistry state", () => {
      it("should register tBTC vToken in Core pool Comptroller", async () => {
        const poolVTokens = await comptroller.getAllMarkets();
        expect(poolVTokens).to.include(tBTCMarketSpec.vToken.address);
      });
    });

    describe("Ownership", () => {
      it(`should transfer ownership of ${tBTCMarketSpec.vToken.address} to Normal Timelock`, async () => {
        expect(await vtBTC.owner()).to.equal(sepolia.NORMAL_TIMELOCK);
      });
    });

    describe("ProtocolShareReserve", () => {
      it(`should set PSR for ${tBTCMarketSpec.vToken.address}`, async () => {
        expect(await vtBTC.protocolShareReserve()).to.equal(PSR);
      });
    });

    describe("Risk parameters", () => {
      let vToken: Contract;
      let comptroller: Contract;

      describe("risk parameters for tBTC", () => {
        before(async () => {
          vToken = await ethers.getContractAt(VTOKEN_ABI, tBTCMarketSpec.vToken.address);
          comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER_CORE_ETH);
        });

        it(`should set reserve factor to 0.4`, async () => {
          expect(await vToken.reserveFactorMantissa()).to.equal(tBTCMarketSpec.riskParameters.reserveFactor);
        });

        it(`should set collateral factor to 0.7`, async () => {
          const market = await comptroller.markets(tBTCMarketSpec.vToken.address);
          expect(market.collateralFactorMantissa).to.equal(tBTCMarketSpec.riskParameters.collateralFactor);
        });

        it(`should set liquidation threshold to 0.75`, async () => {
          const market = await comptroller.markets(tBTCMarketSpec.vToken.address);
          expect(market.liquidationThresholdMantissa).to.equal(tBTCMarketSpec.riskParameters.liquidationThreshold);
        });

        it(`should set protocol seize share to 0.05`, async () => {
          expect(await vToken.protocolSeizeShareMantissa()).to.equal(parseUnits("0.05", 18));
        });

        it(`should set supply cap to 4000`, async () => {
          expect(await comptroller.supplyCaps(tBTCMarketSpec.vToken.address)).to.equal(
            tBTCMarketSpec.riskParameters.supplyCap,
          );
        });

        it(`should set borrow cap to 400`, async () => {
          expect(await comptroller.borrowCaps(tBTCMarketSpec.vToken.address)).to.equal(
            tBTCMarketSpec.riskParameters.borrowCap,
          );
        });
      });
    });

    it("Interest rates for tBTC", async () => {
      checkInterestRate(
        tBTCMarketSpec.interestRateModel.address,
        "vtBTC",
        {
          base: "0",
          multiplier: "0.15",
          jump: "3",
          kink: "0.45",
        },
        BLOCKS_PER_YEAR,
      );
    });
  });
});