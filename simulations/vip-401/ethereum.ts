import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { setMaxStalePeriod } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip401, { XVS_ETHEREUM, XVS_VAULT_CONVERTER, eBTC } from "../../vips/vip-401/bscmainnet";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import XVS_VAULT_CONVERTER_ABI from "./abi/XVSVaultConverter.json";
import ERC20_ABI from "./abi/erc20.json";

const { ethereum } = NETWORK_ADDRESSES;
const XVS_USER = "0xA0882C2D5DF29233A092d2887A258C2b90e9b994";
const eBTC_USER = "0x7aCDF2012aAC69D70B86677FE91eb66e08961880";
const WBTC = "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599";
const ONE_YEAR = 365 * 24 * 3600;

forking(21309023, async () => {
  let resilientOracle: Contract;
  let eBTCContract: Contract;
  let xvsVaultConverter: Contract;
  let xvsContract: Contract;
  let wbtcContract: Contract;

  before(async () => {
    await impersonateAccount(ethereum.NORMAL_TIMELOCK);
    await setBalance(ethereum.NORMAL_TIMELOCK, parseUnits("1000", 18));
    await impersonateAccount(XVS_USER);
    await setBalance(XVS_USER, parseUnits("1000", 18));
    await impersonateAccount(eBTC_USER);
    await setBalance(eBTC_USER, parseUnits("1000", 18));
    await impersonateAccount(XVS_VAULT_CONVERTER);
    await setBalance(XVS_VAULT_CONVERTER, parseUnits("1000", 18));

    resilientOracle = await ethers.getContractAt(RESILIENT_ORACLE_ABI, ethereum.RESILIENT_ORACLE);
    eBTCContract = await ethers.getContractAt(ERC20_ABI, eBTC);
    xvsVaultConverter = await ethers.getContractAt(XVS_VAULT_CONVERTER_ABI, XVS_VAULT_CONVERTER);
    xvsContract = await ethers.getContractAt(ERC20_ABI, XVS_ETHEREUM);
    wbtcContract = await ethers.getContractAt(ERC20_ABI, WBTC);

    await setMaxStalePeriod(resilientOracle, wbtcContract, ONE_YEAR);
    await setMaxStalePeriod(resilientOracle, xvsContract, ONE_YEAR);
  });

  testForkedNetworkVipCommands("vip401", await vip401());

  describe("Post-VIP behavior", async () => {
    it("eBTC conversion", async () => {
      const xvsAmount = parseUnits("1000", 18);
      await xvsContract.connect(await ethers.getSigner(XVS_USER)).approve(xvsVaultConverter.address, xvsAmount);

      const eBTCAmount = parseUnits("0.1", 8);
      await eBTCContract.connect(await ethers.getSigner(eBTC_USER)).transfer(xvsVaultConverter.address, eBTCAmount);

      const xvsBalanceBefore = await xvsContract.balanceOf(XVS_USER);
      const eBTCBalanceBefore = await eBTCContract.balanceOf(XVS_USER);

      await xvsVaultConverter
        .connect(await ethers.getSigner(XVS_USER))
        .convertForExactTokens(xvsAmount, eBTCAmount, xvsContract.address, eBTCContract.address, XVS_USER);

      const xvsBalanceAfter = await xvsContract.balanceOf(XVS_USER);
      const eBTCBalanceAfter = await eBTCContract.balanceOf(XVS_USER);

      expect(xvsBalanceBefore.sub(xvsBalanceAfter)).to.be.equal(parseUnits("973.092256253055001652", 18));
      expect(eBTCBalanceAfter.sub(eBTCBalanceBefore)).to.be.equal(eBTCAmount);
    });
  });
});
