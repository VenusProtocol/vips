import { expect } from "chai";
import { BigNumber, providers } from "ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { ethers, network } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { setMaxStalePeriodInChainlinkOracle } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";
import { checkIsolatedPoolsComptrollers } from "src/vip-framework/checks/checkIsolatedPoolsComptrollers";
import { checkRiskParameters } from "src/vip-framework/checks/checkRiskParameters";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import vip454, {
  CHAINLINK_WETH_FEED,
  COMPTROLLER_CORE,
  newMarket,
  token,
  wstETH_ONE_JUMP_ORACLE,
} from "../../vips/vip-454/bscmainnetZksync";
import JUMPRATEMODEL_ABI from "./abi/JumpRateModel.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import ERC20_ABI from "./abi/erc20.json";
import POOL_REGISTRY_ABI from "./abi/poolRegistry.json";
import VTOKEN_ABI from "./abi/vToken.json";

const WSTETH_HOLDER = "0x2d23fefFED69EBA4cd6eD47f7006bbd6284DFBeA";
const USER = "0x2d23fefFED69EBA4cd6eD47f7006bbd6284DFBeA";

const { POOL_REGISTRY, NORMAL_TIMELOCK, RESILIENT_ORACLE, CHAINLINK_ORACLE } = NETWORK_ADDRESSES["zksyncmainnet"];

const BLOCKS_PER_YEAR = BigNumber.from("31536000"); // equal to seconds in a year as it is time based deployment

forking(4761402, async () => {
  const provider = ethers.provider;
  const oracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
  const poolRegistry = new ethers.Contract(POOL_REGISTRY, POOL_REGISTRY_ABI, provider);
  const comptroller = new ethers.Contract(COMPTROLLER_CORE, COMPTROLLER_ABI, provider);
  const vToken = new ethers.Contract(newMarket.vToken.address, VTOKEN_ABI, provider);

  before(async () => {
    const { initialSupply } = newMarket;
    await network.provider.request({
      method: "anvil_impersonateAccount",
      params: [USER],
    });

    await network.provider.request({
      method: "anvil_impersonateAccount",
      params: [newMarket.initialSupply.vTokenReceiver],
    });

    await network.provider.request({
      method: "anvil_setBalance",
      params: [newMarket.initialSupply.vTokenReceiver, "0x3635C9ADC5DEA00000"],
    });

    const provider = new providers.JsonRpcProvider("http://0.0.0.0:8011");

    const vReceiver = await provider.getSigner(initialSupply.vTokenReceiver);
    await vToken.connect(vReceiver).approve(NORMAL_TIMELOCK, initialSupply.vTokensToBurn);
    await setMaxStalePeriodInChainlinkOracle(
      CHAINLINK_ORACLE,
      token["WETH"].address,
      CHAINLINK_WETH_FEED,
      NORMAL_TIMELOCK,
    );
  });

  describe("vTokens deployment", () => {
    it(`should deploy market`, async () => {
      await checkVToken(newMarket.vToken.address, newMarket.vToken);
    });
  });

  testForkedNetworkVipCommands("wstEth_Core - ZKSYNC", await vip454());

  describe("Post-VIP state", () => {
    describe("Oracle configuration", async () => {
      it("has the correct wstETH price", async () => {
        const price = await oracle.getPrice(newMarket.vToken.underlying.address);
        expect(price).to.be.eq(parseUnits("3273.154450063484488638", 18));
      });

      it("has the correct wstETH oracle configuration", async () => {
        const JUMP_RATE_ORACLE = new ethers.Contract(wstETH_ONE_JUMP_ORACLE, JUMPRATEMODEL_ABI, provider);
        expect(await JUMP_RATE_ORACLE.CORRELATED_TOKEN()).to.equal(newMarket.vToken.underlying.address);
        expect(await JUMP_RATE_ORACLE.RESILIENT_ORACLE()).to.equal(RESILIENT_ORACLE);
      });
    });
  });

  describe("PoolRegistry state", () => {
    it(`should add ${newMarket.vToken.symbol} to the Comptroller`, async () => {
      const poolVTokens = await comptroller.getAllMarkets();
      expect(poolVTokens).to.contain(newMarket.vToken.address);
    });

    it(`should register ${newMarket.vToken.symbol} in PoolRegistry`, async () => {
      const registeredVToken = await poolRegistry.getVTokenForAsset(
        COMPTROLLER_CORE,
        newMarket.vToken.underlying.address,
      );

      expect(registeredVToken).to.equal(newMarket.vToken.address);
    });
  });

  describe("Risk parameters", () => {
    checkRiskParameters(newMarket.vToken.address, newMarket.vToken, newMarket.riskParameters);
  });

  describe("Ownership and initial supply", () => {
    const { vToken: vTokenSpec, initialSupply } = newMarket;
    const vTokenContract = new ethers.Contract(vTokenSpec.address, VTOKEN_ABI, provider);
    const underlyingSymbol = vTokenSpec.underlying.symbol;

    describe(`${vTokenSpec.symbol}`, () => {
      it(`should have owner = normal timelock`, async () => {
        expect(await vTokenContract.owner()).to.equal(NORMAL_TIMELOCK);
      });

      // Initial exchange rate should account for decimal transformations such that
      // the string representation is the same (i.e. 1 vToken == 1 underlying)
      const multiplier = 10 ** (vTokenSpec.underlying.decimals - vTokenSpec.decimals);
      const vTokenSupply = initialSupply.amount.div(multiplier);
      const underlyingSupplyString = formatUnits(initialSupply.amount, vTokenSpec.underlying.decimals);
      const vTokenSupplyString = formatUnits(vTokenSupply, vTokenSpec.decimals);

      it(`should have initial supply = ${vTokenSupplyString} ${vTokenSpec.symbol}`, async () => {
        expect(await vTokenContract.balanceOf(initialSupply.vTokenReceiver)).to.equal(
          vTokenSupply.sub(newMarket.initialSupply.vTokensToBurn),
        );
      });

      it(`should have balance of underlying = ${underlyingSupplyString} ${underlyingSymbol}`, async () => {
        const underlying = new ethers.Contract(vTokenSpec.underlying.address, ERC20_ABI, provider);
        expect(await underlying.balanceOf(vTokenSpec.address)).to.equal(initialSupply.amount);
      });
    });
  });

  describe("Interest rates", () => {
    checkInterestRate(
      newMarket.interestRateModel.address,
      newMarket.vToken.symbol,
      newMarket.interestRateModel,
      BLOCKS_PER_YEAR,
    );
  });

  describe("generic tests", async () => {
    checkIsolatedPoolsComptrollers({
      [COMPTROLLER_CORE]: WSTETH_HOLDER,
    });
  });
});
