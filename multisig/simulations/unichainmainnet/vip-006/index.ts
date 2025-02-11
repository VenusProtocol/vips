import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { initMainnetUser } from "src/utils";
import { forking, pretendExecutingVip } from "src/vip-framework";
import { checkXVSVault } from "src/vip-framework/checks/checkXVSVault";

import vip000 from "../../../proposals/unichainmainnet/vip-000";
import vip001 from "../../../proposals/unichainmainnet/vip-001";
import vip002 from "../../../proposals/unichainmainnet/vip-002";
import vip003 from "../../../proposals/unichainmainnet/vip-003";
import vip004 from "../../../proposals/unichainmainnet/vip-004";
import vip006, { COMPTROLLER_CORE, PRIME, PRIME_LIQUIDITY_PROVIDER } from "../../../proposals/unichainmainnet/vip-006";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import ERC20_ABI from "./abi/ERC20.json";
import PRIME_ABI from "./abi/Prime.json";
import PRIME_LIQUIDITY_PROVIDER_ABI from "./abi/PrimeLiquidityProvider.json";
import XVS_ABI from "./abi/XVS.json";
import XVS_VAULT_ABI from "./abi/XVSVault.json";

const { unichainmainnet } = NETWORK_ADDRESSES;
const XVS_BRIDGE = "0x9c95f8aa28fFEB7ECdC0c407B9F632419c5daAF8";
const XVS_STORE = "0xeE012BeFEa825a21b6346EF0f78249740ca2569b";

const WETH = "0x4200000000000000000000000000000000000006";
const USDC = "0x078D782b760474a361dDA0AF3839290b0EF57AD6";

forking(8452229, async () => {
  before(async () => {
    // Will be removed once treasury has funds
    const wethHolder = await initMainnetUser(
      "0x07aE8551Be970cB1cCa11Dd7a11F47Ae82e70E67",
      ethers.utils.parseEther("2"),
    );
    const usdcHolder = await initMainnetUser(
      "0x5752e57DcfA070e3822d69498185B706c293C792",
      ethers.utils.parseEther("2"),
    );
    const weth = await ethers.getContractAt(ERC20_ABI, WETH);
    const usdc = await ethers.getContractAt(ERC20_ABI, USDC);

    await weth.connect(wethHolder).transfer(unichainmainnet.VTREASURY, parseUnits("4", 18));
    await usdc.connect(usdcHolder).transfer(unichainmainnet.VTREASURY, parseUnits("5000", 6));
    await pretendExecutingVip(await vip000());
    await pretendExecutingVip(await vip001());
    await pretendExecutingVip(await vip002());
    await pretendExecutingVip(await vip003());
    await pretendExecutingVip(await vip004());
    await pretendExecutingVip(await vip006());
  });
  describe("Post-VIP behavior", async () => {
    let prime: Contract;
    let primeLiquidityProvider: Contract;
    let xvs: Contract;
    let xvsVault: Contract;
    let comptrollerCore: Contract;
    const amount = parseUnits("1000", 18);

    before(async () => {
      comptrollerCore = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER_CORE);
      xvs = await ethers.getContractAt(XVS_ABI, unichainmainnet.XVS);
      xvsVault = await ethers.getContractAt(XVS_VAULT_ABI, unichainmainnet.XVS_VAULT_PROXY);
      prime = await ethers.getContractAt(PRIME_ABI, PRIME);
      primeLiquidityProvider = await ethers.getContractAt(PRIME_LIQUIDITY_PROVIDER_ABI, PRIME_LIQUIDITY_PROVIDER);
      const xvsBridge = await initMainnetUser(XVS_BRIDGE, ethers.utils.parseEther("1"));

      await xvs
        .connect(xvsBridge)
        .mint(unichainmainnet.GENERIC_TEST_USER_ACCOUNT, amount, { maxFeePerGas: "20000000000" });
    });

    it("prime should have correct pool registry address", async () => {
      expect(await prime.poolRegistry()).to.be.equal(unichainmainnet.POOL_REGISTRY);
    });

    it("should have correct owner", async () => {
      expect(await prime.owner()).to.be.equal(unichainmainnet.GUARDIAN);
      expect(await primeLiquidityProvider.owner()).to.be.equal(unichainmainnet.GUARDIAN);
    });

    it("Comptroller Core should have correct Prime token address", async () => {
      expect(await comptrollerCore.prime()).to.be.equal(PRIME);
    });

    it("stake XVS", async () => {
      const genericUser = await initMainnetUser(
        unichainmainnet.GENERIC_TEST_USER_ACCOUNT,
        ethers.utils.parseEther("2"),
      );
      let stakedAt = await prime.stakedAt(unichainmainnet.GENERIC_TEST_USER_ACCOUNT);
      expect(stakedAt).to.be.equal(0);
      await xvs.connect(genericUser).approve(unichainmainnet.XVS_VAULT_PROXY, amount, { maxFeePerGas: "20000000000" });
      await xvsVault.connect(genericUser).deposit(unichainmainnet.XVS, 0, amount, { maxFeePerGas: "20000000000" });
      await expect(prime.connect(genericUser).claim({ maxFeePerGas: "20000000000" })).to.be.reverted;
      stakedAt = await prime.stakedAt(unichainmainnet.GENERIC_TEST_USER_ACCOUNT);
      expect(stakedAt).to.be.gt(0);
    });

    describe("generic tests", async () => {
      before(async () => {
        const xvsMinter = await initMainnetUser(XVS_BRIDGE, ethers.utils.parseEther("1"));
        const xvsHolder = await initMainnetUser(
          unichainmainnet.GENERIC_TEST_USER_ACCOUNT,
          ethers.utils.parseEther("1"),
        );

        await xvs.connect(xvsMinter).mint(unichainmainnet.GENERIC_TEST_USER_ACCOUNT, ethers.utils.parseEther("10"), {
          maxFeePerGas: "20000000000",
        });
        await xvs.connect(xvsHolder).transfer(XVS_STORE, ethers.utils.parseEther("1"), { maxFeePerGas: "20000000000" });
      });

      checkXVSVault();
    });
  });
});
