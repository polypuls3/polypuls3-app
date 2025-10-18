"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, X, GripVertical, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useAccount } from "wagmi"
import { getProjectsByCreator, type Project } from "@/lib/graphql/queries"

type QuestionType = "text" | "multiple-choice" | "rating" | "yes-no"

interface Question {
  id: string
  type: QuestionType
  question: string
  options?: string[]
}

export default function CreateSurveyPage() {
  const searchParams = useSearchParams()
  const { address: walletAddress } = useAccount()
  const [questions, setQuestions] = useState<Question[]>([{ id: "1", type: "text", question: "" }])
  const [projectId, setProjectId] = useState("0")
  const [userProjects, setUserProjects] = useState<Project[]>([])
  const [isLoadingProjects, setIsLoadingProjects] = useState(true)

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

        // Pre-select project from URL param if available
        const urlProjectId = searchParams.get('projectId')
        if (urlProjectId && projects.some(p => p.projectId === urlProjectId)) {
          setProjectId(urlProjectId)
        }
      } catch (error) {
        console.error("Error fetching user projects:", error)
      } finally {
        setIsLoadingProjects(false)
      }
    }

    fetchUserProjects()
  }, [walletAddress, searchParams])

  const addQuestion = () => {
    setQuestions([...questions, { id: Date.now().toString(), type: "text", question: "" }])
  }

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((q) => q.id !== id))
    }
  }

  const updateQuestion = (id: string, field: keyof Question, value: any) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, [field]: value } : q)))
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
        <h1 className="text-4xl font-bold tracking-tight mb-2">Create New Survey</h1>
        <p className="text-muted-foreground text-lg">
          Build a comprehensive survey to gather feedback from your community
        </p>
      </div>

      <div className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Provide the essential details for your survey</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Survey Title</Label>
              <Input id="title" placeholder="Enter a clear and concise title" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Explain the purpose of this survey and what you hope to learn"
                rows={4}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feedback">Feedback</SelectItem>
                    <SelectItem value="research">Research</SelectItem>
                    <SelectItem value="satisfaction">Satisfaction</SelectItem>
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

        {/* Questions */}
        <Card>
          <CardHeader>
            <CardTitle>Survey Questions</CardTitle>
            <CardDescription>Add questions to gather the information you need</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {questions.map((question, index) => (
              <div key={question.id} className="space-y-4 p-4 border border-border rounded-lg">
                <div className="flex items-start gap-2">
                  <GripVertical className="h-5 w-5 text-muted-foreground mt-2" />
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <Label className="text-base">Question {index + 1}</Label>
                      {questions.length > 1 && (
                        <Button variant="ghost" size="sm" onClick={() => removeQuestion(question.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <Input
                      value={question.question}
                      onChange={(e) => updateQuestion(question.id, "question", e.target.value)}
                      placeholder="Enter your question"
                    />
                    <div className="space-y-2">
                      <Label>Question Type</Label>
                      <Select
                        value={question.type}
                        onValueChange={(value) => updateQuestion(question.id, "type", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text Response</SelectItem>
                          <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                          <SelectItem value="rating">Rating Scale</SelectItem>
                          <SelectItem value="yes-no">Yes/No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full gap-2 bg-transparent" onClick={addQuestion}>
              <Plus className="h-4 w-4" />
              Add Question
            </Button>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Survey Settings</CardTitle>
            <CardDescription>Configure survey rules and duration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input id="start-date" type="datetime-local" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input id="end-date" type="datetime-local" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="visibility">Visibility</Label>
              <Select defaultValue="public">
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
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button size="lg" className="flex-1">
            Publish Survey
          </Button>
          <Button size="lg" variant="outline" className="flex-1 bg-transparent">
            Save as Draft
          </Button>
        </div>
      </div>
    </div>
  )
}
