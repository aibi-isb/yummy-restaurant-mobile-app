import { Asset } from "expo-asset";

const resolveAssetUri = (asset: number) => Asset.fromModule(asset).uri;

// Figma assets imported from the customer-facing screens.

/** Profile / avatar image */
export const profileImage =
  resolveAssetUri(require("../../assets/images/home/profile-avatar.png"));

/** Hero banner food photo (ramen bowl) */
export const heroFoodImage =
  resolveAssetUri(require("../../assets/images/home/hero-ramen.png"));


/** Categories screen profile/avatar image */
export const categoriesProfileImage =
  resolveAssetUri(require("../../assets/images/categories/profile-avatar.png"));
