import { ref } from 'vue'

export interface ConversionResult {
  blob: Blob
  url: string
  filename: string
}

export const useImageConverter =  ()  => {
  const converting = ref(false)
  const error = ref('')

  const loadImage = (file: File): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = URL.createObjectURL(file)
    })
  }

  const convertImage = async (
    file: File,
    targetFormat: 'png' | 'jpeg' | 'webp',
    quality = 0.92
  ): Promise<ConversionResult> => {
    converting.value = true
    error.value = ''

    try {
      const img = await loadImage(file)
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight

      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)

      const mimeType = `image/${targetFormat}`
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error('Conversion failed'))),
          mimeType,
          quality
        )
      })

      const baseName = file.name.replace(/\.[^.]+$/, '')
      const filename = `${baseName}.${targetFormat}`

      return { blob, url: URL.createObjectURL(blob), filename }
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      converting.value = false
    }
  }

  const imageToSvg = async (file: File): Promise<ConversionResult> => {
    converting.value = true
    error.value = ''

    try {
      const img = await loadImage(file)
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight

      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)

      // Embed the original image inside an SVG (lossless wrapper approach)
      const dataUrl = canvas.toDataURL('image/png')
      const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${img.naturalWidth}" height="${img.naturalHeight}">
  <image href="${dataUrl}" width="${img.naturalWidth}" height="${img.naturalHeight}"/>
</svg>`

      const blob = new Blob([svgContent], { type: 'image/svg+xml' })
      const baseName = file.name.replace(/\.[^.]+$/, '')
      const filename = `${baseName}.svg`

      return { blob, url: URL.createObjectURL(blob), filename }
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      converting.value = false
    }
  }

  return { converting, error, convertImage, imageToSvg }
}
