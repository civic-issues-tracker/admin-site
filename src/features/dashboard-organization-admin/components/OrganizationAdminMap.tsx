import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const createPin = (color: string) =>
  L.divIcon({
    className: 'organization-admin-map-pin',
    html: `
      <div style="display:flex;align-items:center;justify-content:center;">
        <div style="width:18px;height:18px;border-radius:9999px;background:${color};border:3px solid white;box-shadow:0 8px 18px rgba(0,0,0,.18);"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

export default function OrganizationAdminMap({ center, sites }: { center: [number, number]; sites: { ticket: any; name: string; lat: number; lng: number }[] }) {
  return (
    <MapContainer center={center} zoom={14} className="h-full w-full" scrollWheelZoom>
      <TileLayer url={import.meta.env.VITE_MAP_TILE_URL ?? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'} />
      {sites.map((site) => {
        const tone = site.ticket?.priority === 'High' ? '#EF4444' : site.ticket?.priority === 'Medium' ? '#F59E0B' : '#10B981';
        return (
          <Marker key={site.ticket?.id ?? site.name} position={[site.lat, site.lng]} icon={createPin(tone)}>
            <Popup>
              <div className="min-w-45">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8A725F]">{site.name}</p>
                <h4 className="mt-1 text-sm font-bold text-[#3A2A20]">{site.ticket?.issueNumber ?? site.ticket?.id}</h4>
                <p className="mt-1 text-xs text-[#5E4A3A]">{site.ticket?.title}</p>
                <p className="mt-2 text-[11px] font-semibold text-[#8A725F]">Priority: {site.ticket?.priority}</p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
