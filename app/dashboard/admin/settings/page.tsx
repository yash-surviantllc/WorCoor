"use client"

import { useState } from "react"
import { Bell, Clock, Database, Globe, Mail, Save, Shield, Cog, Settings } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { PageHeader } from "@/components/dashboard/page-header"

export default function SystemSettingsPage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSaveSettings = () => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Settings saved",
        description: "Your system settings have been saved successfully.",
      })
    }, 1500)
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="System Settings" description="Configure and manage system-wide settings" icon={Settings} />

      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                General Settings
              </CardTitle>
              <CardDescription>Configure general system settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input id="company-name" defaultValue="WorkForce Inc." />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="system-email">System Email</Label>
                <Input id="system-email" type="email" defaultValue="system@workforce.com" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select defaultValue="utc">
                  <SelectTrigger id="timezone">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utc">UTC (Coordinated Universal Time)</SelectItem>
                    <SelectItem value="est">EST (Eastern Standard Time)</SelectItem>
                    <SelectItem value="cst">CST (Central Standard Time)</SelectItem>
                    <SelectItem value="mst">MST (Mountain Standard Time)</SelectItem>
                    <SelectItem value="pst">PST (Pacific Standard Time)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date-format">Date Format</Label>
                <RadioGroup defaultValue="mm-dd-yyyy" className="flex flex-col space-y-1">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mm-dd-yyyy" id="mm-dd-yyyy" />
                    <Label htmlFor="mm-dd-yyyy">MM-DD-YYYY</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dd-mm-yyyy" id="dd-mm-yyyy" />
                    <Label htmlFor="dd-mm-yyyy">DD-MM-YYYY</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yyyy-mm-dd" id="yyyy-mm-dd" />
                    <Label htmlFor="yyyy-mm-dd">YYYY-MM-DD</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="maintenance-mode" />
                <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} disabled={isLoading} className="ml-auto">
                {isLoading ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Configure security and access control settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="password-policy">Password Policy</Label>
                <Select defaultValue="strong">
                  <SelectTrigger id="password-policy">
                    <SelectValue placeholder="Select password policy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic (8+ characters)</SelectItem>
                    <SelectItem value="medium">Medium (8+ chars, letters & numbers)</SelectItem>
                    <SelectItem value="strong">Strong (8+ chars, uppercase, lowercase, numbers)</SelectItem>
                    <SelectItem value="very-strong">
                      Very Strong (12+ chars, uppercase, lowercase, numbers, symbols)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                <Input id="session-timeout" type="number" defaultValue="30" />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="two-factor" defaultChecked />
                <Label htmlFor="two-factor">Enable Two-Factor Authentication</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="ip-restriction" />
                <Label htmlFor="ip-restriction">IP Address Restriction</Label>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="allowed-ips">Allowed IP Addresses (one per line)</Label>
                <Textarea id="allowed-ips" placeholder="Enter IP addresses..." />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} disabled={isLoading} className="ml-auto">
                {isLoading ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>Configure system notifications and alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Email Notifications</h3>
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-user-registration">User Registration</Label>
                  <Switch id="email-user-registration" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-task-assignment">Task Assignment</Label>
                  <Switch id="email-task-assignment" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-inventory-alerts">Inventory Alerts</Label>
                  <Switch id="email-inventory-alerts" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-system-alerts">System Alerts</Label>
                  <Switch id="email-system-alerts" defaultChecked />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">In-App Notifications</h3>
                <div className="flex items-center justify-between">
                  <Label htmlFor="inapp-user-registration">User Registration</Label>
                  <Switch id="inapp-user-registration" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="inapp-task-assignment">Task Assignment</Label>
                  <Switch id="inapp-task-assignment" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="inapp-inventory-alerts">Inventory Alerts</Label>
                  <Switch id="inapp-inventory-alerts" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="inapp-system-alerts">System Alerts</Label>
                  <Switch id="inapp-system-alerts" defaultChecked />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="smtp-server">SMTP Server</Label>
                <Input id="smtp-server" defaultValue="smtp.workforce.com" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="smtp-port">SMTP Port</Label>
                <Input id="smtp-port" defaultValue="587" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="smtp-username">SMTP Username</Label>
                <Input id="smtp-username" defaultValue="notifications@workforce.com" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="smtp-password">SMTP Password</Label>
                <Input id="smtp-password" type="password" defaultValue="********" />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} disabled={isLoading} className="ml-auto">
                {isLoading ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Settings
              </CardTitle>
              <CardDescription>Configure database connection and backup settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="db-host">Database Host</Label>
                <Input id="db-host" defaultValue="localhost" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="db-port">Database Port</Label>
                <Input id="db-port" defaultValue="3306" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="db-name">Database Name</Label>
                <Input id="db-name" defaultValue="workforce_db" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="db-username">Database Username</Label>
                <Input id="db-username" defaultValue="workforce_user" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="db-password">Database Password</Label>
                <Input id="db-password" type="password" defaultValue="********" />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="auto-backup" defaultChecked />
                <Label htmlFor="auto-backup">Enable Automatic Backups</Label>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="backup-frequency">Backup Frequency</Label>
                <Select defaultValue="daily">
                  <SelectTrigger id="backup-frequency">
                    <SelectValue placeholder="Select backup frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="backup-retention">Backup Retention (days)</Label>
                <Input id="backup-retention" type="number" defaultValue="30" />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} disabled={isLoading} className="ml-auto">
                {isLoading ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Integrations
              </CardTitle>
              <CardDescription>Configure third-party integrations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Available Integrations</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Google Workspace</Label>
                    <p className="text-sm text-muted-foreground">Integrate with Google Calendar and Gmail</p>
                  </div>
                  <Switch id="google-integration" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Microsoft 365</Label>
                    <p className="text-sm text-muted-foreground">Integrate with Outlook and Teams</p>
                  </div>
                  <Switch id="microsoft-integration" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Slack</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications in Slack channels</p>
                  </div>
                  <Switch id="slack-integration" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Stripe</Label>
                    <p className="text-sm text-muted-foreground">Process payments and invoices</p>
                  </div>
                  <Switch id="stripe-integration" defaultChecked />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="slack-webhook">Slack Webhook URL</Label>
                <Input
                  id="slack-webhook"
                  defaultValue=""
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stripe-api-key">Stripe API Key</Label>
                <Input
                  id="stripe-api-key"
                  defaultValue=""
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="api-key">System API Key</Label>
                <div className="flex gap-2">
                  <Input id="api-key" defaultValue="" readOnly />
                  <Button variant="outline">Regenerate</Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} disabled={isLoading} className="ml-auto">
                {isLoading ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cog className="h-5 w-5" />
                Advanced Settings
              </CardTitle>
              <CardDescription>Configure advanced system settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch id="debug-mode" />
                <Label htmlFor="debug-mode">Enable Debug Mode</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="cache" defaultChecked />
                <Label htmlFor="cache">Enable System Cache</Label>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cache-ttl">Cache TTL (seconds)</Label>
                <Input id="cache-ttl" type="number" defaultValue="3600" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="log-level">Log Level</Label>
                <Select defaultValue="info">
                  <SelectTrigger id="log-level">
                    <SelectValue placeholder="Select log level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="debug">Debug</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="log-retention">Log Retention (days)</Label>
                <Input id="log-retention" type="number" defaultValue="30" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="custom-css">Custom CSS</Label>
                <Textarea id="custom-css" placeholder="Enter custom CSS..." className="font-mono" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="custom-js">Custom JavaScript</Label>
                <Textarea id="custom-js" placeholder="Enter custom JavaScript..." className="font-mono" />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} disabled={isLoading} className="ml-auto">
                {isLoading ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
