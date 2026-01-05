import type { LucideIcon } from "lucide-react"

interface PageTitleProps {
  title: string
  description?: string
  icon?: LucideIcon
}

export function PageTitle({ title, description, icon: Icon }: PageTitleProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        )}
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
      </div>
      {description && <p className="text-muted-foreground leading-relaxed">{description}</p>}
    </div>
  )
}
