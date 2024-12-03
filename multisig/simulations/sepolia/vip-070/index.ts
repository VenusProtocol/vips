import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { initMainnetUser } from "src/utils";
import { checkIsolatedPoolsComptrollers } from "src/vip-framework/checks/checkIsolatedPoolsComptrollers";
import { checkRiskParameters } from "src/vip-framework/checks/checkRiskParameters";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";
import { forking, pretendExecutingVip } from "src/vip-framework/index";

import vip070, { marketSpec } from "../../../proposals/sepolia/vip-070";
import POOL_REGISTRY_ABI from "./abi/PoolRegistry.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import ERC20_ABI from "./abi/erc20.json";
import VTOKEN_ABI from "./abi/vToken.json";

const { sepolia } = NETWORK_ADDRESSES;
const PROTOCOL_SHARE_RESERVE = "0xbea70755cc3555708ca11219adB0db4C80F6721B";
const BLOCKS_PER_YEAR = BigNumber.from(2628000);

const { POOL_REGISTRY, RESILIENT_ORACLE, GUARDIAN, VTREASURY, NORMAL_TIMELOCK } = sepolia;

forking(6805700, async () => {
  const resilientOracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);
  const poolRegistry = new ethers.Contract(POOL_REGISTRY, POOL_REGISTRY_ABI, ethers.provider);
  const vToken = new ethers.Contract(marketSpec.vToken.address, VTOKEN_ABI, ethers.provider);
  const comptroller = new ethers.Contract(marketSpec.vToken.comptroller, COMPTROLLER_ABI, ethers.provider);
  const underlying = new ethers.Contract(marketSpec.vToken.underlying.address, ERC20_ABI, ethers.provider);

  describe("Pre-VIP behavior", () => {
    it("check price", async () => {
      await expect(resilientOracle.getPrice(marketSpec.vToken.underlying.address)).to.be.reverted;
    });

    it("should have 8 markets in liquid staked pool", async () => {
      const poolVTokens = await comptroller.getAllMarkets();
      expect(poolVTokens).to.have.lengthOf(8);
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip070());
    });

    it("check price", async () => {
      expect(await resilientOracle.getPrice(marketSpec.vToken.underlying.address)).to.be.closeTo(
        parseUnits("2368.35", 18),
        parseUnits("1", 18),
      );
      expect(await resilientOracle.getUnderlyingPrice(marketSpec.vToken.address)).to.be.closeTo(
        parseUnits("2368.35", 18),
        parseUnits("1", 18),
      );
    });

    it("should have 9 markets in liquid staked pool", async () => {
      const poolVTokens = await comptroller.getAllMarkets();
      expect(poolVTokens).to.have.lengthOf(9);
    });

    it(`should add ${marketSpec.vToken.symbol} to the pool`, async () => {
      const registeredVToken = await poolRegistry.getVTokenForAsset(
        comptroller.address,
        marketSpec.vToken.underlying.address,
      );
      expect(registeredVToken).to.equal(marketSpec.vToken.address);
    });

    it("check ownership", async () => {
      expect(await vToken.owner()).to.equal(GUARDIAN);
    });

    it("check supply", async () => {
      const expectedSupply = parseUnits("5", 8);
      expect(await vToken.balanceOf(VTREASURY)).to.equal(expectedSupply);
    });

    it("has correct protocol share reserve", async () => {
      expect(await vToken.protocolShareReserve()).equals(PROTOCOL_SHARE_RESERVE);
    });

    checkRiskParameters(marketSpec.vToken.address, marketSpec.vToken, marketSpec.riskParameters);
    checkVToken(marketSpec.vToken.address, marketSpec.vToken);
    checkInterestRate(
      marketSpec.interestRateModel.address,
      marketSpec.vToken.symbol,
      marketSpec.interestRateModel,
      BLOCKS_PER_YEAR,
    );

    it("check Pool", async () => {
      const timelock = await initMainnetUser(NORMAL_TIMELOCK, parseEther("5"));
      await underlying.connect(timelock).faucet(parseUnits("100", 18));
      checkIsolatedPoolsComptrollers({
        [marketSpec.vToken.comptroller]: NORMAL_TIMELOCK,
      });
    });
  });
});
