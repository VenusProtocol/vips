export const loadMultisigTx = async (txName: string, networkName: string) => {
  const x = await import(`../proposals/${networkName}/${txName}.ts`);
  return x[txName]();
};

export const getSafeAddress = (networkName: string): string => {
  // Define Safe addresses for different networks here
  const safeAddresses: Record<string, string> = {
    // Sepolia network
    sepolia: "0x94fa6078b6b8a26f0b6edffbe6501b22a10470fb",
    // Add more networks and their corresponding Safe addresses as needed
  };

  if (networkName in safeAddresses) {
    return safeAddresses[networkName];
  } else {
    throw new Error(`Safe address for network ${networkName} is not defined.`);
  }
};
