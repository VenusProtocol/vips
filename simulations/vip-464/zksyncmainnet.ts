import { expect } from "chai";
import { BigNumber } from "ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { setMaxStalePeriodInChainlinkOracle } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";
import ERC20_ABI from "src/vip-framework/abi/erc20.json";
import { checkIsolatedPoolsComptrollers } from "src/vip-framework/checks/checkIsolatedPoolsComptrollers";
import { checkRiskParameters } from "src/vip-framework/checks/checkRiskParameters";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import vip464, {
  ZKETH_COMPTROLLER_CORE,
  ZKETH_ORACLE,
  convertAmountToVTokens,
  newMarkets,
  tokens,
} from "../../vips/vip-464/bscmainnet";
import POOL_REGISTRY_ABI from "./abi/PoolRegistry.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import ZKETH_ORACLE_ABI from "./abi/ZkETHOracle.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import VTOKEN_ABI from "./abi/vToken.json";

const BLOCKS_PER_YEAR = BigNumber.from("31536000");

const { POOL_REGISTRY, NORMAL_TIMELOCK, CHAINLINK_ORACLE, RESILIENT_ORACLE } = NETWORK_ADDRESSES["zksyncmainnet"];

const WETH_CHAINLINK_FEED = "0x6D41d1dc818112880b40e26BD6FD347E41008eDA";

forking(57243944, async () => {
  const provider = ethers.provider;
  const oracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
  const poolRegistry = new ethers.Contract(POOL_REGISTRY, POOL_REGISTRY_ABI, provider);
  const comptroller = new ethers.Contract(ZKETH_COMPTROLLER_CORE, COMPTROLLER_ABI, provider);

  before(async () => {
    await setMaxStalePeriodInChainlinkOracle(
      CHAINLINK_ORACLE,
      tokens["WETH"].address,
      WETH_CHAINLINK_FEED,
      NORMAL_TIMELOCK,
    );
  });

  describe("vTokens deployment", () => {
    checkVToken(newMarkets["zkETH"].vToken.address, newMarkets["zkETH"].vToken);
  });

  testForkedNetworkVipCommands("zksync-zkETH", await vip464());

  describe("Post-VIP state", () => {
    describe("Oracle configuration", async () => {
      it("has the correct WETH price", async () => {
        const price = await oracle.getPrice(tokens["WETH"].address);
        expect(price).to.be.eq(parseUnits("2194.5024", 18));
      });

      it("has the correct zkETH oracle configuration", async () => {
        const zkETHOracle = new ethers.Contract(ZKETH_ORACLE, ZKETH_ORACLE_ABI, provider);
        expect(await zkETHOracle.CORRELATED_TOKEN()).to.equal(tokens["zkETH"].address);
        expect(await zkETHOracle.UNDERLYING_TOKEN()).to.equal(tokens["WETH"].address);
        expect(await zkETHOracle.RESILIENT_ORACLE()).to.equal(RESILIENT_ORACLE);
      });

      it("has the correct zkETH price", async () => {
        const price = await oracle.getPrice(tokens["zkETH"].address);
        expect(price).to.be.eq(parseUnits("2208.763725755763322437", 18));
      });
    });

    describe("PoolRegistry state", () => {
      it(`should add ${newMarkets["zkETH"].vToken.symbol} to the Comptroller`, async () => {
        const poolVTokens = await comptroller.getAllMarkets();
        expect(poolVTokens).to.contain(newMarkets["zkETH"].vToken.address);
      });

      it(`should register ${newMarkets["zkETH"].vToken.symbol} in PoolRegistry`, async () => {
        const registeredVToken = await poolRegistry.getVTokenForAsset(
          ZKETH_COMPTROLLER_CORE,
          newMarkets["zkETH"].vToken.underlying.address,
        );
        expect(registeredVToken).to.equal(newMarkets["zkETH"].vToken.address);
      });
    });

    describe("Risk parameters", () => {
      checkRiskParameters(
        newMarkets["zkETH"].vToken.address,
        newMarkets["zkETH"].vToken,
        newMarkets["zkETH"].riskParameters,
      );

      it("should pause brrowing on zkETH", async () => {
        expect(await comptroller.actionPaused(newMarkets["zkETH"].vToken.address, 2)).to.equal(true);
      });
    });

    describe("Ownership and initial supply", () => {
      const { vToken: vTokenSpec, initialSupply } = newMarkets["zkETH"];
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
        newMarkets["zkETH"].interestRateModel.address,
        newMarkets["zkETH"].vToken.symbol,
        newMarkets["zkETH"].interestRateModel,
        BLOCKS_PER_YEAR,
      );
    });

    checkIsolatedPoolsComptrollers();
  });
});
