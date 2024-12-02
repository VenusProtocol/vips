import govBscmainnetContracts from "@venusprotocol/governance-contracts/deployments/bscmainnet_addresses.json";
import govBsctestnetContracts from "@venusprotocol/governance-contracts/deployments/bsctestnet_addresses.json";
import ilBscmainnetDeployedContracts from "@venusprotocol/isolated-pools/deployments/bscmainnet_addresses.json";
import ilBsctestnetDeployedContracts from "@venusprotocol/isolated-pools/deployments/bsctestnet_addresses.json";
import ilEthereumDeployedContracts from "@venusprotocol/isolated-pools/deployments/ethereum_addresses.json";
import ilSepoliaDeployedContracts from "@venusprotocol/isolated-pools/deployments/sepolia_addresses.json";
import oracleBscmainnetContracts from "@venusprotocol/oracle/deployments/bscmainnet_addresses.json";
import oracleBsctestnetContracts from "@venusprotocol/oracle/deployments/bsctestnet_addresses.json";
import oracleEthereumContracts from "@venusprotocol/oracle/deployments/ethereum_addresses.json";
import oracleSepoliaContracts from "@venusprotocol/oracle/deployments/sepolia_addresses.json";
import tokenBridgeEthereumContracts from "@venusprotocol/token-bridge/deployments/ethereum_addresses.json";
import tokenBridgeOpbnbmainnetContracts from "@venusprotocol/token-bridge/deployments/opbnbmainnet_addresses.json";
import tokenBridgeOpbnbtestnetContracts from "@venusprotocol/token-bridge/deployments/opbnbtestnet_addresses.json";
import tokenBridgeSepoliaContracts from "@venusprotocol/token-bridge/deployments/sepolia_addresses.json";
import bscmainnetDeployedContracts from "@venusprotocol/venus-protocol/deployments/bscmainnet_addresses.json";
import bsctestnetDeployedContracts from "@venusprotocol/venus-protocol/deployments/bsctestnet_addresses.json";
import ethereumDeployedContracts from "@venusprotocol/venus-protocol/deployments/ethereum_addresses.json";
import opbnbmainnetDeployedContracts from "@venusprotocol/venus-protocol/deployments/opbnbmainnet_addresses.json";
import opbnbtestnetDeployedContracts from "@venusprotocol/venus-protocol/deployments/opbnbtestnet_addresses.json";
import sepoliaDeployedContracts from "@venusprotocol/venus-protocol/deployments/sepolia_addresses.json";
import { ethers } from "ethers";

export const ZERO_ADDRESS = ethers.constants.AddressZero;
export const ORACLE_BNB = "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB";

export const NETWORK_ADDRESSES = {
  bscmainnet: {
    DEFAULT_PROPOSER_ADDRESS: "0x97a32D4506F6A35De68e0680859cDF41D077a9a9",
    GOVERNOR_PROXY: govBscmainnetContracts.addresses.GovernorBravoDelegator,
    NORMAL_TIMELOCK: govBscmainnetContracts.addresses.NormalTimelock,
    FAST_TRACK_TIMELOCK: govBscmainnetContracts.addresses.FastTrackTimelock,
    CRITICAL_TIMELOCK: govBscmainnetContracts.addresses.CriticalTimelock,
    GUARDIAN: "0x1C2CAc6ec528c20800B2fe734820D87b581eAA6B",
    ETH_CHAINLINK_FEED: "0x9ef1B8c0E4F7dc8bF5719Ea496883DC6401d5b2e",
    USDT_CHAINLINK_FEED: "0xB97Ad0E74fa7d920791E90258A6E2085088b4320",
    CHAINLINK_ORACLE: oracleBscmainnetContracts.addresses.ChainlinkOracle,
    COMPTROLLER_LENS: bscmainnetDeployedContracts.addresses.ComptrollerLens,
    GENERIC_TEST_USER_ACCOUNT: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
    XVS_VAULT_PROXY: bscmainnetDeployedContracts.addresses.XVSVaultProxy,
    XVS: bscmainnetDeployedContracts.addresses.XVS,
    VAI_UNITROLLER: bscmainnetDeployedContracts.addresses.VaiUnitroller,
    VAI_MINT_USER_ACCOUNT: "0x2DDd1c54B7d32C773484D23ad8CB4F0251d330Fc",
    UNITROLLER: bscmainnetDeployedContracts.addresses.Unitroller,
    VAI: bscmainnetDeployedContracts.addresses.VAI,
    VTREASURY: bscmainnetDeployedContracts.addresses.VTreasury,
    POOL_REGISTRY: ilBscmainnetDeployedContracts.addresses.PoolRegistry,
    BINANCE_ORACLE: oracleBscmainnetContracts.addresses.BinanceOracle,
    RESILIENT_ORACLE: oracleBscmainnetContracts.addresses.ResilientOracle,
    REDSTONE_ORACLE: oracleBscmainnetContracts.addresses.RedStoneOracle,
  },
  bsctestnet: {
    DEFAULT_PROPOSER_ADDRESS: "0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706",
    GUARDIAN: "0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706",
    GOVERNOR_PROXY: govBsctestnetContracts.addresses.GovernorBravoDelegator,
    NORMAL_TIMELOCK: govBsctestnetContracts.addresses.NormalTimelock,
    FAST_TRACK_TIMELOCK: govBsctestnetContracts.addresses.FastTrackTimelock,
    CRITICAL_TIMELOCK: govBsctestnetContracts.addresses.CriticalTimelock,
    ETH_CHAINLINK_FEED: "0x143db3CEEfbdfe5631aDD3E50f7614B6ba708BA7",
    USDT_CHAINLINK_FEED: "0xEca2605f0BCF2BA5966372C99837b1F182d3D620",
    CHAINLINK_ORACLE: oracleBsctestnetContracts.addresses.ChainlinkOracle,
    COMPTROLLER_LENS: bsctestnetDeployedContracts.addresses.ComptrollerLens,
    GENERIC_TEST_USER_ACCOUNT: "0xB7314B8e69DCD32a72aC163679628117E90d3746",
    XVS_VAULT_PROXY: bsctestnetDeployedContracts.addresses.XVSVaultProxy,
    XVS: bsctestnetDeployedContracts.addresses.XVS,
    VAI_UNITROLLER: bsctestnetDeployedContracts.addresses.VaiUnitroller,
    VAI_MINT_USER_ACCOUNT: "0x6eACe20E1F89D0B24e5B295Af1802dfBc730B37D",
    UNITROLLER: bsctestnetDeployedContracts.addresses.Unitroller,
    VAI: bsctestnetDeployedContracts.addresses.VAI,
    VTREASURY: bsctestnetDeployedContracts.addresses.VTreasury,
    POOL_REGISTRY: ilBsctestnetDeployedContracts.addresses.PoolRegistry,
    BINANCE_ORACLE: oracleBsctestnetContracts.addresses.BinanceOracle,
    RESILIENT_ORACLE: oracleBsctestnetContracts.addresses.ResilientOracle,
    REDSTONE_ORACLE: oracleBsctestnetContracts.addresses.RedStoneOracle,
  },
  ethereum: {
    NORMAL_TIMELOCK: "0xd969E79406c35E80750aAae061D402Aab9325714",
    GUARDIAN: "0x285960C5B22fD66A736C7136967A3eB15e93CC67",
    VTREASURY: ethereumDeployedContracts.addresses.VTreasuryV8,
    POOL_REGISTRY: ilEthereumDeployedContracts.addresses.PoolRegistry,
    RESILIENT_ORACLE: oracleEthereumContracts.addresses.ResilientOracle,
    XVS: tokenBridgeEthereumContracts.addresses.XVS,
    XVS_VAULT_PROXY: ethereumDeployedContracts.addresses.XVSVaultProxy,
    GENERIC_TEST_USER_ACCOUNT: "0x700E5E41Ee18455540256C4e6F055a4CE9BdBd7C", // XVS Holder
    CHAINLINK_ORACLE: oracleEthereumContracts.addresses.ChainlinkOracle,
    REDSTONE_ORACLE: oracleEthereumContracts.addresses.RedStoneOracle,
    WETH: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    ENDPOINT: "0x66A71Dcef29A0fFBDBE3c6a460a3B5BC225Cd675",
    LZ_LIBRARY: "0x4D73AdB72bC3DD368966edD0f0b2148401A178E2",
    OMNICHAIN_GOVERNANCE_EXECUTOR: "0xd70ffB56E4763078b8B814C0B48938F35D83bE0C",
  },
  sepolia: {
    NORMAL_TIMELOCK: "0xc332F7D8D5eA72cf760ED0E1c0485c8891C6E0cF",
    GUARDIAN: "0x94fa6078b6b8a26F0B6EDFFBE6501B22A10470fB",
    CHAINLINK_ORACLE: oracleSepoliaContracts.addresses.ChainlinkOracle,
    RESILIENT_ORACLE: oracleSepoliaContracts.addresses.ResilientOracle,
    REDSTONE_ORACLE: oracleSepoliaContracts.addresses.RedStoneOracle,
    XVS: tokenBridgeSepoliaContracts.addresses.XVS,
    POOL_REGISTRY: ilSepoliaDeployedContracts.addresses.PoolRegistry,
    VTREASURY: sepoliaDeployedContracts.addresses.VTreasuryV8,
    XVS_VAULT_PROXY: sepoliaDeployedContracts.addresses.XVSVaultProxy,
    GENERIC_TEST_USER_ACCOUNT: "0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706",
    WETH: "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9",
    ENDPOINT: "0xae92d5aD7583AD66E49A0c67BAd18F6ba52dDDc1",
    LZ_LIBRARY: "0x3acaaf60502791d199a5a5f0b173d78229ebfe32",
    OMNICHAIN_GOVERNANCE_EXECUTOR: "0xD9B18a43Ee9964061c1A1925Aa907462F0249109",
  },
  opbnbtestnet: {
    NORMAL_TIMELOCK: "0x1c4e015Bd435Efcf4f58D82B0d0fBa8fC4F81120",
    GUARDIAN: "0xb15f6EfEbC276A3b9805df81b5FB3D50C2A62BDf",
    XVS: tokenBridgeOpbnbtestnetContracts.addresses.XVS,
    XVS_VAULT_PROXY: opbnbtestnetDeployedContracts.addresses.XVSVaultProxy,
    GENERIC_TEST_USER_ACCOUNT: "0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706",
    POOL_REGISTRY: "0x560eA4e1cC42591E9f5F5D83Ad2fd65F30128951",
    RESILIENT_ORACLE: "0xEF4e53a9A4565ef243A2f0ee9a7fc2410E1aA623",
    VTREASURY: "0x3370915301E8a6A6baAe6f461af703e2498409F3",
    BINANCE_ORACLE: "0x496B6b03469472572C47bdB407d5549b244a74F2",
    vWBNB_CORE: "0xD36a31AcD3d901AeD998da6E24e848798378474e",
    ENDPOINT: "0x83c73Da98cf733B03315aFa8758834b36a195b87",
    LZ_LIBRARY: "0x55370E0fBB5f5b8dAeD978BA1c075a499eB107B8",
    OMNICHAIN_GOVERNANCE_EXECUTOR: "0x0aa644c4408268E9fED5089A113470B6e706bc0C",
  },
  opbnbmainnet: {
    NORMAL_TIMELOCK: "0x10f504e939b912569Dca611851fDAC9E3Ef86819",
    GUARDIAN: "0xC46796a21a3A9FAB6546aF3434F2eBfFd0604207",
    XVS: tokenBridgeOpbnbmainnetContracts.addresses.XVS,
    XVS_VAULT_PROXY: opbnbmainnetDeployedContracts.addresses.XVSVaultProxy,
    GENERIC_TEST_USER_ACCOUNT: "0xa258a693A403b7e98fd05EE9e1558C760308cFC7",
    POOL_REGISTRY: "0x345a030Ad22e2317ac52811AC41C1A63cfa13aEe",
    RESILIENT_ORACLE: "0x8f3618c4F0183e14A218782c116fb2438571dAC9",
    VTREASURY: "0xDDc9017F3073aa53a4A8535163b0bf7311F72C52",
    BINANCE_ORACLE: "0xB09EC9B628d04E1287216Aa3e2432291f50F9588",
    ENDPOINT: "0xb6319cC6c8c27A8F5dAF0dD3DF91EA35C4720dd7",
    LZ_LIBRARY: "0x38dE71124f7a447a01D67945a51eDcE9FF491251",
    OMNICHAIN_GOVERNANCE_EXECUTOR: "0x82598878Adc43F1013A27484E61ad663c5d50A03",
  },
  arbitrumsepolia: {
    NORMAL_TIMELOCK: "0x794BCA78E606f3a462C31e5Aba98653Efc1322F8",
    GUARDIAN: "0x1426A5Ae009c4443188DA8793751024E358A61C2",
    CHAINLINK_ORACLE: "0xeDd02c7FfA31490b4107e8f2c25e9198a04F9E45",
    RESILIENT_ORACLE: "0x6708bAd042916B47311c8078b29d7f432342102F",
    REDSTONE_ORACLE: "0x15058891ca0c71Bd724b873c41596A682420613C",
    XVS: "0x877Dc896e7b13096D3827872e396927BbE704407",
    XVS_VAULT_PROXY: "0x407507DC2809D3aa31D54EcA3BEde5C5c4C8A17F",
    POOL_REGISTRY: "0xf93Df3135e0D555185c0BC888073374cA551C5fE",
    VTREASURY: "0x4e7ab1fD841E1387Df4c91813Ae03819C33D5bdB",
    GENERIC_TEST_USER_ACCOUNT: "0x6f057A858171e187124ddEDF034dAc63De5dE5dB",
    ENDPOINT: "0x6098e96a28E02f27B1e6BD381f870F1C8Bd169d3",
    LZ_LIBRARY: "0x88866E5A296FffA511EF8011CB1BBd4d01Cd094F",
    OMNICHAIN_GOVERNANCE_EXECUTOR: "0xcf3e6972a8e9c53D33b642a2592938944956f138",
  },
  arbitrumone: {
    NORMAL_TIMELOCK: "0x4b94589Cc23F618687790036726f744D602c4017",
    GUARDIAN: "0x14e0E151b33f9802b3e75b621c1457afc44DcAA0",
    CHAINLINK_ORACLE: "0x9cd9Fcc7E3dEDA360de7c080590AaD377ac9F113",
    REDSTONE_ORACLE: "0xF792C4D3BdeF534D6d1dcC305056D00C95453dD6",
    RESILIENT_ORACLE: "0xd55A98150e0F9f5e3F6280FC25617A5C93d96007",
    XVS: "0xc1Eb7689147C81aC840d4FF0D298489fc7986d52",
    XVS_VAULT_PROXY: "0x8b79692AAB2822Be30a6382Eb04763A74752d5B4",
    POOL_REGISTRY: "0x382238f07Bc4Fe4aA99e561adE8A4164b5f815DA",
    VTREASURY: "0x8a662ceAC418daeF956Bc0e6B2dd417c80CDA631",
    GENERIC_TEST_USER_ACCOUNT: "0x6f057A858171e187124ddEDF034dAc63De5dE5dB",
    ENDPOINT: "0x3c2269811836af69497E5F486A85D7316753cf62",
    LZ_LIBRARY: "0x4D73AdB72bC3DD368966edD0f0b2148401A178E2",
    OMNICHAIN_GOVERNANCE_EXECUTOR: "0xc1858cCE6c28295Efd3eE742795bDa316D7c7526",
  },
  zksyncsepolia: {
    NORMAL_TIMELOCK: "", // To be deployed
    GUARDIAN: "0xa2f83de95E9F28eD443132C331B6a9C9B7a9F866",
    GENERIC_TEST_USER_ACCOUNT: "0x6f057A858171e187124ddEDF034dAc63De5dE5dB",
    RESILIENT_ORACLE: "0x748853B3bE26c46b4562Fd314dfb82708F395bDf",
    CHAINLINK_ORACLE: "0x0DFf10dCdb3526010Df01ECc42076C25C27F8323",
    XVS: "0x3AeCac43A2ebe5D8184e650403bf9F656F9D1cfA",
    XVS_VAULT_PROXY: "0x825f9EE3b2b1C159a5444A111A70607f3918564e",
    POOL_REGISTRY: "0x1401404e6279BB8C06E5E3999eCA3e2008B46A76",
    VTREASURY: "0x943eBE4460a12F551D60A68f510Ea10CD8d564BA",
  },
  zksyncmainnet: {
    NORMAL_TIMELOCK: "", // To be deployed
    GUARDIAN: "0x751Aa759cfBB6CE71A43b48e40e1cCcFC66Ba4aa",
    VTREASURY: "0xB2e9174e23382f7744CebF7e0Be54cA001D95599",
    XVS: "0xD78ABD81a3D57712a3af080dc4185b698Fe9ac5A",
    RESILIENT_ORACLE: "0xDe564a4C887d5ad315a19a96DC81991c98b12182",
    CHAINLINK_ORACLE: "0x4FC29E1d3fFFbDfbf822F09d20A5BE97e59F66E5",
    POOL_REGISTRY: "0xFD96B926298034aed9bBe0Cca4b651E41eB87Bc4",
    XVS_VAULT_PROXY: "0xbbB3C88192a5B0DB759229BeF49DcD1f168F326F",
    GENERIC_TEST_USER_ACCOUNT: "0x6f057A858171e187124ddEDF034dAc63De5dE5dB",
  },
  opsepolia: {
    NORMAL_TIMELOCK: "", // To be deployed
    VTREASURY: "0x5A1a12F47FA7007C9e23cf5e025F3f5d3aC7d755",
    GUARDIAN: "0xd57365EE4E850e881229e2F8Aa405822f289e78d",
    XVS_VAULT_PROXY: "0x4d344e48F02234E82D7D1dB84d0A4A18Aa43Dacc",
    XVS: "0x789482e37218f9b26d8D9115E356462fA9A37116",
    GENERIC_TEST_USER_ACCOUNT: "0x6f057A858171e187124ddEDF034dAc63De5dE5dB",
    RESILIENT_ORACLE: "0x6c01ECa2B5C97F135406a3A5531445A7d977D28e",
    CHAINLINK_ORACLE: "0x493C3f543AEa37EefF17D823f27Cb1feAB9f3143",
    POOL_REGISTRY: "0x6538C861C7A6997602311342657b9143dD9E8152",
  },
  opmainnet: {
    NORMAL_TIMELOCK: "", // To be deployed
    VTREASURY: "0x104c01EB7b4664551BE6A9bdB26a8C5c6Be7d3da",
    GUARDIAN: "0x2e94dd14E81999CdBF5deDE31938beD7308354b3",
    RESILIENT_ORACLE: "0x21FC48569bd3a6623281f55FC1F8B48B9386907b",
    CHAINLINK_ORACLE: "0x1076e5A60F1aC98e6f361813138275F1179BEb52",
    REDSTONE_ORACLE: "0x7478e4656F6CCDCa147B6A7314fF68d0C144751a",
    XVS: "0x4a971e87ad1F61f7f3081645f52a99277AE917cF",
    XVS_VAULT_PROXY: "0x133120607C018c949E91AE333785519F6d947e01",
    GENERIC_TEST_USER_ACCOUNT: "0x6f057A858171e187124ddEDF034dAc63De5dE5dB",
    POOL_REGISTRY: "0x147780799840d541C1d7c998F0cbA996d11D62bb",
  },
  basesepolia: {
    GUARDIAN: "0xdf3b635d2b535f906BB02abb22AED71346E36a00",
    VTREASURY: "0x07e880DaA6572829cE8ABaaf0f5323A4eFC417A6",
    RESILIENT_ORACLE: "0xC34871C982cf0Bc6e7aCa2c2670Bc319bDA1C744",
    CHAINLINK_ORACLE: "0x801aB33A69AD867500fbCda7b3dB66C73151494b",
    XVS_VAULT_PROXY: "0x9b5D0aDfCEcC8ed422d714EcbcE2FFA436e269B8",
    XVS: "0xE657EDb5579B82135a274E85187927C42E38C021",
    GENERIC_TEST_USER_ACCOUNT: "0x6f057A858171e187124ddEDF034dAc63De5dE5dB",
    REDSTONE_ORACLE: "0x8267FE3f75E0A37ee34e113E767F9C9727206838",
    POOL_REGISTRY: "0xD5D9f24a5EB83e81F2188b1F2a8c217EEf56dFa5",
  },
};
