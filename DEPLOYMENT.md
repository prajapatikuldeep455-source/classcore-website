# Free Deployment

## Render

1. Create a GitHub repository and upload this website folder.
2. Do not upload `node_modules`, `.env`, `data/requests.json`, or the Windows installer. These are already excluded by `.gitignore`.
3. Upload `ClassCore-Setup-3.5.2.exe` as a GitHub Release asset because it is larger than 100 MB.
4. In Render, choose **New > Blueprint** and select the repository.
5. Render reads `render.yaml` and creates the free web service.
6. After the Render URL is created, set these environment variables in Render:

```text
ALLOWED_ORIGIN=https://your-service-name.onrender.com
DOWNLOAD_URL=https://github.com/YOUR_ACCOUNT/YOUR_REPO/releases/download/v3.5.2/ClassCore-Setup-3.5.2.exe
DOWNLOAD_SIZE=107.9 MB
```

`ADMIN_TOKEN` is generated automatically by the Render Blueprint.

## Verification

After deployment, open:

```text
https://your-service-name.onrender.com/api/health
https://your-service-name.onrender.com/downloads.html
```

The health endpoint should return `status: healthy`. The downloads page should list the desktop installer and user guide.

## Important

The free Render filesystem is temporary. Contact requests saved in `data/requests.json` can be lost after a restart or redeploy. Use Supabase, Firebase, or another hosted database before relying on contact submissions for production.
