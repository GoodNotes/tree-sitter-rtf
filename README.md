# tree-sitter-rtf

RTF parser built using [Tree-Sitter](https://tree-sitter.github.io/tree-sitter/). Tree-Sitter is parser generator tool. It uses a language grammar definition
and generates the required C code that provides a parser for that grammar.

## Useful scripts

This project uses ``yarn`` and declares some scripts you can use for development purposes:

* ``yarn generate``: Will update and generate again our parser implementation based on the grammar definition.
* ``yarn test``: Will run all the tests you can find inside ``corpus`` folder.
* ``yarn test:debug``: Will run all the tests with debug mode enabled

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
yarn test:debug # In case you need more info when you get a test failing
```

When running the above command, Tree-Sitter will grab all the text files in the `corpus` folder, feed the parser with every input sequence and then compare the result against the expected value.

As an example we can use this test:

The first block until the ``------`` separator contains the test name between ``===`` separator and the row RTF content divided in the RTF header and body.

After the ``------`` separator you will find a representation fo the parsed document.

```
=============================
Minimal RTF document
=============================
{\rtf1\ansi\ansicpg1252\cocoartf2568
\cocoatextscaling1\cocoaplatform1{\fonttbl\f0\fnil\fcharset0 Futura-Bold;}
{\colortbl;\red255\green255\blue255;\red125\green194\blue91;}

\f0\fs24 \cf0 Pedro}
----------------------------
(document
  (fonttbl
    (fontname))
  (colortbl
    (colorvalue
      (static_number_literal)
      (static_number_literal)
      (static_number_literal))
    (colorvalue
      (static_number_literal)
      (static_number_literal)
      (static_number_literal)))
  (text_unit
    (text_unit_config)
    (text_unit_config)
    (text_unit_content)))
```

## Specs

When developing the RTF parser you may need to use some specificactions as a reference. The most interesting ones can be found here:

* [1.9.1 spec.](./specs/rtf-specs-1.9.1.pdf)
* [1.6 spec.](http://latex2rtf.sourceforge.net/rtfspec.html). 
* [RTF Algorithm extesion spec.](https://docs.microsoft.com/en-us/openspecs/exchange_server_protocols/ms-oxrtfex/411d0d58-49f7-496c-b8c3-5859b045f6cf) you can find algorithm's extension specs as well.  

## Utils

When working on the parser you may need to create some raw RTF content. To do this you can use your Mac ``TextEdit`` app. Open the app and create a document. Modify inside the content as you wish and then save it. You can use ``example.rtf`` as name for simplicity. Once you've saved the document, open it using other editor like ``Visual Studio Code``. Inside you'll be able to read the raw RTF representation for the content you created before. Something like this:

```
{\rtf1\ansi\ansicpg1252\cocoartf2636
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 Hello RTF world!}
```

If you modify the content using different formating options and visualize the changes from ``Visual Studio Code`` you'll notice how the raw RTF content changes to represent the format. You can use this in order to create new tests or validate your implementation for different style configurations.