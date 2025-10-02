import { ScrollReveal } from "@/components/scroll-reveal"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Shield, Zap, Users, BarChart3, Lock, Globe } from "lucide-react"
import Link from "next/link"
import ConnectButton from "@/components/common/connect-btn"

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="container flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-8 py-20 text-center">
        <ScrollReveal>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-2 text-sm">
            <Globe className="h-4 w-4" />
            <span>Built on Polygon Network</span>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <h1 className="max-w-4xl text-5xl font-bold leading-tight tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl text-balance">
            The complete platform for{" "}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              decentralized polls
            </span>
          </h1>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <p className="max-w-2xl text-lg text-muted-foreground leading-relaxed sm:text-xl">
            Create transparent, tamper-proof polls and surveys on the blockchain. Empower your community with verifiable
            voting powered by Polygon.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={300}>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button size="lg" className="gap-2" asChild>
              <Link href="#roles">
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#features">Explore Features</Link>
            </Button>
          </div>
        </ScrollReveal>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border bg-muted/30">
        <div className="container py-12">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <ScrollReveal delay={0}>
              <div className="flex flex-col gap-2">
                <div className="text-3xl font-bold md:text-4xl">10K+</div>
                <div className="text-sm text-muted-foreground">Active Polls</div>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <div className="flex flex-col gap-2">
                <div className="text-3xl font-bold md:text-4xl">50K+</div>
                <div className="text-sm text-muted-foreground">Participants</div>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <div className="flex flex-col gap-2">
                <div className="text-3xl font-bold md:text-4xl">100%</div>
                <div className="text-sm text-muted-foreground">Transparent</div>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={300}>
              <div className="flex flex-col gap-2">
                <div className="text-3xl font-bold md:text-4xl">$0.01</div>
                <div className="text-sm text-muted-foreground">Avg Gas Fee</div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container py-20 md:py-32">
        <ScrollReveal>
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-balance">
              Why choose PolyPulse?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">Built for transparency, security, and ease of use</p>
          </div>
        </ScrollReveal>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <ScrollReveal delay={0}>
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardContent className="flex flex-col gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-600/10">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold">Blockchain Security</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Every vote is recorded on the Polygon blockchain, ensuring immutability and transparency.
                </p>
              </CardContent>
            </Card>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardContent className="flex flex-col gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-pink-600/10">
                  <Zap className="h-6 w-6 text-pink-600" />
                </div>
                <h3 className="text-xl font-semibold">Lightning Fast</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Powered by Polygon's high-speed network for instant vote confirmation and low fees.
                </p>
              </CardContent>
            </Card>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardContent className="flex flex-col gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-600/10">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold">Community Driven</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Empower your community with democratic decision-making and transparent governance.
                </p>
              </CardContent>
            </Card>
          </ScrollReveal>

          <ScrollReveal delay={300}>
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardContent className="flex flex-col gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-pink-600/10">
                  <BarChart3 className="h-6 w-6 text-pink-600" />
                </div>
                <h3 className="text-xl font-semibold">Real-time Analytics</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Track participation and results in real-time with comprehensive analytics dashboards.
                </p>
              </CardContent>
            </Card>
          </ScrollReveal>

          <ScrollReveal delay={400}>
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardContent className="flex flex-col gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-600/10">
                  <Lock className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold">Privacy Protected</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Anonymous voting options ensure participant privacy while maintaining verifiability.
                </p>
              </CardContent>
            </Card>
          </ScrollReveal>

          <ScrollReveal delay={500}>
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardContent className="flex flex-col gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-pink-600/10">
                  <Globe className="h-6 w-6 text-pink-600" />
                </div>
                <h3 className="text-xl font-semibold">Global Access</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Accessible worldwide with no geographical restrictions or intermediaries.
                </p>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>
      </section>

      {/* Role Selection Section */}
      <section id="roles" className="border-t border-border bg-muted/30">
        <div className="container py-20 md:py-32">
          <ScrollReveal>
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-balance">
                Choose your role
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">Get started by selecting how you want to participate</p>
            </div>
          </ScrollReveal>

          <div className="grid gap-6 md:grid-cols-3">
            <ScrollReveal delay={0}>
              <Card className="group relative overflow-hidden border-border/50 bg-card transition-all hover:border-purple-600/50 hover:shadow-lg hover:shadow-purple-600/10">
                <CardContent className="flex flex-col gap-6 p-8">
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-purple-600/10 transition-colors group-hover:bg-purple-600/20">
                    <Users className="h-8 w-8 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold mb-2">Participant</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Vote on polls and surveys. Make your voice heard in community decisions.
                    </p>
                  </div>
                  <Button className="w-full gap-2 group-hover:bg-purple-600" asChild>
                    <Link href="/participant">
                      Start Voting <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <Card className="group relative overflow-hidden border-border/50 bg-card transition-all hover:border-pink-600/50 hover:shadow-lg hover:shadow-pink-600/10">
                <CardContent className="flex flex-col gap-6 p-8">
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-pink-600/10 transition-colors group-hover:bg-pink-600/20">
                    <Zap className="h-8 w-8 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold mb-2">Creator</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Create polls, surveys, and projects. Engage your community effectively.
                    </p>
                  </div>
                  <Button className="w-full gap-2 group-hover:bg-pink-600" asChild>
                    <Link href="/creator">
                      Start Creating <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <Card className="group relative overflow-hidden border-border/50 bg-card transition-all hover:border-purple-600/50 hover:shadow-lg hover:shadow-purple-600/10">
                <CardContent className="flex flex-col gap-6 p-8">
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-purple-600/10 transition-colors group-hover:bg-purple-600/20">
                    <Shield className="h-8 w-8 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold mb-2">Administrator</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Manage and moderate polls. Ensure fair and transparent governance.
                    </p>
                  </div>
                  <Button className="w-full gap-2 group-hover:bg-purple-600" asChild>
                    <Link href="/admin">
                      Admin Dashboard <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20 md:py-32">
        <ScrollReveal>
          <Card className="border-border/50 bg-gradient-to-br from-purple-600/10 via-pink-600/10 to-purple-600/10">
            <CardContent className="flex flex-col items-center gap-6 p-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-balance">
                Ready to get started?
              </h2>
              <p className="max-w-2xl text-lg text-muted-foreground">
                Join thousands of communities using PolyPulse for transparent, decentralized decision-making.
              </p>
              <div className="flex justify-center">
                <ConnectButton />
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30">
        <div className="container py-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-muted-foreground">Built on Polygon. Powered by the community.</p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-foreground transition-colors">
                Documentation
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                GitHub
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Discord
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
