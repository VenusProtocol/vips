import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip389, { BORROW_CAP,
  CORE_COMPTROLLER,
  SUPPLY_CAP,
  vEIGEN,
  EIGEN,
  PRICE } from "../../vips/vip-389/bsctestnet";
import POOL_REGISTRY_ABI from "./abi/PoolRegistry.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import ERC20_ABI from "./abi/erc20.json";
import VTOKEN_ABI from "./abi/vToken.json";
import { BigNumber, Contract } from "ethers";
import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { parseUnits } from "ethers/lib/utils";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

const { sepolia } = NETWORK_ADDRESSES;
const PROTOCOL_SHARE_RESERVE = "0xbea70755cc3555708ca11219adB0db4C80F6721B";

forking(6964722, async () => {
  let resilientOracle: Contract;
  let poolRegistry: Contract;
  let vEIGENContract: Contract;
  let comptroller: Contract;
  let eigenContract: Contract;

  before(async () => {
    // await impersonateAccount(sepolia.NORMAL_TIMELOCK);
    // await setBalance(sepolia.NORMAL_TIMELOCK, parseUnits("1000", 18));

    resilientOracle = await ethers.getContractAt(RESILIENT_ORACLE_ABI, sepolia.RESILIENT_ORACLE);
    poolRegistry = await ethers.getContractAt(POOL_REGISTRY_ABI, sepolia.POOL_REGISTRY);
    vEIGENContract = await ethers.getContractAt(VTOKEN_ABI, vEIGEN);
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, CORE_COMPTROLLER);
    eigenContract = await ethers.getContractAt(ERC20_ABI, EIGEN, await ethers.getSigner(sepolia.NORMAL_TIMELOCK));
  });

  testForkedNetworkVipCommands("vip389", await vip389());

  describe("Post-VIP behavior", async () => {
    it("check price", async () => {
      expect(await resilientOracle.getPrice(EIGEN)).to.be.equal(PRICE);
      expect(await resilientOracle.getUnderlyingPrice(vEIGEN)).to.be.equal(
        PRICE
      );
    });

    it("should have 12 markets in core pool", async () => {
      const poolVTokens = await comptroller.getAllMarkets();
      expect(poolVTokens).to.have.lengthOf(12);
    });

    it("should add vEIGEN to the pool", async () => {
      const registeredVToken = await poolRegistry.getVTokenForAsset(comptroller.address, EIGEN);
      expect(registeredVToken).to.equal(vEIGEN);
    });

    it("check ownership", async () => {
      expect(await vEIGENContract.owner()).to.equal(sepolia.GUARDIAN);
    });

    it("check supply", async () => {
      const expectedSupply = parseUnits("0.00000005", 18);
      expect(await vEIGENContract.balanceOf(sepolia.VTREASURY)).to.equal(expectedSupply);
    });

    it("check borrow and supply caps", async () => {
      expect(await comptroller.borrowCaps(vEIGEN)).equals(BORROW_CAP);
      expect(await comptroller.supplyCaps(vEIGEN)).equals(SUPPLY_CAP);
    });

    it("should set vEIGEN collateral factor to 50% and Liquidation threshold to 60%", async () => {
      const market = await comptroller.markets(vEIGEN);
      expect(market.collateralFactorMantissa).to.equal(parseUnits("0.5", 18));
      expect(market.liquidationThresholdMantissa).to.equal(parseUnits("0.6", 18));
    });

    it("check protocol share reserve", async () => {
      expect(await vEIGENContract.protocolShareReserve()).equals(PROTOCOL_SHARE_RESERVE);
    });

    it("check reserve factor", async () => {
      expect(await vEIGENContract.reserveFactorMantissa()).equals(parseUnits("0.25", 18));
    });

    it("check protocol seize share", async () => {
      expect(await vEIGENContract.protocolSeizeShareMantissa()).equals(parseUnits("0.01", 18));
    });

    it("check vToken", async () => {
      checkVToken(vEIGEN, {
        name: "Venus EIGEN",
        symbol: "vEIGEN",
        decimals: 8,
        underlying: EIGEN,
        exchangeRate: parseUnits("10000000000", 18),
        comptroller: CORE_COMPTROLLER,
      });
    });

    it("check IR", async () => {
      const IR = await vEIGENContract.interestRateModel();
      checkInterestRate(
        IR,
        "vEIGENContract_Core",
        { base: "0.02", multiplier: "0.15", jump: "3", kink: "0.45" },
        BigNumber.from(2628000),
      );
    });

    // it("check Pool", async () => {
    //   await eigenContract.faucet(parseUnits("100", 18));
    //   await checkIsolatedPoolsComptrollers({
    //     [CORE_COMPTROLLER]: sepolia.NORMAL_TIMELOCK,
    //   });
    // });
  });
});