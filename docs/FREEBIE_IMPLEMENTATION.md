# Freebie Implementation Guide

## Overview
BlackBoard Sets automatically include a FREE Functional Foot Workshop (€49 value) as a gift with purchase.

## How It Works

### 1. Product Page
- BlackBoard products show "FREE BONUS: Functional Foot Workshop (🎁 €49 value)" in the benefits section
- This is displayed prominently to increase conversion

### 2. Cart System
When a BlackBoard Set is added to cart:
- The system automatically adds the Functional Foot Workshop as a freebie
- The freebie is marked with `isFreebie: true` and `parentProductId` linking to the BlackBoard product
- Price is set to 0 for the freebie
- Removing the BlackBoard product also removes its associated freebie

### 3. Cart Display
- Freebies show with a gift icon (🎁) and "Free Gift" label
- Price displays as "FREE" in green
- Quantity controls are hidden (always 1)
- Remove button is hidden (can only remove by removing parent product)

### 4. Checkout
- Freebies appear in order summary with gift icon
- Shows "Gift Value: €49.00" to highlight savings
- Total price excludes freebie value

## WooCommerce Order Creation

When creating orders in WooCommerce, the backend should:

### Method 1: Line Item with Zero Price (Recommended)
```json
{
  "line_items": [
    {
      "product_id": 123,  // BlackBoard product ID
      "quantity": 1,
      "price": "99.00"
    },
    {
      "product_id": 456,  // Workshop product ID
      "quantity": 1,
      "price": "0.00",    // Override price to 0
      "meta_data": [
        {
          "key": "_is_freebie",
          "value": "true"
        },
        {
          "key": "_parent_product_id",
          "value": "123"
        },
        {
          "key": "_original_price",
          "value": "49.00"
        }
      ]
    }
  ]
}
```

### Method 2: Using Coupons
Create a 100% discount coupon for the workshop and apply it automatically:
```json
{
  "coupon_lines": [
    {
      "code": "WORKSHOP_FREEBIE_BLACKBOARD"
    }
  ]
}
```

### Method 3: Fee Line (Alternative)
Add as a negative fee to show the discount:
```json
{
  "fee_lines": [
    {
      "name": "Free Workshop Gift",
      "total": "-49.00"
    }
  ]
}
```

## Backend Considerations

1. **Inventory Management**
   - Workshop should not decrement stock when added as freebie
   - Or maintain separate "gift" inventory

2. **Reporting**
   - Track freebies separately in analytics
   - Monitor conversion impact

3. **Email Notifications**
   - Order confirmation should highlight the free gift
   - Include workshop access instructions

4. **Validation Rules**
   - Only one workshop freebie per order
   - Only for qualifying BlackBoard products
   - Cannot be combined with workshop purchases

## Frontend Detection

The system identifies freebies by checking:
```typescript
// Check if product qualifies for freebie
const isBlackBoardSet = 
  product.categories?.some(cat => 
    cat.slug === 'blackboard-sets' || 
    cat.name.toLowerCase().includes('blackboard set')
  ) || 
  product.name.toLowerCase().includes('blackboard')
```

## Future Enhancements

1. **Dynamic Freebies**
   - Configure different freebies for different products
   - Seasonal promotions

2. **Threshold-Based**
   - Free gift for orders over certain amount
   - Multiple tiers of gifts

3. **Choice of Freebies**
   - Let customer choose from selection
   - A/B test different freebies