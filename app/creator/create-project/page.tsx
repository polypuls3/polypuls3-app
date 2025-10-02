import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CreateProjectPage() {
  return (
    <div className="container py-8 max-w-4xl">
      <Button variant="ghost" className="mb-6 gap-2" asChild>
        <Link href="/creator">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>

      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Create New Project</h1>
        <p className="text-muted-foreground text-lg">
          Organize your polls and surveys into a project for better management
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
            <CardDescription>Provide details about your project</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input id="project-name" placeholder="Enter project name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-description">Description</Label>
              <Textarea
                id="project-description"
                placeholder="Describe the purpose and goals of this project"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-tags">Tags (Optional)</Label>
              <Input id="project-tags" placeholder="governance, community, development" />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button size="lg" className="flex-1">
            Create Project
          </Button>
          <Button size="lg" variant="outline" className="flex-1 bg-transparent" asChild>
            <Link href="/creator">Cancel</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
