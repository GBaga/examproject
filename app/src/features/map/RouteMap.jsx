import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useMemo } from 'react'
import { MapContainer, Marker, Polyline, Popup, TileLayer, Tooltip } from 'react-leaflet'
import { CITIES, getCity } from '../../lib/cities'

// Leaflet-ის სტანდარტული PNG ხატულები Vite-ში ბილიკის პრობლემას იწვევს,
// ამიტომ ვიყენებთ CSS/HTML-ზე დაფუძნებულ divIcon-ს.
const pin = (color, label) =>
  L.divIcon({
    className: '',
    html: `<div style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${color};border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35)"><span style="transform:rotate(45deg);color:#fff;font:700 12px sans-serif">${label}</span></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -28],
  })

const START = pin('#0f5257', 'A')
const END = pin('#d98a1f', 'B')
const DOT = L.divIcon({
  className: '',
  html: '<div style="width:10px;height:10px;border-radius:50%;background:#1f7f84;border:2px solid #fff;box-shadow:0 0 0 1px #1f7f84"></div>',
  iconSize: [10, 10],
  iconAnchor: [5, 5],
})

/**
 * მარშრუტის რუკა: საწყისი (A) და საბოლოო (B) წერტილი, დამაკავშირებელი ხაზი
 * და სხვა ქალაქების მარკერები. ხაზი სწორია (საგზაო მარშრუტიზაციის API არ გამოიყენება).
 */
export default function RouteMap({ from, to, height = 320, showAllCities = true }) {
  const a = getCity(from)
  const b = getCity(to)

  const bounds = useMemo(() => {
    if (!a || !b) return null
    return L.latLngBounds([a.lat, a.lng], [b.lat, b.lng]).pad(0.35)
  }, [a, b])

  if (!a || !b) return null

  return (
    <div className="overflow-hidden rounded-2xl border border-line" style={{ height }}>
      <MapContainer bounds={bounds} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {showAllCities &&
          CITIES.filter((c) => c.id !== a.id && c.id !== b.id).map((c) => (
            <Marker key={c.id} position={[c.lat, c.lng]} icon={DOT}>
              <Tooltip direction="top" offset={[0, -4]}>
                {c.name}
              </Tooltip>
            </Marker>
          ))}
        <Polyline
          positions={[
            [a.lat, a.lng],
            [b.lat, b.lng],
          ]}
          pathOptions={{ color: '#0f5257', weight: 4, dashArray: '8 8' }}
        />
        <Marker position={[a.lat, a.lng]} icon={START}>
          <Popup>გამგზავრება: {a.name}</Popup>
        </Marker>
        <Marker position={[b.lat, b.lng]} icon={END}>
          <Popup>დანიშნულება: {b.name}</Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}
