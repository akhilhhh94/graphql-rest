## Graphql Appolo 4 with 100% cache for different REST data sources example.



For testing:

http://localhost:4000/
```

query GetBooks {
  books {
    title
    author
  }
  data {
    id
    title
  }
}

```
