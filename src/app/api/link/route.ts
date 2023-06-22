import axios from "axios";

export async function GET(req: Request) {
    const url = new URL(req.url);

    const href = url.searchParams.get("url");

    if (!href) {
        return new Response("Invalid href", { status: 400 });
    }

    const { data } = await axios.get(href);

    const titleMatch = data.match(/<title>(.*?)<\/title>/);

    const title = titleMatch ? titleMatch[1] : "";

    const descriptionMatch = data.match(/<meta\s+name=['"]description['"]\s+content=['"](.*?)['"]/);

    const description = descriptionMatch ? descriptionMatch[1] : "";

    const imageMatch = data.match(/<meta\s+property=['"]og:image['"]\s+content=['"](.*?)['"]/);

    const imageUrl = imageMatch ? imageMatch[1] : "";

    return new Response(
        // this response is follow a way of response that editor.js expect to be able to work
        JSON.stringify({
            success: 1,
            meta: {
                title,
                description,
                image: {
                    url: imageUrl,
                }
            }
        })
    )
}