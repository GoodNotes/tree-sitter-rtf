# tree-sitter-rtf

RTF parser built using [Tree-Sitter](https://tree-sitter.github.io/tree-sitter/). Tree-Sitter is parser generator tool. It uses a language grammar definition
and generates the required C code that provides a parser for that grammar.

## Parsers generation

Using the information contained in the `grammar.js` file Tree-Sitter will generate among other files: `src/parser.c`, and `src/tree_sitter/parser.h`. These two last files
contain the whole language definition, exposed as the `tree_sitter_rtf` function. That language definition when used toghether with the [Tree-Sitter C API](https://tree-sitter.github.io/tree-sitter/using-parsers)
provides a complete RTF parser. 

You can generate a Tree-Sitter parser at any time by doing: 

```sh
yarn generate
```

Tree-Sitter grammar is defined as a JavaScript file with access to some build-it functions. If you want to know more on how it works, you can take a look at:

 - [Tree-Sitter documentation on creating parsers](https://tree-sitter.github.io/tree-sitter/creating-parsers)
 - [HTML grammar](https://github.com/tree-sitter/tree-sitter-html)


## Testing

The result after a Tree-Sitter parsing will be a [contrete syntax tree](https://en.wikipedia.org/wiki/Parse_tree) which can be represented as an [S-expression](https://en.wikipedia.org/wiki/S-expression).
Tree-Sitter tests are defined around that concept. They are just plain text files, in the `corpus` folder, that contain a sequence of input texts and resulting tree S-expression. 
You can run Tree-Sitter tests by doing:

```sh
yarn test
```

When running the above command, Tree-Sitter will grab all the text files in the `corpus` folder, feed the parser with every input sequence and then compare the result against the expected value.
