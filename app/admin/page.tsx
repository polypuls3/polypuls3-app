import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, MoreVertical, AlertTriangle, CheckCircle2, Users, BarChart3, Flag, TrendingUp } from "lucide-react"

// Mock data for admin dashboard
const platformStats = {
  totalPolls: 156,
  activePolls: 24,
  totalUsers: 8542,
  flaggedContent: 3,
}

const recentPolls = [
  {
    id: 1,
    title: "Community Treasury Allocation Q1 2025",
    creator: "0x742d...4f2a",
    status: "active",
    votes: 1234,
    flagged: false,
    createdAt: "2024-12-20",
  },
  {
    id: 2,
    title: "New Feature Priority Poll",
    creator: "0x8a3c...9b1e",
    status: "active",
    votes: 856,
    flagged: false,
    createdAt: "2024-12-19",
  },
  {
    id: 3,
    title: "Suspicious Poll Activity",
    creator: "0x1f2e...3d4c",
    status: "flagged",
    votes: 45,
    flagged: true,
    createdAt: "2024-12-21",
  },
  {
    id: 4,
    title: "Marketing Campaign Direction",
    creator: "0x5b6a...7c8d",
    status: "active",
    votes: 432,
    flagged: false,
    createdAt: "2024-12-18",
  },
  {
    id: 5,
    title: "Partnership Proposal Review",
    creator: "0x9e8f...1a2b",
    status: "ended",
    votes: 2103,
    flagged: false,
    createdAt: "2024-12-15",
  },
]

const flaggedContent = [
  {
    id: 1,
    type: "poll",
    title: "Suspicious Poll Activity",
    reason: "Multiple votes from same IP",
    reportedBy: "0x3c4d...5e6f",
    date: "2024-12-21",
  },
  {
    id: 2,
    type: "comment",
    content: "Inappropriate comment on governance poll",
    reason: "Spam/Harassment",
    reportedBy: "0x7g8h...9i0j",
    date: "2024-12-20",
  },
  {
    id: 3,
    type: "poll",
    title: "Potential scam poll",
    reason: "Phishing attempt",
    reportedBy: "0x1k2l...3m4n",
    date: "2024-12-19",
  },
]

export default function AdminPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground text-lg">Monitor and manage platform activity</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-600/10">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{platformStats.totalPolls}</p>
              <p className="text-sm text-muted-foreground">Total Polls</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-600/10">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{platformStats.activePolls}</p>
              <p className="text-sm text-muted-foreground">Active Polls</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-pink-600/10">
              <Users className="h-6 w-6 text-pink-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{platformStats.totalUsers.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-600/10">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{platformStats.flaggedContent}</p>
              <p className="text-sm text-muted-foreground">Flagged Items</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Flagged Content Section */}
      {flaggedContent.length > 0 && (
        <Card className="mb-8 border-red-600/20 bg-red-600/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Flag className="h-5 w-5" />
              Flagged Content Requiring Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {flaggedContent.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-4 p-4 border border-border rounded-lg bg-background sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="destructive">{item.type}</Badge>
                      <span className="text-sm text-muted-foreground">{item.date}</span>
                    </div>
                    <h4 className="font-semibold mb-1">{"title" in item ? item.title : item.content}</h4>
                    <p className="text-sm text-muted-foreground">
                      Reason: {item.reason} • Reported by {item.reportedBy}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      Review
                    </Button>
                    <Button size="sm" variant="destructive">
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Polls Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>All Polls</CardTitle>
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search polls..." className="pl-10" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Creator</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Votes</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentPolls.map((poll) => (
                <TableRow key={poll.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {poll.flagged && <Flag className="h-4 w-4 text-red-600" />}
                      {poll.title}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{poll.creator}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        poll.status === "active" ? "default" : poll.status === "flagged" ? "destructive" : "secondary"
                      }
                      className={poll.status === "active" ? "bg-green-600 hover:bg-green-700" : ""}
                    >
                      {poll.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{poll.votes.toLocaleString()}</TableCell>
                  <TableCell>{poll.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>View Analytics</DropdownMenuItem>
                        <DropdownMenuItem>Edit Poll</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Suspend Poll</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Delete Poll</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Platform Analytics */}
      <div className="grid gap-6 md:grid-cols-2 mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Platform Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">New Users (7 days)</span>
                <span className="text-2xl font-bold">+342</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">New Polls (7 days)</span>
                <span className="text-2xl font-bold">+18</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Votes (7 days)</span>
                <span className="text-2xl font-bold">+5.2K</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start bg-transparent">
              View All Users
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              Platform Settings
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              Export Analytics
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              Moderation Queue
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
