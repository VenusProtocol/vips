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
import { BORROW_CAP, DAI, SUPPLY_CAP, vDAI } from "../../../proposals/sepolia/vip-019";
import COMPTROLLER_ABI from "./abi/ComptrollerAbi.json";
import POOL_REGISTRY_ABI from "./abi/PoolRegistryAbi.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracleAbi.json";
import VTOKEN_ABI from "./abi/VTokenAbi.json";

const { sepolia } = NETWORK_ADDRESSES;
const COMPTROLLER = "0x7Aa39ab4BcA897F403425C9C6FDbd0f882Be0D70";
const PROTOCOL_SHARE_RESERVE = "0xbea70755cc3555708ca11219adB0db4C80F6721B";

forking(5730900, () => {
  let resilientOracle: Contract;
  let poolRegistry: Contract;
  let vdai: Contract;
  let comptroller: Contract;

  before(async () => {
    resilientOracle = await ethers.getContractAt(RESILIENT_ORACLE_ABI, sepolia.RESILIENT_ORACLE);
    poolRegistry = await ethers.getContractAt(POOL_REGISTRY_ABI, sepolia.POOL_REGISTRY);
    vdai = await ethers.getContractAt(VTOKEN_ABI, vDAI);
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER);
  });

  describe("Pre-VIP behavior", () => {
    it("check price", async () => {
      await expect(resilientOracle.getPrice(vDAI)).to.be.reverted;
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
      expect(await resilientOracle.getPrice(DAI)).to.equals("999799150000000000");
    });

    it("should have 7 markets in core pool", async () => {
      const poolVTokens = await comptroller.getAllMarkets();
      expect(poolVTokens).to.have.lengthOf(7);
    });

    it("should add vDAI to the pool", async () => {
      const registeredVToken = await poolRegistry.getVTokenForAsset(COMPTROLLER, DAI);
      expect(registeredVToken).to.equal(vDAI);
    });

    it("check ownership", async () => {
      expect(await vdai.owner()).to.equal(sepolia.GUARDIAN);
    });
    it("check supply of Vtreasury", async () => {
      expect(await vdai.balanceOf(sepolia.VTREASURY)).to.equal(parseUnits("5000", 8));
    });
    it("check protocol share reserve", async () => {
      expect(await vdai.protocolShareReserve()).equals(PROTOCOL_SHARE_RESERVE);
    });
    it("check reserve factor", async () => {
      expect(await vdai.reserveFactorMantissa()).equals(parseUnits("0.1", 18));
    });
    it("check protocolSeizeShare", async () => {
      expect(await vdai.protocolSeizeShareMantissa()).equals(parseUnits("0.05", 18));
    });

    it("should return supply and borrow caps", async () => {
      expect(await comptroller.borrowCaps(vDAI)).equals(BORROW_CAP);
      expect(await comptroller.supplyCaps(vDAI)).equals(SUPPLY_CAP);
    });
    it("check vToken", async () => {
      await checkVToken(vDAI, {
        name: "Venus DAI (Core)",
        symbol: "vDAI_Core",
        decimals: 8,
        underlying: DAI,
        exchangeRate: parseUnits("1", 28),
        comptroller: COMPTROLLER,
      });
    });
    it("check IR", async () => {
      const IR = await vdai.interestRateModel();
      checkInterestRate(
        IR,
        "vDAI_Core",
        { base: "0", multiplier: "0.15", jump: "2.5", kink: "0.8" },
        BigNumber.from(2628000),
      );
    });
    it("check Pool", async () => {
      checkIsolatedPoolsComptrollers({ comptroller: COMPTROLLER });
    });
  });
});
