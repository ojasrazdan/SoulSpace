import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { Users, Activity, AlertTriangle, FileText, Settings, Shield, TrendingUp, Calendar, MapPin, Edit, Trash2, Eye, UserX, UserCheck, Download, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data
const mockUsers = [
  { id: 1, name: "John Doe", email: "john@student.edu", role: "student", lastLogin: "2024-01-15", status: "active", accessibility: false },
  { id: 2, name: "Jane Smith", email: "jane@student.edu", role: "student", lastLogin: "2024-01-14", status: "active", accessibility: true },
  { id: 3, name: "Admin User", email: "admin@university.edu", role: "admin", lastLogin: "2024-01-15", status: "active", accessibility: false },
  { id: 4, name: "Mike Johnson", email: "mike@student.edu", role: "student", lastLogin: "2024-01-10", status: "inactive", accessibility: false },
];

const mockAssessments = [
  { id: 1, user: "John Doe", type: "PHQ-9", score: 8, date: "2024-01-15", risk: "moderate" },
  { id: 2, user: "Jane Smith", type: "GAD-7", score: 12, date: "2024-01-14", risk: "high" },
  { id: 3, user: "Mike Johnson", type: "Stress Scale", score: 6, date: "2024-01-13", risk: "low" },
];

const mockSOSAlerts = [
  { id: 1, user: "Jane Smith", timestamp: "2024-01-15 14:30", location: "Campus Library", status: "pending", contact: "jane@student.edu" },
  { id: 2, user: "Anonymous", timestamp: "2024-01-14 22:15", location: "Dormitory Block A", status: "resolved", contact: "N/A" },
];

const mockResources = [
  { id: 1, title: "Breathing Exercise: 4-7-8 Technique", type: "exercise", visible: true, category: "breathing" },
  { id: 2, title: "Managing Exam Stress", type: "article", visible: true, category: "stress" },
  { id: 3, title: "Campus Counseling Services", type: "service", visible: true, category: "support" },
];

const mockAnalytics = {
  dailyUsers: [
    { date: "2024-01-10", users: 45 },
    { date: "2024-01-11", users: 52 },
    { date: "2024-01-12", users: 48 },
    { date: "2024-01-13", users: 65 },
    { date: "2024-01-14", users: 71 },
    { date: "2024-01-15", users: 68 },
  ],
  assessmentCompletion: [
    { name: "PHQ-9", completed: 85, total: 100 },
    { name: "GAD-7", completed: 78, total: 100 },
    { name: "Stress Scale", completed: 92, total: 100 },
    { name: "ADHD Check", completed: 45, total: 100 },
  ],
  resourcePopularity: [
    { name: "Breathing Exercises", value: 35, color: "#8884d8" },
    { name: "Articles", value: 28, color: "#82ca9d" },
    { name: "Campus Services", value: 22, color: "#ffc658" },
    { name: "Emergency Resources", value: 15, color: "#ff7300" },
  ]
};

const mockAuditLogs = [
  { id: 1, action: "User Login", user: "john@student.edu", timestamp: "2024-01-15 09:30", details: "Successful login" },
  { id: 2, action: "Resource Updated", user: "admin@university.edu", timestamp: "2024-01-15 08:15", details: "Updated breathing exercise content" },
  { id: 3, action: "SOS Alert", user: "jane@student.edu", timestamp: "2024-01-14 22:15", details: "Emergency alert triggered" },
];

const AdminDashboard = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRole, setFilterRole] = useState("all");

  const handleUserAction = (action: string, user: any) => {
    toast({
      title: "Action Performed",
      description: `${action} for user: ${user.name}`,
    });
  };

  const handleSOSAction = (action: string, alert: any) => {
    toast({
      title: "SOS Alert Updated",
      description: `${action} for alert from ${alert.user}`,
    });
  };

  const handleResourceAction = (action: string, resource: any) => {
    toast({
      title: "Resource Updated",
      description: `${action}: ${resource.title}`,
    });
  };

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || user.status === filterStatus;
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesStatus && matchesRole;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          <span className="text-sm text-muted-foreground">Administrator Panel</span>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="sos">SOS Alerts</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users Today</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">68</div>
                <p className="text-xs text-muted-foreground">+5% from yesterday</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">SOS Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">2 pending, 1 resolved</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Assessment Completion</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">78%</div>
                <p className="text-xs text-muted-foreground">+3% from last week</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockAnalytics.dailyUsers}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resource Popularity</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={mockAnalytics.resourcePopularity}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {mockAnalytics.resourcePopularity.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage student and admin accounts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Accessibility</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.lastLogin}</TableCell>
                      <TableCell>
                        <Badge variant={user.status === "active" ? "default" : "destructive"}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.accessibility ? "default" : "outline"}>
                          {user.accessibility ? "Enabled" : "Disabled"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleUserAction("View Profile", user)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleUserAction("Edit", user)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleUserAction(user.status === "active" ? "Disable" : "Enable", user)}
                          >
                            {user.status === "active" ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete User Account</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {user.name}'s account? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleUserAction("Delete", user)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessments" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Assessment Completion Rates</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockAnalytics.assessmentCompletion}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="completed" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>High-Risk Users</CardTitle>
                <CardDescription>Users requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAssessments.filter(a => a.risk === "high").map((assessment) => (
                    <div key={assessment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{assessment.user}</p>
                        <p className="text-sm text-muted-foreground">{assessment.type} - Score: {assessment.score}</p>
                      </div>
                      <Badge variant="destructive">{assessment.risk}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Assessment Results</CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Assessment Type</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockAssessments.map((assessment) => (
                    <TableRow key={assessment.id}>
                      <TableCell className="font-medium">{assessment.user}</TableCell>
                      <TableCell>{assessment.type}</TableCell>
                      <TableCell>{assessment.score}</TableCell>
                      <TableCell>
                        <Badge variant={
                          assessment.risk === "high" ? "destructive" : 
                          assessment.risk === "moderate" ? "default" : "secondary"
                        }>
                          {assessment.risk}
                        </Badge>
                      </TableCell>
                      <TableCell>{assessment.date}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Emergency Alerts Dashboard</CardTitle>
              <CardDescription>Monitor and respond to SOS alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockSOSAlerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell className="font-medium">{alert.user}</TableCell>
                      <TableCell>{alert.timestamp}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {alert.location}
                        </div>
                      </TableCell>
                      <TableCell>{alert.contact}</TableCell>
                      <TableCell>
                        <Badge variant={alert.status === "pending" ? "destructive" : "default"}>
                          {alert.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {alert.status === "pending" && (
                            <>
                              <Button size="sm" onClick={() => handleSOSAction("Mark as Resolved", alert)}>
                                Resolve
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleSOSAction("Notify Campus Security", alert)}>
                                Notify Security
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleSOSAction("Contact Counselor", alert)}>
                                Contact Counselor
                              </Button>
                            </>
                          )}
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content & Resources Management</CardTitle>
              <CardDescription>Manage articles, exercises, and campus resources</CardDescription>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add New Resource
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Visibility</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockResources.map((resource) => (
                    <TableRow key={resource.id}>
                      <TableCell className="font-medium">{resource.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{resource.type}</Badge>
                      </TableCell>
                      <TableCell>{resource.category}</TableCell>
                      <TableCell>
                        <Switch 
                          checked={resource.visible} 
                          onCheckedChange={() => handleResourceAction("Toggle Visibility", resource)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleResourceAction("Edit", resource)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleResourceAction("View", resource)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Resource</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{resource.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleResourceAction("Delete", resource)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Engagement Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockAnalytics.dailyUsers}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Assessment Completion</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockAnalytics.assessmentCompletion}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="completed" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Key Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-3xl font-bold text-primary">87%</div>
                  <div className="text-sm text-muted-foreground">Assessment Completion Rate</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-3xl font-bold text-primary">12</div>
                  <div className="text-sm text-muted-foreground">SOS Alerts This Month</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-3xl font-bold text-primary">23%</div>
                  <div className="text-sm text-muted-foreground">Users with Accessibility Enabled</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Configure SOS alert templates and notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sos-template">SOS Alert Template</Label>
                  <Textarea
                    id="sos-template"
                    placeholder="Template for SOS alert notifications..."
                    defaultValue="URGENT: Student emergency alert received. Location: {location}. Time: {timestamp}. Please respond immediately."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="counselor-template">Counselor Notification Template</Label>
                  <Textarea
                    id="counselor-template"
                    placeholder="Template for counselor notifications..."
                    defaultValue="Assessment alert: Student {name} scored {score} on {assessment}. Risk level: {risk}. Please consider follow-up."
                  />
                </div>
                <Button>Save Templates</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Emergency Contacts</CardTitle>
                <CardDescription>Manage campus security and emergency contact numbers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="campus-security">Campus Security</Label>
                  <Input id="campus-security" defaultValue="(555) 123-4567" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="counseling-center">Counseling Center</Label>
                  <Input id="counseling-center" defaultValue="(555) 234-5678" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="crisis-hotline">Crisis Hotline</Label>
                  <Input id="crisis-hotline" defaultValue="(555) 345-6789" />
                </div>
                <Button>Update Contacts</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>App Configuration</CardTitle>
                <CardDescription>Default settings and data collection options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="accessibility-default">Enable Accessibility by Default</Label>
                  <Switch id="accessibility-default" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="anonymous-reporting">Allow Anonymous SOS Reports</Label>
                  <Switch id="anonymous-reporting" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="location-tracking">Enable Location Tracking for SOS</Label>
                  <Switch id="location-tracking" defaultChecked />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                  <Input id="session-timeout" type="number" defaultValue="60" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Audit Logs</CardTitle>
                <CardDescription>Recent system activities and admin actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {mockAuditLogs.map((log) => (
                    <div key={log.id} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <div className="font-medium">{log.action}</div>
                        <div className="text-sm text-muted-foreground">{log.user}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">{log.timestamp}</div>
                        <div className="text-xs text-muted-foreground">{log.details}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;