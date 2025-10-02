import { useWeb3Modal, useWeb3ModalState } from "@web3modal/wagmi/react";
import { BrowserProvider, JsonRpcSigner } from "ethers";
import { useEffect, useState } from "react";
import { useAccount, useDisconnect, useChainId, useSwitchChain } from "wagmi";

/**
 * @description Useful methods and data about Wallet
 */
export const useWallet = () => {
    const { open: showConnectDialog, close: closeConnectDialog } = useWeb3Modal();
    const { open: isConnectDialogOpen } = useWeb3ModalState();
    const { address: walletAddress, status: walletConnectionStatus, connector, chain: chainCurrent } = useAccount();
    const { disconnect: disconnectWallet } = useDisconnect();
    const chainId = useChainId();
    const { switchChain } = useSwitchChain();

    // Keep Ethers provider and signer updated for Wallet
    const [ethersProvider, setEthersProvider] = useState<BrowserProvider | null>(null);
    const [ethersSigner, setEthersSigner] = useState<JsonRpcSigner | null>(null);

    useEffect(() => {
        if (connector) {
            (async () => {
                const provider = await connector.getProvider();
                const ethersProviderNew = new BrowserProvider(provider);
                const ethersSignerNew = await ethersProviderNew.getSigner();

                setEthersProvider(ethersProviderNew);
                setEthersSigner(ethersSignerNew);
            })();
        } else {
            setEthersProvider(null);
            setEthersSigner(null);
        }
    }, [connector, walletAddress])

    return {
        // Data
        isConnectDialogOpen,
        walletAddress,
        walletConnectionStatus: (walletConnectionStatus === "connected") ? (ethersSigner ? "connected" : "connecting") : walletConnectionStatus,
        ethersProvider,
        chainCurrent,
        ethersSigner,

        // Methods
        showConnectDialog,
        closeConnectDialog,
        disconnectWallet,
        switchChain
    }
}
