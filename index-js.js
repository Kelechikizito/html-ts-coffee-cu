import { createWalletClient, custom } from "https://esm.sh/viem";

const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");

let walletClient;

const connect = async () => {
  if (typeof window.ethereum !== "undefined") {
    walletClient = createWalletClient({
      transport: custom(window.ethereum),
    });
    await walletClient.requestAddresses(); // THIS LINE IS RESPONSIBLE FOR CONNECTING(CONFIRMING CONNECTION TO THE WALLET) ALSO, IF USER REJECTS THE CONNECTION, THIS LINE WILL THROW AN ERROR
    connectButton.innerHTML = "Connected";
  } else {
    connectButton.innerHTML = "Please install Metamask";
  }
};

connectButton.onclick = connect;
fundButton.onclick = fundButton;
