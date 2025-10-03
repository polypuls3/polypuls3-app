"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, X, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi"
import { parseEther } from "viem"
import { CONTRACT_CONFIG } from "@/lib/contracts/config"
import { useRouter } from "next/navigation"
import { getProjectsByCreator, type Project } from "@/lib/graphql/queries"

export default function CreatePollPage() {
  const router = useRouter()
  const { address: walletAddress } = useAccount()
  const [question, setQuestion] = useState("")
  const [options, setOptions] = useState(["", ""])
  const [durationInDays, setDurationInDays] = useState("7")
  const [rewardPool, setRewardPool] = useState("0")
  const [category, setCategory] = useState("")
  const [projectId, setProjectId] = useState("0")
  const [votingType, setVotingType] = useState("single")
  const [visibility, setVisibility] = useState("public")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userProjects, setUserProjects] = useState<Project[]>([])
  const [isLoadingProjects, setIsLoadingProjects] = useState(true)

  const { data: hash, writeContract, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  // Fetch user's projects
  useEffect(() => {
    async function fetchUserProjects() {
      if (!walletAddress) {
        setIsLoadingProjects(false)
        return
      }

      try {
        const projects = await getProjectsByCreator(walletAddress)
        setUserProjects(projects)
      } catch (error) {
        console.error("Error fetching user projects:", error)
      } finally {
        setIsLoadingProjects(false)
      }
    }

    fetchUserProjects()
  }, [walletAddress])

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, ""])
    }
  }

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!question.trim()) {
      alert("Please enter a poll question")
      return
    }

    const filteredOptions = options.filter(opt => opt.trim() !== "")
    if (filteredOptions.length < 2) {
      alert("Please provide at least 2 options")
      return
    }

    if (filteredOptions.length > 10) {
      alert("Maximum 10 options allowed")
      return
    }

    const duration = parseInt(durationInDays)
    if (isNaN(duration) || duration <= 0) {
      alert("Please enter a valid duration")
      return
    }

    setIsSubmitting(true)

    try {
      writeContract({
        ...CONTRACT_CONFIG,
        functionName: "createPoll",
        args: [
          question,
          filteredOptions,
          BigInt(duration),
          category,
          BigInt(projectId),
          votingType,
          visibility
        ],
        value: rewardPool ? parseEther(rewardPool) : BigInt(0),
      })
    } catch (err) {
      console.error("Error creating poll:", err)
      setIsSubmitting(false)
    }
  }

  // Handle successful transaction
  if (isSuccess) {
    setTimeout(() => {
      router.push("/creator")
    }, 2000)
  }

  return (
    <div className="container py-8 max-w-4xl">
      <Button variant="ghost" className="mb-6 gap-2" asChild>
        <Link href="/creator">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>

      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Create New Poll</h1>
        <p className="text-muted-foreground text-lg">Set up a new poll for your community to vote on</p>
      </div>

      {isSuccess && (
        <Card className="mb-6 border-green-500 bg-green-50">
          <CardContent className="pt-6">
            <p className="text-green-700 font-medium">Poll created successfully! Redirecting...</p>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="mb-6 border-red-500 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-700 font-medium">Error: {error.message}</p>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Provide the essential details for your poll</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="question">Poll Question</Label>
              <Input
                id="question"
                placeholder="Enter your poll question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="governance">Governance</SelectItem>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="community">Community</SelectItem>
                    <SelectItem value="partnerships">Partnerships</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="project">Project (Optional)</Label>
                {isLoadingProjects ? (
                  <div className="flex items-center justify-center h-10 border rounded-md">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <Select value={projectId} onValueChange={setProjectId}>
                    <SelectTrigger id="project">
                      <SelectValue placeholder="No project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No project</SelectItem>
                      {userProjects.map((project) => (
                        <SelectItem key={project.id} value={project.projectId}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {!isLoadingProjects && userProjects.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No projects found. <Link href="/creator/create-project" className="underline">Create one</Link>
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Poll Options */}
        <Card>
          <CardHeader>
            <CardTitle>Poll Options</CardTitle>
            <CardDescription>Add the choices participants can vote on (minimum 2 options)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`option-${index}`}>Option {index + 1}</Label>
                  <Input
                    id={`option-${index}`}
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Enter option ${index + 1}`}
                  />
                </div>
                {options.length > 2 && (
                  <Button variant="ghost" size="icon" className="mt-8" onClick={() => removeOption(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button variant="outline" className="w-full gap-2 bg-transparent" onClick={addOption}>
              <Plus className="h-4 w-4" />
              Add Option
            </Button>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Poll Settings</CardTitle>
            <CardDescription>Configure poll duration, voting type, and rewards</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (in days)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  placeholder="7"
                  value={durationInDays}
                  onChange={(e) => setDurationInDays(e.target.value)}
                  required
                />
                <p className="text-sm text-muted-foreground">How many days the poll will be active</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reward">Reward Pool (POL, optional)</Label>
                <Input
                  id="reward"
                  type="number"
                  step="0.001"
                  min="0"
                  placeholder="0"
                  value={rewardPool}
                  onChange={(e) => setRewardPool(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Amount of POL to distribute among participants
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="voting-type">Voting Type</Label>
                <Select value={votingType} onValueChange={setVotingType}>
                  <SelectTrigger id="voting-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single Choice</SelectItem>
                    <SelectItem value="multiple">Multiple Choice</SelectItem>
                    <SelectItem value="ranked">Ranked Choice</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="visibility">Visibility</Label>
                <Select value={visibility} onValueChange={setVisibility}>
                  <SelectTrigger id="visibility">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="token-gated">Token Gated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            type="submit"
            size="lg"
            className="flex-1"
            disabled={isPending || isConfirming || isSuccess}
          >
            {isPending || isConfirming ? "Creating Poll..." : isSuccess ? "Poll Created!" : "Create Poll"}
          </Button>
          <Button
            type="button"
            size="lg"
            variant="outline"
            className="flex-1 bg-transparent"
            onClick={() => router.push("/creator")}
            disabled={isPending || isConfirming}
          >
            Cancel
          </Button>
        </div>

        {isConfirming && (
          <Card className="border-blue-500 bg-blue-50">
            <CardContent className="pt-6">
              <p className="text-blue-700 font-medium">Waiting for transaction confirmation...</p>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  )
}
