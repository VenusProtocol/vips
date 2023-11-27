import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import mainnet from "@venusprotocol/venus-protocol/networks/mainnet.json";
import testnet from "@venusprotocol/venus-protocol/networks/testnet.json";
import { expect } from "chai";
import { Contract, Signer } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../networkAddresses";
import { setMaxStalePeriodInChainlinkOracle } from "../../utils";
import COMPTROLLER_ABI from "../abi/comptroller.json";
import ERC20_ABI from "../abi/erc20.json";
import VTOKEN_ABI from "../abi/vToken.json";

let vETH_ADDRESS = mainnet.Contracts.vETH;
let vUSDT_ADDRESS = mainnet.Contracts.vUSDT;
let USDT = mainnet.Contracts.USDT;
let ETH = mainnet.Contracts.ETH;
let NORMAL_TIMELOCK = mainnet.Contracts.Timelock;
let XVS = mainnet.Contracts.XVS;
let COMPTROLLER = mainnet.Contracts.Unitroller;
let LENS = mainnet.Contracts.ComptrollerLens;
const ETH_FEED = NETWORK_ADDRESSES[process.env.FORKED_NETWORK].ETH_CHAINLINK_FEED;
const USDT_FEED = NETWORK_ADDRESSES[process.env.FORKED_NETWORK].USDT_CHAINLINK_FEED;
const ACCOUNT = NETWORK_ADDRESSES[process.env.FORKED_NETWORK].GENERIC_TEST_USER_ACCOUNT;
const CHAINLINK_ORACLE = NETWORK_ADDRESSES[process.env.FORKED_NETWORK].CHAINLINK_ORACLE;

if (process.env.FORKED_NETWORK === "bsctestnet") {
  vETH_ADDRESS = testnet.Contracts.vETH;
  vUSDT_ADDRESS = testnet.Contracts.vUSDT;
  USDT = testnet.Contracts.USDT;
  ETH = testnet.Contracts.ETH;
  NORMAL_TIMELOCK = testnet.Contracts.Timelock;
  XVS = testnet.Contracts.XVS;
  COMPTROLLER = testnet.Contracts.Unitroller;

  LENS = NETWORK_ADDRESSES[process.env.FORKED_NETWORK].COMPTROLLER_LENS;
}

export const checkCorePoolComptroller = () => {
  describe("generic comptroller checks", () => {
    let comptroller: Contract;
    let usdt: Contract;
    let eth: Contract;
    let veth: Contract;
    let vusdt: Contract;
    let timelockSigner: Signer;
    let xvs: Contract;

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
      const originalVETHBalance = await veth.balanceOf(ACCOUNT);

      await eth.approve(veth.address, parseUnits("1", 18));
      await veth.mint(parseUnits("1", 18));

      expect(await veth.balanceOf(ACCOUNT)).to.be.gt(originalVETHBalance);

      await comptroller.enterMarkets([vusdt.address, veth.address]);

      const vusdtBalance = await vusdt.balanceOf(ACCOUNT);
      let usdtBalance = await usdt.balanceOf(ACCOUNT);
      const usdtDecimals = await usdt.decimals();
      await vusdt.borrow(parseUnits("100", usdtDecimals));
      expect(await usdt.balanceOf(ACCOUNT)).to.gt(vusdtBalance);

      const originalXVSBalance = await xvs.balanceOf(ACCOUNT);
      expect(await comptroller["claimVenus(address)"](ACCOUNT)).to.be.not.reverted;
      expect(await xvs.balanceOf(ACCOUNT)).to.be.gt(originalXVSBalance);

      usdtBalance = await usdt.balanceOf(ACCOUNT);
      await usdt.approve(vusdt.address, parseUnits("100", usdtDecimals));
      await vusdt.repayBorrow(parseUnits("100", usdtDecimals));
      expect(await usdt.balanceOf(ACCOUNT)).to.lt(usdtBalance);

      const ethBalance = await eth.balanceOf(ACCOUNT);
      await veth.redeemUnderlying(parseUnits("0.1", 18));
      expect(await eth.balanceOf(ACCOUNT)).to.gt(ethBalance);
    });

    it(`read storage`, async () => {
      expect(await comptroller.comptrollerLens()).to.be.equal(LENS);
    });

    it(`set storage`, async () => {
      const originalOracle = await comptroller.oracle();

      await comptroller.connect(timelockSigner)._setPriceOracle("0x50F618A2EAb0fB55e87682BbFd89e38acb2735cD");
      expect(await comptroller.oracle()).to.be.equal("0x50F618A2EAb0fB55e87682BbFd89e38acb2735cD");
      await comptroller.connect(timelockSigner)._setPriceOracle(originalOracle);
    });
  });
};
