import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-10 w-[250px]" />
        <Skeleton className="h-5 w-[350px]" />
      </div>

      {/* KPI Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <Card key={`kpi-${i}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-5 w-[100px]" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[60px] mb-1" />
                <Skeleton className="h-4 w-[120px] mb-2" />
                <Skeleton className="h-2 w-full" />
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Main Feature Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <Card key={`feature-${i}`} className="border-l-4 border-l-gray-200">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-9 w-9 rounded-md" />
                  <Skeleton className="h-6 w-[150px]" />
                </div>
                <Skeleton className="h-4 w-[200px] mt-1" />
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-5 w-[80px] rounded-full" />
                  </div>
                  <Skeleton className="h-1.5 w-full" />
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full rounded-md" />
              </CardFooter>
            </Card>
          ))}
      </div>

      {/* Quick Access Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {Array(2)
          .fill(0)
          .map((_, i) => (
            <Card key={`quick-${i}`}>
              <CardHeader>
                <Skeleton className="h-6 w-[180px]" />
                <Skeleton className="h-4 w-[220px]" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array(3)
                    .fill(0)
                    .map((_, j) => (
                      <div key={`item-${i}-${j}`} className="flex items-center justify-between border-b pb-2">
                        <div>
                          <Skeleton className="h-5 w-[150px] mb-1" />
                          <Skeleton className="h-4 w-[180px]" />
                        </div>
                        <Skeleton className="h-6 w-[80px] rounded-full" />
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  )
}
