import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { checkIsolatedPoolsComptrollers } from "../../../../src/vip-framework/checks/checkIsolatedPoolsComptrollers";
import { checkVToken } from "../../../../src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "../../../../src/vip-framework/checks/interestRateModel";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework/index";
import { SFrxETHOracle, sfrxETH, vip035, vsfrxETH } from "../../../proposals/sepolia/vip-035";
import POOL_REGISTRY_ABI from "./abi/PoolRegistry.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import ERC20_ABI from "./abi/erc20.json";
import VTOKEN_ABI from "./abi/vToken.json";

const { sepolia } = NETWORK_ADDRESSES;
const CORE_COMPTROLLER = "0x7Aa39ab4BcA897F403425C9C6FDbd0f882Be0D70";

forking(6134567, () => {
  let resilientOracle: Contract;
  let poolRegistry: Contract;
  let vsfrxETHContract: Contract;
  let comptroller: Contract;
  let sfrxETHContract: Contract;
  let sfrxETHOracle: Contract;

  before(async () => {
    await impersonateAccount(sepolia.NORMAL_TIMELOCK);
    resilientOracle = await ethers.getContractAt(RESILIENT_ORACLE_ABI, sepolia.RESILIENT_ORACLE);
    poolRegistry = await ethers.getContractAt(POOL_REGISTRY_ABI, sepolia.POOL_REGISTRY);
    vsfrxETHContract = await ethers.getContractAt(VTOKEN_ABI, vsfrxETH);
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, CORE_COMPTROLLER);
    sfrxETHContract = await ethers.getContractAt(ERC20_ABI, sfrxETH, await ethers.getSigner(sepolia.NORMAL_TIMELOCK));
    sfrxETHOracle = await ethers.getContractAt(RESILIENT_ORACLE_ABI, SFrxETHOracle);
  });

  describe("Pre-VIP behavior", () => {
    it("check price", async () => {
      await expect(resilientOracle.getPrice(sfrxETH)).to.be.reverted;
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(vip035());
    });

    it("check owner", async () => {
      expect(await sfrxETHOracle.owner()).to.equal(sepolia.GUARDIAN);
    });

    it("check price", async () => {
      expect(await resilientOracle.getPrice(sfrxETH)).to.be.closeTo(parseUnits("3992", 18), parseUnits("1", 18));
      expect(await resilientOracle.getUnderlyingPrice(vsfrxETH)).to.be.closeTo(
        parseUnits("3992", 18),
        parseUnits("1", 18),
      );
    });

    it("should have 11 markets in core pool", async () => {
      const poolVTokens = await comptroller.getAllMarkets();
      expect(poolVTokens).to.have.lengthOf(11);
    });

    it("should add vsfrxETH to the pool", async () => {
      const registeredVToken = await poolRegistry.getVTokenForAsset(comptroller.address, sfrxETH);
      expect(registeredVToken).to.equal(vsfrxETH);
    });

    it("check ownership", async () => {
      expect(await vsfrxETHContract.owner()).to.equal(sepolia.GUARDIAN);
    });

    it("check supply", async () => {
      const expectedSupply = parseUnits("1.2", 8);
      expect(await vsfrxETHContract.balanceOf(sepolia.VTREASURY)).to.equal(expectedSupply);
    });

    it("should set collateral factor to 90% and Liquidation threshold to 93%", async () => {
      const market = await comptroller.markets(vsfrxETH);
      expect(market.collateralFactorMantissa).to.equal(parseUnits("0.9", 18));
      expect(market.liquidationThresholdMantissa).to.equal(parseUnits("0.93", 18));
    });

    it("check protocol seize share", async () => {
      expect(await vsfrxETHContract.protocolSeizeShareMantissa()).equals(parseUnits("0.01", 18));
    });

    it("check vToken", async () => {
      await checkVToken(vsfrxETH, {
        name: "Venus sfrxETH (Liquid Staked ETH)",
        symbol: "vsfrxETH_LiquidStakedETH",
        decimals: 8,
        underlying: sfrxETH,
        exchangeRate: parseUnits("1", 28),
        comptroller: CORE_COMPTROLLER,
      });
    });
    it("check reserve factor", async () => {
      expect(await vsfrxETHContract.reserveFactorMantissa()).equals(parseUnits("0.2", 18));
    });
    it("check IR", async () => {
      const IR = await vsfrxETHContract.interestRateModel();
      checkInterestRate(
        IR,
        "vsfrxETH_LiquidStakedETH",
        { base: "0", multiplier: "0.09", jump: "3", kink: "0.4" },
        BigNumber.from(2628000),
      );
    });
    it("check Pool", async () => {
      await sfrxETHContract.faucet(parseUnits("10000", 18));
      await checkIsolatedPoolsComptrollers({
        [CORE_COMPTROLLER]: sepolia.NORMAL_TIMELOCK,
      });
    });
  });
});
