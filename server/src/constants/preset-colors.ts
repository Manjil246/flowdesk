export type ColorPreset = {
  name: string;
  hexCode: string;
};

/** Admin color presets — names + hex stored on server; product colors copy hex into DB. */
export const COLOR_PRESETS: ColorPreset[] = [
  // Everyday / primary (listed first in admin)
  { name: "Red", hexCode: "#e53935" },
  { name: "Blue", hexCode: "#1e88e5" },
  { name: "Green", hexCode: "#43a047" },
  { name: "Orange", hexCode: "#fb8c00" },
  { name: "Purple", hexCode: "#8e24aa" },
  { name: "White", hexCode: "#ffffff" },
  { name: "Yellow", hexCode: "#fdd835" },
  { name: "Pink", hexCode: "#ec407a" },
  { name: "Black", hexCode: "#212121" },
  { name: "Brown", hexCode: "#6d4c41" },
  { name: "Parrot Green", hexCode: "#12ad2b" },
  { name: "Sky Blue", hexCode: "#29b6f6" },
  // Neutrals & classics
  { name: "Off White", hexCode: "#faf9f6" },
  { name: "Ivory", hexCode: "#fffff0" },
  { name: "Cream", hexCode: "#fff8e7" },
  { name: "Beige", hexCode: "#d4c4a8" },
  { name: "Tan", hexCode: "#d2b48c" },
  { name: "Khaki", hexCode: "#c3b091" },
  { name: "Charcoal", hexCode: "#424242" },
  { name: "Grey", hexCode: "#9e9e9e" },
  { name: "Silver", hexCode: "#c0c0c0" },
  // Deep & warm tones
  { name: "Maroon", hexCode: "#6d1b30" },
  { name: "Burgundy", hexCode: "#800020" },
  { name: "Wine", hexCode: "#722f37" },
  { name: "Rust", hexCode: "#b7410e" },
  { name: "Coral", hexCode: "#ff7043" },
  { name: "Peach", hexCode: "#ffb088" },
  { name: "Mustard", hexCode: "#c9a227" },
  { name: "Gold", hexCode: "#d4af37" },
  // Greens & blues
  { name: "Olive", hexCode: "#556b2f" },
  { name: "Emerald", hexCode: "#00695c" },
  { name: "Teal", hexCode: "#00897b" },
  { name: "Mint", hexCode: "#80cbc4" },
  { name: "Navy", hexCode: "#1a237e" },
  { name: "Royal Blue", hexCode: "#283593" },
  { name: "Indigo", hexCode: "#3949ab" },
  // Purples & pinks
  { name: "Lavender", hexCode: "#b39ddb" },
  { name: "Lilac", hexCode: "#ce93d8" },
  { name: "Rose", hexCode: "#f48fb1" },
  { name: "Magenta", hexCode: "#ad1457" },
  { name: "Multi", hexCode: "#888888" },
];
