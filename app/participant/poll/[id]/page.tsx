import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Users, Clock, CheckCircle2, TrendingUp } from "lucide-react"
import Link from "next/link"

// Mock poll data
const pollData = {
  id: 1,
  title: "Community Treasury Allocation Q1 2025",
  description:
    "Vote on how to allocate 100,000 MATIC from the community treasury. This decision will impact our development priorities and community initiatives for the next quarter.",
  category: "Governance",
  creator: "0x742d...4f2a",
  createdDate: "2024-12-20",
  endDate: "2025-01-15",
  totalVotes: 1234,
  status: "active",
  options: [
    {
      id: 1,
      text: "Development & Infrastructure (40%)",
      description: "Invest in platform development, security audits, and infrastructure improvements",
      votes: 523,
      percentage: 42.4,
    },
    {
      id: 2,
      text: "Marketing & Growth (30%)",
      description: "Expand marketing efforts, partnerships, and community growth initiatives",
      votes: 385,
      percentage: 31.2,
    },
    {
      id: 3,
      text: "Community Rewards (20%)",
      description: "Allocate funds for community rewards, grants, and incentive programs",
      votes: 246,
      percentage: 19.9,
    },
    {
      id: 4,
      text: "Reserve Fund (10%)",
      description: "Keep funds in reserve for emergency situations and future opportunities",
      votes: 80,
      percentage: 6.5,
    },
  ],
}

export default function PollDetailPage() {
  return (
    <div className="container py-8">
      <Button variant="ghost" className="mb-6 gap-2" asChild>
        <Link href="/participant">
          <ArrowLeft className="h-4 w-4" />
          Back to Polls
        </Link>
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Poll Card */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4 mb-4">
                <Badge variant="secondary">{pollData.category}</Badge>
                <Badge className="bg-green-600 hover:bg-green-700">Active</Badge>
              </div>
              <CardTitle className="text-3xl mb-2">{pollData.title}</CardTitle>
              <CardDescription className="text-base leading-relaxed">{pollData.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{pollData.totalVotes.toLocaleString()} votes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Ends {pollData.endDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Created by {pollData.creator}</span>
                  </div>
                </div>

                <div className="border-t border-border pt-6">
                  <h3 className="text-lg font-semibold mb-4">Cast Your Vote</h3>
                  <RadioGroup defaultValue="option-1" className="space-y-4">
                    {pollData.options.map((option) => (
                      <div
                        key={option.id}
                        className="flex items-start space-x-3 rounded-lg border border-border p-4 transition-all hover:border-purple-600/50 hover:bg-muted/50"
                      >
                        <RadioGroupItem value={`option-${option.id}`} id={`option-${option.id}`} className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor={`option-${option.id}`} className="cursor-pointer">
                            <div className="font-medium mb-1">{option.text}</div>
                            <div className="text-sm text-muted-foreground">{option.description}</div>
                          </Label>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <Button size="lg" className="w-full">
                  Submit Vote
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Current Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Current Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pollData.options.map((option) => (
                <div key={option.id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium truncate">{option.text.split("(")[0]}</span>
                    <span className="text-muted-foreground">{option.percentage}%</span>
                  </div>
                  <Progress value={option.percentage} className="h-2" />
                  <div className="text-xs text-muted-foreground">{option.votes.toLocaleString()} votes</div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Poll Info */}
          <Card>
            <CardHeader>
              <CardTitle>Poll Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <div className="text-muted-foreground mb-1">Creator</div>
                <div className="font-mono">{pollData.creator}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Created</div>
                <div>{pollData.createdDate}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Ends</div>
                <div>{pollData.endDate}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Total Votes</div>
                <div className="font-semibold">{pollData.totalVotes.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Blockchain</div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-purple-600" />
                  Polygon
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
