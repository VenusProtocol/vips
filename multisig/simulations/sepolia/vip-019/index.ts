import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { checkIsolatedPoolsComptrollers } from "../../../../src/vip-framework/checks/checkIsolatedPoolsComptrollers";
import { checkVToken } from "../../../../src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "../../../../src/vip-framework/checks/interestRateModel";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework/index";
import vip019 from "../../../proposals/sepolia/vip-019";
import { BORROW_CAP, SUPPLY_CAP, TUSD, vTUSD } from "../../../proposals/sepolia/vip-019";
import COMPTROLLER_ABI from "./abi/ComptrollerAbi.json";
import POOL_REGISTRY_ABI from "./abi/PoolRegistryAbi.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracleAbi.json";
import VTOKEN_ABI from "./abi/VTokenAbi.json";

const { sepolia } = NETWORK_ADDRESSES;
const COMPTROLLER = "0x7Aa39ab4BcA897F403425C9C6FDbd0f882Be0D70";
const PROTOCOL_SHARE_RESERVE = "0xbea70755cc3555708ca11219adB0db4C80F6721B";

forking(5744100, () => {
  let resilientOracle: Contract;
  let poolRegistry: Contract;
  let vtusd: Contract;
  let comptroller: Contract;

  before(async () => {
    resilientOracle = await ethers.getContractAt(RESILIENT_ORACLE_ABI, sepolia.RESILIENT_ORACLE);
    poolRegistry = await ethers.getContractAt(POOL_REGISTRY_ABI, sepolia.POOL_REGISTRY);
    vtusd = await ethers.getContractAt(VTOKEN_ABI, vTUSD);
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER);
  });

  describe("Pre-VIP behavior", () => {
    it("check price", async () => {
      await expect(resilientOracle.getPrice(vTUSD)).to.be.reverted;
    });
    it("should have 6 markets in core pool", async () => {
      const poolVTokens = await comptroller.getAllMarkets();
      expect(poolVTokens).to.have.lengthOf(6);
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(vip019());
    });

    it("check price", async () => {
      expect(await resilientOracle.getPrice(TUSD)).to.equals(parseUnits("1", 18));
    });

    it("should have 7 markets in core pool", async () => {
      const poolVTokens = await comptroller.getAllMarkets();
      expect(poolVTokens).to.have.lengthOf(7);
    });

    it("should add vTUSD to the pool", async () => {
      const registeredVToken = await poolRegistry.getVTokenForAsset(COMPTROLLER, TUSD);
      expect(registeredVToken).to.equal(vTUSD);
    });

    it("check ownership", async () => {
      expect(await vtusd.owner()).to.equal(sepolia.GUARDIAN);
    });
    it("check supply of Vtreasury", async () => {
      expect(await vtusd.balanceOf(sepolia.VTREASURY)).to.equal(parseUnits("1000000", 8));
    });

    it("check borrow and supply caps", async () => {
      expect(await comptroller.borrowCaps(vTUSD)).equals(BORROW_CAP);
      expect(await comptroller.supplyCaps(vTUSD)).equals(SUPPLY_CAP);
    });
    it("should set vTUSD collateral factor to 75% and Liquidation threshold to 77%", async () => {
      const market = await comptroller.markets(vTUSD);
      expect(market.collateralFactorMantissa).to.equal(parseUnits("0.75", 18));
      expect(market.liquidationThresholdMantissa).to.equal(parseUnits("0.77", 18));
    });
    it("check vToken", async () => {
      await checkVToken(vTUSD, {
        name: "Venus TUSD (Core)",
        symbol: "vTUSD_Core",
        decimals: 8,
        underlying: TUSD,
        exchangeRate: parseUnits("1", 28),
        comptroller: COMPTROLLER,
      });
    });
    it("check protocol share reserve", async () => {
      expect(await vtusd.protocolShareReserve()).equals(PROTOCOL_SHARE_RESERVE);
    });
    it("check reserve factor", async () => {
      expect(await vtusd.reserveFactorMantissa()).equals(parseUnits("0.1", 18));
    });
    it("check IR", async () => {
      const IR = await vtusd.interestRateModel();
      checkInterestRate(
        IR,
        "vTUSD_Core",
        { base: "0", multiplier: "0.15", jump: "2.5", kink: "0.8" },
        BigNumber.from(2628000),
      );
    });
    it("check Pool", async () => {
      checkIsolatedPoolsComptrollers({ comptroller: COMPTROLLER });
    });
  });
});
