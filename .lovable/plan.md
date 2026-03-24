

## Fix: Amenity & Rule Toggle Buttons in Arabic (RTL) Mode

**Problem**: The toggle switches in the amenities and house rules sections display incorrectly in Arabic mode. The layout order (icon + label on left, switch on right) doesn't flip properly for RTL, causing the switches to appear on the wrong side.

**Solution**: Reverse the order of the icon/label group and the switch in RTL mode by using `flex-row-reverse` for RTL, so the switch appears on the left and the label+icon on the right — matching the screenshot reference.

### Changes

**File: `src/pages/ListRoom.tsx`**

1. **Amenities section (line ~563)**: Change the toggle row div from:
   ```
   flex items-center justify-between
   ```
   to:
   ```
   flex items-center justify-between rtl:flex-row-reverse
   ```
   This ensures in RTL the switch is on the left and icon+label on the right — matching the uploaded screenshot.

2. **House Rules section (line ~588)**: Apply the same `rtl:flex-row-reverse` fix to the house rules toggle rows.

Both sections use the same pattern, so the fix is identical in both places.

