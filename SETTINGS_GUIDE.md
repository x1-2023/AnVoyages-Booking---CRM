# Dynamic Settings System

The application now supports dynamic frontend customization through the admin panel.

## Features

Admins can customize the following frontend settings:

### Site Information
- **Site Name**: Displayed in navbar and footer
- **Site Tagline**: Shown in footer description

### Hero Section
- **Hero Background Image**: Main background image on homepage (URL-based)
- **Hero Title**: Main headline text
- **Hero Subtitle**: Subtitle text below the title

### Contact Information
- **Contact Email**: Public contact email
- **Contact Phone**: Public contact phone number

### Brand Colors
- **Primary Color**: Main theme color
- **Secondary Color**: Accent color

### Footer
- **Footer Text**: Copyright and footer text

## How to Use

### 1. Access Admin Settings

Navigate to `/admin/settings` in your browser (you must be logged in as admin).

### 2. Update Settings

- Fill in the form fields with your desired values
- For images, use full URLs (e.g., `https://example.com/image.jpg`)
- Use the color pickers for brand colors
- Click "Save All Changes" when done

### 3. Initialize Defaults

Click "Initialize Defaults" to restore all settings to default values.

## Technical Implementation

### Backend

**Database**: Settings are stored in the `system_settings` table with key-value pairs.

**Endpoints**:
- `GET /api/settings` - Fetch all settings (public)
- `GET /api/settings/:key` - Fetch single setting (public)
- `PUT /api/settings/:key` - Update single setting (auth required)
- `PUT /api/settings` - Update multiple settings (auth required)
- `POST /api/settings/initialize` - Initialize defaults (auth required)
- `DELETE /api/settings/:key` - Delete setting (auth required)

**Files**:
- [backend/src/settings/settings.service.ts](backend/src/settings/settings.service.ts)
- [backend/src/settings/settings.controller.ts](backend/src/settings/settings.controller.ts)
- [backend/src/settings/settings.module.ts](backend/src/settings/settings.module.ts)

### Frontend

**Settings Context**: Global context provides settings to all components.

**Files**:
- [src/contexts/SettingsContext.tsx](src/contexts/SettingsContext.tsx) - Settings provider
- [src/services/settings.service.ts](src/services/settings.service.ts) - API calls
- [src/pages/admin/Settings.tsx](src/pages/admin/Settings.tsx) - Admin UI

**Components Using Settings**:
- [src/pages/Index.tsx](src/pages/Index.tsx) - Hero background, title, subtitle
- [src/components/Navbar.tsx](src/components/Navbar.tsx) - Site name
- [src/components/Footer.tsx](src/components/Footer.tsx) - Site name, tagline, footer text

## Example Workflow

1. Admin logs in to `/admin`
2. Navigates to `/admin/settings`
3. Updates "Hero Background Image" to `https://images.unsplash.com/photo-1506905925346-21bda4d32df4`
4. Updates "Hero Title" to "Explore the World"
5. Clicks "Save All Changes"
6. Frontend immediately reflects the new background image and title on the homepage

## Image Hosting Recommendations

For background images, you can use free image hosting services:
- **Imgur**: https://imgur.com
- **Cloudinary**: https://cloudinary.com
- **Unsplash**: https://unsplash.com (for free stock photos)

## Future Enhancements

Potential improvements:
- Direct image upload instead of URL-only
- Logo customization
- Social media links customization
- Email template customization
- Multi-language settings support
