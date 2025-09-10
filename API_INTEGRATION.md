# API Integration Guide

## Overview

This application has been updated to use **API-first approach** instead of localStorage. All data is now saved directly to and loaded from the API endpoints:

**GET Endpoints:**

- **All Users**: `http://10.165.30.9:5000/personaldetails/` - Returns list of all users
- **User Details**: `http://10.165.30.9:5000/personaldetails/{id}/combined` - Returns specific user with related officials

**POST Endpoints:**

- **Create Personal Details**: `http://10.165.30.9:5000/personaldetails/` - Creates new personal details
- **Create Related Officials**: `http://10.165.30.9:5000/relatedofficials/` - Creates new related official

## How to Use

### 1. View All API Users

1. Navigate to the **User Management** panel (right side of the screen)
2. In the **"API Users"** section, you'll see all users loaded from the API automatically
3. Each user shows their name and ID with a blue background
4. Click **"Refresh"** to reload the users list from the API

### 2. Load User Data

**Method 1: Click on API User**

- Simply click on any user in the "API Users" section
- This will automatically load their personal details and related officials

**Method 2: Quick Fetch by ID**

- Use the "Quick Fetch by ID" section
- Enter a specific ID and click "Fetch" or press Enter

### 3. Create New Data

**Create Personal Details + Related Officials:**

1. Fill out the **Personal Details** tab with first name and last name
2. Fill out the **Related Officials** tab with officials information
3. Click **"Save to API"** button at the bottom
4. The system will:
   - First create the personal details
   - Then create each related official linked to the personal details
   - Refresh the API users list automatically
   - Show success confirmation

**Add Related Officials to Existing Person:**

1. Click on an existing user from the API Users list to load their data
2. Go to the **Related Officials** tab
3. Add a new related official
4. Choose "Yes" when prompted to save directly to API, or "No" to add locally
5. If saved directly to API, it will be immediately available

### 4. Data Management Features

- **Real-time API Integration**: All saves go directly to the API
- **Automatic Refresh**: User list refreshes automatically after saves
- **Error Handling**: Clear error messages for failed operations
- **Loading States**: Visual feedback during API operations
- **Validation**: Form validation before saving to API

## API Response Structures

### All Users Endpoint

```json
[
  {
    "personal_details_id": 2,
    "first_name": "Kumar",
    "last_name": "Sangakkara",
    "is_deleted": false
  },
  {
    "personal_details_id": 3,
    "first_name": "Mahela",
    "last_name": "Jayawardhena",
    "is_deleted": false
  }
]
```

### User Details Endpoint

```json
{
  "personal_details_id": 2,
  "first_name": "Kumar",
  "last_name": "Sangakkara",
  "is_deleted": false,
  "related_officials": [
    {
      "related_officials_id": 2,
      "related_official_name": "Kumar",
      "related_official_nic_number": "213423423v",
      "ro_is_deleted": false
    }
  ]
}
```

### 3. Create Personal Details

To create new personal details, you can use the `createPersonalDetails` async thunk from the Redux store:

```javascript
import { createPersonalDetails } from "./slice/formSlice.jsx";

// Dispatch the action
dispatch(
  createPersonalDetails({
    firstName: "Mahela",
    lastName: "Jayawardhena",
  })
);
```

**API Request Body:**

```json
{
  "first_name": "Mahela",
  "last_name": "Jayawardhena"
}
```

### 4. Create Related Officials

To create a new related official, use the `createRelatedOfficial` async thunk:

```javascript
import { createRelatedOfficial } from "./slice/formSlice.jsx";

// Dispatch the action
dispatch(
  createRelatedOfficial({
    personalDetailsId: 2,
    relatedOfficialName: "Daasith Jayasuriya",
    relatedOfficialIdNumber: "45657547v",
  })
);
```

**API Request Body:**

```json
{
  "personal_details_id": 2,
  "related_official_name": "Daasith Jayasuriya",
  "related_official_nic_number": "45657547v"
}
```

## Features

- **API-First Approach**: No more localStorage - all data goes directly to API
- **Auto-load Users**: All API users are automatically loaded when the app starts
- **Click to Load**: Click any API user to load their full details
- **Direct API Save**: Save personal details and related officials directly to API
- **Batch Operations**: Create personal details first, then all related officials automatically
- **Real-time Updates**: User list refreshes immediately after successful saves
- **Loading States**: Visual feedback during all API operations
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Data Validation**: Form validation before API calls
- **Redux Integration**: All API operations managed through Redux state
- **Visual Indicators**: Blue badges for API users, green badges for loaded API data
- **Filtering**: Only non-deleted users and officials are loaded from the API
- **Manual Refresh**: Refresh button to reload API users

## Removed Features

- **localStorage**: No longer used for data persistence
- **Local User Management**: All users now come from API
- **Search Functionality**: Removed (will be implemented with API search endpoints)
- **Update/Delete Operations**: Removed (pending API UPDATE/DELETE endpoints)

## Testing

1. Start the development server: `bun run dev`
2. Open http://localhost:5173
3. Verify API users are loaded automatically
4. Test creating new personal details and related officials
5. Verify data appears in API users list after save
6. Test loading existing user data by clicking on API users

## Future Enhancements

- UPDATE API endpoints for editing existing records
- DELETE API endpoints for removing records
- SEARCH API endpoints for filtering users
- Pagination for large user lists
