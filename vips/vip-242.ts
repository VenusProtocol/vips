import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

export const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";

interface Caps {
  symbol: string;
  vToken: string;
  supplyCap?: string;
  borrowCap?: string;
  decimals: number;
}

export const caps: Caps[] = [
  {
    symbol: "vWBETH",
    vToken: "0x6CFdEc747f37DAf3b87a35a1D9c8AD3063A1A8A0",
    decimals: 18,
    supplyCap: "40000",
    borrowCap: "1000",
  },
  {
    symbol: "vUSDT",
    vToken: "0xfD5840Cd36d94D7229439859C0112a4185BC0255",
    decimals: 18,
    supplyCap: "400000000",
    borrowCap: "300000000",
  },
  {
    symbol: "vDOT",
    vToken: "0x1610bc33319e9398de5f57B33a5b184c806aD217",
    decimals: 18,
    supplyCap: "1200000",
    borrowCap: "400000",
  },
  {
    symbol: "vAAVE",
    vToken: "0x26DA28954763B92139ED49283625ceCAf52C6f94",
    decimals: 18,
    supplyCap: "20000",
    borrowCap: "2000",
  },
  {
    symbol: "vLTC",
    vToken: "0x57A5297F2cB2c0AaC9D554660acd6D385Ab50c6B",
    decimals: 18,
    supplyCap: "120000",
    borrowCap: "10000",
  },
  {
    symbol: "vMATIC",
    vToken: "0x5c9476FcD6a4F9a3654139721c949c2233bBbBc8",
    decimals: 18,
    supplyCap: "10000000",
    borrowCap: "1000000",
  },
  {
    symbol: "vBCH",
    vToken: "0x5F0388EBc2B94FA8E123F404b79cCF5f40b29176",
    decimals: 18,
    supplyCap: "10000",
    borrowCap: "1000",
  },
  {
    symbol: "vLINK",
    vToken: "0x650b940a1033B8A1b1873f78730FcFC73ec11f1f",
    decimals: 18,
    supplyCap: "900000",
    borrowCap: "80000",
  },
  {
    symbol: "vADA",
    vToken: "0x9A0AF7FDb2065Ce470D72664DE73cAE409dA28Ec",
    decimals: 18,
    borrowCap: "2000000",
  },
  {
    symbol: "vXRP",
    vToken: "0xB248a295732e0225acd3337607cc01068e3b9c10",
    decimals: 18,
    supplyCap: "24000000",
    borrowCap: "3000000",
  },
  {
    symbol: "vTRX",
    vToken: "0xC5D3466aA484B040eE977073fcF337f2c00071c1",
    decimals: 6,
    borrowCap: "6000000",
  },
  {
    symbol: "vDOGE",
    vToken: "0xec3422Ef92B2fb59e84c8B02Ba73F1fE84Ed8D71",
    decimals: 8,
    supplyCap: "80000000",
    borrowCap: "4500000",
  },
  {
    symbol: "vETH",
    vToken: "0xf508fCD89b8bd15579dc79A6827cB4686A3592c8",
    decimals: 18,
    supplyCap: "100000",
  },
  {
    symbol: "vFIL",
    vToken: "0xf91d58b5aE142DAcC749f58A49FCBac340Cb0343",
    decimals: 18,
    borrowCap: "90000",
  },
];

const borrowCapsTokens = caps
  .map(cap => {
    if (!cap.borrowCap) return null;
    return cap.vToken;
  })
  .filter(command => command);

const supplyCapsTokens = caps
  .map(cap => {
    if (!cap.supplyCap) return null;
    return cap.vToken;
  })
  .filter(command => command);

const borrowCapsValues = caps
  .map(cap => {
    if (!cap.borrowCap) return null;
    return parseUnits(cap.borrowCap, cap.decimals);
  })
  .filter(command => command);

const supplyCapsValues = caps
  .map(cap => {
    if (!cap.supplyCap) return null;
    return parseUnits(cap.supplyCap, cap.decimals);
  })
  .filter(command => command);

export const vip242 = () => {
  const meta = {
    version: "v2",
    title: "VIP-242 Risk Parameters Adjustments",
    description: `This VIP will perform the following Risk Parameter actions as per Chaos Labs’ latest recommendations in this Venus community forum publication: [Risk Parameter Updates 01/16/2024](https://community.venus.io/t/chaos-labs-risk-parameter-updates-01-16-24/4055).

- [USDT (Core pool)](https://bscscan.com/address/0xfD5840Cd36d94D7229439859C0112a4185BC0255)
    - Decrease supply cap, from 736.3M USDT to 400M USDT
    - Increase borrow cap, from 245.5M USDT to 300M USDT
- [WBETH (Core pool)](https://bscscan.com/address/0x6CFdEc747f37DAf3b87a35a1D9c8AD3063A1A8A0)
    - Increase supply cap, from 27K WBETH to 40K WBETH
    - Decrease borrow cap, from 2.2K WBETH to 1K WBETH
- [DOT (Core pool)](https://bscscan.com/address/0x1610bc33319e9398de5f57B33a5b184c806aD217)
    - Decrease supply cap, from 2,200,000 DOT to 1,200,000 DOT
    - Decrease borrow cap, from 925,000 DOT to 400,000 DOT
- [AAVE (Core pool)](https://bscscan.com/address/0x26DA28954763B92139ED49283625ceCAf52C6f94)
    - Decrease supply cap, from 30,000 AAVE to 20,000 AAVE
    - Decrease borrow cap, from 10,000 AAVE to 2,000 AAVE
- [LTC (Core pool)](https://bscscan.com/address/0x57A5297F2cB2c0AaC9D554660acd6D385Ab50c6B)
    - Decrease supply cap, from 254,100 LTC to 120,000 LTC
    - Decrease borrow cap, from 25,400 LTC to 10,000 LTC
- [MATIC (Core pool)](https://bscscan.com/address/0x5c9476FcD6a4F9a3654139721c949c2233bBbBc8)
    - Decrease supply cap, from 16,000,000 MATIC to 10,000,000 MATIC
    - Decrease borrow cap, from 3,000,000 MATIC to 1,000,000 MATIC
- [BCH (Core pool)](https://bscscan.com/address/0x5F0388EBc2B94FA8E123F404b79cCF5f40b29176)
    - Decrease supply cap, from 26,800 BCH to 10,000 BCH
    - Decrease borrow cap, from 9,000 BCH to 1,000 BCH
- [LINK (Core pool)](https://bscscan.com/address/0x650b940a1033B8A1b1873f78730FcFC73ec11f1f)
    - Decrease supply cap, from 2,400,000 LINK to 900,000 LINK
    - Decrease borrow cap, from 238,800 LINK to 80,000 LINK
- [ADA (Core pool)](https://bscscan.com/address/0x9A0AF7FDb2065Ce470D72664DE73cAE409dA28Ec)
    - Decrease borrow cap, from 14,400,000 ADA to 2,000,000 ADA
- [XRP (Core pool)](https://bscscan.com/address/0xB248a295732e0225acd3337607cc01068e3b9c10)
    - Decrease supply cap, from 35,900,000 XRP to 24,000,000 XRP
    - Decrease borrow cap, from 4,200,000 XRP to 3,000,000 XRP
- [TRX (Core pool)](https://bscscan.com/address/0xC5D3466aA484B040eE977073fcF337f2c00071c1)
    - Decrease borrow cap, from 10,000,000 XRP to 6,000,000 XRP
- [DOGE (Core pool)](https://bscscan.com/address/0xec3422Ef92B2fb59e84c8B02Ba73F1fE84Ed8D71)
    - Decrease supply cap, from 157,700,000 DOGE to 80,000,000 DOGE
    - Decrease borrow cap, from 23,200,000 DOGE to 4,500,000 DOGE
- [ETH (Core pool)](https://bscscan.com/address/0xf508fCD89b8bd15579dc79A6827cB4686A3592c8)
    - Decrease supply cap, from 222,300 ETH to 100,000 ETH
- [FIL (Core pool)](https://bscscan.com/address/0xf91d58b5aE142DAcC749f58A49FCBac340Cb0343)
    - Decrease borrow cap, from 180,000 FIL to 90,000 FIL

Complete analysis and details of these recommendations are available in the above publication.

VIP simulation: [https://github.com/VenusProtocol/vips/pull/177](https://github.com/VenusProtocol/vips/pull/177)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [borrowCapsTokens, borrowCapsValues],
      },
      {
        target: COMPTROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [supplyCapsTokens, supplyCapsValues],
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};
