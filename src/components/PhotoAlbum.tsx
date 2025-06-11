'use client'

import { useState, useEffect } from 'react'
import { Photo } from '@/types'
import { Language, useTranslation } from '@/lib/i18n'

interface PhotoAlbumProps {
  language: Language
}

export default function PhotoAlbum({ language }: PhotoAlbumProps) {
  const t = useTranslation(language)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    uploadedBy: '',
    caption: ''
  })

  useEffect(() => {
    fetchPhotos()
  }, [])

  const fetchPhotos = async () => {
    try {
      const response = await fetch('/api/photos')
      if (response.ok) {
        const data = await response.json()
        setPhotos(data.photos || [])
      }
    } catch (error) {
      console.error('Error fetching photos:', error)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !uploadForm.uploadedBy) {
      alert('Please enter your name and select a photo')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('photo', file)
      formData.append('uploadedBy', uploadForm.uploadedBy)
      formData.append('caption', uploadForm.caption)

      const response = await fetch('/api/photos', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        setUploadForm({ uploadedBy: '', caption: '' })
        fetchPhotos()
        // Reset file input
        if (e.target) {
          e.target.value = ''
        }
      }
    } catch (error) {
      console.error('Error uploading photo:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Photo Memories</h2>
      
      <div className="bg-gray-50 p-6 rounded-lg mb-8">
        <h3 className="text-lg font-medium mb-4">Share a Photo</h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="uploader-name" className="block text-sm font-medium text-gray-700 mb-2">
              Your Name *
            </label>
            <input
              type="text"
              id="uploader-name"
              value={uploadForm.uploadedBy}
              onChange={(e) => setUploadForm({...uploadForm, uploadedBy: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="photo-caption" className="block text-sm font-medium text-gray-700 mb-2">
              Caption (optional)
            </label>
            <input
              type="text"
              id="photo-caption"
              value={uploadForm.caption}
              onChange={(e) => setUploadForm({...uploadForm, caption: e.target.value})}
              placeholder="Describe the memory..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="photo-upload" className="block text-sm font-medium text-gray-700 mb-2">
              Photo *
            </label>
            <input
              type="file"
              id="photo-upload"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading || !uploadForm.uploadedBy}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {uploading && (
              <p className="text-sm text-gray-600 mt-2">Uploading...</p>
            )}
          </div>
        </div>
      </div>

      {photos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map(photo => (
            <div key={photo.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <img
                src={`/api/photos/${photo.filename}`}
                alt={photo.caption || 'Memorial photo'}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                {photo.caption && (
                  <p className="text-gray-800 mb-2">{photo.caption}</p>
                )}
                <p className="text-sm text-gray-600">
                  Shared by {photo.uploadedBy}
                </p>
                {photo.createdAt && (
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(photo.createdAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No photos have been shared yet.</p>
          <p className="text-sm">Be the first to share a memory!</p>
        </div>
      )}
    </div>
  )
}