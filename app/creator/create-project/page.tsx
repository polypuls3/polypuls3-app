"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { CONTRACT_CONFIG } from "@/lib/contracts/config"

export default function CreateProjectPage() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState("")
  const { isConnected } = useAccount()
  const router = useRouter()
  const { toast } = useToast()

  const { data: hash, writeContract, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to create a project",
        variant: "destructive",
      })
      return
    }

    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Project name is required",
        variant: "destructive",
      })
      return
    }

    try {
      writeContract({
        ...CONTRACT_CONFIG,
        functionName: "createProject",
        args: [name, description, tags],
      })
      toast({
        title: "Transaction Submitted",
        description: "Please confirm the transaction in your wallet",
      })
    } catch (err: any) {
      console.error("Error creating project:", err)
      toast({
        title: "Error",
        description: err.message || "Failed to create project",
        variant: "destructive",
      })
    }
  }

  // Show success message and redirect when confirmed
  useEffect(() => {
    if (isConfirmed) {
      let hasNavigated = false

      toast({
        title: "Success!",
        description: "Project created successfully. What would you like to do next?",
        action: (
          <div className="flex flex-col gap-2 w-full">
            <Button
              size="sm"
              onClick={() => {
                hasNavigated = true
                router.push("/creator/create-poll")
              }}
              className="w-full"
            >
              Create Poll
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                hasNavigated = true
                router.push("/creator/create-survey")
              }}
              className="w-full"
            >
              Create Survey
            </Button>
          </div>
        ),
        duration: 5000, // Keep toast open for 5 seconds
      })

      // Default redirect to creator dashboard if user doesn't choose
      const redirectTimer = setTimeout(() => {
        if (!hasNavigated) {
          router.push("/creator")
        }
      }, 5500)

      return () => clearTimeout(redirectTimer)
    }
  }, [isConfirmed, router, toast])

  const isLoading = isPending || isConfirming

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

      {!isConnected && (
        <Card className="mb-6 border-yellow-500 bg-yellow-50">
          <CardContent className="pt-6">
            <p className="text-yellow-700 font-medium">Please connect your wallet to create a project</p>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
            <CardDescription>Provide details about your project</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name *</Label>
              <Input
                id="project-name"
                placeholder="Enter project name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-description">Description</Label>
              <Textarea
                id="project-description"
                placeholder="Describe the purpose and goals of this project"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-tags">Tags (Optional)</Label>
              <Input
                id="project-tags"
                placeholder="governance, community, development"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="p-4 border border-destructive bg-destructive/10 rounded-lg text-sm text-destructive">
            <strong>Error:</strong> {error.message}
          </div>
        )}

        <div className="flex gap-4">
          <Button size="lg" className="flex-1" type="submit" disabled={isLoading || !isConnected}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {!isConnected ? "Connect Wallet" : isPending ? "Confirm in Wallet..." : isConfirming ? "Creating Project..." : "Create Project"}
          </Button>
          <Button size="lg" variant="outline" className="flex-1 bg-transparent" asChild disabled={isLoading}>
            <Link href="/creator">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
