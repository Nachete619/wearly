export interface LocationData {
  name: string
  lat: number
  lng: number
}

export function formatCoordinates(lat: number, lng: number): string {
  const latDir = lat >= 0 ? "N" : "S"
  const lngDir = lng >= 0 ? "E" : "W"

  return `${Math.abs(lat).toFixed(6)}°${latDir}, ${Math.abs(lng).toFixed(6)}°${lngDir}`
}

export function generateMapUrls(lat: number, lng: number, name?: string) {
  const encodedName = name ? encodeURIComponent(name) : ""

  return {
    google: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}${name ? `&query_place_id=${encodedName}` : ""}`,
    waze: `https://waze.com/ul?ll=${lat},${lng}&navigate=yes${name ? `&q=${encodedName}` : ""}`,
    apple: `http://maps.apple.com/?ll=${lat},${lng}${name ? `&q=${encodedName}` : ""}`,
  }
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = text
      textArea.style.position = "fixed"
      textArea.style.left = "-999999px"
      textArea.style.top = "-999999px"
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      const success = document.execCommand("copy")
      textArea.remove()
      return success
    }
  } catch (error) {
    console.error("Failed to copy to clipboard:", error)
    return false
  }
}

export function getCurrentLocation(): Promise<LocationData> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser"))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          name: "Mi ubicación actual",
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      },
      (error) => {
        reject(error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      },
    )
  })
}
