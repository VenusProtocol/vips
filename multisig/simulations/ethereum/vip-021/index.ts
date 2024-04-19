import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { initMainnetUser } from "../../../../src/utils";
import { checkVToken } from "../../../../src/vip-framework/checks/checkVToken";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework/index";
import vip021 from "../../../proposals/ethereum/vip-021";
import { BORROW_CAP, DAI, INITIAL_SUPPLY, SUPPLY_CAP, vDAI } from "../../../proposals/ethereum/vip-021";
import COMPTROLLER_ABI from "./abi/ComptrollerAbi.json";
import POOL_REGISTRY_ABI from "./abi/PoolRegistryAbi.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracleAbi.json";
import VTOKEN_ABI from "./abi/VTokenAbi.json";
import ERC20_ABI from "./abi/erc20Abi.json";

const { ethereum } = NETWORK_ADDRESSES;
const COMPTROLLER = "0x687a01ecF6d3907658f7A7c714749fAC32336D1B";

forking(19689000, () => {
  let resilientOracle: Contract;
  let poolRegistry: Contract;
  let vdai: Contract;
  let dai: Contract;
  let comptroller: Contract;

  before(async () => {
    resilientOracle = await ethers.getContractAt(RESILIENT_ORACLE_ABI, ethereum.RESILIENT_ORACLE);
    poolRegistry = await ethers.getContractAt(POOL_REGISTRY_ABI, ethereum.POOL_REGISTRY);
    vdai = await ethers.getContractAt(VTOKEN_ABI, vDAI);
    dai = await ethers.getContractAt(ERC20_ABI, DAI);

    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER);
  });

  describe("Pre-VIP behavior", () => {
    it("check price", async () => {
      await expect(resilientOracle.getPrice(vDAI)).to.be.reverted;
    });
    it("should have 6 markets in core pool", async () => {
      const poolVTokens = await comptroller.getAllMarkets();
      expect(poolVTokens).to.have.lengthOf(5);
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      // This trasaction will be removed once Vtreasury on ethereum has enough funds
      const impersonatedDaiHolder = await initMainnetUser(
        "0x2D86e074C34e1FF2D33e8049Ee28e21Ce3A9Aa16",
        parseUnits("1", 18),
      );
      await dai.connect(impersonatedDaiHolder).transfer(ethereum.VTREASURY, INITIAL_SUPPLY);
      await pretendExecutingVip(vip021());
    });

    it("check price", async () => {
      expect(await resilientOracle.getPrice(DAI)).to.equals("1000048880000000000");
    });

    it("should have 7 markets in core pool", async () => {
      const poolVTokens = await comptroller.getAllMarkets();
      expect(poolVTokens).to.have.lengthOf(6);
    });

    it("should add vDAI to the pool", async () => {
      const registeredVToken = await poolRegistry.getVTokenForAsset(COMPTROLLER, DAI);
      expect(registeredVToken).to.equal(vDAI);
    });

    it("check ownership", async () => {
      expect(await vdai.owner()).to.equal(ethereum.GUARDIAN);
    });

    it("check supply of Vtreasury", async () => {
      expect(await vdai.balanceOf(ethereum.VTREASURY)).to.equal(parseUnits("5000", 8));
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
  });
});
