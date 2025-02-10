# CloudFlare Deployment Steps

## Prerequisites
- Node.js installed
- Wrangler CLI installed
- Cloudflare account

## Steps
1. **Install Wrangler CLI**:
   ```sh
   npm install -g wrangler
   ```

2. **Login to Cloudflare**:
   ```sh
   wrangler login
   ```

3. **Configure Wrangler**:
   Create a `wrangler.toml` file in the root of your project with the following content:
   ```toml
   name = "fo76-gathering-list-builder"
   type = "javascript"
   account_id = "your-account-id"
   workers_dev = true
   ```
   Replace `your-account-id` with your actual Cloudflare account ID.

4. **Build the Project**:
   ```sh
   npm run build
   ```

5. **Publish to Cloudflare Pages**:
   ```sh
   wrangler pages publish dist
   ```

6. **Verify Deployment**:
   Visit the URL provided by Cloudflare to ensure your application is deployed correctly.

7. **Troubleshooting**:
   If you encounter any issues during deployment, here are some common troubleshooting steps:
   - Check the build logs for any errors or warnings
   - Ensure that your `wrangler.toml` file is correctly configured
   - Verify that your Cloudflare account has the necessary permissions to deploy to Pages
   - Consult the Cloudflare Pages documentation for additional guidance