import { expect } from "chai";
import { Contract, Signer } from "ethers";
import { ethers } from "hardhat";

import COMPTROLLER_ABI from "../abi/comptroller.json";
import { setMaxStalePeriodInBinanceOracle, setMaxStalePeriodInChainlinkOracle } from "../../utils";
import { impersonateAccount, mine } from "@nomicfoundation/hardhat-network-helpers";
import ERC20_ABI from "../abi/erc20.json";
import VTOKEN_ABI from "../abi/vToken.json";
import { parseUnits } from "ethers/lib/utils";

const vETH_ADDRESS = "0xf508fcd89b8bd15579dc79a6827cb4686a3592c8"
const vUSDT_ADDRESS = "0xfd5840cd36d94d7229439859c0112a4185bc0255"
const ACCOUNT = "0x5a52E96BAcdaBb82fd05763E25335261B270Efcb";
const CHAINLINK_ORACLE = "0x1B2103441A0A108daD8848D8F5d790e4D402921F";
const USDT = "0x55d398326f99059fF775485246999027B3197955";
const USDT_FEED = "0xB97Ad0E74fa7d920791E90258A6E2085088b4320";
const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const ETH_FEED = "0x9ef1B8c0E4F7dc8bF5719Ea496883DC6401d5b2e";
const XVS = "0x151B1e2635A717bcDc836ECd6FbB62B674FE3E1D";
const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";

export const checkComptroller = () => {
  describe("generic comptroller checks", () => {
    let comptroller: Contract;
    let usdt: Contract;
    let eth: Contract;
    let veth: Contract;
    let vusdt: Contract;
    let timelockSigner: Signer;
    let xvs : Contract;

    before(async () => {
      impersonateAccount(ACCOUNT);
      impersonateAccount(NORMAL_TIMELOCK);
      const signer = await ethers.getSigner(ACCOUNT);
      timelockSigner = await ethers.getSigner(NORMAL_TIMELOCK);

      comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER, signer);
      usdt = await ethers.getContractAt(ERC20_ABI, USDT, signer);
      eth = await ethers.getContractAt(ERC20_ABI, ETH, signer);
      veth = await ethers.getContractAt(VTOKEN_ABI, vETH_ADDRESS, signer);
      vusdt = await ethers.getContractAt(VTOKEN_ABI, vUSDT_ADDRESS, signer);
      xvs = await ethers.getContractAt(ERC20_ABI, XVS, signer);


      await setMaxStalePeriodInChainlinkOracle(CHAINLINK_ORACLE, USDT, USDT_FEED, NORMAL_TIMELOCK);
      await setMaxStalePeriodInChainlinkOracle(CHAINLINK_ORACLE, ETH, ETH_FEED, NORMAL_TIMELOCK);
    });

    it(`check if comptroller`, async () => {
      expect(await comptroller.isComptroller()).to.equal(true);
    });

    it(`operations`, async () => {
      expect(await veth.balanceOf(ACCOUNT)).to.equal(0);

      await eth.approve(veth.address, parseUnits("1", 18));
      await veth.mint(parseUnits("1", 18));

      expect(await veth.balanceOf(ACCOUNT)).to.be.gt(0);

      await comptroller.enterMarkets([vusdt.address, veth.address]);

      expect(await vusdt.balanceOf(ACCOUNT)).to.equal(0);
      let usdtBalance = await usdt.balanceOf(ACCOUNT);
      await vusdt.borrow(parseUnits("100", 18));
      expect(await usdt.balanceOf(ACCOUNT)).to.equal(usdtBalance.add(parseUnits("100", 18)));

      expect (await comptroller["claimVenus(address)"](ACCOUNT)).to.be.not.reverted

      usdtBalance = await usdt.balanceOf(ACCOUNT);
      await usdt.approve(vusdt.address, parseUnits("100", 18));
      await vusdt.repayBorrow(parseUnits("100", 18));
      expect(await usdt.balanceOf(ACCOUNT)).to.equal(usdtBalance.sub(parseUnits("100", 18)));

      let ethBalance = await eth.balanceOf(ACCOUNT);
      await veth.redeemUnderlying(parseUnits("0.1", 18));
      expect(await eth.balanceOf(ACCOUNT)).to.equal(ethBalance.add(parseUnits("0.1", 18)));
    });

    it(`read storage`, async () => {
      expect (await comptroller.comptrollerLens()).to.be.equal("0x50F618A2EAb0fB55e87682BbFd89e38acb2735cD")
    })

    it(`set storage`, async () => {
      const originalOracle = await comptroller.oracle();

      await comptroller.connect(timelockSigner)._setPriceOracle("0x50F618A2EAb0fB55e87682BbFd89e38acb2735cD")
      expect(await comptroller.oracle()).to.be.equal("0x50F618A2EAb0fB55e87682BbFd89e38acb2735cD")
      await comptroller.connect(timelockSigner)._setPriceOracle(originalOracle)
    })
  });
};