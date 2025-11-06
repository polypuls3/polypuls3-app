"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, BarChart3, Users, Clock, Loader2 } from "lucide-react"
import Link from "next/link"
import { useAccount } from "wagmi"
import { useEffect, useState } from "react"
import { type Project, type Poll, type Survey, PollStatus, getPollsByProject, getSurveysByProject, getProjectById } from "@/lib/graphql/queries"
import { useDataSource } from "@/contexts/data-source-context"

export default function ProjectDetailsPage({ params }: { params: { projectId: string } }) {
  const { address: walletAddress } = useAccount()
  const { refreshTrigger } = useDataSource()
  const [project, setProject] = useState<Project | null>(null)
  const [polls, setPolls] = useState<Poll[]>([])
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchProjectData() {
      setIsLoading(true)
      try {
        const [projectData, pollsData, surveysData] = await Promise.all([
          getProjectById(params.projectId),
          getPollsByProject(params.projectId),
          getSurveysByProject(params.projectId),
        ])

        setProject(projectData)
        setPolls(pollsData)
        setSurveys(surveysData)
      } catch (error) {
        console.error("Error fetching project data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjectData()
  }, [params.projectId, refreshTrigger])

  const getStatusBadgeVariant = (status: PollStatus) => {
    switch (status) {
      case PollStatus.ACTIVE:
        return { variant: 'default' as const, className: 'bg-green-600 hover:bg-green-700' }
      case PollStatus.CLAIMING_ENABLED:
        return { variant: 'default' as const, className: 'bg-blue-600 hover:bg-blue-700' }
      case PollStatus.ENDED:
        return { variant: 'secondary' as const, className: '' }
      case PollStatus.CLAIMING_DISABLED:
        return { variant: 'secondary' as const, className: '' }
      case PollStatus.CLOSED:
        return { variant: 'outline' as const, className: '' }
      default:
        return { variant: 'default' as const, className: '' }
    }
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(parseInt(timestamp) * 1000)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (!walletAddress) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Please connect your wallet to view project details.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container py-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="container py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/creator">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Project not found.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8">
      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/creator">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>

      {/* Project Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">{project.name}</h1>
        <p className="text-muted-foreground text-lg">{project.description}</p>
        <div className="flex gap-2 mt-4">
          {project.tags && project.tags.split(',').map((tag, index) => (
            <Badge key={index} variant="secondary">
              {tag.trim()}
            </Badge>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-600/10">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{polls.length}</p>
              <p className="text-sm text-muted-foreground">Total Polls</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-pink-600/10">
              <Users className="h-6 w-6 text-pink-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{surveys.length}</p>
              <p className="text-sm text-muted-foreground">Total Surveys</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600/10">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {polls.filter(p => p.status === PollStatus.ACTIVE).length}
              </p>
              <p className="text-sm text-muted-foreground">Active Polls</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Polls Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Polls</CardTitle>
        </CardHeader>
        <CardContent>
          {polls.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No polls created for this project yet.
            </p>
          ) : (
            <div className="space-y-4">
              {polls.map((poll) => {
                const statusConfig = getStatusBadgeVariant(poll.status)
                return (
                  <Card key={poll.id} className="hover:border-purple-600/50 transition-colors">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">{poll.category}</Badge>
                            <Badge {...statusConfig}>{poll.status}</Badge>
                          </div>
                          <h3 className="text-lg font-semibold mb-1">{poll.question}</h3>
                          <p className="text-sm text-muted-foreground">
                            {poll.options.length} options • {poll.votingType} voting
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{parseInt(poll.totalResponses || '0')} responses</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>Expires {formatDate(poll.expiresAt)}</span>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/creator/polls/${poll.pollId}`}>View Details</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Surveys Section */}
      <Card>
        <CardHeader>
          <CardTitle>Surveys</CardTitle>
        </CardHeader>
        <CardContent>
          {surveys.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No surveys created for this project yet.
            </p>
          ) : (
            <div className="space-y-4">
              {surveys.map((survey) => (
                <Card key={survey.id} className="hover:border-purple-600/50 transition-colors">
                  <CardHeader>
                    <h3 className="text-lg font-semibold">{survey.title}</h3>
                    <p className="text-sm text-muted-foreground">{survey.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{parseInt(survey.totalResponses || '0')} responses</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>Expires {formatDate(survey.expiresAt)}</span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/creator/surveys/${survey.surveyId}`}>View Details</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
