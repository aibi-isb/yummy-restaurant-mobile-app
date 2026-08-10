# YUMMI Restaurant — Source Structure

## Checkout Screen Figma Implementation — Node `2122:19972`

### MCP Summary

- `get_design_context` verified a dark 390 px checkout screen with a 344 px content column, four stacked cards, 32 px vertical gaps, 40 px header actions, 24 px card padding, compact address inputs, two 277 x 56 cart product rows, a 258 px order-summary stack, and a full-width payment button.
- Imported Figma image assets locally under `assets/images/checkout/`: `checkout-product.png` and `profile-avatar.png`.
- `get_variable_defs` verified tokens: `dark mode/card` `#18181c`, `dark mode/surface` `#222226`, `dark mode/border` `#3f3f46`, `dark mode/text-primary` `#ffffff`, `dark mode/text-secondary` `#a1a1aa`, `System Default/Red/Normal` `#e53935`, `md` `1`, `xl` `2`, `button/xl` `40`, `spacing/2` `8`, and `spacing/3` `12`.
- Typography verified: heading 24/600 with -0.48 letter spacing, address caption 12/400, cart row caption2 11/400 and 11/590, summary text around 13-14 px, and total text around 17-18 px bold.
- `get_code_connect_map` was attempted and returned a Figma seat limitation. No production source paths were available, so the existing Expo Router screen and reusable cart-row component were mapped manually from design context.
- Expo v57 docs checked before implementation: SDK 57 targets React Native `0.86` and React `19.2.3`; `expo-image ~57.0.0` is the supported image component for bundled/local image sources.

### Component Breakdown

| Element | Classification | Path |
| --- | --- | --- |
| Checkout route | Screen | `src/app/checkout.tsx` |
| Header/back/notification/avatar | Layout | `src/app/checkout.tsx` |
| Address and phone fields | UI | `src/app/checkout.tsx` |
| Order item row | Feature | `src/components/features/CartItem.tsx` |
| Checkout product/avatar assets | UI | `assets/images/checkout/` |
| Order summary totals | Feature | `src/app/checkout.tsx` |
| Cart pricing constants | Feature | `src/data/cart.ts` |
| Proceed to payment action | Feature | `src/app/checkout.tsx` |
| Backend/API logic | Service | Not added; this Figma node contains local form and navigation behavior only. |

### Folder Mapping

- Route composition, safe-area handling, and checkout-only address form state stay in `src/app/checkout.tsx` because Expo Router owns the screen and the Figma node contains no shared checkout service behavior.
- The existing `CartItem` component remains the order-row renderer to avoid duplicating the 277 x 56 cart product subcomponent already used by the cart screen.
- Shared prices and mock cart item data remain in `src/data/cart.ts`; checkout remaps only the product image locally so cart data does not become screen-specific.
- Imported checkout visuals live in `assets/images/checkout/`, removing runtime dependence on expiring Figma MCP URLs.
- No `services/` extraction was added because there is no backend/API contract in the checkout design.

### Final `src/` Structure

```text
src/
  app/
    _layout.tsx
    index.tsx
    categories.tsx
    product.tsx
    cart.tsx
    checkout.tsx
    payment.tsx
    track-order.tsx
    search.tsx
    profile.tsx
    notifications.tsx
    auth-choice.tsx
    onboarding.tsx
    login.tsx
    signup.tsx
    splash.tsx
    admin-dashboard.tsx
    admin-orders.tsx
    admin-orders/
    admin-customers.tsx
    admin-customers/
    admin-foods.tsx
    admin-foods/
    admin-notifications.tsx
    admin-payment-verification.tsx
  components/
    features/
      ActionButton.tsx
      AuthTextField.tsx
      BottomNavbar.tsx
      CartItem.tsx
      CategoryChip.tsx
      FoodCard.tsx
      HeroBanner.tsx
      ProductQuantity.tsx
    ui/
      PaymentVerifiedAlert.tsx
      RatingStars.tsx
      SectionHeader.tsx
      Toast.tsx
  constants/
    theme.ts
  data/
    cart.ts
    notifications.ts
    product.ts
    profile.ts
    restaurant.ts
  features/
    admin/
      components/
      services/
      types.ts
  lib/
    auth.ts
    supabase.ts
  store/
    authStore.ts
  STRUCTURE.md
```

## Home Screen Figma Implementation — Node `2216:2037`

### MCP Summary

- `get_design_context` verified a dark Expo mobile home screen, 394 px wide, with a 40 px header, native search field, 180 px hero banner, 96 px round category chips, 169 x 285 featured grid cards, 370 x 108 list cards, and an 85 px bottom app navbar.
- Imported Figma image assets locally under `assets/images/home/`: `profile-avatar.png`, `hero-ramen.png`, `featured-toast.png`, `list-burger.png`, and `category-bowl.png`.
- `get_variable_defs` verified tokens: `dark mode/background` `#121214`, `dark mode/card` `#18181c`, `dark mode/surface` `#222226`, `dark mode/text-primary` `#ffffff`, `dark mode/text-secondary` `#a1a1aa`, `System Default/Red/Normal` `#e53935`, `System Default/Red/Light:active` `#f7c2c0`, `Fills/Secondary` `#78788052`, `light mode/card` `#ffffff`, `light mode/text-secondary` `#6b7280`, `md` `1`, `xl` `2`, and `button/xl` `40`.
- Typography verified: heading 24/600, subheadline 15/590 and 15/400, body strong 16/600, caption 12/590, and caption2 11/400 or 11/590.
- `get_code_connect_map` was attempted and returned a Figma seat limitation. The design context did expose a Code Connect snippet for the search field, but no production source path could be retrieved, so the existing native `TextInput` search implementation was reused.
- Expo v57 docs checked before implementation: SDK 57 targets React Native `0.86` and React `19.2.3`; `expo-image ~57.0.0` is the supported image component and accepts local bundled image module sources.

### Component Breakdown

| Element | Classification | Path |
| --- | --- | --- |
| Home route | Screen | `src/app/index.tsx` |
| Header/profile/actions | Layout | `src/app/index.tsx` |
| Search field | UI | `src/app/index.tsx` |
| Hero banner | Feature | `src/components/features/HeroBanner.tsx` |
| Category chip | Feature | `src/components/features/CategoryChip.tsx` |
| Featured food card | Feature | `src/components/features/FoodCard.tsx` |
| Section header | UI | `src/components/ui/SectionHeader.tsx` |
| Bottom app navbar | Layout | `src/components/features/BottomNavbar.tsx` |
| Static restaurant/menu content | Feature | `src/data/restaurant.ts` |
| Home Figma assets | UI | `assets/images/home/` |
| Backend/API logic | Service | Not added; the Figma node contains no backend behavior. |

### Folder Mapping

- Screen composition remains in `src/app/index.tsx` because Expo Router owns route-level layout and navigation.
- Reusable domain UI stays in `src/components/features/` because hero, food card, category chip, and bottom nav are restaurant-facing product features reused across screens.
- Generic headers and small UI primitives stay in `src/components/ui/`.
- Image-backed mock restaurant data remains in `src/data/restaurant.ts`; no API/service extraction is needed until this content is fetched remotely.
- Imported visual assets live in `assets/images/home/` so the app no longer depends on Figma localhost or expiring MCP URLs at runtime.

### Final `src/` Structure

```text
src/
  app/
    _layout.tsx
    index.tsx
    categories.tsx
    product.tsx
    cart.tsx
    search.tsx
    profile.tsx
    notifications.tsx
    checkout.tsx
    payment.tsx
    track-order.tsx
    auth-choice.tsx
    onboarding.tsx
    login.tsx
    signup.tsx
    splash.tsx
    admin-dashboard.tsx
    admin-orders.tsx
    admin-orders/
    admin-customers.tsx
    admin-customers/
    admin-foods.tsx
    admin-foods/
    admin-notifications.tsx
    admin-payment-verification.tsx
  components/
    features/
      ActionButton.tsx
      AuthTextField.tsx
      BottomNavbar.tsx
      CartItem.tsx
      CategoryChip.tsx
      FoodCard.tsx
      HeroBanner.tsx
      ProductQuantity.tsx
    ui/
      PaymentVerifiedAlert.tsx
      RatingStars.tsx
      SectionHeader.tsx
      Toast.tsx
  constants/
    theme.ts
  data/
    cart.ts
    notifications.ts
    product.ts
    profile.ts
    restaurant.ts
  features/
    admin/
      components/
      services/
      types.ts
  lib/
    auth.ts
    supabase.ts
  store/
    authStore.ts
  STRUCTURE.md
```

## Categories Screen Figma Implementation — Node `2250:3745`

### MCP Summary

- `get_design_context` verified a dark mobile categories screen, 390 px wide, with a fixed header at the top, a dark search field at y=58, a horizontal rectangular category-card strip beginning around y=172, and a 2-column featured grid beginning around y=375.
- Layout data verified rectangular category chips at 96 x 127 with 72 px circular images, 24 px horizontal spacing, and a thin `System Default/Grey/Light:active` border at 60% opacity.
- Layout data verified featured cards at 169 x 285, a 361 px grid container, 24 px column gap, 32 px row gap, 148 px circular food images, centered food info, and an inline `Order` button.
- Imported usable Figma image assets locally under `assets/images/categories/`: `category-bowl.png` and `profile-avatar.png`.
- The Figma food-card image endpoint exported a gray masked ellipse instead of the visible cake photo, so the grid uses the existing real bundled food image `assets/images/food/puttu-round.png` rather than a placeholder.
- `get_variable_defs` verified tokens: `dark mode/background` `#121214`, `dark mode/card` `#18181c`, `dark mode/border` `#3f3f46`, `dark mode/text-primary` `#ffffff`, `System Default/Red/Normal` `#e53935`, `System Default/Red/Light:active` `#f7c2c0`, `System Default/Grey/Light:active` `#b9b9b9`, `Fills/Secondary` `#78788052`, `md` `1`, `xl` `2`, and `button/xl` `40`.
- Typography verified: heading 24/600, subheadline 15/590 and 15/400, body strong 16/600, caption 12/590, caption2 11/400 or 11/590, and loose caption2 emphasized 11/590 with 15 line height.
- `get_code_connect_map` was attempted and returned a Figma seat limitation. The design context exposed a Code Connect snippet for the search field, but no production source path could be retrieved, so the existing native `TextInput` search implementation was reused.
- Expo v57 docs checked before implementation: SDK 57 targets React Native `0.86` and React `19.2.3`; `expo-image ~57.0.0` is the supported image component and accepts bundled/local image sources.

### Component Breakdown

| Element | Classification | Path |
| --- | --- | --- |
| Categories route | Screen | `src/app/categories.tsx` |
| Categories header/back/cart/avatar | Layout | `src/app/categories.tsx` |
| Search field | UI | `src/app/categories.tsx` |
| Rectangular category chip | Feature | `src/components/features/CategoryChip.tsx` |
| Category food card | Feature | `src/components/features/FoodCard.tsx` |
| Section header | UI | `src/components/ui/SectionHeader.tsx` |
| Static category/menu content | Feature | `src/data/restaurant.ts` |
| Categories Figma assets | UI | `assets/images/categories/` |
| Category grid food image | UI | `assets/images/food/puttu-round.png` |
| Backend/API logic | Service | Not added; this Figma node contains no backend behavior. |

### Folder Mapping

- Route composition, safe-area handling, and responsive grid math stay in `src/app/categories.tsx` because Expo Router owns screen-level layout.
- Rectangular category-card behavior was added as a variant of `CategoryChip` in `src/components/features/CategoryChip.tsx` to avoid duplicating the home screen chip component.
- The 169 x 285 food-card treatment continues to reuse `FoodCard` with `variant="category"` in `src/components/features/FoodCard.tsx`.
- Static food/category sample data and local asset resolution remain in `src/data/restaurant.ts`.
- Imported visual assets live in `assets/images/categories/`, with the real category grid food image reused from `assets/images/food/`, so the categories screen no longer depends on Figma localhost or expiring MCP URLs at runtime.

### Final `src/` Structure

```text
src/
  app/
    _layout.tsx
    index.tsx
    categories.tsx
    product.tsx
    cart.tsx
    search.tsx
    profile.tsx
    notifications.tsx
    checkout.tsx
    payment.tsx
    track-order.tsx
    auth-choice.tsx
    onboarding.tsx
    login.tsx
    signup.tsx
    splash.tsx
    admin-dashboard.tsx
    admin-orders.tsx
    admin-orders/
    admin-customers.tsx
    admin-customers/
    admin-foods.tsx
    admin-foods/
    admin-notifications.tsx
    admin-payment-verification.tsx
  components/
    features/
      ActionButton.tsx
      AuthTextField.tsx
      BottomNavbar.tsx
      CartItem.tsx
      CategoryChip.tsx
      FoodCard.tsx
      HeroBanner.tsx
      ProductQuantity.tsx
    ui/
      PaymentVerifiedAlert.tsx
      RatingStars.tsx
      SectionHeader.tsx
      Toast.tsx
  constants/
    theme.ts
  data/
    cart.ts
    notifications.ts
    product.ts
    profile.ts
    restaurant.ts
  features/
    admin/
      components/
      services/
      types.ts
  lib/
    auth.ts
    supabase.ts
  store/
    authStore.ts
  STRUCTURE.md
```

## Product Details Figma Implementation — Node `2263:2209`

### MCP Summary

- `get_design_context` verified a dark mobile product details screen, 390 px wide, with a 390 x 425 hero image, floating header at y=23, product details container starting at y=454, centered copy, a 288 px quantity selector, and a 288 x 56 surface `Order` CTA.
- Layout data verified the header hierarchy: left back affordance, centered `Prod. Details` title, cart notification badge, and 40 px profile avatar.
- Layout data verified the content hierarchy: product name, long centered description at 366 px width, price, quantity row, and cart/order action.
- Imported usable Figma image assets locally under `assets/images/product/`: `product-hero.png` and `profile-avatar.png`.
- `get_variable_defs` verified tokens: `dark mode/background` `#121214`, `dark mode/card` `#18181c`, `dark mode/surface` `#222226`, `dark mode/border` `#3f3f46`, `dark mode/text-primary` `#ffffff`, `System Default/Red/Normal` `#e53935`, `System Default/Grey/Light` `#e9e9e9`, `md` `1`, `button/xl` `40`, `icon/md` `20`, and `icon/lg` `24`.
- Typography verified: heading 24/600 with -0.48 px letter spacing in implementation, subheading 20/400, and body base 16/400 at 1.4 line height.
- `get_code_connect_map` was attempted and returned a Figma seat limitation. No production source path mappings were returned.
- Expo v57 docs checked before implementation: SDK 57 targets React Native `0.86` and React `19.2.3`; `expo-image ~57.0.0` is the supported image component and accepts bundled/local image sources.

### Component Breakdown

| Element | Classification | Path |
| --- | --- | --- |
| Product details route | Screen | `src/app/product.tsx` |
| Floating product header | Layout | `src/app/product.tsx` |
| Hero food image | UI | `assets/images/product/product-hero.png` |
| Product title/description/price block | UI | `src/app/product.tsx` |
| Quantity selector | Feature | `src/components/features/ProductQuantity.tsx` |
| Order CTA | Feature | `src/components/features/ActionButton.tsx` |
| Product detail data | Feature | `src/data/product.ts` |
| Product Figma assets | UI | `assets/images/product/` |
| Backend/API logic | Service | Not added; this Figma node contains no backend behavior. |

### Folder Mapping

- Route-level hero/header/composition remains in `src/app/product.tsx` because Expo Router owns the product detail screen.
- Quantity behavior remains isolated in `src/components/features/ProductQuantity.tsx`, preserving the existing API while matching the Figma 32 px stepper.
- The order button continues to reuse `ActionButton` with the existing `surface` variant instead of creating a duplicate CTA component.
- Static product details and local asset resolution stay in `src/data/product.ts`; no service extraction is needed until product data is fetched remotely.
- Imported visual assets live in `assets/images/product/` so the product screen no longer depends on Figma localhost or expiring MCP URLs at runtime.

### Final `src/` Structure

```text
src/
  app/
    _layout.tsx
    index.tsx
    categories.tsx
    product.tsx
    cart.tsx
    search.tsx
    profile.tsx
    notifications.tsx
    checkout.tsx
    payment.tsx
    track-order.tsx
    auth-choice.tsx
    onboarding.tsx
    login.tsx
    signup.tsx
    splash.tsx
    admin-dashboard.tsx
    admin-orders.tsx
    admin-orders/
    admin-customers.tsx
    admin-customers/
    admin-foods.tsx
    admin-foods/
    admin-notifications.tsx
    admin-payment-verification.tsx
  components/
    features/
      ActionButton.tsx
      AuthTextField.tsx
      BottomNavbar.tsx
      CartItem.tsx
      CategoryChip.tsx
      FoodCard.tsx
      HeroBanner.tsx
      ProductQuantity.tsx
    ui/
      PaymentVerifiedAlert.tsx
      RatingStars.tsx
      SectionHeader.tsx
      Toast.tsx
  constants/
    theme.ts
  data/
    cart.ts
    notifications.ts
    product.ts
    profile.ts
    restaurant.ts
  features/
    admin/
      components/
      services/
      types.ts
  lib/
    auth.ts
    supabase.ts
  store/
    authStore.ts
  STRUCTURE.md
```

## Cart Screen Figma Implementation — Node `2266:4537`

### MCP Summary

- `get_design_context` verified a dark mobile cart page with a 365 px header container, 327 px content cards, a 277 x 56 cart product row, an 80 x 56 item image, compact product text, 35 x 12 delete control, 12 px quantity controls, a 276 px pricing card, and a checkout card with a 257 x 52 CTA.
- A follow-up `get_design_context` call on cart product node `2274:2274` was needed because the parent node asset URL exported as a flat placeholder. The subnode exposed the usable product image matching the visible Figma row.
- Imported usable Figma image assets locally under `assets/images/cart/`: `cart-product.png` and `profile-avatar.png`.
- `get_variable_defs` verified tokens: `dark mode/card` `#18181c`, `dark mode/surface` `#222226`, `dark mode/border` `#3f3f46`, `dark mode/text-primary` `#ffffff`, `System Default/Red/Normal` `#e53935`, `xl` `2`, `md` `1`, `button/xl` `40`, `button/xs` `12`, and `icon/xs` `12`.
- Typography verified: heading 24/600, tight caption2 emphasized 11/590 with 11 line height, and caption2 regular 11/400 with 13 line height.
- `get_code_connect_map` was attempted and returned a Figma seat limitation. No production source path mappings were returned.
- Expo v57 docs checked before implementation: SDK 57 targets React Native `0.86` and React `19.2.3`; `expo-image ~57.0.0` is the supported image component and accepts bundled/local image sources.

### Component Breakdown

| Element | Classification | Path |
| --- | --- | --- |
| Cart route | Screen | `src/app/cart.tsx` |
| Cart header/back/notification/avatar | Layout | `src/app/cart.tsx` |
| Order summary card | Feature | `src/app/cart.tsx` |
| Cart product row | Feature | `src/components/features/CartItem.tsx` |
| Product thumbnail | UI | `assets/images/cart/cart-product.png` |
| Pricing breakdown card | Feature | `src/app/cart.tsx` |
| Checkout CTA | Feature | `src/app/cart.tsx` |
| Mock cart and pricing data | Feature | `src/data/cart.ts` |
| Cart Figma assets | UI | `assets/images/cart/` |
| Backend/API logic | Service | Not added; cart state remains local mock state and no backend contract exists in this Figma node. |

### Folder Mapping

- Route-level card layout, totals, and checkout navigation stay in `src/app/cart.tsx` because Expo Router owns the screen and this cart still uses local mock state.
- Repeated cart row UI stays in `src/components/features/CartItem.tsx`, preserving the existing mutation callback API while matching the Figma 56 px row.
- Static mock cart data and local asset resolution remain in `src/data/cart.ts`; a future real cart API should move persistence/fetching into `services/` or a feature store.
- Imported visual assets live in `assets/images/cart/` so the cart screen no longer depends on Figma localhost or expiring MCP URLs at runtime.

### Final `src/` Structure

```text
src/
  app/
    _layout.tsx
    index.tsx
    categories.tsx
    product.tsx
    cart.tsx
    search.tsx
    profile.tsx
    notifications.tsx
    checkout.tsx
    payment.tsx
    track-order.tsx
    auth-choice.tsx
    onboarding.tsx
    login.tsx
    signup.tsx
    splash.tsx
    admin-dashboard.tsx
    admin-orders.tsx
    admin-orders/
    admin-customers.tsx
    admin-customers/
    admin-foods.tsx
    admin-foods/
    admin-notifications.tsx
    admin-payment-verification.tsx
  components/
    features/
      ActionButton.tsx
      AuthTextField.tsx
      BottomNavbar.tsx
      CartItem.tsx
      CategoryChip.tsx
      FoodCard.tsx
      HeroBanner.tsx
      ProductQuantity.tsx
    ui/
      PaymentVerifiedAlert.tsx
      RatingStars.tsx
      SectionHeader.tsx
      Toast.tsx
  constants/
    theme.ts
  data/
    cart.ts
    notifications.ts
    product.ts
    profile.ts
    restaurant.ts
  features/
    admin/
      components/
      services/
      types.ts
  lib/
    auth.ts
    supabase.ts
  store/
    authStore.ts
  STRUCTURE.md
```

## MCP Summary

Figma node: `2161:2872` (`Registration`)

- Layout: full-screen registration form, 393 x 852 reference frame.
- Background token: `System Default/Grey/Light` = `#e9e9e9`.
- Text token: `System Default/Grey/Normal` = `#1e1e1e`.
- Input border token: `System Default/Grey/Light:active` = `#b9b9b9`.
- Primary action token: `System Default/Red/Normal` = `#e53935`.
- Radius token: `md` = `1`.
- Extracted hierarchy: title, email input, password input, confirm password input, red register CTA, divider label, Google auth button, login link, top-right star ornament.
- Assets: `assets/images/google-logo.svg`, `assets/images/auth-star.svg`.
- Code Connect: unavailable for this Figma account seat; no production path mappings were returned.

Figma node: `2354:3697` (`App Navbar`)

- Layout: bottom app navbar, 394 x 85 reference frame.
- Surface token: `dark mode/card` = `#18181c`.
- Icon token: `dark mode/text-secondary` = `#a1a1aa`.
- Icon size token: `icon/md` = `20`.
- Radius token: `xl` = `2`.
- Extracted hierarchy: dark card surface, top border `rgba(38,38,38,0.4)`, centered 284 x 20.275 icon strip with home, search, cart, location, and grid icons.
- Asset: `assets/images/app-navbar-icons.svg`.
- Code Connect: unavailable for this Figma account seat; no production path mappings were returned.

Figma node: `2177:1875` (`Splashscreen`)

- Layout: full-screen splash frame, 390 x 844 reference frame.
- Background token: `System Default/Grey/Normal` = `#1e1e1e`.
- Logo light token: `Color/Grey/Light` / `System Default/Grey/Light` = `#e9e9e9`.
- Wordmark token: `System Default/Red/Normal` = `#e53935`.
- Extracted hierarchy: native status bar, dark phone frame, centered logo mark, red `YUMMI` wordmark, light `Taste Delivered` tagline, 32px CircleNotch loading indicator, home indicator.
- Assets: `assets/images/splash-logo-mark.svg`, `assets/images/circle-notch.svg`.
- Code Connect: unavailable for this Figma account seat; no production path mappings were returned.

Figma node: `2161:2850` (`Log In`)

- Layout: full-screen login form, 393 x 852 reference frame.
- Background token: `System Default/Grey/Light` = `#e9e9e9`.
- Text token: `System Default/Grey/Normal` = `#1e1e1e`.
- Input border token: `System Default/Grey/Light:active` = `#b9b9b9`.
- Primary action token: `System Default/Red/Normal` = `#e53935`.
- Radius token: `md` = `1`.
- Extracted hierarchy: title, email input with validation icon, password input with visibility icon, forgot-password link, red login CTA, divider label, Google auth button, signup link, top-right star ornament.
- Assets: reuses `assets/images/google-logo.svg` and `assets/images/auth-star.svg`.
- Code Connect: unavailable for this Figma account seat; no production path mappings were returned.

Figma node: `2161:2839` (`Openning screen`)

- Layout: full-screen opening/auth choice screen, 393 x 852 reference frame.
- Background token: `System Default/Grey/Light` = `#e9e9e9`.
- Text and illustration token: `System Default/Grey/Normal` = `#1e1e1e`.
- Primary action token: `System Default/Red/Normal` = `#e53935`.
- Button radius token: `md` = `1`.
- Border token from node: `#747474`.
- Extracted hierarchy: illustration, centered title/body text, filled `Log In` CTA, outlined `Create account` CTA.
- Illustration: bundled locally at `assets/images/auth-illustration.svg`.
- Code Connect: unavailable for this Figma account seat; no production path mappings were returned.

Figma node: `2142:21561` (`Admin dashboard`)

- Requested MCP calls: `get_design_context`, `get_variable_defs`, and `get_code_connect_map`.
- Result: all three calls were denied by Figma because the connector account does not have editor access to the file.
- Additional metadata fallback: `get_metadata` was also denied for the same access reason.
- Implementation note: the admin dashboard was built from the established YUMMI dark theme and existing Expo Router patterns, without claiming verified node dimensions, tokens, or Code Connect mappings for this inaccessible node.
- Code Connect: unavailable; no production path mappings were returned.

Figma node: `2142:22083` (`Implement Design` / Admin Orders)

- Requested MCP calls: `get_design_context`, `get_variable_defs`, and `get_code_connect_map`.
- Layout: dark mobile admin orders screen, 413 x 787 reference frame.
- Extracted hierarchy: compact admin header, search input, notification/theme/profile actions, Orders title block, status/date filters, horizontally scrollable order table, status badges, pagination footer, and bottom admin tab bar.
- Verified colors from layout data: app background `#121212`, header/card surface `#1e1e1e`, inset surface `#2a2a2a`, primary action/status red `#e53935`, muted text `#b0b0b0`, success text `#05df72`, delivery text `#51a2ff`, border `#2a2a2a`.
- `get_variable_defs` result: `{}`; no reusable Figma variable definitions were returned for this node.
- Code Connect: unavailable for this Figma account seat; no production path mappings were returned.

Figma node: `2142:22411` (`Implement Design` / Admin Order Detail)

- Requested MCP calls: `get_design_context`, `get_variable_defs`, and `get_code_connect_map`.
- Layout: dark mobile admin order detail screen, 413 px wide reference frame with a vertically scrolling content area.
- Extracted hierarchy: compact admin header, order detail title/breadcrumb, cancel order button, delivery status badge, customer summary card, note/address card, order history timeline, order items table, delivery status map panel, delivery courier card, and bottom admin tab bar.
- Verified colors from layout data: app background `#121212`, header/card surface `#1e1e1e`, inset surface `#2a2a2a`, primary red `#e53935`, cancel text `#ff6467`, muted text `#b0b0b0`, light note surface `#fff1f2`, note border `#ffc9c9`, card border `#2a2a2a`.
- `get_variable_defs` result: `{}`; no reusable Figma variable definitions were returned for this node.
- Code Connect: unavailable for this Figma account seat; no production path mappings were returned.

Figma node: `2143:3` (`Implement Design` / Admin Customers)

- Requested MCP calls: `get_design_context`, `get_variable_defs`, and `get_code_connect_map`.
- Layout: dark mobile admin customer management screen, 393 x 852 reference frame.
- Extracted hierarchy: compact admin header, General Customer title/subtitle, filter button, horizontally scrollable customers table, red table header, customer rows, pagination footer, and bottom admin tab bar with Customer active.
- Verified colors from layout data: app background `#121212`, header/card surface `#1e1e1e`, inset surface `#2a2a2a`, table header/active tab red `#e53935`, muted text `#b0b0b0`, border `#2a2a2a`, primary text `#ffffff`.
- `get_variable_defs` result: `{}`; no reusable Figma variable definitions were returned for this node.
- Code Connect: unavailable for this Figma account seat; no production path mappings were returned.

Figma node: `2143:1063` (`Foods` / Admin Foods)

- Requested MCP calls: `get_design_context`, `get_variable_defs`, and `get_code_connect_map`.
- Result: the main node was too large for full code context, so Figma returned sparse metadata and requested sublayer calls. Follow-up `get_design_context` calls were run for the toolbar/title group (`2147:6561`), menu card (`2147:5945`), and comparison chart (`2143:1713`).
- Layout: dark mobile admin foods management screen, 393 x 2455 reference frame with a scrollable menu card list, pagination, and menu comparison panel.
- Extracted hierarchy: compact admin header, menu search input, list/grid toggle, New Menu button, Foods title/subtitle, repeated food management cards, card action metrics, pagination footer, menu comparison chart card, and bottom admin tab bar with Foods active.
- Verified colors from layout data: app background `#121212`, header/card surface `#1e1e1e`, inset surface `#2a2a2a`, primary red `#e53935`, muted text `#b0b0b0`, orange category text `#ff8904`, blue chart `#3b82f6`, pink chart `#ff3f67`, amber chart `#d99a00`, border `#2a2a2a`, primary text `#ffffff`.
- `get_variable_defs` result: `{}`; no reusable Figma variable definitions were returned for this node.
- Code Connect: unavailable for this Figma account seat; no production path mappings were returned.

Figma node: `2371:4224` (`Add New Food`)

- Requested MCP calls: `get_design_context`, `get_variable_defs`, and `get_code_connect_map`.
- Layout: light mobile admin food creation form, 493 x 1024 reference frame.
- Extracted hierarchy: back button, Add New Food title, food image upload dropzone, food name input, category select, price input, description textarea, availability radio controls, and Save Food CTA.
- Verified colors from layout data: page background `#fcfcfc`, input surface `#fdfdfd`, input border `#eaebee` / `#ebecef`, primary orange `#ff4b00` / `#f75300`, label text `#686b75`, placeholder text `#b8bbc3`, radio inactive `#d4d2e0`.
- `get_variable_defs` result: `{}`; no reusable Figma variable definitions were returned for this node.
- Code Connect: unavailable for this Figma account seat; no production path mappings were returned.

Figma node: `2371:4269` (`Edit Foot` / Edit Food)

- Requested MCP calls: `get_design_context`, `get_variable_defs`, and `get_code_connect_map`.
- Layout: light mobile admin food editing form, 493 x 1024 reference frame.
- Extracted hierarchy: back button, Edit Food title, existing food image preview with edit affordance, prefilled food name/category/price/description inputs, availability radio controls, and Update Food CTA.
- Verified colors from layout data: page background `#fcfcfc`, input surface `#fdfdfd`, input border `#ecedf0` / `#f1f2f4`, primary orange `#ff4b00` / `#f75201`, label text `#6a6d76`, body text `#7f8289`, muted text `#81848b`.
- `get_variable_defs` result: `{}`; no reusable Figma variable definitions were returned for this node.
- Code Connect: unavailable for this Figma account seat; no production path mappings were returned.

Figma node: `2371:4315` (`Delete Food`)

- Requested MCP calls: `get_design_context`, `get_variable_defs`, and `get_code_connect_map`.
- Layout: light mobile admin delete confirmation screen, 493 x 1024 reference frame.
- Extracted hierarchy: back button, Delete Food title, warning panel, trash icon badge, confirmation title/body, food summary card, Delete Permanently destructive CTA, and Cancel secondary CTA.
- Verified colors from layout data: page background `#fcfcfc`, warning surface `#fcf0ed`, summary card `#fdfdfd`, destructive red `#df181c`, destructive border `#e3373c`, secondary border `#bec0c8`, title text `#4b4a52`, muted body `#97969f`.
- `get_variable_defs` result: `{}`; no reusable Figma variable definitions were returned for this node.
- Code Connect: unavailable for this Figma account seat; no production path mappings were returned.

Figma node: `2143:2111` (`Detail Menus` / Admin Food Detail)

- Requested MCP calls: `get_design_context`, `get_variable_defs`, and `get_code_connect_map`.
- Layout: dark mobile admin food detail screen, 393 x 1634 reference frame with a vertically scrolling menu detail page.
- Extracted hierarchy: compact admin header, foods toolbar/search/list-grid toggle/New Menu action, Foods title/subtitle, Detail Menus card, category trail, food image, `New Recipe` badge, food name/description, Add/Edit/Delete menu actions, Ingredients card, Nutrition Info card, Revenue chart with Monthly/Weekly/Daily segments, and bottom admin tab bar with Foods active.
- Verified colors from layout data: app background `#121212`, header/card surface `#1e1e1e`, inset surface `#2a2a2a`, primary red `#e53935`, muted text `#b0b0b0`, orange category text `#ff8904`, border `#2a2a2a`, primary text `#ffffff`.
- `get_variable_defs` result: `{}`; no reusable Figma variable definitions were returned for this node.
- Code Connect: unavailable for this Figma account seat; no production path mappings were returned.

Figma node: `2144:393` (`Customer Detail`)

- Requested MCP calls: `get_design_context`, `get_variable_defs`, and `get_code_connect_map`.
- Layout: dark mobile admin customer detail screen, 393 x 1331 reference frame with stacked profile, customer activity, balance, and liked-food analytics sections.
- Extracted hierarchy: compact admin header, Customer Detail title/subtitle, customer profile card, avatar, role, call/edit action buttons, address line, email/phone/company rows, Most Ordered Food card with Monthly/Weekly/Daily segments, red balance card, Most Liked Food grouped bar chart, chart legend, and bottom admin tab bar with Customer active.
- Verified colors from layout data: app background `#121212`, header/card surface `#1e1e1e`, inset surface `#2a2a2a`, primary red `#e53935`, red balance card `#ce1212`, muted text `#b0b0b0`, blue chart `#3b82f6`, orange chart `#f97316`, yellow chart `#f6b100`, border `#2a2a2a`, primary text `#ffffff`.
- `get_variable_defs` result: `{}`; no reusable Figma variable definitions were returned for this node.
- Code Connect: unavailable for this Figma account seat; no production path mappings were returned.

Figma node: `2144:784` (`Notifications`)

- Requested MCP calls: `get_design_context`, `get_variable_defs`, and `get_code_connect_map`.
- Layout: dark mobile admin notification inbox, 393 x 853 reference frame with fixed admin header, search/action row, grouped activity rows, and bottom admin tab bar.
- Extracted hierarchy: compact admin header, notification search input, red add/action button, `Pinned Message` section, `Recent Message` section, unread count badges, active unread row highlight, read checkmarks, and bottom admin tab bar with Notifications active.
- Verified colors from layout data: app background `#121212`, notification panel/card surface `#1e1e1e`, inset search/icon surface `#2a2a2a`, primary red `#e53935`, active notification highlight `rgba(58,18,18,0.6)`, muted text `#b0b0b0`, border `#2a2a2a`, primary text `#ffffff`.
- `get_variable_defs` result: `{}`; no reusable Figma variable definitions were returned for this node.
- Code Connect: unavailable for this Figma account seat; no production path mappings were returned.

Figma node: `2498:2604` (`Payment Verification`)

- Requested MCP calls: `get_design_context`, `get_variable_defs`, and `get_code_connect_map`.
- Layout: dark mobile admin payment verification module, 375 x 1004 reference frame with a vertically scrolling approval workflow.
- Extracted hierarchy: search/action toolbar, `Module: Payment Verification` heading, payment id/status row, timestamp, bordered payment details panel, payment information rows, payment source details, admin note panel, Reject Payment button, and Approve Payment button.
- Verified colors from layout data: app background `#1a1a1a`, surface `#262626`, divider/border `#404040`, action red `#e11d48`, pending badge surface `#3f2e1a`, pending text `#d97706`, muted text `#9ca3af`, primary text `#ffffff`.
- `get_variable_defs` result: `{}`; no reusable Figma variable definitions were returned for this node.
- Code Connect: unavailable for this Figma account seat; no production path mappings were returned.

Figma node: `2376:5904` (`Orders Screen` / Admin Daily Orders)

- Requested MCP calls: `get_design_context`, `get_variable_defs`, and `get_code_connect_map`.
- Layout: dark mobile admin daily order monitoring screen, 404 x 1024 reference frame with stacked order cards and bottom admin navigation.
- Extracted hierarchy: top menu/search/filter actions, Orders title/subtitle, status filter chips with counts, daily order cards, order/customer/phone rows, food thumbnail and item summary, amount, View Details action, Update Status action, and bottom admin nav with Orders active.
- Verified colors from layout data: page background near `#161615`, card surface `#21211f`, card border `#343432`, active/order red `#ce2e28` / `#d1332b`, pending surface `#403423`, preparing surface `#27303c`, delivered surface `#283227`, muted text `#646462` / `#9f9f9d`, primary text `#d4d4d2`.
- `get_variable_defs` result: `{}`; no reusable Figma variable definitions were returned for this node.
- Code Connect: unavailable for this Figma account seat; no production path mappings were returned.

Figma node: `2376:6037` (`Order Status update`)

- Requested MCP calls: `get_design_context`, `get_variable_defs`, and `get_code_connect_map`.
- Layout: dark mobile admin order status update screen, 429 x 1024 reference frame with a fixed admin top bar, stacked order information cards, and bottom update actions.
- Extracted hierarchy: menu/search/notification/profile top bar, selected order ID strip with close action, Customer Information card, Order Items card with item rows and totals, Order Information card with payment method/status/date/order ID, status update controls for Preparing/Delivering/Delivered, Cancel Order action, and Update Status action.
- Verified colors from layout data: page background `#161615`, card surface `#20201e`, input/search surface `#2c2c2c`, table header `#2f2f2f`, divider/border `#2a2a29` / `#30302e`, action red `#cf2a28`, muted text `#70706d` / `#a3a3a0`, primary text `#aaaaa7`.
- `get_variable_defs` result: `{}`; no reusable Figma variable definitions were returned for this node.
- Code Connect: unavailable for this Figma account seat; no production path mappings were returned.

Expo v57 docs checked before implementation:

- `expo-router` is the file-based routing library for React Native and web apps.
- SDK 57 pairs with React Native `0.86`, React `19.2.3`, and recommends `expo-router ~57.0.3`.
- SDK 56+ routes app code away from direct `@react-navigation/*` imports, so this project continues using `expo-router`.

## Component Breakdown

| Element | Classification | Path |
| --- | --- | --- |
| `AuthChoiceScreen` | Screen | `src/app/auth-choice.tsx` |
| `SplashScreen` | Screen | `src/app/splash.tsx` |
| `LoginScreen` | Screen | `src/app/login.tsx` |
| `SignupScreen` | Screen | `src/app/signup.tsx` |
| `AuthTextField` | Feature | `src/components/features/AuthTextField.tsx` |
| `BottomNavbar` | Feature | `src/components/features/BottomNavbar.tsx` |
| Auth illustration block | UI | `src/app/auth-choice.tsx` |
| App navbar icon strip | UI | `assets/images/app-navbar-icons.svg` |
| Splash logo mark | UI | `assets/images/splash-logo-mark.svg` |
| Splash CircleNotch loader | UI | `assets/images/circle-notch.svg` |
| Registration star ornament | UI | `assets/images/auth-star.svg` |
| Login validation icon | UI | `src/app/login.tsx` |
| Password visibility toggle | Feature | `src/app/login.tsx`, `src/app/signup.tsx` |
| Google registration button | Feature | `src/app/signup.tsx` |
| Google login button | Feature | `src/app/login.tsx` |
| Title and supporting copy | UI | `src/app/auth-choice.tsx` |
| `Log In` button | Feature | `src/components/features/ActionButton.tsx` |
| `Create account` button | Feature | `src/components/features/ActionButton.tsx` |
| Auth colour/radius/input tokens | UI | `src/constants/theme.ts` |
| Onboarding completion navigation | Layout | `src/app/onboarding.tsx` |
| Registration services/API logic | Service | Not added; no backend/auth contract exists yet. |
| `AdminDashboardScreen` | Screen | `src/app/admin-dashboard.tsx` |
| Admin metrics cards | UI | `src/features/admin/components/admin-metric-card.tsx` |
| Sales bar chart | UI | `src/features/admin/components/sales-bar-chart.tsx` |
| Kitchen order queue row | Feature | `src/features/admin/components/order-queue-item.tsx` |
| Inventory watch row | Feature | `src/features/admin/components/inventory-status-card.tsx` |
| Admin dashboard data contract | Feature | `src/features/admin/types.ts` |
| Admin dashboard mock data service | Service | `src/features/admin/services/admin-dashboard-service.ts` |
| `AdminOrdersScreen` | Screen | `src/app/admin-orders.tsx` |
| Admin shell header | Layout | `src/features/admin/components/admin-shell-header.tsx` |
| Admin orders filters | Feature | `src/features/admin/components/admin-filter-button.tsx` |
| Admin orders table | Feature | `src/features/admin/components/admin-orders-table.tsx` |
| Admin daily orders card list | Feature | `src/features/admin/components/admin-orders-card-list.tsx` |
| Admin daily orders status chips | UI | `src/features/admin/components/admin-orders-card-list.tsx` |
| Admin orders mobile bottom nav | Layout | `src/features/admin/components/admin-orders-card-list.tsx` |
| Admin bottom tab bar | Layout | `src/features/admin/components/admin-bottom-tab-bar.tsx` |
| Admin order list data contract | Feature | `src/features/admin/types.ts` |
| Admin order list mock data service | Service | `src/features/admin/services/admin-orders-service.ts` |
| `AdminOrderDetailScreen` | Screen | `src/app/admin-orders/[order-id].tsx` |
| `AdminOrderStatusUpdateScreen` | Screen | `src/app/admin-orders/status-update/[order-id].tsx` |
| Admin order detail cards | Feature | `src/features/admin/components/admin-order-detail-sections.tsx` |
| Admin order status update sections | Feature | `src/features/admin/components/admin-order-status-update-sections.tsx` |
| Admin order operational status selector | UI | `src/features/admin/components/admin-order-status-update-sections.tsx` |
| Order detail route lookup | Service | `src/features/admin/services/admin-orders-service.ts` |
| Order detail data contract | Feature | `src/features/admin/types.ts` |
| `AdminCustomersScreen` | Screen | `src/app/admin-customers.tsx` |
| `AdminCustomerDetailScreen` | Screen | `src/app/admin-customers/[customer-id].tsx` |
| Admin customers table | Feature | `src/features/admin/components/admin-customers-table.tsx` |
| Admin customer profile detail card | Feature | `src/features/admin/components/admin-customer-detail-sections.tsx` |
| Admin customer ordered-food list | Feature | `src/features/admin/components/admin-customer-detail-sections.tsx` |
| Admin customer balance card | UI | `src/features/admin/components/admin-customer-detail-sections.tsx` |
| Admin customer liked-food chart | UI | `src/features/admin/components/admin-customer-detail-sections.tsx` |
| Admin customer filter button | Feature | `src/features/admin/components/admin-filter-button.tsx` |
| Admin customer data contract | Feature | `src/features/admin/types.ts` |
| Admin customer mock data service | Service | `src/features/admin/services/admin-customers-service.ts` |
| `AdminNotificationsScreen` | Screen | `src/app/admin-notifications.tsx` |
| Admin notification search/action toolbar | Layout | `src/features/admin/components/admin-notifications-list.tsx` |
| Admin notification grouped list | Feature | `src/features/admin/components/admin-notifications-list.tsx` |
| Admin notification row badges/checks | UI | `src/features/admin/components/admin-notifications-list.tsx` |
| Admin notification data contract | Feature | `src/features/admin/types.ts` |
| Admin notification mock data service | Service | `src/features/admin/services/admin-notifications-service.ts` |
| `AdminPaymentVerificationScreen` | Screen | `src/app/admin-payment-verification.tsx` |
| Admin payment verification toolbar | Layout | `src/features/admin/components/admin-payment-verification-sections.tsx` |
| Admin payment details card | Feature | `src/features/admin/components/admin-payment-verification-sections.tsx` |
| Admin payment note/actions | Feature | `src/features/admin/components/admin-payment-verification-sections.tsx` |
| Admin payment verification data contract | Feature | `src/features/admin/types.ts` |
| Admin payment verification mock data service | Service | `src/features/admin/services/admin-payment-verification-service.ts` |
| `AdminFoodsScreen` | Screen | `src/app/admin-foods.tsx` |
| `AdminFoodDetailScreen` | Screen | `src/app/admin-foods/[food-id]/index.tsx` |
| Admin foods toolbar | Layout | `src/features/admin/components/admin-foods-toolbar.tsx` |
| Admin food menu card | Feature | `src/features/admin/components/admin-food-card.tsx` |
| Admin food detail summary | Feature | `src/features/admin/components/admin-food-detail-sections.tsx` |
| Admin food ingredients/nutrition cards | UI | `src/features/admin/components/admin-food-detail-sections.tsx` |
| Admin food revenue chart | UI | `src/features/admin/components/admin-food-detail-sections.tsx` |
| Admin menu comparison card | Feature | `src/features/admin/components/admin-menu-comparison-card.tsx` |
| Admin foods data contract | Feature | `src/features/admin/types.ts` |
| Admin foods mock data service | Service | `src/features/admin/services/admin-foods-service.ts` |
| `AddAdminFoodScreen` | Screen | `src/app/admin-foods/new.tsx` |
| `EditAdminFoodScreen` | Screen | `src/app/admin-foods/[food-id]/edit.tsx` |
| `DeleteAdminFoodScreen` | Screen | `src/app/admin-foods/[food-id]/delete.tsx` |
| Admin food add/edit form | Feature | `src/features/admin/components/admin-food-form.tsx` |
| Food edit/delete route lookup | Service | `src/features/admin/services/admin-foods-service.ts` |

## Folder Mapping

- `src/app/`: Expo Router screens and route-level navigation.
- `src/components/features/`: reusable product/app features, including `ActionButton` variants.
- `src/components/ui/`: generic reusable visual primitives.
- `src/constants/`: shared design tokens from Figma and app theme values.
- `src/data/`: static mock data used by restaurant screens.
- `src/features/admin/`: admin-specific reusable UI, typed dashboard data, and service isolation for future API replacement.
- `services/`: no global service folder was created; admin service behavior is scoped under its feature boundary.

## Final src/ Structure

```text
src/
  app/
    _layout.tsx
    auth-choice.tsx
    admin-dashboard.tsx
    admin-customers.tsx
    admin-customers/
      [customer-id].tsx
    admin-foods.tsx
    admin-notifications.tsx
    admin-payment-verification.tsx
    admin-foods/
      new.tsx
      [food-id]/
        index.tsx
        delete.tsx
        edit.tsx
    admin-orders.tsx
    admin-orders/
      status-update/
        [order-id].tsx
      [order-id].tsx
    cart.tsx
    categories.tsx
    checkout.tsx
    index.tsx
    login.tsx
    notifications.tsx
    onboarding.tsx
    payment.tsx
    product.tsx
    profile.tsx
    search.tsx
    splash.tsx
    signup.tsx
    track-order.tsx
  components/
    features/
      ActionButton.tsx
      AuthTextField.tsx
      BottomNavbar.tsx
      CartItem.tsx
      CategoryChip.tsx
      FoodCard.tsx
      HeroBanner.tsx
      ProductQuantity.tsx
    ui/
      PaymentVerifiedAlert.tsx
      RatingStars.tsx
      SectionHeader.tsx
      Toast.tsx
  constants/
    theme.ts
  data/
    cart.ts
    notifications.ts
    product.ts
    profile.ts
    restaurant.ts
  features/
    admin/
      components/
        admin-bottom-tab-bar.tsx
        admin-customer-detail-sections.tsx
        admin-customers-table.tsx
        admin-filter-button.tsx
        admin-food-card.tsx
        admin-food-detail-sections.tsx
        admin-food-form.tsx
        admin-foods-toolbar.tsx
        admin-metric-card.tsx
        admin-menu-comparison-card.tsx
        admin-notifications-list.tsx
        admin-order-detail-sections.tsx
        admin-order-status-update-sections.tsx
        admin-orders-card-list.tsx
        admin-orders-table.tsx
        admin-payment-verification-sections.tsx
        admin-shell-header.tsx
        inventory-status-card.tsx
        order-queue-item.tsx
        sales-bar-chart.tsx
      services/
        admin-customers-service.ts
        admin-dashboard-service.ts
        admin-foods-service.ts
        admin-notifications-service.ts
        admin-orders-service.ts
        admin-payment-verification-service.ts
      types.ts
  STRUCTURE.md
```
