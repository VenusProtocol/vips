import { mine, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import chai, { expect } from "chai";
import chaiJestSnapshot from "chai-jest-snapshot";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents, initMainnetUser } from "../../../src/utils";
import { forking, pretendExecutingVip, testVip } from "../../../src/vip-framework";
import {
  fetchVTokenStorageCore,
  fetchVTokenStorageIL,
  performVTokenBasicActions,
} from "../../../src/vtokenUpgradesHelper";
import {
  CORE_MARKETS,
  IL_VTOKEN_IMPL,
  NEW_VBEP20_DELEGATE_IMPL,
  vip219Testnet,
} from "../../../vips/vip-234/bsctestnet";
import beaconAbi from "./abi/beacon.json";
import comptrollerAbi from "./abi/comptroller.json";
import coreTokenAbi from "./abi/coreVToken.json";
import ilComptrollerAbi from "./abi/il_comptroller.json";
import isolatedPoolsVTokenAbi from "./abi/isolatedPoolsVToken.json";
import mockTokenAbi from "./abi/mockToken.json";

chai.use(chaiJestSnapshot);

const VTOKEN_BEACON = "0xBF85A90673E61956f8c79b9150BAB7893b791bDd";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const PROTOCOL_SHARE_RESERVE = "0x25c7c7D6Bf710949fD7f03364E9BA19a1b3c10E3";
const TOKEN_HOLDER = "0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706";

// IL
const IL_VTOKEN_IMPL = "0x72581fd0Ff9224Dbc8983ca45bbc61C75B0FD94c";
// Core
const NEW_VBEP20_DELEGATE_IMPL = "0x5C7ED65F06A714a7128122749d7e1fF76ea303cf";

const IL_MARKETS = [
  {
    name: "vHAY",
    address: "0x170d3b2da05cc2124334240fB34ad1359e34C562",
  },
  {
    name: "vUSDD",
    address: "0x899dDf81DfbbF5889a16D075c352F2b959Dd24A4",
  },
  {
    name: "vUSDT",
    address: "0x3338988d0beb4419Acb8fE624218754053362D06",
  },
  {
    name: "vagEUR",
    address: "0x4E1D35166776825402d50AfE4286c500027211D1",
  },
  {
    name: "vWIN_Tron",
    address: "0xEe543D5de2Dbb5b07675Fc72831A2f1812428393",
  },
  {
    name: "vUSDD_Tron",
    address: "0xD804F74fe21290d213c46610ab171f7c2EeEBDE7",
  },
  {
    name: "vUSDT_Tron",
    address: "0x712774CBFFCBD60e9825871CcEFF2F917442b2c3",
  },
  {
    name: "vTRX_Tron",
    address: "0x410286c43a525E1DCC7468a9B091C111C8324cd1",
  },
  {
    name: "vBTT_Tron",
    address: "0x47793540757c6E6D84155B33cd8D9535CFdb9334",
  },
  {
    name: "vWBNB_LiquidStakedBNB",
    address: "0x231dED0Dfc99634e52EE1a1329586bc970d773b3",
  },
  {
    name: "vBNBx_LiquidStakedBNB",
    address: "0x644A149853E5507AdF3e682218b8AC86cdD62951",
  },
  {
    name: "vstkBNB_LiquidStakedBNB",
    address: "0x75aa42c832a8911B77219DbeBABBB40040d16987",
  },
  {
    name: "vankrBNB_LiquidStakedBNB",
    address: "0x57a664Dd7f1dE19545fEE9c86C949e3BF43d6D47",
  },
  {
    name: "vUSDT_LiquidStakedBNB",
    address: "0x2197d02cC9cd1ad51317A0a85A656a0c82383A7c",
  },
  {
    name: "vUSDD_LiquidStakedBNB",
    address: "0xD5b20708d8f0FcA52cb609938D0594C4e32E5DaD",
  },
  {
    name: "vSnBNB_LiquidStakedBNB",
    address: "0xeffE7874C345aE877c1D893cd5160DDD359b24dA",
  },
  {
    name: "vFLOKI_GameFi",
    address: "0xef470AbC365F88e4582D8027172a392C473A5B53",
  },
  {
    name: "vUSDD_GameFi",
    address: "0xdeDf3B2bcF25d0023115fd71a0F8221C91C92B1a",
  },
  {
    name: "vRACA_GameFi",
    address: "0x1958035231E125830bA5d17D168cEa07Bb42184a",
  },
  {
    name: "vUSDT_GameFi",
    address: "0x0bFE4e0B8A2a096A27e5B18b078d25be57C08634",
  },
  {
    name: "vUSDT_DeFi",
    address: "0x80CC30811e362aC9aB857C3d7875CbcCc0b65750",
  },
  {
    name: "vankrBNB_DeFi",
    address: "0xe507B30C41E9e375BCe05197c1e09fc9ee40c0f6",
  },
  {
    name: "vUSDD_DeFi",
    address: "0xa109DE0abaeefC521Ec29D89eA42E64F37A6882E",
  },
  {
    name: "vANKR_DeFi",
    address: "0xb677e080148368EeeE70fA3865d07E92c6500174",
  },
  {
    name: "vBSW_DeFi",
    address: "0x5e68913fbbfb91af30366ab1B21324410b49a308",
  },
  {
    name: "vALPACA_DeFi",
    address: "0xb7caC5Ef82cb7f9197ee184779bdc52c5490C02a",
  },
  {
    name: "vTWT_DeFi",
    address: "0x4C94e67d239aD585275Fdd3246Ab82c8a2668564",
  },
  {
    name: "vPLANET_DeFi",
    address: "0xe237aA131E7B004aC88CB808Fa56AF3dc4C408f1",
  },
];

before(function () {
  chaiJestSnapshot.resetSnapshotRegistry();
});

beforeEach(function () {
  chaiJestSnapshot.configureUsingMochaContext(this);
});

const snapshotFilename = __filename + ".snap";

let vToken: ethers.Contract;
let underlying: ethers.Contract;
let user: SignerWithAddress;
let impersonatedTimelock: SignerWithAddress;
const provider = ethers.provider;
const mintAmount = parseUnits("200", 18);
const borrowAmount = parseUnits("50", 18);
const repayAmount = parseUnits("50", 18);
const redeemAmount = parseUnits("50", 18);
forking(36586320, () => {
  describe("Pre VIP simulations", async () => {
    before(async () => {
      [user] = await ethers.getSigners();
      impersonatedTimelock = await initMainnetUser(NORMAL_TIMELOCK, ethers.utils.parseEther("3"));
      await mine(CORE_MARKETS.length + 2); // Number of Vip steps
    });
    for (const market of CORE_MARKETS) {
      it(`Save pre VIP storage snapshot of ${market.name}`, async () => {
        if (!market.isMock) {
          user = await initMainnetUser(TOKEN_HOLDER, ethers.utils.parseEther("5"));
        } else {
          await setBalance(user.address, ethers.utils.parseEther("5"));
        }
        vToken = new ethers.Contract(market.address, coreTokenAbi, provider);
        const comptroller = new ethers.Contract(await vToken.comptroller(), comptrollerAbi, provider);
        underlying = new ethers.Contract(await vToken.underlying(), mockTokenAbi, provider);

        await comptroller.connect(impersonatedTimelock)._setMarketBorrowCaps([market.address], [parseUnits("2", 48)]);
        await comptroller.connect(impersonatedTimelock)._setMarketSupplyCaps([market.address], [parseUnits("2", 48)]);
        await comptroller.connect(impersonatedTimelock)._setCollateralFactor(market.address, parseUnits("0.95", 18));

        if (market.name != "vBUSD")
          await performVTokenBasicActions(market.address, user, vToken, underlying, market.isMock, {
            mintAmount,
            borrowAmount,
            repayAmount,
            redeemAmount,
          });

        const state = await fetchVTokenStorageCore(vToken, user.address);

        delete state.totalReserves;
        delete state.pendingOwner;
        delete state.owner;

        expect(state).to.matchSnapshot(snapshotFilename, market.name);
      });
    }

    for (const market of IL_MARKETS) {
      it(`Save pre VIP storage snapshot of ${market.name}`, async () => {
        await setBalance(user.address, ethers.utils.parseEther("5"));
        vToken = new ethers.Contract(market.address, isolatedPoolsVTokenAbi, provider);
        const comptroller = new ethers.Contract(await vToken.comptroller(), ilComptrollerAbi, provider);
        underlying = new ethers.Contract(await vToken.underlying(), mockTokenAbi, provider);

        await comptroller.connect(impersonatedTimelock).setMarketBorrowCaps([market.address], [parseUnits("2", 38)]);
        await comptroller.connect(impersonatedTimelock).setMarketSupplyCaps([market.address], [parseUnits("2", 38)]);
        await comptroller
          .connect(impersonatedTimelock)
          .setCollateralFactor(market.address, parseUnits("0.8", 18), parseUnits("0.9", 18));

        await performVTokenBasicActions(market.address, user, vToken, underlying, true, {
          mintAmount,
          borrowAmount,
          repayAmount,
          redeemAmount,
        });
        const state = await fetchVTokenStorageIL(vToken, user.address);

        delete state.protocolShareReserve;
        delete state.totalReserves;

        expect(state).to.matchSnapshot(snapshotFilename, market.name);
      });
    }
  });
});

forking(36586320, () => {
  testVip("VIP-219 IL VToken Upgrade", vip219Testnet(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [coreTokenAbi, beaconAbi], ["NewImplementation", "Upgraded"], [21, 2]);
    },
  });
});

forking(36586320, () => {
  describe("Post VIP simulations", async () => {
    before(async () => {
      await pretendExecutingVip(vip219Testnet());
      [user] = await ethers.getSigners();
    });

    for (const market of CORE_MARKETS) {
      it(`Save post VIP storage snapshot of ${market.name}`, async () => {
        if (!market.isMock) {
          user = await initMainnetUser(TOKEN_HOLDER, ethers.utils.parseEther("5"));
        } else {
          await setBalance(user.address, ethers.utils.parseEther("5"));
        }

        vToken = new ethers.Contract(market.address, coreTokenAbi, provider);
        const comptroller = new ethers.Contract(await vToken.comptroller(), comptrollerAbi, provider);
        underlying = new ethers.Contract(await vToken.underlying(), mockTokenAbi, provider);

        await comptroller.connect(impersonatedTimelock)._setMarketBorrowCaps([market.address], [parseUnits("2", 48)]);
        await comptroller.connect(impersonatedTimelock)._setMarketSupplyCaps([market.address], [parseUnits("2", 48)]);
        await comptroller.connect(impersonatedTimelock)._setCollateralFactor(market.address, parseUnits("0.95", 18));
        if (market.name != "vBUSD")
          await performVTokenBasicActions(market.address, user, vToken, underlying, market.isMock, {
            mintAmount,
            borrowAmount,
            repayAmount,
            redeemAmount,
          });

          const state = await fetchVTokenStorageCore(vToken, user.address);

          delete state.totalReserves;
          delete state.pendingOwner;
          delete state.owner;

          expect(await vToken.implementation()).equals(NEW_VBEP20_DELEGATE_IMPL);

          expect(state).to.matchSnapshot(snapshotFilename, market.name);
      });
    }

    for (const market of IL_MARKETS) {
      it(`Save post VIP storage snapshot of ${market.name}`, async () => {
        await setBalance(user.address, ethers.utils.parseEther("5"));
        vToken = new ethers.Contract(market.address, isolatedPoolsVTokenAbi, provider);
        const comptroller = new ethers.Contract(await vToken.comptroller(), ilComptrollerAbi, provider);
        underlying = new ethers.Contract(await vToken.underlying(), mockTokenAbi, provider);

        await comptroller.connect(impersonatedTimelock).setMarketBorrowCaps([market.address], [parseUnits("2", 38)]);
        await comptroller.connect(impersonatedTimelock).setMarketSupplyCaps([market.address], [parseUnits("2", 38)]);
        await comptroller
          .connect(impersonatedTimelock)
          .setCollateralFactor(market.address, parseUnits("0.8", 18), parseUnits("0.9", 18));

        await performVTokenBasicActions(market.address, user, vToken, underlying, true, {
          mintAmount,
          borrowAmount,
          repayAmount,
          redeemAmount,
        });
        const state = await fetchVTokenStorageIL(vToken, user.address);

        delete state.protocolShareReserve;
        delete state.totalReserves;

        expect(await vToken.protocolShareReserve()).equals(PROTOCOL_SHARE_RESERVE);
        expect(state).to.matchSnapshot(snapshotFilename, market.name);
      });
    }

    it("Should change implementation", async () => {
      const beacon = new ethers.Contract(VTOKEN_BEACON, beaconAbi, provider);
      expect(await beacon.implementation()).equals(IL_VTOKEN_IMPL);
    });
  });
});

// In very first operation after upgrade the reserves will be reduced (delta > lastReduceReservesBlockNumber(0)).
forking(36586320, () => {
  describe("Post VIP simulations", async () => {
    before(async () => {
      await pretendExecutingVip(vip219Testnet());
      impersonatedTimelock = await initMainnetUser(NORMAL_TIMELOCK, ethers.utils.parseEther("3"));
    });

    for (const market of CORE_MARKETS) {
      it(`Reduce reserves in ${market.name}`, async () => {
        vToken = new ethers.Contract(market.address, coreTokenAbi, provider);
        underlying = new ethers.Contract(await vToken.underlying(), mockTokenAbi, provider);

        const cashPrior = await vToken.getCash();
        const reservesPrior = await vToken.totalReserves();
        const psrBalPrior = await underlying.balanceOf(PROTOCOL_SHARE_RESERVE);

        if (Number(cashPrior) > Number(reservesPrior) && reservesPrior != 0) {
          await expect(vToken.connect(impersonatedTimelock).accrueInterest()).to.be.emit(vToken, "ReservesReduced");
          const reservesAfter = await vToken.totalReserves();
          const psrBalAfter = await underlying.balanceOf(PROTOCOL_SHARE_RESERVE);
          expect(psrBalAfter).greaterThanOrEqual(psrBalPrior.add(reservesPrior));
          expect(reservesAfter).equals(0);
          await expect(vToken.connect(impersonatedTimelock).accrueInterest()).to.not.be.emit(vToken, "ReservesReduced");
        } else if (Number(cashPrior) < Number(reservesPrior) && reservesPrior != 0) {
          await expect(await vToken.connect(impersonatedTimelock).accrueInterest()).to.be.emit(vToken, "ReservesReduced");
          const reservesAfter = await vToken.totalReserves();
          const psrBalAfter = await underlying.balanceOf(PROTOCOL_SHARE_RESERVE);
          expect(psrBalAfter).to.equal(psrBalPrior.add(cashPrior));
          expect(reservesAfter).greaterThan(reservesPrior.sub(cashPrior));
        } else if (reservesPrior != 0) {
          await expect(vToken.connect(impersonatedTimelock).accrueInterest()).to.not.be.emit(vToken, "ReservesReduced");
          const reservesAfter = await vToken.totalReserves();
          const psrBalAfter = await underlying.balanceOf(PROTOCOL_SHARE_RESERVE);
          expect(psrBalAfter).equals(psrBalPrior);
          expect(reservesAfter).greaterThan(reservesPrior);
        }
      });
    }

    for (const market of IL_MARKETS) {
      it(`Reduce reserves in ${market.name}`, async () => {
        vToken = new ethers.Contract(market.address, isolatedPoolsVTokenAbi, provider);
        underlying = new ethers.Contract(await vToken.underlying(), mockTokenAbi, provider);

        const cashPrior = await vToken.getCash();
        const reservesPrior = await vToken.totalReserves();
        const psrBalPrior = await underlying.balanceOf(PROTOCOL_SHARE_RESERVE);

        if (Number(cashPrior) > Number(reservesPrior) && reservesPrior != 0) {
          await expect(vToken.connect(impersonatedTimelock).accrueInterest()).to.be.emit(
            vToken,
            "SpreadReservesReduced",
          );
          const reservesAfter = await vToken.totalReserves();
          const psrBalAfter = await underlying.balanceOf(PROTOCOL_SHARE_RESERVE);

          expect(psrBalAfter).greaterThanOrEqual(psrBalPrior.add(reservesPrior));
          expect(reservesAfter).equals(0);
          await expect(vToken.connect(impersonatedTimelock).accrueInterest()).to.not.be.emit(
            vToken,
            "SpreadReservesReduced",
          );
        } else if (cashPrior.lt(reservesPrior) && !reservesPrior.eq(0)) {
          await expect(vToken.connect(impersonatedTimelock).accrueInterest()).to.be.emit(
            vToken,
            "SpreadReservesReduced",
          );
          const reservesAfter = await vToken.totalReserves();
          const psrBalAfter = await underlying.balanceOf(PROTOCOL_SHARE_RESERVE);

          expect(psrBalAfter).greaterThanOrEqual(psrBalPrior.add(reservesPrior));
          expect(reservesAfter).equals(0);
          await expect(vToken.connect(impersonatedTimelock).accrueInterest()).to.not.be.emit(
            vToken,
            "SpreadReservesReduced",
          );
        } else if (reservesPrior != 0) {
          await expect(vToken.connect(impersonatedTimelock).accrueInterest()).to.not.be.emit(
            vToken,
            "SpreadReservesReduced",
          );
          const reservesAfter = await vToken.totalReserves();
          const psrBalAfter = await underlying.balanceOf(PROTOCOL_SHARE_RESERVE);
          expect(psrBalAfter).equals(psrBalPrior);
          expect(reservesAfter).greaterThan(reservesPrior);
        }
      });
    }
  });
});
