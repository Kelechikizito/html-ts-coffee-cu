import {
  createWalletClient,
  createPublicClient,
  custom,
  parseEther,
  defineChain,
  formatEther,
  WalletClient,
  PublicClient,
  Chain,
  Address,
} from "viem";
// import "viem/window";
import { contractAddress, abi } from "./constants-ts.ts";

// Get DOM elements with type assertions
const connectButton = document.getElementById(
  "connectButton"
) as HTMLButtonElement;
const fundButton = document.getElementById("fundButton") as HTMLButtonElement;
const balanceButton = document.getElementById(
  "balanceButton"
) as HTMLButtonElement;
const ethAmountInput = document.getElementById("ethAmount") as HTMLInputElement;
const withdrawButton = document.getElementById(
  "withdrawButton"
) as HTMLButtonElement;

// Declare variables with types
let walletClient: WalletClient | undefined;
let publicClient: PublicClient | undefined;

// Extend Window interface to include ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

console.log("Billionaire");

const connect = async (): Promise<void> => {
  if (typeof window.ethereum !== "undefined") {
    walletClient = createWalletClient({
      transport: custom(window.ethereum),
    });
    await walletClient.requestAddresses();
    connectButton.innerHTML = "Connected";
  } else {
    connectButton.innerHTML = "Please install Metamask";
  }
};

const fund = async (): Promise<void> => {
  const ethAmount = ethAmountInput.value;
  console.log(`Funding with ${ethAmount} ETH...`);

  if (typeof window.ethereum !== "undefined") {
    walletClient = createWalletClient({
      transport: custom(window.ethereum),
    });
    const [connectedAccount] = await walletClient.requestAddresses();
    const currentChain = await getCurrentChain(walletClient);

    publicClient = createPublicClient({
      transport: custom(window.ethereum),
    });
    const { request } = await publicClient.simulateContract({
      address: contractAddress,
      abi: abi,
      functionName: "fund",
      account: connectedAccount as Address,
      chain: currentChain,
      value: parseEther(ethAmount),
    });
    console.log(request);
    const hash = await walletClient.writeContract(request);
    console.log(hash);
  } else {
    connectButton.innerHTML = "Please install Metamask";
  }
};

const getCurrentChain = async (client: WalletClient): Promise<Chain> => {
  const chainId = await client.getChainId();

  const currentChain = defineChain({
    id: chainId,
    name: "Custom Chain",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: ["http://localhost:8545"],
      },
    },
  });
  return currentChain;
};

const getBalance = async (): Promise<void> => {
  if (typeof window.ethereum !== "undefined") {
    publicClient = createPublicClient({
      transport: custom(window.ethereum),
    });
    const balance = await publicClient.getBalance({
      address: contractAddress as Address,
    });
    console.log(formatEther(balance));
  }
};

const withdraw = async (): Promise<void> => {
  console.log("Withdrawing...");

  if (typeof window.ethereum !== "undefined") {
    walletClient = createWalletClient({
      transport: custom(window.ethereum),
    });
    const [connectedAccount] = await walletClient.requestAddresses();
    const currentChain = await getCurrentChain(walletClient);

    publicClient = createPublicClient({
      transport: custom(window.ethereum),
    });
    const { request } = await publicClient.simulateContract({
      address: contractAddress,
      abi: abi,
      functionName: "withdraw",
      account: connectedAccount as Address,
      chain: currentChain,
    });
    console.log(request);
    const hash = await walletClient.writeContract(request);
    console.log(hash);
  } else {
    connectButton.innerHTML = "Please install Metamask";
  }
};

// Add event listeners
connectButton.addEventListener("click", connect);
fundButton.addEventListener("click", fund);
balanceButton.addEventListener("click", getBalance);
withdrawButton.addEventListener("click", withdraw);
