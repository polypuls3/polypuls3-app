import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_CONFIG } from '@/lib/contracts/config';
import { parseEther } from 'ethers';

export function usePolyPuls3() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  // Read functions
  const usePollCount = () => useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'pollCount',
  });

  const useProjectCount = () => useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'projectCount',
  });

  const useSurveyCount = () => useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'surveyCount',
  });

  const usePoll = (pollId: bigint) => useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'getPoll',
    args: [pollId],
  });

  const usePollResults = (pollId: bigint) => useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'getPollResults',
    args: [pollId],
  });

  const useProject = (projectId: bigint) => useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'getProject',
    args: [projectId],
  });

  const useSurvey = (surveyId: bigint) => useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'getSurvey',
    args: [surveyId],
  });

  // Write functions
  const createPoll = async (
    question: string,
    options: string[],
    durationInDays: bigint,
    rewardPool: string // in ETH/MATIC
  ) => {
    return writeContract({
      ...CONTRACT_CONFIG,
      functionName: 'createPoll',
      args: [question, options, durationInDays],
      value: parseEther(rewardPool),
    });
  };

  const createProject = async (name: string, description: string, tags: string) => {
    writeContract({
      ...CONTRACT_CONFIG,
      functionName: 'createProject',
      args: [name, description, tags],
    });
  };

  const createSurvey = async (
    projectId: bigint,
    title: string,
    description: string,
    questions: string[],
    durationInDays: bigint,
    rewardPool: string // in ETH/MATIC
  ) => {
    return writeContract({
      ...CONTRACT_CONFIG,
      functionName: 'createSurvey',
      args: [projectId, title, description, questions, durationInDays],
      value: parseEther(rewardPool),
    });
  };

  const respondToPoll = async (pollId: bigint, optionIndex: bigint) => {
    return writeContract({
      ...CONTRACT_CONFIG,
      functionName: 'respondToPoll',
      args: [pollId, optionIndex],
    });
  };

  const respondToSurvey = async (surveyId: bigint, answers: string[]) => {
    return writeContract({
      ...CONTRACT_CONFIG,
      functionName: 'respondToSurvey',
      args: [surveyId, answers],
    });
  };

  const claimPollReward = async (pollId: bigint) => {
    return writeContract({
      ...CONTRACT_CONFIG,
      functionName: 'claimPollReward',
      args: [pollId],
    });
  };

  const claimSurveyReward = async (surveyId: bigint) => {
    return writeContract({
      ...CONTRACT_CONFIG,
      functionName: 'claimSurveyReward',
      args: [surveyId],
    });
  };

  return {
    // Read hooks
    usePollCount,
    useProjectCount,
    useSurveyCount,
    usePoll,
    usePollResults,
    useProject,
    useSurvey,

    // Write functions
    createPoll,
    createProject,
    createSurvey,
    respondToPoll,
    respondToSurvey,
    claimPollReward,
    claimSurveyReward,

    // Transaction state
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}
