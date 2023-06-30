import { defaultAbiCoder } from "@ethersproject/abi";
import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { NumberLike } from "@nomicfoundation/hardhat-network-helpers/dist/src/types";
import { expect } from "chai";
import { ContractInterface, TransactionResponse } from "ethers";
import { ethers, network } from "hardhat";

import { Command, Proposal, ProposalMeta, ProposalType } from "./types";
import VENUS_CHAINLINK_ORACLE_ABI from "./vip-framework/abi/VenusChainlinkOracle.json";
import BINANCE_ORACLE_ABI from "./vip-framework/abi/binanceOracle.json";
import CHAINLINK_ORACLE_ABI from "./vip-framework/abi/chainlinkOracle.json";
import COMPTROLLER_ABI from "./vip-framework/abi/comptroller.json";

export async function setForkBlock(blockNumber: number) {
  await network.provider.request({
    method: "hardhat_reset",
    params: [
      {
        forking: {
          jsonRpcUrl: process.env.BSC_ARCHIVE_NODE,
          blockNumber: blockNumber,
        },
      },
    ],
  });
}

export function getCalldatas({ signatures, params }: { signatures: string[]; params: any[][] }) {
  return params.map((args: any[], i: number) => {
    const fragment = ethers.utils.FunctionFragment.from(signatures[i]);
    return defaultAbiCoder.encode(fragment.inputs, args);
  });
}

export const initMainnetUser = async (user: string, balance: NumberLike) => {
  await impersonateAccount(user);
  await setBalance(user, balance);
  return ethers.getSigner(user);
};

export const makeProposal = (commands: Command[], meta: ProposalMeta, type: ProposalType): Proposal => {
  return {
    signatures: commands.map(cmd => cmd.signature),
    targets: commands.map(cmd => cmd.target),
    params: commands.map(cmd => cmd.params),
    values: commands.map(cmd => cmd.value ?? "0"),
    meta,
    type,
  };
};

export const setMaxStalePeriodInOracle = async (
  comptrollerAddress: string,
  maxStalePeriodInSeconds: number = 31536000 /* 1 year */,
) => {
  const provider = ethers.provider;
  const comptroller = new ethers.Contract(comptrollerAddress, COMPTROLLER_ABI, provider);

  const oracle = new ethers.Contract(await comptroller.oracle(), VENUS_CHAINLINK_ORACLE_ABI, provider);
  const oracleAdmin = await initMainnetUser(await oracle.admin(), ethers.utils.parseEther("1.0"));

  const tx = await oracle.connect(oracleAdmin).setMaxStalePeriod(maxStalePeriodInSeconds);
  await tx.wait();
};

export const setMaxStalePeriodInBinanceOracle = async (
  binanceOracleAddress: string,
  assetSymbol: string,
  maxStalePeriodInSeconds: number = 31536000 /* 1 year */,
) => {
  const oracle = await ethers.getContractAt(BINANCE_ORACLE_ABI, binanceOracleAddress);
  const oracleAdmin = await initMainnetUser(await oracle.owner(), ethers.utils.parseEther("1.0"));

  const tx = await oracle.connect(oracleAdmin).setMaxStalePeriod(assetSymbol, maxStalePeriodInSeconds);
  await tx.wait();
};

export const setMaxStalePeriodInChainlinkOracle = async (
  chainlinkOracleAddress: string,
  asset: string,
  feed: string,
  admin: string,
  maxStalePeriodInSeconds: number = 31536000 /* 1 year */,
) => {
  const provider = ethers.provider;

  const oracle = new ethers.Contract(chainlinkOracleAddress, CHAINLINK_ORACLE_ABI, provider);
  const oracleAdmin = await initMainnetUser(admin, ethers.utils.parseEther("1.0"));

  const tx = await oracle.connect(oracleAdmin).setTokenConfig({
    asset,
    feed,
    maxStalePeriod: maxStalePeriodInSeconds,
  });
  await tx.wait();
};

export const expectEvents = async (
  txResponse: TransactionResponse,
  abis: ContractInterface[],
  expectedEvents: string[],
  expectedCounts: number[],
) => {
  const getNamedEvents = (abi: ContractInterface) => {
    const iface = new ethers.utils.Interface(abi);
    return txResponse.events
      .map(it => {
        try {
          return iface.parseLog(it).name;
        } catch (error) {
          error; // shhh
        }
      })
      .filter(Boolean);
  };

  const namedEvents = abis.flatMap(getNamedEvents);

  for (let i = 0; i < expectedEvents.length; ++i) {
    expect(
      namedEvents.filter(it => it === expectedEvents[i]),
      `expected a differnt number of ${expectedEvents[i]} events`,
    ).to.have.lengthOf(expectedCounts[i]);
  }
};

export const proposalSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    signatures: {
      type: "array",
      items: {
        type: "string",
      },
    },
    targets: {
      type: "array",
      items: {
        type: "string",
      },
    },
    params: {
      type: "array",
      items: {
        type: "array",
      },
    },
    values: {
      type: "array",
      items: {
        type: ["string", "number"],
      },
    },
    meta: {
      type: "object",
    },
    type: {
      type: "number",
    },
  },
  required: ["signatures", "targets", "params", "values", "meta", "type"],
};
