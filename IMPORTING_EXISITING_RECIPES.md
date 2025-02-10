# Importing Existing Recipes and Setting Up R2 Storage

## Setting Up Cloudflare R2

1. Create R2 Bucket:
   ```bash
   # Using Wrangler CLI
   wrangler r2 bucket create fo76-recipes
   ```

2. Configure R2 Access:
   - Go to Cloudflare Dashboard → R2
   - Create API Token with R2 permissions
   - Note down the following:
     - Account ID
     - Access Key ID
     - Secret Access Key

3. Update GitHub Secrets:
   Add these secrets to your repository:
   - `R2_ACCESS_KEY_ID`
   - `R2_SECRET_ACCESS_KEY`
   - `R2_BUCKET_NAME`

## Importing Recipes

1. Prepare your recipe data:
   ```typescript
   // recipes/aged-mirelurk-queen-steak.json
   {
     "recipe_name": "Aged Mirelurk Queen Steak",
     "ingredients": [
       {
         "ingredient": "Boiled Water",
         "quantity": 2
       }
     ],
     "buffs": [
       {
         "buff": "3",
         "SPECIAL": "END",
         "duration": "60 min"
       }
     ]
   }
   ```

2. Run the import script:
   ```bash
   npm run import-recipes
   ```

## Deployment Workflow

The GitHub Actions workflow will automatically:
1. Build the application
2. Upload recipe files to R2
3. Deploy to Cloudflare Pages

## Local Development

To work with recipes locally:
1. Clone the repository
2. Create `.env.local`:
   ```env
   R2_ACCESS_KEY_ID=your_key
   R2_SECRET_ACCESS_KEY=your_secret
   R2_BUCKET_NAME=fo76-recipes
   ```
3. Run `npm run dev`

## Recipe File Structure

Recipes are stored in R2 with this structure:
```
fo76-recipes/
  ├── recipes/
  │   ├── aged-mirelurk-queen-steak.json
  │   ├── another-recipe.json
  │   └── index.json
  └── meta/
      └── categories.json
```

## Adding New Recipes

1. Create a new JSON file in `recipes/`
2. Follow the recipe schema
3. Push to main branch
4. GitHub Actions will handle the upload
