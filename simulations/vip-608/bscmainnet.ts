import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { forking, testVip } from "src/vip-framework";

import vip608 from "../../vips/vip-608/bscmainnet";
import VBEP20_DELEGATE_ABI from "./abi/VBep20Delegate.json";

const BLOCK_NUMBER = 87684581;

const NEW_VBEP20_DELEGATE_IMPL = "0xb25b57599BA969c4829699F7E4Fc4076D14745E1";

const ERC20_ABI = ["function balanceOf(address) view returns (uint256)"];

// All 43 VBep20Delegator proxy addresses
const MARKET_ADDRESSES = [
  "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8", // vUSDC
  "0xfD5840Cd36d94D7229439859C0112a4185BC0255", // vUSDT
  "0x95c78222B3D6e262426483D42CfA53685A67Ab9D", // vBUSD
  "0x2fF3d0F6990a40261c66E1ff2017aCBc282EB6d0", // vSXP
  "0x151B1e2635A717bcDc836ECd6FbB62B674FE3E1D", // vXVS
  "0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B", // vBTC
  "0xf508fCD89b8bd15579dc79A6827cB4686A3592c8", // vETH
  "0x57A5297F2cB2c0AaC9D554660acd6D385Ab50c6B", // vLTC
  "0xB248a295732e0225acd3337607cc01068e3b9c10", // vXRP
  "0x5F0388EBc2B94FA8E123F404b79cCF5f40b29176", // vBCH
  "0x1610bc33319e9398de5f57B33a5b184c806aD217", // vDOT
  "0x650b940a1033B8A1b1873f78730FcFC73ec11f1f", // vLINK
  "0x334b3eCB4DCa3593BCCC3c7EBD1A1C1d1780FBF1", // vDAI
  "0xf91d58b5aE142DAcC749f58A49FCBac340Cb0343", // vFIL
  "0x972207A639CC1B374B893cc33Fa251b55CEB7c07", // vBETH
  "0x9A0AF7FDb2065Ce470D72664DE73cAE409dA28Ec", // vADA
  "0xec3422Ef92B2fb59e84c8B02Ba73F1fE84Ed8D71", // vDOGE
  "0x5c9476FcD6a4F9a3654139721c949c2233bBbBc8", // vMATIC
  "0x86aC3974e2BD0d60825230fa6F355fF11409df5c", // vCAKE
  "0x26DA28954763B92139ED49283625ceCAf52C6f94", // vAAVE
  "0x08CEB3F4a7ed3500cA0982bcd0FC7816688084c3", // vTUSDOLD
  "0x61eDcFe8Dd6bA3c891CB9bEc2dc7657B3B422E93", // vTRXOLD
  "0xC5D3466aA484B040eE977073fcF337f2c00071c1", // vTRX
  "0x6CFdEc747f37DAf3b87a35a1D9c8AD3063A1A8A0", // vWBETH
  "0xBf762cd5991cA1DCdDaC9ae5C638F5B5Dc3Bee6E", // vTUSD
  "0x27FF564707786720C71A2e5c1490A63266683612", // vUNI
  "0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba", // vFDUSD
  "0x4d41a36D04D97785bcEA57b057C412b278e6Edcc", // vTWT
  "0xf841cb62c19fCd4fF5CD0AaB5939f3140BaaC3Ea", // vSolvBTC
  "0x86e06EAfa6A1eA631Eab51DE500E3D474933739f", // vTHE
  "0xBf515bA4D1b52FFdCeaBF20d31D705Ce789F2cEC", // vSOL
  "0x689E0daB47Ab16bcae87Ec18491692BF621Dc6Ab", // vlisUSD
  "0x9e4E5fed5Ac5B9F732d0D850A615206330Bf1866", // vPT-sUSDE-26JUN2025
  "0x699658323d58eE25c69F1a29d476946ab011bD18", // vsUSDe
  "0x74ca6930108F775CC667894EEa33843e691680d7", // vUSDe
  "0x0C1DA220D301155b87318B90692Da8dc43B67340", // vUSD1
  "0xd804dE60aFD05EE6B89aab5D152258fD461B07D5", // vxSolvBTC
  "0xCC1dB43a06d97f736C7B045AedD03C6707c09BDF", // vasBNB
  "0x6bCa74586218dB34cdB402295796b79663d816e9", // vWBNB
  "0x89c910Eb8c90df818b4649b508Ba22130Dc73Adc", // vslisBNB
  "0x3d5E269787d562b74aCC55F18Bd26C5D09Fa245E", // vU
  "0x6d3BD68E90B42615cb5abF4B8DE92b154ADc435e", // vPT-clisBNB-25JUN2026
  "0x92e6Ea74a1A3047DabF4186405a21c7D63a0612A", // vXAUM
];

const MARKET_NAMES = [
  "vUSDC",
  "vUSDT",
  "vBUSD",
  "vSXP",
  "vXVS",
  "vBTC",
  "vETH",
  "vLTC",
  "vXRP",
  "vBCH",
  "vDOT",
  "vLINK",
  "vDAI",
  "vFIL",
  "vBETH",
  "vADA",
  "vDOGE",
  "vMATIC",
  "vCAKE",
  "vAAVE",
  "vTUSDOLD",
  "vTRXOLD",
  "vTRX",
  "vWBETH",
  "vTUSD",
  "vUNI",
  "vFDUSD",
  "vTWT",
  "vSolvBTC",
  "vTHE",
  "vSOL",
  "vlisUSD",
  "vPT-sUSDE-26JUN2025",
  "vsUSDe",
  "vUSDe",
  "vUSD1",
  "vxSolvBTC",
  "vasBNB",
  "vWBNB",
  "vslisBNB",
  "vU",
  "vPT-clisBNB-25JUN2026",
  "vXAUM",
];

interface MarketSnapshot {
  totalBorrows: BigNumber;
  totalReserves: BigNumber;
  totalSupply: BigNumber;
  exchangeRate: BigNumber;
}

forking(BLOCK_NUMBER, async () => {
  const provider = ethers.provider;
  const preVipSnapshots: Map<string, MarketSnapshot> = new Map();

  before(async () => {
    // Capture pre-VIP state for all markets
    for (let i = 0; i < MARKET_ADDRESSES.length; i++) {
      const vToken = new ethers.Contract(MARKET_ADDRESSES[i], VBEP20_DELEGATE_ABI, provider);
      const [totalBorrows, totalReserves, totalSupply, exchangeRate] = await Promise.all([
        vToken.totalBorrows(),
        vToken.totalReserves(),
        vToken.totalSupply(),
        vToken.exchangeRateStored(),
      ]);
      preVipSnapshots.set(MARKET_ADDRESSES[i], { totalBorrows, totalReserves, totalSupply, exchangeRate });
    }
  });

  testVip("VIP-608 Upgrade VBep20Delegate for Core Pool", await vip608());

  describe("Post-VIP behavior", async () => {
    for (let i = 0; i < MARKET_ADDRESSES.length; i++) {
      const marketAddress = MARKET_ADDRESSES[i];
      const marketName = MARKET_NAMES[i];

      describe(`${marketName} (${marketAddress})`, () => {
        let vToken: Contract;

        before(async () => {
          vToken = new ethers.Contract(marketAddress, VBEP20_DELEGATE_ABI, provider);
        });

        it("should have the new implementation", async () => {
          expect(await vToken.implementation()).to.equal(NEW_VBEP20_DELEGATE_IMPL);
        });

        it("should have internalCash equal to underlying token balance", async () => {
          const internalCash = await vToken.internalCash();
          const underlyingAddress = await vToken.underlying();
          const underlyingToken = new ethers.Contract(underlyingAddress, ERC20_ABI, provider);
          const underlyingBalance = await underlyingToken.balanceOf(marketAddress);
          expect(internalCash).to.equal(underlyingBalance);
        });

        it("should preserve totalSupply", async () => {
          const snapshot = preVipSnapshots.get(marketAddress)!;
          expect(await vToken.totalSupply()).to.equal(snapshot.totalSupply);
        });

        it("should allow accrueInterest to succeed", async () => {
          // accrueInterest should work correctly with synced internalCash
          await expect(vToken.callStatic.accrueInterest()).to.not.be.reverted;
        });
      });
    }
  });
});
