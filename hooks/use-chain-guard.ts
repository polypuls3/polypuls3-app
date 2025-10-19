import { useAccount, useChainId, useSwitchChain } from 'wagmi'
import { polygonAmoy } from 'wagmi/chains'

/**
 * Hook to validate and switch to the correct chain for transactions
 * @returns {Object} Chain validation state and switch function
 */
export function useChainGuard() {
  const { isConnected, chain } = useAccount()
  const chainId = useChainId()
  const { switchChain, isPending: isSwitching, error: switchError } = useSwitchChain()

  const requiredChainId = polygonAmoy.id // 80002
  const isCorrectChain = chainId === requiredChainId
  const isWrongChain = isConnected && !isCorrectChain

  /**
   * Switch to the required chain (Polygon Amoy)
   */
  const switchToRequiredChain = async () => {
    if (!isConnected) {
      throw new Error('Wallet not connected')
    }

    if (isCorrectChain) {
      return // Already on correct chain
    }

    try {
      await switchChain({ chainId: requiredChainId })
    } catch (error) {
      console.error('Failed to switch chain:', error)
      throw error
    }
  }

  return {
    // State
    isConnected,
    isCorrectChain,
    isWrongChain,
    currentChain: chain,
    currentChainId: chainId,
    requiredChainId,
    requiredChainName: polygonAmoy.name,
    isSwitching,
    switchError,

    // Actions
    switchToRequiredChain,
  }
}
