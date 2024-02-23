import { defaultAbiCoder } from "@ethersproject/abi";
import { TransactionResponse } from "@ethersproject/providers";
import { impersonateAccount, mine, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { NumberLike } from "@nomicfoundation/hardhat-network-helpers/dist/src/types";
import { expect } from "chai";
import { ContractInterface } from "ethers";
import { ethers, network } from "hardhat";

import { NETWORK_ADDRESSES } from "./networkAddresses";
import { Command, Proposal, ProposalMeta, ProposalType, TokenConfig } from "./types";
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
          jsonRpcUrl: process.env[`ARCHIVE_NODE_${process.env.FORKED_NETWORK}`],
          blockNumber: blockNumber,
        },
      },
    ],
  });
}

export function getCalldatas({ signatures, params }: { signatures: string[]; params: any[][] }) {
  return params.map((args: any[], i: number) => {
    if (signatures[i] === "") {
      return "0x";
    }
    const fragment = ethers.utils.FunctionFragment.from(signatures[i]);
    return defaultAbiCoder.encode(fragment.inputs, args);
  });
}

export const initMainnetUser = async (user: string, balance: NumberLike) => {
  await impersonateAccount(user);
  await setBalance(user, balance);
  return ethers.getSigner(user);
};

export const makeProposal = (commands: Command[], meta?: ProposalMeta, type?: ProposalType): Proposal => {
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
  const overrideSymbol = await oracle.symbols(assetSymbol);

  if (overrideSymbol.length > 0) {
    assetSymbol = overrideSymbol;
  }

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
  const networkSpecificChainlinkOracle = NETWORK_ADDRESSES[process.env.FORKED_NETWORK].CHAINLINK_ORACLE;

  // skip execution of this function if input oracle address is really not of chainlinkOracleAddress
  if (chainlinkOracleAddress != networkSpecificChainlinkOracle) return;

  const provider = ethers.provider;

  const oracle = new ethers.Contract(chainlinkOracleAddress, CHAINLINK_ORACLE_ABI, provider);
  const oracleAdmin = await initMainnetUser(admin, ethers.utils.parseEther("1.0"));

  if (feed === ethers.constants.AddressZero) {
    feed = (await oracle.tokenConfigs(asset)).feed;
    console.log(feed);

    if (feed === ethers.constants.AddressZero) {
      return;
    }
  }
  console.log(maxStalePeriodInSeconds);

  await oracle.connect(oracleAdmin).setTokenConfig({
    asset,
    feed,
    maxStalePeriod: maxStalePeriodInSeconds,
  });
  console.log((await oracle.getPrice(asset)).toString());
  // await tx.wait();
};

export const setMaxStalePeriod = async (
  resilientOracle: Contract,
  underlyingAsset: Contract,
  maxStalePeriodInSeconds: number = 31536000 /* 1 year */,
) => {
  const binanceOracle = NETWORK_ADDRESSES[process.env.FORKED_NETWORK].BINANCE_ORACLE;
  const normalTimelock = NETWORK_ADDRESSES[process.env.FORKED_NETWORK].NORMAL_TIMELOCK;

  const tokenConfig: TokenConfig = await resilientOracle.getTokenConfig(underlyingAsset.address);
  if (tokenConfig.asset !== ethers.constants.AddressZero) {
    const mainOracle = tokenConfig.oracles[0];
    if (mainOracle === binanceOracle) {
      console.log("binanceOracle");
      const symbol = await underlyingAsset.symbol();
      await setMaxStalePeriodInBinanceOracle(binanceOracle, symbol, maxStalePeriodInSeconds);
    } else {
      console.log("chainlink", maxStalePeriodInSeconds);

      await setMaxStalePeriodInChainlinkOracle(
        mainOracle,
        underlyingAsset.address,
        ethers.constants.AddressZero,
        normalTimelock,
        maxStalePeriodInSeconds,
      );
    }
  }
  await mine(100);
};

export const expectEvents = async (
  txResponse: TransactionResponse,
  abis: ContractInterface[],
  expectedEvents: string[],
  expectedCounts: number[],
) => {
  const receipt = await txResponse.wait();
  const getNamedEvents = (abi: ContractInterface) => {
    const iface = new ethers.utils.Interface(abi);
    return receipt.events
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

export const expectEventWithParams = async (
  txResponse: TransactionResponse,
  abi: ContractInterface,
  expectedEvent: string,
  expectedParams: any[], // Array of expected parameters
) => {
  const receipt = await txResponse.wait();
  const iface = new ethers.utils.Interface(abi);

  // Extract the events that match the expected event name
  const matchingEvents = receipt.events
    .map(event => {
      try {
        return iface.parseLog(event);
      } catch (error) {
        return null; // Ignore events that do not match the ABI
      }
    })
    .filter(parsedEvent => parsedEvent && parsedEvent.name === expectedEvent);

  // Check each event's parameters
  matchingEvents.forEach((event, index) => {
    expect(
      event.args[index],
      `Parameters of event ${expectedEvent} did not match at instance ${index + 1}`,
    ).to.deep.equal(expectedParams[index]);
  });
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
interface AssetConfig {
  name: string;
  address: string;
  feed: string;
}

const BNB_MAINNET_ASSETS: AssetConfig[] = [
  {
    name: "USDC",
    address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    feed: "0x51597f405303C4377E36123cBc172b13269EA163",
  },
  {
    name: "USDT",
    address: "0x55d398326f99059fF775485246999027B3197955",
    feed: "0xb97ad0e74fa7d920791e90258a6e2085088b4320",
  },
  {
    name: "BUSD",
    address: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
    feed: "0xcbb98864ef56e9042e7d2efef76141f15731b82f",
  },
  {
    name: "SXP",
    address: "0x47BEAd2563dCBf3bF2c9407fEa4dC236fAbA485A",
    feed: "0xe188a9875af525d25334d75f3327863b2b8cd0f1",
  },
  {
    name: "XVS",
    address: "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63",
    feed: "0xbf63f430a79d4036a5900c19818aff1fa710f206",
  },
  {
    name: "BTCB",
    address: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
    feed: "0x264990fbd0a4796a3e3d8e37c4d5f87a3aca5ebf",
  },
  {
    name: "ETH",
    address: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
    feed: "0x9ef1b8c0e4f7dc8bf5719ea496883dc6401d5b2e",
  },
  {
    name: "LTC",
    address: "0x4338665CBB7B2485A8855A139b75D5e34AB0DB94",
    feed: "0x74e72f37a8c415c8f1a98ed42e78ff997435791d",
  },
  {
    name: "XRP",
    address: "0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE",
    feed: "0x93a67d414896a280bf8ffb3b389fe3686e014fda",
  },
  {
    name: "BCH",
    address: "0x8fF795a6F4D97E7887C79beA79aba5cc76444aDf",
    feed: "0x43d80f616daf0b0b42a928eed32147dc59027d41",
  },
  {
    name: "DOT",
    address: "0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402",
    feed: "0xc333eb0086309a16aa7c8308dfd32c8bba0a2592",
  },
  {
    name: "LINK",
    address: "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD",
    feed: "0xca236e327f629f9fc2c30a4e95775ebf0b89fac8",
  },
  {
    name: "DAI",
    address: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",
    feed: "0x132d3C0B1D2cEa0BC552588063bdBb210FDeecfA",
  },
  {
    name: "FIL",
    address: "0x0D8Ce2A99Bb6e3B7Db580eD848240e4a0F9aE153",
    feed: "0xe5dbfd9003bff9df5feb2f4f445ca00fb121fb83",
  },
  {
    name: "BETH",
    address: "0x250632378E573c6Be1AC2f97Fcdf00515d0Aa91B",
    feed: "0x2a3796273d47c4ed363b361d3aefb7f7e2a13782",
  },
  {
    name: "ADA",
    address: "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47",
    feed: "0xa767f745331D267c7751297D982b050c93985627",
  },
  {
    name: "DOGE",
    address: "0xbA2aE424d960c26247Dd6c32edC70B295c744C43",
    feed: "0x3ab0a0d137d4f946fbb19eecc6e92e64660231c8",
  },
  {
    name: "MATIC",
    address: "0xCC42724C6683B7E57334c4E856f4c9965ED682bD",
    feed: "0x7ca57b0ca6367191c94c8914d7df09a57655905f",
  },
  {
    name: "CAKE",
    address: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
    feed: "0xb6064ed41d4f67e353768aa239ca86f4f73665a1",
  },
  {
    name: "AAVE",
    address: "0xfb6115445Bff7b52FeB98650C87f44907E58f802",
    feed: "0xa8357bf572460fc40f4b0acacbb2a6a61c89f475",
  },
  {
    name: "TUSD",
    address: "0x14016E85a25aeb13065688cAFB43044C2ef86784",
    feed: "0xa3334a9762090e827413a7495afece76f41dfc06",
  },
  {
    name: "TRX",
    address: "0x85EAC5Ac2F758618dFa09bDbe0cf174e7d574D5B",
    feed: "0xf4c5e535756d11994fcbb12ba8add0192d9b88be",
  },
  {
    name: "TRX",
    address: "0xCE7de646e7208a4Ef112cb6ed5038FA6cC6b12e3",
    feed: "0xf4c5e535756d11994fcbb12ba8add0192d9b88be",
  },
  {
    name: "BNB",
    address: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
    feed: "0x0567f2323251f0aab15c8dfb1967e4e8a7d42aee",
  },
  {
    name: "VAI",
    address: "0x4BD17003473389A42DAF6a0a729f6Fdb328BbBd7",
    feed: "0x058316f8Bb13aCD442ee7A216C7b60CFB4Ea1B53",
  },

  {
    name: "USDT",
    address: "0x55d398326f99059ff775485246999027b3197955",
    feed: "0xB97Ad0E74fa7d920791E90258A6E2085088b4320",
  },

  {
    name: "USDC",
    address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
    feed: "0x51597f405303C4377E36123cBc172b13269EA163",
  },
  {
    name: "TUSD_NEW",
    address: "0x40af3827f39d0eacbf4a168f8d4ee67c121d11c9",
    feed: "0xa3334A9762090E827413A7495AfeCE76F41dFc06",
  },
];

export const setMaxStaleCoreAssets = async (chainlinkAddress: string, admin: string) => {
  for (const asset of BNB_MAINNET_ASSETS) {
    await setMaxStalePeriodInChainlinkOracle(chainlinkAddress, asset.address, asset.feed, admin);
  }
};
