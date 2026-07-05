export type GeolocationCoords = {
  lat: number;
  lng: number;
  accuracy?: number;
};

export class GeolocationError extends Error {
  constructor(
    message: string,
    readonly code: "unsupported" | "denied" | "unavailable" | "timeout",
  ) {
    super(message);
    this.name = "GeolocationError";
  }
}

export function requestDeviceLocation(): Promise<GeolocationCoords> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(
        new GeolocationError(
          "Location is not supported in this browser.",
          "unsupported",
        ),
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          reject(
            new GeolocationError(
              "Location permission was denied. Allow location access or enter your address manually.",
              "denied",
            ),
          );
          return;
        }
        if (err.code === err.POSITION_UNAVAILABLE) {
          reject(
            new GeolocationError(
              "Your location could not be determined. Try again or enter your address manually.",
              "unavailable",
            ),
          );
          return;
        }
        reject(
          new GeolocationError(
            "Location request timed out. Try again.",
            "timeout",
          ),
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 15_000,
        maximumAge: 60_000,
      },
    );
  });
}

export function toCoord(value: number | string): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function mapsLink(lat: number | string, lng: number | string): string {
  const latN = toCoord(lat);
  const lngN = toCoord(lng);
  return `https://www.google.com/maps?q=${latN},${lngN}`;
}

export function formatCoords(lat: number | string, lng: number | string): string {
  return `${toCoord(lat).toFixed(6)}, ${toCoord(lng).toFixed(6)}`;
}
