import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { type OrganizationAdminTicket } from '../organizationAdminMockData';

const createPin = (color: string) =>
  L.divIcon({
    className: 'organization-admin-map-pin',
    html: `
      <div style="display:flex;align-items:center;justify-content:center;">
        <svg width="28" height="40" viewBox="0 0 28 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 1C7.373 1 2 6.373 2 13C2 22.5 14 39 14 39C14 39 26 22.5 26 13C26 6.373 20.627 1 14 1Z" fill="${color}" stroke="white" stroke-width="2" />
          <circle cx="14" cy="13" r="5" fill="white" />
        </svg>
      </div>
    `,
    iconSize: [28, 40],
    iconAnchor: [14, 38],
    popupAnchor: [0, -36],
  });

type OrganizationAdminMapSite = {
  ticket?: OrganizationAdminTicket | null;
  name: string;
  lat: number;
  lng: number;
};

const statusLabels: Record<OrganizationAdminTicket['status'], string> = {
  submitted: 'Submitted',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  rejected: 'Rejected',
  pending_admin: 'Pending Admin',
  escalated: 'Escalated',
};

const formatStatusLabel = (status?: OrganizationAdminTicket['status']) => {
  if (!status) return 'Submitted';
  return statusLabels[status] ?? 'Submitted';
};

const getStatusTone = (status: OrganizationAdminTicket['status']) => {
  if (status === 'resolved') return '#16A34A';
  if (status === 'in_progress') return '#F59E0B';
  if (status === 'rejected') return '#DC2626';
  return '#2563EB';
};

export default function OrganizationAdminMap({
  center,
  sites,
}: Readonly<{ center: [number, number]; sites: OrganizationAdminMapSite[] }>) {
  return (
    <MapContainer center={center} zoom={14} className="h-full w-full" scrollWheelZoom>
      <TileLayer url={import.meta.env.VITE_MAP_TILE_URL ?? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'} />
      {sites.map((site, index) => {
        const status = site.ticket?.status ?? 'submitted';
        const tone = getStatusTone(status);
        const markerKey = `${site.ticket?.id ?? site.ticket?.issueNumber ?? site.name}-${index}`;
        return (
          <Marker key={markerKey} position={[site.lat, site.lng]} icon={createPin(tone)}>
            <Popup>
              <div className="min-w-64 max-w-72">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8A725F]">{site.name}</p>
                <h4 className="mt-1 text-base font-bold text-[#3A2A20]">{site.ticket?.issueNumber ?? site.ticket?.id}</h4>
                <p className="mt-1 text-sm text-[#5E4A3A]">{site.ticket?.title}</p>
                {site.ticket?.images?.[0]?.image ? (
                  <img
                    src={site.ticket.images[0].image}
                    alt="Issue preview"
                    className="mt-3 h-28 w-full rounded-lg object-cover"
                  />
                ) : (
                  <div className="mt-3 flex h-28 w-full items-center justify-center rounded-lg bg-[#F3ECE4] text-xs text-[#8B7B69]">
                    No image available
                  </div>
                )}
                <div className="mt-3 space-y-1 text-xs text-[#6A5A4C]">
                  <p><span className="font-semibold text-[#8A725F]">Status:</span> {formatStatusLabel(site.ticket?.status)}</p>
                  <p><span className="font-semibold text-[#8A725F]">Priority:</span> {site.ticket?.priority ?? 'N/A'}</p>
                  <p><span className="font-semibold text-[#8A725F]">Category:</span> {site.ticket?.category ?? 'Uncategorized'}</p>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
