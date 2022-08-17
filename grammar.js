

const ESCAPE_SET = 'abtnvfrE!"#\\$&\'\\(\\)\\*,;<>\\?\\[\\\\\\]^`{\\|}~';

module.exports = grammar({
  name: "rtf",
  extras: $ => ['\n'], // They are the ignored characters
  rules: {
    document: $ => seq(
      '{',
      $._document_header,
      optional($._document_area),
      '}'
    ),

    _document_header: $ => seq(
      '\\rtf1',
      optional('\\fbidis'),
      $._header_character_set,
      optional($._from),
      optional(/\\cocoatextscaling\d+/),
      optional(/\\cocoaplatform\d+/),
      optional($.fonttbl),
      optional($._filetbl),
      optional($.colortbl),
      optional($._expcolortbl),
    ),

    _header_character_set: $ => seq(
      choice('\\ansi', '\\mac', '\\pc', '\\pca', '\\ansicpg', '\\cpg', '\\cpgid'),
      /\\ansicpg\d+/,
      optional(/\\cocoartf\d+/),
    ),

    _from: $ => choice('\\fromtext', '\\fromhtml'),

    // FONT TABLE
    fonttbl: $ => seq(
      '{\\fonttbl',
      repeat(choice($.fontinfo, $._fontinfo_alt)),
      '}',
    ),

    fontinfo: $ => seq(
      optional($._themefont),
      /\\f\d+/,
      $._fontfamily,
      optional(seq(
        '\\fcharset',
        field('charset', $.charset)
      )),
      optional(/\\fprq\d+/),
      optional($._panose),
      optional($._nontaggedname),
      optional($._fontemb),
      optional(/\\cpg\d+/),
      ' ',
      $._fontDefinition,
      optional($._fontaltname),
      ';',
    ),

    _fontinfo_alt: $ => seq(
      '{',
      $.fontinfo,
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

    _fontDefinition: $ => seq( 
      field('fontname', $.fontname),
      optional(seq(
        '-', 
        optional('Regular'),
        optional($.fontWeight),
        optional($.fontStyle)
      ))
    ),
    
    fontWeight: () => choice(
      'Bold',
    ),
    fontStyle: () => choice(
      'Italic',
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
      '{\\colortbl',
      repeat1($._colordef),
      '}',
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
      repeat(choice(
        seq(
          choice('\\cssrgb', '\\cspthree', '\\csgenericrgb'),
          /\\c\d+/,
          /\\c\d+/,
          /\\c\d+/,
          ';',
        ),
        seq(
          '\\csgray',
          /\\c\d+/,
          /\\c\d+/,
          ';',
        ),
      )),
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
      repeat1($._repeatDocument_area),
    ),

    _repeatDocument_area: $ => seq(
      optional($._paperTbl),
      optional($._formatingProperties),
      optional($.parTbl),
      $.textUnit,
    ),

    parTbl: $ => seq(
      repeat1($._par_config),
    ),

    _formatingProperties: $ => repeat1(
      /\\deftab\d+/,
    ),

    _paperTbl: $ => seq(
      repeat1($._paper_config),
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
      /\\pardeftab\d+/,
      /\\ri\d+/,
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

    textUnit: $ => seq(
      repeat1(seq(
        repeat1($._textUnit_config), 
        ' ',
      )),
      repeat1(choice($._textUnitEmoji, $._textSpecialChar, $.textUnitContent,)),
      optional('\n')
    ),

    _textUnit_config: $ => choice(
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
      // Uninterpreted configs
      /\\cb\d+/,
      /\\expnd\d+/,
      /\\expndtw\d+/,
      /\\kerning\d+/,
      /\\outl\d+/,
      /\\strokewidth\d+/,
      /\\strokec\d+/,
    ),

    textUnitContent: $ => prec(2, repeat1($._commonTextUnitContent)),

    _commonTextUnitContent: () => choice(
      /[\w| |!|\.|:|\-|\t|\?|\*|^|@]+/,
      '\\\n',
      new RegExp ('\\\\['+ESCAPE_SET+']'),
      // Chars that sholud be escaped but are not in RTF
      '\\'
    ),

    _textUnitEmoji: $ => prec(2, seq(
      repeat1(
        $._unicodeBlock,
      ),
    )),

    _unicodeBlock: $ => seq(
      optional(/\\uc\d+/),
      '\\u',
      field('unicode', $.unicode),
      ' ',
    ),

    _textSpecialChar: $ => prec(2, seq(
      repeat1(
        $._specialCharBlock,
      ),
    )),

    _specialCharBlock: $ => seq(
      '\\\'',
      field('specialChar', $.specialChar),
    ),
    
    charset: () => /\d+/,
    unicode: () => /\d+/,
    specialChar: () => /[0-9a-fA-F]+/,
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

 