"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Plus, FolderKanban, BarChart3, FileText, Users, Clock, Loader2, Edit } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { CONTRACT_CONFIG } from "@/lib/contracts/config"
import { useToast } from "@/hooks/use-toast"
import { type Project, type Poll, type Survey, PollStatus } from "@/lib/graphql/queries"
import { useDataFetcher } from "@/hooks/use-data-fetcher"

export default function ProjectDetailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { address: walletAddress } = useAccount()
  const { toast } = useToast()
  const { fetchProjectById, fetchPollsByProject, fetchSurveysByProject, fetchProjectsByCreator, dataSource } = useDataFetcher()

  const [project, setProject] = useState<Project | null>(null)
  const [allProjects, setAllProjects] = useState<Project[]>([])
  const [polls, setPolls] = useState<Poll[]>([])
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [isLoadingProject, setIsLoadingProject] = useState(true)
  const [isLoadingAllProjects, setIsLoadingAllProjects] = useState(true)
  const [isLoadingPolls, setIsLoadingPolls] = useState(true)
  const [isLoadingSurveys, setIsLoadingSurveys] = useState(true)

  const { writeContract, data: hash, isPending, reset } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  // Get projectId from query params
  const projectId = searchParams.get('projectId')

  // Fetch project and its polls/surveys from subgraph or contract
  useEffect(() => {
    async function fetchData() {
      if (!projectId) {
        setIsLoadingProject(false)
        setIsLoadingPolls(false)
        setIsLoadingSurveys(false)
        return
      }

      setIsLoadingProject(true)
      setIsLoadingPolls(true)
      setIsLoadingSurveys(true)

      try {
        const [projectData, pollsData, surveysData] = await Promise.all([
          fetchProjectById(projectId),
          fetchPollsByProject(projectId),
          fetchSurveysByProject(projectId),
        ])

        setProject(projectData)
        setPolls(pollsData)
        setSurveys(surveysData)
      } catch (error) {
        console.error("Error fetching project data:", error)
        toast({
          title: "Error",
          description: "Failed to load project data",
          variant: "destructive",
        })
      } finally {
        setIsLoadingProject(false)
        setIsLoadingPolls(false)
        setIsLoadingSurveys(false)
      }
    }

    fetchData()
  }, [projectId, dataSource, toast, fetchProjectById, fetchPollsByProject, fetchSurveysByProject])

  // Fetch all projects if no projectId (list view)
  useEffect(() => {
    async function fetchAllProjects() {
      if (projectId || !walletAddress) {
        setIsLoadingAllProjects(false)
        return
      }

      setIsLoadingAllProjects(true)
      try {
        const projects = await fetchProjectsByCreator(walletAddress)
        setAllProjects(projects)
      } catch (error) {
        console.error("Error fetching projects:", error)
        toast({
          title: "Error",
          description: "Failed to load projects",
          variant: "destructive",
        })
      } finally {
        setIsLoadingAllProjects(false)
      }
    }

    fetchAllProjects()
  }, [projectId, walletAddress, dataSource, fetchProjectsByCreator, toast])

  // Handle successful transaction
  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Success",
        description: "Poll status updated. Refreshing in a few seconds...",
      })
      reset()

      setTimeout(() => {
        window.location.reload()
      }, 4000)
    }
  }, [isSuccess, toast, reset])

  // Access control - only project creator can view
  useEffect(() => {
    if (project && walletAddress && project.creator.toLowerCase() !== walletAddress.toLowerCase()) {
      toast({
        title: "Access Denied",
        description: "You can only view projects you created",
        variant: "destructive",
      })
      router.push("/creator")
    }
  }, [project, walletAddress, router, toast])

  // Helper functions
  const getStatusBadgeVariant = (status: PollStatus) => {
    switch (status) {
      case PollStatus.ACTIVE:
        return { variant: 'default' as const, className: 'bg-green-600 hover:bg-green-700' }
      case PollStatus.CLAIMING_ENABLED:
        return { variant: 'default' as const, className: 'bg-blue-600 hover:bg-blue-700' }
      case PollStatus.ENDED:
        return { variant: 'secondary' as const, className: 'bg-orange-600 hover:bg-orange-700' }
      case PollStatus.CLAIMING_DISABLED:
        return { variant: 'secondary' as const, className: 'bg-gray-600 hover:bg-gray-700' }
      case PollStatus.CLOSED:
        return { variant: 'secondary' as const, className: 'bg-slate-600 hover:bg-slate-700' }
      default:
        return { variant: 'secondary' as const, className: '' }
    }
  }

  const getStatusLabel = (status: PollStatus) => {
    switch (status) {
      case PollStatus.ACTIVE: return 'Active'
      case PollStatus.ENDED: return 'Ended'
      case PollStatus.CLAIMING_ENABLED: return 'Claiming'
      case PollStatus.CLAIMING_DISABLED: return 'Disabled'
      case PollStatus.CLOSED: return 'Closed'
      default: return 'Unknown'
    }
  }

  const getStatusActions = (status: PollStatus) => {
    switch (status) {
      case PollStatus.ACTIVE:
        return [{ label: 'End Voting', function: 'endVoting' }]
      case PollStatus.ENDED:
        return [
          { label: 'Enable Claiming', function: 'enableClaiming' },
          { label: 'Disable Claiming', function: 'disableClaiming' },
          { label: 'Close Poll', function: 'closePoll', variant: 'destructive' as const }
        ]
      case PollStatus.CLAIMING_ENABLED:
        return [
          { label: 'Disable Claiming', function: 'disableClaiming' },
          { label: 'Close Poll', function: 'closePoll', variant: 'destructive' as const }
        ]
      case PollStatus.CLAIMING_DISABLED:
        return [
          { label: 'Enable Claiming', function: 'enableClaiming' },
          { label: 'Close Poll', function: 'closePoll', variant: 'destructive' as const }
        ]
      case PollStatus.CLOSED:
        return []
      default:
        return []
    }
  }

  const handleStatusAction = async (pollId: string, functionName: string, actionLabel: string) => {
    if (!walletAddress) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to manage polls",
        variant: "destructive"
      })
      return
    }

    try {
      writeContract({
        ...CONTRACT_CONFIG,
        functionName: functionName,
        args: [BigInt(pollId)],
      })
      toast({
        title: "Transaction Submitted",
        description: `${actionLabel} transaction submitted. Please confirm in your wallet.`,
      })
    } catch (error: any) {
      console.error("Error updating poll status:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update poll status",
        variant: "destructive",
      })
    }
  }

  const handleEditProject = () => {
    toast({
      title: "Coming Soon",
      description: "Project editing will be available in a future update",
    })
  }

  const formatPOL = (wei: string) => {
    const value = BigInt(wei)
    const eth = Number(value) / 1e18
    return eth.toFixed(4)
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(Number(timestamp) * 1000)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // Calculate stats
  const totalResponses = polls.reduce((acc, poll) => acc + Number(poll.totalResponses || 0), 0) +
    surveys.reduce((acc, survey) => acc + Number(survey.totalResponses || 0), 0)

  // Show projects list if no projectId provided
  if (!projectId) {
    return (
      <div className="container py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">Your Projects</h1>
              <p className="text-muted-foreground text-lg">Manage and organize your polls and surveys</p>
            </div>
            <Button className="gap-2" asChild>
              <Link href="/creator/create-project">
                <Plus className="h-4 w-4" />
                Create New Project
              </Link>
            </Button>
          </div>
        </div>

        {!walletAddress ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
              <p className="text-muted-foreground mb-4">
                Please connect your wallet to view your projects
              </p>
            </CardContent>
          </Card>
        ) : isLoadingAllProjects ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : allProjects.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <FolderKanban className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first project to organize your polls and surveys
              </p>
              <Button asChild>
                <Link href="/creator/create-project">Create Project</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {allProjects.map((proj) => (
              <Card key={proj.id} className="transition-all hover:border-purple-600/50 hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FolderKanban className="h-5 w-5" />
                      {proj.name}
                    </CardTitle>
                    {proj.tags && (
                      <Badge variant="outline" className="text-xs">
                        {proj.tags}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{proj.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDate(proj.createdAt)}
                    </span>
                    <Button size="sm" asChild>
                      <Link href={`/creator/projects?projectId=${proj.projectId}`}>View Details</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Show loading state
  if (isLoadingProject) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  // Show error if project not found
  if (!project) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FolderKanban className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Project Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The project you're looking for doesn't exist or has been deleted
            </p>
            <Button asChild>
              <Link href="/creator">Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show connect wallet prompt if not connected
  if (!walletAddress) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
            <p className="text-muted-foreground mb-4">
              Please connect your wallet to view this project
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8">
      {/* Back Button and Breadcrumb */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/creator/projects" className="hover:text-foreground transition-colors">
            Projects
          </Link>
          <span>/</span>
          <span className="text-foreground">{project.name}</span>
        </div>
        <Button variant="ghost" size="sm" className="gap-2" asChild>
          <Link href="/creator/projects">
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Link>
        </Button>
      </div>

      {/* Project Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <FolderKanban className="h-8 w-8 text-purple-600" />
              <h1 className="text-4xl font-bold tracking-tight">{project.name}</h1>
            </div>
            <p className="text-muted-foreground text-lg mb-3">{project.description}</p>
            <div className="flex items-center gap-4">
              {project.tags && (
                <Badge variant="outline" className="text-sm">
                  {project.tags}
                </Badge>
              )}
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Created {formatDate(project.createdAt)}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={handleEditProject}>
              <Edit className="h-4 w-4" />
              Edit Project
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-600/10">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              {isLoadingPolls ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <p className="text-2xl font-bold">{polls.length}</p>
              )}
              <p className="text-sm text-muted-foreground">Polls</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-pink-600/10">
              <FileText className="h-6 w-6 text-pink-600" />
            </div>
            <div>
              {isLoadingSurveys ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <p className="text-2xl font-bold">{surveys.length}</p>
              )}
              <p className="text-sm text-muted-foreground">Surveys</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600/10">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              {isLoadingPolls || isLoadingSurveys ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <p className="text-2xl font-bold">{totalResponses}</p>
              )}
              <p className="text-sm text-muted-foreground">Total Responses</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-600/10">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {Math.floor((Date.now() - Number(project.createdAt) * 1000) / (1000 * 60 * 60 * 24))}d
              </p>
              <p className="text-sm text-muted-foreground">Project Age</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Button className="gap-2" asChild>
              <Link href={`/creator/create-poll?projectId=${project.projectId}`}>
                <Plus className="h-4 w-4" />
                Create Poll for This Project
              </Link>
            </Button>
            <Button variant="outline" className="gap-2 bg-transparent" asChild>
              <Link href={`/creator/create-survey?projectId=${project.projectId}`}>
                <Plus className="h-4 w-4" />
                Create Survey for This Project
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Polls Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Polls</h2>
        {isLoadingPolls ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : polls.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No polls yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first poll for this project
              </p>
              <Button asChild>
                <Link href={`/creator/create-poll?projectId=${project.projectId}`}>Create Poll</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Question</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Responses</TableHead>
                  <TableHead>Reward Pool</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {polls.map((poll) => {
                  const statusBadge = getStatusBadgeVariant(poll.status)
                  const actions = getStatusActions(poll.status)
                  return (
                    <TableRow key={poll.id}>
                      <TableCell className="font-medium max-w-md">
                        <Link href={`/polls/${poll.pollId}`} className="hover:underline">
                          {poll.question}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusBadge.variant} className={statusBadge.className}>
                          {getStatusLabel(poll.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>{poll.totalResponses}</TableCell>
                      <TableCell>{formatPOL(poll.rewardPool)} POL</TableCell>
                      <TableCell>{formatDate(poll.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {actions.map((action) => (
                            <Button
                              key={action.function}
                              size="sm"
                              variant={action.variant || "outline"}
                              onClick={() => handleStatusAction(poll.pollId, action.function, action.label)}
                              disabled={isPending || isConfirming}
                            >
                              {action.label}
                            </Button>
                          ))}
                          <Button size="sm" variant="ghost" asChild>
                            <Link href={`/polls/${poll.pollId}`}>View</Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>

      {/* Surveys Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Surveys</h2>
        {isLoadingSurveys ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : surveys.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No surveys yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first survey for this project
              </p>
              <Button asChild>
                <Link href={`/creator/create-survey?projectId=${project.projectId}`}>Create Survey</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Responses</TableHead>
                  <TableHead>Reward Pool</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {surveys.map((survey) => (
                  <TableRow key={survey.id}>
                    <TableCell className="font-medium">
                      <Link href={`/surveys/${survey.surveyId}`} className="hover:underline">
                        {survey.title}
                      </Link>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{survey.description}</TableCell>
                    <TableCell>
                      <Badge variant={survey.isActive ? "default" : "secondary"}>
                        {survey.isActive ? "Active" : "Ended"}
                      </Badge>
                    </TableCell>
                    <TableCell>{survey.totalResponses}</TableCell>
                    <TableCell>{formatPOL(survey.rewardPool)} POL</TableCell>
                    <TableCell>{formatDate(survey.createdAt)}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost" asChild>
                        <Link href={`/surveys/${survey.surveyId}`}>View</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </div>
  )
}
