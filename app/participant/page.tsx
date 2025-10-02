import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, TrendingUp, Clock, CheckCircle2, Users } from "lucide-react"
import Link from "next/link"

// Mock data for polls
const polls = [
  {
    id: 1,
    title: "Community Treasury Allocation Q1 2025",
    description: "Vote on how to allocate 100,000 MATIC from the community treasury",
    status: "active",
    endDate: "2025-01-15",
    totalVotes: 1234,
    category: "Governance",
  },
  {
    id: 2,
    title: "New Feature Priority Poll",
    description: "Help us decide which feature to build next for the platform",
    status: "active",
    endDate: "2025-01-10",
    totalVotes: 856,
    category: "Development",
  },
  {
    id: 3,
    title: "Marketing Campaign Direction",
    description: "Choose the direction for our Q1 marketing initiatives",
    status: "active",
    endDate: "2025-01-20",
    totalVotes: 432,
    category: "Marketing",
  },
  {
    id: 4,
    title: "Partnership Proposal: DeFi Protocol",
    description: "Vote on whether to partner with a leading DeFi protocol",
    status: "ending-soon",
    endDate: "2025-01-05",
    totalVotes: 2103,
    category: "Partnerships",
  },
  {
    id: 5,
    title: "Community Event Location",
    description: "Select the location for our next community meetup",
    status: "active",
    endDate: "2025-01-18",
    totalVotes: 567,
    category: "Community",
  },
  {
    id: 6,
    title: "Token Economics Update",
    description: "Approve proposed changes to tokenomics model",
    status: "ending-soon",
    endDate: "2025-01-06",
    totalVotes: 3421,
    category: "Governance",
  },
]

export default function ParticipantPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Active Polls</h1>
        <p className="text-muted-foreground text-lg">Participate in community decisions and make your voice heard</p>
      </div>

      {/* Search and Filter */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search polls..." className="pl-10" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            All
          </Button>
          <Button variant="ghost" size="sm">
            Governance
          </Button>
          <Button variant="ghost" size="sm">
            Development
          </Button>
          <Button variant="ghost" size="sm">
            Community
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-600/10">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">24</p>
              <p className="text-sm text-muted-foreground">Active Polls</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-pink-600/10">
              <CheckCircle2 className="h-6 w-6 text-pink-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">12</p>
              <p className="text-sm text-muted-foreground">Your Votes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-600/10">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">8.5K</p>
              <p className="text-sm text-muted-foreground">Total Participants</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Polls Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {polls.map((poll) => (
          <Card
            key={poll.id}
            className="group transition-all hover:border-purple-600/50 hover:shadow-lg hover:shadow-purple-600/10"
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-4 mb-2">
                <Badge variant="secondary">{poll.category}</Badge>
                {poll.status === "ending-soon" && (
                  <Badge variant="destructive" className="gap-1">
                    <Clock className="h-3 w-3" />
                    Ending Soon
                  </Badge>
                )}
              </div>
              <CardTitle className="text-xl group-hover:text-purple-600 transition-colors">{poll.title}</CardTitle>
              <CardDescription className="leading-relaxed">{poll.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{poll.totalVotes.toLocaleString()} votes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>Ends {poll.endDate}</span>
                  </div>
                </div>
                <Button size="sm" asChild>
                  <Link href={`/participant/poll/${poll.id}`}>Vote Now</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
