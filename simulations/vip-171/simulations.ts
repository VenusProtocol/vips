import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { SpeedRecord, vip171 } from "../../vips/vip-171";
import COMPTROLLER_ABI from "./abi/comptroller.json";

const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";

const OLD_SPEEDS: SpeedRecord[] = [
  {
    market: "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8",
    symbol: "vUSDC",
    supplySideSpeed: "2712673611111111",
    borrowSideSpeed: "2712673611111111",
  },
  {
    market: "0xfD5840Cd36d94D7229439859C0112a4185BC0255",
    symbol: "vUSDT",
    supplySideSpeed: "2712673611111111",
    borrowSideSpeed: "2712673611111111",
  },
  {
    market: "0x95c78222B3D6e262426483D42CfA53685A67Ab9D",
    symbol: "vBUSD",
    supplySideSpeed: "0",
    borrowSideSpeed: "0",
  },
  {
    market: "0x2fF3d0F6990a40261c66E1ff2017aCBc282EB6d0",
    symbol: "vSXP",
    supplySideSpeed: "0",
    borrowSideSpeed: "0",
  },
  {
    market: "0x151B1e2635A717bcDc836ECd6FbB62B674FE3E1D",
    symbol: "vXVS",
    supplySideSpeed: "0",
    borrowSideSpeed: "0",
  },
  {
    market: "0xA07c5b74C9B40447a954e1466938b865b6BBea36",
    symbol: "vBNB",
    supplySideSpeed: "6510416666666666",
    borrowSideSpeed: "6510416666666666",
  },
  {
    market: "0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B",
    symbol: "vBTC",
    supplySideSpeed: "6510416666666666",
    borrowSideSpeed: "6510416666666666",
  },
  {
    market: "0xf508fCD89b8bd15579dc79A6827cB4686A3592c8",
    symbol: "vETH",
    supplySideSpeed: "3255208333333333",
    borrowSideSpeed: "3255208333333333",
  },
  {
    market: "0x57A5297F2cB2c0AaC9D554660acd6D385Ab50c6B",
    symbol: "vLTC",
    supplySideSpeed: "198871527777778",
    borrowSideSpeed: "198871527777778",
  },
  {
    market: "0xB248a295732e0225acd3337607cc01068e3b9c10",
    symbol: "vXRP",
    supplySideSpeed: "198871527777778",
    borrowSideSpeed: "198871527777778",
  },
  {
    market: "0x5F0388EBc2B94FA8E123F404b79cCF5f40b29176",
    symbol: "vBCH",
    supplySideSpeed: "108506944444444",
    borrowSideSpeed: "108506944444444",
  },
  {
    market: "0x1610bc33319e9398de5f57B33a5b184c806aD217",
    symbol: "vDOT",
    supplySideSpeed: "318142361111111",
    borrowSideSpeed: "318142361111111",
  },
  {
    market: "0x650b940a1033B8A1b1873f78730FcFC73ec11f1f",
    symbol: "vLINK",
    supplySideSpeed: "198871527777778",
    borrowSideSpeed: "198871527777778",
  },
  {
    market: "0x334b3eCB4DCa3593BCCC3c7EBD1A1C1d1780FBF1",
    symbol: "vDAI",
    supplySideSpeed: "325520833333333",
    borrowSideSpeed: "325520833333333",
  },
  {
    market: "0xf91d58b5aE142DAcC749f58A49FCBac340Cb0343",
    symbol: "vFIL",
    supplySideSpeed: "108506944444444",
    borrowSideSpeed: "108506944444444",
  },
  {
    market: "0x972207A639CC1B374B893cc33Fa251b55CEB7c07",
    symbol: "vBETH",
    supplySideSpeed: "0",
    borrowSideSpeed: "0",
  },
  {
    market: "0xeBD0070237a0713E8D94fEf1B728d3d993d290ef",
    symbol: "vCAN",
    supplySideSpeed: "0",
    borrowSideSpeed: "0",
  },
  {
    market: "0x9A0AF7FDb2065Ce470D72664DE73cAE409dA28Ec",
    symbol: "vADA",
    supplySideSpeed: "325520833333333",
    borrowSideSpeed: "325520833333333",
  },
  {
    market: "0xec3422Ef92B2fb59e84c8B02Ba73F1fE84Ed8D71",
    symbol: "vDOGE",
    supplySideSpeed: "108506944444444",
    borrowSideSpeed: "108506944444444",
  },
  {
    market: "0x5c9476FcD6a4F9a3654139721c949c2233bBbBc8",
    symbol: "vMATIC",
    supplySideSpeed: "217013888888889",
    borrowSideSpeed: "217013888888889",
  },
  {
    market: "0x86aC3974e2BD0d60825230fa6F355fF11409df5c",
    symbol: "vCAKE",
    supplySideSpeed: "217013888888889",
    borrowSideSpeed: "217013888888889",
  },
  {
    market: "0x26DA28954763B92139ED49283625ceCAf52C6f94",
    symbol: "vAAVE",
    supplySideSpeed: "108506944444444",
    borrowSideSpeed: "108506944444444",
  },
  {
    market: "0x08CEB3F4a7ed3500cA0982bcd0FC7816688084c3",
    symbol: "vTUSDOLD",
    supplySideSpeed: "0",
    borrowSideSpeed: "0",
  },
  {
    market: "0x61eDcFe8Dd6bA3c891CB9bEc2dc7657B3B422E93",
    symbol: "vTRXOLD",
    supplySideSpeed: "0",
    borrowSideSpeed: "0",
  },
  {
    market: "0x78366446547D062f45b4C0f320cDaa6d710D87bb",
    symbol: "vUST",
    supplySideSpeed: "0",
    borrowSideSpeed: "0",
  },
  {
    market: "0xb91A659E88B51474767CD97EF3196A3e7cEDD2c8",
    symbol: "vLUNA",
    supplySideSpeed: "0",
    borrowSideSpeed: "0",
  },
  {
    market: "0xC5D3466aA484B040eE977073fcF337f2c00071c1",
    symbol: "vTRX",
    supplySideSpeed: "217013888888889",
    borrowSideSpeed: "217013888888889",
  },
  {
    market: "0x6CFdEc747f37DAf3b87a35a1D9c8AD3063A1A8A0",
    symbol: "vWBETH",
    supplySideSpeed: "596440972222220",
    borrowSideSpeed: "596440972222220",
  },
  {
    market: "0xBf762cd5991cA1DCdDaC9ae5C638F5B5Dc3Bee6E",
    symbol: "vTUSD",
    supplySideSpeed: "217013888888889",
    borrowSideSpeed: "217013888888889",
  },
];

forking(31758000, () => {
  let comptroller: Contract;

  before(async () => {
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER);
  });

  describe("Simulation correctness & pre-VIP state", () => {
    it("tests all markets", async () => {
      const markets = await comptroller.getAllMarkets();
      expect(markets).to.deep.equal(OLD_SPEEDS.map(speed => speed.market));
    });

    for (const speedRecord of OLD_SPEEDS) {
      it(`has the expected supply-side distribution speed for ${speedRecord.symbol}`, async () => {
        const supplySpeed = await comptroller.venusSupplySpeeds(speedRecord.market);
        expect(supplySpeed).to.equal(speedRecord.supplySideSpeed);
      });

      it(`has the expected borrow-side distribution speed for ${speedRecord.symbol}`, async () => {
        const borrowSpeed = await comptroller.venusBorrowSpeeds(speedRecord.market);
        expect(borrowSpeed).to.equal(speedRecord.borrowSideSpeed);
      });
    }
  });

  testVip("Decrease XVS distribution speeds", vip171(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI],
        ["VenusSupplySpeedUpdated", "VenusBorrowSpeedUpdated"],
        [20, 20],
      );
    },
  });

  describe("Post-VIP state", () => {
    for (const oldSpeed of OLD_SPEEDS) {
      it(`reduces supply-side distribution speed for ${oldSpeed.symbol} by 75%`, async () => {
        const supplySpeed = await comptroller.venusSupplySpeeds(oldSpeed.market);
        expect(supplySpeed).to.equal(BigNumber.from(oldSpeed.supplySideSpeed).div(4));
      });

      it(`reduces borrow-side distribution speed for ${oldSpeed.symbol} by 75%`, async () => {
        const borrowSpeed = await comptroller.venusBorrowSpeeds(oldSpeed.market);
        expect(borrowSpeed).to.equal(BigNumber.from(oldSpeed.borrowSideSpeed).div(4));
      });
    }
  });
});
