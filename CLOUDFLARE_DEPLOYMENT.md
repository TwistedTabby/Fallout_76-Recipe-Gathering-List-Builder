# CloudFlare Deployment Steps

## Deployment Options
You can deploy this project either manually or through GitHub Actions (recommended).

### Option 1: GitHub Actions (Recommended)

1. **Set up GitHub Secrets**:
   Add the following secrets to your GitHub repository (Settings → Secrets and variables → Actions):
   - `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token with Pages deployment permissions
   - `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID

2. **Add GitHub Actions Workflow**:
   Create `.github/workflows/deploy.yml` with the following content:
   ```yaml
   name: Deploy to Cloudflare Pages
   
   on:
     push:
       branches: [main]
   
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         
         - name: Setup Node.js
           uses: actions/setup-node@v4
           with:
             node-version: '18'
             
         - name: Install Dependencies
           run: npm ci
           
         - name: Build
           run: npm run build
           
         - name: Deploy to Cloudflare Pages
           uses: cloudflare/wrangler-action@v3
           with:
             apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
             accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
             command: pages deploy dist
   ```

3. **Verify Deployment**:
   - Push your changes to the main branch
   - Check the Actions tab in your GitHub repository
   - Visit your Cloudflare Pages URL to verify the deployment

### Option 2: Manual Deployment

## Prerequisites
- Node.js installed (version >=16.17.0)
- Cloudflare account

## Steps
1. **Install Wrangler CLI**:
   
   For Windows (CMD/PowerShell):
   ```sh
   npm install -g wrangler
   ```

   For WSL/Linux:
   ```sh
   # Remove any existing installations
   npm uninstall -g wrangler
   rm -rf ~/.npm-global
   rm -rf /mnt/c/Users/<your-username>/AppData/Roaming/npm/node_modules/wrangler

   # Set up a local npm directory in WSL
   mkdir ~/.npm-global
   npm config set prefix '~/.npm-global'
   echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
   source ~/.bashrc

   # Install wrangler
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