import { apiBaseUrl } from "@/lib/api/base";

const base = apiBaseUrl;

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

export async function reverseGeocodeFromApi(
  lat: number,
  lng: number,
): Promise<ReverseGeocodeResult> {
  const url = new URL(`${base()}/api/v1/shop/reverse-geocode`);
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lng", String(lng));

  const res = await fetch(url.toString());
  const data = (await res.json().catch(() => ({}))) as {
    message?: string;
    error?: string;
  } & Partial<ReverseGeocodeResult>;

  if (import.meta.env.DEV) {
    console.group("[checkout-location] reverse-geocode API response");
    console.log("request", { lat, lng });
    console.log("raw JSON", data);
    console.log("fields", {
      lat: { value: data.lat, type: typeof data.lat },
      lng: { value: data.lng, type: typeof data.lng },
      displayName: data.displayName,
      street: data.street,
      city: data.city,
      district: data.district,
      province: data.province,
      zipCode: data.zipCode,
    });
    console.groupEnd();
  }

  if (!res.ok) {
    throw new Error(
      data.message || data.error || "Could not look up address for your location",
    );
  }

  return {
    lat: Number(data.lat),
    lng: Number(data.lng),
    displayName: data.displayName ?? "",
    street: data.street ?? "",
    city: data.city ?? "",
    district: data.district ?? "",
    province: data.province ?? "",
    zipCode: data.zipCode ?? "",
  };
}
