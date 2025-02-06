import { defineType } from "sanity";

export default defineType({
  name: "videoEmbed",
  title: "YouTube Embed",
  type: "object",
  fields: [
    {
      name: "url",
      title: "YouTube URL",
      type: "url"
    }
  ]
});