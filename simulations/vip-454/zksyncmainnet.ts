import { expect } from "chai";
import { BigNumber } from "ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { setMaxStalePeriodInChainlinkOracle } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";
import { checkIsolatedPoolsComptrollers } from "src/vip-framework/checks/checkIsolatedPoolsComptrollers";
import { checkRiskParameters } from "src/vip-framework/checks/checkRiskParameters";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import vip454, {
  CHAINLINK_WSTETH_FEED_ZKSYNC,
  COMPTROLLER_CORE_ZKSYNC,
  convertAmountToVTokens,
  token_ZKSYNC,
  wstETH_ONE_JUMP_ORACLE_ZKSYNC,
  zksyncMarket,
} from "../../vips/vip-454/bscmainnet";
import JUMPRATEMODEL_ABI from "./abi/JumpRateModel.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import ERC20_ABI from "./abi/erc20.json";
import POOL_REGISTRY_ABI from "./abi/poolRegistry.json";
import VTOKEN_ABI from "./abi/vToken.json";

const WSTETH_HOLDER = "0x2d23fefFED69EBA4cd6eD47f7006bbd6284DFBeA";

const { POOL_REGISTRY, NORMAL_TIMELOCK, RESILIENT_ORACLE, CHAINLINK_ORACLE } = NETWORK_ADDRESSES["zksyncmainnet"];

const BLOCKS_PER_YEAR = BigNumber.from("31536000"); // equal to seconds in a year as it is time based deployment
const ONE_YEAR = 3600 * 24 * 365;

forking(56518970, async () => {
  const provider = ethers.provider;
  const oracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
  const poolRegistry = new ethers.Contract(POOL_REGISTRY, POOL_REGISTRY_ABI, provider);
  const comptroller = new ethers.Contract(COMPTROLLER_CORE_ZKSYNC, COMPTROLLER_ABI, provider);

  before(async () => {
    await setMaxStalePeriodInChainlinkOracle(
      CHAINLINK_ORACLE,
      token_ZKSYNC["WETH"].address,
      CHAINLINK_WSTETH_FEED_ZKSYNC,
      NORMAL_TIMELOCK,
    );
  });

  describe("vTokens deployment", () => {
    checkVToken(zksyncMarket.vToken.address, zksyncMarket.vToken);
  });

  testForkedNetworkVipCommands("wstEth_Core - ZKSYNC", await vip454({ chainlinkStalePeriod: ONE_YEAR }));

  describe("Post-VIP state", () => {
    describe("Oracle configuration", async () => {
      it("has the correct wstETH price", async () => {
        const price = await oracle.getPrice(zksyncMarket.vToken.underlying.address);
        expect(price).to.be.eq(parseUnits("1.427459814154928703", 18));
      });

      it("has the correct wstETH oracle configuration", async () => {
        const JUMP_RATE_ORACLE = new ethers.Contract(wstETH_ONE_JUMP_ORACLE_ZKSYNC, JUMPRATEMODEL_ABI, provider);
        expect(await JUMP_RATE_ORACLE.CORRELATED_TOKEN()).to.equal(zksyncMarket.vToken.underlying.address);
        expect(await JUMP_RATE_ORACLE.RESILIENT_ORACLE()).to.equal(RESILIENT_ORACLE);
      });
    });
  });

  describe("PoolRegistry state", () => {
    it(`should add ${zksyncMarket.vToken.symbol} to the Comptroller`, async () => {
      const poolVTokens = await comptroller.getAllMarkets();
      expect(poolVTokens).to.contain(zksyncMarket.vToken.address);
    });

    it(`should register ${zksyncMarket.vToken.symbol} in PoolRegistry`, async () => {
      const registeredVToken = await poolRegistry.getVTokenForAsset(
        COMPTROLLER_CORE_ZKSYNC,
        zksyncMarket.vToken.underlying.address,
      );

      expect(registeredVToken).to.equal(zksyncMarket.vToken.address);
    });
  });

  describe("Risk parameters", () => {
    checkRiskParameters(zksyncMarket.vToken.address, zksyncMarket.vToken, zksyncMarket.riskParameters);
  });

  describe("Ownership and initial supply", () => {
    const { vToken: vTokenSpec, initialSupply } = zksyncMarket;
    const vTokenContract = new ethers.Contract(vTokenSpec.address, VTOKEN_ABI, provider);

    describe(`${vTokenSpec.symbol}`, () => {
      it(`should have owner = normal timelock`, async () => {
        expect(await vTokenContract.owner()).to.equal(NORMAL_TIMELOCK);
      });

      const vTokenSupply = convertAmountToVTokens(initialSupply.amount, vTokenSpec.exchangeRate);
      const vTokenSupplyForReceiver = vTokenSupply.sub(initialSupply.vTokensToBurn);
      const format = (amount: BigNumber, spec: { decimals: number; symbol: string }) =>
        `${formatUnits(amount, spec.decimals)} ${spec.symbol}`;

      it(`should have balance of underlying = ${format(initialSupply.amount, vTokenSpec.underlying)}`, async () => {
        const underlying = new ethers.Contract(vTokenSpec.underlying.address, ERC20_ABI, provider);
        expect(await underlying.balanceOf(vTokenSpec.address)).to.equal(initialSupply.amount);
      });

      it(`should have total supply of ${format(vTokenSupply, vTokenSpec)}`, async () => {
        expect(await vTokenContract.totalSupply()).to.equal(vTokenSupply);
      });

      it(`should send ${format(vTokenSupplyForReceiver, vTokenSpec)} to receiver`, async () => {
        const receiverBalance = await vTokenContract.balanceOf(initialSupply.vTokenReceiver);
        expect(receiverBalance).to.equal(vTokenSupplyForReceiver);
      });

      it(`should burn ${format(initialSupply.vTokensToBurn, vTokenSpec)}`, async () => {
        const burnt = await vTokenContract.balanceOf(ethers.constants.AddressZero);
        expect(burnt).to.equal(initialSupply.vTokensToBurn);
      });

      it(`should leave no ${vTokenSpec.symbol} in the timelock`, async () => {
        const timelockBalance = await vTokenContract.balanceOf(NORMAL_TIMELOCK);
        expect(timelockBalance).to.equal(0);
      });
    });
  });

  describe("Interest rates", () => {
    checkInterestRate(
      zksyncMarket.interestRateModel.address,
      zksyncMarket.vToken.symbol,
      zksyncMarket.interestRateModel,
      BLOCKS_PER_YEAR,
    );
  });

  describe("generic tests", () => {
    checkIsolatedPoolsComptrollers({
      [COMPTROLLER_CORE_ZKSYNC]: WSTETH_HOLDER,
    });
  });
});
