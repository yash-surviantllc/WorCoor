import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TaskManagerLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-10 w-[250px]" />
        <Skeleton className="h-4 w-[350px]" />
      </div>

      {/* Quick Stats Skeletons */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  <Skeleton className="h-4 w-[100px]" />
                </CardTitle>
                <Skeleton className="h-4 w-4 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[60px] mb-2" />
                <Skeleton className="h-4 w-[100px] mb-2" />
                <Skeleton className="h-2 w-full" />
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Main Feature Cards Skeletons */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <Card key={i} className="flex flex-col h-full">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-9 w-9 rounded-md" />
                  <Skeleton className="h-6 w-[150px]" />
                </div>
                <Skeleton className="h-4 w-[200px] mt-1" />
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-4">
                  {Array(3)
                    .fill(0)
                    .map((_, j) => (
                      <div key={j} className="flex items-center justify-between">
                        <Skeleton className="h-4 w-[120px]" />
                        <Skeleton className="h-6 w-[80px] rounded-full" />
                      </div>
                    ))}
                </div>
              </CardContent>
              <div className="p-6 pt-0">
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            </Card>
          ))}
      </div>

      {/* Quick Access Section Skeletons */}
      <div className="grid gap-6 md:grid-cols-2">
        {Array(2)
          .fill(0)
          .map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-[150px]" />
                <Skeleton className="h-4 w-[200px]" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array(3)
                    .fill(0)
                    .map((_, j) => (
                      <div key={j} className="flex items-center justify-between">
                        <div>
                          <Skeleton className="h-5 w-[150px] mb-1" />
                          <Skeleton className="h-4 w-[100px]" />
                        </div>
                        <Skeleton className="h-6 w-[100px] rounded-full" />
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
