"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, BarChart3, Users, Clock, FileText, FolderKanban, Loader2 } from "lucide-react"
import Link from "next/link"
import { usePolyPuls3 } from "@/hooks/use-polypuls3"
import { useAccount } from "wagmi"
import { useEffect, useState } from "react"
import { getProjectsByCreator, getPollsByCreator, getSurveysByCreator, type Project, type Poll, type Survey } from "@/lib/graphql/queries"

export default function CreatorPage() {
  const { address: walletAddress } = useAccount()
  const { useProjectCount, usePollCount, useSurveyCount } = usePolyPuls3()

  const { data: projectCount, isLoading: isLoadingProjectCount } = useProjectCount()
  const { data: pollCount, isLoading: isLoadingPollCount } = usePollCount()
  const { data: surveyCount, isLoading: isLoadingSurveyCount } = useSurveyCount()

  const [userProjects, setUserProjects] = useState<Project[]>([])
  const [userPolls, setUserPolls] = useState<Poll[]>([])
  const [userSurveys, setUserSurveys] = useState<Survey[]>([])
  const [isLoadingProjects, setIsLoadingProjects] = useState(true)
  const [isLoadingPolls, setIsLoadingPolls] = useState(true)
  const [isLoadingSurveys, setIsLoadingSurveys] = useState(true)

  // Fetch user-specific data from subgraph
  useEffect(() => {
    async function fetchUserData() {
      console.log("Fetching data for wallet:", walletAddress)
      if (!walletAddress) {
        setIsLoadingProjects(false)
        setIsLoadingPolls(false)
        setIsLoadingSurveys(false)
        return
      }

      try {
        console.log("Fetching data for wallet:", walletAddress)

        // Fetch all user data in parallel
        const [projects, polls, surveys] = await Promise.all([
          getProjectsByCreator(walletAddress),
          getPollsByCreator(walletAddress),
          getSurveysByCreator(walletAddress),
        ])

        console.log("Projects fetched:", projects)
        console.log("Polls fetched:", polls)
        console.log("Surveys fetched:", surveys)

        setUserProjects(projects)
        setUserPolls(polls)
        setUserSurveys(surveys)
      } catch (error) {
        console.error("Error fetching user data from subgraph:", error)
      } finally {
        setIsLoadingProjects(false)
        setIsLoadingPolls(false)
        setIsLoadingSurveys(false)
      }
    }

    fetchUserData()
  }, [walletAddress])

  const isLoading = isLoadingProjectCount || isLoadingPollCount || isLoadingSurveyCount

  // Show connect wallet prompt if not connected
  if (!walletAddress) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
            <p className="text-muted-foreground mb-4">
              Please connect your wallet to view your creator dashboard
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Creator Dashboard</h1>
          <p className="text-muted-foreground text-lg">Manage your polls, surveys, and projects</p>
        </div>
        <div className="flex gap-2">
          <Button className="gap-2" asChild>
            <Link href="/creator/create-poll">
              <Plus className="h-4 w-4" />
              Create Poll
            </Link>
          </Button>
          <Button variant="outline" className="gap-2 bg-transparent" asChild>
            <Link href="/creator/create-survey">
              <Plus className="h-4 w-4" />
              Create Survey
            </Link>
          </Button>
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
                <p className="text-2xl font-bold">{userPolls.length}</p>
              )}
              <p className="text-sm text-muted-foreground">My Polls</p>
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
                <p className="text-2xl font-bold">{userSurveys.length}</p>
              )}
              <p className="text-sm text-muted-foreground">My Surveys</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-600/10">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              {isLoadingPolls || isLoadingSurveys ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <p className="text-2xl font-bold">
                  {userPolls.reduce((acc, poll) => acc + Number(poll.totalResponses || 0), 0) +
                    userSurveys.reduce((acc, survey) => acc + Number(survey.totalResponses || 0), 0)}
                </p>
              )}
              <p className="text-sm text-muted-foreground">Total Responses</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-pink-600/10">
              <FolderKanban className="h-6 w-6 text-pink-600" />
            </div>
            <div>
              {isLoadingProjects ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <p className="text-2xl font-bold">{userProjects.length}</p>
              )}
              <p className="text-sm text-muted-foreground">My Projects</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Your Projects</h2>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent" asChild>
            <Link href="/creator/create-project">
              <Plus className="h-4 w-4" />
              New Project
            </Link>
          </Button>
        </div>
        {isLoadingProjects ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : userProjects.length === 0 ? (
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
          <div className="grid gap-4 md:grid-cols-2">
            {userProjects.map((project) => (
              <Card key={project.id} className="transition-all hover:border-purple-600/50 hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FolderKanban className="h-5 w-5" />
                      {project.name}
                    </CardTitle>
                    {project.tags && (
                      <Badge variant="outline" className="text-xs">
                        {project.tags}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{project.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(Number(project.createdAt) * 1000).toLocaleDateString()}
                      </span>
                    </div>
                    <Button size="sm" variant="ghost" asChild>
                      <Link href={`/projects/${project.projectId}`}>View</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Recent Polls & Surveys */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
        {isLoadingPolls || isLoadingSurveys ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : userPolls.length === 0 && userSurveys.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No polls or surveys yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first poll or survey to start gathering insights
              </p>
              <div className="flex gap-2">
                <Button asChild>
                  <Link href="/creator/create-poll">Create Poll</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/creator/create-survey">Create Survey</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {userPolls.slice(0, 3).map((poll) => (
              <Card key={poll.id} className="transition-all hover:border-purple-600/50 hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-purple-600" />
                      {poll.question}
                    </CardTitle>
                    <Badge variant={poll.isActive ? "default" : "secondary"}>
                      {poll.isActive ? "Active" : "Ended"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {poll.totalResponses} responses
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {new Date(Number(poll.createdAt) * 1000).toLocaleDateString()}
                      </span>
                    </div>
                    <Button size="sm" variant="ghost" asChild>
                      <Link href={`/polls/${poll.pollId}`}>View Results</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {userSurveys.slice(0, 3).map((survey) => (
              <Card key={survey.id} className="transition-all hover:border-pink-600/50 hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-pink-600" />
                      {survey.title}
                    </CardTitle>
                    <Badge variant={survey.isActive ? "default" : "secondary"}>
                      {survey.isActive ? "Active" : "Ended"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">{survey.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {survey.totalResponses} responses
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {new Date(Number(survey.createdAt) * 1000).toLocaleDateString()}
                      </span>
                    </div>
                    <Button size="sm" variant="ghost" asChild>
                      <Link href={`/surveys/${survey.surveyId}`}>View Results</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
