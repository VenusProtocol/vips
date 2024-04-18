import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip289, {
  BNBx,
  COMPTROLLER_ADDRESS,
  OLD_ankrBNB,
  ORIGINAL_POOL_REGISTRY_IMP,
  POOL_REGISTRY,
  PROXY_ADMIN,
  RESILIENT_ORACLE,
  SlisBNB,
  StkBNB,
  VTOKEN_BEACON,
  VTOKEN_IMP,
  WBETH,
  WBETHOracle,
  WBETH_TEMP_VTOKEN_IMPL,
  WBETH_VTOKEN_IMPL,
  ankrBNB,
  vWBETH,
} from "../../vips/vip-289/bsctestnet";
import POOL_REGISTRY_ABI from "./abi/poolRegistry.json";
import PROXY_ADMIN_ABI from "./abi/proxyAdmin.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";
import VTOKEN_ABI from "./abi/vToken.json";
import VTOKEN_BEACON_ABI from "./abi/vTokenBeacon.json";
import VTOKEN_PROXY_ABI from "./abi/vTokenProxy.json";

const vankrBNB = "0x57a664Dd7f1dE19545fEE9c86C949e3BF43d6D47";
const vBNBx = "0x644A149853E5507AdF3e682218b8AC86cdD62951";
const vstkBNB = "0x75aa42c832a8911B77219DbeBABBB40040d16987";
const vslisBNB = "0xeffE7874C345aE877c1D893cd5160DDD359b24dA";

forking(39571114, () => {
  let resilientOracle: Contract;
  let vankrBNBContract: Contract;
  let proxyAdmin: Contract;
  let vTokenBeaconContract: Contract;
  let poolRegistry: Contract;
  let wbethOracleContract: Contract;
  let vwbethProxy: Contract;
  let vwbethContract: Contract;

  before(async () => {
    resilientOracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);
    vankrBNBContract = new ethers.Contract(vankrBNB, VTOKEN_ABI, ethers.provider);
    proxyAdmin = new ethers.Contract(PROXY_ADMIN, PROXY_ADMIN_ABI, ethers.provider);
    vTokenBeaconContract = new ethers.Contract(VTOKEN_BEACON, VTOKEN_BEACON_ABI, ethers.provider);
    poolRegistry = new ethers.Contract(POOL_REGISTRY, POOL_REGISTRY_ABI, ethers.provider);
    wbethOracleContract = new ethers.Contract(WBETHOracle, RESILIENT_ORACLE_ABI, ethers.provider);
    vwbethProxy = new ethers.Contract(vWBETH, VTOKEN_PROXY_ABI, ethers.provider);
    vwbethContract = new ethers.Contract(vWBETH, VTOKEN_ABI, ethers.provider);
  });

  describe("Pre-VIP behavior", async () => {
    it("check BNBx price", async () => {
      const price = await resilientOracle.getPrice(BNBx);
      expect(price).to.be.equal(parseUnits("342.50005266", "18"));
    });

    it("check SlisBNB price", async () => {
      const price = await resilientOracle.getPrice(SlisBNB);
      expect(price).to.be.equal(parseUnits("217", "18"));
    });

    it("check StkBNB price", async () => {
      const price = await resilientOracle.getPrice(StkBNB);
      expect(price).to.be.equal(parseUnits("328.36", "18"));
    });

    it("check WBETH price", async () => {
      const price = await wbethOracleContract.getPrice(WBETH);
      expect(price).to.be.equal("0");
    });

    it("check ankrBNB price", async () => {
      await expect(resilientOracle.getPrice(ankrBNB)).to.be.reverted;
    });

    it("check ankrBNB underlying", async () => {
      const underlying = await vankrBNBContract.underlying();
      expect(underlying).to.be.equal(OLD_ankrBNB);
    });

    it("check vBETH implementation", async () => {
      expect(await vwbethProxy.implementation()).to.equal(WBETH_VTOKEN_IMPL);
    });
  });

  testVip("VIP-289", vip289(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [RESILIENT_ORACLE_ABI], ["TokenConfigAdded"], [4]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check BNBx price", async () => {
      const price = parseUnits("1008.126597189750850728", "18");
      expect(await resilientOracle.getPrice(BNBx)).to.be.equal(price);
      expect(await resilientOracle.getUnderlyingPrice(vBNBx)).to.be.equal(price);
    });

    it("check SlisBNB price", async () => {
      const price = parseUnits("2275.132231164184104561", "18");
      expect(await resilientOracle.getPrice(SlisBNB)).to.be.equal(price);
      expect(await resilientOracle.getUnderlyingPrice(vslisBNB)).to.be.equal(price);
    });

    it("check StkBNB price", async () => {
      const price = parseUnits("548.223783083719481705", "18");
      expect(await resilientOracle.getPrice(StkBNB)).to.be.equal(price);
      expect(await resilientOracle.getUnderlyingPrice(vstkBNB)).to.be.equal(price);
    });

    it("check WBETH price", async () => {
      const price = await wbethOracleContract.getPrice(WBETH);
      expect(price).to.be.equal(parseUnits("3085.544819622113507025", "18"));
    });

    it("check ankrBNB price", async () => {
      const price = parseUnits("586.377196263511013044", "18");
      expect(await resilientOracle.getPrice(ankrBNB)).to.be.equal(price);
      expect(await resilientOracle.getUnderlyingPrice(vankrBNB)).to.be.equal(price);
    });

    it("check vankrBNB underlying", async () => {
      const underlying = await vankrBNBContract.underlying();
      expect(underlying).to.be.equal(ankrBNB);
    });

    it("pool registry should have original implementation", async () => {
      expect(await proxyAdmin.getProxyImplementation(POOL_REGISTRY)).to.equal(ORIGINAL_POOL_REGISTRY_IMP);
    });

    it("vTokenBeacon should have original implementation", async () => {
      expect(await vTokenBeaconContract.implementation()).to.equal(VTOKEN_IMP);
    });

    it("getVTokenForAsset should return vankrBNB address for ankrBNB and zero_address for old ankrBNB ", async () => {
      expect(await poolRegistry.getVTokenForAsset(COMPTROLLER_ADDRESS, ankrBNB)).to.be.equal(vankrBNB);
      expect(await poolRegistry.getVTokenForAsset(COMPTROLLER_ADDRESS, OLD_ankrBNB)).to.be.equal(
        ethers.constants.AddressZero,
      );
    });

    it("check vWBETH implementation", async () => {
      expect(await vwbethProxy.implementation()).to.equal(WBETH_VTOKEN_IMPL);
    });

    it("check vwbeth underlying", async () => {
      const underlying = await vwbethContract.underlying();
      expect(underlying).to.be.equal(WBETH);
    });
  });
});
