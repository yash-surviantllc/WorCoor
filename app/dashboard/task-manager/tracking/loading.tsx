import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TaskTrackingLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-10 w-[250px]" />
        <Skeleton className="h-4 w-[350px]" />
      </div>

      {/* Task Summary Cards Skeletons */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  <Skeleton className="h-4 w-[100px]" />
                </CardTitle>
                <Skeleton className="h-4 w-4 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[60px] mb-2" />
                <Skeleton className="h-2 w-full" />
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Filters and Search Skeletons */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <Skeleton className="h-10 w-full md:max-w-sm" />
          <Skeleton className="h-10 w-10" />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-[50px]" />
            <Skeleton className="h-10 w-[140px]" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-[80px]" />
            <Skeleton className="h-10 w-[160px]" />
          </div>
        </div>
      </div>

      {/* Task Status Tabs Skeletons */}
      <Skeleton className="h-10 w-full" />

      {/* Table Skeleton */}
      <div className="rounded-md border">
        <div className="p-4">
          <div className="flex flex-col gap-4">
            <Skeleton className="h-12 w-full" />
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
