import { expect } from "chai";
import { ethers } from "hardhat";

import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import { vip008 } from "../../../proposals/vip-008/vip-008-addendum-sepolia";
import ERC20_ABI from "./abis/ERC20.json";

const PLP = "0x4fCbfE445396f31005b3Fd2F6DE2A986d6E2dCB5";

const ETH = "0x700868CAbb60e90d77B6588ce072d9859ec8E281";
const BTC = "0x92A2928f5634BEa89A195e7BeCF0f0FEEDAB885b";
const USDC = "0x772d68929655ce7234C8C94256526ddA66Ef641E";
const USDT = "0x8d412FD0bc5d826615065B931171Eed10F5AF266";

const VTREASURY = "0x4116CA92960dF77756aAAc3aFd91361dB657fbF8";

const ETH_AMOUNT = "800000000000000000";
const BTC_AMOUNT = "2180000";
const USDC_AMOUNT = "10000000102";
const USDT_AMOUNT = "10000000000";

forking(5096265, () => {
  let btc: ethers.Contract;
  let eth: ethers.Contract;
  let usdc: ethers.Contract;
  let usdt: ethers.Contract;
  let oldBTCBal: BigNumber;
  let oldETHBal: BigNumber;
  let oldUSDCBal: BigNumber;
  let oldUSDTBal: BigNumber;
  let oldBTCBalTreasury: BigNumber;
  let oldETHBalTreasury: BigNumber;
  let oldUSDCBalTreasury: BigNumber;
  let oldUSDTBalTreasury: BigNumber;

  before(async () => {
    btc = new ethers.Contract(BTC, ERC20_ABI, ethers.provider);
    oldBTCBal = await btc.balanceOf(PLP);
    oldBTCBalTreasury = await btc.balanceOf(VTREASURY);

    eth = new ethers.Contract(ETH, ERC20_ABI, ethers.provider);
    oldETHBal = await eth.balanceOf(PLP);
    oldETHBalTreasury = await eth.balanceOf(VTREASURY);

    usdc = new ethers.Contract(USDC, ERC20_ABI, ethers.provider);
    oldUSDCBal = await usdc.balanceOf(PLP);
    oldUSDCBalTreasury = await usdc.balanceOf(VTREASURY);

    usdt = new ethers.Contract(USDT, ERC20_ABI, ethers.provider);
    oldUSDTBal = await usdt.balanceOf(PLP);
    oldUSDTBalTreasury = await usdt.balanceOf(VTREASURY);
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(vip008());
    });

    it("Should transfer ETH", async () => {
      const currETHBal = await eth.balanceOf(PLP);
      expect(currETHBal.sub(oldETHBal)).equals(ETH_AMOUNT);
      const currETHBalTreasury = await eth.balanceOf(VTREASURY);
      expect(currETHBalTreasury.add(ETH_AMOUNT)).equals(oldETHBalTreasury);
    });

    it("Should transfer BTC", async () => {
      const currBTCBal = await btc.balanceOf(PLP);
      expect(currBTCBal.sub(oldBTCBal)).equals(BTC_AMOUNT);
      const currBTCBalTreasury = await btc.balanceOf(VTREASURY);
      expect(currBTCBalTreasury.add(BTC_AMOUNT)).equals(oldBTCBalTreasury);
    });

    it("Should transfer USDC", async () => {
      const currUSDCBal = await usdc.balanceOf(PLP);
      expect(currUSDCBal.sub(oldUSDCBal)).equals(USDC_AMOUNT);
      const currUSDCBalTreasury = await usdc.balanceOf(VTREASURY);
      expect(currUSDCBalTreasury.add(USDC_AMOUNT)).equals(oldUSDCBalTreasury);
    });

    it("Should transfer USDT", async () => {
      const currUSDTBal = await usdt.balanceOf(PLP);
      expect(currUSDTBal.sub(oldUSDTBal)).equals(USDT_AMOUNT);
      const currUSDTBalTreasury = await usdt.balanceOf(VTREASURY);
      expect(currUSDTBalTreasury.add(USDT_AMOUNT)).equals(oldUSDTBalTreasury);
    });
  });
});
