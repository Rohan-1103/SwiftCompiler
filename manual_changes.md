# SwiftCompiler Setup Guide

## Environment Variables

### Required Environment Variables

The following environment variables need to be set in your Vercel project settings:

#### 1. NEXT_PUBLIC_APP_URL
**Purpose**: The public URL of your deployed application
**Value**: Your production domain URL
**Examples**:
- `https://swiftcompiler.vercel.app` (if deployed on Vercel)
- `https://your-custom-domain.com` (if using custom domain)
- `http://localhost:3000` (for local development)

**How to set**: 
- Go to your Vercel project dashboard
- Navigate to Settings → Environment Variables
- Add `NEXT_PUBLIC_APP_URL` with your production URL

#### 2. Supabase Environment Variables (Already Connected)
The following Supabase variables are already configured through the integration:
- `SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL` 
- `SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_JWT_SECRET`

### Optional Environment Variables

#### NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL
**Purpose**: Redirect URL for email confirmations during development
**Value**: `http://localhost:3000` (for local development)
**Note**: This is only needed if you're running the app locally

## Database Setup

### 1. Run Database Scripts
Execute the following SQL scripts in order through the v0 interface:

1. `scripts/001_create_users_profiles.sql` - Creates user profiles table
2. `scripts/002_create_projects_table.sql` - Creates projects table
3. `scripts/003_create_project_files_table.sql` - Creates project files table
4. `scripts/004_create_compilation_logs_table.sql` - Creates compilation logs table
5. `scripts/005_create_project_templates.sql` - Creates project templates with sample data

### 2. Supabase Auth Configuration
In your Supabase dashboard:

1. Go to Authentication → Settings
2. Set **Site URL** to your production URL (same as NEXT_PUBLIC_APP_URL)
3. Add **Redirect URLs**:
   - `https://your-domain.com/auth/callback`
   - `http://localhost:3000/auth/callback` (for development)

## Deployment Steps

### 1. Deploy to Vercel
1. Connect your GitHub repository to Vercel
2. Set the environment variables mentioned above
3. Deploy the application

### 2. Update Supabase Settings
After deployment, update your Supabase project:
1. Set the Site URL to your production domain
2. Add your production domain to allowed redirect URLs

### 3. Test the Application
1. Visit your deployed URL
2. Test user registration and login
3. Create a test project and verify compilation works
4. Test file operations (create, edit, delete files)

## Features Overview

### Supported Programming Languages
- JavaScript/Node.js
- Python
- Java
- C++
- C
- C#
- Go
- Rust
- PHP
- Ruby
- Swift
- Kotlin
- TypeScript
- HTML/CSS
- SQL

### Key Features
- **Code Editor**: Monaco Editor with syntax highlighting
- **Project Management**: Create, edit, delete projects
- **File Operations**: Full file system with folders and files
- **Code Compilation**: Execute code in multiple languages
- **User Authentication**: Secure login/signup with Supabase
- **Real-time Collaboration**: Share projects with others
- **Templates**: Pre-built project templates
- **Responsive Design**: Works on desktop and mobile

## Troubleshooting

### Common Issues

#### 1. Authentication Not Working
- Check that NEXT_PUBLIC_APP_URL matches your actual domain
- Verify Supabase redirect URLs are correctly configured
- Ensure all Supabase environment variables are set

#### 2. Code Compilation Failing
- Check browser console for errors
- Verify the compilation API is accessible
- Some languages may have limitations in the browser environment

#### 3. Database Connection Issues
- Verify Supabase integration is properly connected
- Check that all database scripts have been executed
- Ensure RLS policies are enabled

### Support
If you encounter issues:
1. Check the browser console for error messages
2. Verify all environment variables are correctly set
3. Ensure database scripts have been executed successfully
4. Contact support at vercel.com/help if needed

## Security Notes

- All user data is protected by Row Level Security (RLS) policies
- Code execution is sandboxed and has timeout limits
- User authentication is handled securely through Supabase Auth
- API routes are protected and require authentication
- File operations are restricted to project owners

## Performance Optimizations

The application includes several production optimizations:
- Code splitting and lazy loading
- Image optimization
- Caching strategies
- Error boundaries
- Loading states
- SEO optimizations
- PWA capabilities

Your SwiftCompiler is now ready for production use!
