import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Singh Sellers — Buy & Sell Pre-Owned Goods",
    short_name: "Singh Sellers",
    description:
      "Buy and sell verified pre-owned iPhones, MacBooks, gaming consoles and audio gear with Singh Sellers Certified Warranty.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#00A872",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
