export default function NewsCardSkeleton() {
    return (
      <div className="bg-card border border-border rounded-lg overflow-hidden animate-pulse">
        <div className="aspect-video bg-muted"></div>
        
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="h-5 w-16 bg-muted rounded"></div>
              <div className="h-5 w-12 bg-muted rounded"></div>
            </div>
            <div className="h-6 w-6 bg-muted rounded"></div>
          </div>
          
          <div className="space-y-2 mb-3">
            <div className="h-5 bg-muted rounded w-full"></div>
            <div className="h-5 bg-muted rounded w-3/4"></div>
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="h-4 w-20 bg-muted rounded"></div>
            <div className="h-4 w-16 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    )
  }