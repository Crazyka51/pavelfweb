'use client'

import React from 'react'
import MediaManager from '../components/MediaManager'
import { Button } from '@/components/ui/button'

export default function MediaPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Správa médií</h1>
      </div>
      <MediaManager />
    </div>
  )
}
