import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { initMainnetUser, setMaxStaleCoreAssets, setMaxStalePeriod, setMaxStalePeriodInChainlinkOracle } from "src/utils";
import { checkIsolatedPoolsComptrollers } from "src/vip-framework/checks/checkIsolatedPoolsComptrollers";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";
import { forking, pretendExecutingVip } from "src/vip-framework/index";

import {  ezETH, vip043 } from "../../../proposals/sepolia/vip-043";
import POOL_REGISTRY_ABI from "./abi/PoolRegistry.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import VTOKEN_ABI from "./abi/vToken.json";
import ERC20_ABI from "./abi/weth.json";

const { sepolia } = NETWORK_ADDRESSES;
// const LIQUID_STAKED_COMPTROLLER = "0xd79CeB8EF8188E44b7Eb899094e8A3A4d7A1e236";
// const PROTOCOL_SHARE_RESERVE = "0xbea70755cc3555708ca11219adB0db4C80F6721B";
const WETH = "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9";

forking(6361333, async () => {
  let resilientOracle: Contract;
  let poolRegistry: Contract;
  let vezETHContract: Contract;
  let comptroller: Contract;
  let redstoneOracle: Contract;
  let weth = await ethers.getContractAt(ERC20_ABI, WETH);

  before(async () => {
    resilientOracle = await ethers.getContractAt(RESILIENT_ORACLE_ABI, sepolia.RESILIENT_ORACLE);
    redstoneOracle = await ethers.getContractAt(RESILIENT_ORACLE_ABI, sepolia.REDSTONE_ORACLE);
    // poolRegistry = await ethers.getContractAt(POOL_REGISTRY_ABI, sepolia.POOL_REGISTRY);
    // vezETHContract = await ethers.getContractAt(VTOKEN_ABI, vezETH);
    // comptroller = await ethers.getContractAt(COMPTROLLER_ABI, LIQUID_STAKED_COMPTROLLER);
  });

  describe("Pre-VIP behavior", () => {
    it("check price", async () => {
      await expect(resilientOracle.getPrice(ezETH)).to.be.reverted;
    });
    // it("should have 4 markets in liquid staked pool", async () => {
    //   const poolVTokens = await comptroller.getAllMarkets();
    //   expect(poolVTokens).to.have.lengthOf(4);
    // });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip043());
    });

    it("check price", async () => {
      expect(await resilientOracle.getPrice(ezETH)).to.be.closeTo(parseUnits("3529", 18), parseUnits("1", 18));
      // expect(await resilientOracle.getUnderlyingPrice(ezETH)).to.be.closeTo(
      //   parseUnits("3540", 18),
      //   parseUnits("1", 18),
      // );
    });

    // it("should have 5 markets in liquid staked pool", async () => {
    //   const poolVTokens = await comptroller.getAllMarkets();
    //   expect(poolVTokens).to.have.lengthOf(5);
    // });

    // it("should add vezETH to the pool", async () => {
    //   const registeredVToken = await poolRegistry.getVTokenForAsset(comptroller.address, ezETH);
    //   expect(registeredVToken).to.equal(vezETH);
    // });

    // it("check ownership", async () => {
    //   expect(await vezETHContract.owner()).to.equal(sepolia.GUARDIAN);
    // });

    // it("check supply", async () => {
    //   const expectedSupply = parseUnits("2", 8);
    //   expect(await vezETHContract.balanceOf(sepolia.VTREASURY)).to.equal(expectedSupply);
    // });
    // it("check borrow and supply caps", async () => {
    //   expect(await comptroller.borrowCaps(vezETH)).equals(BORROW_CAP);
    //   expect(await comptroller.supplyCaps(vezETH)).equals(SUPPLY_CAP);
    // });
    // it("should set vezETH collateral factor to 80% and Liquidation threshold to 85%", async () => {
    //   const market = await comptroller.markets(vezETH);
    //   expect(market.collateralFactorMantissa).to.equal(parseUnits("0.80", 18));
    //   expect(market.liquidationThresholdMantissa).to.equal(parseUnits("0.85", 18));
    // });

    // it("check protocol share reserve", async () => {
    //   expect(await vezETHContract.protocolShareReserve()).equals(PROTOCOL_SHARE_RESERVE);
    // });
    // it("check reserve factor", async () => {
    //   expect(await vezETHContract.reserveFactorMantissa()).equals(parseUnits("0.2", 18));
    // });
    // it("check protocol seize share", async () => {
    //   expect(await vezETHContract.protocolSeizeShareMantissa()).equals(parseUnits("0.05", 18));
    // });

    // it("check vToken", async () => {
    //   checkVToken(vezETH, {
    //     name: "Venus ezETH (Liquid Staked ETH)",
    //     symbol: "vezETH_LiquidStakedETH",
    //     decimals: 8,
    //     underlying: ezETH,
    //     exchangeRate: parseUnits("1", 28),
    //     comptroller: LIQUID_STAKED_COMPTROLLER,
    //   });
    // });
    // it("check IR", async () => {
    //   const IR = await vezETHContract.interestRateModel();
    //   checkInterestRate(
    //     IR,
    //     "vezETHContract_Core",
    //     { base: "0", multiplier: "0.09", jump: "3", kink: "0.45" },
    //     BigNumber.from(2628000),
    //   );
    // });
    // it("check Pool", async () => {
    //   const vWETH = "0xc2931B1fEa69b6D6dA65a50433A8D75d285e4da9";
    //   const user = "0x5dAD5eB7a3e557642625399D51577838d26dEae0";
    //   const vWETH_core = await ethers.getContractAt(VTOKEN_ABI, vWETH);
    //   const weth = await ethers.getContractAt(ERC20_ABI, sepolia.WETH);
    //   const amount = parseUnits("3000", 18);
    //   const signer = await initMainnetUser(user, parseUnits("3100", 18));
    //   await weth.connect(signer).deposit({ value: amount });
    //   await weth.connect(signer).approve(vWETH, amount);
    //   await vWETH_core.connect(signer).mint(amount);

    //   checkIsolatedPoolsComptrollers();
    // });
  });
});
