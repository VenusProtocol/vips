import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract, Signer } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers, network } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";
import { checkXVSVault } from "src/vip-framework/checks/checkXVSVault";

import vip000 from "../../../proposals/basemainnet/vip-000";
import vip001 from "../../../proposals/basemainnet/vip-001";
import vip002 from "../../../proposals/basemainnet/vip-002";
import vip003 from "../../../proposals/basemainnet/vip-003";
import vip004, { USDC, WETH, cbBTC } from "../../../proposals/basemainnet/vip-004";
import { vip005 } from "../../../proposals/basemainnet/vip-005";
import COMPTROLLER_ABI from "./abis/Comptroller.json";
import ERC20_ABI from "./abis/ERC20.json";
import PRIME_ABI from "./abis/Prime.json";
import PRIME_LIQUIDITY_PROVIDER_ABI from "./abis/PrimeLiquidityProvider.json";
import TOKEN_ABI from "./abis/WETH.json";
import XVS_ABI from "./abis/XVS.json";
import XVS_VAULT_ABI from "./abis/XVSVault.json";

const XVS_VAULT_PROXY = "0x708B54F2C3f3606ea48a8d94dab88D9Ab22D7fCd";
const PRIME_LIQUIDITY_PROVIDER = "0xcB293EB385dEFF2CdeDa4E7060974BB90ee0B208";
const PRIME = "0xD2e84244f1e9Fca03Ff024af35b8f9612D5d7a30";
const XVS = "0xebB7873213c8d1d9913D8eA39Aa12d74cB107995";
const GUARDIAN = "0x1803Cf1D3495b43cC628aa1d8638A981F8CD341C";
const GENERIC_TEST_USER_ACCOUNT = "0x2DDd1c54B7d32C773484D23ad8CB4F0251d330Fc";
const XVS_ADMIN = "0x3dD92fB51a5d381Ae78E023dfB5DD1D45D2426Cd";
const COMPTROLLER_CORE = "0x0C7973F9598AA62f9e03B94E92C967fD5437426C";

const basemainnet = NETWORK_ADDRESSES.basemainnet;

forking(23475595, async () => {
  describe("Pre-VIP behavior", () => {
    let prime: Contract;
    let primeLiquidityProvider: Contract;
    let xvsVault: Contract;
    let xvs: Contract;

    before(async () => {
      await pretendExecutingVip(await vip000());
      await pretendExecutingVip(await vip001());
      await pretendExecutingVip(await vip002());
      await pretendExecutingVip(await vip003());

      const WETH_ACCOUNT = "0x6446021F4E396dA3df4235C62537431372195D38";
      const USDC_ACCOUNT = "0x0B0A5886664376F59C351ba3f598C8A8B4D0A6f3";
      const cbBTC_ACCOUNT = "0xF877ACaFA28c19b96727966690b2f44d35aD5976";

      await impersonateAccount(WETH_ACCOUNT);
      await impersonateAccount(USDC_ACCOUNT);
      await impersonateAccount(cbBTC_ACCOUNT);
      await setBalance(WETH_ACCOUNT, ethers.utils.parseEther("1"));
      await setBalance(USDC_ACCOUNT, ethers.utils.parseEther("1"));
      await setBalance(cbBTC_ACCOUNT, ethers.utils.parseEther("1"));

      const WETHSigner: Signer = await ethers.getSigner(WETH_ACCOUNT);
      const USDCSigner: Signer = await ethers.getSigner(USDC_ACCOUNT);
      const cbBTCSigner: Signer = await ethers.getSigner(cbBTC_ACCOUNT);
      const wethToken = await ethers.getContractAt(TOKEN_ABI, WETH, WETHSigner);
      const usdcToken = await ethers.getContractAt(TOKEN_ABI, USDC, USDCSigner);
      const cbBTCToken = await ethers.getContractAt(TOKEN_ABI, cbBTC, cbBTCSigner);

      await wethToken.connect(WETHSigner).transfer(basemainnet.VTREASURY, parseUnits("2", 18));
      await usdcToken.connect(USDCSigner).transfer(basemainnet.VTREASURY, parseUnits("5000", 6));
      await cbBTCToken.connect(cbBTCSigner).transfer(basemainnet.VTREASURY, parseUnits("0.05", 8));

      await pretendExecutingVip(await vip004());

      await impersonateAccount(GUARDIAN);
      await impersonateAccount(XVS_ADMIN);
      await impersonateAccount(GENERIC_TEST_USER_ACCOUNT);

      prime = await ethers.getContractAt(PRIME_ABI, PRIME);
      primeLiquidityProvider = await ethers.getContractAt(PRIME_LIQUIDITY_PROVIDER_ABI, PRIME_LIQUIDITY_PROVIDER);
      xvsVault = await ethers.getContractAt(XVS_VAULT_ABI, XVS_VAULT_PROXY, await ethers.getSigner(GUARDIAN));
      xvs = await ethers.getContractAt(XVS_ABI, XVS, await ethers.getSigner(XVS_ADMIN));

      const accounts = await ethers.getSigners();
      await accounts[0].sendTransaction({ to: GENERIC_TEST_USER_ACCOUNT, value: parseUnits("1") });
      await accounts[0].sendTransaction({ to: GUARDIAN, value: parseUnits("1") });

      await network.provider.send("hardhat_setCode", [XVS_ADMIN, "0x"]);

      await accounts[0].sendTransaction({ to: XVS_ADMIN, value: parseUnits("4") });
      await xvs.mint(GENERIC_TEST_USER_ACCOUNT, parseUnits("1000", 18));
      await xvs.mint(basemainnet.GENERIC_TEST_USER_ACCOUNT, parseUnits("1000", 18));
    });

    it("prime markets", async () => {
      expect((await prime.getAllMarkets()).length).to.equal(0);
    });

    it("prime address", async () => {
      expect(await primeLiquidityProvider.prime()).to.equal("0x0000000000000000000000000000000000000000");
    });

    it("claim prime token", async () => {
      await expect(prime.claim()).to.be.reverted;
    });

    it("is paused", async () => {
      expect(await prime.paused()).to.be.equal(true);
    });

    it("xvs vault is paused", async () => {
      expect(await xvsVault.vaultPaused()).to.be.equal(true);
    });
  });

  describe("Post-VIP behavior", async () => {
    let prime: Contract;
    let primeLiquidityProvider: Contract;
    let xvsVault: Contract;
    let xvs: Contract;

    before(async () => {
      await pretendExecutingVip(await vip005());

      prime = await ethers.getContractAt(PRIME_ABI, PRIME);
      primeLiquidityProvider = await ethers.getContractAt(PRIME_LIQUIDITY_PROVIDER_ABI, PRIME_LIQUIDITY_PROVIDER);
      xvsVault = await ethers.getContractAt(
        XVS_VAULT_ABI,
        XVS_VAULT_PROXY,
        await ethers.getSigner(GENERIC_TEST_USER_ACCOUNT),
      );
      xvs = await ethers.getContractAt(ERC20_ABI, XVS, await ethers.getSigner(GENERIC_TEST_USER_ACCOUNT));
    });

    it("prime address", async () => {
      expect(await primeLiquidityProvider.prime()).to.equal(PRIME);
    });

    it("is paused", async () => {
      expect(await prime.paused()).to.be.equal(true);
      expect(await primeLiquidityProvider.paused()).to.be.equal(true);
    });

    it("stake XVS", async () => {
      let stakedAt = await prime.stakedAt(GENERIC_TEST_USER_ACCOUNT);
      expect(stakedAt).to.be.equal(0);

      await xvs.approve(xvsVault.address, parseUnits("1000", 18));
      await xvsVault.deposit(XVS, 0, parseUnits("1000", 18));
      await expect(prime.claim()).to.be.be.reverted;

      stakedAt = await prime.stakedAt(GENERIC_TEST_USER_ACCOUNT);
      expect(stakedAt).to.be.gt(0);
    });

    it("xvs vault is resumed", async () => {
      expect(await xvsVault.vaultPaused()).to.be.equal(false);
    });

    it("prime in comptroller", async () => {
      const comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER_CORE);
      expect(await comptroller.prime()).to.be.equal(PRIME);
    });

    describe("generic tests", async () => {
      checkXVSVault();
    });
  });
});
