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

export const vip238 = () => {
  const meta = {
    version: "v2",
    title: "VIP-238 New Supply and Borrow Caps",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
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
    ProposalType.REGULAR,
  );
};
