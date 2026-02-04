'use client'

import { useState } from 'react'
import Image from 'next/image'
import { supabaseClient } from '@/lib/supabase-client'

export default function ImageUploader({
  onUpload
}: {
  onUpload: (url: string) => void
}) {
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setLoading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${crypto.randomUUID()}.${fileExt}`
      const { data, error } = await supabaseClient.storage
        .from('rost-assets')
        .upload(`covers/${fileName}`, file, {
          cacheControl: '3600',
          upsert: true
        })
      if (error) {
        throw error
      }
      const { data: publicData } = supabaseClient.storage
        .from('rost-assets')
        .getPublicUrl(data.path)
      if (publicData.publicUrl) {
        setPreview(publicData.publicUrl)
        onUpload(publicData.publicUrl)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <label className="group flex cursor-pointer flex-col rounded-3xl border border-dashed border-peat/40 bg-white/60 p-4 text-sm font-semibold text-peat transition hover:border-ember">
      <span>{loading ? 'Uploading...' : 'Drop a cover image (optional)'}</span>
      <input type="file" accept="image/*" className="mt-3 hidden" onChange={handleChange} />
      {preview ? (
        <div className="mt-4 h-24 w-full overflow-hidden rounded-2xl">
          <Image
            src={preview}
            alt="cover"
            width={640}
            height={320}
            className="h-full w-full object-cover"
            priority={false}
          />
        </div>
      ) : null}
    </label>
  )
}
