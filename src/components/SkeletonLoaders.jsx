import { Skeleton } from './ui/skeleton'
import { Card, CardContent, CardHeader } from './ui/card'

// Feed Skeleton
export function FeedSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="bg-white dark:bg-gray-800 shadow-sm border-0">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-center space-x-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 px-4 sm:px-6">
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-4" />
            <Skeleton className="h-48 w-full rounded-lg mb-4" />
            <div className="flex items-center space-x-4">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Profile Skeleton
export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Profile Header Skeleton */}
      <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-6">
            <Skeleton className="w-24 h-24 rounded-full" />
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <div className="flex items-center space-x-6 mb-4">
                <div className="text-center">
                  <Skeleton className="h-6 w-8 mx-auto mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <div className="text-center">
                  <Skeleton className="h-6 w-8 mx-auto mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-4 w-64 mb-4" />
            </div>
            <Skeleton className="h-10 w-24" />
          </div>
        </CardContent>
      </Card>

      {/* Profile Sections Skeleton */}
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="bg-white dark:bg-gray-800 border-0 shadow-sm">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Notifications Skeleton
export function NotificationsSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <Card key={i} className="bg-white dark:bg-gray-800 border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start space-x-4">
              <Skeleton className="w-5 h-5 rounded" />
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16 rounded-full" />
                  <Skeleton className="w-2 h-2 rounded-full" />
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-3 w-20" />
              </div>
              <div className="flex space-x-2">
                <Skeleton className="w-8 h-8 rounded" />
                <Skeleton className="w-8 h-8 rounded" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Search Results Skeleton
export function SearchResultsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="bg-white dark:bg-gray-800 border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-16 rounded-full" />
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <Skeleton className="w-5 h-5 rounded" />
                  <Skeleton className="h-4 w-20 rounded-full" />
                </div>
                <div className="space-y-1 mb-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-4" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Post Card Skeleton
export function PostCardSkeleton() {
  return (
    <Card className="bg-white dark:bg-gray-800 shadow-sm border-0">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 flex-wrap">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16 rounded-full" />
              </div>
              <Skeleton className="h-3 w-20 mt-1" />
            </div>
          </div>
          <Skeleton className="w-8 h-8 rounded" />
        </div>
      </CardHeader>
      <CardContent className="pt-0 px-4 sm:px-6">
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-4" />
        <Skeleton className="h-48 w-full rounded-lg mb-4" />
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Tournament Skeleton
export function TournamentSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="bg-white dark:bg-gray-800 shadow-sm border-0">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <div className="flex items-center space-x-2 mb-2">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-12 rounded-full" />
                </div>
              </div>
              <Skeleton className="w-16 h-16 rounded-lg" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Skeleton className="w-4 h-4" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex items-center space-x-2">
                <Skeleton className="w-4 h-4" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="flex items-center space-x-2">
                <Skeleton className="w-4 h-4" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="flex items-center space-x-2">
                <Skeleton className="w-4 h-4" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex items-center space-x-2">
                <Skeleton className="w-4 h-4" />
                <Skeleton className="h-4 w-28" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <Skeleton className="h-2 w-8 rounded-full" />
                </div>
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Dashboard Stats Skeleton
export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="bg-white dark:bg-gray-800 shadow-sm border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </div>
              <Skeleton className="w-12 h-12 rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}