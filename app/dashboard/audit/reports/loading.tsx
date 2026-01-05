import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function AuditReportsLoading() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-[250px]" />
          <Skeleton className="h-4 w-[450px]" />
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <Skeleton className="h-10 w-[400px]" />
            <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
              <Skeleton className="h-9 w-full sm:w-[200px]" />
              <div className="flex gap-2">
                <Skeleton className="h-9 w-[80px]" />
                <Skeleton className="h-9 w-[80px]" />
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-[150px] mb-2" />
              <Skeleton className="h-4 w-[250px]" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {Array(6)
                        .fill(0)
                        .map((_, i) => (
                          <TableHead key={i}>
                            <Skeleton className="h-5 w-full" />
                          </TableHead>
                        ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array(4)
                      .fill(0)
                      .map((_, i) => (
                        <TableRow key={i}>
                          {Array(6)
                            .fill(0)
                            .map((_, j) => (
                              <TableCell key={j}>
                                <Skeleton className="h-4 w-full" />
                              </TableCell>
                            ))}
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
