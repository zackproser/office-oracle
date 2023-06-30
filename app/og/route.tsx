import { ImageResponse } from 'next/server';

const image = fetch(new URL('https://office-oracle.vercel.app/michael-scott-oracle-2.png')).then((res) =>
  res.arrayBuffer()
);

export const runtime = 'edge';

export async function GET() {

  const imageData = await image;

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          fontSize: 40,
          color: 'black',
          background: '#f6f6f6',
          width: '100%',
          height: '100%',
          paddingTop: 50,
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <h1>The Office Oracle</h1>
        <img
          width="256"
          height="256"
          src={imageData as unknown as string}
          style={{
            borderRadius: 128,
          }}
        />
        <p>All burning questions answered</p>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
