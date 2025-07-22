"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Database, Plane, MessageSquare, TrendingUp, Clock, CheckCircle, AlertCircle } from "lucide-react"

interface DatabaseStatus {
  status: string
  database: string
  tables: string[]
  totalRecords: Record<string, number>
  lastUpdated: string
}

interface BookingStats {
  total: number
  confirmed: number
  pending: number
  cancelled: number
}

export default function AdminDashboard() {
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null)
  const [bookingStats, setBookingStats] = useState<BookingStats>({
    total: 0,
    confirmed: 0,
    pending: 0,
    cancelled: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDatabaseStatus()
    fetchBookingStats()
  }, [])

  const fetchDatabaseStatus = async () => {
    try {
      const response = await fetch("/api/database")
      const data = await response.json()
      setDbStatus(data)
    } catch (error) {
      console.error("Failed to fetch database status:", error)
    }
  }

  const fetchBookingStats = async () => {
    try {
      const response = await fetch("/api/flights/book")
      const data = await response.json()

      const stats = {
        total: data.bookings?.length || 0,
        confirmed: data.bookings?.filter((b: any) => b.status === "Confirmed").length || 0,
        pending: data.bookings?.filter((b: any) => b.status === "Pending").length || 0,
        cancelled: data.bookings?.filter((b: any) => b.status === "Cancelled").length || 0,
      }

      setBookingStats(stats)
    } catch (error) {
      console.error("Failed to fetch booking stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const StatusBadge = ({ status }: { status: string }) => {
    const getStatusColor = (status: string) => {
      switch (status.toLowerCase()) {
        case "connected":
          return "bg-green-100 text-green-800"
        case "disconnected":
          return "bg-red-100 text-red-800"
        default:
          return "bg-yellow-100 text-yellow-800"
      }
    }

    return <Badge className={getStatusColor(status)}>{status}</Badge>
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Flight Booking Bot - Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitor system status, bookings, and bot performance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Plane className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookingStats.total}</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmed Bookings</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{bookingStats.confirmed}</div>
              <p className="text-xs text-muted-foreground">
                {bookingStats.total > 0 ? Math.round((bookingStats.confirmed / bookingStats.total) * 100) : 0}% success
                rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Bookings</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{bookingStats.pending}</div>
              <p className="text-xs text-muted-foreground">Awaiting payment</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bot Conversations</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-muted-foreground">+8% from yesterday</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="database" className="space-y-6">
          <TabsList>
            <TabsTrigger value="database">Database Status</TabsTrigger>
            <TabsTrigger value="flights">Flight Management</TabsTrigger>
            <TabsTrigger value="bookings">Booking Management</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="database">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>Database Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dbStatus ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Connection Status:</span>
                      <StatusBadge status={dbStatus.status} />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-medium">Database:</span>
                      <span className="text-gray-600">{dbStatus.database}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-medium">Last Updated:</span>
                      <span className="text-gray-600">{new Date(dbStatus.lastUpdated).toLocaleString()}</span>
                    </div>

                    <div className="mt-6">
                      <h4 className="font-medium mb-3">Table Statistics</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(dbStatus.totalRecords).map(([table, count]) => (
                          <div key={table} className="bg-gray-50 p-3 rounded-lg">
                            <div className="font-medium capitalize">{table.replace("_", " ")}</div>
                            <div className="text-2xl font-bold text-blue-600">{count}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-600">Failed to load database status</p>
                    <Button onClick={fetchDatabaseStatus} className="mt-4">
                      Retry
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="flights">
            <Card>
              <CardHeader>
                <CardTitle>Flight Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900">Active Flights</h4>
                      <div className="text-2xl font-bold text-blue-600">24</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-green-900">On Time</h4>
                      <div className="text-2xl font-bold text-green-600">22</div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="font-medium text-yellow-900">Delayed</h4>
                      <div className="text-2xl font-bold text-yellow-600">2</div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-medium mb-3">Recent Flight Updates</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <span>AA1234 - New York to London</span>
                        <Badge className="bg-green-100 text-green-800">On Time</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <span>BA2156 - New York to London</span>
                        <Badge className="bg-yellow-100 text-yellow-800">Delayed 15min</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <span>DL5678 - New York to London</span>
                        <Badge className="bg-green-100 text-green-800">On Time</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>Booking Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900">Total Revenue</h4>
                      <div className="text-2xl font-bold text-blue-600">$45,230</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-green-900">Avg. Booking Value</h4>
                      <div className="text-2xl font-bold text-green-600">$1,205</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-medium text-purple-900">Conversion Rate</h4>
                      <div className="text-2xl font-bold text-purple-600">68%</div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h4 className="font-medium text-orange-900">Cancellation Rate</h4>
                      <div className="text-2xl font-bold text-orange-600">3.2%</div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-medium mb-3">Recent Bookings</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <span className="font-medium">BK12345678</span>
                          <span className="text-gray-500 ml-2">John Doe - AA1234</span>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <span className="font-medium">BK23456789</span>
                          <span className="text-gray-500 ml-2">Jane Smith - BA2156</span>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <span className="font-medium">BK34567890</span>
                          <span className="text-gray-500 ml-2">Mike Johnson - DL5678</span>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Bot Analytics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-indigo-50 p-4 rounded-lg">
                      <h4 className="font-medium text-indigo-900">User Satisfaction</h4>
                      <div className="text-2xl font-bold text-indigo-600">94.5%</div>
                      <p className="text-sm text-indigo-700">+2.3% from last week</p>
                    </div>
                    <div className="bg-teal-50 p-4 rounded-lg">
                      <h4 className="font-medium text-teal-900">Avg Response Time</h4>
                      <div className="text-2xl font-bold text-teal-600">1.2s</div>
                      <p className="text-sm text-teal-700">-0.3s improvement</p>
                    </div>
                    <div className="bg-pink-50 p-4 rounded-lg">
                      <h4 className="font-medium text-pink-900">Success Rate</h4>
                      <div className="text-2xl font-bold text-pink-600">87.3%</div>
                      <p className="text-sm text-pink-700">+5.1% this month</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Popular Search Routes</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span>New York → London</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: "85%" }}></div>
                          </div>
                          <span className="text-sm text-gray-600">342 searches</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Los Angeles → Tokyo</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: "72%" }}></div>
                          </div>
                          <span className="text-sm text-gray-600">289 searches</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Chicago → Paris</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: "58%" }}></div>
                          </div>
                          <span className="text-sm text-gray-600">234 searches</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Miami → Dubai</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: "45%" }}></div>
                          </div>
                          <span className="text-sm text-gray-600">181 searches</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Bot Performance Metrics</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Intent Recognition</span>
                          <span className="text-sm font-medium">96.2%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: "96.2%" }}></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Entity Extraction</span>
                          <span className="text-sm font-medium">91.8%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: "91.8%" }}></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Booking Completion</span>
                          <span className="text-sm font-medium">78.5%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-600 h-2 rounded-full" style={{ width: "78.5%" }}></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">User Retention</span>
                          <span className="text-sm font-medium">84.3%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-orange-600 h-2 rounded-full" style={{ width: "84.3%" }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
