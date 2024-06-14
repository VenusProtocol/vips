import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { initMainnetUser } from "../../../../src/utils";
import { checkIsolatedPoolsComptrollers } from "../../../../src/vip-framework/checks/checkIsolatedPoolsComptrollers";
import { checkVToken } from "../../../../src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "../../../../src/vip-framework/checks/interestRateModel";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework/index";
import { BORROW_CAP, INITIAL_SUPPLY, SUPPLY_CAP, rsETH, vip035, vrsETH } from "../../../proposals/ethereum/vip-035";
import POOL_REGISTRY_ABI from "./abi/PoolRegistry.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import VTOKEN_ABI from "./abi/vToken.json";
import ERC20_ABI from "./abi/weth.json";

const { ethereum } = NETWORK_ADDRESSES;
const LIQUID_STAKED_COMPTROLLER = "0xF522cd0360EF8c2FF48B648d53EA1717Ec0F3Ac3";
const PROTOCOL_SHARE_RESERVE = "0x8c8c8530464f7D95552A11eC31Adbd4dC4AC4d3E";
const rsETH_HOLDER = "0x730A5E2AcEbccAA5e9095723B3CB862739DA793c";

forking(20083100, () => {
  let resilientOracle: Contract;
  let poolRegistry: Contract;
  let vrsETHContract: Contract;
  let rsETHContract;
  let comptroller: Contract;

  before(async () => {
    resilientOracle = await ethers.getContractAt(RESILIENT_ORACLE_ABI, ethereum.RESILIENT_ORACLE);
    poolRegistry = await ethers.getContractAt(POOL_REGISTRY_ABI, ethereum.POOL_REGISTRY);
    vrsETHContract = await ethers.getContractAt(VTOKEN_ABI, vrsETH);
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, LIQUID_STAKED_COMPTROLLER);
    const rsETHHolderSigner = await initMainnetUser(rsETH_HOLDER, ethers.utils.parseEther("1"));
    rsETHContract = await ethers.getContractAt(ERC20_ABI, rsETH);
    await rsETHContract.connect(rsETHHolderSigner).transfer(ethereum.NORMAL_TIMELOCK, INITIAL_SUPPLY); // Will be remove once Treasury has bootstrap liquidity
  });

  describe("Pre-VIP behavior", () => {
    it("check price", async () => {
      await expect(resilientOracle.getPrice(rsETH)).to.be.reverted;
    });
    it("should have 4 markets in liquid staked pool", async () => {
      const poolVTokens = await comptroller.getAllMarkets();
      expect(poolVTokens).to.have.lengthOf(4);
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(vip035());
    });

    it("check price", async () => {
      expect(await resilientOracle.getPrice(rsETH)).to.be.closeTo(parseUnits("3520", 18), parseUnits("1", 18));
      expect(await resilientOracle.getUnderlyingPrice(vrsETH)).to.be.closeTo(
        parseUnits("3520", 18),
        parseUnits("1", 18),
      );
    });

    it("should have 5 markets in liquid staked pool", async () => {
      const poolVTokens = await comptroller.getAllMarkets();
      expect(poolVTokens).to.have.lengthOf(5);
    });

    it("should add vrsETH to the pool", async () => {
      const registeredVToken = await poolRegistry.getVTokenForAsset(comptroller.address, rsETH);
      expect(registeredVToken).to.equal(vrsETH);
    });

    it("check ownership", async () => {
      expect(await vrsETHContract.owner()).to.equal(ethereum.GUARDIAN);
    });

    it("check supply", async () => {
      const expectedSupply = parseUnits("2", 8);
      expect(await vrsETHContract.balanceOf(ethereum.VTREASURY)).to.equal(expectedSupply);
    });
    it("check borrow and supply caps", async () => {
      expect(await comptroller.borrowCaps(vrsETH)).equals(BORROW_CAP);
      expect(await comptroller.supplyCaps(vrsETH)).equals(SUPPLY_CAP);
    });
    it("should set vrsETH collateral factor to 80% and Liquidation threshold to 85%", async () => {
      const market = await comptroller.markets(vrsETH);
      expect(market.collateralFactorMantissa).to.equal(parseUnits("0.80", 18));
      expect(market.liquidationThresholdMantissa).to.equal(parseUnits("0.85", 18));
    });

    it("check protocol share reserve", async () => {
      expect(await vrsETHContract.protocolShareReserve()).equals(PROTOCOL_SHARE_RESERVE);
    });
    it("check reserve factor", async () => {
      expect(await vrsETHContract.reserveFactorMantissa()).equals(parseUnits("0.2", 18));
    });
    it("check protocol seize share", async () => {
      expect(await vrsETHContract.protocolSeizeShareMantissa()).equals(parseUnits("0.05", 18));
    });

    it("check vToken", async () => {
      checkVToken(vrsETH, {
        name: "Venus rsETH (Liquid Staked ETH)",
        symbol: "vrsETH_LiquidStakedETH",
        decimals: 8,
        underlying: rsETH,
        exchangeRate: parseUnits("1", 28),
        comptroller: LIQUID_STAKED_COMPTROLLER,
      });
    });
    it("check IR", async () => {
      const IR = await vrsETHContract.interestRateModel();
      checkInterestRate(
        IR,
        "vrsETHContract_Core",
        { base: "0", multiplier: "0.09", jump: "3", kink: "0.45" },
        BigNumber.from(2628000),
      );
    });
    it("check Pool", async () => {
      checkIsolatedPoolsComptrollers();
    });
  });
});
