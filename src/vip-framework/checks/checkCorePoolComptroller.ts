import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import mainnetGovernance from "@venusprotocol/governance-contracts/deployments/bscmainnet_addresses.json";
import testnetGovernance from "@venusprotocol/governance-contracts/deployments/bsctestnet_addresses.json";
import mainnet from "@venusprotocol/venus-protocol/deployments/bscmainnet_addresses.json";
import testnet from "@venusprotocol/venus-protocol/deployments/bsctestnet_addresses.json";
import { expect } from "chai";
import { Contract, Signer } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { FORKED_NETWORK, ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../networkAddresses";
import { setMaxStalePeriodInChainlinkOracle } from "../../utils";
import COMPTROLLER_ABI from "../abi/comptroller.json";
import ERC20_ABI from "../abi/erc20.json";
import VTOKEN_ABI from "../abi/vToken.json";

let vETH_ADDRESS = mainnet.addresses.vETH;
let vUSDT_ADDRESS = mainnet.addresses.vUSDT;
let USDT = mainnet.addresses.USDT;
let ETH = mainnet.addresses.ETH;
let NORMAL_TIMELOCK = mainnetGovernance.addresses.NormalTimelock;
let XVS = mainnet.addresses.XVS;
let COMPTROLLER = mainnet.addresses.Unitroller;
let LENS = mainnet.addresses.ComptrollerLens;
let ETH_FEED = NETWORK_ADDRESSES.bscmainnet.ETH_CHAINLINK_FEED;
let USDT_FEED = NETWORK_ADDRESSES.bscmainnet.USDT_CHAINLINK_FEED;
let ACCOUNT = NETWORK_ADDRESSES.bscmainnet.GENERIC_TEST_USER_ACCOUNT;
let CHAINLINK_ORACLE = NETWORK_ADDRESSES.bscmainnet.CHAINLINK_ORACLE;

if (FORKED_NETWORK === "bsctestnet") {
  vETH_ADDRESS = testnet.addresses.vETH;
  vUSDT_ADDRESS = testnet.addresses.vUSDT;
  USDT = testnet.addresses.USDT;
  ETH = testnet.addresses.ETH;
  NORMAL_TIMELOCK = testnetGovernance.addresses.NormalTimelock;
  XVS = testnet.addresses.XVS;
  COMPTROLLER = testnet.addresses.Unitroller;
  ETH_FEED = NETWORK_ADDRESSES.bsctestnet.ETH_CHAINLINK_FEED;
  USDT_FEED = NETWORK_ADDRESSES.bsctestnet.USDT_CHAINLINK_FEED;
  ACCOUNT = NETWORK_ADDRESSES.bsctestnet.GENERIC_TEST_USER_ACCOUNT;
  CHAINLINK_ORACLE = NETWORK_ADDRESSES.bsctestnet.CHAINLINK_ORACLE;

  LENS = NETWORK_ADDRESSES[FORKED_NETWORK].COMPTROLLER_LENS;
}

interface CheckCorePoolComptrollerOptions {
  account?: string;
  lens?: string;
}

export const checkCorePoolComptroller = (options: CheckCorePoolComptrollerOptions = {}) => {
  const ACCOUNT_ = options.account || ACCOUNT;
  const EXPECTED_LENS = options.lens || LENS;

  describe("generic comptroller checks", () => {
    let comptroller: Contract;
    let usdt: Contract;
    let eth: Contract;
    let veth: Contract;
    let vusdt: Contract;
    let timelockSigner: Signer;
    let xvs: Contract;

    before(async () => {
      await impersonateAccount(ACCOUNT_);
      await impersonateAccount(NORMAL_TIMELOCK);
      await setBalance(ACCOUNT_, parseUnits("1", 18));
      const signer = await ethers.getSigner(ACCOUNT_);
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
      const originalVETHBalance = await veth.balanceOf(ACCOUNT_);

      await eth.approve(veth.address, parseUnits("1", 18));
      await veth.mint(parseUnits("1", 18));

      expect(await veth.balanceOf(ACCOUNT_)).to.be.gt(originalVETHBalance);

      await comptroller.enterMarkets([vusdt.address, veth.address]);

      let usdtBalance = await usdt.balanceOf(ACCOUNT_);
      const usdtDecimals = await usdt.decimals();
      await vusdt.borrow(parseUnits("100", usdtDecimals));
      expect(await usdt.balanceOf(ACCOUNT_)).to.gt(usdtBalance);

      const originalXVSBalance = await xvs.balanceOf(ACCOUNT_);
      await expect(
        comptroller["claimVenus(address[],address[],bool,bool,bool)"]([ACCOUNT_], [vusdt.address], true, true, true),
      ).to.be.not.reverted;
      expect(await xvs.balanceOf(ACCOUNT_)).to.be.greaterThanOrEqual(originalXVSBalance);

      usdtBalance = await usdt.balanceOf(ACCOUNT_);
      await usdt.approve(vusdt.address, parseUnits("100", usdtDecimals));
      await vusdt.repayBorrow(parseUnits("100", usdtDecimals));
      expect(await usdt.balanceOf(ACCOUNT_)).to.lt(usdtBalance);

      const ethBalance = await eth.balanceOf(ACCOUNT_);
      await veth.redeemUnderlying(parseUnits("0.1", 18));
      expect(await eth.balanceOf(ACCOUNT_)).to.gt(ethBalance);
    });

    it(`read storage`, async () => {
      expect(await comptroller.comptrollerLens()).to.be.equal(EXPECTED_LENS);
    });

    it(`set storage`, async () => {
      const originalOracle = await comptroller.oracle();

      await comptroller.connect(timelockSigner)._setPriceOracle("0x50F618A2EAb0fB55e87682BbFd89e38acb2735cD");
      expect(await comptroller.oracle()).to.be.equal("0x50F618A2EAb0fB55e87682BbFd89e38acb2735cD");
      await comptroller.connect(timelockSigner)._setPriceOracle(originalOracle);
    });
  });
};
