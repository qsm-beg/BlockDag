# GridSmart Energy - Deployment Guide

## Quick Deployment to Vercel

### Option 1: Deploy via CLI

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Build the project**
```bash
npx expo export --platform web --output-dir dist
```

3. **Deploy to Vercel**
```bash
vercel --prod
```

4. **Follow the prompts:**
- Set up and deploy: Y
- Which scope: Select your account
- Link to existing project: N (first time) or Y (subsequent)
- Project name: gridsmart-energy
- Directory: ./dist
- Override settings: N

### Option 2: Deploy via GitHub Integration

1. **Push to GitHub**
```bash
git add .
git commit -m "Deploy GridSmart Energy to Vercel"
git push origin main
```

2. **Connect to Vercel**
- Go to https://vercel.com/new
- Import your GitHub repository
- Configure build settings:
  - Framework Preset: Other
  - Build Command: `npx expo export --platform web --output-dir dist`
  - Output Directory: `dist`
  - Install Command: `npm install`

3. **Deploy**
- Click "Deploy"
- Wait for build to complete
- Your app will be live at: `https://gridsmart-energy.vercel.app`

## Environment Variables

Add these in Vercel dashboard under Settings > Environment Variables:

```
REACT_APP_BLOCKDAG_RPC=https://rpc-testnet-v2.blockdag.network
REACT_APP_CHAIN_ID=20000
REACT_APP_EXPLORER_URL=https://awakening.bdagscan.com
```

## Post-Deployment Checklist

- [ ] Verify BlockDAG connection works
- [ ] Test wallet connection flow
- [ ] Check responsive design on mobile/tablet
- [ ] Verify all navigation works
- [ ] Test commitment and trading features
- [ ] Check console for errors
- [ ] Verify explorer links work

## Custom Domain (Optional)

1. In Vercel dashboard, go to Settings > Domains
2. Add your custom domain
3. Follow DNS configuration instructions

## Troubleshooting

### Build Fails
- Ensure all dependencies are in package.json
- Check for TypeScript errors: `npm run typecheck`
- Clear cache: `rm -rf node_modules dist && npm install`

### BlockDAG Connection Issues
- Verify RPC URL is correct
- Check CORS settings if needed
- Ensure environment variables are set

### Assets Not Loading
- Check that all assets are in the dist folder
- Verify paths in index.html
- Check browser console for 404 errors

## Performance Optimization

1. **Enable Caching**
- Vercel automatically handles caching
- Static assets cached for 31 days
- HTML cached for 0 seconds (always fresh)

2. **Monitor Performance**
- Use Vercel Analytics (free tier available)
- Check Web Vitals scores
- Monitor bundle size

## Rollback Deployment

If issues arise:
1. Go to Vercel dashboard
2. Click on "Deployments"
3. Find previous working deployment
4. Click "..." menu → "Promote to Production"

## Support

For deployment issues:
- Vercel Documentation: https://vercel.com/docs
- Expo Documentation: https://docs.expo.dev
- BlockDAG Explorer: https://awakening.bdagscan.com