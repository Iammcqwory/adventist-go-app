import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-slate-200 dark:bg-gray-700",
        className
      )}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="border border-slate-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-900">
      <div className="space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
        </div>
      </div>
    </div>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function CountdownSkeleton() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Skeleton className="h-8 w-64 mx-auto mb-2" />
        <Skeleton className="h-4 w-48 mx-auto" />
      </div>
      
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div className="text-center space-y-4">
          <Skeleton className="h-6 w-32 mx-auto" />
          <Skeleton className="h-16 w-48 mx-auto" />
          <Skeleton className="h-4 w-24 mx-auto" />
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div className="border border-slate-200 dark:border-gray-800 rounded-lg p-4 bg-white dark:bg-black">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-8 w-24 mb-2" />
          <Skeleton className="h-3 w-20" />
        </div>
        <div className="border border-slate-200 dark:border-gray-800 rounded-lg p-4 bg-white dark:bg-black">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-8 w-24 mb-2" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
}

export function HymnsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Skeleton className="h-8 w-48 mx-auto mb-2" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </div>
      
      <div className="border border-slate-200 dark:border-gray-800 rounded-lg p-6 bg-white dark:bg-black">
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-full" />
          <div className="grid md:grid-cols-3 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
      
      <div className="border border-slate-200 dark:border-gray-800 rounded-lg p-6 bg-white dark:bg-black">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-8 w-32" />
        </div>
        <ListSkeleton count={5} />
      </div>
    </div>
  );
}

export function DevotionalsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Skeleton className="h-8 w-56 mx-auto mb-2" />
        <Skeleton className="h-4 w-72 mx-auto" />
      </div>
      
      <div className="border border-slate-200 dark:border-gray-800 rounded-lg p-6 bg-white dark:bg-black">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-32" />
          <div className="flex items-center space-x-4">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-10 w-48" />
          </div>
        </div>
        <ListSkeleton count={4} />
      </div>
    </div>
  );
}

export function SabbathSchoolSkeleton() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Skeleton className="h-8 w-48 mx-auto mb-2" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </div>
      
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="space-y-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
            <Skeleton className="h-5 w-2/3 mb-2" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-10 w-48" />
        </div>
      </div>
      
      <div className="border border-slate-200 dark:border-gray-800 rounded-lg p-6 bg-white dark:bg-black">
        <Skeleton className="h-6 w-48 mb-4" />
        <div className="grid md:grid-cols-2 gap-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    </div>
  );
}

export function ChurchFinderSkeleton() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Skeleton className="h-8 w-48 mx-auto mb-2" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </div>
      
      <div className="border border-slate-200 dark:border-gray-800 rounded-lg p-6 bg-white dark:bg-black">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-4 w-8" />
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border border-slate-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-900">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BibleLookupSkeleton() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Skeleton className="h-8 w-48 mx-auto mb-2" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </div>
      
      <div className="border border-slate-200 dark:border-gray-800 rounded-lg p-6 bg-white dark:bg-black">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <div className="grid md:grid-cols-4 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
      
      <div className="border border-slate-200 dark:border-gray-800 rounded-lg p-6 bg-white dark:bg-black">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-8 w-32" />
        </div>
        <ListSkeleton count={5} />
      </div>
    </div>
  );
}
