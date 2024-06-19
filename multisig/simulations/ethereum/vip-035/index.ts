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
import {
  RECEIVER,
  REWARDS_DISTRIBUTOR_XVS,
  SFrxETHOracle,
  XVS_REWARD_TRANSFER,
  sfrxETH,
  vip035,
  vsfrxETH,
} from "../../../proposals/ethereum/vip-035";
import POOL_REGISTRY_ABI from "./abi/PoolRegistry.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import ERC20_ABI from "./abi/erc20.json";
import VTOKEN_ABI from "./abi/vToken.json";

const { ethereum } = NETWORK_ADDRESSES;
const CORE_COMPTROLLER = "0x687a01ecF6d3907658f7A7c714749fAC32336D1B";
const sfrxETH_HOLDER = "0x8CA7A5d6f3acd3A7A8bC468a8CD0FB14B6BD28b6";

forking(20119662, () => {
  let resilientOracle: Contract;
  let poolRegistry: Contract;
  let vsfrxETHContract: Contract;
  let comptroller: Contract;
  let sfrxETHOracle: Contract;
  let xvsContract: Contract;

  before(async () => {
    await impersonateAccount(sfrxETH_HOLDER);
    resilientOracle = await ethers.getContractAt(RESILIENT_ORACLE_ABI, ethereum.RESILIENT_ORACLE);
    poolRegistry = await ethers.getContractAt(POOL_REGISTRY_ABI, ethereum.POOL_REGISTRY);
    vsfrxETHContract = await ethers.getContractAt(VTOKEN_ABI, vsfrxETH);
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, CORE_COMPTROLLER);
    sfrxETHOracle = await ethers.getContractAt(RESILIENT_ORACLE_ABI, SFrxETHOracle);
    xvsContract = await ethers.getContractAt(ERC20_ABI, ethereum.XVS);
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
      expect(await sfrxETHOracle.owner()).to.equal(ethereum.GUARDIAN);
    });

    it("check price", async () => {
      expect(await resilientOracle.getPrice(sfrxETH)).to.be.closeTo(parseUnits("3720", 18), parseUnits("1", 18));
      expect(await resilientOracle.getUnderlyingPrice(vsfrxETH)).to.be.closeTo(
        parseUnits("3720", 18),
        parseUnits("1", 18),
      );
    });

    it("should have 10 markets in core pool", async () => {
      const poolVTokens = await comptroller.getAllMarkets();
      expect(poolVTokens).to.have.lengthOf(10);
    });

    it("should add vsfrxETH to the pool", async () => {
      const registeredVToken = await poolRegistry.getVTokenForAsset(comptroller.address, sfrxETH);
      expect(registeredVToken).to.equal(vsfrxETH);
    });

    it("check ownership", async () => {
      expect(await vsfrxETHContract.owner()).to.equal(ethereum.GUARDIAN);
    });

    it("check supply", async () => {
      const expectedSupply = parseUnits("1.2", 8);
      expect(await vsfrxETHContract.balanceOf(RECEIVER)).to.equal(expectedSupply);
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
      await checkIsolatedPoolsComptrollers({
        [CORE_COMPTROLLER]: sfrxETH_HOLDER,
      });
    });
    it("should have balance", async () => {
      expect(await xvsContract.balanceOf(REWARDS_DISTRIBUTOR_XVS)).to.gte(XVS_REWARD_TRANSFER);
    });
  });
});
