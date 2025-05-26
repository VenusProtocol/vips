import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { setMaxStalePeriod, setMaxStalePeriodInChainlinkOracle, setRedstonePrice } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip501, { RESILIENT_ORACLE, REDSTONE_ORACLE, CHAINLINK_ORACLE, LBTCOracle } from "../../vips/vip-501/bscmainnet";
import ERC20_ABI from "./abi/ERC20.json";
import VTOKEN_ABI from "./abi/VToken.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import ONE_JUMP_ABI from "./abi/OneJumpOracle.json";

const { ethereum } = NETWORK_ADDRESSES;

const prices = [
  {
    symbol: "vBAL",
    address: "0x0Ec5488e4F8f319213a14cab188E01fB8517Faa8",
    expectedPrice: parseUnits("1.13935653", 18),
    postVIP: async function (resilientOracle: any, address: string) {
      const vtoken = new ethers.Contract(address, VTOKEN_ABI, ethers.provider);
      const underlying = await vtoken.underlying();
      const token = new ethers.Contract(underlying, ERC20_ABI, ethers.provider);
      await setMaxStalePeriod(resilientOracle, token);
    },
  },
  {
    symbol: "vCRV",
    address: "0x30aD10Bd5Be62CAb37863C2BfcC6E8fb4fD85BDa",
    expectedPrice: parseUnits("0.779026", 18),
    postVIP: async function (resilientOracle: any, address: string) {
      const vtoken = new ethers.Contract(address, VTOKEN_ABI, ethers.provider);
      const underlying = await vtoken.underlying();
      const token = new ethers.Contract(underlying, ERC20_ABI, ethers.provider);
      await setMaxStalePeriod(resilientOracle, token);
    },
  },
  {
    symbol: "vcrvUSD",
    address: "0x672208C10aaAA2F9A6719F449C4C8227bc0BC202",
    expectedPrice: parseUnits("0.99978009", 18),
    postVIP: async function (resilientOracle: any, address: string) {
      const vtoken = new ethers.Contract(address, VTOKEN_ABI, ethers.provider);
      const underlying = await vtoken.underlying();
      const token = new ethers.Contract(underlying, ERC20_ABI, ethers.provider);
      await setMaxStalePeriod(resilientOracle, token);
    },
  },
  {
    symbol: "vDAI",
    address: "0xd8AdD9B41D4E1cd64Edad8722AB0bA8D35536657",
    expectedPrice: parseUnits("0.9998772", 18),
    postVIP: async function (resilientOracle: any, address: string) {
      const vtoken = new ethers.Contract(address, VTOKEN_ABI, ethers.provider);
      const underlying = await vtoken.underlying();
      const token = new ethers.Contract(underlying, ERC20_ABI, ethers.provider);
      await setMaxStalePeriod(resilientOracle, token);
    },
  },
  
  {
    symbol: "vEIGEN",
    address: "0x256AdDBe0a387c98f487e44b85c29eb983413c5e",
    expectedPrice: parseUnits("1.4559", 18),
    postVIP: async function (resilientOracle: any, address: string) {
      const vtoken = new ethers.Contract(address, VTOKEN_ABI, ethers.provider);
      const underlying = await vtoken.underlying();
      const token = new ethers.Contract(underlying, ERC20_ABI, ethers.provider);
      await setMaxStalePeriod(resilientOracle, token);
    },
  },
  {
    symbol: "vFRAX",
    address: "0x4fAfbDc4F2a9876Bd1764827b26fb8dc4FD1dB95",
    expectedPrice: parseUnits("0.9996247", 18),
    postVIP: async function (resilientOracle: any, address: string) {
      const vtoken = new ethers.Contract(address, VTOKEN_ABI, ethers.provider);
      const underlying = await vtoken.underlying();
      const token = new ethers.Contract(underlying, ERC20_ABI, ethers.provider);
      await setMaxStalePeriod(resilientOracle, token);
    },
  },
  {
    symbol: "vWBTC",
    address: "0x8716554364f20BCA783cb2BAA744d39361fd1D8d",
    expectedPrice: parseUnits("107914.76", 28),
    postVIP: async function (resilientOracle: any, address: string) {
      const vtoken = new ethers.Contract(address, VTOKEN_ABI, ethers.provider);
      const underlying = await vtoken.underlying();
      const token = new ethers.Contract(underlying, ERC20_ABI, ethers.provider);
      await setMaxStalePeriod(resilientOracle, token);
    },
  },
  {
    symbol: "vLBTC",
    address: "0x25C20e6e110A1cE3FEbaCC8b7E48368c7b2F0C91",
    expectedPrice: parseUnits("107914.76", 28),
    preVIP: async function (resilientOracle: any, address: string) {
      await setRedstonePrice(
        REDSTONE_ORACLE, 
        "0x8236a87084f8B84306f72007F36F2618A5634494", 
        "0xb415eAA355D8440ac7eCB602D3fb67ccC1f0bc81", 
        ethereum.NORMAL_TIMELOCK,
        31536000,
        { tokenDecimals: 8 }
      );
    },
  },
  {
    symbol: "veBTC",
    address: "0x325cEB02fe1C2fF816A83a5770eA0E88e2faEcF2",
    expectedPrice: parseUnits("107914.76", 28),
  },
  {
    symbol: "vsFRAX",
    address: "0x17142a05fe678e9584FA1d88EfAC1bF181bF7ABe",
    expectedPrice: parseUnits("1.128321270004605475", 18),
    expectedPriceAfterVIP: parseUnits("1.128600615430203768", 18),
    postVIP: async function (resilientOracle: any, address: string) {
      const vtoken = new ethers.Contract(address, VTOKEN_ABI, ethers.provider);
      const underlying = await vtoken.underlying();
      const token = new ethers.Contract(underlying, ERC20_ABI, ethers.provider);
      await setMaxStalePeriod(resilientOracle, token);
    },
  },
  {
    symbol: "vsUSDS",
    address: "0xE36Ae842DbbD7aE372ebA02C8239cd431cC063d6",
    expectedPrice: parseUnits("1.052189541866986697", 18),
    expectedPriceAfterVIP: parseUnits("1.052444688096262922", 18),
    postVIP: async function (resilientOracle: any, address: string) {
      const token = new ethers.Contract("0xdC035D45d973E3EC169d2276DDab16f1e407384F", ERC20_ABI, ethers.provider);
      await setMaxStalePeriod(resilientOracle, token);
    },
  },
  {
    symbol: "vTUSD",
    address: "0x13eB80FDBe5C5f4a7039728E258A6f05fb3B912b",
    expectedPrice: parseUnits("0.99812424", 18),
    postVIP: async function (resilientOracle: any, address: string) {
      const vtoken = new ethers.Contract(address, VTOKEN_ABI, ethers.provider);
      const underlying = await vtoken.underlying();
      const token = new ethers.Contract(underlying, ERC20_ABI, ethers.provider);
      await setMaxStalePeriod(resilientOracle, token);
    },
  },
  {
    symbol: "vUSDC",
    address: "0x17C07e0c232f2f80DfDbd7a95b942D893A4C5ACb",  
    expectedPrice: parseUnits("0.99974", 30),
    postVIP: async function (resilientOracle: any, address: string) {
      const vtoken = new ethers.Contract(address, VTOKEN_ABI, ethers.provider);
      const underlying = await vtoken.underlying();
      const token = new ethers.Contract(underlying, ERC20_ABI, ethers.provider);
      await setMaxStalePeriod(resilientOracle, token);
    },
  },
  {
    symbol: "vUSDS",
    address: "0x0c6B19287999f1e31a5c0a44393b24B62D2C0468",
    expectedPrice: parseUnits("0.99971502", 18),
    postVIP: async function (resilientOracle: any, address: string) {
      const vtoken = new ethers.Contract(address, VTOKEN_ABI, ethers.provider);
      const underlying = await vtoken.underlying();
      const token = new ethers.Contract(underlying, ERC20_ABI, ethers.provider);
      await setMaxStalePeriod(resilientOracle, token);
    },
  },
  {
    symbol: "vUSDT",
    address: "0x8C3e3821259B82fFb32B2450A95d2dcbf161C24E",
    expectedPrice: parseUnits("0.99981646", 30),
    postVIP: async function (resilientOracle: any, address: string) {
      const vtoken = new ethers.Contract(address, VTOKEN_ABI, ethers.provider);
      const underlying = await vtoken.underlying();
      const token = new ethers.Contract(underlying, ERC20_ABI, ethers.provider);
      await setMaxStalePeriod(resilientOracle, token);
    },
  },
  {
    symbol: "vWETH",
    address: "0x7c8ff7d2A1372433726f879BD945fFb250B94c65",
    expectedPrice: parseUnits("2535.08175482", 18),
    postVIP: async function (resilientOracle: any, address: string) {
      const vtoken = new ethers.Contract(address, VTOKEN_ABI, ethers.provider);
      const underlying = await vtoken.underlying();
      const token = new ethers.Contract(underlying, ERC20_ABI, ethers.provider);
      await setMaxStalePeriod(resilientOracle, token);
    },
  },
  {
    symbol: "vweETHs",
    address: "0xc42E4bfb996ED35235bda505430cBE404Eb49F77",
    expectedPrice: parseUnits("2601.693961300405759628", 18),
    postVIP: async function (resilientOracle: any, address: string) {
      const vtoken = new ethers.Contract(address, VTOKEN_ABI, ethers.provider);
      const underlying = await vtoken.underlying();
      const token = new ethers.Contract(underlying, ERC20_ABI, ethers.provider);
      await setMaxStalePeriod(resilientOracle, token);
    },
  },
  {
    symbol: "vyvUSDC",
    address: "0xf87c0a64dc3a8622D6c63265FA29137788163879",
    expectedPrice: parseUnits("1.06199181032", 30),
    expectedPriceAfterVIP: parseUnits("1.0620088059", 30),
  },
  {
    symbol: "vyvUSDT",
    address: "0x475d0C68a8CD275c15D1F01F4f291804E445F677",
    expectedPrice: parseUnits("1.0392742165939", 30),
    expectedPriceAfterVIP: parseUnits("1.03942718851228", 30),
  },
  {
    symbol: "vyvUSDS",
    address: "0x520d67226Bc904aC122dcE66ed2f8f61AA1ED764",
    expectedPrice: parseUnits("1.047327238069092044", 18),
    expectedPriceAfterVIP: parseUnits("1.047416269782742866", 18),
  },
  {
    symbol: "vyvWETH",
    address: "0xba3916302cBA4aBcB51a01e706fC6051AaF272A0",
    expectedPrice: parseUnits("2602.535794995061654355", 18),
    expectedPriceAfterVIP: parseUnits("2602.756833668881071447", 18),
  },
  {
    symbol: "vPT-sUSDE",
    address: "0xCca202a95E8096315E3F19E46e19E1b326634889",
    expectedPrice: parseUnits("1.00026326", 18),
    expectedPriceAfterVIP: parseUnits("1.00046097", 18),
    postVIP: async function (resilientOracle: any, address: string) {
      await setMaxStalePeriodInChainlinkOracle(
        CHAINLINK_ORACLE, 
        "0x4c9EDD5852cd905f086C759E8383e09bff1E68B3", 
        "0xa569d910839Ae8865Da8F8e70FfFb0cBA869F961", 
        ethereum.NORMAL_TIMELOCK)
    },
  },
  {
    symbol: "vPT-USDe",
    address: "0x62D9E2010Cff87Bae05B91d5E04605ef864ABc3B",
    expectedPrice: parseUnits("1.00026326", 18),
    expectedPriceAfterVIP: parseUnits("1.00046097", 18),
  },
  {
    symbol: "vsUSDe",
    address: "0x0792b9c60C728C1D2Fd6665b3D7A08762a9b28e0",
    expectedPrice: parseUnits("1.173747372540821593", 18),
    expectedPriceAfterVIP: parseUnits("1.173995309097795393", 18),
  },
  {
    symbol: "vezETH",
    address: "0xA854D35664c658280fFf27B6eDC6C4195c3229B3",
    expectedPrice: parseUnits("2658.9338837746224496", 18),
    expectedPriceAfterVIP: parseUnits("2658.846280146065974169", 18),
    postVIP: async function (resilientOracle: any, address: string) {
      await setMaxStalePeriodInChainlinkOracle(CHAINLINK_ORACLE, "0xbf5495Efe5DB9ce00f80364C8B423567e58d2110", "0x636A000262F6aA9e1F094ABF0aD8f645C44f641C", ethereum.NORMAL_TIMELOCK)
    },
  },
  {
    symbol: "vPT-weETH",
    address: "0x76697f8eaeA4bE01C678376aAb97498Ee8f80D5C",
    expectedPrice: parseUnits("2535.08175482", 18),
    postVIP: async function (resilientOracle: any, address: string) {
      const vtoken = new ethers.Contract(address, VTOKEN_ABI, ethers.provider);
      const underlying = await vtoken.underlying();
      const token = new ethers.Contract(underlying, ERC20_ABI, ethers.provider);
      await setMaxStalePeriod(resilientOracle, token);
    },
  },
  {
    symbol: "vpufETH",
    address: "0xE0ee5dDeBFe0abe0a4Af50299D68b74Cec31668e",
    expectedPrice: parseUnits("2653.2206967778723566", 18),
    preVIP: async function (resilientOracle: any, address: string) {
      await setRedstonePrice(
        REDSTONE_ORACLE, 
        "0xD9A442856C234a39a81a089C06451EBAa4306a72", 
        "0x76A495b0bFfb53ef3F0E94ef0763e03cE410835C", 
        ethereum.NORMAL_TIMELOCK,
      );
    },
  },
  {
    symbol: "vrsETH",
    address: "0xDB6C345f864883a8F4cae87852Ac342589E76D1B",
    expectedPrice: parseUnits("2646.2260006032432054", 18),
    expectedPriceAfterVIP: parseUnits("2646.628509873306393614", 18),
    postVIP: async function (resilientOracle: any, address: string) {
      await setMaxStalePeriodInChainlinkOracle(CHAINLINK_ORACLE, "0xA1290d69c65A6Fe4DF752f95823fae25cB99e5A7", "0x03c68933f7a3F76875C0bc670a58e69294cDFD01", ethereum.NORMAL_TIMELOCK)
    },
  },
  {
    symbol: "vweETH",
    address: "0xb4933AF59868986316Ed37fa865C829Eba2df0C7",
    expectedPrice: parseUnits("2707.859948124760766296", 18),
  },
  {
    symbol: "vwstETH",
    address: "0x4a240F0ee138697726C8a3E43eFE6Ac3593432CB",
    expectedPrice: parseUnits("3050.858367961193361526", 18),
  },
]

forking(22545550, async () => {
  const provider = ethers.provider;

  await impersonateAccount(ethereum.NORMAL_TIMELOCK);
  await setBalance(ethereum.NORMAL_TIMELOCK, ethers.utils.parseEther("1000000"));
  const resilientOracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
  describe("Pre-VIP behaviour", async () => {
    for (const price of prices) {
      it(`check ${price.symbol} price`, async () => {
        if (price.preVIP) {
          await price.preVIP(resilientOracle, price.address);
        }
        expect(await resilientOracle.getUnderlyingPrice(price.address)).to.equal(price.expectedPrice);
      });
    }
  });

  testForkedNetworkVipCommands("vip501", await vip501());

  describe("Post-VIP behaviour", async () => {
    for (const price of prices) {
      it(`check ${price.symbol} price`, async () => {
        if (price.postVIP) {
          await price.postVIP(resilientOracle, price.address);
        }
        expect(await resilientOracle.getUnderlyingPrice(price.address)).to.equal(price.expectedPriceAfterVIP || price.expectedPrice);
      });
    }
  })
});
