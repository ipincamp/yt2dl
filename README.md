This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## REST API

All APIs using `POST` method with the body like this:

```json
{
  "url": "youtube_link_url"
}
```

Sample Response Data API v1 (ytdl-core)

> Endpoint: `/api/v1`

```json
{
  "status": true,
  "statusCode": 200,
  "message": "success",
  "data": {
    "title": "CHATEEZ DI BILANG KETEKNYA HITAM ! LANGSUNG DU BUKTIIN ! #prazteguh #chateez #podcast",
    "thumbnail": "https://i.ytimg.com/vi/nBbPV1VvSWk/maxres2.jpg?sqp=-oaymwEoCIAKENAF8quKqQMcGADwAQH4Ac4FgAKACooCDAgAEAEYXSBlKFowDw==&rs=AOn4CLDNVNoJVav8fh-ND8JfKrRh8azgaw",
    "channel": "lookatme",
    "duration": "00:54",
    "published": "05 February 2024",
    "formats": [
      {
        "q": "640p (mp4)",
        "t": "2c82d279237a147ba8726076c5012ce1.3432d6d61e4b313f92208e38800932ae71596bb4236b14cf59ae241cbf944ef4.43b1a71f4cabd0e5623f7ff96f680465a045432ded0fb50102f8a337a96b85c2"
      },
      {
        "q": "128k (mp3)",
        "t": "34132ed51623bc4e4ff516cc25c5a9c3.238ae213b1622b30146d9aa32d68bddb0db8f2fcd8721d67eee5baab6ce4c9c4.0d6a515e727e204cd880818a5a619bf7259792d3f614bd4dda9c60e20eec5971"
      },
      {
        "q": "1280p (mp4)",
        "t": "32673adfbe9c7ee94865cd922d0b9c61.50f8d4fd0b4326011a90e7420fd4cc2321f6a5f5a86073542bc11e3d919383bf.d458ff66c4c154e97f50e50f203339bb785819345ce0155dc3ddf17393bf7ae5"
      }
    ]
  }
}
```

Sample Response Data API v2 (y2mate)

> Endpoint: `/api/v2`

```json
{
  "status": true,
  "statusCode": 200,
  "message": "success",
  "data": {
    "title": "CHATEEZ DI BILANG KETEKNYA HITAM ! LANGSUNG DU BUKTIIN ! #prazteguh #chateez #podcast",
    "thumbnail": "https://i.ytimg.com/vi/nBbPV1VvSWk/maxresdefault.jpg",
    "channel": "lookatme",
    "duration": "00:54",
    "formats": [
      {
        "q": "128k (mp3)",
        "t": "af9a80143d64c15df8f5d53c5d806705.3a148a7b77238fc4e2405835fdb20552f4d77fb7b96e78b26c6a578da882db2d.9c9ea85ccad28af7da1ab7757e6816e9c90782b662df2fd07cc1a59973512f6b"
      },
      {
        "q": "144p (mp4)",
        "t": "1e82d02ee0303227f13625a01ab1c375.aa5bbaad1f6cfea708ba2a92349d02f30a773c6e7b19dfd8ae24e5aac0f3591f.70404c5debaae49b941726c9bc122007dfd7a6b07d8a3b7d7eba2606edf35da1"
      },
      {
        "q": "240p (mp4)",
        "t": "84f37494e38ffe540c313c47cafeb5e0.7bf38e819e51a16fd8a1051282222f81fdb87b1acaa6f23f16faee094401132b.935d055300ee9a97803baa30c17caaa55ce6c2a9faf59485e734870109c3fcc2"
      },
      {
        "q": "360p (mp4)",
        "t": "8066dd1d5f23f2453a4218a9c841eefc.75a6fe3761877e698aba42d42f99cc9628346dea61cf98960f249694d788a0a7.fd29a97c7e8416e39c945d31dd5f40db1d87791791fe77757742f18ac818572d"
      },
      {
        "q": "480p (mp4)",
        "t": "564d710cddf3f441d9a7c5a2458c4a65.c6ea5ede3430416b3a75eea7f23f928b1ef16588527398392540b96ad43bf9ff.7e5e4870fd93028bc9365a1d2ede951d0944f01256d79d40fd6b9941c7c4c512"
      },
      {
        "q": "720p (mp4)",
        "t": "4283c25433172f97a4caeef844fc8a68.f76c6691541ceca16c8e4fea868954a06871e317b6490cefca50163e17743de9.31104e5f24f72d183278bbf34e82d612b8599a6a55f4d13bc9fe57580b99c06a"
      }
    ]
  }
}
```

To download the file, you can simply use the `GET` method and fill in the query as follows by providing the token that has been obtained from the previous API.

> Endpoint: /api/dl?t=`PASTE_TOKEN_HERE`
