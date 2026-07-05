export const theme: "light" | "dark" = "light"; // Current active theme

export const baseColors = {
  light: {
    primary: "#572148",
    secondary: "#FFFFFF",
    text: "#212529",
    background: "#F4F7FD",
    error: "#DC3545",
  },
  dark: {
    primary: "#572148",
    secondary: "#000000",
    text: "#F4F7FD",
    background: "#212529",
    error: "#DC3545",
  },
};

// Extend base themes for specific parts of the app (e.g., Dashboard vs Website)
export const dashboardColors = {
  light: {
    ...baseColors.light,
    primary: "#002E6E", // Override for dashboard
    bannerBackground: "#F37018",
  },
  dark: {
    ...baseColors.dark,
    primary: "#572148",
    bannerBackground: "#212529",
  },
};

export const fonts = {
  light: { primary: "Hind", headings: "Montserrat" },
  dark: { primary: "Hind", headings: "Montserrat" },
};
