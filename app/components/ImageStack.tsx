import Image from "next/image";

const displayImages = [
    "/images/display/2b70f6c9c5767d65ac14f9529ca56e7f.jpg",
    "/images/display/34e8d07c5b57c0eb3d79de2e50f73467.jpg",
    "/images/display/ae6c3bb5ef0e46d9313b2cce91f7916f.jpg",
    "/images/display/de9ffa09a3742c3354326b84bafecaf6.jpg",
    "/images/display/e9f644185978884a335f84c7b38ff648.jpg",
    "/images/display/2b70f6c9c5767d65ac14f9529ca56e7f.jpg",
    "/images/display/34e8d07c5b57c0eb3d79de2e50f73467.jpg",
    "/images/display/ae6c3bb5ef0e46d9313b2cce91f7916f.jpg",
    "/images/display/de9ffa09a3742c3354326b84bafecaf6.jpg",
    "/images/display/e9f644185978884a335f84c7b38ff648.jpg",
    "/images/display/2b70f6c9c5767d65ac14f9529ca56e7f.jpg",
    "/images/display/34e8d07c5b57c0eb3d79de2e50f73467.jpg",
    "/images/display/ae6c3bb5ef0e46d9313b2cce91f7916f.jpg",
    "/images/display/de9ffa09a3742c3354326b84bafecaf6.jpg",
    "/images/display/e9f644185978884a335f84c7b38ff648.jpg",
    
];

export default function ImageStack() {
    return (
        <div className="flex flex-row items-center w-7xl">
            {displayImages.map((src, index) => (
                <div
                    key={index}
                    className={`
                      relative flex-1 basis-0 min-w-0 h-72
                      transition-all duration-500 ease-out
                      hover:flex-4 group
                    `}
                >
                    <Image
                        src={src}
                        alt={`展示图片 ${index + 1}`}
                        fill
                        className="object-cover object-center"
                        // sizes="(max-width: 768px) 100vw, 33vw"
                    />
                </div>
            ))}
        </div>
    );
}
