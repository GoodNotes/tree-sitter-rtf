module.exports = grammar({
  name: "rtf",
  rules: {
    document: $ => alias($.group, 'document'),

    group: $ => seq('{', $._document_format, '}'),

    // Visible static literal
    static_number_literal: $ => /\d+/,
    
    // Hidden static literal
    _static_PCDATA: $ => /[^\\\\}\\{;]+/,

    _document_format: $ => seq(
      $._document_header,
      $._document_area,
    ),

    _document_header: $ => seq(
      '\\rtf1',
      optional('\\fbidis'),
      $._header_character_set,
      optional($._from),

      // Some specific headers for MACOS
      optional(/\\cocoartf\d+/),
      optional(/\\cocoatextscaling\d+/),
      optional(/\\cocoaplatform\d+/),


      // Start deffont
      optional(/\\deff\d+/),
      optional(/\\adeff\d+/),
      optional(seq(/\\stshfdbch\d+/, /\\stshfloch\d+/, /\\stshfhich\d+/, /\\stshfbi\d+/)),
      // End deffont

      // Start deflang
      optional(/\\deflang\d+/),
      optional(/\\deflangfe\d+/),
      optional(/\\adeflang\d+/),
      // End deflang

      optional($.fonttbl),
      optional($._filetbl),
      optional($.colortbl),
      optional($._expcolortbl),
    ),

    _header_character_set: $ => seq(
      choice('\\ansi', '\\mac', '\\pc', '\\pca', '\\ansicpg', '\\cpg', '\\cpgid'),
      /\\ansicpg\d+/,
    ),

    _from: $ => choice('\\fromtext', '\\fromhtml'),

    // FONT TABLE
    fonttbl: $ => seq(
      '{',
      '\\fonttbl',
      repeat1(choice($._fontinfo, $._fontinfo_alt)),
      '}',
    ),

    _fontinfo: $ => seq(
      optional($._themefont),
      /\\f\d+/,
      $._fontfamily,
      optional(/\\fcharset\d+/),
      optional(/\\fprq\d+/),
      optional($._panose),
      optional($._nontaggedname),
      optional($._fontemb),
      optional(/\\cpg\d+/),
      $.fontname,
      optional($._fontaltname),
      ';',
    ),

    _fontinfo_alt: $ => seq(
      '{',
      $._fontinfo,
      '}',
    ),

    _themefont: $ => choice('\\flomajor', '\\fhimajor', '\\fdbmajor', '\\fbimajor', '\\flominor', '\\fhiminor', '\\fbdminor', '\\fbiminor'),

    _fontfamily: $ => choice('\\fnil', '\\froman', '\\fswiss', '\\fmodern', '\\fscript', '\\fdecor', '\\ftech', '\\fbidi'),

    _panose: $ => seq(
      '{\\\*',
      '\\panose',
      $._data,
      '}',
    ),

    _nontaggedname: $ => seq(
      '{\\\*',
      '\\fname',
      $._static_PCDATA,
      ';}',
    ),

    fontname: $ => seq($._static_PCDATA),

    _fontaltname: $ => seq(
      '{\\\*',
      '\\falt',
      $._static_PCDATA,
      '}',
    ),

    _fontemb: $ => seq(
      '{\\\*',
      '\\fontemb',
      $._fonttype,
      optional($._fontfname),
      optional($._data),
      '}',
    ),

    _fonttype: $ => choice('\\ftnil', '\\fttruetype'),

    _fontfname: $ => seq(
      '{\\\*',
      '\\fontfile',
      /\\cpg\d+/,
      $._static_PCDATA,
      '}',
    ),

    // FILE TABLE
    _filetbl: $ => seq(
      '{\\\*',
      '\\filetbl',
      repeat1(seq('{', $._fileinfo, '}')),
      '}',
    ),

    _fileinfo: $ => seq(
      '\\file',
      /\\fid\d+/,
      optional(/\\frelative\d+/),
      optional(/\\fosnum\d+/),
      repeat1($._filesource),
      optional($._filename),
    ),

    _filesource: $ => choice('\\fvalidmac', '\\fvaliddos', '\\fvalidntfs', '\\fvalidhpfs', '\\fnetwork', '\\fnonfilesys'),

    _filename: $ => $._static_PCDATA,


    // COLOR TABLE
    colortbl: $ => seq(
      '{',
      '\\colortbl',
      repeat1($._colordef),
      '}',
    ),

    _colordef: $ => seq(
      optional(seq($._themecolor, /ctint\d+/, /cshade\d+/)),
      optional($.colorvalue),
      ';',
    ),

    colorvalue: $ => seq(
      '\\red', field('red', $.static_number_literal),
      '\\green', field('green', $.static_number_literal),
      '\\blue', field('blue', $.static_number_literal),
    ),

    _themecolor: $ => choice(
      '\\cmaindarkone', '\\cmainlightone', '\\cmaindarktwo', '\\cmainlighttwo',
      '\\caccentone', '\\caccenttwo', '\\caccentthree', '\\caccentfour', '\\caccentfive', 
      '\\caccentsix', '\\chyperlink', '\\cfollowedhyperlink', '\\cbackgroundone', 
      '\\ctextone', '\\cbackgroundtwo', '\\ctexttwo'),


    // EXPANDED COLOR TABLE
    _expcolortbl: $ => seq(
      '{\\\*',
      '\\expandedcolortbl',
      ';;',
      optional('\\cssrgb'),
      optional(/\\c\d+/),
      optional(/\\c\d+/),
      optional(/\\c\d+/),
      optional(';'),
      '}',
    ),

    _data: $ => choice(
      $._static_PCDATA,
      // $._uN, // => NOT NEEDED FOR NOW
      $._spec,
      // $._pict, // => NOT NEEDED FOR NOW
      // $._obj, // => NOT NEEDED FOR NOW
      // $._do, // => NOT NEEDED FOR NOW
      // $._footnote, // => NOT NEEDED FOR NOW
      // $._annot, // => NOT NEEDED FOR NOW
      // $._field, // => NOT NEEDED FOR NOW
      // $._idx, // => NOT NEEDED FOR NOW
      // $._toc, // => NOT NEEDED FOR NOW
      $._bookmark
    ),

    _spec: $ => choice(
      '\\chdate',
      '\\chdpl',
      '\\chdpa',
      '\\chtime',
      '\\chpgn',
      '\\sectnum',
      '\\chftn',
      '\\chatn',
      '\\chftnsep',
      '\\chftnsepc',
      '\\cell',
      '\\nestcell',
      '\\row',
      '\\nestrow',
      '\\par',
      // '\\sect',
      '\\page',
      '\\column',
      '\\line',
      /\\lbr\d+/,
      '\\softpage',
      '\\softcol',
      '\\softline',
      /\\softlheight\d+/,
      '\\tab',
      '\\emdash',
      '\\endash',
      '\\emspace',
      '\\enspace',
      '\\qmspace',
      '\\bullet',
      '\\lquote',
      '\\rquote',
      '\\ldblquote',
      '\\rdblquote',
      '\\|',
      '\\~',
      '\\-',
      '\\_',
      '\\:',
      '\\*',
      '\\\'hh',
      '\\ltrmark',
      '\\rtlmark',
      '\\zwbo',
      '\\zwnbo',
      '\\zwj',
      '\\zwnj',
    ),
      
    // BOOKMARKS
    _bookmark: $ => choice($._bookstart, $._bookend),
    
    _bookstart: $ => seq(
      '{\\\*',
      '\\bkmkstart',
      optional(seq(/\\bkmkcolf\d+/, /\\bkmkcoll\d+/)),
      $._static_PCDATA,
      '}',
    ),
    
    _bookend: $ => seq(
      '{\\\*',
      '\\bkmkend',
      $._static_PCDATA,
      '}',
    ),

    // DOCUMENT AREA => FROM HERE EVERYTHING IS CUSTOM
    _document_area: $ => seq(
      // optional($._info), // => NOT NEEDED FOR NOW
      // optional($._xmlnstbl), // => NOT NEEDED FOR NOW
      // repeat($.docfmt), // => NOT NEEDED FOR NOW
      repeat($._paper_config),
      repeat($._par_config),
      repeat1($.text_unit)
    ),

    _paper_config: $ => choice(
      /\\paperw\d+/,
      /\\paperh\d+/,
      /\\margl\d+/,
      /\\margr\d+/,
      /\\vieww\d+/,
      /\\viewh\d+/,
      /\\viewkind\d+/,
    ),

    _par_config: $ => choice(
      '\\pard',
      /\\tx\d+/,
      '\\pardirnatural',
      /\\partightenfactor\d+/,
      /\\sl\-\d+/,
    ),

    text_unit: $ => seq(
      repeat1($.text_unit_config),
      $.text_unit_content,
    ),

    text_unit_content: $ => $._static_PCDATA,

    text_unit_config: $ => seq(
      repeat1($._text_unit_option),
      /\s/,
    ),

    _text_unit_option: $ => choice(
      /\\f\d+/,
      /\\fs\d+/,
      /\\cf\d+/,
      '\\b',
      /\\dn\d+/,
    )


  },
});

 