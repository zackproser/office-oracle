import { ImageResponse } from 'next/server';

const image = fetch(new URL('@/app/oracle-images/michael-scott-oracle-2.png', import.meta.url)).then((res) =>
  res.arrayBuffer()
);

export const runtime = 'edge';

export async function GET() {

  const imageData = await image;

  let imgData = ''

  if (imageData instanceof ArrayBuffer) {
    imgData = String(imageData)
    console.dir(imgData)
  }

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
          src={imgData}
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
