import { BadRequestError } from "../errors/service.errors";
import { mapNepalProvince } from "../constants/nepal-provinces";

type NominatimAddress = {
  road?: string;
  house_number?: string;
  suburb?: string;
  neighbourhood?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  county?: string;
  state?: string;
  state_district?: string;
  postcode?: string;
};

function buildStreet(addr: NominatimAddress, displayName: string): string {
  const parts = [addr.house_number, addr.road].filter(Boolean);
  if (parts.length > 0) return parts.join(" ");
  const neighbourhood = [addr.neighbourhood, addr.suburb].filter(Boolean).join(", ");
  if (neighbourhood) return neighbourhood;
  return displayName;
}

function buildCity(addr: NominatimAddress): string {
  return (
    addr.city ||
    addr.town ||
    addr.municipality ||
    addr.village ||
    addr.suburb ||
    ""
  );
}

export type ReverseGeocodeResult = {
  lat: number;
  lng: number;
  displayName: string;
  street: string;
  city: string;
  district: string;
  province: string;
  zipCode: string;
};

export async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<ReverseGeocodeResult> {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lng));
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("zoom", "18");

  const res = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      "User-Agent": "StyleSutra-FlowDesk/1.0 (checkout geolocation)",
    },
  });

  if (!res.ok) {
    throw new BadRequestError("Could not resolve address for this location");
  }

  const data = (await res.json()) as {
    display_name?: string;
    address?: NominatimAddress;
    error?: string;
  };

  if (process.env.NODE_ENV !== "production") {
    console.group("[checkout-location] Nominatim raw JSON");
    console.log("request", { lat, lng });
    console.log("display_name", data.display_name);
    console.log("address object", data.address);
    if (data.address) {
      console.log("address keys", Object.keys(data.address));
      console.table(data.address);
    }
    console.groupEnd();
  }

  if (data.error || !data.address) {
    throw new BadRequestError("No address found for this location");
  }

  const addr = data.address;
  const displayName = data.display_name ?? "";
  const result = {
    lat,
    lng,
    displayName,
    street: buildStreet(addr, displayName),
    city: buildCity(addr),
    district: addr.state_district ?? addr.county ?? "",
    province: mapNepalProvince(addr.state),
    zipCode: addr.postcode?.trim() ?? "",
  };

  if (process.env.NODE_ENV !== "production") {
    console.log("[checkout-location] mapped for client", result);
  }

  return result;
}
