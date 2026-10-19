import lib1 from "@/assets/lib-1.jpg";
import lib2 from "@/assets/lib-2.jpg";
import lib3 from "@/assets/lib-3.jpg";
import lib4 from "@/assets/lib-4.jpg";

export type PromptItem = {
  id: string;
  title: string;
  image: string;
  prompt: string;
  negative?: string;
  style: string;
  tags: string[];
};

export const LIBRARY: PromptItem[] = [
  {
    id: "neon-alley",
    title: "Neon Alley Portrait",
    image: lib1,
    style: "Cinematic street",
    tags: ["portrait", "neon", "night", "film"],
    prompt:
      "cinematic portrait of a young woman glancing over her shoulder in a narrow Tokyo alley at night, wet asphalt reflecting magenta and teal neon signs, red paper lanterns, black leather jacket, rain-soaked hair, shot on 35mm, 50mm f/1.4, shallow depth of field, bokeh, moody color grading, Kodak Portra 800 film grain, ultra detailed, 8k",
    negative: "blurry, extra fingers, distorted face, low contrast, watermark",
  },
  {
    id: "amber-perfume",
    title: "Amber Perfume Still",
    image: lib2,
    style: "Luxury product",
    tags: ["product", "minimal", "sunlight", "editorial"],
    prompt:
      "minimal luxury product photography of an amber glass perfume bottle with black cap resting on a raw travertine stone cube, warm beige backdrop, soft golden morning sunlight casting long palm leaf shadows, editorial still life, high-end advertising, medium format camera, crisp focus, neutral earthy palette",
    negative: "clutter, harsh flash, reflections, text artifacts",
  },
  {
    id: "floating-island",
    title: "Floating Island Dream",
    image: lib3,
    style: "Fantasy matte painting",
    tags: ["fantasy", "landscape", "clouds", "golden hour"],
    prompt:
      "surreal floating rock island with a tiny white cottage and lush trees, waterfall pouring off the edge into a sea of pastel pink clouds, distant mountain peaks, setting sun at golden hour, dreamy atmosphere, matte painting, soft volumetric light, highly detailed, fantasy concept art",
    negative: "dark, gloomy, low detail, oversaturated",
  },
  {
    id: "fox-astronaut",
    title: "Clay Fox Astronaut",
    image: lib4,
    style: "3D clay render",
    tags: ["3d", "cute", "character", "space"],
    prompt:
      "adorable 3D clay render of a fox astronaut sitting on the cratered moon surface, glass bubble helmet, cream and orange spacesuit, small retro rocket and planet flag behind, earth in a lavender sky, soft studio lighting, pastel orange and lavender palette, Pixar style, claymation texture, octane render",
    negative: "realistic fur, scary, dark lighting, deformed",
  },
];
