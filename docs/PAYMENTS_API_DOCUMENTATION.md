# Medcin Platform Payments API Documentation

## Overview

The Payments module integrates with Chargily Pay v2 to handle online payments for study packs. It supports creating checkout sessions, processing webhook events, and managing subscriptions. The module also integrates with the activation code system to allow users to redeem codes for free access to study packs.



## Table of Contents

1. [Payment Endpoints](#payment-endpoints)
2. [Webhook Handling](#webhook-handling)
3. [Environment Configuration](#environment-configuration)
4. [Supported Payment Methods](#supported-payment-methods)
5. [Security](#security)
6. [Integration with Activation Codes](#integration-with-activation-codes)
7. [Testing](#testing)

## Payment Endpoints

### Create Checkout Session

```http
POST /payments/checkouts
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Description:** Create a new checkout session with Chargily Pay for purchasing a study pack subscription.

**Authentication:** Required (Student role)

**Request Body:**
```json
{
  "studyPackId": 1,
  "paymentDuration": {
    "type": "monthly", // or "yearly"
    "months": 3,       // required if type is "monthly"
    "years": 1         // required if type is "yearly"
  },
  "locale": "ar",             // optional: "ar" (default), "en", "fr"
  "paymentMethod": "edahabia" // optional: "edahabia" (default), "cib", "chargily_app"
}
```

**Validation Rules:**
- `studyPackId`: Positive integer (required)
- `paymentDuration.type`: Must be either "monthly" or "yearly" (required)
- `paymentDuration.months`: Positive integer, minimum 1 (required if type is "monthly")
- `paymentDuration.years`: Positive integer, minimum 1 (required if type is "yearly")
- `locale`: Enum value ("ar", "en", "fr"), defaults to "ar" (optional)
- `paymentMethod`: Enum value ("edahabia", "cib", "chargily_app"), defaults to "edahabia" (optional)

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "checkoutUrl": "https://pay.chargily.net/test/checkout/1234567890",
    "checkoutId": "1234567890"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Missing required fields: userId, studyPackId, paymentDuration"
}
```

### Request Validation

The endpoint validates the following conditions:
1. User must be authenticated
2. Study pack must exist in the database
3. Payment duration must be valid (monthly with months count or yearly with years count)
4. Study pack must have pricing information for the selected payment type


## Supported Payment Methods

1. **EDAHABIA**: Algerian prepaid card payments
2. **CIB**: Algerian bank card payments
3. **Chargily App**: QR code payments via the Chargily mobile application









