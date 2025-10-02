"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function CreatePollPage() {
  const [options, setOptions] = useState(["", ""])

  const addOption = () => {
    setOptions([...options, ""])
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

      <div className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Provide the essential details for your poll</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Poll Title</Label>
              <Input id="title" placeholder="Enter a clear and concise title" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Provide context and details about what participants are voting on"
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
                <Select>
                  <SelectTrigger id="project">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="q1-2025">Q1 2025 Governance</SelectItem>
                    <SelectItem value="product-dev">Product Development</SelectItem>
                    <SelectItem value="none">No Project</SelectItem>
                  </SelectContent>
                </Select>
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
            <CardDescription>Configure voting rules and duration</CardDescription>
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
              <Label htmlFor="voting-type">Voting Type</Label>
              <Select defaultValue="single">
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
            Publish Poll
          </Button>
          <Button size="lg" variant="outline" className="flex-1 bg-transparent">
            Save as Draft
          </Button>
        </div>
      </div>
    </div>
  )
}
