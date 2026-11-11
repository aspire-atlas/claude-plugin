# Sample flow

Follows **Artifact standard**. Say how fresh the data is per page-standard's **Data freshness**
rule. Answer O4 for leadership the same way.

Embed every thumbnail as a data URI (`data:image/jpeg;base64,...`) on the published page.
In chat, no image data: never a data URI in a reply, a tool call, or an agent's summary.

```html
<p>Gift framing drives saves. <q>Our API is the best</q>, in the creator's caption.</p>
```

1. Show the creator's own words as they wrote them:

   ```html
   <blockquote>
     Our JSON of favourite toys,
     straight from the API drop
   </blockquote>
   <p>Caption: <span data-quoted>my webhook of joy</span>. Atlas compared 12 posts.</p>
   ```
