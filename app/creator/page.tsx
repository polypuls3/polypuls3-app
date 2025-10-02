import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, BarChart3, Users, Clock, FileText, FolderKanban } from "lucide-react"
import Link from "next/link"

// Mock data for creator's polls
const myPolls = [
  {
    id: 1,
    title: "Community Treasury Allocation Q1 2025",
    type: "poll",
    status: "active",
    votes: 1234,
    endDate: "2025-01-15",
  },
  {
    id: 2,
    title: "Product Feedback Survey",
    type: "survey",
    status: "active",
    responses: 456,
    endDate: "2025-01-20",
  },
  {
    id: 3,
    title: "Marketing Campaign Direction",
    type: "poll",
    status: "draft",
    votes: 0,
    endDate: null,
  },
]

const projects = [
  {
    id: 1,
    name: "Q1 2025 Governance",
    polls: 5,
    surveys: 2,
    totalVotes: 3421,
  },
  {
    id: 2,
    name: "Product Development",
    polls: 3,
    surveys: 4,
    totalVotes: 1856,
  },
]

export default function CreatorPage() {
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
              <p className="text-2xl font-bold">8</p>
              <p className="text-sm text-muted-foreground">Active Polls</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-pink-600/10">
              <FileText className="h-6 w-6 text-pink-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">6</p>
              <p className="text-sm text-muted-foreground">Active Surveys</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-600/10">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">5.2K</p>
              <p className="text-sm text-muted-foreground">Total Votes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-pink-600/10">
              <FolderKanban className="h-6 w-6 text-pink-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">2</p>
              <p className="text-sm text-muted-foreground">Projects</p>
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
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((project) => (
            <Card key={project.id} className="transition-all hover:border-purple-600/50 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderKanban className="h-5 w-5" />
                  {project.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>{project.polls} polls</span>
                    <span>{project.surveys} surveys</span>
                    <span>{project.totalVotes.toLocaleString()} votes</span>
                  </div>
                  <Button size="sm" variant="ghost">
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Polls & Surveys */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Recent Polls & Surveys</h2>
        <div className="grid gap-4">
          {myPolls.map((item) => (
            <Card key={item.id} className="transition-all hover:border-purple-600/50">
              <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={item.type === "poll" ? "default" : "secondary"}>
                      {item.type === "poll" ? "Poll" : "Survey"}
                    </Badge>
                    <Badge
                      variant={item.status === "active" ? "default" : "outline"}
                      className={item.status === "active" ? "bg-green-600 hover:bg-green-700" : ""}
                    >
                      {item.status}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>
                        {"votes" in item ? item.votes : item.responses} {"votes" in item ? "votes" : "responses"}
                      </span>
                    </div>
                    {item.endDate && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>Ends {item.endDate}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    Analytics
                  </Button>
                  <Button size="sm">Edit</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
