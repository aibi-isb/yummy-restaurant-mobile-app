import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import * as Phosphor from 'phosphor-react-native';

const nameMap: Record<string, string> = {
  // Specific overrides where automatic conversion doesn't work well
  "chevron-back": "CaretLeft",
  "chevron-forward": "CaretRight",
  "chevron-down": "CaretDown",
  "chevron-up": "CaretUp",
  "albums-outline": "SquaresFour",
  "albums": "SquaresFour",
  "cloud-upload-outline": "CloudArrowUp",
  "cloud-upload": "CloudArrowUp",
  "cube-outline": "Cube",
  "card-outline": "CreditCard",
  "checkmark-circle-outline": "CheckCircle",
  "bicycle-outline": "Bicycle",
  "truck-outline": "Truck",
  "phone-portrait-outline": "DeviceMobile",
  "cash-outline": "Coins",
  "calendar-outline": "Calendar",
  "cart-outline": "ShoppingCart",
  "rocket-outline": "Rocket",
  "close": "X",
  "trending-up": "TrendingUp",
  "trending-down": "TrendingDown",
  "bag-outline": "ShoppingBag",
  "caret-down": "CaretDown",
  "pencil": "PencilSimple",
  "add": "Plus",
  "location-outline": "MapPin",
  "location": "MapPin",
  "call-outline": "Phone",
  "search-outline": "MagnifyingGlass",
  "notifications-outline": "Bell",
  "checkmark": "Check",
  "alert-circle-outline": "WarningCircle",
  "lock-closed": "Lock",
  "home-outline": "House",
  "card": "CreditCard",
  "shield-checkmark": "ShieldCheck",
  "alert-circle": "WarningCircle",
  "arrow-back": "ArrowLeft",
  "mic-outline": "Microphone",
  "ellipse-outline": "Circle",
  "time-outline": "Clock",
  "mail-outline": "EnvelopeSimple",
  "eye-outline": "Eye",
  "eye-off-outline": "EyeSlash",
  "person-outline": "User",
  "settings-outline": "Gear",
  "log-out-outline": "SignOut",
  "bag-handle-outline": "ShoppingBag",
  "receipt-outline": "Receipt",
  "menu-outline": "List",
  "heart-outline": "Heart",
  "heart": "Heart",
  "close-circle": "XCircle",
  "information-circle-outline": "Info",
  "options-outline": "Sliders",
  "copy-outline": "Copy",
  "logo-google": "GoogleLogo",
  "logo-apple": "AppleLogo",
  "arrow-forward": "ArrowRight",
  "refresh-outline": "ArrowClockwise",
  "happy-outline": "Smiley",
  "camera-outline": "Camera",
  "fast-food-outline": "Hamburger",
  "beer-outline": "Beer",
  "wine-outline": "Wine",
  "pizza-outline": "Pizza",
  "cafe-outline": "Coffee",
  "ice-cream-outline": "IceCream",
  "create-outline": "NotePencil",
  "ellipsis-horizontal": "DotsThree",
  "ellipsis-vertical": "DotsThreeVertical",
  "filter-outline": "Funnel",
  "grid": "GridFour",
  "grid-outline": "GridFour",
  "home": "House",
  "map-outline": "MapTrifold",
  "menu": "List",
  "remove-outline": "Minus",
  "restaurant": "ForkKnife",
  "restaurant-outline": "ForkKnife",
  "sunny-outline": "Sun",
  "swap-vertical": "ArrowsDownUp",
  "document-text-outline": "FileText",
  "people-outline": "Users",
  "chatbox-outline": "Chat",
  "business-outline": "Briefcase",
  "warning-outline": "Warning",
};

export type PhosphorIconProps = {
  name: string;
  size?: number;
  color?: string;
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
  style?: StyleProp<ViewStyle>;
  [key: string]: any;
};

export const PhosphorIcon: React.FC<PhosphorIconProps> = ({
  name,
  size = 24,
  color = 'black',
  weight = 'regular',
  style,
  ...rest
}) => {
  const getPhosphorName = (iconName: string): string => {
    if (nameMap[iconName]) return nameMap[iconName];

    // Strip common suffixes
    let cleaned = iconName.replace(/-outline|-sharp/g, '');

    // Handle common mappings
    if (cleaned === 'add') cleaned = 'plus';
    if (cleaned === 'close') cleaned = 'x';
    if (cleaned === 'checkmark') cleaned = 'check';
    if (cleaned === 'search') cleaned = 'magnifying-glass';
    if (cleaned === 'call') cleaned = 'phone';
    if (cleaned === 'mail') cleaned = 'envelope';
    if (cleaned === 'happy') cleaned = 'smiley';

    // Convert kebab-case to PascalCase
    return cleaned
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
  };

  const phosphorName = getPhosphorName(name);
  const IconComponent = (Phosphor as any)[phosphorName] || Phosphor.Question;

  console.log(`PhosphorIcon: [${name}] mapped to [${phosphorName}]. Found component: ${!!(Phosphor as any)[phosphorName]}`);

  return (
    <IconComponent
      size={size}
      color={color}
      weight={weight}
      style={style}
      {...rest}
    />
  );
};

export default PhosphorIcon;
