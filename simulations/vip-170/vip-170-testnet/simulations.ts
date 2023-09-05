import { mine } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents, initMainnetUser } from "../../../src/utils";
import { forking, pretendExecutingVip, testVip } from "../../../src/vip-framework";
import { IL_ASSETS, vip170Testnet } from "../../../vips/vip-170/vip-170-testnet";
import BEACON_ABI from "./abi/BEACON_ABI.json";
import COMPTROLLER_ABI from "./abi/COMPTROLLER.json";
import MOCK_TOKEN_ABI from "./abi/MOCK_TOKEN_ABI.json";
import VTOKEN_ABI from "./abi/VTOKEN_ABI.json";

const VTOKEN_BEACON = "0xBF85A90673E61956f8c79b9150BAB7893b791bDd";
const NEW_IMPL_VTOKEN = "0x37130dd8181477Be3dDe8b22A32FE302ca602BA7";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";

interface storageLayout {
  name: string;
  symbol: string;
  decimals: number;
  owner: string;
  comptroller: string;
  interestRateModel: string;
  reserveFactorMantissa: BigNumber;
  accrualBlockNumber: BigNumber;
  borrowIndex: BigNumber;
  totalBorrows: BigNumber;
  totalSupply: BigNumber;
  underlying: string;
  accountBalance: BigNumber;
  borrowBalance: BigNumber;
  borrowRatePerBlock: BigNumber;
  pendingOwner: string;
  protocolShareReserve: string;
  shortfall: string;
  supplyRatePerBlock: BigNumber;
}
async function fetchStorage(vToken: ethers.Contract, user: string) {
  const name = await vToken.name();
  const symbol = await vToken.symbol();
  const decimals = await vToken.decimals();
  const owner = await vToken.owner();
  const comptroller = await vToken.comptroller();
  const interestRateModel = await vToken.interestRateModel();
  const reserveFactorMantissa = await vToken.reserveFactorMantissa();
  const accrualBlockNumber = await vToken.accrualBlockNumber();
  const borrowIndex = await vToken.borrowIndex();
  const totalBorrows = await vToken.totalBorrows();
  const totalSupply = await vToken.totalSupply();
  const underlying = await vToken.underlying();
  const accountBalance = await vToken.callStatic.balanceOf(user);
  const borrowBalance = await vToken.callStatic.borrowBalanceStored(user);
  const borrowRatePerBlock = await vToken.borrowRatePerBlock();
  const pendingOwner = await vToken.pendingOwner();
  const protocolShareReserve = await vToken.protocolShareReserve();
  const shortfall = await vToken.shortfall();
  const supplyRatePerBlock = await vToken.supplyRatePerBlock();

  return {
    name,
    symbol,
    decimals,
    owner,
    comptroller,
    interestRateModel,
    reserveFactorMantissa,
    accrualBlockNumber,
    borrowIndex,
    totalBorrows,
    totalSupply,
    underlying,
    accountBalance,
    borrowBalance,
    borrowRatePerBlock,
    pendingOwner,
    protocolShareReserve,
    shortfall,
    supplyRatePerBlock,
  };
}

let vToken: ethers.Contract;
let underlying: ethers.Contract;
let user: SignerWithAddress;
let impersonatedTimelock: SignerWithAddress;
const postVipStorage: storageLayout[] = [];
const preVipStorage: storageLayout[] = [];
const provider = ethers.provider;
let mintAmount = parseUnits("200", 18);
let borrowAmount = parseUnits("50", 18);
let repayAmount = parseUnits("50", 18);
let redeemAmount = parseUnits("50", 18);
forking(33043237, () => {
  describe("pre VIP", async () => {
    before(async () => {
      [user] = await ethers.getSigners();
      impersonatedTimelock = await initMainnetUser(NORMAL_TIMELOCK, ethers.utils.parseEther("3"));
      await mine(4);
    });
    for (const asset of IL_ASSETS) {
      it(`Save pre VIP storage snapshot of ${asset.name}`, async () => {
        vToken = new ethers.Contract(asset.address, VTOKEN_ABI, provider);

        const comptroller = new ethers.Contract(await vToken.comptroller(), COMPTROLLER_ABI, provider);
        await comptroller
          .connect(impersonatedTimelock)
          .setCollateralFactor(asset.address, parseUnits("0.8", 18), parseUnits("0.9", 18));

        underlying = new ethers.Contract(await vToken.underlying(), MOCK_TOKEN_ABI, provider);
        const underlyingDecimals = await underlying.decimals();
        const symbol = await underlying.symbol();

        if (symbol == "WBNB") {
          mintAmount = parseUnits("0.9", 18);
          borrowAmount = parseUnits("0.5", 18);
          repayAmount = parseUnits("0.25", 18);
          redeemAmount = parseUnits("0.5", 18);
          await underlying.connect(user).deposit({ value: mintAmount });
        } else if (underlyingDecimals == 18) {
          await underlying.connect(user).faucet(mintAmount.add(repayAmount));
        } else {
          mintAmount = parseUnits("200", 6);
          borrowAmount = parseUnits("50", 6);
          repayAmount = parseUnits("25", 6);
          redeemAmount = parseUnits("50", 6);
          await underlying.connect(user).allocateTo(user.address, mintAmount.add(repayAmount));
        }

        await underlying.connect(user).approve(asset.address, mintAmount.add(repayAmount));

        await vToken.connect(user).mint(mintAmount);
        await vToken.connect(user).borrow(borrowAmount);
        await vToken.connect(user).repayBorrow(repayAmount);
        await vToken.connect(user).redeemUnderlying(redeemAmount);
        const state = await fetchStorage(vToken, user.address);
        preVipStorage.push(state);
      });
    }
  });
});

forking(33043237, () => {
  testVip("VIP-170 VToken Upgrade of AIA", vip170Testnet(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTOKEN_ABI, BEACON_ABI], ["Upgraded", "NewReduceReservesBlockDelta"], [1, 22]);
    },
  });
});

forking(33043237, () => {
  describe("pre VIP", async () => {
    before(async () => {
      await pretendExecutingVip(vip170Testnet());
      [user] = await ethers.getSigners();
    });

    for (const asset of IL_ASSETS) {
      it(`Save post VIP storage snapshot of ${asset.name}`, async () => {
        vToken = new ethers.Contract(asset.address, VTOKEN_ABI, provider);

        const comptroller = new ethers.Contract(await vToken.comptroller(), COMPTROLLER_ABI, provider);
        // await comptroller.connect(user).enterMarkets([asset.address]);
        await comptroller
          .connect(impersonatedTimelock)
          .setCollateralFactor(asset.address, parseUnits("0.8", 18), parseUnits("0.9", 18));

        underlying = new ethers.Contract(await vToken.underlying(), MOCK_TOKEN_ABI, provider);
        const underlyingDecimals = await underlying.decimals();
        const symbol = await underlying.symbol();

        if (symbol == "WBNB") {
          mintAmount = parseUnits("0.9", 18);
          borrowAmount = parseUnits("0.5", 18);
          repayAmount = parseUnits("0.25", 18);
          redeemAmount = parseUnits("0.5", 18);
          await underlying.connect(user).deposit({ value: mintAmount });
        } else if (underlyingDecimals == 18) {
          await underlying.connect(user).faucet(mintAmount.add(repayAmount));
        } else {
          mintAmount = parseUnits("200", 6);
          borrowAmount = parseUnits("50", 6);
          repayAmount = parseUnits("25", 6);
          redeemAmount = parseUnits("50", 6);
          await underlying.connect(user).allocateTo(user.address, mintAmount.add(repayAmount));
        }

        await underlying.connect(user).approve(asset.address, mintAmount.add(repayAmount));

        await vToken.connect(user).mint(mintAmount);
        await vToken.connect(user).borrow(borrowAmount);
        await vToken.connect(user).repayBorrow(repayAmount);
        await vToken.connect(user).redeemUnderlying(redeemAmount);
        const state = await fetchStorage(vToken, user.address);
        postVipStorage.push(state);
      });
    }

    it("Should match pre and post storage", async () => {
      for (let i = 0; i < preVipStorage.length; i++) {
        expect(preVipStorage[i]).to.deep.equal(postVipStorage[i]);
      }
    });

    it("Should change implementation", async () => {
      const beacon = new ethers.Contract(VTOKEN_BEACON, BEACON_ABI, provider);
      expect(await beacon.implementation()).equals(NEW_IMPL_VTOKEN);
    });
  });
});
