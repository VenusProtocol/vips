import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import vip508, { COMPTROLLER_CORE_ETH, USDT_ETH, tBTCMarketSpec } from "../../vips/vip-508/bscmainnet";
import ERC20_ABI from "./abi/erc20.json";
import COMPTROLLER_ABI from "./abi/ilComptroller.json";
import PRICE_ORACLE_ABI from "./abi/resilientOracle.json";
import VTOKEN_ABI from "./abi/vToken.json";

const { ethereum } = NETWORK_ADDRESSES;
const PSR = "0x8c8c8530464f7D95552A11eC31Adbd4dC4AC4d3E";

const BLOCKS_PER_YEAR = BigNumber.from("2628000");
const ONE_YEAR = 326 * 24 * 60 * 60; // 365 days in seconds

forking(22609457, async () => {
  let comptroller: Contract;
  let oracle: Contract;
  let usdt: Contract;
  let prevVTokenReceiverUSDTBalance: BigNumber;
  let prevTreasuryUSDTBalance: BigNumber;

  before(async () => {
    usdt = await ethers.getContractAt(ERC20_ABI, USDT_ETH);

    prevVTokenReceiverUSDTBalance = await usdt.balanceOf(tBTCMarketSpec.initialSupply.vTokenReceiver);
    prevTreasuryUSDTBalance = await usdt.balanceOf(ethereum.VTREASURY);
  });

  describe("Contracts setup", () => {
    checkVToken(tBTCMarketSpec.vToken.address, tBTCMarketSpec.vToken);
  });

  testForkedNetworkVipCommands("tBTC Market", await vip508(ONE_YEAR));

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
        expect(await vtBTC.owner()).to.equal(ethereum.NORMAL_TIMELOCK);
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

        it(`should set reserve factor to 0.25`, async () => {
          expect(await vToken.reserveFactorMantissa()).to.equal(tBTCMarketSpec.riskParameters.reserveFactor);
        });

        it(`should set collateral factor to 0.75`, async () => {
          const market = await comptroller.markets(tBTCMarketSpec.vToken.address);
          expect(market.collateralFactorMantissa).to.equal(tBTCMarketSpec.riskParameters.collateralFactor);
        });

        it(`should set liquidation threshold to 0.78`, async () => {
          const market = await comptroller.markets(tBTCMarketSpec.vToken.address);
          expect(market.liquidationThresholdMantissa).to.equal(tBTCMarketSpec.riskParameters.liquidationThreshold);
        });

        it(`should set protocol seize share to 0.05`, async () => {
          expect(await vToken.protocolSeizeShareMantissa()).to.equal(parseUnits("0.05", 18));
        });

        it(`should set supply cap to 120`, async () => {
          expect(await comptroller.supplyCaps(tBTCMarketSpec.vToken.address)).to.equal(
            tBTCMarketSpec.riskParameters.supplyCap,
          );
        });

        it(`should set borrow cap to 60`, async () => {
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

    it("checks USDT balances", async () => {
      const vTokenReceiverUSDTBalance = await usdt.balanceOf(tBTCMarketSpec.initialSupply.vTokenReceiver);
      const treasuryUSDTBalance = await usdt.balanceOf(ethereum.VTREASURY);

      expect(vTokenReceiverUSDTBalance).to.equal(prevVTokenReceiverUSDTBalance.add(parseUnits("100", 6)));
      expect(treasuryUSDTBalance).to.equal(prevTreasuryUSDTBalance.sub(parseUnits("100", 6)));
    });
  });
});
