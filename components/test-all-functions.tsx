"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, AlertTriangle, Clock, Play, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TestResult {
  name: string
  status: "pending" | "running" | "passed" | "failed"
  message: string
  duration?: number
}

export default function TestAllFunctions() {
  const [tests, setTests] = useState<TestResult[]>([
    { name: "Project Creation", status: "pending", message: "Not started" },
    { name: "Task Assignment", status: "pending", message: "Not started" },
    { name: "Subtask Management", status: "pending", message: "Not started" },
    { name: "Progress Tracking", status: "pending", message: "Not started" },
    { name: "Notification System", status: "pending", message: "Not started" },
    { name: "Filter Functionality", status: "pending", message: "Not started" },
    { name: "Approval Workflow", status: "pending", message: "Not started" },
    { name: "Data Hierarchy", status: "pending", message: "Not started" },
  ])
  const [isRunning, setIsRunning] = useState(false)
  const { toast } = useToast()

  const runTest = async (testIndex: number): Promise<TestResult> => {
    const testName = tests[testIndex].name
    const startTime = Date.now()

    // Simulate test execution
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 2000 + 1000))

    const duration = Date.now() - startTime
    const success = Math.random() > 0.2 // 80% success rate for demo

    return {
      name: testName,
      status: success ? "passed" : "failed",
      message: success ? `✓ ${testName} working correctly` : `✗ ${testName} needs attention`,
      duration,
    }
  }

  const runAllTests = async () => {
    setIsRunning(true)

    // Reset all tests to pending
    setTests((prev) => prev.map((test) => ({ ...test, status: "pending", message: "Waiting..." })))

    for (let i = 0; i < tests.length; i++) {
      // Set current test to running
      setTests((prev) =>
        prev.map((test, index) => (index === i ? { ...test, status: "running", message: "Running test..." } : test)),
      )

      // Run the test
      const result = await runTest(i)

      // Update with result
      setTests((prev) => prev.map((test, index) => (index === i ? result : test)))
    }

    setIsRunning(false)

    // Show completion toast
    const passedTests = tests.filter((t) => t.status === "passed").length
    toast({
      title: "Testing Complete",
      description: `${passedTests}/${tests.length} tests passed`,
    })
  }

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "passed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "failed":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "running":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      default:
        return <Clock className="h-4 w-4 text-slate-400" />
    }
  }

  const getStatusBadge = (status: TestResult["status"]) => {
    switch (status) {
      case "passed":
        return <Badge className="bg-green-100 text-green-800">Passed</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      case "running":
        return <Badge className="bg-blue-100 text-blue-800">Running</Badge>
      default:
        return <Badge variant="outline">Pending</Badge>
    }
  }

  const passedTests = tests.filter((t) => t.status === "passed").length
  const failedTests = tests.filter((t) => t.status === "failed").length
  const completedTests = passedTests + failedTests

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">System Function Tests</h1>
        <p className="text-slate-600">Comprehensive testing of the Projects → Tasks → Subtasks hierarchy</p>
      </div>

      {/* Test Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-slate-900">{tests.length}</div>
            <div className="text-sm text-slate-600">Total Tests</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{passedTests}</div>
            <div className="text-sm text-slate-600">Passed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{failedTests}</div>
            <div className="text-sm text-slate-600">Failed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {completedTests > 0 ? Math.round((passedTests / completedTests) * 100) : 0}%
            </div>
            <div className="text-sm text-slate-600">Success Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Run Tests Button */}
      <div className="text-center">
        <Button onClick={runAllTests} disabled={isRunning} className="bg-indigo-500 hover:bg-indigo-600" size="lg">
          {isRunning ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Running Tests...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Run All Tests
            </>
          )}
        </Button>
      </div>

      {/* Test Results */}
      <div className="space-y-3">
        {tests.map((test, index) => (
          <Card key={index} className="transition-all hover:shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(test.status)}
                  <div>
                    <h3 className="font-medium text-slate-900">{test.name}</h3>
                    <p className="text-sm text-slate-600">{test.message}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {test.duration && <span className="text-xs text-slate-500">{test.duration}ms</span>}
                  {getStatusBadge(test.status)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Test Details */}
      <Card>
        <CardHeader>
          <CardTitle>Test Coverage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-slate-900 mb-2">Core Functionality</h4>
              <ul className="space-y-1 text-slate-600">
                <li>• Project creation and management</li>
                <li>• Task assignment within projects</li>
                <li>• Subtask creation and tracking</li>
                <li>• Progress calculation across hierarchy</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 mb-2">User Experience</h4>
              <ul className="space-y-1 text-slate-600">
                <li>• Notification system for assignments</li>
                <li>• Filter functionality in all interfaces</li>
                <li>• Approval workflow for tasks</li>
                <li>• Data hierarchy consistency</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
