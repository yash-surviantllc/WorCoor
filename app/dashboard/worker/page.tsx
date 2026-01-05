import Link from "next/link"
import {
  ArrowRight,
  Calendar,
  CheckCircle,
  ClipboardList,
  Clock,
  UserPlus,
  BarChart,
  Users,
  Award,
  BookOpen,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export default function WorkerPanelPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Worker Panel</h1>
        <p className="text-muted-foreground">Manage worker profiles, tasks, and track productivity</p>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Workers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">+3 from last month</p>
            <Progress value={85} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks In Progress</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
            <p className="text-xs text-muted-foreground">+5 from yesterday</p>
            <Progress value={65} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Productivity</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">+2% from last week</p>
            <Progress value={92} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certified Skills</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">+12 from last month</p>
            <Progress value={78} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Feature Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-blue-100 p-2">
                <UserPlus className="h-5 w-5 text-blue-700" />
              </div>
              <CardTitle>Worker Registration</CardTitle>
            </div>
            <CardDescription>Register new workers and manage profiles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <p>Register new workers, upload identification documents, and manage worker qualifications and skills.</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Recent registrations:</span>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  5 this week
                </Badge>
              </div>
              <Progress value={65} className="h-1.5" />
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
              <Link href="/dashboard/worker/registration" className="flex items-center justify-center gap-2">
                Register Worker
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-amber-100 p-2">
                <Calendar className="h-5 w-5 text-amber-700" />
              </div>
              <CardTitle>Daily Tasks</CardTitle>
            </div>
            <CardDescription>View and manage daily assigned tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <p>View assigned tasks, track progress, record start and completion times, and raise concerns.</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tasks due today:</span>
                <Badge variant="outline" className="bg-amber-50 text-amber-700">
                  12 tasks
                </Badge>
              </div>
              <Progress value={45} className="h-1.5" />
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full bg-amber-600 hover:bg-amber-700">
              <Link href="/dashboard/worker/tasks" className="flex items-center justify-center gap-2">
                View Tasks
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-green-100 p-2">
                <Clock className="h-5 w-5 text-green-700" />
              </div>
              <CardTitle>Productivity Metrics</CardTitle>
            </div>
            <CardDescription>Track productivity and performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <p>View productivity metrics, working hours, task completion rates, and performance statistics.</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Current efficiency:</span>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  92% average
                </Badge>
              </div>
              <Progress value={92} className="h-1.5" />
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full bg-green-600 hover:bg-green-700">
              <Link href="/dashboard/worker/productivity" className="flex items-center justify-center gap-2">
                View Metrics
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-purple-100 p-2">
                <BookOpen className="h-5 w-5 text-purple-700" />
              </div>
              <CardTitle>Training & Skills</CardTitle>
            </div>
            <CardDescription>Manage worker skills and training</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <p>View and update worker skills, track training progress, and manage skill certifications.</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Training completion:</span>
                <Badge variant="outline" className="bg-purple-50 text-purple-700">
                  78% complete
                </Badge>
              </div>
              <Progress value={78} className="h-1.5" />
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
              <Link href="/dashboard/worker/skills" className="flex items-center justify-center gap-2">
                Manage Skills
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-l-4 border-l-teal-500">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-teal-100 p-2">
                <CheckCircle className="h-5 w-5 text-teal-700" />
              </div>
              <CardTitle>Completed Tasks</CardTitle>
            </div>
            <CardDescription>View history of completed tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <p>View history of completed tasks, time taken, quality ratings, and feedback received.</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Recent completions:</span>
                <Badge variant="outline" className="bg-teal-50 text-teal-700">
                  24 this week
                </Badge>
              </div>
              <Progress value={85} className="h-1.5" />
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full bg-teal-600 hover:bg-teal-700">
              <Link href="/dashboard/worker/history" className="flex items-center justify-center gap-2">
                View History
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Quick Access Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Training Sessions</CardTitle>
            <CardDescription>Scheduled training sessions for workers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">Safety Protocols Training</p>
                  <p className="text-sm text-muted-foreground">Tomorrow, 9:00 AM - 11:00 AM</p>
                </div>
                <Badge className="bg-blue-100 text-blue-800">15 Attendees</Badge>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">Advanced Woodworking</p>
                  <p className="text-sm text-muted-foreground">Wed, 2:00 PM - 5:00 PM</p>
                </div>
                <Badge className="bg-amber-100 text-amber-800">8 Attendees</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Quality Control Workshop</p>
                  <p className="text-sm text-muted-foreground">Fri, 10:00 AM - 12:00 PM</p>
                </div>
                <Badge className="bg-green-100 text-green-800">12 Attendees</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Department Utilization</CardTitle>
            <CardDescription>Current worker allocation by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-sm font-medium">Assembly</p>
                  <span className="text-sm text-muted-foreground">85%</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-sm font-medium">Woodworking</p>
                  <span className="text-sm text-muted-foreground">92%</span>
                </div>
                <Progress value={92} className="h-2" />
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-sm font-medium">Finishing</p>
                  <span className="text-sm text-muted-foreground">78%</span>
                </div>
                <Progress value={78} className="h-2" />
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-sm font-medium">Quality Control</p>
                  <span className="text-sm text-muted-foreground">65%</span>
                </div>
                <Progress value={65} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
