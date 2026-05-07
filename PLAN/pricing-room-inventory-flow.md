# Pricing, room type, inventory flow

## Current implementation

- Product options represent hotel rooms, cruise cabins, tour packages, vehicles, or add-ons.
- Room/cabin/vehicle options are unit-based: if guest count exceeds one unit capacity, backend automatically calculates how many units are needed.
- Each option can define:
  - `maxGuests`, `maxAdults`, `maxChildren`: maximum capacity per unit before auto-splitting to more rooms/cabins.
  - `includedGuests`: guests included in one unit rate.
  - `extraGuestFee`: surcharge per extra guest per night when guests exceed included capacity but still fit in the unit.
  - `inventoryQuantity`: default number of sellable units.
  - `pricingRules`: seasonal/date rules used by backend pricing.
- Daily inventory can override total units or close a specific room/cabin option for a specific date in Admin > Lịch tồn kho.

## Pricing rule fields

Each `pricingRules` item can contain:

- `name`: admin-facing rule name.
- `months`: month numbers 1-12.
- `startDate`, `endDate`: inclusive date range, `YYYY-MM-DD`.
- `weekdays`: `0=Sunday`, `1=Monday`, ..., `6=Saturday`.
- `holidayDates`: exact `YYYY-MM-DD` dates that should match the rule.
- `price` or `basePrice`: room/cabin price per unit per night.
- `adultPrice`, `childPrice`: per-guest override when an option is priced per person.
- `extraFee`: extra fee per unit per night.
- `minNights`: minimum stay when the rule matches any selected night.
- `requiredMealName`, `requiredMealPrice`, `requiredMealChargeType`: required meal add-on; charge type is `guest`, `adult`, or `room`.
- `priority`: higher value wins when multiple rules match.

## Cat Ba Eco Hotel 2026 contract mapping

- Low season months: `1,2,3,10,11,12`.
- High season ranges: `2026-04-01` to `2026-05-15`, and `2026-08-03` to `2026-09-30`.
- Peak season range: `2026-05-16` to `2026-08-02`.
- Peak Friday/Saturday and listed holidays require at least 2 nights.
- Extra guest surcharge is configured as `300000` VND per guest per night.
- Breakfast is included in amenities, not charged as required meal.

## Next improvements

- Replace JSON textarea in option editor with a dedicated pricing calendar UI.
- Add reusable holiday calendars by market/supplier instead of hardcoding dates inside each option.
- Add room meal package editor for hotels that require lunch/dinner during peak dates.
- Add supplier contract attachment per property and versioned rate sheets for audit.
