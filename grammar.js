

const ESCAPE_SET = 'abtnvfrE!"#\\$&\'\\(\\)\\*,;<>\\?\\[\\\\\\]^`{\\|}~';

module.exports = grammar({
  name: "rtf",
  rules: {
    document: $ => alias($.group, 'document'),

    group: $ => repeat1(
      choice(
        $._document_metadata,
        $.textUnit,
        $._end_of_document
    )),

    _document_metadata: $ => choice(
      $._header_character_set,
      $._cocoa_custom_header,
      $.colortbl,
      $._expcolortbl,
      $._paper_tbl,
      $.parTbl
    ),
    
    _paper_tbl: $ => seq(
      repeat1($._paper_config),
      /\n/
    ),

    parTbl: $ => seq(
      repeat1($._par_config),
      /\n/
    ),

    _end_of_document: $ => '}',

    _header_character_set: $ => seq(
      '{\\rtf1',
      choice('\\ansi', '\\mac', '\\pc', '\\pca', '\\ansicpg', '\\cpg', '\\cpgid'),
      /\\ansicpg\d+/,
      optional(/\\cocoartf\d+/)
    ),

    _cocoa_custom_header: $ => seq(
      optional(/\\cocoatextscaling\d+/),
      optional(/\\cocoaplatform\d+/),
      $.fonttbl
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
      $.fontDefinition,
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

    fontDefinition: $ => seq(
      /\s/, 
      field('fontname', $.fontname),
      optional(seq(
        '-', 
        field('fonttypeface', $.fonttypeface),
      ))
    ),

    fontname: $ => /[\w\s]+/,
    fonttypeface: $ => $._static_PCDATA,

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
      '}\n',
    ),

    _colordef: $ => seq(
      optional(seq($._themecolor, /ctint\d+/, /cshade\d+/)),
      optional($.colorvalue),
      ';',
    ),

    colorvalue: $ => seq(
      '\\red', field('red', $.staticNumberLiteral),
      '\\green', field('green', $.staticNumberLiteral),
      '\\blue', field('blue', $.staticNumberLiteral),
    ),

    _themecolor: $ => choice(
      '\\cmaindarkone', '\\cmainlightone', '\\cmaindarktwo', '\\cmainlighttwo',
      '\\caccentone', '\\caccenttwo', '\\caccentthree', '\\caccentfour', '\\caccentfive', 
      '\\caccentsix', '\\chyperlink', '\\cfollowedhyperlink', '\\cbackgroundone', 
      '\\ctextone', '\\cbackgroundtwo', '\\ctexttwo'),

    // Expanded color table
    _expcolortbl: $ => seq(
      '{\\\*',
      '\\expandedcolortbl',
      ';;',
      repeat(seq(
        choice('\\cssrgb', '\\cspthree'),
        /\\c\d+/,
        /\\c\d+/,
        /\\c\d+/,
        ';',
      )),
      '}\n',
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
      /\n/,
      repeat($._paper_config),
      repeat($._par_config),
      repeat($.textUnit)
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
      seq('\\sl', field('lineSpacing', $.lineSpacing)),
      seq('\\slleading', field('lineGap', $.lineGap)),
      $.alignmentConfig
    ),

    lineSpacing: $ => $._static_int_number_literal,
    lineGap: $ => $._static_int_number_literal,

    alignmentConfig: $ => choice(
      /\\ql/,
      /\\qc/,
      /\\qr/,
      /\\qj/,
    ),

    textUnit: $ => seq(repeat($._textUnit_config), $.textUnitContent),

    _textUnit_config: $ => seq(choice(
      seq('\\f', field('fontIndex', $.fontIndex)),
      seq('\\fs', field('fontSize', $.fontSize)),
      seq('\\cf', field('colorFontIndex', $.colorFontIndex)),
      $.boldEnabled,
      $.boldDisabled,
      $.italicEnabled,
      $.italicDisabled,
      $.underlineEnabled,
      $.underlineDisabled,
      $._underlineColorIndex,
      $.strikeEnabled,
      $._strikeColorIndex,
      seq('\\dn', field('positionDown', $.positionDown)),
      seq('\\up', field('positionUp', $.positionUp)),
      ), optional(/\s/)),

    textUnitContent: $ => prec.right(repeat1(
      choice(
        /\w/,
        new RegExp ('\\\\['+ESCAPE_SET+']'),
        // Chars that sholud be escaped but are not in RTF
        '!',
        '.',
        ":",
        '\\'
      )
    )),

    fontIndex: $ => $._static_int_number_literal,
    fontSize: $ => $._static_int_number_literal,
    colorFontIndex: $ => $._static_int_number_literal,
    boldEnabled: () => '\\b',
    boldDisabled: () => /\\b\d+/,
    italicEnabled: () => '\\i',
    italicDisabled: () => /\\i\d+/,
    underlineEnabled: () => '\\ul',
    underlineDisabled: () => /\\ul\d+/,
    _underlineColorIndex: () => /\\ulc\d+/,
    strikeEnabled: () => '\\strike',
    _strikeColorIndex: () => /\\strikec\d+/,

    positionDown: $ => $._static_int_number_literal,
    positionUp: $ => $._static_int_number_literal,

    // Visible static literal
    staticNumberLiteral: $ => /\d+/,
    
    // Hidden static literal
    _static_int_number_literal: $ => /-?\d+/,
    _static_PCDATA: $ => /[^\\\\}\\{;]+/,

  },
});

 