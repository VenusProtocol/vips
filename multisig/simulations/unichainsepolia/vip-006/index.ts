import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { initMainnetUser } from "src/utils";
import { forking, pretendExecutingVip } from "src/vip-framework";
import { checkXVSVault } from "src/vip-framework/checks/checkXVSVault";

import vip003 from "../../../proposals/unichainsepolia/vip-003";
import vip006, {
  COMPTROLLER_CORE,
  POOL_REGISTRY,
  PRIME,
  PRIME_LIQUIDITY_PROVIDER,
} from "../../../proposals/unichainsepolia/vip-006";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import PRIME_ABI from "./abi/Prime.json";
import PRIME_LIQUIDITY_PROVIDER_ABI from "./abi/PrimeLiquidityProvider.json";
import XVS_ABI from "./abi/XVS.json";
import XVS_VAULT_ABI from "./abi/XVSVault.json";

const { unichainsepolia } = NETWORK_ADDRESSES;
const XVS_BRIDGE = "0xCAF833318a6663bb23aa7f218e597c2F7970b4D2";
const XVS_STORE = "0xeE012BeFEa825a21b6346EF0f78249740ca2569b";

forking(12089140, async () => {
  describe("Post-VIP behavior", async () => {
    let prime: Contract;
    let primeLiquidityProvider: Contract;
    let xvs: Contract;
    let xvsVault: Contract;
    let comptrollerCore: Contract;
    const amount = parseUnits("1000", 18);

    before(async () => {
      await pretendExecutingVip(await vip003());
      await pretendExecutingVip(await vip006());

      comptrollerCore = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER_CORE);
      xvs = await ethers.getContractAt(XVS_ABI, unichainsepolia.XVS);
      xvsVault = await ethers.getContractAt(XVS_VAULT_ABI, unichainsepolia.XVS_VAULT_PROXY);
      prime = await ethers.getContractAt(PRIME_ABI, PRIME);
      primeLiquidityProvider = await ethers.getContractAt(PRIME_LIQUIDITY_PROVIDER_ABI, PRIME_LIQUIDITY_PROVIDER);
      const xvsBridge = await initMainnetUser(XVS_BRIDGE, ethers.utils.parseEther("1"));

      await xvs
        .connect(xvsBridge)
        .mint(unichainsepolia.GENERIC_TEST_USER_ACCOUNT, amount, { maxFeePerGas: "20000000000" });
    });

    it("prime should have correct pool registry address", async () => {
      expect(await prime.poolRegistry()).to.be.equal(POOL_REGISTRY);
    });

    it("should have correct owner", async () => {
      expect(await prime.owner()).to.be.equal(unichainsepolia.GUARDIAN);
      expect(await primeLiquidityProvider.owner()).to.be.equal(unichainsepolia.GUARDIAN);
    });

    it("Comptroller Core should have correct Prime token address", async () => {
      expect(await comptrollerCore.prime()).to.be.equal(PRIME);
    });

    it("stake XVS", async () => {
      const genericUser = await initMainnetUser(
        unichainsepolia.GENERIC_TEST_USER_ACCOUNT,
        ethers.utils.parseEther("2"),
      );
      let stakedAt = await prime.stakedAt(unichainsepolia.GENERIC_TEST_USER_ACCOUNT);
      expect(stakedAt).to.be.equal(0);
      await xvs.connect(genericUser).approve(unichainsepolia.XVS_VAULT_PROXY, amount, { maxFeePerGas: "20000000000" });
      await xvsVault.connect(genericUser).deposit(unichainsepolia.XVS, 0, amount, { maxFeePerGas: "20000000000" });
      await expect(prime.connect(genericUser).claim({ maxFeePerGas: "20000000000" })).to.be.reverted;
      stakedAt = await prime.stakedAt(unichainsepolia.GENERIC_TEST_USER_ACCOUNT);
      expect(stakedAt).to.be.gt(0);
    });

    describe("generic tests", async () => {
      before(async () => {
        const xvsMinter = await initMainnetUser(XVS_BRIDGE, ethers.utils.parseEther("1"));
        const xvsHolder = await initMainnetUser(
          unichainsepolia.GENERIC_TEST_USER_ACCOUNT,
          ethers.utils.parseEther("1"),
        );

        await xvs.connect(xvsMinter).mint(unichainsepolia.GENERIC_TEST_USER_ACCOUNT, ethers.utils.parseEther("10"), {
          maxFeePerGas: "20000000000",
        });
        await xvs.connect(xvsHolder).transfer(XVS_STORE, ethers.utils.parseEther("1"), { maxFeePerGas: "20000000000" });
      });

      checkXVSVault();
    });
  });
});
