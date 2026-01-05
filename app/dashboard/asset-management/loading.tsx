import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-10 w-[250px]" />
        <Skeleton className="h-4 w-[350px]" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array(4)
          .fill(null)
          .map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  <Skeleton className="h-4 w-[100px]" />
                </CardTitle>
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

      <div className="grid gap-6 md:grid-cols-2">
        {Array(2)
          .fill(null)
          .map((_, i) => (
            <Card key={i} className="border-l-4 border-l-gray-300">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-10 w-10 rounded-md" />
                  <Skeleton className="h-6 w-[150px]" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  <Skeleton className="h-4 w-full" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-6 w-[80px] rounded-full" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                </div>
              </CardContent>
              <div className="px-6 pb-4">
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            </Card>
          ))}
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[150px] mb-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(3)
              .fill(null)
              .map((_, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <Skeleton className="h-5 w-[200px] mb-1" />
                    <Skeleton className="h-4 w-[250px]" />
                  </div>
                  <Skeleton className="h-6 w-[80px] rounded-full" />
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
