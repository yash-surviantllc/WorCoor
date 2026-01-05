import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AnalyticsLoading() {
  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-[350px]" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-[180px]" />
          <Skeleton className="h-10 w-[180px]" />
          <Skeleton className="h-10 w-[180px]" />
        </div>
      </div>

      {/* KPI Cards Loading */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array(4)
          .fill(null)
          .map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-5 w-[120px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[100px] mb-2" />
                <Skeleton className="h-4 w-[150px]" />
              </CardContent>
            </Card>
          ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" disabled>
            Overview
          </TabsTrigger>
          <TabsTrigger value="productivity" disabled>
            Productivity
          </TabsTrigger>
          <TabsTrigger value="inventory" disabled>
            Inventory
          </TabsTrigger>
          <TabsTrigger value="financial" disabled>
            Financial
          </TabsTrigger>
          <TabsTrigger value="quality" disabled>
            Quality
          </TabsTrigger>
          <TabsTrigger value="operational" disabled>
            Operational
          </TabsTrigger>
          <TabsTrigger value="products" disabled>
            Products
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {Array(2)
              .fill(null)
              .map((_, i) => (
                <Card key={i} className="p-6">
                  <CardHeader>
                    <Skeleton className="h-6 w-[180px] mb-2" />
                    <Skeleton className="h-4 w-[250px]" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-[300px] w-full" />
                  </CardContent>
                </Card>
              ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {Array(2)
              .fill(null)
              .map((_, i) => (
                <Card key={i} className="p-6">
                  <CardHeader>
                    <Skeleton className="h-6 w-[180px] mb-2" />
                    <Skeleton className="h-4 w-[250px]" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-[300px] w-full" />
                  </CardContent>
                </Card>
              ))}
          </div>

          <Card className="p-6">
            <CardHeader>
              <Skeleton className="h-6 w-[180px] mb-2" />
              <Skeleton className="h-4 w-[250px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
